import { z } from "zod";

export const planTierSchema = z.enum(["Starter", "Pro", "Business"]);

export type PlanTierInput = z.infer<typeof planTierSchema>;
