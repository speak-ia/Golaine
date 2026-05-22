import { z } from "zod";

export const agentConfigSchema = z.object({
  agentName: z.string().max(120),
  instructions: z.string().max(48_000),
  notificationNumber: z.string().max(32),
  autoResponse: z.boolean(),
  welcomeMessage: z.string().max(4_000),
  workingHours: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().max(64),
  language: z.enum(["fr", "en", "wo", "ar"]),
  fallbackToHuman: z.boolean(),
});

export type AgentConfigInput = z.infer<typeof agentConfigSchema>;
