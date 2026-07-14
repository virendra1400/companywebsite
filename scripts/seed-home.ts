// Local-dev-only seed: writes real English Home content into the dev SQLite
// DB (payload.db) so the e2e suite exercises actual CMS-driven copy instead
// of an empty required field. Idempotent — skips if English content already
// exists. fr/ar/ru are intentionally left unseeded: fallback-notice.spec.ts
// depends on an untranslated locale existing (D-06).
//
// Run standalone (via `npx tsx scripts/seed-home.ts`) BEFORE starting the dev
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
const { HOME_EN_SEED } = await import("../src/lib/seed-content");

const payload = await getPayload({ config });

const existing = await payload.findGlobal({
  slug: "home",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
});

if (existing?.heroHeadline) {
  console.log("Home (en) already seeded — skipping.");
} else {
  await payload.updateGlobal({
    slug: "home",
    locale: "en",
    data: HOME_EN_SEED,
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log("Seeded Home (en) content.");
}

await payload.destroy();
