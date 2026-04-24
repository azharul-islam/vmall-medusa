import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const mallShops = await marketplaceService.listMallShops(
    { shop_id: shopId },
    { relations: ["mall"] }
  )

  res.json({ malls: mallShops })
}
