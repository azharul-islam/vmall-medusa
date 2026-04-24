import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const unlinkWarehouseFromShopStep = createStep(
  "unlink-warehouse-from-shop-step",
  async (
    input: { shop_id: string; stock_location_id: string },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: existingLinks } = await query.graph({
      entity: "shop_stock_location",
      fields: ["is_default", "display_name"],
      filters: {
        shop_id: input.shop_id,
        stock_location_id: input.stock_location_id,
      },
    })

    await link.dismiss({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: input.stock_location_id,
      },
    })

    const prev = existingLinks[0] as Record<string, any> | undefined

    const compensationData: {
      shop_id: string
      stock_location_id: string
      is_default?: boolean
      display_name?: string
    } = {
      shop_id: input.shop_id,
      stock_location_id: input.stock_location_id,
      is_default: prev?.is_default ?? undefined,
      display_name: prev?.display_name != null ? String(prev.display_name) : undefined,
    }

    return new StepResponse({ deleted: true }, compensationData)
  },
  async (
    compensationData: {
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
        shop_id: compensationData.shop_id,
      },
      [Modules.STOCK_LOCATION]: {
        stock_location_id: compensationData.stock_location_id,
      },
      data: {
        is_default: compensationData.is_default ?? false,
        display_name: compensationData.display_name ?? null,
      },
    })
  }
)
