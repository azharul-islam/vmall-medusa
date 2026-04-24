import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../../../../../modules/marketplace"
import { registerVendorWorkflow } from "../../../../../../../workflows/register-vendor"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id, admin_id } = req.params
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const admin = await marketplaceService.retrieveShopAdmin(admin_id)

  if (admin.shop_id !== id && admin.shop?.id !== id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Admin not found for this shop")
  }

  // Register the vendor auth identity via the auth module
  const authService = req.scope.resolve(Modules.AUTH)
  const logger = req.scope.resolve("logger")

  let authIdentityId: string | undefined

  try {
    const existingIdentities = await (authService as any).listAuthIdentities({
      provider_identities: { entity_id: admin.email },
    })

    if (existingIdentities?.length > 0) {
      authIdentityId = existingIdentities[0].id
    } else {
      // Use the auth vendor register endpoint internally
      // We resolve the registration by calling the auth provider directly
      const result = await (authService as any).createAuthIdentities({
        provider_identities: [
          {
            entity_id: admin.email,
            provider: "emailpass",
          },
        ],
        app_metadata: {},
      })
      authIdentityId = result.id
    }
  } catch (e: any) {
    logger.warn(`Could not find/create auth identity for ${admin.email}: ${e.message}`)
  }

  if (!authIdentityId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Could not create or find auth identity for this admin. The vendor should register first via /auth/vendor/emailpass/register"
    )
  }

  const { result } = await registerVendorWorkflow(req.scope).run({
    input: {
      shop_id: id,
      email: admin.email,
      first_name: admin.first_name ?? undefined,
      last_name: admin.last_name ?? undefined,
      is_owner: admin.is_owner,
      authIdentityId,
    },
  })

  await marketplaceService.updateShopAdmins({
    id: admin_id,
    status: "active",
    auth_identity_id: authIdentityId,
  })

  res.json({
    vendor: result,
    message: "Vendor invited. They can now log in at /app using 'Login as Vendor' with their email and password.",
  })
}
