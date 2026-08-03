// One-off content update (not a schema migration) — T-209/D-46 follow-up:
// owner decision to combine the Gulf and Southeast Asia ExportMap instances
// into one "Our Primary Focus" map (all 10 countries), replacing the
// previous two-map layout. Supersedes update-export-sea-t209.ts (that
// script's SEA-only block no longer exists after this runs).
// Idempotent by content, not a skip-if-exists guard — safe to re-run.
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
const exportMapBlocks = layout.filter((b) => b.blockType === "exportMap");

if (exportMapBlocks.length === 0) {
  console.error("No exportMap blocks found — aborting.", {
    found: layout.map((b) => b.blockType),
  });
  await payload.destroy();
  process.exit(1);
}

const combinedMap = {
  ...exportMapBlocks[0],
  sectionTitle: "Our Primary Focus",
  highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM", "SG", "VN", "ID", "MV"],
  intro:
    "Gulf & Middle East: reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, Arabic labeling capability, and GSO-standard awareness. Singapore-anchored logistics extend this reach into Vietnam, Indonesia, and the Maldives, with capacity to add Malaysia as demand grows.",
};

// Replace the first exportMap block in place with the combined version,
// drop any additional exportMap blocks (the old second Southeast Asia one).
let replaced = false;
const newLayout = layout
  .filter((block) => {
    if (block.blockType !== "exportMap") return true;
    if (!replaced) {
      replaced = true;
      return true;
    }
    return false;
  })
  .map((block) => (block.blockType === "exportMap" && block === exportMapBlocks[0] ? combinedMap : block));

await payload.update({
  collection: "pages",
  id: page.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log(
  `Updated 'export' (en) layout: ${exportMapBlocks.length} exportMap block(s) -> 1 combined "Our Primary Focus" block.`,
);

await payload.destroy();
process.exit(0);
