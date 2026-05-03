import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";

export interface SettingsService {
  getProfile(): Promise<Result<{ name: string; email: string }>>;
}

const settingsServiceMock: SettingsService = {
  async getProfile() {
    return ok({ name: "Utilisateur", email: "user@example.com" });
  },
};

const settingsServiceSupabase: SettingsService = {
  async getProfile() {
    return err(new InternalServerError());
  },
};

export const settingsService = pickServiceImplementation(
  settingsServiceSupabase,
  settingsServiceMock,
);
