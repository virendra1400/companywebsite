import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// T-108 follow-up (owner-requested 2026-08-09): optional per-item link URL
// on FeatureGrid (photo variant only — leadership-tile LinkedIn profiles).
// `payload migrate:create`'s drizzle-kit introspection step currently fails
// against this Neon DB (RLS metadata drizzle-kit's zod schema doesn't
// recognize — pre-existing tooling gap, unrelated to this change), so this
// migration is hand-written, matching pages_blocks_feature_grid_items'
// existing column shape exactly (see 20260716_120723_init.ts).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_feature_grid_items" ADD COLUMN "link" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_feature_grid_items" DROP COLUMN IF EXISTS "link";
  `)
}
