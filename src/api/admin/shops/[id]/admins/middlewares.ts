import { z } from "zod"

export const CreateShopAdminSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_owner: z.boolean().optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
})

export type CreateShopAdminSchema = z.infer<typeof CreateShopAdminSchema>

export const UpdateShopAdminSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_owner: z.boolean().optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
})

export type UpdateShopAdminSchema = z.infer<typeof UpdateShopAdminSchema>
