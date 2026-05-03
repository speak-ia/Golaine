import { z } from "zod";

export const weeklyReportFilterSchema = z.object({
  weekOffset: z.coerce.number().int().min(0).max(52),
});

export type WeeklyReportFilterInput = z.infer<typeof weeklyReportFilterSchema>;
