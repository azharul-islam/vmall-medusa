import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../../../modules/marketplace"
import { updateShopAdminWorkflow } from "../../../../../../workflows/update-shop-admin"
import { deleteShopAdminWorkflow } from "../../../../../../workflows/delete-shop-admin"
import { UpdateShopAdminSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateShopAdminSchema>,
  res: MedusaResponse
) {
  const { id, admin_id } = req.params
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const admin = await marketplaceService.retrieveShopAdmin(admin_id)
  if (admin.shop_id !== id && admin.shop?.id !== id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Admin not found for this shop")
  }

  const { result } = await updateShopAdminWorkflow(req.scope).run({
    input: {
      id: admin_id,
      data: req.validatedBody,
    },
  })

  res.json({ admin: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id, admin_id } = req.params
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const admin = await marketplaceService.retrieveShopAdmin(admin_id)
  if (admin.shop_id !== id && admin.shop?.id !== id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Admin not found for this shop")
  }

  await deleteShopAdminWorkflow(req.scope).run({
    input: { id: admin_id },
  })

  res.status(204).send()
}
