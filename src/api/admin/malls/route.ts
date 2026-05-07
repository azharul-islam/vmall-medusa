import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createMallWorkflow } from "../../../workflows/create-mall"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import { CreateMallSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const { q, status } = req.validatedQuery

  const filters: Record<string, any> = {}
  if (status) filters.status = status
  if (q) filters.q = q

  const [malls, count] = await marketplaceService.listAndCountMalls(filters, {
    ...req.queryConfig.pagination,
    order: { created_at: "DESC" },
  })

  res.json({
    malls,
    count,
    limit: req.queryConfig.pagination.take,
    offset: req.queryConfig.pagination.skip,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateMallSchema>,
  res: MedusaResponse
) {
  const { result } = await createMallWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(201).json({ mall: result })
}