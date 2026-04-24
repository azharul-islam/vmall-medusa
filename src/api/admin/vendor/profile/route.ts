import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { UpdateShopSchema } from "../../../admin/shops/middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<Partial<UpdateShopSchema>>,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const allowedFields = ["description", "logo", "banner"] as const
  const updateData: Record<string, any> = {}
  const body = req.validatedBody

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    res.json({ shop: null, message: "No updatable fields provided" })
    return
  }

  const shop = await marketplaceService.updateShops({
    id: shopId,
    ...updateData,
  })

  res.json({ shop })
}
