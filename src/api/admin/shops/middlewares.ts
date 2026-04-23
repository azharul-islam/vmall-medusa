import { z } from "zod"

export const CreateShopSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  commission_rate: z.number().optional(),
})

export type CreateShopSchema = z.infer<typeof CreateShopSchema>

export const UpdateShopSchema = z.object({
  name: z.string().min(1).optional(),
  handle: z.string().min(1).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  commission_rate: z.number().optional(),
})

export type UpdateShopSchema = z.infer<typeof UpdateShopSchema>

export const GetShopsSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]).optional(),
})

export type GetShopsSchema = z.infer<typeof GetShopsSchema>