import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateShopOrderPayoutStep } from "./steps/update-shop-order-payout-step"

type PayoutStatus = "pending" | "processing" | "paid" | "failed"

export const updateShopOrderPayoutWorkflow = createWorkflow(
  "update-shop-order-payout",
  function (input: {
    shop_id: string
    order_id: string
    payout_status: PayoutStatus
    payout_amount?: number
    commission_amount?: number
  }) {
    const result = updateShopOrderPayoutStep(input)
    return new WorkflowResponse(result)
  }
)
