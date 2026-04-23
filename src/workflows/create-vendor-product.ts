import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateVendorProductSchema } from "../api/vendor/products/middlewares"
import { createVendorProductStep } from "./steps/create-vendor-product-step"

export const createVendorProductWorkflow = createWorkflow(
  "create-vendor-product",
  function (input: { shop_id: string; product_data: CreateVendorProductSchema }) {
    const product = createVendorProductStep(input)
    return new WorkflowResponse(product)
  }
)