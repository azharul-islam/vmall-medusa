import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

type MallShopStatus = "active" | "inactive" | "upcoming"

export const linkShopToMallStep = createStep(
  "link-shop-to-mall-step",
  async (
    input: {
      mall_id: string
      shop_id: string
      floor?: string
      unit_number?: string
      is_anchor?: boolean
      status?: MallShopStatus
    },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const mallShop = await marketplaceService.createMallShops({
      mall: input.mall_id,
      shop: input.shop_id,
      floor: input.floor ?? null,
      unit_number: input.unit_number ?? null,
      is_anchor: input.is_anchor ?? false,
      status: input.status ?? "active",
    })
    return new StepResponse(mallShop, mallShop.id)
  },
  async (mallShopId: string, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    await marketplaceService.deleteMallShops(mallShopId)
  }
)
