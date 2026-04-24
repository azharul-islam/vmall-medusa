import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

type ShopAdminStatus = "pending" | "active" | "inactive"

export const updateShopAdminStep = createStep(
  "update-shop-admin-step",
  async (
    input: {
      id: string
      data: {
        first_name?: string
        last_name?: string
        is_owner?: boolean
        status?: ShopAdminStatus
      }
    },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const existing = await marketplaceService.retrieveShopAdmin(input.id)

    const updateData: Record<string, any> = { id: input.id }
    if (input.data.first_name !== undefined) updateData.first_name = input.data.first_name
    if (input.data.last_name !== undefined) updateData.last_name = input.data.last_name
    if (input.data.is_owner !== undefined) updateData.is_owner = input.data.is_owner
    if (input.data.status !== undefined) updateData.status = input.data.status

    const shopAdmin = await marketplaceService.updateShopAdmins(updateData)

    const compensationData = {
      id: input.id,
      previous: {
        first_name: existing.first_name ?? undefined,
        last_name: existing.last_name ?? undefined,
        is_owner: existing.is_owner ?? undefined,
        status: (existing.status as ShopAdminStatus) ?? undefined,
      },
    }

    return new StepResponse(shopAdmin, compensationData)
  },
  async (
    compensationData: {
      id: string
      previous: {
        first_name?: string
        last_name?: string
        is_owner?: boolean
        status?: ShopAdminStatus
      }
    },
    { container }
  ) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const updateData: Record<string, any> = { id: compensationData.id }
    if (compensationData.previous.first_name !== undefined)
      updateData.first_name = compensationData.previous.first_name
    if (compensationData.previous.last_name !== undefined)
      updateData.last_name = compensationData.previous.last_name
    if (compensationData.previous.is_owner !== undefined)
      updateData.is_owner = compensationData.previous.is_owner
    if (compensationData.previous.status !== undefined)
      updateData.status = compensationData.previous.status
    await marketplaceService.updateShopAdmins(updateData)
  }
)
