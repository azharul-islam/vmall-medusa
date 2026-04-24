import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { linkProductToShopWorkflow } from "../../../../../workflows/link-product-to-shop"
import { LinkProductToShopSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: links } = await query.graph({
    entity: "shop_product",
    fields: ["*", "product.*"],
    filters: {
      shop_id: id,
    },
  })

  res.json({ products: links })
}

export async function POST(
  req: AuthenticatedMedusaRequest<LinkProductToShopSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await linkProductToShopWorkflow(req.scope).run({
    input: {
      shop_id: id,
      ...req.validatedBody,
    },
  })

  res.status(201).json({ link: result })
}
