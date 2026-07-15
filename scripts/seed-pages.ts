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

// Idempotent by alt text — safe to call every seed run without duplicating
// Media docs, whether or not the certification referencing it already exists.
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
