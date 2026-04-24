import {
  Container,
  Heading,
  Button,
  Text,
  toast,
  Drawer,
  Input,
  Label,
  Select,
  Skeleton,
  Tabs,
  FocusModal,
  DataTable,
  DataTablePaginationState,
  createDataTableColumnHelper,
  useDataTable,
  Badge,
  Switch,
} from "@medusajs/ui"
import {
  BuildingStorefront,
  PencilSquare,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Users,
  ArchiveBox,
  ReceiptPercent,
  Plus,
  Trash,
} from "@medusajs/icons"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { useNavigate, useParams } from "react-router-dom"

interface Shop {
  id: string
  name: string
  handle: string
  description?: string
  logo?: string
  banner?: string
  status: "pending" | "active" | "suspended"
  commission_rate: number
  created_at: string
  updated_at: string
}

interface MallShop {
  id: string
  mall_id: string
  shop_id: string
  floor: string | null
  unit_number: string | null
  is_anchor: boolean
  status: string
  mall: {
    id: string
    name: string
    handle: string
    status: string
  }
}

interface ShopAdmin {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  is_owner: boolean
  status: string
  shop_id: string
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

interface ShopWarehouseLink {
  id: string
  shop_id: string
  stock_location_id: string
  is_default: boolean
  display_name: string | null
  stock_location: {
    id: string
    name: string
    address: any
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

interface Product {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
}

interface StockLocation {
  id: string
  name: string
  address: any
}

interface Mall {
  id: string
  name: string
  handle: string
  status: string
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-ui-tag-green-bg text-ui-tag-green-text"
    case "pending":
      return "bg-ui-tag-orange-bg text-ui-tag-orange-text"
    case "suspended":
    case "inactive":
      return "bg-ui-tag-red-bg text-ui-tag-red-text"
    default:
      return "bg-ui-bg-subtle text-ui-fg-subtle"
  }
}

const getPayoutBadgeClass = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-ui-tag-green-bg text-ui-tag-green-text"
    case "processing":
      return "bg-ui-tag-blue-bg text-ui-tag-blue-text"
    case "pending":
      return "bg-ui-tag-orange-bg text-ui-tag-orange-text"
    case "failed":
      return "bg-ui-tag-red-bg text-ui-tag-red-text"
    default:
      return "bg-ui-bg-subtle text-ui-fg-subtle"
  }
}

const ShopDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ shop: Shop }>(`/admin/shops/${id}`)
      return response
    },
    queryKey: ["shop", id],
    enabled: !!id,
  })

  const shop = data?.shop

  const updateShop = useMutation({
    mutationFn: async (data: Partial<Shop>) => {
      return sdk.client.fetch<{ shop: Shop }>(`/admin/shops/${id}`, {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop", id] })
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Shop updated successfully")
      setEditOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update shop")
    },
  })

  const [formData, setFormData] = useState<Partial<Shop>>({})

  const handleEditOpen = () => {
    if (shop) {
      setFormData({
        name: shop.name,
        handle: shop.handle,
        description: shop.description,
        logo: shop.logo,
        banner: shop.banner,
        status: shop.status,
        commission_rate: shop.commission_rate,
      })
      setEditOpen(true)
    }
  }

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
        <Text>Shop not found</Text>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="transparent" onClick={() => navigate("/shops")}>
            <ArrowLeft className="text-ui-fg-subtle" />
          </Button>
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">Shops</Text>
            <Text size="small" className="text-ui-fg-muted">/</Text>
            <Text size="small" weight="plus">{shop.name}</Text>
          </div>
        </div>
        <Button size="small" variant="secondary" onClick={handleEditOpen}>
          <PencilSquare className="text-ui-fg-subtle" />
          <span className="ml-2">Edit</span>
        </Button>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
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
              <div className="flex items-center gap-x-2 mb-1">
                <Heading level="h1">{shop.name}</Heading>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(shop.status)}`}>
                  {shop.status}
                </span>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {shop.handle} · Commission: {(shop.commission_rate * 100).toFixed(0)}%
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="products"><ShoppingBag className="mr-2 size-4" />Products</Tabs.Trigger>
            <Tabs.Trigger value="malls"><MapPin className="mr-2 size-4" />Malls</Tabs.Trigger>
            <Tabs.Trigger value="admins"><Users className="mr-2 size-4" />Admins</Tabs.Trigger>
            <Tabs.Trigger value="warehouses"><ArchiveBox className="mr-2 size-4" />Warehouses</Tabs.Trigger>
            <Tabs.Trigger value="payouts"><ReceiptPercent className="mr-2 size-4" />Payouts</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="products" className="pt-4">
            <ProductsTab shopId={id!} />
          </Tabs.Content>
          <Tabs.Content value="malls" className="pt-4">
            <MallsTab shopId={id!} />
          </Tabs.Content>
          <Tabs.Content value="admins" className="pt-4">
            <AdminsTab shopId={id!} />
          </Tabs.Content>
          <Tabs.Content value="warehouses" className="pt-4">
            <WarehousesTab shopId={id!} />
          </Tabs.Content>
          <Tabs.Content value="payouts" className="pt-4">
            <PayoutsTab shopId={id!} />
          </Tabs.Content>
        </Tabs>
      </div>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Shop</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label>Name</Label>
                <Input value={formData.name || ""} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Handle</Label>
                <Input value={formData.handle || ""} onChange={(e) => setFormData((prev) => ({ ...prev, handle: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Description</Label>
                <Input value={formData.description || ""} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Logo URL</Label>
                <Input value={formData.logo || ""} onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Banner URL</Label>
                <Input value={formData.banner || ""} onChange={(e) => setFormData((prev) => ({ ...prev, banner: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Commission Rate</Label>
                <div className="flex items-center gap-x-2">
                  <Input type="number" step="0.01" min="0" max="1" value={formData.commission_rate ?? 0.1} onChange={(e) => setFormData((prev) => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))} className="w-32" />
                  <Text size="small" className="text-ui-fg-subtle">{((formData.commission_rate ?? 0.1) * 100).toFixed(0)}%</Text>
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Status</Label>
                <Select value={formData.status || shop.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}>
                  <Select.Trigger><Select.Value placeholder="Select status" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="pending">Pending</Select.Item>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="suspended">Suspended</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild><Button size="small" variant="secondary">Cancel</Button></Drawer.Close>
              <Button size="small" onClick={() => updateShop.mutate(formData)} isLoading={updateShop.isPending}>Save</Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

function ProductsTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const [linkOpen, setLinkOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 })
  const [selectedProductId, setSelectedProductId] = useState("")
  const [linkCommission, setLinkCommission] = useState(0.1)

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ products: ShopProductLink[] }>(`/admin/shops/${shopId}/products`)
      return response
    },
    queryKey: ["shop-products", shopId],
  })

  const unlinkProduct = useMutation({
    mutationFn: async (productId: string) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/products/${productId}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] })
      toast.success("Product unlinked")
    },
    onError: (error: any) => toast.error(error.message || "Failed to unlink product"),
  })

  const linkProduct = useMutation({
    mutationFn: async (data: { product_id: string; is_owner: boolean; commission_rate: number }) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/products`, { method: "POST", body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] })
      toast.success("Product linked")
      setLinkOpen(false)
      setSelectedProductId("")
    },
    onError: (error: any) => toast.error(error.message || "Failed to link product"),
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * limit

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ products: { id: string; title: string; handle: string; thumbnail: string | null; status: string }[]; count: number }>(
        "/admin/products",
        { query: { limit, offset, q: searchValue || undefined } }
      )
      return response
    },
    queryKey: ["all-products", limit, offset, searchValue],
    enabled: linkOpen,
  })

  const colHelper = createDataTableColumnHelper<ShopProductLink>()
  const productSelectHelper = createDataTableColumnHelper<Product>()

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
    colHelper.accessor("status", {
      header: "Link Status",
      cell: ({ getValue }) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(getValue())}`}>
          {getValue()}
        </span>
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

  const selectColumns = useMemo(() => [
    productSelectHelper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <div className="size-8 overflow-hidden rounded bg-ui-bg-subtle">
            {row.original.thumbnail ? (
              <img src={row.original.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="text-ui-fg-muted size-4" />
              </div>
            )}
          </div>
          <Text size="small" weight="plus">{row.original.title}</Text>
        </div>
      ),
    }),
    productSelectHelper.display({
      id: "select",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="secondary" onClick={() => setSelectedProductId(row.original.id)}>Select</Button>
      ),
    }),
  ], [])

  const selectTable = useDataTable({
    data: productsData?.products ?? [],
    columns: selectColumns,
    getRowId: (row) => row.id,
    rowCount: productsData?.count ?? 0,
    isLoading: productsLoading,
    search: { state: searchValue, onSearchChange: setSearchValue },
    pagination: { state: pagination, onPaginationChange: setPagination },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Text size="small" weight="plus">Linked Products</Text>
        <Button size="small" onClick={() => setLinkOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Link Product</span>
        </Button>
      </div>
      <DataTable instance={table}><DataTable.Table /></DataTable>

      <FocusModal open={linkOpen} onOpenChange={setLinkOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild><Button size="small" variant="secondary" disabled={linkProduct.isPending}>Cancel</Button></FocusModal.Close>
                <Button size="small" disabled={!selectedProductId} isLoading={linkProduct.isPending} onClick={() => linkProduct.mutate({ product_id: selectedProductId, is_owner: true, commission_rate: linkCommission })}>Link Product</Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-4xl px-6 py-6">
                <Heading level="h1" className="mb-6">Link Product</Heading>
                {!selectedProductId ? (
                  <DataTable instance={selectTable}>
                    <DataTable.Toolbar><DataTable.Search placeholder="Search products..." /></DataTable.Toolbar>
                    <DataTable.Table />
                    <DataTable.Pagination />
                  </DataTable>
                ) : (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex items-center justify-between">
                      <Text size="small" weight="plus">Product selected</Text>
                      <Button size="small" variant="transparent" onClick={() => setSelectedProductId("")}>Change</Button>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Commission Rate</Label>
                      <div className="flex items-center gap-x-2">
                        <Input type="number" step="0.01" min="0" max="1" value={linkCommission} onChange={(e) => setLinkCommission(parseFloat(e.target.value) || 0)} className="w-32" />
                        <Text size="small" className="text-ui-fg-subtle">{(linkCommission * 100).toFixed(0)}%</Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}

function MallsTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const [linkOpen, setLinkOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 })
  const [selectedMallId, setSelectedMallId] = useState("")
  const [linkFloor, setLinkFloor] = useState("")
  const [linkUnit, setLinkUnit] = useState("")
  const [linkAnchor, setLinkAnchor] = useState(false)

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ mall_shops: MallShop[] }>(`/admin/shops/${shopId}/malls`)
      return response
    },
    queryKey: ["shop-malls", shopId],
  })

  const unlinkMall = useMutation({
    mutationFn: async (mallId: string) => {
      return sdk.client.fetch(`/admin/malls/${mallId}/shops/${shopId}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-malls", shopId] })
      toast.success("Removed from mall")
    },
    onError: (error: any) => toast.error(error.message || "Failed to remove from mall"),
  })

  const linkMall = useMutation({
    mutationFn: async (data: { shop_id: string; floor?: string; unit_number?: string; is_anchor?: boolean }) => {
      return sdk.client.fetch(`/admin/malls/${selectedMallId}/shops`, { method: "POST", body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-malls", shopId] })
      toast.success("Added to mall")
      setLinkOpen(false)
      setSelectedMallId("")
      setLinkFloor("")
      setLinkUnit("")
      setLinkAnchor(false)
    },
    onError: (error: any) => toast.error(error.message || "Failed to add to mall"),
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * limit

  const { data: mallsData, isLoading: mallsLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ malls: Mall[]; count: number }>(
        "/admin/malls",
        { query: { limit, offset, q: searchValue || undefined } }
      )
      return response
    },
    queryKey: ["malls-select", limit, offset, searchValue],
    enabled: linkOpen,
  })

  const colHelper = createDataTableColumnHelper<MallShop>()
  const mallSelectHelper = createDataTableColumnHelper<Mall>()

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
    colHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="danger" onClick={() => unlinkMall.mutate(row.original.mall_id)}>
          <Trash className="text-ui-fg-on-color" />
        </Button>
      ),
    }),
  ], [unlinkMall])

  const table = useDataTable({
    data: data?.mall_shops ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.mall_shops?.length ?? 0,
    isLoading,
  })

  const selectColumns = useMemo(() => [
    mallSelectHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text>,
    }),
    mallSelectHelper.display({
      id: "select",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="secondary" onClick={() => setSelectedMallId(row.original.id)}>Select</Button>
      ),
    }),
  ], [])

  const selectTable = useDataTable({
    data: mallsData?.malls ?? [],
    columns: selectColumns,
    getRowId: (row) => row.id,
    rowCount: mallsData?.count ?? 0,
    isLoading: mallsLoading,
    search: { state: searchValue, onSearchChange: setSearchValue },
    pagination: { state: pagination, onPaginationChange: setPagination },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Text size="small" weight="plus">Mall Locations</Text>
        <Button size="small" onClick={() => setLinkOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Add to Mall</span>
        </Button>
      </div>
      <DataTable instance={table}><DataTable.Table /></DataTable>

      <FocusModal open={linkOpen} onOpenChange={setLinkOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild><Button size="small" variant="secondary" disabled={linkMall.isPending}>Cancel</Button></FocusModal.Close>
                <Button size="small" disabled={!selectedMallId} isLoading={linkMall.isPending} onClick={() => linkMall.mutate({ shop_id: shopId, floor: linkFloor || undefined, unit_number: linkUnit || undefined, is_anchor: linkAnchor })}>Add to Mall</Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-4xl px-6 py-6">
                <Heading level="h1" className="mb-6">Add to Mall</Heading>
                {!selectedMallId ? (
                  <DataTable instance={selectTable}>
                    <DataTable.Toolbar><DataTable.Search placeholder="Search malls..." /></DataTable.Toolbar>
                    <DataTable.Table />
                    <DataTable.Pagination />
                  </DataTable>
                ) : (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex items-center justify-between">
                      <Text size="small" weight="plus">Mall selected</Text>
                      <Button size="small" variant="transparent" onClick={() => setSelectedMallId("")}>Change</Button>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Floor</Label>
                      <Input value={linkFloor} onChange={(e) => setLinkFloor(e.target.value)} placeholder="e.g., 2nd Floor" />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Unit Number</Label>
                      <Input value={linkUnit} onChange={(e) => setLinkUnit(e.target.value)} placeholder="e.g., G-12" />
                    </div>
                    <div className="flex items-center gap-x-2">
                      <input type="checkbox" id="link-anchor" checked={linkAnchor} onChange={(e) => setLinkAnchor(e.target.checked)} className="accent-ui-fg-interactive" />
                      <Label htmlFor="link-anchor">Anchor Tenant</Label>
                    </div>
                  </div>
                )}
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}

function AdminsTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ email: "", first_name: "", last_name: "", is_owner: false })

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ admins: ShopAdmin[] }>(`/admin/shops/${shopId}/admins`)
      return response
    },
    queryKey: ["shop-admins", shopId],
  })

  const createAdmin = useMutation({
    mutationFn: async (data: { email: string; first_name?: string; last_name?: string; is_owner?: boolean }) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/admins`, { method: "POST", body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-admins", shopId] })
      toast.success("Admin added")
      setAddOpen(false)
      setAddForm({ email: "", first_name: "", last_name: "", is_owner: false })
    },
    onError: (error: any) => toast.error(error.message || "Failed to add admin"),
  })

  const deleteAdmin = useMutation({
    mutationFn: async (adminId: string) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/admins/${adminId}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-admins", shopId] })
      toast.success("Admin removed")
    },
    onError: (error: any) => toast.error(error.message || "Failed to remove admin"),
  })

  const updateAdmin = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/admins/${data.id}`, { method: "POST", body: { status: data.status } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-admins", shopId] })
      toast.success("Admin updated")
    },
    onError: (error: any) => toast.error(error.message || "Failed to update admin"),
  })

  const inviteVendor = useMutation({
    mutationFn: async (adminId: string) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/admins/${adminId}/invite`, { method: "POST" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-admins", shopId] })
      toast.success("Vendor invited. They can now log in as a vendor.")
    },
    onError: (error: any) => toast.error(error.message || "Failed to invite vendor"),
  })

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Text size="small" weight="plus">Shop Admins</Text>
        <Button size="small" onClick={() => setAddOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Add Admin</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-y-2">
          {(data?.admins ?? []).map((admin) => (
            <div key={admin.id} className="flex items-center justify-between rounded-md border px-4 py-3">
              <div className="flex items-center gap-x-3">
                <div>
                  <Text size="small" weight="plus">
                    {admin.first_name || admin.last_name ? `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim() : admin.email}
                  </Text>
                  {(admin.first_name || admin.last_name) && (
                    <Text size="small" className="text-ui-fg-subtle">{admin.email}</Text>
                  )}
                </div>
                {admin.is_owner && <Badge size="2xsmall" color="blue">Owner</Badge>}
              </div>
              <div className="flex items-center gap-x-2">
                <Select
                  value={admin.status}
                  onValueChange={(value) => updateAdmin.mutate({ id: admin.id, status: value })}
                >
                  <Select.Trigger className="h-7 text-xs">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="pending">Pending</Select.Item>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="inactive">Inactive</Select.Item>
                  </Select.Content>
                </Select>
                {admin.status === "pending" && (
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={inviteVendor.isPending}
                    onClick={() => inviteVendor.mutate(admin.id)}
                  >
                    Send Invite
                  </Button>
                )}
                <Button size="small" variant="danger" onClick={() => deleteAdmin.mutate(admin.id)}>
                  <Trash className="text-ui-fg-on-color" />
                </Button>
              </div>
            </div>
          ))}
          {!data?.admins?.length && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="text-ui-fg-muted mb-3 size-8" />
              <Text size="small" className="text-ui-fg-subtle">No admins yet</Text>
            </div>
          )}
        </div>
      )}

      <FocusModal open={addOpen} onOpenChange={setAddOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild><Button size="small" variant="secondary" disabled={createAdmin.isPending}>Cancel</Button></FocusModal.Close>
                <Button size="small" disabled={!addForm.email} isLoading={createAdmin.isPending} onClick={() => createAdmin.mutate({ email: addForm.email, first_name: addForm.first_name || undefined, last_name: addForm.last_name || undefined, is_owner: addForm.is_owner })}>Add Admin</Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-lg px-6 py-6">
                <Heading level="h1" className="mb-6">Add Shop Admin</Heading>
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-2">
                    <Label>Email <span className="text-ui-fg-error">*</span></Label>
                    <Input type="email" value={addForm.email} onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="admin@shop.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-y-2">
                      <Label>First Name</Label>
                      <Input value={addForm.first_name} onChange={(e) => setAddForm((prev) => ({ ...prev, first_name: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Last Name</Label>
                      <Input value={addForm.last_name} onChange={(e) => setAddForm((prev) => ({ ...prev, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <input type="checkbox" id="admin-owner" checked={addForm.is_owner} onChange={(e) => setAddForm((prev) => ({ ...prev, is_owner: e.target.checked }))} className="accent-ui-fg-interactive" />
                    <Label htmlFor="admin-owner">Shop Owner</Label>
                  </div>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}

function WarehousesTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const [linkOpen, setLinkOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 })
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [linkIsDefault, setLinkIsDefault] = useState(false)
  const [linkDisplayName, setLinkDisplayName] = useState("")

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ warehouses: ShopWarehouseLink[] }>(`/admin/shops/${shopId}/warehouses`)
      return response
    },
    queryKey: ["shop-warehouses", shopId],
  })

  const unlinkWarehouse = useMutation({
    mutationFn: async (locationId: string) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/warehouses/${locationId}`, { method: "DELETE" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-warehouses", shopId] })
      toast.success("Warehouse unlinked")
    },
    onError: (error: any) => toast.error(error.message || "Failed to unlink warehouse"),
  })

  const linkWarehouse = useMutation({
    mutationFn: async (data: { stock_location_id: string; is_default?: boolean; display_name?: string }) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/warehouses`, { method: "POST", body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-warehouses", shopId] })
      toast.success("Warehouse linked")
      setLinkOpen(false)
      setSelectedLocationId("")
      setLinkIsDefault(false)
      setLinkDisplayName("")
    },
    onError: (error: any) => toast.error(error.message || "Failed to link warehouse"),
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * limit

  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ stock_locations: StockLocation[]; count: number }>(
        "/admin/stock-locations",
        { query: { limit, offset, q: searchValue || undefined } }
      )
      return response
    },
    queryKey: ["stock-locations-select", limit, offset, searchValue],
    enabled: linkOpen,
  })

  const colHelper = createDataTableColumnHelper<ShopWarehouseLink>()
  const locSelectHelper = createDataTableColumnHelper<StockLocation>()

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
    colHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="danger" onClick={() => unlinkWarehouse.mutate(row.original.stock_location_id)}>
          <Trash className="text-ui-fg-on-color" />
        </Button>
      ),
    }),
  ], [unlinkWarehouse])

  const table = useDataTable({
    data: data?.warehouses ?? [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.warehouses?.length ?? 0,
    isLoading,
  })

  const selectColumns = useMemo(() => [
    locSelectHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => <Text size="small" weight="plus">{getValue()}</Text>,
    }),
    locSelectHelper.display({
      id: "select",
      header: "",
      cell: ({ row }) => (
        <Button size="small" variant="secondary" onClick={() => setSelectedLocationId(row.original.id)}>Select</Button>
      ),
    }),
  ], [])

  const selectTable = useDataTable({
    data: locationsData?.stock_locations ?? [],
    columns: selectColumns,
    getRowId: (row) => row.id,
    rowCount: locationsData?.count ?? 0,
    isLoading: locationsLoading,
    search: { state: searchValue, onSearchChange: setSearchValue },
    pagination: { state: pagination, onPaginationChange: setPagination },
  })

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Text size="small" weight="plus">Warehouses</Text>
        <Button size="small" onClick={() => setLinkOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Link Warehouse</span>
        </Button>
      </div>
      <DataTable instance={table}><DataTable.Table /></DataTable>

      <FocusModal open={linkOpen} onOpenChange={setLinkOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild><Button size="small" variant="secondary" disabled={linkWarehouse.isPending}>Cancel</Button></FocusModal.Close>
                <Button size="small" disabled={!selectedLocationId} isLoading={linkWarehouse.isPending} onClick={() => linkWarehouse.mutate({ stock_location_id: selectedLocationId, is_default: linkIsDefault, display_name: linkDisplayName || undefined })}>Link Warehouse</Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-4xl px-6 py-6">
                <Heading level="h1" className="mb-6">Link Warehouse</Heading>
                {!selectedLocationId ? (
                  <DataTable instance={selectTable}>
                    <DataTable.Toolbar><DataTable.Search placeholder="Search warehouses..." /></DataTable.Toolbar>
                    <DataTable.Table />
                    <DataTable.Pagination />
                  </DataTable>
                ) : (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex items-center justify-between">
                      <Text size="small" weight="plus">Warehouse selected</Text>
                      <Button size="small" variant="transparent" onClick={() => setSelectedLocationId("")}>Change</Button>
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Display Name</Label>
                      <Input value={linkDisplayName} onChange={(e) => setLinkDisplayName(e.target.value)} placeholder="e.g., Main Warehouse" />
                    </div>
                    <div className="flex items-center gap-x-2">
                      <input type="checkbox" id="link-default" checked={linkIsDefault} onChange={(e) => setLinkIsDefault(e.target.checked)} className="accent-ui-fg-interactive" />
                      <Label htmlFor="link-default">Default Warehouse</Label>
                    </div>
                  </div>
                )}
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}

function PayoutsTab({ shopId }: { shopId: string }) {
  const queryClient = useQueryClient()
  const [payoutDrawerOpen, setPayoutDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ShopOrderLink | null>(null)
  const [payoutStatus, setPayoutStatus] = useState("")

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ orders: ShopOrderLink[] }>(`/admin/shops/${shopId}/orders`)
      return response
    },
    queryKey: ["shop-orders", shopId],
  })

  const updatePayout = useMutation({
    mutationFn: async (data: { order_id: string; payout_status: string }) => {
      return sdk.client.fetch(`/admin/shops/${shopId}/orders/${data.order_id}/payout`, { method: "POST", body: { payout_status: data.payout_status } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders", shopId] })
      toast.success("Payout status updated")
      setPayoutDrawerOpen(false)
      setSelectedOrder(null)
    },
    onError: (error: any) => toast.error(error.message || "Failed to update payout"),
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
    colHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setSelectedOrder(row.original)
            setPayoutStatus(row.original.payout_status ?? "pending")
            setPayoutDrawerOpen(true)
          }}
        >
          Update
        </Button>
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Text size="small" weight="plus">Order Payouts</Text>
      </div>
      <DataTable instance={table}><DataTable.Table /></DataTable>

      <Drawer open={payoutDrawerOpen} onOpenChange={setPayoutDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Update Payout Status</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-auto p-4">
            {selectedOrder && (
              <div className="flex flex-col gap-y-4">
                <div>
                  <Text size="small" weight="plus" className="mb-1">Order</Text>
                  <Text size="small" className="text-ui-fg-subtle">#{selectedOrder.order?.display_id ?? selectedOrder.order_id}</Text>
                </div>
                <div>
                  <Text size="small" weight="plus" className="mb-1">Payout Amount</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {selectedOrder.payout_amount != null ? Number(selectedOrder.payout_amount).toFixed(2) : "—"}
                  </Text>
                </div>
                <div>
                  <Text size="small" weight="plus" className="mb-1">Commission</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {selectedOrder.commission_amount != null ? Number(selectedOrder.commission_amount).toFixed(2) : "—"}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Payout Status</Label>
                  <Select value={payoutStatus} onValueChange={setPayoutStatus}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="pending">Pending</Select.Item>
                      <Select.Item value="processing">Processing</Select.Item>
                      <Select.Item value="paid">Paid</Select.Item>
                      <Select.Item value="failed">Failed</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </div>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild><Button size="small" variant="secondary">Cancel</Button></Drawer.Close>
              <Button size="small" isLoading={updatePayout.isPending} onClick={() => selectedOrder && updatePayout.mutate({ order_id: selectedOrder.order_id, payout_status: payoutStatus })}>Update Status</Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export default ShopDetailPage
