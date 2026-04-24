import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { registerVendorStep } from "./steps/register-vendor-step"

export const registerVendorWorkflow = createWorkflow(
  "register-vendor",
  function (input: {
    shop_id: string
    email: string
    first_name?: string
    last_name?: string
    is_owner?: boolean
    authIdentityId: string
  }) {
    const shopAdmin = registerVendorStep({
      shop_id: input.shop_id,
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      is_owner: input.is_owner,
    })

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "vendor",
      value: shopAdmin.id,
    })

    return new WorkflowResponse(shopAdmin)
  }
)
