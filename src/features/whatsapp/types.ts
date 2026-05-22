import type { PlanTier } from "@shared/types/domainTypes";

export type WhatsAppConnectionStatus = "disconnected" | "pending" | "connected";

export type WhatsAppSlotStatus = "empty" | "pending" | "connected" | "locked";

export type WhatsAppSlotDto = {
  slotIndex: number;
  displayName: string;
  phone: string | null;
  status: WhatsAppSlotStatus;
  phoneMasked: string | null;
};

export type WhatsAppSlotsResponse = {
  planTier: PlanTier;
  maxSlots: number;
  connectedCount: number;
  gatewayConfigured: boolean;
  slots: WhatsAppSlotDto[];
};

export type WhatsAppConnectResponse = {
  qrBase64: string;
  expiresInSeconds: number;
};

export type WhatsAppSlotStatusResponse = {
  status: "empty" | "pending" | "connected";
  displayName: string;
  phone: string | null;
};
