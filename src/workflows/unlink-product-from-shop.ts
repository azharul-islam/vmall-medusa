import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { unlinkProductFromShopStep } from "./steps/unlink-product-from-shop-step"

export const unlinkProductFromShopWorkflow = createWorkflow(
  "unlink-product-from-shop",
  function (input: { shop_id: string; product_id: string }) {
    const result = unlinkProductFromShopStep(input)
    return new WorkflowResponse(result)
  }
)
