import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "legal_identity_cin" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_identity_gst" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_identity_iec" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "legal_identity_fssai" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "legal_identity_cin";
  ALTER TABLE "site_settings" DROP COLUMN "legal_identity_gst";
  ALTER TABLE "site_settings" DROP COLUMN "legal_identity_iec";
  ALTER TABLE "site_settings" DROP COLUMN "legal_identity_fssai";`)
}
