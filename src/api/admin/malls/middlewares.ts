import { z } from "zod"

export const CreateMallSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive", "coming_soon"]).optional(),
})

export type CreateMallSchema = z.infer<typeof CreateMallSchema>

export const UpdateMallSchema = z.object({
  name: z.string().min(1).optional(),
  handle: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive", "coming_soon"]).optional(),
})

export type UpdateMallSchema = z.infer<typeof UpdateMallSchema>

export const GetMallsSchema = z.object({
  status: z.enum(["active", "inactive", "coming_soon"]).optional(),
})

export type GetMallsSchema = z.infer<typeof GetMallsSchema>