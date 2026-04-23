import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { updateMallWorkflow } from "../../../../workflows/update-mall"
import { deleteMallWorkflow } from "../../../../workflows/delete-mall"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { UpdateMallSchema } from "../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { id } = req.params

  try {
    const mall = await marketplaceService.retrieveMall(id)
    res.json({ mall })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Mall not found")
  }
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateMallSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await updateMallWorkflow(req.scope).run({
    input: {
      id,
      data: req.validatedBody,
    },
  })

  res.json({ mall: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  await deleteMallWorkflow(req.scope).run({
    input: { id },
  })

  res.status(204).send()
}