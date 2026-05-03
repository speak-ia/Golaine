import { z } from "zod";
import { APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from "@shared/constants/status";

export const appointmentFormSchema = z.object({
  title: z.string().min(1),
  client: z.string(),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.coerce.number().int().positive(),
  type: z.enum(APPOINTMENT_TYPES),
  status: z.enum(APPOINTMENT_STATUSES),
  notes: z.string(),
  location: z.string(),
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
