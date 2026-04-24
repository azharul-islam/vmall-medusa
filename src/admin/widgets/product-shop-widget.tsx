import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text, Badge, Skeleton } from "@medusajs/ui"
import { BuildingStorefront } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import { useNavigate } from "react-router-dom"

type AdminProduct = {
  id: string
  title: string
  handle: string
}

const ProductShopWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const navigate = useNavigate()

  const { data: result, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{
        shop: { id: string; name: string; handle: string; logo: string | null; status: string; commission_rate: number } | null
        link: { is_owner: boolean; status: string; commission_rate: number | null } | null
      }>(`/admin/products/${data.id}/shop`)
      return response
    },
    queryKey: ["product-shop", data.id],
    enabled: !!data.id,
  })

  if (isLoading) {
    return (
      <Container className="p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-4 w-32" />
      </Container>
    )
  }

  if (!result?.shop) {
    return (
      <Container className="p-4">
        <Text size="small" className="text-ui-fg-subtle">No shop linked to this product</Text>
      </Container>
    )
  }

  const shop = result.shop
  const link = result.link

  return (
    <Container className="divide-y p-0">
      <div className="px-4 py-3">
        <Text size="small" weight="plus" className="mb-2">Shop Ownership</Text>
        <div
          className="flex items-center gap-x-2 cursor-pointer rounded-md p-1 hover:bg-ui-bg-subtle-hover"
          onClick={() => navigate(`/shops/${shop.id}`)}
        >
          <div className="size-8 overflow-hidden rounded bg-ui-bg-subtle">
            {shop.logo ? (
              <img src={shop.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BuildingStorefront className="text-ui-fg-muted size-4" />
              </div>
            )}
          </div>
          <div>
            <Text size="small" weight="plus">{shop.name}</Text>
            <Text size="small" className="text-ui-fg-subtle">{shop.handle}</Text>
          </div>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Owner</Text>
            {link?.is_owner ? <Badge size="2xsmall" color="blue">Owner</Badge> : <Text size="small" className="text-ui-fg-subtle">No</Text>}
          </div>
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Link Status</Text>
            <Badge size="2xsmall" color={link?.status === "active" ? "green" : "grey"}>{link?.status ?? "—"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Commission</Text>
            <Text size="small" weight="plus">
              {link?.commission_rate != null ? `${(link.commission_rate * 100).toFixed(0)}%` : `${(shop.commission_rate * 100).toFixed(0)}%`}
            </Text>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductShopWidget
