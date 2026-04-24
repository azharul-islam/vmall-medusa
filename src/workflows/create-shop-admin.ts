import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createShopAdminStep } from "./steps/create-shop-admin-step"

type ShopAdminStatus = "pending" | "active" | "inactive"

export const createShopAdminWorkflow = createWorkflow(
  "create-shop-admin",
  function (input: {
    shop_id: string
    email: string
    first_name?: string
    last_name?: string
    is_owner?: boolean
    status?: ShopAdminStatus
  }) {
    const shopAdmin = createShopAdminStep(input)
    return new WorkflowResponse(shopAdmin)
  }
)
