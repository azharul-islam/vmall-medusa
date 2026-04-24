import { defineRouteConfig } from "@medusajs/admin-sdk"
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
} from "@medusajs/ui"
import {
  MapPin,
  PencilSquare,
  ArrowLeft,
  BuildingStorefront,
} from "@medusajs/icons"
import { useState } from "react"
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

const MallDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Fetch mall
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

  // Update mall mutation
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

  // Form state for edit
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
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="transparent"
            onClick={() => navigate("/malls")}
          >
            <ArrowLeft className="text-ui-fg-subtle" />
          </Button>
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">
              Malls
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              /
            </Text>
            <Text size="small" weight="plus">
              {mall.name}
            </Text>
          </div>
        </div>
        <Button size="small" variant="secondary" onClick={handleEditOpen}>
          <PencilSquare className="text-ui-fg-subtle" />
          <span className="ml-2">Edit</span>
        </Button>
      </div>

      {/* Header Info */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-x-2 mb-2">
              <Heading level="h1">{mall.name}</Heading>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                  mall.status
                )}`}
              >
                {mall.status.replace("_", " ")}
              </span>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {mall.handle}
            </Text>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="shops">
              Shops
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="details" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div>
                <Text
                  size="small"
                  leading="compact"
                  weight="plus"
                  className="mb-2"
                >
                  Description
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {mall.description || "No description provided"}
                </Text>
              </div>

              {/* Address */}
              <div>
                <Text
                  size="small"
                  leading="compact"
                  weight="plus"
                  className="mb-2"
                >
                  Address
                </Text>
                <div className="flex items-start gap-x-2">
                  <MapPin className="text-ui-fg-subtle mt-0.5" />
                  <Text size="small" className="text-ui-fg-subtle">
                    {mall.address || "No address provided"}
                  </Text>
                </div>
              </div>

              {/* Coordinates */}
              <div>
                <Text
                  size="small"
                  leading="compact"
                  weight="plus"
                  className="mb-2"
                >
                  Coordinates
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {mall.latitude && mall.longitude
                    ? `${mall.latitude}, ${mall.longitude}`
                    : "No coordinates set"}
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

              {/* Created/Updated */}
              <div>
                <Text
                  size="small"
                  leading="compact"
                  weight="plus"
                  className="mb-2"
                >
                  Timestamps
                </Text>
                <div className="flex flex-col gap-y-1">
                  <Text size="small" className="text-ui-fg-subtle">
                    Created: {new Date(mall.created_at).toLocaleDateString()}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Updated: {new Date(mall.updated_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="shops" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BuildingStorefront className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Shop Management
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Shops linked to this mall will be shown here. This feature will
                be available once shop linking is implemented.
              </Text>
            </div>
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
              {/* Name */}
              <div className="flex flex-col gap-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Handle */}
              <div className="flex flex-col gap-y-2">
                <Label>Handle</Label>
                <Input
                  value={formData.handle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, handle: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
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
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || mall.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select status" />
                  </Select.Trigger>
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
              <Drawer.Close asChild>
                <Button size="small" variant="secondary">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={() => updateMall.mutate(formData)}
                isLoading={updateMall.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export default MallDetailPage