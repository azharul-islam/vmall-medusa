import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id,
    { relations: ["shop"] }
  )

  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const { data: shopData } = await query.graph({
    entity: "shop",
    fields: ["id", "name", "handle", "description", "logo", "banner", "status", "commission_rate"],
    filters: { id: shopId },
  })

  res.json({
    admin: {
      id: shopAdmin.id,
      email: shopAdmin.email,
      first_name: shopAdmin.first_name,
      last_name: shopAdmin.last_name,
      is_owner: shopAdmin.is_owner,
      status: shopAdmin.status,
    },
    shop: shopData[0] ?? null,
  })
}
