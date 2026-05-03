import type { ZodError } from "zod";
import { ValidationError } from "@shared/errors/AppError";

/**
 * Convertit une ZodError en ValidationError avec champs pour le client.
 */
export function zodToValidationError(zodError: ZodError, message = "Validation échouée"): ValidationError {
  const fields: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const path = issue.path.length ? issue.path.join(".") : "_root";
    if (!fields[path]) fields[path] = issue.message;
  }
  return new ValidationError(message, fields);
}
