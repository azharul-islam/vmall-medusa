import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const linkWarehouseToShopStep = createStep(
  "link-warehouse-to-shop-step",
  async (
    input: {
      shop_id: string
      stock_location_id: string
      is_default?: boolean
      display_name?: string
    },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: input.stock_location_id,
      },
      data: {
        is_default: input.is_default ?? false,
        display_name: input.display_name ?? null,
      },
    })
    return new StepResponse(
      { shop_id: input.shop_id, stock_location_id: input.stock_location_id },
      { shop_id: input.shop_id, stock_location_id: input.stock_location_id }
    )
  },
  async (
    compensationData: { shop_id: string; stock_location_id: string },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss({
      [MARKETPLACE_MODULE]: {
        shop_id: compensationData.shop_id,
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: compensationData.stock_location_id,
      },
    })
  }
)
