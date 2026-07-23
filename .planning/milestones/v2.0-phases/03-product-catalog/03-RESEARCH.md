# Phase 3: Product Catalog - Research

**Researched:** 2026-07-15
**Domain:** Payload CMS 3.86 typed collections + Next.js 16 App Router routing, on the existing Star Agrevolution codebase (Phase 1/2 complete)
**Confidence:** HIGH

## Summary

Phase 3 adds two new Payload collections (`Categories`, `Products`) — deliberately typed/structured, NOT the Phase 2 Blocks page-builder (D-02) — plus two new routes (`/products`, `/products/[slug]`) under the existing `src/app/(site)/[locale]/` tree. Every mechanism this phase needs already has a proven, working precedent in the Phase 1/2 codebase: the localized-collection pattern (`Certifications.ts`), the dual-query fallback-detection fetch helper (`getPageContent`), the `afterChange` revalidate hook (`revalidatePage`), the generic Media `typeof === "object"` populate-guard, and the `CertCard` primitive (reused as-is for product cert badges). Nothing here requires a new npm dependency, a new Payload plugin, or a new architectural pattern — this is compositional work on an already-proven foundation.

The one genuinely new risk is route disambiguation: `/products` (catalog index) and the existing `[locale]/[slug]/page.tsx` catch-all both want to own single-segment paths under `[locale]/`. This is resolved for free by Next.js's own routing precedence — a static `products/` folder always wins over a sibling `[slug]` dynamic segment for an exact `/products` request — but the planner must place `products/page.tsx` as a **new sibling folder**, not attempt to special-case `"products"` inside the existing `[slug]` route.

