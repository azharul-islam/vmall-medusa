import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import { createVendorProductWorkflow } from "../../../../workflows/create-vendor-product"
import { CreateVendorProductSchema } from "../../../vendor/products/middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const { data: links } = await query.graph({
    entity: "shop_product",
    fields: ["*", "product.*"],
    filters: { shop_id: shopId },
  })

  res.json({ products: links })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateVendorProductSchema>,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const shopAdmin = await marketplaceService.retrieveShopAdmin(
    req.auth_context.actor_id
  )
  const shopId = shopAdmin.shop?.id ?? shopAdmin.shop_id

  const { result } = await createVendorProductWorkflow(req.scope).run({
    input: {
      shop_id: shopId,
      product_data: req.validatedBody,
    },
  })

  res.status(201).json({ product: result })
}
