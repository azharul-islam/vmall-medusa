import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { unlinkShopFromMallWorkflow } from "../../../../../../workflows/unlink-shop-from-mall"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id, shop_id } = req.params

  await unlinkShopFromMallWorkflow(req.scope).run({
    input: {
      mall_id: id,
      shop_id,
    },
  })

  res.status(204).send()
}
