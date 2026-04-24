import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { linkProductToShopStep } from "./steps/link-product-to-shop-step"

export const linkProductToShopWorkflow = createWorkflow(
  "link-product-to-shop",
  function (input: {
    shop_id: string
    product_id: string
    is_owner?: boolean
    status?: string
    commission_rate?: number
  }) {
    const result = linkProductToShopStep(input)
    return new WorkflowResponse(result)
  }
)
