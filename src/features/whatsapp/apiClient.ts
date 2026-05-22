import type { ApiErrorBody } from "@shared/http/routeErrors";
import { AppError, ErrorCode } from "@shared/errors/AppError";
import type {
  WhatsAppConnectResponse,
  WhatsAppSlotsResponse,
  WhatsAppSlotStatusResponse,
} from "./types";

async function parseApiError(res: Response): Promise<never> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }
  const message =
    body?.error?.message ?? `Erreur HTTP ${res.status}`;
  const code = body?.error?.code ?? ErrorCode.INTERNAL_ERROR;
  throw new AppError(message, code as ErrorCode, res.status);
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include", cache: "no-store" });
  if (!res.ok) await parseApiError(res);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) await parseApiError(res);
  return res.json() as Promise<T>;
}

export const whatsAppApi = {
  listSlots(): Promise<WhatsAppSlotsResponse> {
    return apiGet("/api/whatsapp/slots");
  },

  connect(
    slotIndex: number,
    payload: { displayName: string; phone: string },
  ): Promise<WhatsAppConnectResponse> {
    return apiPost(`/api/whatsapp/slots/${slotIndex}/connect`, payload);
  },

  refreshQr(slotIndex: number): Promise<WhatsAppConnectResponse> {
    return apiPost(`/api/whatsapp/slots/${slotIndex}/refresh`);
  },

  pollStatus(slotIndex: number): Promise<WhatsAppSlotStatusResponse> {
    return apiGet(`/api/whatsapp/slots/${slotIndex}/status`);
  },

  disconnect(slotIndex: number): Promise<void> {
    return apiPost(`/api/whatsapp/slots/${slotIndex}/disconnect`);
  },
};
