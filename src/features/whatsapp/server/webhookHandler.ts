import { createServiceRoleClient } from "@shared/services/supabase/admin";
import { getInitials } from "@shared/utils/text";
import { normalizePhoneDigits } from "@shared/services/whatsapp/instanceName";
import { logger } from "@shared/utils/logger";

const CONVERSATION_GRADIENTS = [
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
] as const;

function normalizeEventName(raw: unknown): string {
  return String(raw ?? "")
    .toLowerCase()
    .replace(/\./g, "_");
}

function extractInstanceName(body: Record<string, unknown>): string | null {
  const candidates = [
    body.instance,
    body.instanceName,
    (body.data as Record<string, unknown> | undefined)?.instance,
  ];
  for (const c of candidates) {
    const s = typeof c === "string" ? c.trim() : "";
    if (s) return s;
  }
  return null;
}

function jidToPhone(remoteJid: string): string | null {
  const jid = remoteJid.trim().toLowerCase();
  if (!jid || jid.includes("@g.us") || jid.includes("@broadcast")) return null;
  const userPart = jid.split("@")[0] ?? "";
  const digits = normalizePhoneDigits(userPart);
  if (digits.length < 8) return null;
  return `+${digits}`;
}

function extractMessageText(message: unknown): string | null {
  if (!message || typeof message !== "object") return null;
  const m = message as Record<string, unknown>;

  if (typeof m.conversation === "string" && m.conversation.trim()) {
    return m.conversation.trim();
  }

  const ext = m.extendedTextMessage as { text?: string } | undefined;
  if (typeof ext?.text === "string" && ext.text.trim()) return ext.text.trim();

  const btn = m.buttonsResponseMessage as { selectedDisplayText?: string } | undefined;
  if (typeof btn?.selectedDisplayText === "string" && btn.selectedDisplayText.trim()) {
    return btn.selectedDisplayText.trim();
  }

  const list = m.listResponseMessage as { title?: string } | undefined;
  if (typeof list?.title === "string" && list.title.trim()) return list.title.trim();

  if (m.imageMessage) return "[Image]";
  if (m.videoMessage) return "[Vidéo]";
  if (m.audioMessage) return "[Audio]";
  if (m.documentMessage) return "[Document]";
  if (m.stickerMessage) return "[Sticker]";
  if (m.locationMessage) return "[Localisation]";
  if (m.contactMessage) return "[Contact]";

  return null;
}

type IncomingMessage = {
  phone: string;
  contactName: string;
  text: string;
  fromMe: boolean;
  sentAt: string;
};

function parseMessagesUpsert(body: Record<string, unknown>): IncomingMessage[] {
  const data = body.data;
  const items: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? [data]
      : [];

  const out: IncomingMessage[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const key = row.key as Record<string, unknown> | undefined;
    const remoteJid = typeof key?.remoteJid === "string" ? key.remoteJid : "";
    const phone = jidToPhone(remoteJid);
    if (!phone) continue;

    const fromMe = Boolean(key?.fromMe);
    const message = row.message ?? (row as { message?: unknown }).message;
    const text = extractMessageText(message);
    if (!text) continue;

    const pushName =
      typeof row.pushName === "string" && row.pushName.trim()
        ? row.pushName.trim()
        : phone;

    const ts =
      typeof row.messageTimestamp === "number"
        ? new Date(row.messageTimestamp * 1000).toISOString()
        : new Date().toISOString();

    out.push({
      phone,
      contactName: pushName,
      text,
      fromMe,
      sentAt: ts,
    });
  }

  return out;
}

