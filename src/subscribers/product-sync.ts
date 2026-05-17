import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

const EDGE_FUNCTION_URL =
  process.env.SUPABASE_EDGE_FUNCTION_URL ||
  "https://gihholkkldiwqnlnjwab.supabase.co/functions/v1/sync-products"

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ""
const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || ""

const RETRY_MAX_ATTEMPTS = 4
const RETRY_BASE_DELAY_MS = 200

async function callEdgeFunction(
  logger: any,
  body: Record<string, unknown>
): Promise<void> {
  for (let attempt = 1; attempt <= RETRY_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(SUPABASE_ANON_KEY && {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          }),
          ...(SUPABASE_WEBHOOK_SECRET && {
            "x-webhook-secret": SUPABASE_WEBHOOK_SECRET,
          }),
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Edge function error: ${response.status} - ${err}`)
      }

      return
    } catch (err: any) {
      if (attempt === RETRY_MAX_ATTEMPTS) throw err
      const jitter = Math.random() * 200
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1) + jitter
      logger.warn(
        `Retry ${attempt}/${RETRY_MAX_ATTEMPTS} after ${Math.round(delay)}ms: ${err.message}`
      )
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}

export default async function productSyncHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const { name: eventName, data } = event

  try {
    const action = eventName.endsWith("deleted") ? "deleted" : "updated"

    // Variant events: resolve variant_id → product_id, then sync the parent product
    if (eventName.includes("product-variant")) {
      const productService = container.resolve(Modules.PRODUCT)
      const variant = await productService.retrieveProductVariant(data.id, {
        select: ["product_id"],
      })
      if (!variant?.product_id) {
        logger.warn(`Variant ${data.id} has no parent product, skipping`)
        return
      }
      await syncProduct(container, logger, variant.product_id)
      logger.info(`Synced product ${variant.product_id} from variant ${data.id} (${action})`)
      return
    }

    // Collection events: re-index all products in the collection
    if (eventName.includes("product-collection")) {
      if (action === "deleted") return
      await callEdgeFunction(logger, {
        action: "reindex_collection",
        collection_id: data.id,
      })
      logger.info(`Re-indexed collection ${data.id} (${action})`)
      return
    }

    // Product events
    if (action === "deleted") {
      await callEdgeFunction(logger, {
        action: "deleted",
        product: { id: data.id },
      })
    } else {
      await syncProduct(container, logger, data.id)
    }
    logger.info(`Synced product ${data.id} (${action})`)
  } catch (error: any) {
    logger.error(
      `Failed to sync ${data.id} from ${eventName}: ${error.message}`
    )
  }
}

async function syncProduct(
  container: any,
  logger: any,
  productId: string
): Promise<void> {
  const productService = container.resolve(Modules.PRODUCT)
  const product = await productService.retrieveProduct(productId, {
    relations: ["collection", "categories", "tags"],
  })

  await callEdgeFunction(logger, {
    action: "updated",
    product: {
      id: product.id,
      title: product.title,
      subtitle: product.subtitle ?? null,
      description: product.description ?? null,
      handle: product.handle,
      thumbnail: product.thumbnail ?? null,
      collection_id: product.collection_id ?? null,
      collection: product.collection ?? null,
      categories: product.categories ?? [],
      tags: product.tags ?? [],
    },
  })
}

export const config: SubscriberConfig = {
  event: [
    "product.product.created",
    "product.product.updated",
    "product.product.deleted",
    "product.product-variant.created",
    "product.product-variant.updated",
    "product.product-variant.deleted",
    "product.product-collection.updated",
  ],
}
