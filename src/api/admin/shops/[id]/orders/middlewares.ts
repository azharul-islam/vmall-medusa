import { z } from "zod"

export const UpdatePayoutSchema = z.object({
  payout_status: z.enum(["pending", "processing", "paid", "failed"]),
  payout_amount: z.number().optional(),
  commission_amount: z.number().optional(),
})

export type UpdatePayoutSchema = z.infer<typeof UpdatePayoutSchema>
