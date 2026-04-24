import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)

  const [mallsAll, totalMalls] = await marketplaceService.listAndCountMalls({}, { take: 0 })
  const [, activeMalls] = await marketplaceService.listAndCountMalls({ status: "active" }, { take: 0 })
  const [, inactiveMalls] = await marketplaceService.listAndCountMalls({ status: "inactive" }, { take: 0 })
  const [, comingSoonMalls] = await marketplaceService.listAndCountMalls({ status: "coming_soon" }, { take: 0 })

  const [shopsAll, totalShops] = await marketplaceService.listAndCountShops({}, { take: 0 })
  const [, activeShops] = await marketplaceService.listAndCountShops({ status: "active" }, { take: 0 })
  const [, pendingShops] = await marketplaceService.listAndCountShops({ status: "pending" }, { take: 0 })
  const [, suspendedShops] = await marketplaceService.listAndCountShops({ status: "suspended" }, { take: 0 })

  const recentMalls = await marketplaceService.listMalls({}, {
    take: 5,
    order: { created_at: "DESC" },
  })

  const recentShops = await marketplaceService.listShops({}, {
    take: 5,
    order: { created_at: "DESC" },
  })

  res.json({
    malls: {
      total: totalMalls,
      active: activeMalls,
      inactive: inactiveMalls,
      coming_soon: comingSoonMalls,
    },
    shops: {
      total: totalShops,
      active: activeShops,
      pending: pendingShops,
      suspended: suspendedShops,
    },
    recent_malls: recentMalls,
    recent_shops: recentShops,
  })
}
