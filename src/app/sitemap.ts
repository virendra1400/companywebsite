import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import { getTranslatedLocales, type SeoCollection } from "@/lib/seo/translated-locales";
import { localeUrl, buildAlternates } from "@/lib/seo/alternates";

// RESEARCH Pattern 3 (A2 fix applied): interior marketing slugs gate their
// locale set through getTranslatedLocales("pages", slug) — NOT an
// unconditional routing.locales fallback — so ar/fr/ru only appear once a
// real Pages translation exists (D-07).
const INTERIOR_SLUGS = ["about", "certifications", "manufacturing", "export", "company", "contact"];

// SEO-02: reciprocal + self-referencing — every translated locale's <url>
// entry lists the IDENTICAL alternates.languages map (buildAlternates is the
// single source of truth also used by generateMetadata, Pitfall 1).
async function entriesFor(
  path: string,
  collection: SeoCollection,
  slug: string,
): Promise<MetadataRoute.Sitemap> {
  const translatedLocales = await getTranslatedLocales(collection, slug);

  // Reuse buildAlternates' languages map so sitemap hreflang and
  // generateMetadata's alternates stay byte-identical (Pitfall 1) — the
  // sitemap-file type only wants { languages }, no canonical field, and
  // narrows every value to `string` (buildAlternates always produces plain
  // string URLs, so this cast is safe). One shared languages map is reused
  // across every locale's <url> entry for this path (SEO-02), so the
  // currentLocale arg (D-50) is irrelevant here — canonical is discarded
  // below, defaultLocale is just an arbitrary valid value to satisfy it.
  const { languages } = buildAlternates(translatedLocales, path, routing.defaultLocale);
  const alternates = { languages: languages as Record<string, string> };

  // Fixed iteration order (routing.locales), not the ad-hoc order
  // getTranslatedLocales' Promise.all resolves in — keeps sitemap entry
  // order deterministic across builds (SEO-03 ordering case).
  return routing.locales
    .filter((locale) => translatedLocales.includes(locale))
    .map((locale) => ({
      url: localeUrl(locale, path),
      alternates,
    }));
}

// T-005/D-18: /products and /insights are code-only listing routes with no
// backing Pages CMS doc, so translation status can't be looked up via
// getTranslatedLocales — but they also have zero real ar/fr/ru translation
// (English content + a disclosed fallback notice). Listing them for
// untranslated locales in the sitemap is duplicate-content risk Google can't
// distinguish from real per-locale pages, so the sitemap only lists the
// English entry; the routes themselves still render (with disclosure) for
// direct/linked visits in other locales, just aren't submitted for indexing.
function entriesForDefaultLocaleOnly(path: string): MetadataRoute.Sitemap {
  return [{ url: localeUrl(routing.defaultLocale, path) }];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const entries: MetadataRoute.Sitemap = [];

  entries.push(...(await entriesFor("/", "pages", "home")));

  for (const slug of INTERIOR_SLUGS) {
    entries.push(...(await entriesFor(`/${slug}`, "pages", slug)));
  }

  entries.push(...entriesForDefaultLocaleOnly("/products"));
  entries.push(...entriesForDefaultLocaleOnly("/insights"));

  // T-105/MASTER_PLAN §5.2: nested URL — depth:1 populates category so its
  // slug is available without a second query per product.
  const products = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
    sort: "slug",
    depth: 1,
  });
  for (const p of products.docs) {
    const categorySlug = typeof p.category === "object" ? p.category.slug : null;
    if (!categorySlug) continue;
    entries.push(...(await entriesFor(`/products/${categorySlug}/${p.slug}`, "products", p.slug)));
  }

  const articles = await payload.find({
    collection: "insights",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
    sort: "slug",
  });
  for (const a of articles.docs) {
    entries.push(...(await entriesFor(`/insights/${a.slug}`, "insights", a.slug)));
  }

  return entries;
}
