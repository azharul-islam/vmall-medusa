import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

type ShopAdminStatus = "pending" | "active" | "inactive"

export const createShopAdminStep = createStep(
  "create-shop-admin-step",
  async (
    input: {
      shop_id: string
      email: string
      first_name?: string
      last_name?: string
      is_owner?: boolean
      status?: ShopAdminStatus
    },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const shopAdmin = await marketplaceService.createShopAdmins({
      shop: input.shop_id,
      email: input.email,
      first_name: input.first_name ?? null,
      last_name: input.last_name ?? null,
      is_owner: input.is_owner ?? false,
      status: input.status ?? "pending",
    })
    return new StepResponse(shopAdmin, shopAdmin.id)
  },
  async (shopAdminId: string, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    await marketplaceService.deleteShopAdmins(shopAdminId)
  }
)
