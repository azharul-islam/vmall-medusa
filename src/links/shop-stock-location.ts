import { defineLink } from "@medusajs/framework/utils"
import MarketplaceModule from "../modules/marketplace"
import StockLocationModule from "@medusajs/stock-location"

export default defineLink(
  MarketplaceModule.linkable.shop,
  {
    linkable: StockLocationModule.linkable.stockLocation,
    isList: true,
  },
  {
    database: {
      extraColumns: {
        is_default: {
          type: "boolean",
        },
        display_name: {
          type: "text",
          nullable: true,
        },
      },
    },
  }
)