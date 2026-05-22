import { z } from "zod";
import { logger } from "@shared/utils/logger";

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  /** Utiliser les mocks en mémoire au lieu de Supabase (défaut: true si absent) */
  USE_MOCKS: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  /** Timeout HTTP client (fetch) en ms — défaut 15s, borné 1s–120s */
  NEXT_PUBLIC_API_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined || s.trim() === "") return 15_000;
      const n = Number.parseInt(s, 10);
      if (!Number.isFinite(n)) return 15_000;
      return Math.min(120_000, Math.max(1_000, n));
    }),
  /** Version affichée / traçabilité (optionnel) */
  NEXT_PUBLIC_APP_VERSION: z.string().optional().default("1.0.0"),
});

export type Env = z.infer<typeof rawEnvSchema>;

function parseEnv(): Env {
  const parsed = rawEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    USE_MOCKS: process.env.USE_MOCKS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_TIMEOUT_MS: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  });
  if (!parsed.success) {
    logger.warn("[config/env] variables invalides, valeurs par défaut appliquées", {
      validation: parsed.error.flatten(),
    });
    const fallbackTimeout = (() => {
      const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
      if (raw === undefined || raw.trim() === "") return 15_000;
      const n = Number.parseInt(raw, 10);
      if (!Number.isFinite(n)) return 15_000;
      return Math.min(120_000, Math.max(1_000, n));
    })();
    return {
      NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",
      USE_MOCKS: process.env.USE_MOCKS !== "false" && process.env.USE_MOCKS !== "0",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_API_TIMEOUT_MS: fallbackTimeout,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
    };
  }
  return parsed.data;
}

/** Variables d'environnement parsées (côté serveur et build ; côté client seules NEXT_PUBLIC_* sont définies). */
export const env = parseEnv();

/**
 * Lecture à l’appel (pas seulement le snapshot `env` au chargement du module) :
 * en dev / Turbopack, le premier import pouvait avoir lieu avant que les
 * `NEXT_PUBLIC_*` soient disponibles, ce qui forçait les mocks côté RSC.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

/** Timeout pour `fetch` côté client / routes (ms). */
export function getApiTimeoutMs(): number {
  return env.NEXT_PUBLIC_API_TIMEOUT_MS;
}
