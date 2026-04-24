import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
const MARKETPLACE_MODULE = "marketplace"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info(`Processing order.placed event for order: ${data.id}`)

  try {
    // Check if we've already processed this order
    const { data: existingLinks } = await query.graph({
      entity: "shop_order",
      fields: ["id"],
      filters: {
        order_id: data.id,
      },
    })

    if (existingLinks.length > 0) {
      logger.info(`Order ${data.id} already processed, skipping`)
      return
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "items.*", "items.product_id", "total", "currency_code"],
      filters: { id: data.id },
    })

    if (!orders.length) {
      logger.warn(`Order ${data.id} not found`)
      return
    }

    const order = orders[0]
    const shopOrders: Record<
      string,
      { items: any[]; total: number }
    > = {}

    for (const item of order.items || []) {
      if (!item) continue
      const productId = item.product_id
      if (!productId) continue

      const { data: productLinks } = await query.graph({
        entity: "shop_product",
        fields: ["*", "shop.*"],
        filters: {
          product_id: productId,
          is_owner: true,
        },
      })

      if (!productLinks.length) {
        logger.warn(`No shop owner found for product ${productId}`)
        continue
      }

      const shop = productLinks[0].shop
      if (!shop) {
        logger.warn(`Shop not found for product ${productId}`)
        continue
      }

      const commissionRate =
        productLinks[0].commission_rate ??
        shop.commission_rate ??
        0.1

      const itemTotal = item.unit_price * item.quantity

      if (!shopOrders[shop.id]) {
        shopOrders[shop.id] = { items: [], total: 0 }
      }
      shopOrders[shop.id].items.push(item)
      shopOrders[shop.id].total += itemTotal
    }

    for (const [shopId, shopData] of Object.entries(shopOrders)) {
      const total = shopData.total
      const shopResult = await query.graph({
        entity: "shop",
        fields: ["commission_rate"],
        filters: { id: shopId },
      })
      const shop = shopResult.data[0]

      const commissionRate = shop?.commission_rate ?? 0.1
      const commissionAmount = total * commissionRate
      const payoutAmount = total - commissionAmount

      await link.create({
        [MARKETPLACE_MODULE]: {
          shop_id: shopId,
        },
        [Modules.ORDER]: {
          order_id: order.id,
        },
        data: {
          payout_status: "pending",
          payout_amount: payoutAmount,
          commission_amount: commissionAmount,
        },
      })

      logger.info(
        `Created shop_order link for shop ${shopId}, order ${order.id}, payout: ${payoutAmount}`
      )
    }

    logger.info(`Successfully processed order.placed for order: ${data.id}`)
  } catch (error: any) {
    logger.error(
      `Failed to process order.placed for order ${data.id}: ${error.message}`
    )
    // Don't throw - subscriber completes gracefully
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}