import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteShopAdminStep } from "./steps/delete-shop-admin-step"

export const deleteShopAdminWorkflow = createWorkflow(
  "delete-shop-admin",
  function (input: { id: string }) {
    const result = deleteShopAdminStep(input)
    return new WorkflowResponse(result)
  }
)
