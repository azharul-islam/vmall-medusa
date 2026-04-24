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
import { LinkShopToMallSchema } from "./admin/malls/[id]/shops/middlewares"
import { CreateShopAdminSchema, UpdateShopAdminSchema } from "./admin/shops/[id]/admins/middlewares"
import { LinkProductToShopSchema } from "./admin/shops/[id]/products/middlewares"
import { LinkWarehouseToShopSchema } from "./admin/shops/[id]/warehouses/middlewares"
import { UpdatePayoutSchema } from "./admin/shops/[id]/orders/middlewares"
import { RegisterVendorSchema } from "./vendors/register/middlewares"

const adminAuth = authenticate("user", ["session", "bearer", "api-key"])
const vendorAuth = authenticate("vendor", ["session", "bearer"])

export default defineMiddlewares({
  routes: [
    // ─── Marketplace Stats ────────────────────────────────
    {
      matcher: "/admin/marketplace/stats",
      method: "GET",
      middlewares: [adminAuth],
    },

    // ─── Entity Shop Lookup (for detail page widgets) ─────
    {
      matcher: "/admin/products/:id/shop",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/orders/:id/shop",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/stock-locations/:id/shop",
      method: "GET",
      middlewares: [adminAuth],
    },

    // ─── Vendor Registration ─────────────────────────────
    {
      matcher: "/vendors/register",
      method: "POST",
      middlewares: [
        authenticate("vendor", ["bearer"], { allowUnregistered: true }),
        validateAndTransformBody(RegisterVendorSchema),
      ],
    },

    // ─── Vendor-Scoped Routes (admin/vendor/*) ───────────
    {
      matcher: "/admin/vendor",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/me",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/products",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/products",
      method: "POST",
      middlewares: [
        vendorAuth,
        validateAndTransformBody(CreateVendorProductSchema),
      ],
    },
    {
      matcher: "/admin/vendor/products/:product_id",
      method: "DELETE",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/orders",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/payouts",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/warehouses",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/malls",
      method: "GET",
      middlewares: [vendorAuth],
    },
    {
      matcher: "/admin/vendor/profile",
      method: "POST",
      middlewares: [
        vendorAuth,
        validateAndTransformBody(UpdateShopSchema),
      ],
    },

    // ─── Admin Invite Route ──────────────────────────────
    {
      matcher: "/admin/shops/:id/admins/:admin_id/invite",
      method: "POST",
      middlewares: [adminAuth],
    },

    // ─── Admin Mall Routes ───────────────────────────────
    {
      matcher: "/admin/malls",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/malls",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(CreateMallSchema),
      ],
    },
    {
      matcher: "/admin/malls/:id",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/malls/:id",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(UpdateMallSchema),
      ],
    },
    {
      matcher: "/admin/malls/:id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // Admin Mall Shop Links
    {
      matcher: "/admin/malls/:id/shops",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/malls/:id/shops",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(LinkShopToMallSchema),
      ],
    },
    {
      matcher: "/admin/malls/:id/shops/:shop_id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // ─── Admin Shop Routes ───────────────────────────────
    {
      matcher: "/admin/shops",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(CreateShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops/:id",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(UpdateShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // Admin Shop Mall Links
    {
      matcher: "/admin/shops/:id/malls",
      method: "GET",
      middlewares: [adminAuth],
    },
    // Admin Shop Admins
    {
      matcher: "/admin/shops/:id/admins",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops/:id/admins",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(CreateShopAdminSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id/admins/:admin_id",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(UpdateShopAdminSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id/admins/:admin_id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // Admin Shop Products
    {
      matcher: "/admin/shops/:id/products",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops/:id/products",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(LinkProductToShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id/products/:product_id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // Admin Shop Warehouses
    {
      matcher: "/admin/shops/:id/warehouses",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops/:id/warehouses",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(LinkWarehouseToShopSchema),
      ],
    },
    {
      matcher: "/admin/shops/:id/warehouses/:stock_location_id",
      method: "DELETE",
      middlewares: [adminAuth],
    },
    // Admin Shop Orders
    {
      matcher: "/admin/shops/:id/orders",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/admin/shops/:id/orders/:order_id/payout",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(UpdatePayoutSchema),
      ],
    },
    // ─── Legacy Vendor Product Routes ────────────────────
    {
      matcher: "/vendor/products",
      method: "GET",
      middlewares: [adminAuth],
    },
    {
      matcher: "/vendor/products",
      method: "POST",
      middlewares: [
        adminAuth,
        validateAndTransformBody(CreateVendorProductSchema),
      ],
    },
    // ─── Store Routes ────────────────────────────────────
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
