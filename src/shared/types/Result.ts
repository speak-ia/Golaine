import type { AppError } from "@shared/errors/AppError";

/**
 * Result pattern — évite les try/catch répétés dans les appelants.
 * Pour envelopper du code async/sync avec journalisation, utiliser
 * `runAsync` / `runSync` depuis `@shared/utils/serviceResult`.
 */
export type Result<T, E extends AppError = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E extends AppError>(error: E): Result<never, E> {
  return { success: false, error };
}
