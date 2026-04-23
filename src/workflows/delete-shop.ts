import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteShopStep } from "./steps/delete-shop-step"

export const deleteShopWorkflow = createWorkflow(
  "delete-shop",
  function (input: { id: string }) {
    const result = deleteShopStep(input)
    return new WorkflowResponse(result)
  }
)