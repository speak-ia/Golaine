import { InternalServerError } from "@shared/errors/AppError";
import { logger } from "@shared/utils/logger";

export function isWhatsAppGatewayConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_API_URL?.trim() && process.env.WHATSAPP_API_KEY?.trim(),
  );
}

type EvolutionQrPayload = {
  base64?: string;
  code?: string;
  pairingCode?: string;
  count?: number;
};

type EvolutionCreateResponse = EvolutionQrPayload & {
  qrcode?: EvolutionQrPayload;
};

type EvolutionConnectResponse = EvolutionQrPayload;

type EvolutionConnectionStateResponse = {
  instance?: {
    instanceName?: string;
    state?: string;
  };
  state?: string;
};

function baseUrl(): string {
  const raw = process.env.WHATSAPP_API_URL?.trim();
  if (!raw) throw new InternalServerError("WHATSAPP_API_URL non configurée");
  return raw.replace(/\/$/, "");
}

function apiKey(): string {
  const key = process.env.WHATSAPP_API_KEY?.trim();
  if (!key) throw new InternalServerError("WHATSAPP_API_KEY non configurée");
  return key;
}

async function evolutionRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { raw: text };
    }
  }

  if (!res.ok) {
    const message = formatEvolutionError(body, text, res.statusText);
    logger.warn("[whatsapp/evolution] requête échouée", {
      path,
      status: res.status,
      message,
    });
    throw new InternalServerError(
      `Passerelle WhatsApp : ${message || res.statusText}`,
    );
  }

  return body as T;
}

function formatEvolutionError(
  body: unknown,
  text: string,
  statusText: string,
): string {
  if (typeof body === "object" && body !== null) {
    const b = body as {
      response?: { message?: unknown };
      message?: unknown;
      error?: unknown;
    };
    if (Array.isArray(b.response?.message)) {
      return b.response.message.map(String).join(", ");
    }
    if (typeof b.response?.message === "string") return b.response.message;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
  }
  return text || statusText;
}

