import { isSupabaseConfigured } from "@/config/env";

/**
 * Données réelles Supabase si l’URL + clé anon sont définies et qu’on ne force pas les mocks.
 * Côté client Next.js, seules les variables `NEXT_PUBLIC_*` sont fiables : utiliser
 * `NEXT_PUBLIC_USE_MOCKS=true` pour forcer les mocks avec Supabase configuré.
 */
export function shouldUseSupabaseData(): boolean {
  if (!isSupabaseConfigured()) return false;
  const raw = process.env.NEXT_PUBLIC_USE_MOCKS ?? process.env.USE_MOCKS;
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (v === "true" || v === "1") return false;
  return true;
}

export function pickServiceImplementation<T>(supabaseImpl: T, mockImpl: T): T {
  return shouldUseSupabaseData() ? supabaseImpl : mockImpl;
}
