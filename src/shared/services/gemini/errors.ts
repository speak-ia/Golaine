import { AppError, ErrorCode } from "@shared/errors/AppError";

export class GeminiQuotaError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.SERVICE_UNAVAILABLE, 429);
  }
}

export function toGeminiClientError(status: number, rawMessage: string): Error {
  const msg = rawMessage.trim() || `Gemini HTTP ${status}`;
  const lower = msg.toLowerCase();

  if (
    status === 429 ||
    lower.includes("quota exceeded") ||
    lower.includes("resource exhausted")
  ) {
    if (lower.includes("limit: 0") || lower.includes("free_tier")) {
      return new GeminiQuotaError(
        "Quota Gemini indisponible pour ce modèle (souvent gemini-2.0-flash). " +
          "Utilisez GEMINI_MODEL=gemini-2.5-flash dans .env.local, consultez https://ai.dev/rate-limit " +
          "ou activez la facturation dans Google AI Studio (quota gratuit après liaison).",
      );
    }
    const retryMatch = msg.match(/retry in ([\d.]+)s/i);
    const wait = retryMatch ? Math.ceil(Number.parseFloat(retryMatch[1])) : null;
    return new GeminiQuotaError(
      wait
        ? `Quota Gemini dépassé. Réessayez dans environ ${wait} secondes.`
        : "Quota Gemini dépassé. Réessayez dans quelques instants.",
    );
  }

  return new Error(msg);
}
