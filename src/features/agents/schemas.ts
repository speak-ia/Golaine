import { z } from "zod";

export const agentSlotSchema = z.object({
  slotName: z.string().min(1),
  agentName: z.string(),
  phone: z.string(),
});

export type AgentSlotInput = z.infer<typeof agentSlotSchema>;
