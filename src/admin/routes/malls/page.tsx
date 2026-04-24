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
import { MapPin, Plus, PencilSquare, Trash } from "@medusajs/icons"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useNavigate } from "react-router-dom"

// Mall type definition
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

const columnHelper = createDataTableColumnHelper<Mall>()

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

const MallsPage = () => {
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

  // Fetch malls
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ malls: Mall[]; count: number }>(
        "/admin/malls",
        {
          query: { limit, offset, q: searchValue || undefined },
        }
      )
      return response
    },
    queryKey: ["malls", limit, offset, searchValue],
    keepPreviousData: true,
  })

  // Create mall mutation
  const createMall = useMutation({
    mutationFn: async (data: Partial<Mall>) => {
      return sdk.client.fetch<{ mall: Mall }>("/admin/malls", {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["malls"] })
      toast.success("Mall created successfully")
      setOpen(false)
      setFormData({
        name: "",
        handle: "",
        description: "",
        address: "",
        latitude: undefined,
        longitude: undefined,
        status: "active",
      })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create mall")
    },
  })

  // Delete mall mutation
  const deleteMall = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/malls/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["malls"] })
      toast.success("Mall deleted")
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete mall")
      setDeleteId(null)
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => (
          <button
            className="flex items-center gap-2 cursor-pointer text-left hover:text-ui-fg-interactive-hover"
            onClick={() => navigate(`/malls/${row.original.id}`)}
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
            {getValue().replace("_", " ")}
          </span>
        ),
      }),
      columnHelper.accessor("address", {
        header: "Address",
        cell: ({ getValue }) => (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {getValue() || "—"}
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
              onClick={() => navigate(`/malls/${row.original.id}`)}
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
    data: data?.malls || [],
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
    address: string
    latitude?: number
    longitude?: number
    status: string
  }>({
    name: "",
    handle: "",
    description: "",
    address: "",
    status: "active",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.handle) newErrors.handle = "Handle is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createMall.mutate(formData)
  }

  // Auto-generate handle from name
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
        <Heading level="h2">Malls</Heading>
        <Button size="small" onClick={() => setOpen(true)}>
          <Plus className="text-ui-fg-on-color" />
          <span className="ml-2">Create Mall</span>
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
                <DataTable.Search placeholder="Search malls..." />
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
                    disabled={createMall.isPending}
                  >
                    Cancel
                  </Button>
                </FocusModal.Close>
                <Button
                  size="small"
                  onClick={handleSubmit}
                  isLoading={createMall.isPending}
                >
                  Create Mall
                </Button>
              </div>
            </FocusModal.Header>

            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto max-w-3xl px-6 py-6">
                <Heading level="h1" className="mb-8">
                  Create Mall
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
                      placeholder="e.g., Dubai Mall"
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
                      placeholder="dubai-mall"
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
                      placeholder="Description of the mall"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-y-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Full address"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude ?? ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            latitude: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        placeholder="25.1972"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude ?? ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            longitude: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        placeholder="55.2792"
                      />
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
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="inactive">Inactive</Select.Item>
                        <Select.Item value="coming_soon">
                          Coming Soon
                        </Select.Item>
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
                <Heading level="h2">Delete Mall</Heading>
              </FocusModal.Header>
              <FocusModal.Body className="flex-1 overflow-auto">
                <div className="mx-auto max-w-lg px-6 py-6">
                  <Text>
                    Are you sure you want to delete this mall? This action
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
                      isLoading={deleteMall.isPending}
                      onClick={() => deleteId && deleteMall.mutate(deleteId)}
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
  label: "Malls",
  icon: MapPin,
})

export default MallsPage