// One-off content update (not a schema migration) — T-107: adds processing-
// capability (D-14 exact IQF wording), traceability, and audit-openness
// paragraphs to the live 'manufacturing' Page doc, between the existing
// intro richText and the mediaGallery block. Same pattern as
// update-homepage-t104.ts / update-certifications-page-t106.ts.
// Idempotent: skips if the D-14 wording is already present.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

// D-14 LOCKED wording (DECISION_LOG): "IQF-processed" describes the product
// (true); the facility/capability copy must never claim an in-house IQF
// line — "IQF processing through qualified partner lines; in-house cold
// storage" is the exact required framing.
const IQF_TEXT =
  "Our frozen products are IQF-processed. IQF freezing runs through qualified partner lines; cold storage is in-house at the facility, keeping every batch temperature-controlled from freezing through dispatch.";

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "manufacturing" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const page = existing.docs[0];
if (!page) {
  console.error("No 'manufacturing' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (page.layout ?? []) as Array<Record<string, unknown>>;

const alreadyApplied = layout.some(
  (block) =>
    block.blockType === "richText" &&
    JSON.stringify(block.content ?? {}).includes("qualified partner lines"),
);
if (alreadyApplied) {
  console.log("D-14 IQF wording already present — skipping.");
  await payload.destroy();
  process.exit(0);
}

const galleryIndex = layout.findIndex((block) => block.blockType === "mediaGallery");
if (galleryIndex === -1) {
  console.error("No mediaGallery block found in current layout — aborting without writing.", {
    found: layout.map((b) => b.blockType),
  });
  await payload.destroy();
  process.exit(1);
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

const newBlocks = [
  richTextBlock(
    IQF_TEXT,
    "Every pallet carries a lot code assigned at intake, tracked through processing, packing, and cold storage — the same code links a finished carton back to its intake batch and processing date for full traceability.",
  ),
  richTextBlock(
    "We welcome third-party inspection and documentation review at any stage — including buyer-nominated inspectors (SGS, Bureau Veritas, Intertek) and facility visits, in person or over video call.",
  ),
];

const newLayout = [...layout.slice(0, galleryIndex), ...newBlocks, ...layout.slice(galleryIndex)];

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Updated 'manufacturing' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks.`);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
process.exit(0);
