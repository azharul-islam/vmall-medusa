import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const linkProductToShopStep = createStep(
  "link-product-to-shop-step",
  async (
    input: {
      shop_id: string
      product_id: string
      is_owner?: boolean
      status?: string
      commission_rate?: number
    },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
      data: {
        is_owner: input.is_owner ?? false,
        status: input.status ?? "active",
        commission_rate: input.commission_rate ?? null,
      },
    })
    return new StepResponse(
      { shop_id: input.shop_id, product_id: input.product_id },
      { shop_id: input.shop_id, product_id: input.product_id }
    )
  },
  async (
    compensationData: { shop_id: string; product_id: string },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss({
      [MARKETPLACE_MODULE]: {
        shop_id: compensationData.shop_id,
      },
      [Modules.PRODUCT]: {
        product_id: compensationData.product_id,
      },
    })
  }
)
