import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/config/env";
import { InternalServerError } from "@shared/errors/AppError";
import { logger } from "@shared/utils/logger";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

/** Client serveur (Server Components / actions) — uniquement si Supabase est configuré. */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new InternalServerError(
      isDev
        ? "Supabase non configuré : définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
        : "Configuration serveur incomplète",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error: unknown) {
            logger.debug(
              "Supabase cookie setAll ignoré (contexte lecture seule ou middleware)",
              {
                error:
                  error instanceof Error
                    ? { name: error.name, message: error.message }
                    : { message: String(error) },
              }
            );
          }
        },
      },
    }
  );
}
