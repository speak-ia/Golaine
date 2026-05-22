import type { Conversation, Message } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import {
  messageFromRow,
  threadFromRow,
} from "@shared/services/supabase/mappers";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import { err, ok, type Result } from "@shared/types/Result";
import { formatChatListTime, formatChatMessageTime } from "@shared/utils/date";
import { getInitials } from "@shared/utils/text";
import { logger } from "@shared/utils/logger";
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "./data/mock-conversations";

export interface ConversationsService {
  list(): Promise<Result<Conversation[]>>;
  getMessages(_threadId: number): Promise<Result<Message[]>>;
  sendMessage(
    _threadId: number,
    _text: string,
    _sender?: "client" | "agent",
  ): Promise<Result<Message>>;
  markRead(_threadId: number): Promise<Result<void>>;
}

let conversationsState = [...MOCK_CONVERSATIONS];
let messagesState: Record<number, Message[]> = { ...MOCK_MESSAGES };
let nextMessageId = 100;

const conversationsServiceMock: ConversationsService = {
  async list() {
    return ok([...conversationsState]);
  },
  async getMessages(threadId) {
    return ok([...(messagesState[threadId] ?? [])]);
  },
  async sendMessage(threadId, text, sender = "client") {
    const now = new Date();
    const timeStr = formatChatMessageTime(now.toISOString());
    const msg: Message = {
      id: nextMessageId++,
      sender,
      text: text.trim(),
      time: timeStr,
    };
    messagesState = {
      ...messagesState,
      [threadId]: [...(messagesState[threadId] ?? []), msg],
    };
    conversationsState = conversationsState.map((c) =>
      c.id === threadId
        ? { ...c, lastMessage: msg.text, time: timeStr, unread: sender === "client" ? c.unread : 0 }
        : c,
    );
    return ok(msg);
  },
  async markRead(threadId) {
    conversationsState = conversationsState.map((c) =>
      c.id === threadId ? { ...c, unread: 0 } : c,
    );
    return ok(undefined);
  },
};

async function requireUser() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

async function assertThreadOwner(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  userId: string,
  threadId: number,
) {
  const { data, error } = await supabase
    .from("conversation_threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error("[conversations] assertThread", { message: error.message });
    throw new InternalServerError();
  }
  if (!data) throw new NotFoundError("Conversation");
}

const conversationsServiceSupabase: ConversationsService = {
  async list() {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("conversation_threads")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
      logger.error("[conversations] list", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(threadFromRow));
  },

  async getMessages(threadId) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    try {
      await assertThreadOwner(supabase, user.id, threadId);
    } catch (e) {
      if (e instanceof NotFoundError) return err(e);
      return err(new InternalServerError());
    }

    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true });

    if (error) {
      logger.error("[conversations] getMessages", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(messageFromRow));
  },

  async sendMessage(threadId, text, sender = "client") {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const trimmed = text.trim();
    if (!trimmed) return err(new InternalServerError());

    try {
      await assertThreadOwner(supabase, user.id, threadId);
    } catch (e) {
      if (e instanceof NotFoundError) return err(e);
      return err(new InternalServerError());
    }

    const sentAt = new Date().toISOString();

    const { data: row, error } = await supabase
      .from("conversation_messages")
      .insert({ thread_id: threadId, sender, body: trimmed, sent_at: sentAt })
      .select()
      .single();

    if (error || !row) {
      logger.error("[conversations] sendMessage", { message: error?.message });
      return err(new InternalServerError());
    }

    const { data: thread } = await supabase
      .from("conversation_threads")
      .select("unread_count")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .maybeSingle();

    const { error: threadErr } = await supabase
      .from("conversation_threads")
      .update({
        last_message: trimmed,
        last_message_at: sentAt,
        unread_count:
          sender === "client" ? (thread?.unread_count ?? 0) + 1 : 0,
      })
      .eq("id", threadId)
      .eq("user_id", user.id);

    if (threadErr) {
      logger.warn("[conversations] update thread after send", {
        message: threadErr.message,
      });
    }

    return ok(messageFromRow(row));
  },

  async markRead(threadId) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { error } = await supabase
      .from("conversation_threads")
      .update({ unread_count: 0 })
      .eq("id", threadId)
      .eq("user_id", user.id);

    if (error) {
      logger.error("[conversations] markRead", { message: error.message });
      return err(new InternalServerError());
    }
    return ok(undefined);
  },
};

export const conversationsService = pickServiceImplementation(
  conversationsServiceSupabase,
  conversationsServiceMock,
);

/** Utilitaire pour créer un fil à partir d’un contact (futur lien WhatsApp). */
export async function createThreadFromContact(
  name: string,
  phone: string,
): Promise<Result<Conversation>> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err(new AuthenticationError());

  const initials = getInitials(name);
  const { data, error } = await supabase
    .from("conversation_threads")
    .insert({
      user_id: user.id,
      contact_name: name,
      contact_phone: phone,
      avatar_initials: initials,
      last_message: "",
      status: "active",
    })
    .select()
    .single();

  if (error || !data) {
    logger.error("[conversations] createThread", { message: error?.message });
    return err(new InternalServerError());
  }
  return ok(threadFromRow(data));
}
