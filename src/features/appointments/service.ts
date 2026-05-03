import type { Appointment } from "@shared/types/domainTypes";
import { InternalServerError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";

export interface AppointmentsService {
  list(): Promise<Result<Appointment[]>>;
}

const appointmentsServiceMock: AppointmentsService = {
  async list() {
    return ok([]);
  },
};

const appointmentsServiceSupabase: AppointmentsService = {
  async list() {
    return err(new InternalServerError());
  },
};

export const appointmentsService = pickServiceImplementation(
  appointmentsServiceSupabase,
  appointmentsServiceMock,
);
