import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function vendorPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const logger = container.resolve("logger")

  if (data.actor_type !== "vendor") {
    return
  }

  logger.info(`Vendor password reset requested for: ${data.entity_id}`)

  // TODO: Send email with reset link
  // The reset URL should point to the Medusa admin dashboard's built-in reset-password page:
  // {adminUrl}/reset-password?token={data.token}&email={data.entity_id}
  //
  // Example with a notification service:
  // const notificationService = container.resolve("notification")
  // await notificationService.send({
  //   to: data.entity_id,
  //   channel: "email",
  //   template: "vendor-reset-password",
  //   data: {
  //     token: data.token,
  //     email: data.entity_id,
  //     resetUrl: `${adminUrl}/reset-password?token=${data.token}&email=${data.entity_id}`,
  //   },
  // })

  logger.info(
    `Vendor password reset token generated for ${data.entity_id}. Token: ${data.token.substring(0, 10)}...`
  )
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
