// One-off content update (not a schema migration) — T-201: replaces the
// live 'export' Page doc's single broad ExportMap (16 highlighted
// countries + a "16+ Target Export Markets" stat tile) with
// CONTENT_PLAYBOOK §4's Gulf-first structure: Gulf/Middle East ExportMap
// first, Southeast Asia ExportMap second, then an "other markets on
// request" richText, before the closing ctaBand. Same pattern as
// update-homepage-t104.ts. Idempotent: skips if already applied.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "export" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const page = existing.docs[0];
if (!page) {
  console.error("No 'export' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (page.layout ?? []) as Array<Record<string, unknown>>;

if (layout.some((b) => b.sectionTitle === "Gulf & Middle East — Our Primary Focus")) {
  console.log("Gulf-first structure already present — skipping.");
  await payload.destroy();
  process.exit(0);
}

function richTextBlock(...paragraphs: string[]) {
  return {
    blockType: "richText",
    content: {
      root: {
        type: "root",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: paragraphs.map((text) => ({
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 }],
        })),
      },
    },
  };
}

const heroIndex = layout.findIndex((b) => b.blockType === "hero");
if (heroIndex !== -1) {
  const hero = layout[heroIndex] as Record<string, unknown>;
  layout[heroIndex] = {
    ...hero,
    subhead:
      "We're positioned to export to the Gulf, Southeast Asia, and other international markets. Reach out to discuss your destination and requirements.",
  };
}

const gulfMap = {
  blockType: "exportMap",
  variant: "full",
  sectionTitle: "Gulf & Middle East — Our Primary Focus",
  intro:
    "Reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, Arabic labeling capability, and GSO-standard awareness — built for Gulf buyers from day one.",
  highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM"],
  stats: [],
};

const seaMap = {
  blockType: "exportMap",
  variant: "compact",
  sectionTitle: "Southeast Asia",
  intro:
    "Singapore-anchored logistics as our entry point into Southeast Asia, with capacity to extend into Malaysia, Indonesia, and Vietnam as demand grows.",
  highlightedCountryCodes: ["SG"],
  stats: [],
};

const otherMarketsNote = richTextBlock(
  "Interested in a market outside the Gulf or Southeast Asia? We take on new destinations on request — reach out to discuss logistics, documentation, and lead time for your specific country.",
);

// Replace the old exportMap block in place with the new Gulf+SEA+note
// sequence, so relative position (after statsBand, before ctaBand) is
// preserved without guessing an insertion index.
const oldMapIndex = layout.findIndex((b) => b.blockType === "exportMap");
const newLayout =
  oldMapIndex === -1
    ? [...layout, gulfMap, seaMap, otherMarketsNote]
    : [...layout.slice(0, oldMapIndex), gulfMap, seaMap, otherMarketsNote, ...layout.slice(oldMapIndex + 1)];

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Updated 'export' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks.`);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
process.exit(0);
