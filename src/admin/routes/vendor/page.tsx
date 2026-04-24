import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Text,
  toast,
  FocusModal,
  Input,
  Label,
  Select,
  Skeleton,
  Tabs,
  DataTable,
  DataTablePaginationState,
  createDataTableColumnHelper,
  useDataTable,
  Badge,
} from "@medusajs/ui"
import {
  BuildingStorefront,
  ShoppingBag,
  MapPin,
  ArchiveBox,
  ReceiptPercent,
  Plus,
  Trash,
} from "@medusajs/icons"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import "../../global.css"

interface VendorMe {
  admin: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    is_owner: boolean
    status: string
  }
  shop: {
    id: string
    name: string
    handle: string
    description: string | null
    logo: string | null
    banner: string | null
    status: string
    commission_rate: number
  } | null
}

interface ShopProductLink {
  id: string
  shop_id: string
  product_id: string
  is_owner: boolean
  status: string
  commission_rate: number | null
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    status: string
  }
}

interface ShopOrderLink {
  id: string
  shop_id: string
  order_id: string
  payout_status: string
  payout_amount: number | null
  commission_amount: number | null
  order: {
    id: string
    display_id: string
    total: number
    currency_code: string
    status: string
  }
}

interface ShopWarehouseLink {
  id: string
  shop_id: string
  stock_location_id: string
  is_default: boolean
  display_name: string | null
  stock_location: {
    id: string
    name: string
  }
}

interface MallShopLink {
  id: string
  mall_id: string
  shop_id: string
  floor: string | null
  unit_number: string | null
  is_anchor: boolean
  mall: {
    id: string
    name: string
    status: string
  }
}

interface Product {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
}

const getPayoutBadgeClass = (status: string) => {
  switch (status) {
    case "paid": return "bg-ui-tag-green-bg text-ui-tag-green-text"
    case "processing": return "bg-ui-tag-blue-bg text-ui-tag-blue-text"
    case "pending": return "bg-ui-tag-orange-bg text-ui-tag-orange-text"
    case "failed": return "bg-ui-tag-red-bg text-ui-tag-red-text"
    default: return "bg-ui-bg-subtle text-ui-fg-subtle"
  }
}

