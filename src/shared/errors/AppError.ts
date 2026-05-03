/**
 * Hiérarchie d'erreurs métier — messages utilisateur sûrs, codes stables pour le client.
 */

/* eslint-disable no-unused-vars -- membres référencés via ErrorCode.<membre> dans ce fichier */
export enum ErrorCode {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}
/* eslint-enable no-unused-vars */

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  /** true = erreur attendue (validation, 404); false = bug / panne */
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    isOperational = true
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class ValidationError extends AppError {
  readonly fields?: Record<string, string>;

  constructor(message = "Données invalides", fields?: Record<string, string>) {
    super(message, ErrorCode.VALIDATION_FAILED, 400);
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Non authentifié") {
    super(message, ErrorCode.UNAUTHENTICATED, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Accès refusé") {
    super(message, ErrorCode.UNAUTHORIZED, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} introuvable`, ErrorCode.NOT_FOUND, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT, 409);
  }
}

/** Erreur serveur : ne pas exposer le détail au client en production */
export class InternalServerError extends AppError {
  constructor(message = "Erreur interne") {
    super(message, ErrorCode.INTERNAL_ERROR, 500, false);
  }
}
