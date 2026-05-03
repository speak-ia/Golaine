import { NextResponse } from "next/server";
import { AppError, ErrorCode, ValidationError } from "@shared/errors/AppError";
import { logger } from "@shared/utils/logger";

const isDev =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development";

export type ApiErrorBody = {
  error: {
    code: ErrorCode | string;
    message: string;
    fields?: Record<string, string>;
  };
};

/**
 * Réponse JSON standard pour les Route Handlers Next.js.
 * Ne jamais renvoyer stack ou détails DB en production.
 */
export function jsonFromAppError(err: AppError): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    error: {
      code: err.code,
      message: err.message,
    },
  };
  if (err instanceof ValidationError && err.fields && Object.keys(err.fields).length > 0) {
    body.error.fields = err.fields;
  }
  return NextResponse.json(body, { status: err.statusCode });
}

export function jsonFromUnknownError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return jsonFromAppError(error);
  }

  const message =
    error instanceof Error ? error.message : "Erreur inconnue";
  logger.error("Erreur non gérée dans la route API", {
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: isDev ? error.stack : undefined }
        : { raw: String(error) },
  });

  const publicMessage = isDev ? message : "Une erreur est survenue";
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: publicMessage,
      },
    },
    { status: 500 }
  );
}

/**
 * Enveloppe un handler GET/POST pour centraliser les erreurs.
 */
export function withRouteHandler<T>(
  handler: () => Promise<T>,
  mapSuccess: (_data: T) => NextResponse
): Promise<NextResponse> {
  return handler()
    .then(mapSuccess)
    .catch((error: unknown) => jsonFromUnknownError(error));
}
