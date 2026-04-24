import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const deleteShopAdminStep = createStep(
  "delete-shop-admin-step",
  async (input: { id: string }, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const existing = await marketplaceService.retrieveShopAdmin(input.id)
    await marketplaceService.deleteShopAdmins(input.id)
    return new StepResponse(
      { id: input.id, deleted: true },
      {
        shop_id: existing.shop?.id ?? existing.shop_id,
        email: existing.email,
        first_name: existing.first_name ?? undefined,
        last_name: existing.last_name ?? undefined,
        is_owner: existing.is_owner,
        status: existing.status as "pending" | "active" | "inactive",
      }
    )
  },
  async (
    previous: {
      shop_id: string
      email: string
      first_name?: string
      last_name?: string
      is_owner: boolean
      status: "pending" | "active" | "inactive"
    },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    await marketplaceService.createShopAdmins({
      shop: previous.shop_id,
      email: previous.email,
      first_name: previous.first_name ?? null,
      last_name: previous.last_name ?? null,
      is_owner: previous.is_owner,
      status: previous.status,
    })
  }
)
