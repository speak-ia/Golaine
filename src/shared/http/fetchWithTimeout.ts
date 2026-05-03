import { getApiTimeoutMs } from "@/config/env";

/**
 * `fetch` avec `AbortSignal` + timeout (utilise `NEXT_PUBLIC_API_TIMEOUT_MS`).
 * En production, privilégier ce wrapper pour les appels réseau non couverts par les SDK.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = getApiTimeoutMs(), ...rest } = init;
  /** Si l’appelant fournit déjà un signal, on ne double pas le timeout (contrat explicite). */
  if (rest.signal) {
    return fetch(input, rest);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
