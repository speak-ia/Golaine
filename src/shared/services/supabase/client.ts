"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/config/env";
import { InternalServerError } from "@shared/errors/AppError";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

/** Client navigateur — appeler uniquement si `isSupabaseConfigured()`. */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new InternalServerError(
      isDev
        ? "Supabase non configuré : définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
        : "Configuration serveur incomplète",
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
