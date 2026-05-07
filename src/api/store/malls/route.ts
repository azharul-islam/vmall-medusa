import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const { q } = req.validatedQuery

  const filters: Record<string, any> = { status: "active" }
  if (q) filters.q = q

  const [malls, count] = await marketplaceService.listAndCountMalls(
    filters,
    {
      ...req.queryConfig.pagination,
      order: { created_at: "DESC" },
    }
  )

  res.json({
    malls,
    count,
    limit: req.queryConfig.pagination.take,
    offset: req.queryConfig.pagination.skip,
  })
}