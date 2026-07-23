# Phase 5: SEO Infrastructure & Insights/Blog - Research

**Researched:** 2026-07-22
**Domain:** Next.js 16 App Router native SEO metadata/sitemap/structured-data + a new localized Payload CMS 3 editorial collection
**Confidence:** HIGH (native Next.js APIs, confirmed against official docs) / MEDIUM (hreflang-in-sitemap-index and structured-data field mapping — CITED, no third-party lib to verify against) / codebase patterns are HIGH (read directly from the repo)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Blog/Insights content model (new Payload collection — none exists yet)**
- **D-01:** Simple fixed fields, not freeform blocks: `title`, `slug` (not localized), `excerpt`, cover image (`upload`), `category` (single relationship), `author` (plain text), `body` (richText). Modeled after `Products.ts` ("typed structured data"), not `Pages.ts` ("freeform layout") — articles are editorial content, not landing pages.
- **D-02:** Single `category` relationship field for grouping/filtering (same pattern as `Products.category`). No tag/multi-taxonomy in v1.
- **D-03:** Author is a plain text field only (e.g. "Export Team") — no author collection/photo. Minor E-E-A-T SEO signal at minimal CMS cost.
- **D-04:** Collection fields are `localized: true` (title/excerpt/body/author), following the exact Pages/Products pattern — `slug` stays unlocalized (one canonical URL, same as Pages/Products). Content itself stays English-only for now (per project-wide English-first priority) — architecture supports translation later with zero rework, using the same `isTranslated` existence-check pattern already in `src/lib/payload-fetch.ts`.

