// One-off content update (not a schema migration) — T-108: adds the
// group/facility honesty paragraph (CONTENT_PLAYBOOK §4's exact wording)
// and a "What We Promise Buyers" de-risk FeatureGrid to the live 'about'
// Page doc, between the existing intro richText and ctaBand. Also corrects
// "sources, processes, and prepares" (VNP doesn't process — that happens
// at the Kavita/Piyush Farms partner facility, D-27) wherever it appears,
// in BOTH the hero subhead and the intro richText — a first pass at this
// script fixed the richText but missed the hero, caught via a post-deploy
// live check. Founder section deliberately not included — no real
// name/story exists yet (T-110), see seed-content.ts's comment on this
// same page for the full reasoning.
// Each fix below is independently idempotent (checks its own current
// state), so a partial-apply followed by a re-run always converges.
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

let changed = false;

// Fix 1: hero subhead.
let fixedLayout = layout.map((block) => {
  if (block.blockType !== "hero") return block;
  if (typeof block.subhead === "string" && block.subhead.includes("sources, processes, and prepares")) {
    changed = true;
    return {
      ...block,
      subhead:
        "VNP Global sources and exports agricultural products, built from the ground up to meet the standards international buyers expect.",
    };
  }
  return block;
});

// Fix 2: intro richText.
fixedLayout = fixedLayout.map((block) => {
  if (block.blockType !== "richText") return block;
  const asStr = JSON.stringify(block.content ?? {});
  if (asStr.includes("sources, grades, and processes")) {
    changed = true;
    return richTextBlock(
      "VNP Global sources, grades, and manages export for agricultural products, built from day one around the standards international buyers expect: quality control, documentation, and reliable communication.",
      "Our mission is simple: get consistently graded, safely processed agricultural products to international buyers who can't afford supply-chain surprises. Leadership bios and compliance details live on our Company & Compliance page.",
    );
  }
  return block;
});

// Fix 3: insert group/facility paragraph + de-risk FeatureGrid, only if not
// already present.
const alreadyHasGroupParagraph = JSON.stringify(fixedLayout).includes(
  "Kavita Facility Management (Agro Division)",
);
let newLayout = fixedLayout;
if (!alreadyHasGroupParagraph) {
  changed = true;
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
  newLayout = [...fixedLayout.slice(0, insertAt), ...newBlocks, ...fixedLayout.slice(insertAt)];
}

if (!changed) {
  console.log("Nothing to fix — 'about' page already fully up to date.");
  await payload.destroy();
  process.exit(0);
}

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Updated 'about' (en) layout: ${layout.length} blocks -> ${newLayout.length} blocks.`);
console.log(newLayout.map((b) => (b as { blockType: string }).blockType).join(" -> "));

await payload.destroy();
process.exit(0);
