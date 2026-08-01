// One-off content update (not a schema migration) — T-104: realigns the
// live 'home' Page doc's `layout` to CONTENT_PLAYBOOK.md §4's 9-section
// order. Preserves the 5 unchanged blocks (hero, mediaGallery, certStrip,
// exportProcess, ctaBand) exactly as fetched; rewrites trustBar's copy into
// a real proof strip, inserts 2 new blocks (product-category cards, a
// Gulf-first markets section), and rewrites the existing featureGrid's
// value-prop copy into the playbook's exact "de-risk" tile wording.
// Same run-anywhere pattern as scripts/seed-*.ts (local SQLite by default,
// or against DATABASE_URL from a pulled .env.production for the real run).
// Idempotent by content, not by a skip-if-exists guard — safe to re-run,
// each run just overwrites `layout` with the same target shape.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "home" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const home = existing.docs[0];
if (!home) {
  console.error("No 'home' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (home.layout ?? []) as Array<Record<string, unknown>>;
const byType = (t: string) => layout.find((b) => b.blockType === t);

const hero = byType("hero");
const oldFeatureGrid = byType("featureGrid");
const mediaGallery = byType("mediaGallery");
const certStrip = byType("certStrip");
const exportProcess = byType("exportProcess");
const ctaBand = byType("ctaBand");

if (!hero || !oldFeatureGrid || !mediaGallery || !certStrip || !exportProcess || !ctaBand) {
  console.error("Expected block missing from current home layout — aborting without writing.", {
    found: layout.map((b) => b.blockType),
  });
  await payload.destroy();
  process.exit(1);
}

// §4.2 Proof strip — real, already-published facility facts (verbatim
// paraphrase of /manufacturing's live copy), not registrations (none issued
// yet — T-110). Same trustBar block, new content.
const proofStrip = {
  blockType: "trustBar",
  sectionTitle: "Why Buyers Can Trust This Supply Chain",
  items: [
    { name: "Multi-Checkpoint Quality Control" },
    { name: "Temperature-Controlled Cold Storage" },
    { name: "Full Batch Traceability" },
    { name: "Manufactured in Karad, Maharashtra" },
  ],
};

// §4.3 Product categories — 3 cards, one line each. Copy is the EXACT live
// /products category intro text (D-01: reuse real approved copy, don't
// invent new application claims).
const productCategories = {
  blockType: "featureGrid",
  sectionTitle: "What We Export",
  variant: "icon",
  items: [
    {
      icon: "snowflake",
      title: "Frozen Vegetables",
      body: "IQF frozen vegetables, processed and frozen shortly after harvest.",
    },
    {
      icon: "droplet",
      title: "Fruit Pulp & Purees",
      body: "Aseptic fruit pulp and purees for food and beverage processing.",
    },
    {
      icon: "package",
      title: "Value-Added & Specialty",
      body: "Prepared vegetable and paste products for food service and retail.",
    },
  ],
};

// §4.4 "How we de-risk your first order" — exact tile wording from
// CONTENT_PLAYBOOK.md §4 Home item 4. Same featureGrid block, new content
// (replaces the generic Quality/Reliability/Compliance/Global-Reach copy).
const deRiskTiles = {
  blockType: "featureGrid",
  sectionTitle: "How We De-Risk Your First Order",
  variant: "icon",
  items: [
    {
      icon: "fileCheck",
      title: "Open Specifications",
      body: "Full product specifications shared on request, before you place an order — no surprises after the container ships.",
    },
    {
      icon: "refreshCw",
      title: "Sample Program",
      body: "Pre-shipment samples available so you can verify quality before committing to a full order.",
    },
    {
      icon: "shieldCheck",
      title: "Inspection Welcome",
      body: "Third-party inspection welcome at your nomination (SGS, Bureau Veritas, Intertek) — we have nothing to hide.",
    },
    {
      icon: "clock",
      title: "24-Hour Response",
      body: "Every inquiry gets a reply within one business day, from a real person on our export team.",
    },
  ],
};

// §4.8 Markets (Gulf-first) — capability/target-market framing, NOT a
// shipped-to claim (D-01: new company, zero real customer history — see
// CONTENT_PLAYBOOK's own "no fake coverage maps" instruction). Gulf-only
// highlighted set, no stats.
const markets = {
  blockType: "exportMap",
  sectionTitle: "Markets We're Built to Serve",
  intro:
    "Gulf and Middle East buyers first: reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, and Arabic labeling capability. Southeast Asia and other markets available on request.",
  variant: "full",
  highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM"],
  stats: [],
};

const newLayout = [
  hero,
  proofStrip,
  productCategories,
  { ...oldFeatureGrid, ...deRiskTiles, id: oldFeatureGrid.id },
  mediaGallery,
  certStrip,
  exportProcess,
  markets,
  ctaBand,
];

await payload.update({
  collection: "pages",
  id: home.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Updated 'home' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks.`);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
// The Postgres adapter's pool doesn't fully release its keep-alive handle
// on destroy() — without this, the process (and the Vercel buildCommand's
// `&&` chain waiting on it) hangs indefinitely instead of proceeding to
// `npm run build`. Harmless against SQLite (dev) where the process already
// exits cleanly; explicit here so both paths behave the same.
process.exit(0);
