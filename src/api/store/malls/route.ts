import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const [malls, count] = await marketplaceService.listAndCountMalls(
    { status: "active" },
    {
      take: req.queryConfig.pagination.take,
      skip: req.queryConfig.pagination.skip,
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