**Blog URL/nav placement**
- **D-05:** New top-level nav item in `GlobalHeader` labeled "Insights", real route `/insights` (matches D-08's "fixed set of real routes" pattern and PROJECT.md's own wording "Insights/blog surface").
- **D-06:** Flat article URLs: `/insights/[slug]` — matches the existing `/products/[slug]` pattern. Category is used for on-page filtering/grouping only, not in the URL (avoids canonical churn if an article's category changes).

**hreflang scope for untranslated locales**
- **D-07:** hreflang generation reuses the existing `isTranslated` detection (`src/lib/payload-fetch.ts` — fallback-ON display query + fallback-OFF existence check) per page/product/article. A locale only gets an emitted hreflang tag when it has REAL translated content — today that means only `en` (+ `x-default`) for virtually everything, since ar/fr/ru have no real translations yet. This directly satisfies SEO-02's requirement that hreflang be "generated from actual published-translation status (not hand-maintained)."
- **D-08:** `x-default` points to the English root URL (`/[slug]`, no locale prefix) — matches `next-intl` routing's existing `defaultLocale: "en"` with no path prefix.

**Structured data scope & Organization data gaps**
- **D-09:** Add `address` (group: street/city/state/postalCode/country) and `sameAs` (array of social/profile URLs) fields to the `SiteSettings` global, alongside the existing `siteName`/`logo`/`contact` fields — same admin pattern as the existing `contact` group. This unlocks a complete Organization JSON-LD (name/logo/url/address/contactPoint/sameAs).
- **D-10:** Product structured data uses only fields that already exist on `Products`: `name`, `image` (from `imageGallery`), `description`, `category`, and `certifications` mapped as `additionalProperty`. Explicitly NO price/offers/availability (B2B RFQ site, not e-commerce — no listed prices) and NO review/rating markup (no reviews data model exists; out of scope for SEO-04).
- **D-11:** `BreadcrumbList` structured data is emitted on Product detail pages and blog article pages only (both have a natural parent: catalog category / insights list). Flat top-level marketing/trust pages (About, Certifications, etc. — one click from home) do not get breadcrumbs; low SEO value there.

### Claude's Discretion
- Exact sitemap generation mechanism (Next.js native `sitemap.ts` per STACK.md, locked) and whether to split into a sitemap index vs single file — implementation detail for planner/researcher. **Researched below: single file, no index needed at this scale.**
- Exact JSON-LD script injection mechanism (per-page `generateMetadata` + a shared `<script type="application/ld+json">` helper) — implementation detail. **Researched below: JSON-LD is NOT emitted via `generateMetadata` (Metadata API has no JSON-LD field) — it's a `<script>` tag rendered directly in the page/layout body, per official Next.js guidance.**
- Open Graph image strategy (dedicated OG image field vs. deriving from existing cover/hero images) — not discussed, left to researcher/planner to resolve against existing Media assets. **Researched below: derive from existing fields (Insights `coverImage`, Product `imageGallery[0]`), no new field needed.**

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| SEO-01 | Every page emits correct metadata (title, description, Open Graph) per locale | `generateMetadata` pattern + `metadataBase` placement (Architecture Patterns §1); OG image sourcing (Code Examples) |
| SEO-02 | Correct reciprocal hreflang tags + x-default across all locales, CMS-generated | Reuse of `isTranslated` existence-check (Architecture Patterns §2); self-referencing/reciprocal hreflang pitfall (Common Pitfalls §1) |
| SEO-03 | XML sitemap(s) generated including all locales | Native `sitemap.ts` single-file pattern (Architecture Patterns §3); reciprocal alternates in sitemap entries |
| SEO-04 | Structured data (Organization, Product, BreadcrumbList) emitted where applicable | Manual `<script type="application/ld+json">` pattern (Architecture Patterns §4), XSS-escaping pitfall (Common Pitfalls §3), field mapping (D-09/D-10/D-11) |
| SEO-05 | Clean canonical URLs; no duplicate-content or canonical/hreflang conflicts | `alternates.canonical` + `metadataBase` (Architecture Patterns §1); Common Pitfalls §1/§2 (self-reference, drafts leaking into sitemap) |
| BLOG-01 | Blog/insights section + article template built in v1 (structure ready) | New `Insights` collection design (Architecture Patterns §5); route structure (`/insights`, `/insights/[slug]`) |
| BLOG-02 | Staff can publish articles via CMS per locale as content is written | `localized: true` field cascade (Don't Hand-Roll §1); `isTranslated`/fallback pattern applied to the new collection |
</phase_requirements>

## Summary

This phase is fully greenfield for SEO plumbing — zero `sitemap.ts`, `robots.ts`, or `application/ld+json` output exists anywhere in `src/` today, and there is no root `src/app/layout.tsx` (the `(site)` and `(payload)` route groups each own their own root layout). All the infrastructure this phase needs is native to Next.js 16 (`MetadataRoute.Sitemap`, `MetadataRoute.Robots`, `generateMetadata`) — no new npm dependency is required to satisfy SEO-01…05. The one genuinely new piece of application code is the `Insights` Payload collection (BLOG-01/02), which is a straightforward variant of the existing `Products.ts` collection with one deliberate deviation: `access.read: () => true` instead of `Boolean(user)`, because Payload auto-generates a public REST/GraphQL endpoint per collection at `(payload)/api/[...slug]`, and this collection's content is meant to be public (unlike the admin-gated read on `Products`/`Pages`, which is safe today only because the frontend always reads them through `payload-fetch.ts` with `overrideAccess: true`, never through that generated endpoint).

The one recurring theme across every SEO-0x requirement is: **hreflang and canonical correctness are entirely derived from the existing `isTranslated` dual-query pattern in `src/lib/payload-fetch.ts`**, not a new mechanism. A locale is only included in `alternates.languages` (both in `generateMetadata` output and in `sitemap.ts` entries) when the fallback-OFF existence check for that locale/slug returns real content. Today that means every page effectively emits `{ en: <url>, "x-default": <url> }` and nothing else, until ar/fr/ru translations land — this is intentional and matches SEO-02's "generated from actual published-translation status" requirement exactly.

**Primary recommendation:** Build a single shared `src/lib/seo/` module with three pure, testable pieces — (1) a `getTranslatedLocales(collection, slug)` helper that runs the existing fallback-OFF existence check across all 4 locales (not the full display query — metadata generation never needs the content body, only the boolean), (2) a `buildAlternates()` function that turns that locale list into the `alternates` shape `generateMetadata` and `sitemap.ts` both consume, and (3) a small set of JSON-LD builder functions (`organizationJsonLd`, `productJsonLd`, `breadcrumbJsonLd`) plus one `<JsonLd>` script-tag component that does the required XSS escaping in one place. Add `NEXT_PUBLIC_SITE_URL` as a new env var (currently absent from the codebase) — every one of `metadataBase`, `sitemap.ts`, and JSON-LD `url` fields requires an absolute base URL, and none exists in this repo today (`payload-fetch.ts` returns relative paths only; there is no `VERCEL_URL` fallback wired in yet).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Per-locale `<title>`/`<meta description>`/Open Graph tags | Frontend Server (SSR) | API/Backend (Payload, as data source) | `generateMetadata` runs server-side during render in the App Router; it reads page/product/article content from Payload but the tag emission itself is a Next.js rendering concern, not a backend API concern. |
| hreflang / `alternates.languages` generation | Frontend Server (SSR) | API/Backend (Payload `isTranslated` existence check) | Same as above — the *decision* of which locales are "real" lives in Payload data (existence check), but the *emission* of `<link rel=alternate>` tags is Next.js's Metadata API. |
| XML sitemap (`sitemap.ts`) | Frontend Server (SSR) | API/Backend (Payload, enumerates published slugs) | `sitemap.ts` is a special Next.js route handler; it queries Payload directly (Local API) to enumerate content, same tier split as metadata. |
| `robots.txt` (`robots.ts`) | Frontend Server (SSR) | — | Static rule set + a pointer to the sitemap URL; no backend data dependency. |
| JSON-LD structured data | Frontend Server (SSR) | API/Backend (Payload, as data source) | Rendered as an inline `<script>` in the Server Component's HTML output — not a separate API response. |
| Insights/blog content storage | Database/Storage (Postgres via Payload) | API/Backend (Payload collection + access control) | New `Insights` collection persists to the same Postgres/Neon (prod) or SQLite (local) instance as every other collection. |
| Insights list/article rendering | Frontend Server (SSR) | Browser (RSC hydration for interactive bits, if any) | Mirrors the existing `/products` and `/products/[slug]` pages — Server Components fetching via `payload-fetch.ts`. |

## Standard Stack

### Core
No new runtime dependency is required — everything needed for SEO-01…05 and BLOG-01/02 is already installed.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| Next.js | 16.2.10 [VERIFIED: package.json] | `sitemap.ts`/`robots.ts`/`generateMetadata` file conventions | Native App Router Metadata API — no third-party SEO package needed, matches STACK.md's explicit "do NOT use next-seo/next-sitemap unless the catalog grows large" stance. |
| next-intl | 4.13.2 [VERIFIED: package.json] | `getPathname` for locale-aware URL construction | Already the project's i18n layer; its `getPathname` helper correctly resolves the `localePrefix: "as-needed"` routing strategy (English un-prefixed) instead of hand-concatenating locale segments. |
| Payload CMS | 3.86.0 [VERIFIED: package.json] | New `Insights` collection; source data for sitemap/hreflang/JSON-LD | Same CMS already powering Pages/Products/Categories/Certifications — no new data layer. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| schema-dts | 2.0.0 [ASSUMED — training knowledge of package existence; version/downloads VERIFIED via `npm view`] | Compile-time TypeScript types for JSON-LD object shapes (`WithContext<Product>`, etc.) | Optional. Purely type-only, zero runtime weight. Add only if the planner wants stronger typing on the JSON-LD builders than hand-written `interface`s — a lazy hand-rolled local type for 3 schema.org shapes (Organization/Product/BreadcrumbList) is one screen of code and avoids a new dependency entirely; reach for schema-dts only if the org anticipates adding many more schema.org types later. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `sitemap.ts` (single file) | `next-sitemap` package | Adds a build-step dependency and its own config format for a catalog this small (~10 fixed pages + <100 products + articles, nowhere near the 50,000-URL split threshold). STACK.md already flags this as unnecessary at this scale. |
| Native `sitemap.ts` (single file) | `generateSitemaps()` + sitemap index | Only justified once a single sitemap would exceed Google's 50,000-URL-per-file limit. Not applicable here — explicitly document as "not needed now" rather than defer as a TODO. |
| Hand-written JSON-LD `interface`s | `schema-dts` | See Supporting table above — genuinely optional, not a "don't hand-roll" case at this small a schema surface (3 types). |

**Installation:**
No installation required for Core. If the planner opts into `schema-dts`:
```bash
npm install -D schema-dts
```

**Version verification:** `next` (16.2.10), `next-intl` (^4.13.2), and `payload` (^3.86.0) versions confirmed directly from this repo's `package.json` — already the versions in use, not a new install. `schema-dts` version 2.0.0 confirmed via `npm view schema-dts version` (published 2026-03-23, ~2.3M weekly downloads, repo `github.com/google/schema-dts`).

## Package Legitimacy Audit

No new **required** package for this phase — SEO-01…05 and BLOG-01/02 are fully satisfiable with already-installed dependencies (Next.js native APIs + Payload). The only package surfaced during research is a fully optional, discretionary type-only dev dependency.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|--------------|---------|-------------|
| schema-dts | npm | Long-established, current release 2026-03-23 | ~2.3M/wk | github.com/google/schema-dts | OK | Optional — planner may add if stronger JSON-LD typing is wanted; not required to satisfy any success criterion. |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
Crawler / Browser
      │  GET /en/products/rice   (or /ar/insights/some-article, /sitemap.xml, /robots.txt)
      ▼
Next.js Server (Vercel) ── (payload) route group ─▶ /admin, /api/[...slug]  (Payload-generated, admin-only for Pages/Products; PUBLIC for Insights/Media/SiteSettings)
      │
      ├─▶ (site)/[locale]/layout.tsx
      │        │  sets metadataBase (NEW: requires NEXT_PUBLIC_SITE_URL)
      │        ▼
      ├─▶ page.tsx (product/article/interior page)
      │        │
      │        ├─▶ generateMetadata()
      │        │        │  1. fetch this locale's content  (existing get*Content/get*Product helper)
      │        │        │  2. getTranslatedLocales(collection, slug)  ── NEW helper, existence-check ×4 locales
      │        │        │        via payload-fetch.ts's fallbackLocale:false query — reuses D-07 pattern
      │        │        │  3. buildAlternates(translatedLocales, path) ── NEW helper
      │        │        └─▶ returns { title, description, openGraph, alternates:{canonical, languages} }
      │        │
      │        └─▶ Page body renders
      │                 ├─▶ <JsonLd data={organizationJsonLd(siteSettings)} />   (every page, via layout)
      │                 ├─▶ <JsonLd data={productJsonLd(product, certs)} />      (product detail only)
      │                 ├─▶ <JsonLd data={breadcrumbJsonLd([...])} />            (product + article only, D-11)
      │                 └─▶ visible HTML (existing UI components)
      │
      ├─▶ app/sitemap.ts  (root of src/app/, OUTSIDE both route groups — special file convention)
      │        │  enumerate: home + INTERIOR_SLUGS + published products + published insights articles
      │        │  for each: getTranslatedLocales() → one <url> entry per locale w/ full reciprocal alternates map
      │        └─▶ /sitemap.xml
      │
      └─▶ app/robots.ts
               └─▶ /robots.txt  { rules: allow '/', disallow '/admin', disallow '/api' } + sitemap: <NEXT_PUBLIC_SITE_URL>/sitemap.xml

Payload (Postgres/Neon prod, SQLite local)
      ├─ Pages, Products, Categories, Certifications  (existing)
      └─ Insights  (NEW — D-01..D-04: title/slug/excerpt/coverImage/category/author/body, localized fields, unlocalized slug, access.read: () => true)
```

### Recommended Project Structure
```
src/
├── app/
│   ├── sitemap.ts                      # NEW — root-level, not inside (site) or (payload)
│   ├── robots.ts                       # NEW — root-level
│   └── (site)/[locale]/
│       ├── layout.tsx                  # EDIT — add metadataBase + Organization JSON-LD
│       ├── insights/
│       │   ├── page.tsx                # NEW — list, mirrors products/page.tsx
│       │   └── [slug]/page.tsx         # NEW — article, mirrors products/[slug]/page.tsx
│       └── products/[slug]/page.tsx    # EDIT — add generateMetadata + Product/BreadcrumbList JSON-LD
├── collections/
│   └── Insights.ts                     # NEW — D-01..D-04
├── globals/
│   └── SiteSettings.ts                 # EDIT — add address group + sameAs array (D-09)
├── hooks/
│   └── revalidateInsights.ts           # NEW — mirrors revalidateCatalog.ts's revalidateProduct shape
└── lib/
    └── seo/
        ├── translated-locales.ts       # NEW — getTranslatedLocales(collection, slug)
        ├── alternates.ts               # NEW — buildAlternates(translatedLocales, path) → Metadata['alternates']
        └── json-ld.ts                  # NEW — organizationJsonLd/productJsonLd/breadcrumbJsonLd + <JsonLd> component
```

### Pattern 1: `generateMetadata` + `metadataBase`, no new root layout needed
**What:** This repo has no shared `src/app/layout.tsx` — `(payload)/layout.tsx` is a Payload-generated admin shell and `(site)/[locale]/layout.tsx` is the public site's own `<html><body>` root. `metadataBase` should be set once in `(site)/[locale]/layout.tsx` (it already wraps every public page); it will cascade to every `generateMetadata`/`metadata` export below it. Do not touch `(payload)/layout.tsx` (auto-generated, "DO NOT MODIFY").
**When to use:** Any page needing an absolute-URL-dependent metadata field (`alternates`, `openGraph.images`).
**Example:**
```typescript
// src/app/(site)/[locale]/layout.tsx — ADD near existing exports
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};
```
```typescript
// src/app/(site)/[locale]/products/[slug]/page.tsx — ADD
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { buildAlternates } from "@/lib/seo/alternates";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params;
  const { product } = await getProduct(slug, locale as Locale);
  if (!product) return {};

  const translatedLocales = await getTranslatedLocales("products", slug);
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: buildAlternates(translatedLocales, `/products/${slug}`),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.imageGallery?.[0]?.image?.url ? [product.imageGallery[0].image.url] : [],
    },
  };
}
```
*(Source pattern confirmed against [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — the `alternates`/`metadataBase` shapes above are the exact fields documented there.)*

### Pattern 2: hreflang locale-gating — reuse the existence-check HALF of `isTranslated`, not the full dual query
**What:** `payload-fetch.ts`'s existing helpers (`getPageContent`, `getProduct`) run TWO queries — a display query (fallback ON) and an existence check (fallback OFF) — because a page needs both the renderable content AND the translation flag. `generateMetadata` and `sitemap.ts` only need the boolean, for all 4 locales, not the content. Add one small helper that runs just the existence-check half, once per locale:
```typescript
// src/lib/seo/translated-locales.ts — NEW
import { getPayload } from "payload";
import config from "@payload-config";
import { routing, type Locale } from "@/i18n/routing";

