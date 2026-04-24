import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const unlinkProductFromShopStep = createStep(
  "unlink-product-from-shop-step",
  async (
    input: { shop_id: string; product_id: string },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: existingLinks } = await query.graph({
      entity: "shop_product",
      fields: ["is_owner", "status", "commission_rate"],
      filters: {
        shop_id: input.shop_id,
        product_id: input.product_id,
      },
    })

    await link.dismiss({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    })

    const prev = existingLinks[0] as Record<string, any> | undefined

    const compensationData: {
      shop_id: string
      product_id: string
      is_owner?: boolean
      status?: string
      commission_rate?: number
    } = {
      shop_id: input.shop_id,
      product_id: input.product_id,
      is_owner: prev?.is_owner ?? undefined,
      status: prev?.status ?? undefined,
      commission_rate: prev?.commission_rate != null ? Number(prev.commission_rate) : undefined,
    }

    return new StepResponse({ deleted: true }, compensationData)
  },
  async (
    compensationData: {
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
        shop_id: compensationData.shop_id,
      },
      [Modules.PRODUCT]: {
        product_id: compensationData.product_id,
      },
      data: {
        is_owner: compensationData.is_owner ?? false,
        status: compensationData.status ?? "active",
        commission_rate: compensationData.commission_rate ?? null,
      },
    })
  }
)
