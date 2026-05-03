import {
  AppError,
  ErrorCode,
  InternalServerError,
} from "@shared/errors/AppError";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

/**
 * Message affichable dans l’UI — masque le détail des erreurs internes hors dev.
 */
export function userFacingErrorMessage(error: AppError): string {
  if (
    !isDev &&
    (error instanceof InternalServerError || error.code === ErrorCode.INTERNAL_ERROR)
  ) {
    return "Une erreur est survenue. Réessayez plus tard.";
  }
  return error.message;
}
