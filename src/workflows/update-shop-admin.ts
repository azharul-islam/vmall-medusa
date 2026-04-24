import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateShopAdminStep } from "./steps/update-shop-admin-step"

type ShopAdminStatus = "pending" | "active" | "inactive"

export const updateShopAdminWorkflow = createWorkflow(
  "update-shop-admin",
  function (input: {
    id: string
    data: {
      first_name?: string
      last_name?: string
      is_owner?: boolean
      status?: ShopAdminStatus
    }
  }) {
    const shopAdmin = updateShopAdminStep(input)
    return new WorkflowResponse(shopAdmin)
  }
)
