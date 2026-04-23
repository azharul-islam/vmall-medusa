import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import { CreateShopSchema } from "../../api/admin/shops/middlewares"

export const createShopStep = createStep(
  "create-shop-step",
  async (input: CreateShopSchema, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const shop = await marketplaceService.createShops(input)
    return new StepResponse(shop)
  }
)