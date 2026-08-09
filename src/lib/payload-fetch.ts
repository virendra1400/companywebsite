import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
import type { Page, Certification, Category, Product, Media } from "../../payload-types";

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
  logoWidth: number | null;
  logoHeight: number | null;
  faviconUrl: string | null;
  productsHeroUrl: string | null;
  insightsHeroUrl: string | null;
  email: string;
  phone: string;
  whatsapp: string;
  waHref: string;
  address?: Address;
  factoryAddress?: Address & { facilityName?: string };
  legalIdentity?: { cin?: string; gst?: string; iec?: string; fssai?: string };
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
  // T-104/D-32: next/image requires explicit width+height for a non-`fill`
  // <Image> — Payload auto-populates these on upload (sharp), so no extra
  // query needed. Nullable in the type (never wired on this global) but
  // always present for a real image upload in practice.
  const logoWidth = logo && typeof logo === "object" && "width" in logo ? (logo.width ?? null) : null;
  const logoHeight = logo && typeof logo === "object" && "height" in logo ? (logo.height ?? null) : null;
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
  const legalIdentity = settings?.legalIdentity;
  // D-09: Organization JSON-LD input — same single cached findGlobal query
  // serves the existing brand/contact fields plus address/sameAs, no second
  // query.
  return {
    siteName: settings?.siteName || "VNP Global",
    logoUrl,
    logoWidth,
    logoHeight,
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
    legalIdentity: legalIdentity
      ? {
          cin: legalIdentity.cin ?? undefined,
          gst: legalIdentity.gst ?? undefined,
          iec: legalIdentity.iec ?? undefined,
          fssai: legalIdentity.fssai ?? undefined,
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

export type ResourceDocument = {
  title: string;
  description?: string | null;
  url: string | null;
  // C-16: "icon, title, type+size" row shape — mimeType/filesize come
  // straight off Payload's standard upload metadata, no extra derivation.
  mimeType?: string | null;
  filesize?: number | null;
};

function toResourceDocument(file: Media | null, title: string, description?: string | null): ResourceDocument {
  return {
    title,
    description,
    url: file?.url ?? null,
    mimeType: file?.mimeType ?? null,
    filesize: file?.filesize ?? null,
  };
}

// T-202/COMPONENT_LIBRARY C-16: /resources hub aggregates 3 existing sources
// rather than duplicating data — site-level docs (SiteSettings.resourceDocuments:
// company profile, sample COA, export checklist), per-cert PDFs
// (Certifications.certificatePdf), and per-product spec sheets
// (Products.downloads, already built for the product-detail page's
// ProductDownloads component, T-103). url stays null (never a placeholder
// link) when a file hasn't been uploaded yet — same honest-placeholder
// discipline as DocumentCardBlock/CertCard.
export async function getResourceDocuments(locale: Locale): Promise<{
  siteDocuments: ResourceDocument[];
  certificateDocuments: ResourceDocument[];
  productDocuments: ResourceDocument[];
}> {
  const payload = await getPayload({ config });
  const fallbackLocale = locale === "en" ? undefined : "en";

  const [settings, certifications, products] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", locale, fallbackLocale, overrideAccess: true }),
    payload.find({
      collection: "certifications",
      sort: "displayOrder",
      locale,
      fallbackLocale,
      overrideAccess: true,
      limit: 100,
    }),
    payload.find({
      collection: "products",
      where: { published: { equals: true } },
      sort: "displayOrder",
      locale,
      fallbackLocale,
      overrideAccess: true,
      limit: 500,
    }),
  ]);

  const siteDocuments: ResourceDocument[] = (settings?.resourceDocuments ?? []).map((doc) => {
    const file = doc.file && typeof doc.file === "object" ? (doc.file as Media) : null;
    return toResourceDocument(file, doc.title, doc.description);
  });

  const certificateDocuments: ResourceDocument[] = certifications.docs.map((cert) => {
    const file = cert.certificatePdf && typeof cert.certificatePdf === "object" ? (cert.certificatePdf as Media) : null;
    return toResourceDocument(file, cert.name);
  });

  const productDocuments: ResourceDocument[] = products.docs.flatMap((product) =>
    (product.downloads ?? []).map((d) => {
      const file = d.file && typeof d.file === "object" ? (d.file as Media) : null;
      return toResourceDocument(file, `${product.name}: ${d.label ?? ""}`);
    }),
  );

  return { siteDocuments, certificateDocuments, productDocuments };
}
