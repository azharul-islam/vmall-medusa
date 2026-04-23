import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  MarketplaceModule.linkable.shop,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    database: {
      extraColumns: {
        is_owner: {
          type: "boolean",
        },
        status: {
          type: "text",
          defaultValue: "active",
        },
        commission_rate: {
          type: "decimal",
          nullable: true,
        },
      },
    },
  }
)