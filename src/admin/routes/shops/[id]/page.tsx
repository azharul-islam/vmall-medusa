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
  BuildingStorefront,
  PencilSquare,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Users,
  ArchiveBox,
  ReceiptPercent,
} from "@medusajs/icons"
import { useState } from "react"
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

const ShopDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")

  // Fetch shop
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{ shop: Shop }>(
        `/admin/shops/${id}`
      )
      return response
    },
    queryKey: ["shop", id],
    enabled: !!id,
  })

  const shop = data?.shop

  // Update shop mutation
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

  // Form state for edit
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
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="transparent"
            onClick={() => navigate("/shops")}
          >
            <ArrowLeft className="text-ui-fg-subtle" />
          </Button>
          <div className="flex items-center gap-x-2">
            <Text size="small" className="text-ui-fg-subtle">
              Shops
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              /
            </Text>
            <Text size="small" weight="plus">
              {shop.name}
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
          <div className="flex items-center gap-x-4">
            {/* Logo */}
            <div className="size-16 overflow-hidden rounded-lg bg-ui-bg-subtle shadow-elevation-card-rest">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BuildingStorefront className="text-ui-fg-muted size-8" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-x-2 mb-1">
                <Heading level="h1">{shop.name}</Heading>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                    shop.status
                  )}`}
                >
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

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="products">
              <ShoppingBag className="mr-2 size-4" />
              Products
            </Tabs.Trigger>
            <Tabs.Trigger value="malls">
              <MapPin className="mr-2 size-4" />
              Malls
            </Tabs.Trigger>
            <Tabs.Trigger value="admins">
              <Users className="mr-2 size-4" />
              Admins
            </Tabs.Trigger>
            <Tabs.Trigger value="warehouses">
              <ArchiveBox className="mr-2 size-4" />
              Warehouses
            </Tabs.Trigger>
            <Tabs.Trigger value="payouts">
              <ReceiptPercent className="mr-2 size-4" />
              Payouts
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="products" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Products
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Products owned by this shop will appear here. Linking management
                coming soon.
              </Text>
            </div>
          </Tabs.Content>

          <Tabs.Content value="malls" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Mall Locations
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Malls where this shop has a presence will appear here. Floor and
                unit information will be displayed.
              </Text>
            </div>
          </Tabs.Content>

          <Tabs.Content value="admins" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Shop Admins
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Users who can manage this shop will appear here. Admin
                invitation feature coming soon.
              </Text>
            </div>
          </Tabs.Content>

          <Tabs.Content value="warehouses" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArchiveBox className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Warehouses
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Stock locations linked to this shop will appear here. Warehouse
                assignment feature coming soon.
              </Text>
            </div>
          </Tabs.Content>

          <Tabs.Content value="payouts" className="pt-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ReceiptPercent className="text-ui-fg-muted mb-4 size-12" />
              <Text size="small" leading="compact" weight="plus" className="mb-2">
                Payouts
              </Text>
              <Text size="small" className="text-ui-fg-subtle max-w-md">
                Order payout records for this shop will appear here. Payout
                tracking feature coming soon.
              </Text>
            </div>
          </Tabs.Content>
        </Tabs>
      </div>

      {/* Edit Drawer */}
      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Shop</Drawer.Title>
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

              {/* Logo */}
              <div className="flex flex-col gap-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={formData.logo || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logo: e.target.value }))
                  }
                />
              </div>

              {/* Banner */}
              <div className="flex flex-col gap-y-2">
                <Label>Banner URL</Label>
                <Input
                  value={formData.banner || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, banner: e.target.value }))
                  }
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
                    value={formData.commission_rate ?? 0.1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commission_rate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-32"
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    {((formData.commission_rate ?? 0.1) * 100).toFixed(0)}%
                  </Text>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || shop.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as any }))
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
                onClick={() => updateShop.mutate(formData)}
                isLoading={updateShop.isPending}
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

export default ShopDetailPage