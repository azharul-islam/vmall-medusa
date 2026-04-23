import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import { validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import {
  CreateMallSchema,
  UpdateMallSchema,
  GetMallsSchema,
} from "./admin/malls/middlewares"
import {
  CreateShopSchema,
  UpdateShopSchema,
  GetShopsSchema,
} from "./admin/shops/middlewares"
import { CreateVendorProductSchema } from "./vendor/products/middlewares"

export default defineMiddlewares({
  routes: [
    // Admin Mall Routes
    {
      matcher: "/admin/malls",
      method: "POST",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
        validateAndTransformBody(CreateMallSchema),
      ],
    },
    {
      matcher: "/admin/malls/:id",
      method: "POST",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
        validateAndTransformBody(UpdateMallSchema),
      ],
    },
    {
      matcher: "/admin/malls/:id",
      method: "DELETE",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    // Admin Shop Routes
    {
      matcher: "/admin/shops",
      method: "POST",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
        validateAndTransformBody(CreateShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id",
      method: "POST",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
        validateAndTransformBody(UpdateShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id",
      method: "DELETE",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    // Vendor Product Routes
    {
      matcher: "/vendor/products",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateVendorProductSchema)],
    },
    // Store Mall Routes with query config
    {
      matcher: "/store/malls",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetMallsSchema, {
          defaults: ["id", "name", "handle", "status", "images"],
          isList: true,
          defaultLimit: 20,
        }),
      ],
    },
    {
      matcher: "/store/malls/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          defaults: ["id", "name", "handle", "description", "address", "latitude", "longitude", "images", "status"],
          isList: false,
        }),
      ],
    },
    // Store Shop Product Routes with query config
    {
      matcher: "/store/shops/:id/products",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          defaults: ["id", "title", "handle", "thumbnail", "status"],
          isList: true,
          defaultLimit: 20,
        }),
      ],
    },
  ],
})