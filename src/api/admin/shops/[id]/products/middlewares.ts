import { z } from "zod"

export const LinkProductToShopSchema = z.object({
  product_id: z.string().min(1),
  is_owner: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  commission_rate: z.number().min(0).max(1).optional(),
})

export type LinkProductToShopSchema = z.infer<typeof LinkProductToShopSchema>
