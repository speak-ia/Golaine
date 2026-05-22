import type { Order } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { orderFromRow } from "@shared/services/supabase/mappers";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import type { Database } from "@shared/services/supabase/types";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";
import { MOCK_INITIAL_ORDERS } from "./data/mock-orders";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export type OrderInput = {
  client: string;
  clientSub?: string;
  produit: string;
  adresse: string;
  montant: number;
  status: Order["status"];
  contactId?: number | null;
};

export interface OrdersService {
  list(): Promise<Result<Order[]>>;
  create(_data: OrderInput): Promise<Result<Order>>;
  update(_id: number, _data: Partial<OrderInput>): Promise<Result<Order>>;
  remove(_id: number): Promise<Result<void>>;
}

let ordersState = [...MOCK_INITIAL_ORDERS];

const ordersServiceMock: OrdersService = {
  async list() {
    return ok([...ordersState]);
  },
  async create(data) {
    const next: Order = {
      id: Math.max(0, ...ordersState.map((o) => o.id)) + 1,
      client: data.client,
      clientSub: data.clientSub ?? data.client,
      produit: data.produit,
      adresse: data.adresse,
      montant: data.montant,
      status: data.status,
      date: new Date().toLocaleDateString("fr-FR"),
    };
    ordersState = [next, ...ordersState];
    return ok(next);
  },
  async update(id, data) {
    const idx = ordersState.findIndex((o) => o.id === id);
    if (idx === -1) return err(new NotFoundError("Commande"));
    const merged = {
      ...ordersState[idx],
      ...data,
      clientSub: data.clientSub ?? data.client ?? ordersState[idx].clientSub,
    };
    ordersState = ordersState.map((o) => (o.id === id ? merged : o));
    return ok(merged);
  },
  async remove(id) {
    const before = ordersState.length;
    ordersState = ordersState.filter((o) => o.id !== id);
    if (ordersState.length === before) return err(new NotFoundError("Commande"));
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

const ordersServiceSupabase: OrdersService = {
  async list() {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[orders] list", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(orderFromRow));
  },

  async create(data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const row: OrderInsert = {
      user_id: user.id,
      client: data.client.trim(),
      client_sub: (data.clientSub ?? data.client).trim(),
      produit: data.produit.trim(),
      adresse: data.adresse.trim(),
      montant: data.montant,
      status: data.status,
      contact_id: data.contactId ?? null,
    };

    const { data: inserted, error } = await supabase
      .from("orders")
      .insert(row)
      .select()
      .single();

    if (error || !inserted) {
      logger.error("[orders] create", { message: error?.message });
      return err(new InternalServerError());
    }
    return ok(orderFromRow(inserted));
  },

  async update(id, data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const patch: OrderUpdate = {};
    if (data.client !== undefined) {
      patch.client = data.client.trim();
      patch.client_sub = (data.clientSub ?? data.client).trim();
    }
    if (data.clientSub !== undefined) patch.client_sub = data.clientSub.trim();
    if (data.produit !== undefined) patch.produit = data.produit.trim();
    if (data.adresse !== undefined) patch.adresse = data.adresse.trim();
    if (data.montant !== undefined) patch.montant = data.montant;
    if (data.status !== undefined) patch.status = data.status;
    if (data.contactId !== undefined) patch.contact_id = data.contactId;

    const { data: row, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("[orders] update", { message: error.message });
      return err(new InternalServerError());
    }
    if (!row) return err(new NotFoundError("Commande"));
    return ok(orderFromRow(row));
  },

  async remove(id) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data: deleted, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      logger.error("[orders] remove", { message: error.message });
      return err(new InternalServerError());
    }
    if (!deleted?.length) return err(new NotFoundError("Commande"));
    return ok(undefined);
  },
};

export const ordersService = pickServiceImplementation(
  ordersServiceSupabase,
  ordersServiceMock,
);