const VendorDashboard = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("overview")

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<VendorMe>("/admin/vendor/me")
      return response
    },
    queryKey: ["vendor-me"],
  })

  const shop = data?.shop

  if (isLoading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center p-8">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </Container>
    )
  }

  if (!shop) {
    return (
      <Container className="p-6">
        <Text>No shop associated with this vendor account.</Text>
      </Container>
    )
  }

  const isSuspended = shop.status === "suspended"

  return (
    <Container className="divide-y p-0">
      {isSuspended && (
        <div className="bg-ui-tag-red-bg px-6 py-3">
          <Text size="small" weight="plus" className="text-ui-tag-red-text">
            Your shop is currently suspended. Contact the platform admin for more information.
          </Text>
        </div>
      )}

      <div className="px-6 py-4">
        <div className="flex items-center gap-x-4">
          <div className="size-16 overflow-hidden rounded-lg bg-ui-bg-subtle shadow-elevation-card-rest">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BuildingStorefront className="text-ui-fg-muted size-8" />
              </div>
            )}
          </div>
          <div>
            <Heading level="h1">{shop.name}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {shop.handle} · Commission: {(shop.commission_rate * 100).toFixed(0)}%
            </Text>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="products"><ShoppingBag className="mr-2 size-4" />Products</Tabs.Trigger>
            <Tabs.Trigger value="orders"><ReceiptPercent className="mr-2 size-4" />Orders</Tabs.Trigger>
            <Tabs.Trigger value="payouts"><ReceiptPercent className="mr-2 size-4" />Payouts</Tabs.Trigger>
            <Tabs.Trigger value="warehouses"><ArchiveBox className="mr-2 size-4" />Warehouses</Tabs.Trigger>
            <Tabs.Trigger value="malls"><MapPin className="mr-2 size-4" />Malls</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text size="small" weight="plus" className="mb-2">Shop Name</Text>
                <Text size="small" className="text-ui-fg-subtle">{shop.name}</Text>
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-2">Handle</Text>
                <Text size="small" className="text-ui-fg-subtle">{shop.handle}</Text>
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-2">Description</Text>
                <Text size="small" className="text-ui-fg-subtle">{shop.description || "No description"}</Text>
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-2">Status</Text>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  shop.status === "active" ? "bg-ui-tag-green-bg text-ui-tag-green-text" :
                  shop.status === "suspended" ? "bg-ui-tag-red-bg text-ui-tag-red-text" :
                  "bg-ui-tag-orange-bg text-ui-tag-orange-text"
                }`}>
                  {shop.status}
                </span>
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-2">Commission Rate</Text>
                <Text size="small" className="text-ui-fg-subtle">{(shop.commission_rate * 100).toFixed(0)}%</Text>
              </div>
              <div>
                <Text size="small" weight="plus" className="mb-2">Admin Email</Text>
                <Text size="small" className="text-ui-fg-subtle">{data?.admin?.email}</Text>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="products" className="pt-4">
            <VendorProductsTab />
          </Tabs.Content>
          <Tabs.Content value="orders" className="pt-4">
            <VendorOrdersTab />
          </Tabs.Content>
          <Tabs.Content value="payouts" className="pt-4">
            <VendorPayoutsTab />
          </Tabs.Content>
          <Tabs.Content value="warehouses" className="pt-4">
            <VendorWarehousesTab />
          </Tabs.Content>
          <Tabs.Content value="malls" className="pt-4">
            <VendorMallsTab />
          </Tabs.Content>
          <Tabs.Content value="settings" className="pt-4">
            <VendorSettingsTab shop={shop} />
          </Tabs.Content>
        </Tabs>
      </div>
    </Container>
  )
}

function VendorProductsTab() {
  const queryClient = useQueryClient()
  const [linkOpen, setLinkOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ products: ShopProductLink[] }>("/admin/vendor/products")
      return response
    },
    queryKey: ["vendor-products"],
  })

  const unlinkProduct = useMutation({
    mutationFn: async (productId: string) => {
      return sdk.client.fetch(`/admin/vendor/products/${productId}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] })
      toast.success("Product unlinked")
    },
    onError: (error: any) => toast.error(error.message || "Failed to unlink product"),
  })

  const colHelper = createDataTableColumnHelper<ShopProductLink>()
  const columns = useMemo(() => [
    colHelper.accessor("product.title", {
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <div className="size-8 overflow-hidden rounded bg-ui-bg-subtle">
            {row.original.product.thumbnail ? (
              <img src={row.original.product.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="text-ui-fg-muted size-4" />
              </div>
            )}
          </div>
          <Text size="small" weight="plus">{row.original.product.title}</Text>
        </div>
      ),
    }),
    colHelper.accessor("is_owner", {
      header: "Owner",
      cell: ({ getValue }) => getValue() ? <Badge size="2xsmall" color="blue">Owner</Badge> : <Text size="small" className="text-ui-fg-subtle">—</Text>,
    }),
    colHelper.accessor("commission_rate", {
      header: "Commission",
      cell: ({ getValue }) => (
        <Text size="small" className="text-ui-fg-subtle">
          {getValue() != null ? `${(getValue()! * 100).toFixed(0)}%` : "—"}
        </Text>
      ),
    }),
    colHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="danger" onClick={() => unlinkProduct.mutate(row.original.product_id)}>
          <Trash className="text-ui-fg-on-color" />
        </Button>
      ),
    }),
  ], [unlinkProduct])

  const table = useDataTable({
    data: data?.products ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.products?.length ?? 0,
    isLoading,
  })

  return (
    <>
      <DataTable instance={table}><DataTable.Table /></DataTable>
    </>
  )
}

function VendorOrdersTab() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ orders: ShopOrderLink[] }>("/admin/vendor/orders")
      return response
    },
    queryKey: ["vendor-orders"],
  })

  const colHelper = createDataTableColumnHelper<ShopOrderLink>()
  const columns = useMemo(() => [
    colHelper.accessor("order.display_id", {
      header: "Order",
      cell: ({ getValue }) => <Text size="small" weight="plus">#{getValue()}</Text>,
    }),
    colHelper.accessor("payout_status", {
      header: "Payout Status",
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPayoutBadgeClass(getValue() ?? "")}`}>
          {getValue() ?? "—"}
        </span>
      ),
    }),
    colHelper.accessor("payout_amount", {
      header: "Payout",
      cell: ({ getValue }) => (
        <Text size="small" className="text-ui-fg-subtle">
          {getValue() != null ? Number(getValue()).toFixed(2) : "—"}
        </Text>
      ),
    }),
    colHelper.accessor("commission_amount", {
      header: "Commission",
      cell: ({ getValue }) => (
        <Text size="small" className="text-ui-fg-subtle">
          {getValue() != null ? Number(getValue()).toFixed(2) : "—"}
        </Text>
      ),
    }),
  ], [])

  const table = useDataTable({
    data: data?.orders ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.orders?.length ?? 0,
    isLoading,
  })

  return <DataTable instance={table}><DataTable.Table /></DataTable>
}

function VendorPayoutsTab() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ payouts: ShopOrderLink[] }>("/admin/vendor/payouts")
      return response
    },
    queryKey: ["vendor-payouts"],
  })

  const colHelper = createDataTableColumnHelper<ShopOrderLink>()
  const columns = useMemo(() => [
    colHelper.accessor("order.display_id", {
      header: "Order",
      cell: ({ getValue }) => <Text size="small" weight="plus">#{getValue()}</Text>,
    }),
    colHelper.accessor("payout_status", {
      header: "Status",
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPayoutBadgeClass(getValue() ?? "")}`}>
          {getValue() ?? "—"}
        </span>
      ),
    }),
    colHelper.accessor("payout_amount", {
      header: "Payout Amount",
      cell: ({ getValue }) => (
        <Text size="small" className="text-ui-fg-subtle">
          {getValue() != null ? Number(getValue()).toFixed(2) : "—"}
        </Text>
      ),
    }),
    colHelper.accessor("commission_amount", {
      header: "Commission",
      cell: ({ getValue }) => (
        <Text size="small" className="text-ui-fg-subtle">
          {getValue() != null ? Number(getValue()).toFixed(2) : "—"}
        </Text>
      ),
    }),
  ], [])

  const table = useDataTable({
    data: data?.payouts ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.payouts?.length ?? 0,
    isLoading,
  })

  return <DataTable instance={table}><DataTable.Table /></DataTable>
}

