import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import { CreateVendorProductSchema } from "../../api/vendor/products/middlewares"

export const createVendorProductStep = createStep(
  "create-vendor-product-step",
  async (
    input: { shop_id: string; product_data: CreateVendorProductSchema },
    { container }
  ) => {
    // Create the product using Medusa's built-in workflow
    const { result: productResult } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products: [input.product_data],
      },
    })

    const createdProduct = productResult[0]

    // Link the product to the shop
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.PRODUCT]: {
        product_id: createdProduct.id,
      },
      data: {
        is_owner: true,
        status: "active",
      },
    })

    return new StepResponse(createdProduct)
  }
)