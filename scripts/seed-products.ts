// Local-dev + prod-bootstrap seed: writes Categories + Products docs into the
// DB (SQLite dev / Postgres prod, per vercel.json's `db:seed` build step) so
// both environments prerender `/products` without an empty-content error.
// Idempotent — skip-by-name for categories, skip-by-slug for products, never
// duplicates. Mirrors scripts/seed-pages.ts's structure (nextEnv, dynamic
// import, own upsertMediaByAlt, payload.destroy at end).
//
// RESEARCH Open Q2: 4 categories seeded, "Oilseeds" deliberately left with
// zero PUBLISHED products (its only product, "Draft Sesame Seeds", is
// published:false) — exercises both the empty-category state and the
// published-exclusion filter in the same fixture (CAT-01/CAT-04).
//
// Illustrative shapes only — spec values (moisture %, grain length, etc.) are
// NOT verified lab grades; do not present as real certification/registration
// numbers or client claims (UI-SPEC placeholder-copy caution).
//
// @next/env is CJS with a whole-object `module.exports` reassignment, which
// Node's ESM/CJS named-export static analysis doesn't reliably pick up —
// import the default and destructure at runtime instead.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

// Idempotent by alt text — safe to call every seed run without duplicating
// Media docs, whether or not the doc referencing it already exists.
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

// Names must exactly match scripts/seed-pages.ts's CERTIFICATIONS_EN_SEED so
// the `payload.find` lookup below resolves real ids (seed-pages.ts runs
// first in the `db:seed` script — see package.json).
const CERT_NAMES = {
  halal: "Halal Certification for Food Processing & Export",
  fssc: "Food Safety System Certification (FSSC) 22000",
  iso: "ISO 22000:2018 Food Safety Management Systems Certification",
} as const;

