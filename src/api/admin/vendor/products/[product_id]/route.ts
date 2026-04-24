import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import { unlinkProductFromShopWorkflow } from "../../../../../workflows/unlink-product-from-shop"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { product_id } = req.params

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  await unlinkProductFromShopWorkflow(req.scope).run({
    input: { shop_id: shopId, product_id },
  })

  res.status(204).send()
}
