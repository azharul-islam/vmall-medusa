import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import { UpdateShopSchema } from "../../api/admin/shops/middlewares"

export const updateShopStep = createStep(
  "update-shop-step",
  async (input: { id: string; data: UpdateShopSchema }, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const shop = await marketplaceService.updateShops({
      id: input.id,
      ...input.data,
    })
    return new StepResponse(shop)
  }
)