import { z } from "zod";
import { CONTACT_SEGMENTS } from "@shared/constants/status";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().optional(),
  city: z.string().optional(),
  segment: z.enum(CONTACT_SEGMENTS),
  notes: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
