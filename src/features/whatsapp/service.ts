import {
  AppError,
  InternalServerError,
  ServiceUnavailableError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import { whatsAppApi } from "./apiClient";
import type {
  WhatsAppConnectResponse,
  WhatsAppSlotsResponse,
  WhatsAppSlotStatusResponse,
} from "./types";

export interface WhatsAppSlotsService {
  listSlots(): Promise<Result<WhatsAppSlotsResponse>>;
  connect(
    slotIndex: number,
    displayName: string,
    phone: string,
  ): Promise<Result<WhatsAppConnectResponse>>;
  refreshQr(slotIndex: number): Promise<Result<WhatsAppConnectResponse>>;
  pollStatus(slotIndex: number): Promise<Result<WhatsAppSlotStatusResponse>>;
  disconnect(slotIndex: number): Promise<Result<void>>;
}

async function toResult<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error: unknown) {
    if (error instanceof AppError) return err(error);
    return err(new InternalServerError());
  }
}

const whatsAppSlotsServiceLive: WhatsAppSlotsService = {
  listSlots: () => toResult(() => whatsAppApi.listSlots()),
  connect: (slotIndex, displayName, phone) =>
    toResult(() => whatsAppApi.connect(slotIndex, { displayName, phone })),
  refreshQr: (slotIndex) => toResult(() => whatsAppApi.refreshQr(slotIndex)),
  pollStatus: (slotIndex) => toResult(() => whatsAppApi.pollStatus(slotIndex)),
  disconnect: (slotIndex) =>
    toResult(async () => {
      await whatsAppApi.disconnect(slotIndex);
    }),
};

const whatsAppSlotsServiceMock: WhatsAppSlotsService = {
  async listSlots() {
    return ok({
      planTier: "Pro",
      maxSlots: 2,
      connectedCount: 0,
      gatewayConfigured: false,
      slots: [
        {
          slotIndex: 1,
          displayName: "Numéro 1",
          phone: null,
          status: "empty",
          phoneMasked: null,
        },
        {
          slotIndex: 2,
          displayName: "Numéro 2",
          phone: null,
          status: "empty",
          phoneMasked: null,
        },
        {
          slotIndex: 3,
          displayName: "Numéro 3",
          phone: null,
          status: "locked",
          phoneMasked: null,
        },
      ],
    });
  },
  async connect() {
    return err(
      new ServiceUnavailableError(
        "Connexion WhatsApp réelle indisponible en mode démo. Configurez Supabase et Evolution API.",
      ),
    );
  },
  async refreshQr() {
    return err(
      new ServiceUnavailableError(
        "Connexion WhatsApp réelle indisponible en mode démo.",
      ),
    );
  },
  async pollStatus() {
    return ok({ status: "empty", displayName: "", phone: null });
  },
  async disconnect() {
    return ok(undefined);
  },
};

export const whatsAppSlotsService = pickServiceImplementation(
  whatsAppSlotsServiceLive,
  whatsAppSlotsServiceMock,
);
