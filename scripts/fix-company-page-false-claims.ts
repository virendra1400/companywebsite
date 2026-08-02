// PRIORITY FIX (found during T-108) — production's live 'company' page
// hero + first richText block still say "Star Agrevolution... operates
// under a valid Importer-Exporter Code (IEC) registration... including
// APEDA registration" — a direct false claim of HELD registrations (both
// are actually still in progress, per PROJECT_MEMORY §3 and T-106's
// certifications status board) AND the pre-rebrand company name
// ("Star Agrevolution", not "VNP Global"). seed-content.ts already has the
// correct T-008-fixed wording ("IEC and APEDA registration in progress");
// production was never re-synced after that fix landed — same class of
// staleness as D-27 (catalog) and D-36 (manufacturing page), just with a
// materially worse consequence (false regulatory claim, live).
// Idempotent: skips if the false claim is no longer present.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "pages",
  where: { slug: { equals: "company" } },
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  depth: 0,
  limit: 1,
});

const page = existing.docs[0];
if (!page) {
  console.error("No 'company' page found — aborting.");
  await payload.destroy();
  process.exit(1);
}

const layout = (page.layout ?? []) as Array<Record<string, unknown>>;
const layoutStr = JSON.stringify(layout);

if (!layoutStr.includes("Star Agrevolution") && !layoutStr.includes("operates under a valid")) {
  console.log("False claim / old company name not found — already fixed, skipping.");
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

let fixedCount = 0;
const newLayout = layout.map((block) => {
  if (block.blockType !== "richText") return block;
  const asStr = JSON.stringify(block.content ?? {});
  if (asStr.includes("Star Agrevolution") || asStr.includes("operates under a valid")) {
    fixedCount++;
    return richTextBlock(
      "VNP Global's IEC and APEDA registrations are in progress as part of our export compliance setup. Registration numbers will be published here once issued.",
      "Our documentation team ensures every shipment carries the certificates, phytosanitary clearances, and customs paperwork your import authority requires, verifiable on request, not just claimed.",
    );
  }
  return block;
});

if (fixedCount === 0) {
  console.log("No richText block matched the false-claim pattern — checking hero separately.");
}

// Hero block also carries the old wording in its subhead — fix if present.
const heroIndex = newLayout.findIndex((b) => b.blockType === "hero");
if (heroIndex !== -1) {
  const hero = newLayout[heroIndex] as Record<string, unknown>;
  if (typeof hero.subhead === "string" && hero.subhead.includes("Star Agrevolution")) {
    newLayout[heroIndex] = {
      ...hero,
      subhead: "IEC and APEDA registration in progress, with full export documentation support on every order.",
    };
    fixedCount++;
  }
}

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(`Fixed ${fixedCount} block(s) on 'company' (en) — false registration claim / old company name removed.`);

await payload.destroy();
process.exit(0);
