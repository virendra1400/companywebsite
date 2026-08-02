// One-off content update (not a schema migration) — T-108: adds the
// group/facility honesty paragraph (CONTENT_PLAYBOOK §4's exact wording)
// and a "What We Promise Buyers" de-risk FeatureGrid to the live 'about'
// Page doc, between the existing intro richText and ctaBand. Also corrects
// the intro's "sources, processes, and prepares" framing (VNP doesn't
// process — that happens at the Kavita/Piyush Farms partner facility,
// D-27) to "sources and exports". Founder section deliberately not
// included — no real name/story exists yet (T-110), see seed-content.ts's
// comment on this same page for the full reasoning.
// Idempotent: skips if the group/facility sentence is already present.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "about" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const page = existing.docs[0];
if (!page) {
  console.error("No 'about' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (page.layout ?? []) as Array<Record<string, unknown>>;
const layoutStr = JSON.stringify(layout);

if (layoutStr.includes("Kavita Facility Management (Agro Division)")) {
  console.log("Group/facility paragraph already present — skipping.");
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

// Correct the intro richText's "sources, processes, and prepares" ->
// "sources, grades, and manages export for" (VNP doesn't process itself).
let introFixed = false;
const fixedLayout = layout.map((block) => {
  if (block.blockType !== "richText") return block;
  const asStr = JSON.stringify(block.content ?? {});
  if (asStr.includes("sources, grades, and processes")) {
    introFixed = true;
    return richTextBlock(
      "VNP Global sources, grades, and manages export for agricultural products, built from day one around the standards international buyers expect: quality control, documentation, and reliable communication.",
      "Our mission is simple: get consistently graded, safely processed agricultural products to international buyers who can't afford supply-chain surprises. Leadership bios and compliance details live on our Company & Compliance page.",
    );
  }
  return block;
});

const newBlocks = [
  richTextBlock(
    "VNP Global is a new export company. Our products are manufactured at the Kavita Facility Management (Agro Division) plant in Tasawade MIDC, Karad — an operating processor also behind the Piyush Farms brand.",
  ),
  {
    blockType: "featureGrid",
    variant: "icon",
    sectionTitle: "What We Promise Buyers",
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
  },
];

const ctaIndex = fixedLayout.findIndex((block) => block.blockType === "ctaBand");
const insertAt = ctaIndex === -1 ? fixedLayout.length : ctaIndex;
const newLayout = [...fixedLayout.slice(0, insertAt), ...newBlocks, ...fixedLayout.slice(insertAt)];

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(
  `Updated 'about' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks. Intro fixed: ${introFixed}.`,
);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
process.exit(0);
