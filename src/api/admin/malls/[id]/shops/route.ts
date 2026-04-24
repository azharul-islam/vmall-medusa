import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import { linkShopToMallWorkflow } from "../../../../../workflows/link-shop-to-mall"
import { LinkShopToMallSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { id } = req.params

  const mallShops = await marketplaceService.listMallShops(
    { mall_id: id },
    {
      relations: ["shop"],
      order: { created_at: "DESC" },
    }
  )

  res.json({ mall_shops: mallShops })
}

export async function POST(
  req: AuthenticatedMedusaRequest<LinkShopToMallSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await linkShopToMallWorkflow(req.scope).run({
    input: {
      mall_id: id,
      ...req.validatedBody,
    },
  })

  res.status(201).json({ mall_shop: result })
}
