# Vmall Marketplace — Rolling Roadmap

> This document tracks completed work, current state, and upcoming priorities. Update after each implementation session.

---

## Completed

### Phase 0: Foundation
- [x] Medusa v2.13.6 backend setup with Supabase PostgreSQL
- [x] Custom `marketplace` module with DML models: `Mall`, `Shop`, `ShopAdmin`, `MallShop`
- [x] Module links with `extraColumns`: `shop-product`, `shop-order`, `shop-stock-location`
- [x] 7 core workflows with compensation: create-mall, update-mall, delete-mall, create-shop, update-shop, delete-shop, create-vendor-product
- [x] Order subscriber (`order.placed`) creating `shop_order` links with idempotency
- [x] Migrations generated and applied to live database
- [x] Build passes, deployed successfully

### Phase 1: Admin UI — Core CRUD
- [x] SDK client (`src/admin/lib/sdk.ts`)
- [x] Malls list page (`/malls`) — DataTable, search, pagination, Create FocusModal, delete
- [x] Mall detail page (`/malls/:id`) — breadcrumb, info grid, edit Drawer, Details + Shops tabs
- [x] Shops list page (`/shops`) — DataTable with logo, search, pagination, Create FocusModal, delete
- [x] Shop detail page (`/shops/:id`) — breadcrumb, logo, edit Drawer, 5 tabs (Products, Malls, Admins, Warehouses, Payouts)

### Phase 1: Backend — Link Management
- [x] MallShop management: `GET/POST /admin/malls/:id/shops`, `DELETE /admin/malls/:id/shops/:shop_id`
- [x] ShopAdmin management: `GET/POST /admin/shops/:id/admins`, `POST/DELETE /admin/shops/:id/admins/:admin_id`
- [x] Shop-Product links: `GET/POST /admin/shops/:id/products`, `DELETE /admin/shops/:id/products/:product_id`
- [x] Shop-Warehouse links: `GET/POST /admin/shops/:id/warehouses`, `DELETE /admin/shops/:id/warehouses/:stock_location_id`
- [x] Shop-Order payout: `GET /admin/shops/:id/orders`, `POST /admin/shops/:id/orders/:order_id/payout`
- [x] Authentication added to all admin GET routes

### Phase 1.5: Vendor Auth
- [x] `vendor` actor type in `authMethodsPerActor`
- [x] Register vendor workflow + step (`setAuthAppMetadataStep` with `actorType: "vendor"`)
- [x] `POST /vendors/register` — vendor self-registration with registration JWT
- [x] `POST /admin/shops/:id/admins/:admin_id/invite` — platform admin triggers vendor invite
- [x] 8 vendor-scoped API routes (`/admin/vendor/*`) with automatic shop scoping via `req.auth_context.actor_id`
- [x] Vendor login widget (`login.after` zone) — "Login as Vendor" form
- [x] Vendor dashboard route (`/vendor`) — "My Shop" with 7 tabs
- [x] CSS hiding of core sidebar items for vendors + cleanup widgets
- [x] Password reset subscriber (`auth.password_reset` event)
- [x] Admin UI "Send Invite" button on pending shop admins

### Phase 1.5: Admin Dashboard Widgets
- [x] Product detail widget (`product.details.side.after`) — shop ownership card
- [x] Order detail widget (`order.details.after`) — shop payout breakdown
- [x] Stock location widget (`location.details.after`) — linked shop card
- [x] Marketplace overview route (`/marketplace`) — stats cards, quick actions, recent activity
- [x] Backend stats endpoint (`GET /admin/marketplace/stats`) — aggregated counts + recent items

---

## Current State

**Last updated:** 2026-04-24

The marketplace backend and admin dashboard are **feature-complete for Phase 1 and 1.5**. Vendors can log in via the Medusa admin dashboard, manage their own shop's products/orders/payouts, and the platform admin has full CRUD over malls, shops, and relationships.

All core entity detail pages (Product, Order, Stock Location) show marketplace context via widgets.

---

## Next Steps

### High Priority

| # | Task | Why | Complexity |
|---|---|---|---|
| 1 | **Consumer App Auth** — Supabase Auth for customers, link to Medusa Customer on first login | Required for consumer mobile app | Medium |
| 2 | **Email templates** — vendor invite email, password reset email, order notification emails | Currently only logged to console | Medium |
| 3 | **Vendor Order Management** — allow vendors to update fulfillment status on their orders | Critical vendor self-service feature | Low |
| 4 | **Vendor Product Pricing** — allow vendors to manage variant prices | Currently only creates products | Medium |

