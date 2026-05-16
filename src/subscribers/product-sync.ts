import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

const EDGE_FUNCTION_URL =
  process.env.SUPABASE_EDGE_FUNCTION_URL ||
  "https://gihholkkldiwqnlnjwab.supabase.co/functions/v1/sync-products"

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ""
const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || ""

export default async function productSyncHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const { name: eventName, data } = event

  try {
    const action = eventName.endsWith("deleted") ? "deleted" : "updated"

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
      body: JSON.stringify({ action, product: { id: data.id } }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Edge function error: ${response.status} - ${err}`)
    }

    logger.info(`Synced product ${data.id} (${action})`)
  } catch (error: any) {
    logger.error(
      `Failed to sync product ${data.id} from ${eventName}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product.product.created",
    "product.product.updated",
    "product.product.deleted",
  ],
}
