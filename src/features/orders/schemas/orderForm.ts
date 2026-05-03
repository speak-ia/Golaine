import { z } from "zod";
import { ORDER_STATUSES } from "@shared/constants/status";

export const orderFormSchema = z.object({
  client: z.string().min(1),
  produit: z.string().min(1),
  adresse: z.string().min(1),
  montant: z.coerce.number().int().nonnegative(),
  status: z.enum(ORDER_STATUSES),
  date: z.string().min(1),
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;
