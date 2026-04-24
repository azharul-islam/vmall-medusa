import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { registerVendorWorkflow } from "../../../workflows/register-vendor"
import { RegisterVendorSchema } from "./middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<RegisterVendorSchema>,
  res: MedusaResponse
) {
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }

  const { result } = await registerVendorWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      authIdentityId: req.auth_context.auth_identity_id,
    },
  })

  res.status(201).json({ vendor: result })
}
