import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const { data: links } = await query.graph({
    entity: "shop_order",
    fields: ["*", "order.*"],
    filters: { shop_id: shopId },
  })

  res.json({ payouts: links })
}
