// Local-dev + prod-bootstrap seed: writes all 7 English Pages docs into the
// DB (SQLite dev / Postgres prod, per vercel.json's `db:seed` build step) so
// both environments prerender without an empty-content error. Idempotent
// per-slug — skips a slug that already has an English doc, never duplicates.
// fr/ar/ru are intentionally left unseeded: fallback-notice.spec.ts (and the
// analogous pages-fallback behavior) depends on an untranslated locale
// existing (D-06).
//
// Run standalone (via `npx tsx scripts/seed-pages.ts`) BEFORE starting the dev
// server / Playwright's webServer, never concurrently with it — SQLite only
// tolerates one writer connection at a time (see 01-02-SUMMARY.md Deviation
// #7, same root cause).
// @next/env is CJS with a whole-object `module.exports` reassignment, which
// Node's ESM/CJS named-export static analysis doesn't reliably pick up —
// import the default and destructure at runtime instead.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const { PAGES_EN_SEED } = await import("../src/lib/seed-content");

const payload = await getPayload({ config });

for (const seedPage of PAGES_EN_SEED) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: seedPage.slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Page '${seedPage.slug}' (en) already seeded — skipping.`);
    continue;
  }

  await payload.create({
    collection: "pages",
    locale: "en",
    data: { title: seedPage.title, slug: seedPage.slug, layout: seedPage.layout },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded page '${seedPage.slug}' (en).`);
}

await payload.destroy();
