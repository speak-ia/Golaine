import { AppError, InternalServerError } from "@shared/errors/AppError";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";

/**
 * Convertit une valeur catchée inconnue en AppError opérationnel,
 * journalise le détail côté serveur sans le renvoyer au client.
 */
export function mapUnknownToAppError(
  error: unknown,
  logContext = "Erreur non typée"
): AppError {
  if (error instanceof AppError) return error;
  logger.error(logContext, {
    error:
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { raw: String(error) },
  });
  return new InternalServerError();
}

/** Enveloppe une promesse : jamais de throw, toujours un Result. */
export async function runAsync<T>(
  fn: () => Promise<T>,
  logContext?: string
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error: unknown) {
    return err(mapUnknownToAppError(error, logContext));
  }
}

/** Enveloppe une fonction synchrone qui peut lever. */
export function runSync<T>(fn: () => T, logContext?: string): Result<T> {
  try {
    return ok(fn());
  } catch (error: unknown) {
    return err(mapUnknownToAppError(error, logContext));
  }
}
