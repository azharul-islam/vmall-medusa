import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createVendorProductWorkflow } from "../../../workflows/create-vendor-product"
import { CreateVendorProductSchema } from "./middlewares"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const shopId = req.query.shop_id as string

  if (!shopId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "shop_id query parameter is required"
    )
  }

  const { data: links } = await query.graph({
    entity: "shop_product",
    fields: ["*", "product.*"],
    filters: {
      shop_id: shopId,
    },
  })

  const products = links.map((link: any) => link.product)
  res.json({ products })
}

export async function POST(
  req: MedusaRequest<CreateVendorProductSchema>,
  res: MedusaResponse
) {
  const shopId = req.query.shop_id as string

  if (!shopId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "shop_id query parameter is required"
    )
  }

  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      shop_id: shopId,
      product_data: req.validatedBody,
    },
  })

  res.status(201).json({ product: result })
}