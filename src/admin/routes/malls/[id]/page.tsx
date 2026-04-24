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
} from "@medusajs/ui"
import {
  MapPin,
  PencilSquare,
  ArrowLeft,
  BuildingStorefront,
  Plus,
  Trash,
} from "@medusajs/icons"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { useNavigate, useParams } from "react-router-dom"

interface Mall {
  id: string
  name: string
  handle: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  images?: string[]
  status: "active" | "inactive" | "coming_soon"
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
  shop: {
    id: string
    name: string
    handle: string
    logo: string | null
    status: string
  }
}

interface Shop {
  id: string
  name: string
  handle: string
  logo: string | null
  status: string
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-ui-tag-green-bg text-ui-tag-green-text"
    case "inactive":
      return "bg-ui-tag-red-bg text-ui-tag-red-text"
    case "coming_soon":
      return "bg-ui-tag-orange-bg text-ui-tag-orange-text"
    default:
      return "bg-ui-bg-subtle text-ui-fg-subtle"
  }
}

const mallShopColumnHelper = createDataTableColumnHelper<MallShop>()
const shopSelectColumnHelper = createDataTableColumnHelper<Shop>()

const MallDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [addShopOpen, setAddShopOpen] = useState(false)
  const [addShopSearch, setAddShopSearch] = useState("")
  const [addShopPagination, setAddShopPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [linkForm, setLinkForm] = useState({
    shop_id: "",
    shop_name: "",
    floor: "",
    unit_number: "",
    is_anchor: false,
  })

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ mall: Mall }>(
        `/admin/malls/${id}`
      )
      return response
    },
    queryKey: ["mall", id],
    enabled: !!id,
  })

  const mall = data?.mall

  const { data: mallShopsData, isLoading: mallShopsLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ mall_shops: MallShop[] }>(
        `/admin/malls/${id}/shops`
      )
      return response
    },
    queryKey: ["mall-shops", id],
    enabled: !!id && activeTab === "shops",
  })

  const updateMall = useMutation({
    mutationFn: async (data: Partial<Mall>) => {
      return sdk.client.fetch<{ mall: Mall }>(`/admin/malls/${id}`, {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mall", id] })
      queryClient.invalidateQueries({ queryKey: ["malls"] })
      toast.success("Mall updated successfully")
      setEditOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update mall")
    },
  })

  const linkShop = useMutation({
    mutationFn: async (data: { shop_id: string; floor?: string; unit_number?: string; is_anchor?: boolean }) => {
      return sdk.client.fetch(`/admin/malls/${id}/shops`, {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mall-shops", id] })
      toast.success("Shop linked to mall")
      setAddShopOpen(false)
      setLinkForm({ shop_id: "", shop_name: "", floor: "", unit_number: "", is_anchor: false })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to link shop")
    },
  })

  const unlinkShop = useMutation({
    mutationFn: async (shopId: string) => {
      return sdk.client.fetch(`/admin/malls/${id}/shops/${shopId}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mall-shops", id] })
      toast.success("Shop removed from mall")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove shop")
    },
  })

  const [formData, setFormData] = useState<Partial<Mall>>({})

  const handleEditOpen = () => {
    if (mall) {
      setFormData({
        name: mall.name,
        handle: mall.handle,
        description: mall.description,
        address: mall.address,
        latitude: mall.latitude,
        longitude: mall.longitude,
        status: mall.status,
      })
      setEditOpen(true)
    }
  }

  const addShopLimit = addShopPagination.pageSize
  const addShopOffset = addShopPagination.pageIndex * addShopLimit

  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ shops: Shop[]; count: number }>(
        "/admin/shops",
        { query: { limit: addShopLimit, offset: addShopOffset, q: addShopSearch || undefined } }
      )
      return response
    },
    queryKey: ["shops-select", addShopLimit, addShopOffset, addShopSearch],
    enabled: addShopOpen,
  })

  const mallShopColumns = useMemo(
    () => [
      mallShopColumnHelper.accessor("shop.name", {
        header: "Shop",
        cell: ({ row }) => (
          <div className="flex items-center gap-x-2">
            <div className="size-8 overflow-hidden rounded bg-ui-bg-subtle">
              {row.original.shop.logo ? (
                <img src={row.original.shop.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BuildingStorefront className="text-ui-fg-muted size-4" />
                </div>
              )}
            </div>
            <Text size="small" weight="plus">{row.original.shop.name}</Text>
          </div>
        ),
      }),
      mallShopColumnHelper.accessor("floor", {
        header: "Floor",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">{getValue() || "—"}</Text>
        ),
      }),
      mallShopColumnHelper.accessor("unit_number", {
        header: "Unit",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">{getValue() || "—"}</Text>
        ),
      }),
      mallShopColumnHelper.accessor("is_anchor", {
        header: "Anchor",
        cell: ({ getValue }) => (
          getValue() ? <Badge size="2xsmall" color="blue">Anchor</Badge> : <Text size="small" className="text-ui-fg-subtle">—</Text>
        ),
      }),
      mallShopColumnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(getValue() ?? "")}`}>
            {getValue() ?? "—"}
          </span>
        ),
      }),
      mallShopColumnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="danger"
              onClick={() => unlinkShop.mutate(row.original.shop_id)}
            >
              <Trash className="text-ui-fg-on-color" />
            </Button>
          </div>
        ),
      }),
    ],
    [unlinkShop]
  )

  const mallShopTable = useDataTable({
    data: mallShopsData?.mall_shops ?? [],
    columns: mallShopColumns,
    getRowId: (row) => row.id,
    rowCount: mallShopsData?.mall_shops?.length ?? 0,
    isLoading: mallShopsLoading,
  })

  const shopSelectColumns = useMemo(
    () => [
      shopSelectColumnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-x-2">
            <div className="size-8 overflow-hidden rounded bg-ui-bg-subtle">
              {row.original.logo ? (
                <img src={row.original.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BuildingStorefront className="text-ui-fg-muted size-4" />
                </div>
              )}
            </div>
            <Text size="small" weight="plus">{getValue()}</Text>
          </div>
        ),
      }),
      shopSelectColumnHelper.accessor("handle", {
        header: "Handle",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">{getValue()}</Text>
        ),
      }),
      shopSelectColumnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(getValue())}`}>
            {getValue()}
          </span>
        ),
      }),
      shopSelectColumnHelper.display({
        id: "select",
        header: "",
        cell: ({ row }) => (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setLinkForm((prev) => ({ ...prev, shop_id: row.original.id, shop_name: row.original.name }))
            }}
          >
            Select
          </Button>
        ),
      }),
    ],
    []
  )

  const shopSelectTable = useDataTable({
    data: shopsData?.shops ?? [],
    columns: shopSelectColumns,
    getRowId: (row) => row.id,
    rowCount: shopsData?.count ?? 0,
    isLoading: shopsLoading,
    search: {
      state: addShopSearch,
      onSearchChange: setAddShopSearch,
    },
    pagination: {
      state: addShopPagination,
      onPaginationChange: setAddShopPagination,
    },
  })

  if (isLoading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center p-8">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </Container>
    )
  }

  if (!mall) {
    return (
      <Container className="p-6">
        <Text>Mall not found</Text>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="transparent" onClick={() => navigate("/malls")}>
            <ArrowLeft className="text-ui-fg-subtle" />
          </Button>
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">Malls</Text>
            <Text size="small" className="text-ui-fg-muted">/</Text>
            <Text size="small" weight="plus">{mall.name}</Text>
          </div>
        </div>
        <Button size="small" variant="secondary" onClick={handleEditOpen}>
          <PencilSquare className="text-ui-fg-subtle" />
          <span className="ml-2">Edit</span>
        </Button>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-x-2 mb-2">
              <Heading level="h1">{mall.name}</Heading>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(mall.status)}`}>
                {mall.status.replace("_", " ")}
              </span>
            </div>
            <Text size="small" className="text-ui-fg-subtle">{mall.handle}</Text>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="shops">Shops</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="details" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text size="small" leading="compact" weight="plus" className="mb-2">Description</Text>
                <Text size="small" className="text-ui-fg-subtle">{mall.description || "No description provided"}</Text>
              </div>
              <div>
                <Text size="small" leading="compact" weight="plus" className="mb-2">Address</Text>
                <div className="flex items-start gap-x-2">
                  <MapPin className="text-ui-fg-subtle mt-0.5" />
                  <Text size="small" className="text-ui-fg-subtle">{mall.address || "No address provided"}</Text>
                </div>
              </div>
              <div>
                <Text size="small" leading="compact" weight="plus" className="mb-2">Coordinates</Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {mall.latitude && mall.longitude ? `${mall.latitude}, ${mall.longitude}` : "No coordinates set"}
                </Text>
                {mall.latitude && mall.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${mall.latitude},${mall.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover text-sm mt-1 inline-block"
                  >
                    View on Map
                  </a>
                )}
              </div>
              <div>
                <Text size="small" leading="compact" weight="plus" className="mb-2">Timestamps</Text>
                <div className="flex flex-col gap-y-1">
                  <Text size="small" className="text-ui-fg-subtle">Created: {new Date(mall.created_at).toLocaleDateString()}</Text>
                  <Text size="small" className="text-ui-fg-subtle">Updated: {new Date(mall.updated_at).toLocaleDateString()}</Text>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="shops" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <Text size="small" weight="plus">Shops in this Mall</Text>
              <Button size="small" onClick={() => setAddShopOpen(true)}>
                <Plus className="text-ui-fg-on-color" />
                <span className="ml-2">Add Shop</span>
              </Button>
            </div>
            <DataTable instance={mallShopTable}>
              <DataTable.Table />
            </DataTable>
          </Tabs.Content>
        </Tabs>
      </div>

      {/* Edit Drawer */}
      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Mall</Drawer.Title>
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
                <Label>Address</Label>
                <Input value={formData.address || ""} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={formData.latitude ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={formData.longitude ?? ""} onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Status</Label>
                <Select value={formData.status || mall.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}>
                  <Select.Trigger><Select.Value placeholder="Select status" /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="inactive">Inactive</Select.Item>
                    <Select.Item value="coming_soon">Coming Soon</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild><Button size="small" variant="secondary">Cancel</Button></Drawer.Close>
              <Button size="small" onClick={() => updateMall.mutate(formData)} isLoading={updateMall.isPending}>Save</Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Add Shop FocusModal */}
      <FocusModal open={addShopOpen} onOpenChange={setAddShopOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary" disabled={linkShop.isPending}>Cancel</Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  disabled={!linkForm.shop_id}
                  isLoading={linkShop.isPending}
                  onClick={() => {
                    linkShop.mutate({
                      shop_id: linkForm.shop_id,
                      floor: linkForm.floor || undefined,
                      unit_number: linkForm.unit_number || undefined,
                      is_anchor: linkForm.is_anchor,
                    })
                  }}
                >
                  Link Shop
                </Button>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-4xl px-6 py-6">
                <Heading level="h1" className="mb-6">Add Shop to Mall</Heading>

                {!linkForm.shop_id ? (
                  <div className="mb-6">
                    <Text size="small" weight="plus" className="mb-3">Select a shop</Text>
                    <DataTable instance={shopSelectTable}>
                      <DataTable.Toolbar>
                        <DataTable.Search placeholder="Search shops..." />
                      </DataTable.Toolbar>
                      <DataTable.Table />
                      <DataTable.Pagination />
                    </DataTable>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <Text size="small" weight="plus">Selected Shop</Text>
                      <Button size="small" variant="transparent" onClick={() => setLinkForm((prev) => ({ ...prev, shop_id: "", shop_name: "" }))}>
                        Change
                      </Button>
                    </div>
                    <div className="bg-ui-bg-subtle rounded-md px-4 py-3">
                      <Text size="small" weight="plus">{linkForm.shop_name}</Text>
                    </div>
                  </div>
                )}

                {linkForm.shop_id && (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-2">
                      <Label>Floor</Label>
                      <Input value={linkForm.floor} onChange={(e) => setLinkForm((prev) => ({ ...prev, floor: e.target.value }))} placeholder="e.g., 2nd Floor" />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Unit Number</Label>
                      <Input value={linkForm.unit_number} onChange={(e) => setLinkForm((prev) => ({ ...prev, unit_number: e.target.value }))} placeholder="e.g., G-12" />
                    </div>
                    <div className="flex items-center gap-x-2">
                      <input
                        type="checkbox"
                        id="is_anchor"
                        checked={linkForm.is_anchor}
                        onChange={(e) => setLinkForm((prev) => ({ ...prev, is_anchor: e.target.checked }))}
                        className="accent-ui-fg-interactive"
                      />
                      <Label htmlFor="is_anchor">Anchor Tenant</Label>
                    </div>
                  </div>
                )}
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  )
}

export default MallDetailPage
