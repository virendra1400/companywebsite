import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
import type { Page, Certification, Category, Product } from "../../payload-types";

// Site-wide brand + contact from the SiteSettings global (CMS-editable, single
// source for name/logo/email/phone/whatsapp). Not localized. Media relation
// guard per RESEARCH Pitfall 3. Wrapped in React cache() so the many callers
// (chrome, hero, CTA band, product pages, contact block) share ONE query/request.
type Address = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export const getSiteBrand = cache(async function getSiteBrand(): Promise<{
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  productsHeroUrl: string | null;
  insightsHeroUrl: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  waHref: string;
  address?: Address;
  factoryAddress?: Address & { facilityName?: string };
  sameAs: string[];
}> {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({
    slug: "site-settings",
    overrideAccess: true,
  });
  const logo = settings?.logo;
  const logoUrl =
    logo && typeof logo === "object" && "url" in logo ? (logo.url ?? null) : null;
  const favicon = settings?.favicon;
  const faviconUrl =
    favicon && typeof favicon === "object" && "url" in favicon ? (favicon.url ?? null) : null;
  const productsHero = settings?.productsHeroImage;
  const productsHeroUrl =
    productsHero && typeof productsHero === "object" && "url" in productsHero
      ? (productsHero.url ?? null)
      : null;
  const insightsHero = settings?.insightsHeroImage;
  const insightsHeroUrl =
    insightsHero && typeof insightsHero === "object" && "url" in insightsHero
      ? (insightsHero.url ?? null)
      : null;
  const contact = settings?.contact ?? {};
  const whatsapp = contact.whatsapp || "910000000000";
  const address = settings?.address;
  const factoryAddress = settings?.factoryAddress;
  // D-09: Organization JSON-LD input — same single cached findGlobal query
  // serves the existing brand/contact fields plus address/sameAs, no second
  // query.
  return {
    siteName: settings?.siteName || "VNP Global",
    logoUrl,
    faviconUrl,
    productsHeroUrl,
    insightsHeroUrl,
    email: contact.email || "sales@example.com",
    phone: contact.phone || "+91 00000 00000",
    whatsapp,
    waHref: `https://wa.me/${whatsapp}`,
    address: address
      ? {
          street: address.street ?? undefined,
          city: address.city ?? undefined,
          state: address.state ?? undefined,
          postalCode: address.postalCode ?? undefined,
          country: address.country ?? undefined,
        }
      : undefined,
    factoryAddress: factoryAddress
      ? {
          facilityName: factoryAddress.facilityName ?? undefined,
          street: factoryAddress.street ?? undefined,
          city: factoryAddress.city ?? undefined,
          state: factoryAddress.state ?? undefined,
          postalCode: factoryAddress.postalCode ?? undefined,
          country: factoryAddress.country ?? undefined,
        }
      : undefined,
    sameAs: (settings?.sameAs ?? []).map((s) => s.url).filter(Boolean),
  };
});

// FOUND-06/D-06: detect whether the active locale has real (non-fallback)
// content so the page can show the English-plus-notice fallback rather than
// silently serving English with no signal. RESEARCH Pattern 4 — generalizes
// the Phase 1 getHomeContent dual-query pattern to any Pages slug.
export async function getPageContent(
  slug: string,
  locale: Locale
): Promise<{ page: Page | null; isTranslated: boolean }> {
  const payload = await getPayload({ config });

  // Display query: fallback ON — always returns usable content.
  const display = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
  });

  // Existence check: fallback OFF — null/empty means this locale has no
  // translation yet (silent Payload fallback would otherwise hide this).
  const nativeCheck = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });

  const page = display.docs[0] ?? null;
  const isTranslated = locale === "en" || Boolean(nativeCheck.docs[0]?.title);

  return { page, isTranslated };
}

// TRUST-01/02: CertStripBlock's data source. Mirrors getPageContent's
// getPayload/overrideAccess:true pattern. Sorted by editor-controlled
// displayOrder, then stably re-ordered so halal:true certs render first
// (TRUST-02 elevated placement) without needing a second DB round-trip.
export async function getCertifications(locale: Locale): Promise<Certification[]> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "certifications",
    sort: "displayOrder",
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
    limit: 100,
  });

  return [...result.docs].sort((a, b) => Number(b.halal) - Number(a.halal));
}

// CAT-01: CatalogIndex's category-order data source. Same single dual-purpose
// query shape as getCertifications — no per-item isTranslated needed, this is
// a multi-item aggregate, not a single translatable document.
export async function getCategories(locale: Locale): Promise<Category[]> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "categories",
    sort: "displayOrder",
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
    limit: 100,
  });

  return result.docs;
}

// CAT-01: two flat queries + one JS grouping pass — same complexity-avoidance
// discipline as getCertifications' halal-first re-sort (RESEARCH Don't
// Hand-Roll: no join field for a dataset this small). Excludes
// published:false products from every category's list (T-03-01).
export async function getProductsByCategory(
  locale: Locale,
): Promise<{ category: Category; products: Product[] }[]> {
  const payload = await getPayload({ config });

  const categories = await getCategories(locale);
  const productsResult = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    sort: "displayOrder",
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
    limit: 500,
  });

  return categories.map((category) => ({
    category,
    products: productsResult.docs.filter((p) => {
      const catId = typeof p.category === "object" ? p.category?.id : p.category;
      return catId === category.id;
    }),
  }));
}

// CAT-02/FOUND-06/D-06: getProduct mirrors getPageContent's dual-query
// fallback-detection EXACTLY (display query with fallback ON, existence check
// with fallback OFF). Hard-filters published:true (T-03-01) so a draft never
// reaches the public detail page even via a guessed/shared slug.
export async function getProduct(
  slug: string,
  locale: Locale,
): Promise<{ product: Product | null; isTranslated: boolean }> {
  const payload = await getPayload({ config });

  const display = await payload.find({
    collection: "products",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
  });

  const nativeCheck = await payload.find({
    collection: "products",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });

  const product = display.docs[0] ?? null;
  const isTranslated = locale === "en" || Boolean(nativeCheck.docs[0]?.name);

  return { product, isTranslated };
}
