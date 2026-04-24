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
  DataTable,
  DataTablePaginationState,
  createDataTableColumnHelper,
  useDataTable,
  Skeleton,
} from "@medusajs/ui"
import {
  BuildingStorefront,
  Plus,
  PencilSquare,
  Trash,
} from "@medusajs/icons"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useNavigate } from "react-router-dom"

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

const columnHelper = createDataTableColumnHelper<Shop>()

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-ui-tag-green-bg text-ui-tag-green-text"
    case "pending":
      return "bg-ui-tag-orange-bg text-ui-tag-orange-text"
    case "suspended":
      return "bg-ui-tag-red-bg text-ui-tag-red-text"
    default:
      return "bg-ui-bg-subtle text-ui-fg-subtle"
  }
}

const ShopsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * limit

  // Fetch shops
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ shops: Shop[]; count: number }>(
        "/admin/shops",
        {
          query: { limit, offset, q: searchValue || undefined },
        }
      )
      return response
    },
    queryKey: ["shops", limit, offset, searchValue],
    keepPreviousData: true,
  })

  // Create shop mutation
  const createShop = useMutation({
    mutationFn: async (data: Partial<Shop>) => {
      return sdk.client.fetch<{ shop: Shop }>("/admin/shops", {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Shop created successfully")
      setOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create shop")
    },
  })

  // Delete shop mutation
  const deleteShop = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/shops/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
      toast.success("Shop deleted")
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete shop")
      setDeleteId(null)
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor("logo", {
        header: "",
        cell: ({ getValue }) => (
          <div className="size-10 overflow-hidden rounded-md bg-ui-bg-subtle">
            {getValue() ? (
              <img
                src={getValue()}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BuildingStorefront className="text-ui-fg-muted size-5" />
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => (
          <button
            className="flex items-center gap-2 cursor-pointer text-left hover:text-ui-fg-interactive-hover"
            onClick={() => navigate(`/shops/${row.original.id}`)}
          >
            <Text size="small" leading="compact" weight="plus">
              {getValue()}
            </Text>
          </button>
        ),
      }),
      columnHelper.accessor("handle", {
        header: "Handle",
        cell: ({ getValue }) => (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
              getValue()
            )}`}
          >
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("commission_rate", {
        header: "Commission",
        cell: ({ getValue }) => (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {((getValue() as number) * 100).toFixed(0)}%
          </Text>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => navigate(`/shops/${row.original.id}`)}
            >
              <PencilSquare className="text-ui-fg-subtle" />
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash className="text-ui-fg-on-color" />
            </Button>
          </div>
        ),
      }),
    ],
    [navigate]
  )

  const table = useDataTable({
    data: data?.shops || [],
    columns,
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    search: {
      state: searchValue,
      onSearchChange: setSearchValue,
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    handle: string
    description: string
    logo: string
    banner: string
    status: string
    commission_rate: number
  }>({
    name: "",
    handle: "",
    description: "",
    logo: "",
    banner: "",
    status: "pending",
    commission_rate: 0.1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      name: "",
      handle: "",
      description: "",
      logo: "",
      banner: "",
      status: "pending",
      commission_rate: 0.1,
    })
    setErrors({})
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.handle) newErrors.handle = "Handle is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createShop.mutate(formData)
  }

  const handleNameChange = (name: string) => {
    const handle = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setFormData((prev) => ({ ...prev, name, handle }))
    setErrors((prev) => ({ ...prev, name: undefined, handle: undefined }))
  }

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Shops</Heading>
        <Button size="small" onClick={() => setOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Create Shop</span>
        </Button>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <DataTable instance={table}>
            <DataTable.Toolbar>
              <div className="flex gap-2">
                <DataTable.Search placeholder="Search shops..." />
              </div>
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        )}
      </div>

      {/* Create FocusModal */}
      <FocusModal open={open} onOpenChange={setOpen}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex items-center justify-end gap-x-2">
                <FocusModal.Close asChild>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={createShop.isPending}
                  >
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  onClick={handleSubmit}
                  isLoading={createShop.isPending}
                >
                  Create Shop
                </Button>
              </div>
            </FocusModal.Header>

            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-3xl px-6 py-6">
                <Heading level="h1" className="mb-8">
                  Create Shop
                </Heading>

                <div className="flex flex-col gap-y-6">
                  {/* Name */}
                  <div className="flex flex-col gap-y-2">
                    <Label>
                      Name <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Marks & Spencer"
                    />
                    {errors.name && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.name}
                      </Text>
                    )}
                  </div>

                  {/* Handle */}
                  <div className="flex flex-col gap-y-2">
                    <Label>
                      Handle <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      value={formData.handle}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          handle: e.target.value,
                        }))
                        setErrors((prev) => ({ ...prev, handle: undefined }))
                      }}
                      placeholder="marks-and-spencer"
                    />
                    {errors.handle && (
                      <Text size="small" className="text-ui-fg-error">
                        {errors.handle}
                      </Text>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description of the shop"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={formData.logo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          logo: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Banner URL */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Banner URL</Label>
                    <Input
                      value={formData.banner}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          banner: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/banner.png"
                    />
                  </div>

                  {/* Commission Rate */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Commission Rate</Label>
                    <div className="flex items-center gap-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={formData.commission_rate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            commission_rate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-32"
                      />
                      <Text size="small" className="text-ui-fg-subtle">
                        {(formData.commission_rate * 100).toFixed(0)}%
                      </Text>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select status" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="pending">Pending</Select.Item>
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="suspended">Suspended</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <FocusModal open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <FocusModal.Content>
            <div className="flex h-full flex-col overflow-hidden">
              <FocusModal.Header>
                <Heading level="h2">Delete Shop</Heading>
              </FocusModal.Header>
              <FocusModal.Body className="flex-1 overflow-auto">
                <div className="mx-auto max-w-lg px-6 py-6">
                  <Text>
                    Are you sure you want to delete this shop? This action
                    cannot be undone.
                  </Text>
                  <div className="mt-6 flex items-center justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      isLoading={deleteShop.isPending}
                      onClick={() => deleteId && deleteShop.mutate(deleteId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </FocusModal.Body>
            </div>
          </FocusModal.Content>
        </FocusModal>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Shops",
  icon: BuildingStorefront,
})

export default ShopsPage