const TITLE_FIELD: Record<string, string> = {
  pages: "title",
  products: "name",
  insights: "title",
};

// D-07: existence-check only (fallbackLocale:false) — mirrors payload-fetch.ts's
// nativeCheck query exactly, run across all 4 locales instead of just the active one.
export async function getTranslatedLocales(
  collection: "pages" | "products" | "insights",
  slug: string,
): Promise<Locale[]> {
  const payload = await getPayload({ config });
  const titleField = TITLE_FIELD[collection];

  const checks = await Promise.all(
    routing.locales.map(async (locale) => {
      if (locale === "en") return locale; // en is always treated as translated (D-07)
      const result = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
        locale,
        fallbackLocale: false,
        overrideAccess: true,
      });
      return result.docs[0]?.[titleField] ? locale : null;
    }),
  );

  return checks.filter((l): l is Locale => l !== null);
}
```
**When to use:** Every `generateMetadata` and inside `sitemap.ts`'s per-item loop.
**Why this matters:** Running the FULL `getPageContent`/`getProduct` dual-query pattern (4 locales × 2 queries each = 8 DB round-trips) just to read a boolean would be wasteful — the existence-check alone is 4 queries and is exactly what D-07 requires reusing (the *pattern*, not necessarily every line of the existing function).

### Pattern 3: single-file `sitemap.ts` with reciprocal, self-referencing hreflang entries
**What:** Per official Next.js docs, a localized `sitemap.ts` entry looks like:
```typescript
// src/app/sitemap.ts — NEW, root of src/app/ (NOT inside (site) or (payload))
import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const INTERIOR_SLUGS = ["about", "certifications", "manufacturing", "export", "company", "contact"];

