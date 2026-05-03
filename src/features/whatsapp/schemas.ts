import { z } from "zod";

export const whatsappPhoneSchema = z.object({
  phone: z.string().min(8),
});

export type WhatsAppPhoneInput = z.infer<typeof whatsappPhoneSchema>;
