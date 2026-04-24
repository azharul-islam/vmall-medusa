import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { unlinkProductFromShopWorkflow } from "../../../../../../workflows/unlink-product-from-shop"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id, product_id } = req.params

  await unlinkProductFromShopWorkflow(req.scope).run({
    input: {
      shop_id: id,
      product_id,
    },
  })

  res.status(204).send()
}
