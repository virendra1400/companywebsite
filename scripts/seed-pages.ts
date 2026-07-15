// Local-dev + prod-bootstrap seed: writes all 7 English Pages docs into the
// DB (SQLite dev / Postgres prod, per vercel.json's `db:seed` build step) so
// both environments prerender without an empty-content error. Idempotent
// per-slug — skips a slug that already has an English doc, never duplicates.
// fr/ar/ru are intentionally left unseeded: fallback-notice.spec.ts (and the
// analogous pages-fallback behavior) depends on an untranslated locale
// existing (D-06).
//
// Run standalone (via `npx tsx scripts/seed-pages.ts`) BEFORE starting the dev
// server / Playwright's webServer, never concurrently with it — SQLite only
// tolerates one writer connection at a time (see 01-02-SUMMARY.md Deviation
// #7, same root cause).
// @next/env is CJS with a whole-object `module.exports` reassignment, which
// Node's ESM/CJS named-export static analysis doesn't reliably pick up —
// import the default and destructure at runtime instead.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const { PAGES_EN_SEED } = await import("../src/lib/seed-content");

const payload = await getPayload({ config });

// Idempotent by alt text — safe to call every seed run without duplicating
// Media docs, whether or not the doc referencing it already exists. Defined
// early: MediaGallery's `image` field is required (UI-SPEC §6), so unlike
// FeatureGrid's optional `photo` (patched in AFTER page creation, see
// attachLeadershipPhotos below), facility photos must be uploaded and
// injected into PAGES_EN_SEED BEFORE the page is created.
async function upsertMediaByAlt(alt: string, filePath: string) {
  const existing = await payload.find({
    collection: "media",
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) return existing.docs[0];
  return payload.create({
    collection: "media",
    data: { alt },
    filePath,
    overrideAccess: true,
  });
}

// --- Manufacturing facility placeholder photos (TRUST-03) -----------------
// Self-authored generic labeled placeholders (T-02-11: accept, no
// confidential facility imagery) — see scripts/seed-assets/README.md. Keys
// match the MediaGallery item `caption` strings authored in seed-content.ts's
// manufacturing page layout.
const FACILITY_PHOTOS: Record<string, string> = {
  "Processing Floor": "scripts/seed-assets/facility-processing-floor.svg",
  "Quality Control Lab": "scripts/seed-assets/facility-quality-lab.svg",
  "Cold Storage": "scripts/seed-assets/facility-cold-storage.svg",
  "Packing & Dispatch": "scripts/seed-assets/facility-packing-line.svg",
};

// Mutates the 'manufacturing' entry's mediaGallery block in PAGES_EN_SEED
// in place, uploading (idempotently) a Media doc per caption and attaching
// its id — runs BEFORE the create loop below so the required `image` field
// is always populated at creation time. Re-running is safe: upsertMediaByAlt
// never duplicates, and this always re-injects the same ids.
async function injectFacilityPhotos() {
  const manufacturingPage = PAGES_EN_SEED.find((p) => p.slug === "manufacturing");
  const galleryBlock = manufacturingPage?.layout.find(
    (b): b is Extract<(typeof manufacturingPage.layout)[number], { blockType: "mediaGallery" }> =>
      b.blockType === "mediaGallery",
  );
  if (!galleryBlock) return;

  for (const item of galleryBlock.items) {
    const assetPath = FACILITY_PHOTOS[item.caption];
    if (!assetPath) continue;
    const media = await upsertMediaByAlt(`${item.caption} placeholder photo`, assetPath);
    item.image = media.id;
  }
}

await injectFacilityPhotos();

for (const seedPage of PAGES_EN_SEED) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: seedPage.slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Page '${seedPage.slug}' (en) already seeded — skipping.`);
    continue;
  }

  await payload.create({
    collection: "pages",
    locale: "en",
    data: { title: seedPage.title, slug: seedPage.slug, layout: seedPage.layout },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded page '${seedPage.slug}' (en).`);
}

