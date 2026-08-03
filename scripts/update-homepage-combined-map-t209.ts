// One-off content update (not a schema migration) — T-209/D-46 follow-up:
// homepage's "Markets We're Built to Serve" ExportMap was Gulf-only (T-104/
// D-31), while /export now shows the full owner-confirmed served set (Gulf
// + Southeast Asia + Maldives, see update-export-combined-map-t209.ts) —
// left as-is, homepage would silently contradict the fuller page. Brings
// homepage's exportMap block in sync: same 10 highlighted countries, intro
// updated to drop "Southeast Asia... available on request" (no longer true).
// Idempotent by content, not a skip-if-exists guard — safe to re-run.
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
const marketsBlock = layout.find((b) => b.blockType === "exportMap");

if (!marketsBlock) {
  console.error("No exportMap block found on 'home' — aborting.", {
    found: layout.map((b) => b.blockType),
  });
  await payload.destroy();
  process.exit(1);
}

const newLayout = layout.map((block) =>
  block === marketsBlock
    ? {
        ...block,
        highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM", "SG", "VN", "ID", "MV"],
        intro:
          "Gulf and Middle East buyers first: reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, and Arabic labeling capability. Singapore-anchored logistics extend this reach into Vietnam, Indonesia, and the Maldives.",
      }
    : block,
);

await payload.update({
  collection: "pages",
  id: home.id,
  locale: "en",
  data: { layout: newLayout as never },
  overrideAccess: true,
  context: { disableRevalidate: true },
});

console.log("Updated 'home' (en) exportMap block: highlightedCountryCodes now match /export's combined set.");

await payload.destroy();
process.exit(0);
