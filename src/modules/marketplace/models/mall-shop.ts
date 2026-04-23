import { model } from "@medusajs/framework/utils"
import Mall from "./mall"
import Shop from "./shop"

const MallShop = model.define("mall_shop", {
  id: model.id().primaryKey(),
  mall: model.belongsTo(() => Mall, {
    mappedBy: "mallShops",
  }),
  shop: model.belongsTo(() => Shop, {
    mappedBy: "mallShops",
  }),
  floor: model.text().nullable(),
  unit_number: model.text().nullable(),
  is_anchor: model.boolean().default(false),
  status: model.enum(["active", "inactive", "upcoming"]).default("active"),
})

export default MallShop