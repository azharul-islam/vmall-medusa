import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

type MallShopStatus = "active" | "inactive" | "upcoming"

export const unlinkShopFromMallStep = createStep(
  "unlink-shop-from-mall-step",
  async (
    input: { mall_id: string; shop_id: string },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const mallShops = await marketplaceService.listMallShops({
      mall_id: input.mall_id,
      shop_id: input.shop_id,
    })

    if (!mallShops.length) {
      throw new Error("Shop is not linked to this mall")
    }

    const mallShop = mallShops[0]
    const mallShopId = mallShop.id
    await marketplaceService.deleteMallShops(mallShopId)

    const compensationData: {
      mall_id: string
      shop_id: string
      floor: string | undefined
      unit_number: string | undefined
      is_anchor: boolean | undefined
      status: MallShopStatus | undefined
    } = {
      mall_id: input.mall_id,
      shop_id: input.shop_id,
      floor: mallShop.floor ?? undefined,
      unit_number: mallShop.unit_number ?? undefined,
      is_anchor: mallShop.is_anchor ?? undefined,
      status: (mallShop.status as MallShopStatus) ?? undefined,
    }

    return new StepResponse({ deleted: true }, compensationData)
  },
  async (
    inputData: {
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
    await marketplaceService.createMallShops({
      mall: inputData.mall_id,
      shop: inputData.shop_id,
      floor: inputData.floor ?? null,
      unit_number: inputData.unit_number ?? null,
      is_anchor: inputData.is_anchor ?? false,
      status: inputData.status ?? "active",
    })
  }
)
