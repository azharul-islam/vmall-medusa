import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { updateShopWorkflow } from "../../../../workflows/update-shop"
import { deleteShopWorkflow } from "../../../../workflows/delete-shop"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { UpdateShopSchema } from "../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { id } = req.params

  try {
    const shop = await marketplaceService.retrieveShop(id)
    res.json({ shop })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Shop not found")
  }
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateShopSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await updateShopWorkflow(req.scope).run({
    input: {
      id,
      data: req.validatedBody,
    },
  })

  res.json({ shop: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  await deleteShopWorkflow(req.scope).run({
    input: { id },
  })

  res.status(204).send()
}