function localeUrl(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${BASE}${prefix}${path === "/" ? "" : path}` || `${BASE}/`;
}

// SEO-02: reciprocal + self-referencing — Google's hreflang spec requires each
// URL's <url> entry to list EVERY translated variant INCLUDING itself, not just
// a canonical entry pointing at others. One <url> block per translated locale.
async function entriesFor(path: string, collection?: "pages" | "products" | "insights", slug?: string) {
  const translatedLocales = collection && slug
    ? await getTranslatedLocales(collection, slug)
    : routing.locales; // static interior pages: en-only until CMS-driven (adjust once Pages covers them)

  const languages: Record<string, string> = { "x-default": localeUrl(routing.defaultLocale, path) };
  for (const locale of translatedLocales) languages[locale] = localeUrl(locale, path);

  return translatedLocales.map((locale) => ({
    url: localeUrl(locale, path),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const entries: MetadataRoute.Sitemap = [];

  entries.push(...(await entriesFor("/")));
  for (const slug of INTERIOR_SLUGS) entries.push(...(await entriesFor(`/${slug}`)));

  const products = await payload.find({
    collection: "products", where: { published: { equals: true } }, locale: "en", overrideAccess: true, limit: 500,
  });
  for (const p of products.docs) entries.push(...(await entriesFor(`/products/${p.slug}`, "products", p.slug)));

  const articles = await payload.find({
    collection: "insights", locale: "en", overrideAccess: true, limit: 500,
  });
  for (const a of articles.docs) entries.push(...(await entriesFor(`/insights/${a.slug}`, "insights", a.slug)));

  return entries;
}
```
**When to use:** This IS the phase's sitemap — single file, no `generateSitemaps()` split (see Alternatives Considered — nowhere near the 50,000-URL threshold).
*(`alternates.languages` shape confirmed against [nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)'s "Generate a localized Sitemap" example.)*

### Pattern 4: JSON-LD is a `<script>` tag, NOT a `generateMetadata` field
**What:** The Next.js Metadata API has no JSON-LD field — official guidance is a manually-escaped inline `<script type="application/ld+json">` rendered in the Server Component body.
```typescript
// src/lib/seo/json-ld.ts — NEW
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Official Next.js guidance: JSON.stringify does NOT sanitize XSS. Escape
  // '<' so a malicious CMS string (e.g. product.name) can't break out of the
  // script context. Source: nextjs.org/docs/app/guides/json-ld
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(settings: {
  siteName: string; logoUrl: string | null; url: string;
  address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: settings.url,
    ...(settings.logoUrl && { logo: settings.logoUrl }),
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address.street,
        addressLocality: settings.address.city,
        addressRegion: settings.address.state,
        postalCode: settings.address.postalCode,
        addressCountry: settings.address.country,
      },
    }),
    ...(settings.sameAs?.length && { sameAs: settings.sameAs }),
  };
}

// D-10: no offers/price/review — B2B RFQ site, not e-commerce.
export function productJsonLd(product: { name: string; images: string[]; description?: string; categoryName?: string; certNames: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    ...(product.description && { description: product.description }),
    ...(product.categoryName && { category: product.categoryName }),
    ...(product.certNames.length && {
      additionalProperty: product.certNames.map((n) => ({ "@type": "PropertyValue", name: "Certification", value: n })),
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem", position: i + 1, name: item.name, item: item.url,
    })),
  };
}
```
*(Script pattern + XSS-escaping requirement is the verbatim official recommendation at [nextjs.org/docs/app/guides/json-ld](https://nextjs.org/docs/app/guides/json-ld).)*

### Pattern 5: `Insights` collection — `Products.ts` shape, `Media.ts`/`SiteSettings.ts` access shape
```typescript
// src/collections/Insights.ts — NEW
import type { CollectionConfig } from "payload";
import { revalidateInsight } from "@/hooks/revalidateInsights";

export const Insights: CollectionConfig = {
  slug: "insights",
  admin: { useAsTitle: "title" },
  access: {
    // Public read: articles are editorial marketing content for anonymous
    // visitors, same reasoning as Media/SiteSettings (unlike Products/Pages,
    // which are read via payload-fetch.ts's overrideAccess:true and never
    // through Payload's auto-generated public REST/GraphQL endpoint).
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    // NOT localized — one canonical URL segment, same rule as Pages/Products.slug.
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "excerpt", type: "textarea", required: true, localized: true },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    // NOT localized — same document set in every locale (D-02).
    { name: "category", type: "relationship", relationTo: "categories", required: false },
    { name: "author", type: "text", localized: true, defaultValue: "Export Team" },
    { name: "body", type: "richText", localized: true, required: true },
    { name: "publishedDate", type: "date" },
  ],
  hooks: { afterChange: [revalidateInsight] },
};
```
```typescript
// src/hooks/revalidateInsights.ts — NEW, mirrors revalidateCatalog.ts's revalidateProduct
import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(`/ar${path}`);
  revalidatePath(`/fr${path}`);
  revalidatePath(`/ru${path}`);
}

export const revalidateInsight: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/insights");
    revalidateAllLocales(`/insights/${doc.slug}`);
  }
  return doc;
};
```
Register in `src/payload.config.ts`: add `Insights` to the `collections` array, mirroring how `Products` is registered.

### Anti-Patterns to Avoid
- **Sourcing hreflang from a hardcoded locale array:** SEO-02 explicitly requires generation "from actual published-translation status (not hand-maintained)" — never write `alternates: { languages: { en: ..., ar: ..., fr: ..., ru: ... } }` unconditionally; always gate through `getTranslatedLocales`.
- **A canonical-only sitemap entry with no self-reference:** emitting one `<url>` per PAGE (not per translated locale) with `alternates.languages` only for the OTHER locales is a common non-reciprocal hreflang mistake — see Common Pitfalls §1.
- **Adding a third-party sitemap/SEO package:** STACK.md explicitly locks native `sitemap.ts`/`robots.ts`/`generateMetadata`; do not introduce `next-seo` or `next-sitemap`.
- **Emitting `application/ld+json` via `next/script`:** `next/script` is for executable JS loading/optimization, not for static structured data; official guidance uses a plain `<script>` tag.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Locale-aware URL construction | Manual string concatenation of `/${locale}${path}` | `next-intl`'s `getPathname`/existing `routing.defaultLocale`-aware helper (Pattern 3's `localeUrl`) | `localePrefix: "as-needed"` means English has NO prefix — a naive `/${locale}${path}` produces `/en/about` instead of `/about`, which is a canonical/hreflang self-conflict (violates SEO-05). |
| XML sitemap protocol compliance | Hand-written XML string templates | Next.js's native `MetadataRoute.Sitemap` return-array convention | Next.js generates spec-correct `<urlset>`/`<xhtml:link>` XML from the typed array — hand-rolling risks malformed XML or missing the `xmlns:xhtml` namespace required for hreflang-in-sitemap. |
| JSON-LD escaping | A regex sanitizer built from scratch | The one-line `.replace(/</g, "\\u003c")` from official docs | This is already the minimal correct fix per Next.js's own guidance — do not add a heavier sanitization library (e.g. DOMPurify) for a server-generated, non-user-facing JSON payload; the risk is CMS-authored strings containing `<`, not arbitrary user HTML. |
| Localized field cascading | Manually setting `localized: true` on every nested field of `body`/`specifications`-style array fields | Set `localized: true` on the PARENT field only — Payload cascades automatically | Already proven in this repo's `Products.specifications` field; re-setting on nested fields is redundant and a documented pitfall from Phase 3's own research. |

**Key insight:** Every "hard" part of this phase (XML correctness, hreflang reciprocity math, locale-prefix resolution) already has a native, first-party answer in the installed stack. The only code actually being written is glue: turning `isTranslated`-style booleans into the shapes Next.js's Metadata API and `sitemap.ts` expect.

## Common Pitfalls

### Pitfall 1: Non-reciprocal / non-self-referencing hreflang
**What goes wrong:** A page's hreflang links point to its translated siblings, but a translated sibling doesn't link back (or doesn't include itself in its own alternates list) — search engines then may ignore the whole hreflang cluster for that URL.
**Why it happens:** It's tempting to write one `alternates.languages` map per PAGE (e.g. only on the English canonical) rather than emitting the same complete map on EVERY locale variant of that page, including a self-reference.
**How to avoid:** Build the `languages` map once per content item (all translated locales + `x-default`) and attach the IDENTICAL map to `generateMetadata`'s output on every locale variant AND to every corresponding `sitemap.ts` `<url>` entry (Pattern 3 does this explicitly).
**Warning signs:** A crawl audit (Screaming Frog, per SEO-02's success criterion) reports "hreflang missing return links" or "non-canonical page in hreflang."

### Pitfall 2: Draft/unpublished content leaking into the sitemap or hreflang
**What goes wrong:** `Products.published:false` and any future `Insights` draft-status field must be filtered out of `sitemap.ts` and `getTranslatedLocales` queries — otherwise an editor's in-progress draft becomes indexable or creates a canonical conflict once published elsewhere.
**Why it happens:** Copy-pasting a query without the `where: { published: { equals: true } }` clause that `payload-fetch.ts`'s `getProduct`/`getProductsByCategory` already apply.
**How to avoid:** Sitemap and hreflang queries MUST reuse the exact `published:true` (or equivalent draft-status) filter every existing public query uses.
**Warning signs:** A URL appears in `/sitemap.xml` that 404s or shows unpublished/placeholder content on the live site.

### Pitfall 3: `JSON.stringify` XSS in structured data
**What goes wrong:** CMS-authored strings (product name, article title) can legitimately contain `<` (e.g. "Rice < 5% broken") — if injected raw into `dangerouslySetInnerHTML`, this can break out of the `<script>` context.
**Why it happens:** Copying a JSON-LD example from a blog post that skips the escaping step (many tutorials do — the official Next.js guide explicitly calls this out).
**How to avoid:** Route every JSON-LD object through the single `<JsonLd>` component (Pattern 4) that always applies `.replace(/</g, "\\u003c")` — never inline a second `dangerouslySetInnerHTML` call elsewhere.
**Warning signs:** A security review / code-review pass finds a `dangerouslySetInnerHTML` for JSON-LD that doesn't go through the shared component.

### Pitfall 4: Missing `NEXT_PUBLIC_SITE_URL` causes a build error, not a silent bug
**What goes wrong:** `metadataBase` and `sitemap.ts`'s absolute URLs both require a real base URL. This repo currently has NO such env var (confirmed by grep — only `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` exists as a precedent for a `NEXT_PUBLIC_*` config var). Per Next.js docs, using a relative path in a URL-based metadata field WITHOUT `metadataBase` set causes a build error, not a soft failure — so this is a hard blocker, not a nice-to-have.
**Why it happens:** Easy to overlook when developing locally against `localhost:3000` if a fallback default is hardcoded and never revisited for production.
**How to avoid:** Add `NEXT_PUBLIC_SITE_URL` to `.env.example` and Vercel project env vars BEFORE this phase's plans are executed; fall back to `http://localhost:3000` only in local dev, never let a production build silently ship with a `localhost` canonical (that would be a severe SEO-05 canonical-conflict bug).
**Warning signs:** View-source shows `<link rel="canonical" href="http://localhost:3000/...">` on the deployed production site.

## Code Examples

Verified patterns from official sources — see full code in Architecture Patterns §1–5 above (kept together with their explanatory context rather than duplicated here). Key sources:
- `generateMetadata` / `alternates` / `metadataBase` shapes: [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- Localized `sitemap.ts` / `alternates.languages` shape: [nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- `robots.ts` shape: [nextjs.org/docs/app/api-reference/file-conventions/metadata/robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- JSON-LD `<script>` + XSS escaping: [nextjs.org/docs/app/guides/json-ld](https://nextjs.org/docs/app/guides/json-ld)

```typescript
// src/app/robots.ts — NEW, root of src/app/
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---------------|-------------------|----------------|--------|
| Pages Router `next-sitemap.config.js` + postbuild script | App Router native `sitemap.ts`/`robots.ts` file conventions | Next.js 13.3.0 (`sitemap`), stable through 16.x (this project's version) | No build-step dependency; sitemap regenerates on every request/ISR revalidation automatically, matching the CMS-driven content model this project already uses. |
| `next/head` manual `<meta>` tags | `generateMetadata`/`metadata` export | Next.js 13 App Router | Server-only, type-checked, automatically merged across nested layouts — already the only pattern viable in this codebase (no Pages Router present). |

**Deprecated/outdated:**
- `next/head`: not usable in the App Router at all (this project has zero Pages Router code) — not a migration concern, just confirming there's no legacy pattern to reconcile.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|-----------------|
| A1 | `schema-dts` (npm, google/schema-dts) is the standard community package for typed JSON-LD, discovered via WebSearch/training knowledge, not Context7 (unavailable this session) | Standard Stack / Supporting | Low — it is explicitly optional and not required for any success criterion; `npm view` independently confirmed it exists, is actively published, and has no suspicious `postinstall` script, but package NAME provenance itself is `[ASSUMED]` per the provenance rule (WebSearch-sourced name, not official-docs-sourced). |
| A2 | Interior static pages (`about`, `certifications`, etc.) don't yet have a "translated locales" existence check wired into `sitemap.ts`'s example code — the example treats them as `routing.locales` (all 4) rather than running `getTranslatedLocales("pages", slug)` | Architecture Patterns §3 (Pattern 3 code comment flags this explicitly) | Medium — if left as-is, `about`/`certifications`/etc. would emit hreflang for ar/fr/ru even though those locales have no real Pages translation yet, contradicting D-07. The planner MUST wire `entriesFor` to call `getTranslatedLocales("pages", slug)` for every interior slug, not just products/insights — flagged inline in the code example, not silently glossed over. |

## Open Questions

1. **Does the `Insights` collection need a `published`/draft boolean like `Products.published`?**
   - What we know: D-01 lists `title/slug/excerpt/coverImage/category/author/body` but no explicit `published` field; `Products` has one to hard-filter drafts from public queries (T-03-01 precedent).
   - What's unclear: CONTEXT.md's decisions don't call this out explicitly for Insights.
   - Recommendation: Add a `published: { type: "checkbox", defaultValue: true }` field mirroring `Products`, and filter on it in every Insights query (list, detail, sitemap) — the Pitfall 2 risk (draft leaking into sitemap) is otherwise unmitigated. This is a small, low-risk addition consistent with D-01's "modeled after Products.ts" framing; the planner should confirm with the user if strict minimalism is preferred instead (ship without it, rely on unpublished articles simply not being created until ready).

2. **`NEXT_PUBLIC_SITE_URL` production value**
   - What we know: no such env var exists in the codebase today; `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is the only precedent for a similar public config var.
   - What's unclear: the actual production domain to hardcode as the Vercel env var value (staragrevolution.com per PROJECT.md's DNS-cutover note, but not yet live).
   - Recommendation: planner should add this as an explicit early task (env var + `.env.example` entry) with a placeholder/staging value now, updated at actual DNS cutover — a `checkpoint:human-verify` before production deploy is reasonable here since this is exactly the kind of "forgot to set env var, shipped canonical=localhost" bug Pitfall 4 warns about.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|-----------|
| `NEXT_PUBLIC_SITE_URL` env var | `metadataBase`, `sitemap.ts`, `robots.ts` absolute URLs | ✗ (not found in codebase) | — | Hardcode `http://localhost:3000` default in code for dev; MUST be set as a real Vercel project env var before production deploy (see Open Question 2 / Pitfall 4) |
| Google Search Console / Bing Webmaster Tools | Verifying hreflang/sitemap indexing (STACK.md, "set up from day one") | Not a code dependency — external account setup | — | Manual setup task, not blocking this phase's code, but should be scheduled alongside launch |
| Screaming Frog (or equivalent crawler) | SEO-02's crawl-audit success criterion | Not a code dependency — external tool | — | Manual verification step at phase-gate, not automatable in CI |
| Google Rich Results Test | SEO-04's structured-data validation success criterion | Not a code dependency — external tool | — | Manual verification step at phase-gate, not automatable in CI |

**Missing dependencies with no fallback:**
- `NEXT_PUBLIC_SITE_URL` must be set to a real value before production deploy — no safe automatic fallback exists for a live canonical URL (localhost fallback is dev-only).

**Missing dependencies with fallback:**
- Screaming Frog / Rich Results Test / GSC / Bing Webmaster Tools are all manual, external, phase-gate-only verification steps — not required to write or execute the code, only to validate the success criteria per ROADMAP.md's own wording ("verified with a crawl audit", "validate ... via a rich-results test").

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 (unit + int projects) + Playwright (e2e) — both already configured |
| Config file | `vitest.config.ts` (projects: `int` w/ SQLite test DB + `unit`), `playwright.config.ts` (testDir `tests/e2e`) |
| Quick run command | `npm run test -- --project=unit` |
| Full suite command | `npm run test && npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|----------------------|--------------|
| SEO-01 | `generateMetadata`/OG fields build correct shape for a given product/article | unit | `npx vitest run --project=unit tests/unit/seo-metadata.spec.ts` | ❌ Wave 0 |
| SEO-02 | `getTranslatedLocales` returns only real-translation locales + `buildAlternates` produces reciprocal self-referencing map | unit + int | `npx vitest run --project=unit tests/unit/seo-alternates.spec.ts` / `npx vitest run --project=int tests/int/insights-fallback.spec.ts` | ❌ Wave 0 |
| SEO-03 | `sitemap.ts` default export returns entries for every locale/published item, no drafts, no dupes | int | `npx vitest run --project=int tests/int/sitemap.spec.ts` | ❌ Wave 0 |
| SEO-04 | `organizationJsonLd`/`productJsonLd`/`breadcrumbJsonLd` builders emit required fields, omit price/offers/review | unit | `npx vitest run --project=unit tests/unit/seo-json-ld.spec.ts` | ❌ Wave 0 |
| SEO-04 | JSON-LD escaping (`<` → `<`) applied by `<JsonLd>` component | unit | `npx vitest run --project=unit tests/unit/seo-json-ld.spec.ts` | ❌ Wave 0 (same file as above) |
| SEO-05 | Canonical URL for English root has no locale prefix (matches `localePrefix: "as-needed"`) | unit | same `seo-alternates.spec.ts` | ❌ Wave 0 |
| BLOG-01 | Visitor can browse `/insights` list and read `/insights/[slug]` article | e2e | `npx playwright test tests/e2e/insights.spec.ts` | ❌ Wave 0 |
| BLOG-02 | `Insights` collection localized fields cascade + `revalidateInsight` hook fires correct paths | int | `npx vitest run --project=int tests/int/insights-revalidate-hook.spec.ts` | ❌ Wave 0 |
| SEO-01/02 (manual) | View-source shows correct title/description/OG/hreflang on a live/preview deploy | manual | — (checkpoint at phase gate) | n/a |
| SEO-02 (manual) | Screaming Frog crawl reports zero hreflang conflicts | manual | — (checkpoint at phase gate, requires deployed URL) | n/a |
| SEO-04 (manual) | Google Rich Results Test validates Organization/Product/BreadcrumbList | manual | — (checkpoint at phase gate, requires deployed URL) | n/a |

### Sampling Rate
- **Per task commit:** `npx vitest run --project=unit` (fast, no DB)
- **Per wave merge:** `npm run test && npm run test:e2e`
- **Phase gate:** Full suite green + the 3 manual checkpoints above (view-source, Screaming Frog, Rich Results Test) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/seo-metadata.spec.ts` — covers SEO-01
- [ ] `tests/unit/seo-alternates.spec.ts` — covers SEO-02, SEO-05
- [ ] `tests/unit/seo-json-ld.spec.ts` — covers SEO-04
- [ ] `tests/int/sitemap.spec.ts` — covers SEO-03 (mirrors `tests/int/products-revalidate-hook.spec.ts`'s `getTestPayload()` fixture pattern)
- [ ] `tests/int/insights-fallback.spec.ts` — covers BLOG-02/SEO-02, mirrors `tests/int/pages-fallback.spec.ts` exactly, retargeted at the new `insights` collection
- [ ] `tests/int/insights-revalidate-hook.spec.ts` — covers BLOG-02, mirrors `tests/int/products-revalidate-hook.spec.ts`
- [ ] `tests/e2e/insights.spec.ts` — covers BLOG-01, mirrors `tests/e2e/product-detail.spec.ts` structure

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|-----------------|---------|---------------------|
| V2 Authentication | No | No new auth surface — Insights write access reuses existing Payload admin auth (`Users` collection, unchanged). |
| V3 Session Management | No | Unchanged. |
| V4 Access Control | Yes | `Insights.access`: `read: () => true` (public), `create`/`update`/`delete`: `Boolean(user)` (admin-gated) — same shape as `Media`/`SiteSettings`. Verify this doesn't accidentally loosen `Products`/`Pages`/`Categories` access (they stay `Boolean(user)`-gated, unchanged by this phase). |
| V5 Input Validation / Output Encoding | Yes | JSON-LD output encoding: MUST escape `<` in every JSON-LD payload before `dangerouslySetInnerHTML` (Pitfall 3) — this is output encoding, not input validation, but sits in the same ASVS family and is the phase's one genuine injection-adjacent risk. |
| V6 Cryptography | No | No new secrets/crypto surface. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Script injection via unescaped CMS string in JSON-LD | Tampering / Information Disclosure | The shared `<JsonLd>` component's `.replace(/</g, "\\u003c")` — route ALL structured-data rendering through this one component, never a second inline `dangerouslySetInnerHTML` (Pitfall 3). |
| Draft/unpublished content indexed via sitemap or public REST endpoint | Information Disclosure | Filter every sitemap/hreflang query by `published:true` (Pitfall 2); confirm `Insights.access.read: () => true` is an intentional, reviewed decision (it exposes ALL published articles via Payload's auto-generated REST/GraphQL endpoint at `(payload)/api/insights`, same as `Media` already does for uploaded files). |
| Admin/API surfaces crawled and indexed | Information Disclosure | `robots.ts` explicitly disallows `/admin` and `/api` (Code Examples) — without this, Payload's admin UI and REST endpoints are crawlable by default. |
| Canonical/hreflang self-conflict from locale-prefix mismatch | Tampering (of search ranking signals, not data) | Always build URLs through `next-intl`'s locale-prefix-aware logic (Don't Hand-Roll §1), never hardcode `/${locale}` — English has no prefix (`localePrefix: "as-needed"`). |

## Sources

### Primary (HIGH confidence)
- `src/lib/payload-fetch.ts`, `src/collections/Products.ts`, `src/collections/Categories.ts`, `src/collections/Media.ts`, `src/globals/SiteSettings.ts`, `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/hooks/revalidateCatalog.ts`, `src/hooks/revalidatePage.ts`, `src/hooks/revalidateSiteSettings.ts`, `src/app/(site)/[locale]/**`, `src/payload.config.ts`, `package.json`, `vitest.config.ts`, `playwright.config.ts`, `tests/int/pages-fallback.spec.ts`, `tests/int/products-revalidate-hook.spec.ts` — all read directly from this repo this session.
- `npm view schema-dts version` / `npm view schema-dts scripts.postinstall` — registry check run this session.
- `gsd-tools query package-legitimacy check --ecosystem npm schema-dts` — OK verdict, run this session.

### Secondary (MEDIUM confidence — CITED, official docs fetched directly via WebFetch this session)
- [nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — localized sitemap shape, `generateSitemaps` 50,000-URL limit, single-file-is-enough guidance.
- [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — `alternates`/`metadataBase`/`openGraph` field shapes and merge/ordering rules.
- [nextjs.org/docs/app/guides/json-ld](https://nextjs.org/docs/app/guides/json-ld) — official JSON-LD `<script>` pattern + mandatory XSS escaping.
- next-intl docs (`next-intl.dev/docs/environments/actions-metadata-route-handlers`) — `getPathname`-based alternates construction guidance.

### Tertiary (LOW confidence — WebSearch summaries only, cross-checked against the Secondary sources above before use)
- General WebSearch results on Next.js/next-intl multilingual SEO blog posts (dev.to, buildwithmatija.com, etc.) — used only to locate the official doc URLs above; no claim in this document rests solely on a tertiary source without a matching Secondary citation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependency, versions read directly from `package.json`.
- Architecture (native Next.js SEO APIs): MEDIUM-HIGH — core shapes (`alternates`, `sitemap.ts` return type, JSON-LD script pattern) fetched directly from official nextjs.org docs this session; the `getTranslatedLocales`/`buildAlternates` glue code is original composition of two already-verified codebase patterns (not independently doc-verified, since it doesn't exist anywhere yet).
- Insights collection design: HIGH — direct extension of `Products.ts`/`Media.ts`/`SiteSettings.ts`, all read from the repo this session; deviations (public read) are explicitly reasoned from the existing `Media`/`SiteSettings` precedent, not invented.
- Pitfalls: MEDIUM — reciprocal-hreflang and JSON-LD-escaping pitfalls are directly sourced from official docs/SEO-02's own success-criterion wording; the `NEXT_PUBLIC_SITE_URL`-missing pitfall is a direct codebase finding (grep confirmed no such var exists) rather than a general best-practice guess.

**Research date:** 2026-07-22
**Valid until:** 30 days (Next.js 16.x Metadata API is stable; re-verify if `next` is upgraded past a major version before this phase executes)
