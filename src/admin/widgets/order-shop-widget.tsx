import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text, Badge, Skeleton } from "@medusajs/ui"
import { BuildingStorefront } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import { useNavigate } from "react-router-dom"

type AdminOrder = {
  id: string
  display_id: string
}

const getPayoutColor = (status: string) => {
  switch (status) {
    case "paid": return "green" as const
    case "processing": return "blue" as const
    case "pending": return "orange" as const
    case "failed": return "red" as const
    default: return "grey" as const
  }
}

const OrderShopWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const navigate = useNavigate()

  const { data: result, isLoading } = useQuery({
    queryFn: async () => {
      const response = await sdk.client.fetch<{
        shop: { id: string; name: string; handle: string; logo: string | null; status: string; commission_rate: number } | null
        payout: { payout_status: string; payout_amount: number | null; commission_amount: number | null } | null
      }>(`/admin/orders/${data.id}/shop`)
      return response
    },
    queryKey: ["order-shop", data.id],
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
        <Text size="small" className="text-ui-fg-subtle">No shop linked to this order</Text>
      </Container>
    )
  }

  const shop = result.shop
  const payout = result.payout

  return (
    <Container className="divide-y p-0">
      <div className="px-4 py-3">
        <Text size="small" weight="plus" className="mb-2">Shop Payout</Text>
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
            <Text size="small" className="text-ui-fg-subtle">Payout Status</Text>
            <Badge size="2xsmall" color={getPayoutColor(payout?.payout_status ?? "")}>
              {payout?.payout_status ?? "—"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Payout Amount</Text>
            <Text size="small" weight="plus">
              {payout?.payout_amount != null ? Number(payout.payout_amount).toFixed(2) : "—"}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Commission</Text>
            <Text size="small" weight="plus">
              {payout?.commission_amount != null ? Number(payout.commission_amount).toFixed(2) : "—"}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">Shop Rate</Text>
            <Text size="small" weight="plus">{(shop.commission_rate * 100).toFixed(0)}%</Text>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderShopWidget
