import { z } from "zod"

export const LinkWarehouseToShopSchema = z.object({
  stock_location_id: z.string().min(1),
  is_default: z.boolean().optional(),
  display_name: z.string().optional(),
})

export type LinkWarehouseToShopSchema = z.infer<typeof LinkWarehouseToShopSchema>
