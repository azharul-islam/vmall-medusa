import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  MarketplaceModule.linkable.shop,
  {
    linkable: OrderModule.linkable.order,
    isList: true,
  },
  {
    database: {
      extraColumns: {
        payout_status: {
          type: "text",
          defaultValue: "pending",
        },
        payout_amount: {
          type: "decimal",
          nullable: true,
        },
        commission_amount: {
          type: "decimal",
          nullable: true,
        },
      },
    },
  }
)