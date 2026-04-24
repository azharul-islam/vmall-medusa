import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { unlinkShopFromMallStep } from "./steps/unlink-shop-from-mall-step"

export const unlinkShopFromMallWorkflow = createWorkflow(
  "unlink-shop-from-mall",
  function (input: { mall_id: string; shop_id: string }) {
    const result = unlinkShopFromMallStep(input)
    return new WorkflowResponse(result)
  }
)
