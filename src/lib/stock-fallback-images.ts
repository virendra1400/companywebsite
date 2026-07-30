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

const PRODUCT_FALLBACKS = [
  "/images/stock/grain-rice-macro.jpg",
  "/images/stock/grain-wheat-macro.jpg",
  "/images/stock/spice-blend-macro.jpg",
  "/images/stock/spices-arranged.jpg",
  "/images/stock/crop-field-corn.jpg",
  "/images/stock/produce-apple.jpg",
  "/images/stock/produce-watermelon.jpg",
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

export function pickProductFallback(seed: string): string {
  return hashPick(seed, PRODUCT_FALLBACKS);
}
