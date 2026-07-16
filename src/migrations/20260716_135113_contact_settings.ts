import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar DEFAULT 'sales@example.com' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "contact_phone" varchar DEFAULT '+91 00000 00000' NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "contact_whatsapp" varchar DEFAULT '910000000000' NOT NULL;
  ALTER TABLE "pages_blocks_contact_block" DROP COLUMN "whatsapp";
  ALTER TABLE "pages_blocks_contact_block" DROP COLUMN "email";
  ALTER TABLE "pages_blocks_contact_block" DROP COLUMN "phone";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contact_block" ADD COLUMN "whatsapp" varchar NOT NULL;
  ALTER TABLE "pages_blocks_contact_block" ADD COLUMN "email" varchar NOT NULL;
  ALTER TABLE "pages_blocks_contact_block" ADD COLUMN "phone" varchar NOT NULL;
  ALTER TABLE "site_settings" DROP COLUMN "contact_email";
  ALTER TABLE "site_settings" DROP COLUMN "contact_phone";
  ALTER TABLE "site_settings" DROP COLUMN "contact_whatsapp";`)
}
