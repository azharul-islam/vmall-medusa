import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { UpdateShopSchema } from "../api/admin/shops/middlewares"
import { updateShopStep } from "./steps/update-shop-step"

export const updateShopWorkflow = createWorkflow(
  "update-shop",
  function (input: { id: string; data: UpdateShopSchema }) {
    const shop = updateShopStep(input)
    return new WorkflowResponse(shop)
  }
)