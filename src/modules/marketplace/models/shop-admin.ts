import { model } from "@medusajs/framework/utils"
import Shop from "./shop"

const ShopAdmin = model.define("shop_admin", {
  id: model.id().primaryKey(),
  email: model.text(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  auth_identity_id: model.text().nullable(),
  is_owner: model.boolean().default(false),
  status: model.enum(["pending", "active", "inactive"]).default("pending"),
  shop: model.belongsTo(() => Shop, {
    mappedBy: "admins",
  }),
})

export default ShopAdmin