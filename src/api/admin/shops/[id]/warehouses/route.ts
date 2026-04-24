import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { linkWarehouseToShopWorkflow } from "../../../../../workflows/link-warehouse-to-shop"
import { LinkWarehouseToShopSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data: links } = await query.graph({
    entity: "shop_stock_location",
    fields: ["*", "stock_location.*"],
    filters: {
      shop_id: id,
    },
  })

  res.json({ warehouses: links })
}

export async function POST(
  req: AuthenticatedMedusaRequest<LinkWarehouseToShopSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await linkWarehouseToShopWorkflow(req.scope).run({
    input: {
      shop_id: id,
      ...req.validatedBody,
    },
  })

  res.status(201).json({ link: result })
}
