import { z } from "zod"

export const CreateVendorProductSchema = z.object({
  title: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "proposed", "published", "rejected"]).optional(),
  images: z.array(z.object({ url: z.string() })).optional(),
  thumbnail: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
  type_id: z.string().optional(),
  collection_id: z.string().optional(),
  tags: z.array(z.object({ value: z.string() })).optional(),
  options: z.array(z.object({ title: z.string(), values: z.array(z.string()) })).optional(),
  variants: z.array(z.object({
    title: z.string().min(1),
    sku: z.string().optional(),
    prices: z.array(z.object({
      currency_code: z.string(),
      amount: z.number(),
    })).optional(),
    options: z.record(z.string()).optional(),
    inventory_quantity: z.number().optional(),
  })).optional(),
})

export type CreateVendorProductSchema = z.infer<typeof CreateVendorProductSchema>