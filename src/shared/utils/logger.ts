/**
 * Logger structuré — pas de secrets dans les logs ; erreurs typées.
 * Côté client : niveaux réduits en production pour limiter la fuite d’infos.
 */

type LogContext = Record<string, unknown> | undefined;

const isDev =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development";

const isBrowser = typeof window !== "undefined";

/** Clés dont les valeurs ne doivent jamais être loguées en clair */
const SENSITIVE_KEY_RE =
  /secret|password|token|authorization|cookie|apikey|api_key|anon_key|private/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_RE.test(key)) return "[REDACTED]";
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(isDev && { stack: value.stack }),
    };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = redactValue(k, v);
  }
  return out;
}

function format(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context?: LogContext
): void {
  const payload = context ? sanitizeObject(context as Record<string, unknown>) : undefined;
  const line = payload ? { level, message, ...payload, ts: new Date().toISOString() } : { level, message, ts: new Date().toISOString() };

  // Pas de dump brut user/password en prod
  if (level === "debug" && !isDev) return;

  const serialized = JSON.stringify(line);

  if (level === "error") {
    console.error(serialized);
    return;
  }
  if (level === "warn") {
    console.warn(serialized);
    return;
  }
  if (level === "debug") {
    console.debug(serialized);
    return;
  }
  console.log(serialized);
}

export const logger = {
  info(message: string, context?: LogContext): void {
    format("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    format("warn", message, context);
  },
  error(message: string, context?: LogContext): void {
    format("error", message, context);
  },
  debug(message: string, context?: LogContext): void {
    if (isBrowser && !isDev) return;
    format("debug", message, context);
  },
};
