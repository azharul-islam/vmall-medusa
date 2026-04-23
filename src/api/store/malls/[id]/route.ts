import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: mallData } = await query.graph({
    entity: "mall",
    ...req.queryConfig,
    filters: { id },
  }, {
    throwIfKeyNotFound: true,
  })

  const mall = mallData[0]

  const { data: mallShops } = await query.graph({
    entity: "mall_shop",
    fields: ["*", "shop.*"],
    filters: {
      mall_id: id,
      status: "active",
    },
  })

  res.json({
    mall,
    shops: mallShops.map((link: any) => ({
      ...link.shop,
      floor: link.floor,
      unit_number: link.unit_number,
      is_anchor: link.is_anchor,
    })),
  })
}