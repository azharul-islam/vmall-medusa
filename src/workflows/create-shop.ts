import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateShopSchema } from "../api/admin/shops/middlewares"
import { createShopStep } from "./steps/create-shop-step"

export const createShopWorkflow = createWorkflow(
  "create-shop",
  function (input: CreateShopSchema) {
    const shop = createShopStep(input)
    return new WorkflowResponse(shop)
  }
)