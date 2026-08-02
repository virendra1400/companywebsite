// One-off content update (not a schema migration) — T-208: fixes the
// banned "premium" bare adjective in the homepage hero headline, and the
// banned rhetorical-question CTA-band heading pattern (CONTENT_PLAYBOOK §1)
// on every Pages-collection doc that has one. The insights/product-detail
// pages' matching CTA text is hardcoded in the route component, not CMS
// content, so it updates automatically on deploy — no script needed there.
// Idempotent: each replacement only fires if the OLD text is still present.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const REPLACEMENTS: Record<string, { hero?: string; cta?: string }> = {
  home: {
    hero: "Export-Ready Agricultural Products, Direct From India",
    cta: "Source With Confidence",
  },
  about: { cta: "Learn More About Our Story" },
  certifications: { cta: "Get Your Compliance Questions Answered" },
  manufacturing: { cta: "Request a Facility Walkthrough" },
  export: { cta: "Discuss Your Order Volume" },
  company: { cta: "Request Our Company Profile" },
};

let totalChanged = 0;

for (const [slug, { hero, cta }] of Object.entries(REPLACEMENTS)) {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    depth: 0,
    limit: 1,
  });

  const page = existing.docs[0];
  if (!page) {
    console.log(`'${slug}' page not found — skipping.`);
    continue;
  }

  const layout = (page.layout ?? []) as Array<Record<string, unknown>>;
  let changed = false;

  const newLayout = layout.map((block) => {
    if (hero && block.blockType === "hero" && block.headline !== hero) {
      changed = true;
      return { ...block, headline: hero };
    }
    if (cta && block.blockType === "ctaBand" && block.heading !== cta) {
      changed = true;
      return { ...block, heading: cta };
    }
    return block;
  });

  if (!changed) {
    console.log(`'${slug}' already up to date — skipping.`);
    continue;
  }

  await payload.update({
    collection: "pages",
    id: page.id,
    locale: "en",
    data: { layout: newLayout as never },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  totalChanged++;
  console.log(`Updated '${slug}'.`);
}

console.log(`Done. ${totalChanged} page(s) changed.`);

await payload.destroy();
process.exit(0);
