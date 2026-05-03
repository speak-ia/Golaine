import { ValidationError } from "@shared/errors/AppError";
import { zodToValidationError } from "@shared/validation/zodToValidationError";
import type { ZodType } from "zod";

/**
 * Parse et valide le corps JSON d’une Request Route Handler.
 * Lève ValidationError si JSON invalide ou schéma non respecté.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("Corps de requête JSON invalide ou vide");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw zodToValidationError(parsed.error);
  }
  return parsed.data;
}