### Medium Priority

| # | Task | Why | Complexity |
|---|---|---|---|
| 5 | **Vendor Dashboard Analytics** — sales charts, top products, payout history graph | Improves vendor experience | Medium |
| 6 | **Platform Admin RBAC** — different permission levels for platform operators | When Medusa ships RBAC PR | Low (waiting) |
| 7 | **API Rate Limiting** — prevent abuse of vendor endpoints | Security hardening | Low |

### Phase 2: Shared Catalog & Order Splitting (Major Architectural Change)

> **Defer until:** Vendor auth is solid, admin is polished, consumer app is working.

| # | Task | Description | Complexity |
|---|---|---|---|
| 8 | **`ShopVariant` junction model** | Same product SKU sold by multiple shops. A `Product` becomes a shared catalog entry (title, description, images), while `ShopVariant` links a shop to a product variant with shop-specific price, stock, and SKU. | High |
| 9 | **True order splitting** | One cart checkout creates **multiple Medusa Orders** (one per shop). Requires custom cart-completion workflow that splits line items by shop, creates child orders, and links them to the parent order. | High |
| 10 | **Geographic fulfillment** | Route orders to nearest shop stock location using lat/lng. Requires: shop stock locations with coordinates, distance calculation, fulfillment workflow that selects optimal location. | High |
| 11 | **Multi-Shop Admin** | One vendor admin manages multiple shops (shop switcher in vendor dashboard) | Medium |

### Phase 2: Technical Design Notes

#### Shared Catalog (`ShopVariant`)

```
Product (shared catalog)
  └── ProductVariant (shared)
        └── ShopVariant (shop-specific)
              ├── shop_id
              ├── product_variant_id
              ├── price
              ├── sku
              ├── inventory_quantity
              └── status
```

- `Product` and `ProductVariant` remain native Medusa entities (no changes)
- `ShopVariant` is a new DML model in the marketplace module
- When a vendor "lists" a product, they create a `ShopVariant` record with their own price/stock
- The storefront shows all `ShopVariant` records for a given `ProductVariant`, grouped by shop

#### Order Splitting

Current state: One Medusa Order → `shop_order` links are created post-checkout by subscriber.

Phase 2 state: Cart completion workflow splits items by shop → creates N Medusa Orders (one per shop) → each has its own `shop_order` link → parent order tracks the split.

```
Cart
  └── Checkout
        ├── Order A (Shop 1) → shop_order link
        ├── Order B (Shop 2) → shop_order link
        └── Parent Order (tracking reference)
```

This requires overriding Medusa's default `completeCartWorkflow` or hooking into it.

#### Geographic Fulfillment

```
Customer Address (lat/lng)
  └── Query all ShopStockLocations for the ordered shop
        └── Calculate distance (Haversine formula)
              └── Select nearest location with inventory
                    └── Create fulfillment from that location
```

- Requires `latitude`/`longitude` on `StockLocation` (native Medusa) or our `Mall` model
- `ShopStockLocation` link already has `is_default` — extend with distance scoring
- Fulfillment workflow step: `selectNearestWarehouseStep`

---

## Edge Cases & Deferred Items

| Item | Status | Notes |
|---|---|---|
| Vendor password reset email | Deferred | Subscriber logs token; needs email service integration |
| First-login password change | Deferred | Store `password_change_required` in auth identity metadata |
| Vendor creates product without inventory | Warning banner needed | Check if any warehouses linked before allowing product creation |
| Commission rate changes | By design | Existing `shop_product` links may have different `commission_rate` — per-product overrides are intentional |
| Orphaned auth identities | Cleanup needed | Delete shop admin → should remove auth identity |
| Token refresh bug (#15129) | Known issue | Medusa strips custom `app_metadata` on `/auth/token/refresh` — avoid storing critical data beyond `vendor_id` |
| CSS `:has()` selector | Modern browsers only | Sidebar hiding uses `:has()` — supported in all modern browsers as of 2026 |

---

## How to Update This Document

After each implementation session:

1. Move completed items to the **Completed** section
2. Update **Current State** summary
3. Re-prioritize **Next Steps** based on business needs
4. Add new edge cases or deferred items as discovered

---

## Session History

| Date | What Was Done |
|---|---|
| 2026-04-24 | Phase 1.5 vendor auth + admin dashboard widgets + marketplace overview page |
| 2026-04-24 | Phase 1 backend link management routes + admin UI tabs filled in |
| 2026-04-23 | Phase 1 backend + admin UI (malls + shops CRUD) |
