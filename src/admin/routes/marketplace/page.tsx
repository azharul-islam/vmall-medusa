import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Skeleton,
} from "@medusajs/ui"
import {
  BuildingStorefront,
  MapPin,
  ShoppingBag,
  ReceiptPercent,
  Plus,
} from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useNavigate } from "react-router-dom"
import "../../global.css"

interface MarketplaceStats {
  malls: {
    total: number
    active: number
    inactive: number
    coming_soon: number
  }
  shops: {
    total: number
    active: number
    pending: number
    suspended: number
  }
  recent_malls: {
    id: string
    name: string
    handle: string
    status: string
    created_at: string
  }[]
  recent_shops: {
    id: string
    name: string
    handle: string
    logo: string | null
    status: string
    created_at: string
  }[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "green" as const
    case "pending":
    case "coming_soon": return "orange" as const
    case "inactive":
    case "suspended": return "red" as const
    default: return "grey" as const
  }
}

const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  onClick,
}: {
  label: string
  value: number | string
  subtext?: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) => (
  <div
    className={`rounded-md border bg-ui-bg-base p-4 shadow-elevation-card-rest ${onClick ? "cursor-pointer hover:bg-ui-bg-subtle-hover" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-x-2 mb-2">
      <Icon className="text-ui-fg-subtle size-4" />
      <Text size="small" weight="plus" className="text-ui-fg-subtle">{label}</Text>
    </div>
    <Heading level="h2" className="mb-1">{value}</Heading>
    {subtext && <Text size="small" className="text-ui-fg-muted">{subtext}</Text>}
  </div>
)

const MarketplaceDashboard = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<MarketplaceStats>(
        "/admin/marketplace/stats"
      )
      return response
    },
    queryKey: ["marketplace-stats"],
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-md" />
      </div>
    )
  }

  const malls = data?.malls ?? { total: 0, active: 0, inactive: 0, coming_soon: 0 }
  const shops = data?.shops ?? { total: 0, active: 0, pending: 0, suspended: 0 }
  const recentMalls = data?.recent_malls ?? []
  const recentShops = data?.recent_shops ?? []

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <Heading level="h1">Marketplace</Heading>
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" onClick={() => navigate("/malls")}>
            <MapPin className="text-ui-fg-subtle" />
            <span className="ml-2">Malls</span>
          </Button>
          <Button size="small" variant="secondary" onClick={() => navigate("/shops")}>
            <BuildingStorefront className="text-ui-fg-subtle" />
            <span className="ml-2">Shops</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Malls"
          value={malls.total}
          subtext={`${malls.active} active`}
          icon={MapPin}
          onClick={() => navigate("/malls")}
        />
        <StatCard
          label="Shops"
          value={shops.total}
          subtext={`${shops.active} active · ${shops.pending} pending`}
          icon={BuildingStorefront}
          onClick={() => navigate("/shops")}
        />
        <StatCard
          label="Active Shops"
          value={shops.active}
          subtext={`${shops.suspended} suspended`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Coming Soon"
          value={malls.coming_soon}
          subtext={`${malls.inactive} inactive malls`}
          icon={ReceiptPercent}
        />
      </div>

      {/* Quick Actions */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text size="small" weight="plus">Quick Actions</Text>
        </div>
        <div className="flex items-center gap-x-3 px-6 py-4">
          <Button size="small" onClick={() => navigate("/malls")}>
            <Plus className="text-ui-fg-on-color" />
            <span className="ml-2">Add Mall</span>
          </Button>
          <Button size="small" onClick={() => navigate("/shops")}>
            <Plus className="text-ui-fg-on-color" />
            <span className="ml-2">Add Shop</span>
          </Button>
        </div>
      </Container>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Malls */}
        <Container className="divide-y p-0">
          <div className="px-6 py-4">
            <Text size="small" weight="plus">Recent Malls</Text>
          </div>
          <div className="flex flex-col">
            {recentMalls.length === 0 ? (
              <div className="px-6 py-4">
                <Text size="small" className="text-ui-fg-subtle">No malls yet</Text>
              </div>
            ) : (
              recentMalls.map((mall) => (
                <div
                  key={mall.id}
                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-ui-bg-subtle-hover"
                  onClick={() => navigate(`/malls/${mall.id}`)}
                >
                  <div className="flex items-center gap-x-2">
                    <MapPin className="text-ui-fg-muted size-4" />
                    <Text size="small" weight="plus">{mall.name}</Text>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Badge size="2xsmall" color={getStatusColor(mall.status)}>
                      {mall.status.replace("_", " ")}
                    </Badge>
                    <Text size="small" className="text-ui-fg-muted">
                      {new Date(mall.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>

        {/* Recent Shops */}
        <Container className="divide-y p-0">
          <div className="px-6 py-4">
            <Text size="small" weight="plus">Recent Shops</Text>
          </div>
          <div className="flex flex-col">
            {recentShops.length === 0 ? (
              <div className="px-6 py-4">
                <Text size="small" className="text-ui-fg-subtle">No shops yet</Text>
              </div>
            ) : (
              recentShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-ui-bg-subtle-hover"
                  onClick={() => navigate(`/shops/${shop.id}`)}
                >
                  <div className="flex items-center gap-x-2">
                    <div className="size-6 overflow-hidden rounded bg-ui-bg-subtle">
                      {shop.logo ? (
                        <img src={shop.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BuildingStorefront className="text-ui-fg-muted size-3" />
                        </div>
                      )}
                    </div>
                    <Text size="small" weight="plus">{shop.name}</Text>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Badge size="2xsmall" color={getStatusColor(shop.status)}>
                      {shop.status}
                    </Badge>
                    <Text size="small" className="text-ui-fg-muted">
                      {new Date(shop.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Marketplace",
  icon: BuildingStorefront,
})

export default MarketplaceDashboard
