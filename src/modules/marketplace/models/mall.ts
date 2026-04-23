import { model } from "@medusajs/framework/utils"
import MallShop from "./mall-shop"

const Mall = model.define("mall", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  address: model.text().nullable(),
  latitude: model.float().nullable(),
  longitude: model.float().nullable(),
  images: model.json().default({}),
  status: model.enum(["active", "inactive", "coming_soon"]).default("active"),
  mallShops: model.hasMany(() => MallShop, {
    mappedBy: "mall",
  }),
})

export default Mall