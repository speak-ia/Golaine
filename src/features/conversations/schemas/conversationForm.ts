import { z } from "zod";

export const messageSchema = z.object({
  sender: z.enum(["client", "agent"]),
  text: z.string(),
  time: z.string(),
});

export const conversationStatusSchema = z.enum(["active", "closed"]);

export type ConversationStatusInput = z.infer<typeof conversationStatusSchema>;
