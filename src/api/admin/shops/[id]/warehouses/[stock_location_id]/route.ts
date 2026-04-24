import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { unlinkWarehouseFromShopWorkflow } from "../../../../../../workflows/unlink-warehouse-from-shop"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id, stock_location_id } = req.params

  await unlinkWarehouseFromShopWorkflow(req.scope).run({
    input: {
      shop_id: id,
      stock_location_id,
    },
  })

  res.status(204).send()
}
