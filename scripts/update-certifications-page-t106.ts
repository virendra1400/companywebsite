// One-off content update (not a schema migration) — T-106: adds the
// audit-openness statement, per-shipment documentation list, and sample-COA
// document card to the live 'certifications' Page doc's layout, between the
// existing certStrip and ctaBand blocks. Same pattern as
// update-homepage-t104.ts (Payload local API, direct content edit).
// Idempotent: skips if a richText block with the audit-openness text
// already exists.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const AUDIT_TEXT =
  "We welcome third-party inspection and documentation review at any stage, before or after certification is complete — including buyer-nominated inspectors (SGS, Bureau Veritas, Intertek) and unannounced facility visits.";

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "certifications" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const page = existing.docs[0];
if (!page) {
  console.error("No 'certifications' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (page.layout ?? []) as Array<Record<string, unknown>>;

const alreadyApplied = layout.some(
  (block) =>
    block.blockType === "richText" &&
    JSON.stringify(block.content ?? {}).includes(AUDIT_TEXT.slice(0, 30)),
);
if (alreadyApplied) {
  console.log("Audit-openness content already present — skipping.");
  await payload.destroy();
  process.exit(0);
}

const certStripIndex = layout.findIndex((block) => block.blockType === "certStrip");
if (certStripIndex === -1) {
  console.error("No certStrip block found in current layout — aborting without writing.", {
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
    AUDIT_TEXT,
    "Every shipment travels with a Certificate of Analysis (COA), health certificate, phytosanitary certificate, and certificate of origin (COO). A Halal certificate is included where applicable to the product.",
  ),
  {
    blockType: "documentCard",
    title: "Sample Certificate of Analysis (COA)",
    description: "A redacted example COA showing the format and parameters we report on, available on request.",
  },
];

const newLayout = [
  ...layout.slice(0, certStripIndex + 1),
  ...newBlocks,
  ...layout.slice(certStripIndex + 1),
];

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Updated 'certifications' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks.`);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
process.exit(0);
