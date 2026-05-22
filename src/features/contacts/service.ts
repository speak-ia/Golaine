import type { Contact, ContactFormData } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { contactFromRow } from "@shared/services/supabase/mappers";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import type { Database } from "@shared/services/supabase/types";
import { err, ok, type Result } from "@shared/types/Result";
import { getInitials } from "@shared/utils/text";
import { logger } from "@shared/utils/logger";
import { MOCK_INITIAL_CONTACTS } from "./data/mock-contacts";

type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

export interface ContactsService {
  list(): Promise<Result<Contact[]>>;
  create(_data: ContactFormData): Promise<Result<Contact>>;
  update(_id: number, _data: Partial<ContactFormData>): Promise<Result<Contact>>;
  remove(_id: number): Promise<Result<void>>;
}

let contactsState = [...MOCK_INITIAL_CONTACTS];

const contactsServiceMock: ContactsService = {
  async list() {
    return ok([...contactsState]);
  },
  async create(data: ContactFormData) {
    const next: Contact = {
      id: Math.max(0, ...contactsState.map((c) => c.id)) + 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      segment: data.segment,
      city: data.city,
      notes: data.notes,
      avatar: getInitials(data.name),
      color: "from-gray-400 to-gray-600",
      orders: 0,
      totalSpent: 0,
      lastOrder: "",
    };
    contactsState = [...contactsState, next];
    return ok(next);
  },
  async update(id: number, data: Partial<ContactFormData>) {
    const idx = contactsState.findIndex((c) => c.id === id);
    if (idx === -1) return err(new NotFoundError("Contact"));
    const prev = contactsState[idx];
    const merged = { ...prev, ...data } as Contact;
    contactsState = contactsState.map((c) => (c.id === id ? merged : c));
    return ok(merged);
  },
  async remove(id: number) {
    const before = contactsState.length;
    contactsState = contactsState.filter((c) => c.id !== id);
    if (contactsState.length === before) return err(new NotFoundError("Contact"));
    return ok(undefined);
  },
};

const contactsServiceSupabase: ContactsService = {
  async list() {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[contacts] list", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(contactFromRow));
  },

  async create(data: ContactFormData) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: row, error } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        segment: data.segment,
        city: data.city,
        notes: data.notes,
      })
      .select()
      .single();

    if (error || !row) {
      logger.error("[contacts] create", { message: error?.message });
      return err(new InternalServerError());
    }
    return ok(contactFromRow(row));
  },

  async update(id: number, data: Partial<ContactFormData>) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const patch: ContactUpdate = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.email !== undefined) patch.email = data.email;
    if (data.segment !== undefined) patch.segment = data.segment;
    if (data.city !== undefined) patch.city = data.city;
    if (data.notes !== undefined) patch.notes = data.notes;

    const { data: row, error } = await supabase
      .from("contacts")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("[contacts] update", { message: error.message });
      return err(new InternalServerError());
    }
    if (!row) return err(new NotFoundError("Contact"));
    return ok(contactFromRow(row));
  },

  async remove(id: number) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(new AuthenticationError());

    const { data: deleted, error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      logger.error("[contacts] remove", { message: error.message });
      return err(new InternalServerError());
    }
    if (!deleted?.length) return err(new NotFoundError("Contact"));
    return ok(undefined);
  },
};

export const contactsService = pickServiceImplementation(
  contactsServiceSupabase,
  contactsServiceMock,
);
