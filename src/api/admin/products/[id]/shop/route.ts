import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: links } = await query.graph({
    entity: "shop_product",
    fields: ["shop_id", "is_owner", "status", "commission_rate"],
    filters: {
      product_id: id,
    },
  })

  if (!links.length) {
    res.json({ shop: null })
    return
  }

  const link = links[0]

  const { data: shopData } = await query.graph({
    entity: "shop",
    fields: ["id", "name", "handle", "logo", "status", "commission_rate"],
    filters: {
      id: link.shop_id,
    },
  })

  res.json({
    shop: shopData[0] ?? null,
    link: {
      is_owner: link.is_owner,
      status: link.status,
      commission_rate: link.commission_rate,
    },
  })
}
