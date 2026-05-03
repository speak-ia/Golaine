/**
 * Extrait un message sûr depuis une valeur catchée inconnue (Règle 2).
 */
export function getUnknownErrorMessage(
  error: unknown,
  fallback = "Erreur inconnue"
): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
