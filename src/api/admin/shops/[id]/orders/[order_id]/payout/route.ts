import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateShopOrderPayoutWorkflow } from "../../../../../../../workflows/update-shop-order-payout"
import { UpdatePayoutSchema } from "../../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdatePayoutSchema>,
  res: MedusaResponse
) {
  const { id, order_id } = req.params

  const { result } = await updateShopOrderPayoutWorkflow(req.scope).run({
    input: {
      shop_id: id,
      order_id,
      ...req.validatedBody,
    },
  })

  res.json({ payout: result })
}
