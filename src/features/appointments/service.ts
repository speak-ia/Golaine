import type { Appointment } from "@shared/types/domainTypes";
import {
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { appointmentFromRow } from "@shared/services/supabase/mappers";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import type { Database } from "@shared/services/supabase/types";
import { err, ok, type Result } from "@shared/types/Result";
import { logger } from "@shared/utils/logger";
import { MOCK_APPOINTMENTS } from "./data/mock-appointments";

type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export type AppointmentInput = Omit<Appointment, "id">;

export interface AppointmentsService {
  list(): Promise<Result<Appointment[]>>;
  create(_data: AppointmentInput): Promise<Result<Appointment>>;
  update(_id: number, _data: Partial<AppointmentInput>): Promise<Result<Appointment>>;
  remove(_id: number): Promise<Result<void>>;
}

let appointmentsState = [...MOCK_APPOINTMENTS];

const appointmentsServiceMock: AppointmentsService = {
  async list() {
    return ok([...appointmentsState]);
  },
  async create(data) {
    const next: Appointment = {
      id: Math.max(0, ...appointmentsState.map((a) => a.id)) + 1,
      ...data,
    };
    appointmentsState = [...appointmentsState, next].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return ok(next);
  },
  async update(id, data) {
    const idx = appointmentsState.findIndex((a) => a.id === id);
    if (idx === -1) return err(new NotFoundError("Rendez-vous"));
    const merged = { ...appointmentsState[idx], ...data };
    appointmentsState = appointmentsState.map((a) => (a.id === id ? merged : a));
    return ok(merged);
  },
  async remove(id) {
    const before = appointmentsState.length;
    appointmentsState = appointmentsState.filter((a) => a.id !== id);
    if (appointmentsState.length === before) return err(new NotFoundError("Rendez-vous"));
    return ok(undefined);
  },
};

async function requireUser() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

function rowFromInput(data: AppointmentInput, userId: string): AppointmentInsert {
  return {
    user_id: userId,
    title: data.title,
    client: data.client,
    appointment_date: data.date,
    appointment_time: data.time,
    duration_minutes: data.duration,
    type: data.type,
    status: data.status,
    notes: data.notes,
    location: data.location,
  };
}

const appointmentsServiceSupabase: AppointmentsService = {
  async list() {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (error) {
      logger.error("[appointments] list", { message: error.message });
      return err(new InternalServerError());
    }
    return ok((data ?? []).map(appointmentFromRow));
  },

  async create(data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data: row, error } = await supabase
      .from("appointments")
      .insert(rowFromInput(data, user.id))
      .select()
      .single();

    if (error || !row) {
      logger.error("[appointments] create", { message: error?.message });
      return err(new InternalServerError());
    }
    return ok(appointmentFromRow(row));
  },

  async update(id, data) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const patch: AppointmentUpdate = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.client !== undefined) patch.client = data.client;
    if (data.date !== undefined) patch.appointment_date = data.date;
    if (data.time !== undefined) patch.appointment_time = data.time;
    if (data.duration !== undefined) patch.duration_minutes = data.duration;
    if (data.type !== undefined) patch.type = data.type;
    if (data.status !== undefined) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.location !== undefined) patch.location = data.location;

    const { data: row, error } = await supabase
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("[appointments] update", { message: error.message });
      return err(new InternalServerError());
    }
    if (!row) return err(new NotFoundError("Rendez-vous"));
    return ok(appointmentFromRow(row));
  },

  async remove(id) {
    const { supabase, user } = await requireUser();
    if (!user) return err(new AuthenticationError());

    const { data: deleted, error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      logger.error("[appointments] remove", { message: error.message });
      return err(new InternalServerError());
    }
    if (!deleted?.length) return err(new NotFoundError("Rendez-vous"));
    return ok(undefined);
  },
};

export const appointmentsService = pickServiceImplementation(
  appointmentsServiceSupabase,
  appointmentsServiceMock,
);
