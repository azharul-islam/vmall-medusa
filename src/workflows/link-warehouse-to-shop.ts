import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { linkWarehouseToShopStep } from "./steps/link-warehouse-to-shop-step"

export const linkWarehouseToShopWorkflow = createWorkflow(
  "link-warehouse-to-shop",
  function (input: {
    shop_id: string
    stock_location_id: string
    is_default?: boolean
    display_name?: string
  }) {
    const result = linkWarehouseToShopStep(input)
    return new WorkflowResponse(result)
  }
)
