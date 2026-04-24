import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { unlinkWarehouseFromShopStep } from "./steps/unlink-warehouse-from-shop-step"

export const unlinkWarehouseFromShopWorkflow = createWorkflow(
  "unlink-warehouse-from-shop",
  function (input: { shop_id: string; stock_location_id: string }) {
    const result = unlinkWarehouseFromShopStep(input)
    return new WorkflowResponse(result)
  }
)
