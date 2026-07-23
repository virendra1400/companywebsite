// Local-dev + prod-bootstrap seed: writes >=2 published Insights articles so
// BLOG-01's e2e spec has a real, readable article. Idempotent — skip-by-slug,
// mirrors scripts/seed-products.ts's structure (nextEnv, dynamic import, own
// upsertMediaByAlt, payload.destroy at end). Runs AFTER seed-products.ts in
// db:seed (package.json) because it reuses a category ("Grains") products
// already seeded.
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

// Minimal single-paragraph lexical root shape any richText field accepts —
// same shape used by tests/int/insights-fallback.spec.ts's lexicalRoot().
function lexicalRoot(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
        },
      ],
    },
  };
}

async function findCategoryIdByName(name: string): Promise<number | undefined> {
  const result = await payload.find({
    collection: "categories",
    where: { name: { equals: name } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });
  return result.docs[0]?.id;
}

const AVATAR_SVG = "scripts/seed-assets/avatar-export-operations.svg";
const FACILITY_SVG = "scripts/seed-assets/facility-processing-floor.svg";

type InsightSeed = {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  body: string;
  categoryName?: string;
  coverAlt: string;
  coverPath: string;
  publishedDate: string;
};

// One categorized + one uncategorized article (InsightCard no-separator state,
// UI-SPEC empty). Stable slugs so the e2e spec can target them directly.
const INSIGHTS_EN_SEED: InsightSeed[] = [
  {
    title: "A Buyer's Guide to Export Compliance in 2026",
    slug: "export-compliance-guide-2026",
    excerpt:
      "What international buyers should expect from a compliant India-based exporter — documentation, certifications, and logistics handoffs.",
    author: "Export Team",
    body: "Compliance documentation, phytosanitary certificates, and incoterm clarity are the three things every serious buyer should confirm before their first order.",
    categoryName: "Grains",
    coverAlt: "Export compliance guide cover",
    coverPath: FACILITY_SVG,
    publishedDate: "2026-06-01",
  },
  {
    title: "Sourcing Basmati Rice: A Quality Checklist",
    slug: "sourcing-basmati-quality",
    excerpt:
      "Grain length, moisture content, and aging — the specs that separate export-grade basmati from the rest.",
    author: "Export Team",
    body: "Aged, sorted, and graded basmati rice consistently outperforms unaged stock in both aroma and cooking yield, which is why grading discipline matters at the point of export.",
    // No category — exercises InsightCard's no-separator meta-row state.
    coverAlt: "Basmati quality checklist cover",
    coverPath: AVATAR_SVG,
    publishedDate: "2026-05-15",
  },
];

for (const insight of INSIGHTS_EN_SEED) {
  const existing = await payload.find({
    collection: "insights",
    where: { slug: { equals: insight.slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Insight '${insight.slug}' (en) already seeded — skipping.`);
    continue;
  }

  const cover = await upsertMediaByAlt(insight.coverAlt, insight.coverPath);
  const categoryId = insight.categoryName
    ? await findCategoryIdByName(insight.categoryName)
    : undefined;

  await payload.create({
    collection: "insights",
    locale: "en",
    data: {
      title: insight.title,
      slug: insight.slug,
      excerpt: insight.excerpt,
      coverImage: cover.id,
      category: categoryId,
      author: insight.author,
      body: lexicalRoot(insight.body),
      publishedDate: insight.publishedDate,
      published: true,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded insight '${insight.slug}' (en).`);
}

await payload.destroy();
