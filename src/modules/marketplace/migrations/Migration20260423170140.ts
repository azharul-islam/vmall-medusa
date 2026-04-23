import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260423170140 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shop" drop constraint if exists "shop_handle_unique";`);
    this.addSql(`alter table if exists "mall" drop constraint if exists "mall_handle_unique";`);
    this.addSql(`create table if not exists "mall" ("id" text not null, "handle" text not null, "name" text not null, "description" text null, "address" text null, "latitude" real null, "longitude" real null, "images" jsonb not null default '[]', "status" text check ("status" in ('active', 'inactive', 'coming_soon')) not null default 'active', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mall_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mall_handle_unique" ON "mall" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mall_deleted_at" ON "mall" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shop" ("id" text not null, "handle" text not null, "name" text not null, "description" text null, "logo" text null, "banner" text null, "status" text check ("status" in ('pending', 'active', 'suspended')) not null default 'pending', "commission_rate" numeric not null default 0.1, "raw_commission_rate" jsonb not null default '{"value":"0.1","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shop_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shop_handle_unique" ON "shop" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_deleted_at" ON "shop" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "mall_shop" ("id" text not null, "mall_id" text not null, "shop_id" text not null, "floor" text null, "unit_number" text null, "is_anchor" boolean not null default false, "status" text check ("status" in ('active', 'inactive', 'upcoming')) not null default 'active', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mall_shop_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mall_shop_mall_id" ON "mall_shop" ("mall_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mall_shop_shop_id" ON "mall_shop" ("shop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mall_shop_deleted_at" ON "mall_shop" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shop_admin" ("id" text not null, "email" text not null, "first_name" text null, "last_name" text null, "auth_identity_id" text null, "is_owner" boolean not null default false, "status" text check ("status" in ('pending', 'active', 'inactive')) not null default 'pending', "shop_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shop_admin_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_admin_shop_id" ON "shop_admin" ("shop_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shop_admin_deleted_at" ON "shop_admin" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "mall_shop" add constraint "mall_shop_mall_id_foreign" foreign key ("mall_id") references "mall" ("id") on update cascade;`);
    this.addSql(`alter table if exists "mall_shop" add constraint "mall_shop_shop_id_foreign" foreign key ("shop_id") references "shop" ("id") on update cascade;`);

    this.addSql(`alter table if exists "shop_admin" add constraint "shop_admin_shop_id_foreign" foreign key ("shop_id") references "shop" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "mall_shop" drop constraint if exists "mall_shop_mall_id_foreign";`);

    this.addSql(`alter table if exists "mall_shop" drop constraint if exists "mall_shop_shop_id_foreign";`);

    this.addSql(`alter table if exists "shop_admin" drop constraint if exists "shop_admin_shop_id_foreign";`);

    this.addSql(`drop table if exists "mall" cascade;`);

    this.addSql(`drop table if exists "shop" cascade;`);

    this.addSql(`drop table if exists "mall_shop" cascade;`);

    this.addSql(`drop table if exists "shop_admin" cascade;`);
  }

}
