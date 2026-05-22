import type { Product } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { productFromRow } from "@shared/services/supabase/mappers";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import type { Database } from "@shared/services/supabase/types";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";
import { MOCK_PRODUCTS } from "./data/mock-products";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductInput = Omit<Product, "id">;

export interface ProductsService {
  list(): Promise<Result<Product[]>>;
  create(_data: ProductInput): Promise<Result<Product>>;
  update(_id: number, _data: Partial<ProductInput>): Promise<Result<Product>>;
  remove(_id: number): Promise<Result<void>>;
  renameCategory(_oldName: string, _newName: string): Promise<Result<void>>;
  deleteCategory(_name: string, _fallbackName: string): Promise<Result<void>>;
}

let productsState = [...MOCK_PRODUCTS];

const productsServiceMock: ProductsService = {
  async list() {
    return ok([...productsState]);
  },
  async create(data) {
    const next: Product = {
      id: Math.max(0, ...productsState.map((p) => p.id)) + 1,
      ...data,
    };
    productsState = [next, ...productsState];
    return ok(next);
  },
  async update(id, data) {
    const idx = productsState.findIndex((p) => p.id === id);
    if (idx === -1) return err(new NotFoundError("Produit"));
    const merged = { ...productsState[idx], ...data };
    productsState = productsState.map((p) => (p.id === id ? merged : p));
    return ok(merged);
  },
  async remove(id) {
    const before = productsState.length;
    productsState = productsState.filter((p) => p.id !== id);
    if (productsState.length === before) return err(new NotFoundError("Produit"));
    return ok(undefined);
  },
  async renameCategory(oldName, newName) {
    productsState = productsState.map((p) =>
      p.category === oldName ? { ...p, category: newName } : p,
    );
    return ok(undefined);
  },
  async deleteCategory(name, fallbackName) {
    productsState = productsState.map((p) =>
      p.category === name ? { ...p, category: fallbackName } : p,
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

const productsServiceSupabase: ProductsService = {
  async list() {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[products] list", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(productFromRow));
  },

  async create(data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const row: ProductInsert = {
      user_id: user.id,
      name: data.name,
      price: data.price,
      category: data.category,
      stock: data.stock,
      image: data.image ?? "",
      status: data.status,
      assigned_agent: data.assignedAgent,
    };

    const { data: inserted, error } = await supabase
      .from("products")
      .insert(row)
      .select()
      .single();

    if (error || !inserted) {
      logger.error("[products] create", { message: error?.message });
      return err(new InternalServerError());
    }
    return ok(productFromRow(inserted));
  },

  async update(id, data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const patch: ProductUpdate = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) patch.name = data.name;
    if (data.price !== undefined) patch.price = data.price;
    if (data.category !== undefined) patch.category = data.category;
    if (data.stock !== undefined) patch.stock = data.stock;
    if (data.image !== undefined) patch.image = data.image;
    if (data.status !== undefined) patch.status = data.status;
    if (data.assignedAgent !== undefined) patch.assigned_agent = data.assignedAgent;

    const { data: row, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("[products] update", { message: error.message });
      return err(new InternalServerError());
    }
    if (!row) return err(new NotFoundError("Produit"));
    return ok(productFromRow(row));
  },

  async remove(id) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data: deleted, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      logger.error("[products] remove", { message: error.message });
      return err(new InternalServerError());
    }
    if (!deleted?.length) return err(new NotFoundError("Produit"));
    return ok(undefined);
  },

  async renameCategory(oldName, newName) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { error } = await supabase
      .from("products")
      .update({ category: newName, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("category", oldName);

    if (error) {
      logger.error("[products] renameCategory", { message: error.message });
      return err(new InternalServerError());
    }
    return ok(undefined);
  },

  async deleteCategory(name, fallbackName) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { error } = await supabase
      .from("products")
      .update({ category: fallbackName, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("category", name);

    if (error) {
      logger.error("[products] deleteCategory", { message: error.message });
      return err(new InternalServerError());
    }
    return ok(undefined);
  },
};

export const productsService = pickServiceImplementation(
  productsServiceSupabase,
  productsServiceMock,
);
