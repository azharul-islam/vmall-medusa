import { MedusaService } from "@medusajs/framework/utils"
import Mall from "./models/mall"
import Shop from "./models/shop"
import ShopAdmin from "./models/shop-admin"
import MallShop from "./models/mall-shop"

class MarketplaceModuleService extends MedusaService({
  Mall,
  Shop,
  ShopAdmin,
  MallShop,
}) {}

export default MarketplaceModuleService