"use client";

import type { AppError } from "@shared/errors/AppError";
import type { Result } from "@shared/types/Result";
import { toast } from "sonner";
import { userFacingErrorMessage } from "@shared/utils/userFacingError";

/** Affiche une erreur métier via Sonner (message sûr pour l’utilisateur). */
export function toastAppError(error: AppError, title?: string): void {
  toast.error(title ?? "Erreur", {
    description: userFacingErrorMessage(error),
  });
}

/**
 * Si le Result est en échec, toast + retourne true (pour court-circuiter).
 * Sinon retourne false.
 */
export function toastIfFailed<E extends AppError>(
  result: Result<unknown, E>,
  title?: string,
): result is { success: false; error: E } {
  if (result.success) return false;
  toastAppError(result.error, title);
  return true;
}
