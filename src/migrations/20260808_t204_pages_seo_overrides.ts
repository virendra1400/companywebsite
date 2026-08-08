import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// T-204 follow-up (D-50): Pages.seo group, same shape as Products.seo
// (added in 20260801_145559_t103_cms_content_model.ts) — mirrors that
// migration's exact column/constraint/index pattern.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" ADD COLUMN "seo_og_image_id" integer;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "seo_description" varchar;
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  CREATE INDEX IF NOT EXISTS "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_seo_og_image_id_media_id_fk";
  DROP INDEX IF EXISTS "pages_seo_seo_og_image_idx";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "seo_og_image_id";
  ALTER TABLE "pages_locales" DROP COLUMN IF EXISTS "seo_title";
  ALTER TABLE "pages_locales" DROP COLUMN IF EXISTS "seo_description";
  `)
}