export function normalizeQrBase64(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("data:image")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

/** Extrait le QR depuis les réponses create/connect (formats v2.1–v2.3). */
function nestedQrcode(
  data: EvolutionCreateResponse | EvolutionConnectResponse,
): EvolutionQrPayload | undefined {
  return "qrcode" in data ? data.qrcode : undefined;
}

export function extractQrFromPayload(
  data: EvolutionCreateResponse | EvolutionConnectResponse | null | undefined,
): { qrBase64: string | null; pairingCode?: string } {
  if (!data || typeof data !== "object") {
    return { qrBase64: null };
  }

  const nested = nestedQrcode(data);
  const candidates = [
    data.base64,
    nested?.base64,
    typeof data.code === "string" && data.code.length > 200 ? data.code : undefined,
    typeof nested?.code === "string" && nested.code.length > 200
      ? nested.code
      : undefined,
  ];

  for (const raw of candidates) {
    const qrBase64 = normalizeQrBase64(raw);
    if (qrBase64) {
      return {
        qrBase64,
        pairingCode: data.pairingCode ?? nested?.pairingCode,
      };
    }
  }

  return {
    qrBase64: null,
    pairingCode: data.pairingCode ?? nested?.pairingCode,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Supprime l'instance si elle existe (évite les sessions bloquées en close). */
export async function deleteEvolutionInstanceIfExists(
  instanceName: string,
): Promise<void> {
  try {
    await evolutionRequest(
      `/instance/delete/${encodeURIComponent(instanceName)}`,
      { method: "DELETE" },
    );
  } catch {
    /* instance absente */
  }
}

/** Crée l'instance et démarre la session (sans numéro = mode QR classique). */
export async function setEvolutionWebhook(
  instanceName: string,
  webhookUrl: string,
): Promise<void> {
  if (!webhookUrl.trim()) return;

  const payload = {
    enabled: true,
    url: webhookUrl.trim(),
    webhookByEvents: false,
    webhookBase64: false,
    events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
  };

  try {
    await evolutionRequest(`/webhook/set/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    await evolutionRequest(`/webhook/set/${encodeURIComponent(instanceName)}`, {
      method: "POST",
      body: JSON.stringify({ webhook: payload }),
    });
  }
}

export async function ensureEvolutionInstance(
  instanceName: string,
  webhookUrl?: string | null,
): Promise<EvolutionCreateResponse | null> {
  await deleteEvolutionInstanceIfExists(instanceName);
  await sleep(400);

  const createBody: Record<string, unknown> = {
    instanceName,
    integration: "WHATSAPP-BAILEYS",
    qrcode: true,
  };

  if (webhookUrl?.trim()) {
    createBody.webhook = {
      url: webhookUrl.trim(),
      enabled: true,
      webhookByEvents: false,
      events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
    };
  }

  try {
    const created = await evolutionRequest<EvolutionCreateResponse>(
      "/instance/create",
      {
        method: "POST",
        body: JSON.stringify(createBody),
      },
    );

    if (webhookUrl?.trim()) {
      try {
        await setEvolutionWebhook(instanceName, webhookUrl);
      } catch (error: unknown) {
        logger.warn("[whatsapp/evolution] webhook set après create", {
          instanceName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return created;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("already in use") || msg.includes("403")) {
      return null;
    }
    throw error;
  }
}

const QR_POLL_ATTEMPTS = 18;
const QR_POLL_INTERVAL_MS = 1500;

export async function fetchEvolutionQr(
  instanceName: string,
  createResponse?: EvolutionCreateResponse | null,
): Promise<{ qrBase64: string; pairingCode?: string }> {
  const fromCreate = extractQrFromPayload(createResponse ?? undefined);
  if (fromCreate.qrBase64) {
    return { qrBase64: fromCreate.qrBase64, pairingCode: fromCreate.pairingCode };
  }

  let lastCount = 0;
  for (let attempt = 0; attempt < QR_POLL_ATTEMPTS; attempt++) {
    const data = await evolutionRequest<EvolutionConnectResponse>(
      `/instance/connect/${encodeURIComponent(instanceName)}`,
      { method: "GET" },
    );

    const extracted = extractQrFromPayload(data);
    if (extracted.qrBase64) {
      return {
        qrBase64: extracted.qrBase64,
        pairingCode: extracted.pairingCode,
      };
    }

    lastCount = data.count ?? 0;
    if (attempt < QR_POLL_ATTEMPTS - 1) {
      await sleep(QR_POLL_INTERVAL_MS);
    }
  }

  logger.warn("[whatsapp/evolution] QR absent après tentatives", {
    instanceName,
    lastCount,
    attempts: QR_POLL_ATTEMPTS,
  });

  throw new InternalServerError(
    "Le serveur WhatsApp n'a pas renvoyé de code QR. Vérifiez que Evolution API est à jour (v2.2+), redémarrez le conteneur, puis réessayez.",
  );
}

export type EvolutionConnectionState = "open" | "close" | "connecting" | "unknown";

export async function fetchEvolutionConnectionState(
  instanceName: string,
): Promise<EvolutionConnectionState> {
  const data = await evolutionRequest<EvolutionConnectionStateResponse>(
    `/instance/connectionState/${encodeURIComponent(instanceName)}`,
    { method: "GET" },
  );

  const raw =
    data.instance?.state?.toLowerCase() ?? data.state?.toLowerCase() ?? "";
  if (raw === "open") return "open";
  if (raw === "connecting") return "connecting";
  if (raw === "close" || raw === "closed") return "close";
  return "unknown";
}

export async function logoutEvolutionInstance(instanceName: string): Promise<void> {
  try {
    await evolutionRequest(
      `/instance/logout/${encodeURIComponent(instanceName)}`,
      { method: "DELETE" },
    );
  } catch (error: unknown) {
    logger.warn("[whatsapp/evolution] logout ignoré", {
      instanceName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  await deleteEvolutionInstanceIfExists(instanceName);
}