**Primary recommendation:** Add `Categories` and `Products` as two new typed Payload collections (mirroring `Certifications.ts`'s access/localization pattern), add `src/app/(site)/[locale]/products/page.tsx` + `src/app/(site)/[locale]/products/[slug]/page.tsx` as new static-first sibling routes, add three new fetch helpers to `payload-fetch.ts` (`getCategories`, `getProductsByCategory`, `getProduct`) mirroring the existing dual-query/JS-resort patterns, and add one new `revalidateCatalog`-style hook (or two thin hooks, one per collection) reusing `revalidatePage`'s exact `revalidatePath`-per-locale mechanics.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Category/Product schema + localization + admin editing | API/Backend (Payload, embedded in the Next.js app) | Database (SQLite dev / Postgres prod) | Payload collections own schema, field-level localization, and the `/admin` UI; the DB adapter is swapped by env var only, no schema-owning code lives there |
| Catalog index grouping, product detail rendering | Frontend Server (Next.js RSC, SSG+ISR) | — | Server Components fetch via Payload Local API at render/build time; zero client JS needed for the data fetch itself |
| Gallery thumbnail swap (client interaction) | Browser/Client | — | The only genuinely interactive piece (`useState` active-image index) — a small Client Component island inside an otherwise server-rendered page |
| Media (product photos) storage | Database/Storage (Vercel Blob prod / local disk dev) | CDN (`next/image` optimization) | Reuses the exact `Media` collection + `next.config.ts` `remotePatterns` already wired for Certifications logos — no new storage plugin |
| ISR revalidation on publish | API/Backend (Payload `afterChange` hook) | Frontend Server (`revalidatePath`) | Hook runs in-process (Payload is mounted inside the same Next app), calling Next's own cache-invalidation API — no webhook/queue needed at this scale |
| Nav link to `/products` | Browser/Client rendered, Frontend Server sourced | — | `GlobalHeader`/`GlobalFooter`/`MobileNavPanel` are RSC/client hybrids already; adding one nav key is a data change, not a new tier |

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-01 | Visitor can browse products grouped by category | `getCategories` + `getProductsByCategory` fetch helpers (Architecture Patterns §2), `CatalogIndex` route composition, category-empty-state handling |
| CAT-02 | Each product has a detail page (description, specs, packaging, imagery, certs) | `getProduct` dual-query helper, `Products` collection field design (Standard Stack), `SpecTable`/`ProductGallery`/`CertCard`-reuse patterns |
| CAT-03 | Catalog scales to new products/categories without redesign | `revalidateCatalog` hook design (mirrors `revalidatePage`), `dynamicParams` default + `generateStaticParams` querying Payload (not a hardcoded slug list) — Common Pitfalls §1 |
| CAT-04 | Catalog structure supports placeholder content now, real specs slotted in later via CMS | `specifications` as a data-driven localized array (not fixed columns), seed-data design (Code Examples / seed section) exercising 0/1/N-row states |

## Standard Stack

### Core (all already installed — verified against this repo's `package.json`, no version change needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.86.0 [VERIFIED: npm registry, matches installed package.json] | Categories/Products collections, Local API, admin UI | Already the project's CMS; typed collections are the documented pattern for "uniform/structured" content vs. the Blocks page-builder used for marketing pages |
| next | 16.2.10 [VERIFIED: npm registry, matches installed package.json] | App Router routing (`/products`, `/products/[slug]`), `generateStaticParams`, ISR | Already the project's framework |
| next-intl | 4.13.2 [VERIFIED: npm registry, matches installed package.json] | `getTranslations`/`getLocale` in new server components, nav string additions | Already the project's i18n layer; `nav.products` key already exists translated in all 4 locale files (`src/i18n/messages/{en,ar,fr,ru}.json`) — no new i18n plumbing |
| @payloadcms/db-sqlite / @payloadcms/db-postgres | 3.86.0 | Schema push for the 2 new collections | Same env-driven adapter selection in `payload.config.ts` — no change to that file's adapter logic, only its `collections` array |

### Supporting (no new installs)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.24.0 | `ImageOff` icon (empty-gallery/no-image placeholder state) | Already installed, already used elsewhere (`Download`, `Menu`) |
| shadcn `Card`/`Badge`/`AspectRatio`/`Button` | already generated in `components.json` | ProductCard, SpecTable card surface, gallery aspect boxes | Per UI-SPEC's own "Registry Safety" table — zero new shadcn installs required |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Typed `Products`/`Categories` collections | Extending the Phase 2 Blocks page-builder with a "productGrid" block | Rejected by D-02 explicitly — products are uniform/structured data, not freeform editorial layout; a block can't cleanly own its own detail-page routing or `generateStaticParams` |
| A separate `scripts/seed-products.ts` file | Extending `scripts/seed-pages.ts` in place | Both viable (CONTEXT explicitly allows either); recommend a **new file** — see Don't Hand-Roll / seed section below |
| Payload's built-in `join` field for a Category→Products reverse relation | Two independent `find()` queries + JS grouping | The `join` field type exists in Payload 3.86 but adds config surface for zero benefit here — grouping ~10-30 products by category id in JS is the same one-line `.reduce()` pattern `getCertifications` already uses for halal-first sort; do not add a `join` field for this scale |
| Payload's `versions: { drafts: true }` for published/unpublished products | A plain `published` checkbox field + a `where` filter in the fetch helpers | D-02 asks for "published/draft" as a **field**, not a full draft/version history system; neither `Pages` nor `Certifications` use Payload's versions API today — introducing it here would be new, unrequested infrastructure for a single boolean gate |

**Installation:** none — no `npm install` needed for this phase.

## Architecture Patterns

### System Architecture Diagram

```
Browser request: GET /products  or  GET /products/premium-basmati-rice
        │
        ▼
Next.js [locale]/layout.tsx (existing — locale validation, dir=rtl/ltr, chrome)
        │
        ├── STATIC segment "products" wins over sibling "[slug]" catch-all ──▶ Common Pitfalls §1
        │
        ▼
┌───────────────────────────────┐        ┌──────────────────────────────────┐
│ products/page.tsx (NEW)       │        │ products/[slug]/page.tsx (NEW)    │
│  CatalogIndex                 │        │  ProductDetail                    │
│  → getCategories(locale)      │        │  → getProduct(slug, locale)       │
│  → getProductsByCategory(...) │        │    (dual-query, like getPageContent)│
└───────────────┬───────────────┘        └───────────────┬────────────────────┘
                │                                          │
                ▼                                          ▼
        payload-fetch.ts (extended)  ──▶  getPayload({config}) Local API  ──▶  Payload collections
                                                                                 (Categories, Products,
                                                                                  Certifications[reused],
                                                                                  Media[reused])
                                                                                        │
                                                                                        ▼
                                                                            SQLite (dev) / Postgres (prod)
                                                                            + Vercel Blob (prod media)

Editorial write path (staff, via /admin):
  payload.update({collection:'products'|'categories', ...})
        │
        ▼
  afterChange hook: revalidateCatalog  (mirrors revalidatePage)
        │
        ▼
  revalidatePath('/products') + revalidatePath('/products/<slug>')  × 4 locale prefixes
        │
        ▼
  Next.js Full Route Cache purged for those paths → next visitor gets fresh content, NO rebuild (CAT-03)
```

### Recommended Project Structure

```
src/
├── collections/
│   ├── Categories.ts          # NEW — flat, localized (D-01)
│   └── Products.ts            # NEW — typed, localized (D-02)
├── hooks/
│   └── revalidateCatalog.ts   # NEW — or two thin hooks; see Pattern 3 below
├── lib/
│   └── payload-fetch.ts       # EXTENDED — getCategories/getProductsByCategory/getProduct
├── components/
│   └── products/              # NEW directory (Products are NOT Blocks — do not put these under components/blocks/)
│       ├── ProductCard.tsx
│       ├── SpecTable.tsx
│       └── ProductGallery.tsx # "use client" — thumbnail-swap state only
├── app/(site)/[locale]/
│   ├── [slug]/page.tsx        # UNCHANGED — existing Pages catch-all
│   └── products/              # NEW sibling folder — wins route precedence for exact /products
│       ├── page.tsx           # CatalogIndex
│       └── [slug]/page.tsx    # ProductDetail
scripts/
├── seed-pages.ts               # UNCHANGED
└── seed-products.ts            # NEW — Categories + Products seed, run after seed-pages.ts
```

### Pattern 1: Typed localized collection (Categories, Products) — mirrors `Certifications.ts` exactly

```typescript
// Source: existing src/collections/Certifications.ts (this repo), same
// access-control shape confirmed live in src/collections/Pages.ts too.
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "name" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true }, // NOT localized — one canonical URL segment, same as Pages.slug
    { name: "shortDescription", type: "textarea", localized: true },
    { name: "image", type: "upload", relationTo: "media" }, // schema-only this phase; CatalogIndex UI-SPEC doesn't render it yet — CAT-03 future-proofing
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
  hooks: { afterChange: [revalidateCatalog] },
};
```

`access.read` requiring `Boolean(user)` is the SAME pattern every existing collection uses — the public site never calls this through the authenticated REST/GraphQL layer, it always goes through the Local API with `overrideAccess: true` (see `getPageContent`/`getCertifications`). This is not a new trust boundary; it's the established one.

### Pattern 2: Products collection — relationships + localized array

```typescript
// Source: field shapes per D-02/D-04, verified against Payload 3.86 docs
// (relationship hasMany, array localization cascade) — [CITED: payloadcms.com/docs/fields/relationship, /docs/fields/array]
export const Products: CollectionConfig = {
  slug: "products",
  admin: { useAsTitle: "name" },
  access: { /* same Boolean(user) shape as Categories */ },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "shortDescription", type: "textarea", required: true, localized: true },
    { name: "description", type: "richText", localized: true },
    // NOT localized — photography carries no per-locale meaning (UI-SPEC RTL Extensions: gallery order is source/CMS order in every locale)
    {
      name: "imageGallery",
      type: "array",
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    // D-04: both label and value localized. Setting localized:true on the
    // ARRAY field cascades to every nested field automatically — Payload
    // strips any redundant `localized:true` you'd otherwise set on the
    // nested fields themselves. Same cascade already proven live in this
    // repo's Pages.ts `layout` blocks field.
    {
      name: "specifications",
      type: "array",
      localized: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
    },
    { name: "packaging", type: "text", localized: true },
    { name: "certifications", type: "relationship", relationTo: "certifications", hasMany: true },
    { name: "displayOrder", type: "number", defaultValue: 0 },
    { name: "published", type: "checkbox", defaultValue: true },
  ],
  hooks: { afterChange: [revalidateCatalog] },
};
```

**Depth note [VERIFIED: payloadcms.com/docs/queries/depth]:** Payload's Local API default `depth` is **2** when not explicitly passed. For this schema that is exactly enough to populate `Product → certifications[] → logo`/`certificatePdf` (2 hops) and `Product → imageGallery[].image` / `Product → category` / `Category → image` (1 hop each) in a single `find()` call with no `depth` override — matching the existing fetch helpers' style (`getPageContent`/`getCertifications` never pass `depth` either).

### Pattern 3: Revalidate hook — reuse `revalidatePage`'s exact mechanics, new paths

```typescript
// Source: adapts this repo's existing src/hooks/revalidatePage.ts 1:1.
// CAT-03: a Category change only affects the catalog INDEX (D-05: flat
// grouping, no per-category landing page) — revalidate '/products' only.
// A Product change affects BOTH the index (card may appear/disappear from
// a section) AND its own detail path.
import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(`/ar${path}`);
  revalidatePath(`/fr${path}`);
  revalidatePath(`/ru${path}`);
}

export const revalidateCategory: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateAllLocales("/products");
  return doc;
};

export const revalidateProduct: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/products");
    revalidateAllLocales(`/products/${doc.slug}`);
  }
  return doc;
};
```

Two thin exported hooks (one per collection) is the ponytail-simplest option — cheaper than one hook trying to branch on `req.collection.slug`, and it mirrors the existing 1-hook-per-need granularity in this codebase (`revalidatePage` is already collection-specific, not generic across all collections).

### Pattern 4: Fetch helpers — extend `payload-fetch.ts`, do not create a second file

```typescript
// getProduct mirrors getPageContent's dual-query fallback-detection EXACTLY
// (display query with fallback ON, existence check with fallback OFF).
export async function getProduct(
  slug: string,
  locale: Locale
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

// getCategories: single dual-purpose query (same shape as getCertifications) — no per-item isTranslated needed, category grouping is not a single-document notice surface.
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

// getProductsByCategory: 2 flat queries + one JS grouping pass — same
// "stable JS re-sort on top of DB sort, no second round-trip via a join
// field" discipline getCertifications already established for halal-first.
export async function getProductsByCategory(
  locale: Locale
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
```

`isTranslated` handling recommendation (Claude's discretion, not in CONTEXT — flagged): apply the same `LocaleFallbackNotice` on the **product detail** page as `[locale]/[slug]/page.tsx` does for interior Pages (`getProduct` already returns `isTranslated` for exactly this). Do **not** add a whole-page fallback notice to the catalog INDEX — it aggregates many independently-translated collection items, not one translatable document, so a single top-of-page notice would be misleading (which specific untranslated product triggered it?). This mirrors why `getCertifications` (also a multi-item aggregate) never surfaced `isTranslated` either.

### Anti-Patterns to Avoid

- **Adding a `productGrid`/`productDetail` entry to the Phase 2 `RenderBlocks` `BLOCK_MAP`:** D-02 explicitly rejects modeling products as page-builder blocks. Products get their own collection and their own routes, full stop.
- **Hardcoding a `PRODUCT_SLUGS` array like `INTERIOR_SLUGS` in `[slug]/page.tsx`:** that pattern is correct for Pages (a small, fixed, editorially-known set of 6-7 interior pages) but wrong for Products — CAT-03 requires the catalog to scale without a code change, so `generateStaticParams` for `products/[slug]/page.tsx` **must** query Payload at build time, not hardcode a list.
- **Setting `export const dynamicParams = false`** on the product detail route. Leave it at Next.js's default (`true`). See Common Pitfalls §1.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Category→Products reverse lookup | A Payload `join` field, or a denormalized `products` array on Category kept in sync by hooks | Two flat `find()` queries + one `.filter()`/`.reduce()` grouping pass (Pattern 4) | Same complexity-avoidance precedent as `getCertifications`'s halal-first JS re-sort; a `join` field adds config + a new relationship direction to reason about for a dataset this small |
| Gallery lightbox/carousel | A carousel library (embla, keen-slider, swiper) | Static thumbnail row + `useState` active-index swap, `overflow-x-auto`/`scroll-snap-type` for mobile overflow | Phase 2 already made this exact call for `MediaGalleryBlock` ("no lightbox... static grid only"); UI-SPEC explicitly repeats the "no lightbox" ruling for products |
| Product "published/draft" gating | Payload's `versions: { drafts: true }` API | A plain `published` checkbox + `where: {published: {equals: true}}` filter in fetch helpers | Neither existing collection uses Payload's draft/version system; this phase needs a binary gate, not revision history |
| Spec table markup | shadcn `Table` component | Semantic `<dl>`/`<dt>`/`<dd>` + CSS Grid (UI-SPEC's explicit, already-resolved decision) | UI-SPEC's own Registry Safety table states a `Table` was "considered and rejected" — do not reintroduce it |
| Catalog sitemap/JSON-LD | Anything here | Nothing — explicitly Phase 5 scope (SEO-03/04) | Out of this phase's boundary per CONTEXT `<deferred>` |

**Key insight:** every "new" mechanism this phase needs is a parameter change or a field-shape change on top of a pattern this codebase already runs in production (Phase 2's Certifications/Pages). Resist the urge to introduce a second fetch-helper style, a second revalidate-hook style, or a second collection-access-control style "because Products feel different" — they don't, structurally.

## Common Pitfalls

### Pitfall 1: `generateStaticParams` for `/products/[slug]` must query Payload, and `dynamicParams` must stay `true`
**What goes wrong:** A staff member adds a brand-new product after the last deploy. If the route was built with a hardcoded slug list (or `dynamicParams = false`), the new product's page 404s until the next full rebuild — directly violating CAT-03 ("no rebuild trigger").
**Why it happens:** Copy-pasting `INTERIOR_SLUGS` from `[slug]/page.tsx` looks like the "established pattern," but that pattern was deliberately correct for a small fixed set of interior pages (Pattern 6 comment in that file: "explicit set... not a catch-all, which would falsely imply arbitrary editor-created pages"). Products are the opposite case — an intentionally growing set.
**How to avoid:** `generateStaticParams` for `products/[slug]/page.tsx` calls `payload.find({collection:'products', where:{published:{equals:true}}, locale:'en', overrideAccess:true, limit:500})` and maps to slugs (build-time snapshot for known products); leave `dynamicParams` at its Next.js default (`true`) so a slug created *after* the build still renders on first request and gets cached from then on. The `revalidateProduct` hook (Pattern 3) then handles cache-busting for *edits* to already-built products.
**Warning signs:** A newly-created product 404s in prod until the next deploy; a Playwright test hitting an unlisted slug returns 404 instead of 200.

### Pitfall 2: Route collision confusion between `/products` and `[locale]/[slug]/page.tsx`
**What goes wrong:** A planner/executor "fixes" the perceived collision by adding a special-case `if (slug === "products") ...` inside the existing catch-all, instead of just adding the sibling `products/` folder.
**Why it happens:** Both routes look like they want to own the same URL shape at first glance.
**How to avoid:** Next.js resolves this automatically and correctly — [VERIFIED via WebSearch, cross-referenced against Next.js's documented file-convention precedence rules]: a literal/static path segment (`app/.../products/page.tsx`) always takes priority over a sibling dynamic segment (`app/.../[slug]/page.tsx`) for an exact match. `INTERIOR_SLUGS` in `[slug]/page.tsx` never needs to know `"products"` exists. `/products/some-product-slug` also cannot collide with `[locale]/[slug]/page.tsx` — that route only matches a **single** extra path segment, while `/products/x` is two segments, so it resolves to the new `products/[slug]/page.tsx` route instead.
**Warning signs:** none expected if the folder structure in "Recommended Project Structure" above is followed — call out in code review only if someone adds logic to `[slug]/page.tsx` referencing "products".

### Pitfall 3: Localized array cascade — do not re-set `localized: true` on nested `specifications` fields
**What goes wrong:** Setting `localized: true` on both the `specifications` array field AND its nested `label`/`value` fields is redundant and, per a documented historical Payload issue with localized fields nested inside GROUP fields specifically (payloadcms/payload#8283), nested-localization bugs have existed in this problem space before.
**Why it happens:** D-04 says "both localized," which reads ambiguously as "set `localized: true` on both the array AND its two child fields."
**How to avoid:** Set `localized: true` **only** on the top-level `specifications` array field (exactly like this repo's own `Pages.ts` `layout` field comment: *"Cascades localization to every nested block field automatically... do NOT re-set localized inside block fields"*). [VERIFIED via WebSearch against Payload's own docs: "Payload will remove the `localized: true` property from sub-fields if a parent field is localized."] The historical #8283 bug concerns a `group` field, not a top-level `array` field on a collection — lower risk here, but still worth a Wave-0 int test asserting a 2-locale product's `specifications` round-trips correctly (create in `en`, add different rows in `fr`, confirm `fr` fetch doesn't silently return `en` rows via unintended fallback bleed).
**Warning signs:** Editing `specifications` in one locale silently changes what another locale displays; TypeScript-generated `payload-types.ts` shows `specifications` typed oddly (e.g., nested per-locale objects) after `payload generate:types`.

### Pitfall 4: `imageGallery` must NOT be `localized: true`
**What goes wrong:** Marking the image array localized would let editors accidentally upload a *different* photo per locale for the same physical product — meaningless for photography, and it silently doubles Media storage/upload effort per locale for zero benefit (photos aren't the thing needing translation).
**Why it happens:** "Everything on Products is localized" over-generalizes from `specifications`/`name`/`description`.
**How to avoid:** Only text/richText/array-of-text fields carry `localized: true`. `imageGallery` (upload relations) and `category`/`certifications` (relationships) are never localized — this matches the UI-SPEC RTL Extensions note directly: *"the gallery grid/thumbnail order stays in source/CMS array order in both ltr and rtl."* A single array, one truth, per product.
**Warning signs:** `payload generate:types` produces a `WithLocale<Media>`-shaped type for `imageGallery` instead of a flat array.

## Code Examples

### CertCard reuse for product certifications (no new component)

```tsx
// Source: this repo's src/components/blocks/CertCard.tsx (existing, unmodified)
// — GENERIC prop shape means Product cert badges are a direct call-site, no
// new component, exactly like the Company/Compliance document card reuse
// noted in 02-03-SUMMARY.md.
{(product.certifications ?? [])
  .filter((c): c is Certification => typeof c === "object")
  .map((cert) => (
    <CertCard
      key={cert.id}
      name={cert.name}
      subtitle={cert.issuingBody}
      logo={typeof cert.logo === "object" ? cert.logo : null}
      pdf={typeof cert.certificatePdf === "object" ? cert.certificatePdf : null}
      halal={cert.halal}
      t={t}
    />
  ))}
```

### Media populate guard for `imageGallery` (same guard used everywhere else in this repo)

```tsx
// Source: pattern lifted verbatim from MediaGalleryBlock.tsx's `item.image` guard.
const images = (product.imageGallery ?? [])
  .map((item) => (item.image && typeof item.image === "object" ? item.image : null))
  .filter((img): img is Media => Boolean(img?.url));
```

## State of the Art

No stale-vs-current split applies here — this phase extends an internally-consistent Phase 1/2 stack that is already current (Payload 3.86.0, Next 16.2.10, verified live against npm as of this research session).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Product detail pages should show `LocaleFallbackNotice` (mirroring interior Pages) but the catalog index should not | Architecture Patterns §4 | Low — cosmetic-only; if wrong, an untranslated product silently shows English with no notice, or the index shows a misleading whole-page notice. Confirm with the planner/UI-checker; UI-SPEC does not explicitly rule on this. |
| A2 | A new `scripts/seed-products.ts` file (run after `seed-pages.ts`) is preferable to extending `seed-pages.ts` in place | Alternatives Considered | Low — either satisfies CONTEXT's explicit either/or; if the planner prefers one file, no architectural harm either way |
| A3 | `Categories.image` and `shortDescription` fields are schema-present but **not rendered** by the CatalogIndex this phase (UI-SPEC's Component Inventory never calls out a category image) | Pattern 1 | Low — if the planner wants the category image rendered in the section header now rather than deferred, that's a UI-SPEC scope addition, not a research error |

**If this table is empty:** N/A — see entries above; all are low-risk, discretionary calls flagged for the planner/UI-checker to confirm, not compliance/security/retention claims.

## Open Questions (RESOLVED)

1. **Should `Categories` reuse the same `revalidateCatalog`-style hook file as `Products`, or should the two hooks live in one `src/hooks/revalidateCatalog.ts` file with two named exports?**
   - What we know: functionally trivial either way (Pattern 3 shows both as named exports in one conceptual module).
   - What's unclear: whether the planner's file-naming convention prefers `revalidateCatalog.ts` (both hooks) vs. `revalidateProducts.ts` + `revalidateCategories.ts` (split).
   - Recommendation: one file, two exports — matches this repo's existing 1-hook-per-collection granularity without adding a second file for ~10 lines of logic.

2. **Exact category seed set and empty-category exercise.**
   - What we know: D-01 examples are Grains/Spices/Pulses/Oilseeds; UI-SPEC requires an exercisable "empty category (zero published products)" state and a "zero categories/products at all" whole-catalog empty state.
   - What's unclear: whether the seed script should deliberately leave one category with zero products (to exercise that state in e2e/manual QA) or seed every category with ≥1 product.
   - Recommendation: seed 3 categories with 2-3 products each, and 1 category (e.g. "Oilseeds") with zero products, deliberately — mirrors the Certifications seed's discipline of exercising every documented UI state (PDF-present/absent, halal/standard) rather than only the happy path.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.10 (int, Local API — `tests/int/**`) + Playwright ^1.61.1 (e2e — `tests/e2e/**`) |
| Config file | `vitest.config.ts` (`int` project, isolated SQLite file DB, `fileParallelism: false`) + `playwright.config.ts` |
| Quick run command | `npx vitest run tests/int/products.spec.ts` (or the equivalent new file name) |
| Full suite command | `npm run test && npm run test:e2e && npm run lint:rtl` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-01 | `getProductsByCategory` groups correctly, respects `displayOrder`, handles an empty category | int | `npx vitest run tests/int/products.spec.ts -t "grouping"` | ❌ Wave 0 |
| CAT-01 | `/products` renders category sections + product cards; empty-category copy shows for a zero-product category | e2e | `npx playwright test tests/e2e/catalog-index.spec.ts` | ❌ Wave 0 |
| CAT-02 | `getProduct` dual-query fallback (mirrors `pages-fallback.spec.ts`) — untranslated locale falls back to English + flags `isTranslated: false` | int | `npx vitest run tests/int/products.spec.ts -t "fallback"` | ❌ Wave 0 |
| CAT-02 | `/products/[slug]` renders description, SpecTable rows, packaging row, gallery, applicable cert badges, RFQ CTA href with `?product=` query | e2e | `npx playwright test tests/e2e/product-detail.spec.ts` | ❌ Wave 0 |
| CAT-03 | `revalidateProduct`/`revalidateCategory` call `revalidatePath` for `/products` (+ `/products/<slug>` for products) across all 4 locale prefixes | int | `npx vitest run tests/int/products-revalidate-hook.spec.ts` | ❌ Wave 0 (mirrors existing `tests/int/pages-revalidate-hook.spec.ts` 1:1) |
| CAT-03 | A product slug NOT present at build time still returns 200 on first request (`dynamicParams` default) | e2e | manual/e2e against a `next build && next start` run, not a dev server (SSG behavior only observable in a production build) | ❌ Wave 0 — flag as build-verification step, not a unit test |
| CAT-04 | `npm run build` prerenders `/products` + every seeded product slug × 4 locales with zero empty-content errors | build | `npm run build` (exit 0) | N/A — reuses the existing Phase 2 build-verification convention, no new test file |
| CAT-04 | A product with 0, 1, and 5 `specifications` rows all render the SpecTable correctly (0 → region omitted per UI-SPEC) | e2e | fold into `product-detail.spec.ts` with 3 seeded fixture products | ❌ Wave 0 |
| (PAGE-04 regression) | New `/products` nav link resolves to a real 200, not a `#` stub | e2e | `npx playwright test tests/e2e/nav-links.spec.ts` | ✅ already exists — auto-covers any href added to `NAV_HREFS`, no new test needed |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/int/products*.spec.ts`
- **Per wave merge:** `npm run test && npm run test:e2e && npm run lint:rtl && npm run build`
- **Phase gate:** Full suite green (mirrors Phase 2's own gate — 10/10 → grew to 14/14 int, 68 → 82 e2e as each plan landed) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/int/products.spec.ts` — covers CAT-01 (grouping), CAT-02 (fallback), Pitfall 3's localized-array round-trip check
- [ ] `tests/int/products-revalidate-hook.spec.ts` — covers CAT-03, mirrors `pages-revalidate-hook.spec.ts` structure exactly (mock `next/cache` before import chain pulls in `payload.config`)
- [ ] `tests/e2e/catalog-index.spec.ts` — covers CAT-01 UI, empty-category state, whole-catalog empty state
- [ ] `tests/e2e/product-detail.spec.ts` — covers CAT-02/CAT-04 UI, gallery thumbnail swap + `aria-pressed`, RFQ CTA href shape
- [ ] Seed fixtures: at minimum one product with 0 specs, one with 1, one with 5 — needed for the CAT-04 SpecTable-omission test above
- No new framework install needed — Vitest/Playwright already configured and proven against this exact fetch-helper/hook pattern in Phase 2

*(No manual-only requirements identified — every CAT-0x behavior is automatable at this scale.)*

## Security Domain

### Applicable ASVS Categories (Level 1, per `.planning/config.json` `security_asvs_level: 1`)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No new auth surface — `/admin` auth is unchanged Payload `Users` collection |
| V3 Session Management | No | Unchanged |
| V4 Access Control | Yes | `Categories`/`Products` collections use the same `Boolean(user)` access-control shape as every existing collection (`Pages`, `Certifications`, `Media`); public reads go through Local API `overrideAccess: true`, the established pattern — not a new bypass, the same one already audited in Phase 1/2 |
| V5 Input Validation | Yes | Product/category `slug` from the URL is only ever used in a Payload `where: {equals}` query (parameterized by Payload's ORM, no raw SQL string interpolation) — no injection surface. `Products.slug`/`Categories.slug` are `unique + index` at the schema level, same as `Pages.slug` |
| V6 Cryptography | No | No new crypto surface |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Reflected content via RFQ CTA query params (`/contact?product=<slug>&productName=<name>`) | Tampering / (low) Information Disclosure | `productName` must be `encodeURIComponent`'d when building the href (per UI-SPEC's own text: "url-encoded name"); React/Next.js JSX auto-escapes on render, so this is low-risk today — flag for Phase 4 (LEAD-02) research: if the contact form ever renders this param via `dangerouslySetInnerHTML`, re-verify then, not a Phase 3 concern |
| Unbounded `limit` on catalog queries | Denial of Service (low, no public write path yet) | `getProductsByCategory`/`getCategories` use explicit `limit` values (500/100) rather than unbounded queries, consistent with `getCertifications`'s existing `limit: 100` |
| Media mimetype bypass via product image uploads | Tampering | No new upload surface — `Products.imageGallery` and `Categories.image` both relate to the *existing* `Media` collection, which already restricts `mimeTypes: ["image/*", "application/pdf"]`; no collection-specific override needed or introduced |

## Sources

### Primary (HIGH confidence)
- This repository's existing source — `src/collections/{Certifications,Pages,Media}.ts`, `src/lib/payload-fetch.ts`, `src/hooks/revalidatePage.ts`, `src/components/blocks/{CertCard,MediaGalleryBlock,RenderBlocks}.tsx`, `src/app/(site)/[locale]/**`, `src/i18n/{routing.ts,messages/*.json}`, `next.config.ts`, `vitest.config.ts`, `tests/int/{certifications,pages-revalidate-hook}.spec.ts`, `tests/e2e/nav-links.spec.ts` — read directly this session
- `npm view payload version` / `npm view next version` / `npm view next-intl version` — confirmed 3.86.0 / 16.2.10 / 4.13.2, exact match to installed `package.json`
- Payload CMS official docs — `payloadcms.com/docs/queries/depth` (default depth = 2), `payloadcms.com/docs/fields/relationship` (hasMany syntax), `payloadcms.com/docs/fields/array` (array field shape), `payloadcms.com/docs/configuration/localization` (nested-field localization strip behavior) — via WebSearch cross-referenced against official domain
- Next.js official docs — file-system convention static-vs-dynamic segment precedence (`nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes`) — via WebSearch cross-referenced against official domain, consistent with a concrete `/blog/about` vs `/blog/[slug]` worked example

### Secondary (MEDIUM confidence)
- payloadcms/payload GitHub issue #8283 ("Array field inside localized group field is not saved") — historical, concerns a `group` field specifically, not the top-level `array` field this design uses; kept as a Wave-0 test prompt (Pitfall 3), not a blocker

### Tertiary (LOW confidence)
- None relied upon as load-bearing for any Standard Stack or Architecture claim.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, every version verified live against npm and matches the already-installed `package.json`
- Architecture: HIGH — every pattern (localized collection, dual-query fetch, afterChange revalidate hook, Media populate guard, CertCard reuse) has a working, tested precedent already in this exact codebase
- Route precedence (Pitfall 2): HIGH — confirmed via official Next.js documentation, not just training-data recall
- Pitfalls: HIGH for Pitfalls 1/2/4 (directly traceable to this repo's own code comments + official docs); MEDIUM for Pitfall 3 (the specific historical GitHub issue concerns a different field-nesting shape than this design uses — flagged conservatively, not blocking)

**Research date:** 2026-07-15
**Valid until:** 30 days (stable stack, no fast-moving dependencies in scope)
