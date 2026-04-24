import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { linkShopToMallStep } from "./steps/link-shop-to-mall-step"

type MallShopStatus = "active" | "inactive" | "upcoming"

export const linkShopToMallWorkflow = createWorkflow(
  "link-shop-to-mall",
  function (input: {
    mall_id: string
    shop_id: string
    floor?: string
    unit_number?: string
    is_anchor?: boolean
    status?: MallShopStatus
  }) {
    const mallShop = linkShopToMallStep(input)
    return new WorkflowResponse(mallShop)
  }
)
