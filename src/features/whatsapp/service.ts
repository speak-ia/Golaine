import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import type { WhatsAppConnectionStatus } from "./types";

export interface WhatsAppConnectionService {
  getStatus(): Promise<Result<WhatsAppConnectionStatus>>;
}

const whatsAppConnectionServiceMock: WhatsAppConnectionService = {
  async getStatus() {
    return ok("disconnected");
  },
};

const whatsAppConnectionServiceSupabase: WhatsAppConnectionService = {
  async getStatus() {
    return err(new InternalServerError());
  },
};

export const whatsAppConnectionService = pickServiceImplementation(
  whatsAppConnectionServiceSupabase,
  whatsAppConnectionServiceMock,
);
