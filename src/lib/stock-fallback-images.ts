// Temporary stock-photo fallbacks (public domain via Unsplash License) used
// ONLY when a Payload Media relation is empty — real CMS photography always
// wins the moment an editor uploads one (see call sites in HeroBlock /
// ProductCard). Deterministic hash-pick so the same page/product always
// renders the same fallback instead of flashing a different image per build.
const HERO_FALLBACKS = [
  "/images/stock/export-port-aerial.jpg",
  "/images/stock/warehouse-interior.jpg",
  "/images/stock/partnership-wheat-field.jpg",
];

// T-006: the old flat PRODUCT_FALLBACKS pool hash-picked across every stock
// photo regardless of category, so e.g. a lentils product could render a
// corn-field photo. Keyed by category slug instead -- each catalog category
// only draws from images that plausibly match it. No dedicated pulses/oilseed
// macro shots exist yet, so those categories borrow the closest available
// look (grain macro / spice macro) rather than an unrelated fruit/corn image.
const PRODUCT_FALLBACKS_BY_CATEGORY: Record<string, string[]> = {
  grains: ["/images/stock/grain-rice-macro.jpg", "/images/stock/grain-wheat-macro.jpg"],
  spices: ["/images/stock/spice-blend-macro.jpg", "/images/stock/spices-arranged.jpg"],
  pulses: ["/images/stock/grain-rice-macro.jpg"],
  oilseeds: ["/images/stock/spice-blend-macro.jpg"],
};
const PRODUCT_FALLBACKS_DEFAULT = [
  "/images/stock/grain-rice-macro.jpg",
  "/images/stock/grain-wheat-macro.jpg",
  "/images/stock/spice-blend-macro.jpg",
  "/images/stock/spices-arranged.jpg",
];

function hashPick(seed: string, pool: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

export function pickHeroFallback(seed: string): string {
  return hashPick(seed, HERO_FALLBACKS);
}

export function pickProductFallback(seed: string, categorySlug?: string | null): string {
  const pool = (categorySlug && PRODUCT_FALLBACKS_BY_CATEGORY[categorySlug]) || PRODUCT_FALLBACKS_DEFAULT;
  return hashPick(seed, pool);
}
