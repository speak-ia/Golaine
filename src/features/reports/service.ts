import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";

export interface ReportsService {
  getWeeklySummary(): Promise<Result<{ label: string; value: number }[]>>;
}

const reportsServiceMock: ReportsService = {
  async getWeeklySummary() {
    return ok([]);
  },
};

const reportsServiceSupabase: ReportsService = {
  async getWeeklySummary() {
    return err(new InternalServerError());
  },
};

export const reportsService = pickServiceImplementation(
  reportsServiceSupabase,
  reportsServiceMock,
);
