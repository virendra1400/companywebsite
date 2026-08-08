import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// T-202 (D-53): SiteSettings.resourceDocuments — localized array field
// (title/description/file), same pattern as products_specs_* localized
// arrays from 20260801_145559_t103_cms_content_model.ts.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "site_settings_resource_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"file_id" integer
  );
  DO $$ BEGIN
   ALTER TABLE "site_settings_resource_documents" ADD CONSTRAINT "site_settings_resource_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "site_settings_resource_documents" ADD CONSTRAINT "site_settings_resource_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_resource_documents_order_idx" ON "site_settings_resource_documents" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_resource_documents_parent_id_idx" ON "site_settings_resource_documents" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_resource_documents_locale_idx" ON "site_settings_resource_documents" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "site_settings_resource_documents_file_idx" ON "site_settings_resource_documents" USING btree ("file_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "site_settings_resource_documents" CASCADE;
  `)
}
