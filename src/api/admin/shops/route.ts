import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createShopWorkflow } from "../../../workflows/create-shop"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import { CreateShopSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const { q, status } = req.validatedQuery

  const filters: Record<string, any> = {}
  if (status) filters.status = status
  if (q) filters.q = q

  const [shops, count] = await marketplaceService.listAndCountShops(filters, {
    ...req.queryConfig.pagination,
    order: { created_at: "DESC" },
  })

  res.json({
    shops,
    count,
    limit: req.queryConfig.pagination.take,
    offset: req.queryConfig.pagination.skip,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateShopSchema>,
  res: MedusaResponse
) {
  const { result } = await createShopWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(201).json({ shop: result })
}