// --- Certifications (TRUST-01/02) ---------------------------------------
// Self-authored placeholder logos + a placeholder PDF under
// scripts/seed-assets/ (see that dir's README — NOT real cert-body logos or
// documents, no fabricated certificate/registration numbers, Pitfall 5/9).
// One halal:true cert (elevated + PDF-present), one standard PDF-present,
// one standard PDF-absent ("available on request").
const CERTIFICATIONS_EN_SEED = [
  {
    name: "Halal Certification for Food Processing & Export",
    issuingBody: "International Halal Accreditation Forum",
    halal: true,
    logoPath: "scripts/seed-assets/logo-halal.svg",
    hasPdf: true,
    displayOrder: 1,
  },
  {
    name: "Food Safety System Certification (FSSC) 22000",
    issuingBody: "FSSC Foundation",
    halal: false,
    logoPath: "scripts/seed-assets/logo-food-safety.svg",
    hasPdf: true,
    displayOrder: 2,
  },
  {
    name: "ISO 22000:2018 Food Safety Management Systems Certification",
    issuingBody: "International Organization for Standardization",
    halal: false,
    logoPath: "scripts/seed-assets/logo-iso-22000.svg",
    hasPdf: false, // drives the PDF-absent "available on request" state
    displayOrder: 3,
  },
];

// --- Company/Compliance leadership placeholder photos (TRUST-05) ---------
// Self-authored generic initials-in-circle avatars (T-02-09: no real people
// photos) — see scripts/seed-assets/README.md. Keys match the FeatureGrid
// item `title` strings authored in seed-content.ts's company page layout.
const LEADERSHIP_AVATARS: Record<string, string> = {
  "Managing Director": "scripts/seed-assets/avatar-managing-director.svg",
  "Head of Quality & Compliance": "scripts/seed-assets/avatar-quality-compliance.svg",
  "Export Operations Manager": "scripts/seed-assets/avatar-export-operations.svg",
};

// Idempotent: re-reads the already-seeded 'company' page and only fills in
// items whose `photo` is still unset, so re-running this script never
// re-uploads or re-links Media. No-ops entirely if the page doesn't exist
// yet (a fresh Pages doc, not this script's concern to create twice).
async function attachLeadershipPhotos() {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "company" } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });
  const companyDoc = existing.docs[0];
  if (!companyDoc) return;

  let changed = false;
  const layout = [];
  for (const block of companyDoc.layout ?? []) {
    if (block.blockType !== "featureGrid" || block.variant !== "photo") {
      layout.push(block);
      continue;
    }
    const items = [];
    for (const item of block.items ?? []) {
      if (item.photo) {
        items.push(item); // already linked — idempotent
        continue;
      }
      const assetPath = item.title ? LEADERSHIP_AVATARS[item.title] : undefined;
      if (!assetPath) {
        items.push(item);
        continue;
      }
      const media = await upsertMediaByAlt(`${item.title} placeholder photo`, assetPath);
      items.push({ ...item, photo: media.id });
      changed = true;
    }
    layout.push({ ...block, items });
  }

  if (!changed) {
    console.log("Company leadership photos already attached — skipping.");
    return;
  }

  await payload.update({
    collection: "pages",
    id: companyDoc.id,
    locale: "en",
    data: { layout },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log("Attached leadership placeholder photos to the 'company' page.");
}

await attachLeadershipPhotos();

let sharedPdfId: number | null = null;

for (const cert of CERTIFICATIONS_EN_SEED) {
  const existingCert = await payload.find({
    collection: "certifications",
    where: { name: { equals: cert.name } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existingCert.docs[0]) {
    console.log(`Certification '${cert.name}' already seeded — skipping.`);
    continue;
  }

  const logoDoc = await upsertMediaByAlt(`${cert.name} logo`, cert.logoPath);

  if (cert.hasPdf && sharedPdfId === null) {
    const pdfDoc = await upsertMediaByAlt(
      "Sample certificate placeholder PDF",
      "scripts/seed-assets/sample-certificate.pdf",
    );
    sharedPdfId = pdfDoc.id;
  }

  await payload.create({
    collection: "certifications",
    locale: "en",
    data: {
      name: cert.name,
      issuingBody: cert.issuingBody,
      logo: logoDoc.id,
      certificatePdf: cert.hasPdf ? (sharedPdfId ?? undefined) : undefined,
      halal: cert.halal,
      displayOrder: cert.displayOrder,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded certification '${cert.name}'.`);
}

await payload.destroy();
