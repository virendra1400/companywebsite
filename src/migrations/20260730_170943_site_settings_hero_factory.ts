import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "products_hero_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "insights_hero_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_facility_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_street" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_city" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_state" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_postal_code" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "factory_address_country" varchar;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_products_hero_image_id_media_id_fk" FOREIGN KEY ("products_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_insights_hero_image_id_media_id_fk" FOREIGN KEY ("insights_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_products_hero_image_idx" ON "site_settings" USING btree ("products_hero_image_id");
  CREATE INDEX "site_settings_insights_hero_image_idx" ON "site_settings" USING btree ("insights_hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_products_hero_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_insights_hero_image_id_media_id_fk";
  
  DROP INDEX "site_settings_products_hero_image_idx";
  DROP INDEX "site_settings_insights_hero_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "products_hero_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "insights_hero_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_facility_name";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_street";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_city";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_state";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_postal_code";
  ALTER TABLE "site_settings" DROP COLUMN "factory_address_country";`)
}
