/** Modèle par défaut — quota free tier actif (2.0-flash n’a plus de quota gratuit). */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const DEPRECATED_NO_FREE_TIER = new Set(["gemini-2.0-flash", "gemini-2.0-flash-lite"]);

export function resolveGeminiModel(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured || DEPRECATED_NO_FREE_TIER.has(configured)) {
    return DEFAULT_GEMINI_MODEL;
  }
  return configured;
}
