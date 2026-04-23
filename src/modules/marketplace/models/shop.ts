import { model } from "@medusajs/framework/utils"
import ShopAdmin from "./shop-admin"
import MallShop from "./mall-shop"

const Shop = model.define("shop", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  logo: model.text().nullable(),
  banner: model.text().nullable(),
  status: model.enum(["pending", "active", "suspended"]).default("pending"),
  commission_rate: model.bigNumber().default(0.10),
  admins: model.hasMany(() => ShopAdmin, {
    mappedBy: "shop",
  }),
  mallShops: model.hasMany(() => MallShop, {
    mappedBy: "shop",
  }),
})

export default Shop