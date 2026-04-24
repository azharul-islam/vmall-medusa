import { z } from "zod"

export const RegisterVendorSchema = z.object({
  shop_id: z.string().min(1),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  is_owner: z.boolean().optional(),
})

export type RegisterVendorSchema = z.infer<typeof RegisterVendorSchema>
