import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Fixes 20260808_t202_site_settings_resource_documents.ts, which already ran
// in production and is tracked as applied — cannot edit that file, this
// corrects it forward. The original wrongly put title/description/_locale
// directly on the array-row table (copied products_specs_*'s pattern, where
// EVERY sub-field on that row is locale-specific). resourceDocuments mixes
// localized (title/description) and non-localized (file) sub-fields, same
// shape as Products.downloads — that needs a separate child `_locales`
// table, per 20260801_145559_t103_cms_content_model.ts's
// products_downloads/products_downloads_locales pair. Confirmed against
// that exact migration's schema before writing this, not guessed twice.
// resourceDocuments was empty in every environment when this ran (T-110
// still blocked, nothing to migrate forward) — safe to drop and recreate
// rather than move data.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings_resource_documents" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "site_settings_resource_documents" DROP COLUMN IF EXISTS "description";
  ALTER TABLE "site_settings_resource_documents" DROP COLUMN IF EXISTS "_locale";
  CREATE TABLE IF NOT EXISTS "site_settings_resource_documents_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  DO $$ BEGIN
   ALTER TABLE "site_settings_resource_documents_locales" ADD CONSTRAINT "site_settings_resource_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_resource_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_resource_documents_locales_locale_parent_id_unique" ON "site_settings_resource_documents_locales" USING btree ("_locale","_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "site_settings_resource_documents_locales" CASCADE;
  ALTER TABLE "site_settings_resource_documents" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "site_settings_resource_documents" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "site_settings_resource_documents" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  `)
}
