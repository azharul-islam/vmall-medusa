import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { id } = req.params

  const mallShops = await marketplaceService.listMallShops(
    { shop_id: id },
    {
      relations: ["mall"],
      order: { created_at: "DESC" },
    }
  )

  res.json({ mall_shops: mallShops })
}
