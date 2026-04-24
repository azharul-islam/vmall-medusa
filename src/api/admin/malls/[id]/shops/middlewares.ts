import { z } from "zod"

export const LinkShopToMallSchema = z.object({
  shop_id: z.string().min(1),
  floor: z.string().optional(),
  unit_number: z.string().optional(),
  is_anchor: z.boolean().optional(),
  status: z.enum(["active", "inactive", "upcoming"]).optional(),
})

export type LinkShopToMallSchema = z.infer<typeof LinkShopToMallSchema>
