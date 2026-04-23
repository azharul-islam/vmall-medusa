# AGENTS.md - vmall (Medusa v2)

## Project
- Medusa v2.13.6 e-commerce backend
- Node >=20 required
- Package manager: npm (not yarn, despite .yarnrc.yml)

## Commands
```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build Medusa app + admin UI
npm run start      # Start production server
npm run seed       # Seed demo data via medusa exec
npm run test:unit
npm run test:integration:http
npm run test:integration:modules
```

## Testing
- Jest with `--experimental-vm-modules --runInBand --forceExit`
- TEST_TYPE env var controls which tests run:
  - `unit`: `**/src/**/__tests__/**/*.unit.spec.[jt]s`
  - `integration:http`: `**/integration-tests/http/*.spec.[jt]s`
  - `integration:modules`: `**/src/modules/*/__tests__/**/*.[jt]s`
- Setup: `integration-tests/setup.js` clears MikroORM metadata

## Architecture
- `src/api/admin/custom/` - Admin API routes
- `src/api/store/custom/` - Store API routes
- `src/api/middlewares.ts` - Global middleware definitions (auth, validation)
- `src/modules/` - Custom modules
  - `marketplace/` - Mall & Shop multi-vendor marketplace module
- `src/workflows/` - Workflow definitions
  - `steps/` - Individual workflow steps
- `src/links/` - Module links
- `src/admin/` - React admin UI (separate tsconfig, strict mode)
- `src/scripts/seed.ts` - Seed script
- `src/subscribers/` - Event subscribers

## Marketplace Module (Critical)
This project implements a **multi-vendor marketplace** where:
- **Mall** = Shopping center (directory/discovery layer). M:N with Shop via `mall_shop` junction.
- **Shop** = The actual seller. Owns products, receives orders, gets paid.
- **ShopAdmin** = Login identity for shop management. Belongs to Shop.
- **Store** (native Medusa) = Platform-level entity, NOT a seller.

**Key architectural decisions:**
1. Shops create their own independent product listings (same SKU across shops = separate Product records).
2. Mall is purely for discovery/filtering; it does NOT own inventory or receive orders.
3. Order splitting is handled post-checkout via `order.placed` subscriber creating `ShopOrder` link records.
4. Cross-module relationships use `defineLink`. Same-module relationships use DML `hasMany`/`belongsTo`.
5. **ALL mutations go through workflows** (createMallWorkflow, updateShopWorkflow, etc.). Routes NEVER call services directly.
6. **ALL request bodies are validated** with Zod schemas via `validateAndTransformBody` middleware.
7. **Protected routes use `AuthenticatedMedusaRequest`** with `authenticate()` middleware.

**Important:** In Medusa v2, you CANNOT add columns (like `store_id`) directly to core entities (Product, Order, etc.). Use module links instead.

## Layer Architecture (Strict)
```
Module (data models + CRUD operations)
  ↓ used by
Workflow (business logic + mutations with rollback)
  ↓ executed by
API Route (HTTP interface, validation middleware)
  ↓ called by
Frontend (admin dashboard/storefront via SDK)
```

## Environment
Required vars in `.env`: DATABASE_URL, REDIS_URL, STORE_CORS, ADMIN_CORS, AUTH_CORS, JWT_SECRET, COOKIE_SECRET

## Generated (never edit manually)
- `.medusa/types/` - Generated TypeScript definitions
- `.medusa/server/` - Compiled output

## MCP & Skills
- MCP: Medusa docs at `https://docs.medusajs.com/mcp` (configured in opencode.jsonc)
- Skills loaded in `.agents/skills/`:
  - `building-admin-dashboard-customizations` - Admin UI work
  - `building-storefronts` - Storefront development
  - `building-with-medusa` - Backend, API routes, modules, workflows
  - `db-generate` / `db-migrate` - Migrations
  - `storefront-best-practices` - Ecommerce storefront patterns

## Database
```bash
npx medusa db:generate   # Create migration
npx medusa db:migrate    # Apply migrations
```