async function findCertIdByName(name: string): Promise<number | undefined> {
  const result = await payload.find({
    collection: "certifications",
    where: { name: { equals: name } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });
  return result.docs[0]?.id;
}

// --- Categories (D-01) ----------------------------------------------------
const CATEGORIES_EN_SEED = [
  { name: "Grains", slug: "grains", shortDescription: "Rice and grain exports, sorted and graded for consistent quality.", displayOrder: 1 },
  { name: "Spices", slug: "spices", shortDescription: "Whole and ground spices for global food processing and retail.", displayOrder: 2 },
  { name: "Pulses", slug: "pulses", shortDescription: "Lentils and legumes, cleaned and export-graded.", displayOrder: 3 },
  { name: "Oilseeds", slug: "oilseeds", shortDescription: "Oilseed exports for processing and retail markets.", displayOrder: 4 },
] as const;

const categoryIds: Record<string, number> = {};

for (const cat of CATEGORIES_EN_SEED) {
  const existing = await payload.find({
    collection: "categories",
    where: { name: { equals: cat.name } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Category '${cat.name}' already seeded — skipping.`);
    categoryIds[cat.slug] = existing.docs[0].id;
    continue;
  }

  const doc = await payload.create({
    collection: "categories",
    locale: "en",
    data: {
      name: cat.name,
      slug: cat.slug,
      shortDescription: cat.shortDescription,
      displayOrder: cat.displayOrder,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  categoryIds[cat.slug] = doc.id;
  console.log(`Seeded category '${cat.name}'.`);
}

// --- Products (D-02/D-04) --------------------------------------------------
// Spec-row counts deliberately span 0/1/3/5 (CAT-04); galleries span
// 1/2/0 images (CAT-04 empty-gallery state); "Draft Sesame Seeds" is
// published:false (T-03-01) and keeps Oilseeds an empty PUBLISHED category.
type ProductSeed = {
  name: string;
  slug: string;
  categorySlug: string;
  shortDescription: string;
  specifications: { label: string; value: string }[];
  packaging?: string;
  galleryAssets: { alt: string; path: string }[];
  certNames: string[];
  published: boolean;
  displayOrder: number;
};

const BASMATI_SVG = "scripts/seed-assets/product-basmati-rice.svg";
const TURMERIC_SVG = "scripts/seed-assets/product-turmeric.svg";
const LENTILS_SVG = "scripts/seed-assets/product-lentils.svg";

const PRODUCTS_EN_SEED: ProductSeed[] = [
  {
    name: "Premium Long-Grain Basmati Rice",
    slug: "premium-long-grain-basmati-rice",
    categorySlug: "grains",
    shortDescription:
      "Aromatic, aged long-grain basmati rice, sorted and graded for consistent export quality.",
    specifications: [
      { label: "Grain Length", value: "≥ 6.61mm" },
      { label: "Moisture Content", value: "≤ 14%" },
      { label: "Broken Grains", value: "≤ 5%" },
      { label: "Average Aging", value: "12 months" },
      { label: "Admixture", value: "≤ 2%" },
    ],
    packaging: "25kg / 50kg PP bags, or custom retail packaging on request",
    galleryAssets: [
      { alt: "Premium Long-Grain Basmati Rice photo 1", path: BASMATI_SVG },
      { alt: "Premium Long-Grain Basmati Rice photo 2", path: BASMATI_SVG },
    ],
    certNames: [CERT_NAMES.halal, CERT_NAMES.fssc],
    published: true,
    displayOrder: 1,
  },
  {
    name: "Parboiled Rice",
    slug: "parboiled-rice",
    categorySlug: "grains",
    shortDescription: "Steam-parboiled rice with consistent grain integrity for bulk export.",
    specifications: [{ label: "Moisture Content", value: "≤ 14%" }],
    packaging: "25kg / 50kg PP bags",
    galleryAssets: [{ alt: "Parboiled Rice photo", path: BASMATI_SVG }],
    certNames: [],
    published: true,
    displayOrder: 2,
  },
  {
    name: "Ground Turmeric",
    slug: "ground-turmeric",
    categorySlug: "spices",
    shortDescription: "Vibrant, finely ground turmeric powder for food processing and retail.",
    specifications: [
      { label: "Curcumin Content", value: "≥ 3%" },
      { label: "Moisture Content", value: "≤ 10%" },
      { label: "Mesh Size", value: "60 mesh" },
    ],
    packaging: "25kg multi-wall paper bags, retail pouches on request",
    galleryAssets: [{ alt: "Ground Turmeric photo", path: TURMERIC_SVG }],
    certNames: [CERT_NAMES.fssc],
    published: true,
    displayOrder: 1,
  },
  {
    name: "Whole Cumin Seeds",
    slug: "whole-cumin-seeds",
    categorySlug: "spices",
    shortDescription: "Cleaned, sorted whole cumin seeds for export-grade spice supply.",
    specifications: [], // CAT-04: 0 rows — SpecTable region omitted entirely
    // packaging intentionally omitted — CAT-04 packaging-row omission state
    galleryAssets: [{ alt: "Whole Cumin Seeds photo", path: TURMERIC_SVG }],
    certNames: [],
    published: true,
    displayOrder: 2,
  },
  {
    name: "Red Lentils",
    slug: "red-lentils",
    categorySlug: "pulses",
    shortDescription: "Cleaned, export-graded red lentils (masoor dal) for bulk food supply.",
    specifications: [
      { label: "Moisture Content", value: "≤ 12%" },
      { label: "Foreign Matter", value: "≤ 1%" },
      { label: "Broken", value: "≤ 3%" },
      { label: "Weevilled", value: "≤ 1%" },
      { label: "Admixture", value: "≤ 2%" },
    ],
    packaging: "25kg / 50kg PP bags",
    galleryAssets: [], // CAT-04: empty gallery — ImageOff placeholder state
    certNames: [CERT_NAMES.iso],
    published: true,
    displayOrder: 1,
  },
  {
    name: "Draft Sesame Seeds",
    slug: "draft-sesame-seeds",
    categorySlug: "oilseeds",
    shortDescription: "Not yet published — exercises the published:false exclusion filter.",
    specifications: [{ label: "Oil Content", value: "≥ 48%" }],
    galleryAssets: [],
    certNames: [],
    published: false, // T-03-01: keeps Oilseeds an empty PUBLISHED category
    displayOrder: 1,
  },
];

for (const product of PRODUCTS_EN_SEED) {
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: product.slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Product '${product.slug}' (en) already seeded — skipping.`);
    continue;
  }

  const galleryImageIds = [];
  for (const asset of product.galleryAssets) {
    const media = await upsertMediaByAlt(asset.alt, asset.path);
    galleryImageIds.push({ image: media.id });
  }

  const certIds: number[] = [];
  for (const certName of product.certNames) {
    const certId = await findCertIdByName(certName);
    if (certId) certIds.push(certId);
    else console.log(`Certification '${certName}' not found — skipping relation for '${product.slug}'.`);
  }

  await payload.create({
    collection: "products",
    locale: "en",
    data: {
      name: product.name,
      slug: product.slug,
      category: categoryIds[product.categorySlug],
      shortDescription: product.shortDescription,
      specifications: product.specifications,
      packaging: product.packaging,
      imageGallery: galleryImageIds,
      certifications: certIds,
      displayOrder: product.displayOrder,
      published: product.published,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded product '${product.slug}' (en).`);
}

await payload.destroy();