async function findOrCreateThread(
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  userId: string,
  phone: string,
  contactName: string,
) {
  const { data: existing } = await supabase
    .from("conversation_threads")
    .select("id, unread_count, contact_name")
    .eq("user_id", userId)
    .eq("contact_phone", phone)
    .maybeSingle();

  if (existing) {
    if (contactName && contactName !== phone && existing.contact_name !== contactName) {
      await supabase
        .from("conversation_threads")
        .update({ contact_name: contactName })
        .eq("id", existing.id);
    }
    return existing.id as number;
  }

  const initials = getInitials(contactName || phone);
  const gradient =
    CONVERSATION_GRADIENTS[
      Math.abs(phone.length + contactName.length) % CONVERSATION_GRADIENTS.length
    ];

  const { data: created, error } = await supabase
    .from("conversation_threads")
    .insert({
      user_id: userId,
      contact_name: contactName || phone,
      contact_phone: phone,
      avatar_initials: initials,
      gradient_key: gradient,
      status: "active",
      last_message: "",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "thread create failed");
  }

  return created.id as number;
}

async function persistMessage(
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  userId: string,
  msg: IncomingMessage,
) {
  const threadId = await findOrCreateThread(
    supabase,
    userId,
    msg.phone,
    msg.contactName,
  );

  const { error: insertErr } = await supabase.from("conversation_messages").insert({
    thread_id: threadId,
    sender: msg.fromMe ? "agent" : "client",
    body: msg.text,
    sent_at: msg.sentAt,
  });

  if (insertErr) {
    logger.warn("[whatsapp/webhook] insert message", { message: insertErr.message });
    return;
  }

  const { data: thread } = await supabase
    .from("conversation_threads")
    .select("unread_count")
    .eq("id", threadId)
    .single();

  await supabase
    .from("conversation_threads")
    .update({
      last_message: msg.text,
      last_message_at: msg.sentAt,
      unread_count: msg.fromMe ? 0 : (thread?.unread_count ?? 0) + 1,
      status: "active",
    })
    .eq("id", threadId);

  await supabase.from("activity_events").insert({
    user_id: userId,
    activity_type: "agent",
    body: msg.fromMe
      ? `Message envoyé à ${msg.contactName}`
      : `Message reçu de ${msg.contactName}`,
  });
}

async function handleConnectionUpdate(
  supabase: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  instanceName: string,
  body: Record<string, unknown>,
) {
  const { data: slot } = await supabase
    .from("whatsapp_slots")
    .select("user_id, slot_index")
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (!slot) return;

  const data = body.data as Record<string, unknown> | undefined;
  const stateRaw =
    String(data?.state ?? data?.status ?? body.state ?? "").toLowerCase();

  const connected = stateRaw === "open";
  const pending = stateRaw === "connecting";

  await supabase
    .from("whatsapp_slots")
    .update({
      connection_status: connected
        ? "connected"
        : pending
          ? "pending"
          : "empty",
      connected_at: connected ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("instance_name", instanceName);
}

export async function handleWhatsAppWebhook(
  body: unknown,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    logger.error("[whatsapp/webhook] SUPABASE_SERVICE_ROLE_KEY manquante");
    return { ok: false, reason: "service_role_not_configured" };
  }

  if (!body || typeof body !== "object") {
    return { ok: true, reason: "ignored_empty" };
  }

  const payload = body as Record<string, unknown>;
  const event = normalizeEventName(payload.event);
  const instanceName = extractInstanceName(payload);

  if (!instanceName) {
    return { ok: true, reason: "no_instance" };
  }

  const { data: slot } = await supabase
    .from("whatsapp_slots")
    .select("user_id")
    .eq("instance_name", instanceName)
    .maybeSingle();

  if (!slot?.user_id) {
    logger.warn("[whatsapp/webhook] instance inconnue", { instanceName });
    return { ok: true, reason: "unknown_instance" };
  }

  if (event.includes("connection")) {
    await handleConnectionUpdate(supabase, instanceName, payload);
    return { ok: true };
  }

  if (!event.includes("message")) {
    return { ok: true, reason: "event_ignored" };
  }

  const messages = parseMessagesUpsert(payload);
  for (const msg of messages) {
    try {
      await persistMessage(supabase, slot.user_id, msg);
    } catch (error: unknown) {
      logger.error("[whatsapp/webhook] persistMessage", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { ok: true, reason: `processed_${messages.length}` };
}
