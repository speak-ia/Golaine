import { env, isSupabaseConfigured } from "@/config/env";

/**
 * Retourne l’implémentation Supabase si les clés sont présentes et USE_MOCKS n’est pas forcé à faux ;
 * sinon les mocks en mémoire.
 */
export function pickServiceImplementation<T>(supabaseImpl: T, mockImpl: T): T {
  if (isSupabaseConfigured() && !env.USE_MOCKS) {
    return supabaseImpl;
  }
  return mockImpl;
}
