import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

type PayoutStatus = "pending" | "processing" | "paid" | "failed"

export const updateShopOrderPayoutStep = createStep(
  "update-shop-order-payout-step",
  async (
    input: {
      shop_id: string
      order_id: string
      payout_status: PayoutStatus
      payout_amount?: number
      commission_amount?: number
    },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: existingLinks } = await query.graph({
      entity: "shop_order",
      fields: ["payout_status", "payout_amount", "commission_amount"],
      filters: {
        shop_id: input.shop_id,
        order_id: input.order_id,
      },
    })

    if (!existingLinks.length) {
      throw new Error("Shop-order link not found")
    }

    const prev = existingLinks[0] as Record<string, any>

    await link.create({
      [MARKETPLACE_MODULE]: {
        shop_id: input.shop_id,
      },
      [Modules.ORDER]: {
        order_id: input.order_id,
      },
      data: {
        payout_status: input.payout_status,
        payout_amount: input.payout_amount ?? Number(prev.payout_amount),
        commission_amount: input.commission_amount ?? Number(prev.commission_amount),
      },
    })

    const compensationData = {
      shop_id: input.shop_id,
      order_id: input.order_id,
      previous: {
        payout_status: String(prev.payout_status) as PayoutStatus,
        payout_amount: prev.payout_amount != null ? Number(prev.payout_amount) : undefined,
        commission_amount: prev.commission_amount != null ? Number(prev.commission_amount) : undefined,
      },
    }

    return new StepResponse({ updated: true }, compensationData)
  },
  async (
    compensationData: {
      shop_id: string
      order_id: string
      previous: {
        payout_status: PayoutStatus
        payout_amount?: number
        commission_amount?: number
      }
    },
    { container }
  ) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.create({
      [MARKETPLACE_MODULE]: {
        shop_id: compensationData.shop_id,
      },
      [Modules.ORDER]: {
        order_id: compensationData.order_id,
      },
      data: {
        payout_status: compensationData.previous.payout_status,
        payout_amount: compensationData.previous.payout_amount ?? null,
        commission_amount: compensationData.previous.commission_amount ?? null,
      },
    })
  }
)