function VendorWarehousesTab() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ warehouses: ShopWarehouseLink[] }>("/admin/vendor/warehouses")
      return response
    },
    queryKey: ["vendor-warehouses"],
  })

  const colHelper = createDataTableColumnHelper<ShopWarehouseLink>()
  const columns = useMemo(() => [
    colHelper.accessor("stock_location.name", {
      header: "Warehouse",
      cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text>,
    }),
    colHelper.accessor("display_name", {
      header: "Display Name",
      cell: ({ getValue }) => <Text size="small" className="text-ui-fg-subtle">{getValue() || "—"}</Text>,
    }),
    colHelper.accessor("is_default", {
      header: "Default",
      cell: ({ getValue }) => getValue() ? <Badge size="2xsmall" color="blue">Default</Badge> : <Text size="small" className="text-ui-fg-subtle">—</Text>,
    }),
  ], [])

  const table = useDataTable({
    data: data?.warehouses ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.warehouses?.length ?? 0,
    isLoading,
  })

  return <DataTable instance={table}><DataTable.Table /></DataTable>
}

function VendorMallsTab() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ malls: MallShopLink[] }>("/admin/vendor/malls")
      return response
    },
    queryKey: ["vendor-malls"],
  })

  const colHelper = createDataTableColumnHelper<MallShopLink>()
  const columns = useMemo(() => [
    colHelper.accessor("mall.name", {
      header: "Mall",
      cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text>,
    }),
    colHelper.accessor("floor", {
      header: "Floor",
      cell: ({ getValue }) => <Text size="small" className="text-ui-fg-subtle">{getValue() || "—"}</Text>,
    }),
    colHelper.accessor("unit_number", {
      header: "Unit",
      cell: ({ getValue }) => <Text size="small" className="text-ui-fg-subtle">{getValue() || "—"}</Text>,
    }),
    colHelper.accessor("is_anchor", {
      header: "Anchor",
      cell: ({ getValue }) => getValue() ? <Badge size="2xsmall" color="blue">Anchor</Badge> : <Text size="small" className="text-ui-fg-subtle">—</Text>,
    }),
  ], [])

  const table = useDataTable({
    data: data?.malls ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.malls?.length ?? 0,
    isLoading,
  })

  return <DataTable instance={table}><DataTable.Table /></DataTable>
}

function VendorSettingsTab({ shop }: { shop: NonNullable<VendorMe["shop"]> }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    description: shop.description ?? "",
    logo: shop.logo ?? "",
    banner: shop.banner ?? "",
  })

  const updateProfile = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      return sdk.client.fetch("/admin/vendor/profile", {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-me"] })
      toast.success("Profile updated")
    },
    onError: (error: any) => toast.error(error.message || "Failed to update profile"),
  })

  return (
    <div className="max-w-lg">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Shop description" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Logo URL</Label>
          <Input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="https://example.com/logo.png" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Banner URL</Label>
          <Input value={form.banner} onChange={(e) => setForm((p) => ({ ...p, banner: e.target.value }))} placeholder="https://example.com/banner.png" />
        </div>
        <Button
          size="small"
          isLoading={updateProfile.isPending}
          onClick={() => {
            const data: Record<string, string> = {}
            if (form.description !== (shop.description ?? "")) data.description = form.description
            if (form.logo !== (shop.logo ?? "")) data.logo = form.logo
            if (form.banner !== (shop.banner ?? "")) data.banner = form.banner
            if (Object.keys(data).length > 0) updateProfile.mutate(data)
          }}
        >
          Save Changes
        </Button>
        <div className="mt-4 border-t pt-4">
          <Text size="small" weight="plus" className="mb-2">Read-only settings</Text>
          <div className="flex flex-col gap-y-2">
            <Text size="small" className="text-ui-fg-subtle">Name: {shop.name}</Text>
            <Text size="small" className="text-ui-fg-subtle">Handle: {shop.handle}</Text>
            <Text size="small" className="text-ui-fg-subtle">Status: {shop.status}</Text>
            <Text size="small" className="text-ui-fg-subtle">Commission: {(shop.commission_rate * 100).toFixed(0)}%</Text>
          </div>
          <Text size="small" className="text-ui-fg-muted mt-2">
            Contact a platform admin to change these settings.
          </Text>
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "My Shop",
  icon: BuildingStorefront,
})

export default VendorDashboard
