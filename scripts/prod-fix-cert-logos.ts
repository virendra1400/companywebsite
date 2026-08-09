// T-206 follow-up: replaces the IEC/GST/FSSAI "SVG" cert logos with real
// PNGs. The uploaded files were raster images wearing a .svg extension —
// each an SVG wrapper containing one base64 <image> and ZERO <path> elements
// (IEC 296x282/131,742B, GST 200x200/94,774B, FSSAI 477x241/73,662B = 300KB
// on every page). The extension made isSvgUrl() true, which sets
// `unoptimized` on <Image> (correct — Next refuses to optimize SVG), so they
// bypassed /_next/image entirely and base64 added a further ~33%.
//
// scripts/seed-assets/cert-*-logo.png are those same rasters extracted,
// sharp .trim()'d to real content bounds and re-encoded as palette PNGs
// (300KB -> 60KB before delivery optimisation; once they are no longer .svg,
// /_next/image serves them as sized WebP, smaller again). Transparency is
// preserved — verified alpha=true on all three.
//
// Idempotent: skips any cert whose logo filename already starts with "cert-".
import "./prod-env";

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const payload = await getPayload({ config });

const DRY = process.argv.includes("--dry");
if (DRY) console.log("\n*** DRY RUN — no writes ***\n");

// Matched on the certification's own name, not an id, so this stays correct
// if display order or ids ever change.
const REPLACEMENTS: { match: RegExp; asset: string; alt: string }[] = [
  { match: /Importer-Exporter Code/i, asset: "scripts/seed-assets/cert-iec-logo.png", alt: "Importer-Exporter Code (IEC) logo" },
  { match: /GST/i, asset: "scripts/seed-assets/cert-gst-logo.png", alt: "GST registration logo" },
  { match: /FSSAI|Food Safety and Standards/i, asset: "scripts/seed-assets/cert-fssai-logo.png", alt: "FSSAI licence logo" },
];

const certs = await payload.find({
  collection: "certifications",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  limit: 100,
});

for (const cert of certs.docs) {
  const name = String((cert as any).name);
  const rule = REPLACEMENTS.find((r) => r.match.test(name));
  if (!rule) continue;

  const current = (cert as any).logo;
  const filename =
    current && typeof current === "object" && "filename" in current ? String(current.filename) : "";
  if (filename.startsWith("cert-")) {
    console.log(`${name.slice(0, 40)}: already replaced (${filename}) — skipping`);
    continue;
  }

  console.log(`${name.slice(0, 40)}: ${filename || "(no logo)"} -> ${rule.asset.split("/").pop()}`);
  if (DRY) continue;

  const media = await payload.create({
    collection: "media",
    data: { alt: rule.alt },
    filePath: rule.asset,
    overrideAccess: true,
  });
  await payload.update({
    collection: "certifications",
    id: (cert as any).id,
    locale: "en",
    data: { logo: media.id },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
}

console.log("\nDone.");
await payload.destroy();
process.exit(0);
