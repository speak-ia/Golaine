import { z } from "zod";

export const profileSettingsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
