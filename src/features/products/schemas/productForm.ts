import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  category: z.string().min(1),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string(),
  status: z.enum(["actif", "inactif"]),
  assignedAgent: z.string().nullable(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
