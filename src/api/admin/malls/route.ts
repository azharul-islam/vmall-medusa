import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createMallWorkflow } from "../../../workflows/create-mall"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import { CreateMallSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0
  const status = req.query.status as string

  const filters: Record<string, any> = {}
  if (status) {
    filters.status = status
  }

  const [malls, count] = await marketplaceService.listAndCountMalls(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ malls, count, limit, offset })
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