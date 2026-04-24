import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import { createShopAdminWorkflow } from "../../../../../workflows/create-shop-admin"
import { CreateShopAdminSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
  const { id } = req.params

  const admins = await marketplaceService.listShopAdmins(
    { shop_id: id },
    {
      order: { created_at: "DESC" },
    }
  )

  res.json({ admins })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateShopAdminSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await createShopAdminWorkflow(req.scope).run({
    input: {
      shop_id: id,
      ...req.validatedBody,
    },
  })

  res.status(201).json({ admin: result })
}
