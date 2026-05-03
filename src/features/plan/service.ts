import type { PlanTier } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";

export interface PlanService {
  getCurrentPlan(): Promise<Result<PlanTier>>;
}

const planServiceMock: PlanService = {
  async getCurrentPlan() {
    return ok("Pro");
  },
};

const planServiceSupabase: PlanService = {
  async getCurrentPlan() {
    return err(new InternalServerError());
  },
};

export const planService = pickServiceImplementation(
  planServiceSupabase,
  planServiceMock,
);
