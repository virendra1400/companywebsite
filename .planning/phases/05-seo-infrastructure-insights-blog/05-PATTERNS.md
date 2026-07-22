# Phase 5: SEO Infrastructure & Insights/Blog - Pattern Map

**Mapped:** 2026-07-22
**Files analyzed:** 17
**Analogs found:** 17 / 17

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/collections/Insights.ts` | model (Payload collection) | CRUD | `src/collections/Products.ts` | exact (explicit in RESEARCH Pattern 5) |
| `src/hooks/revalidateInsights.ts` | event-driven hook | event-driven | `src/hooks/revalidateCatalog.ts` (`revalidateProduct`) | exact |
| `src/payload.config.ts` (edit — register collection) | config | CRUD | same file, `Products` import/registration lines | exact |
| `src/globals/SiteSettings.ts` (edit — add `address`/`sameAs`) | config/model | CRUD | same file, existing `contact` group | exact |
| `src/lib/seo/translated-locales.ts` | utility | request-response | `src/lib/payload-fetch.ts` (`getPageContent`/`getProduct` existence-check half) | exact |
| `src/lib/seo/alternates.ts` | utility | transform | `src/lib/payload-fetch.ts` pattern conventions (pure function, no direct analog — new) | role-match |
| `src/lib/seo/json-ld.tsx` | utility/component | transform | none in-repo (greenfield) — RESEARCH Pattern 4 is the source | no analog |
| `src/app/sitemap.ts` | route (special file) | batch | none in-repo (greenfield) — RESEARCH Pattern 3 is the source; `src/lib/payload-fetch.ts` query conventions reused | no analog (query conventions reused) |
| `src/app/robots.ts` | route (special file) | request-response | none in-repo (greenfield) — RESEARCH Code Examples | no analog |
| `src/app/(site)/[locale]/layout.tsx` (edit — `metadataBase` + Organization JSON-LD) | provider/layout | request-response | itself (existing layout) — read current content before editing | n/a (edit in place) |
| `src/app/(site)/[locale]/insights/page.tsx` | route (page) | CRUD (read) | `src/app/(site)/[locale]/products/page.tsx` | exact |
| `src/app/(site)/[locale]/insights/[slug]/page.tsx` | route (page) | CRUD (read) | `src/app/(site)/[locale]/products/[slug]/page.tsx` | exact |
| `src/app/(site)/[locale]/products/[slug]/page.tsx` (edit — add `generateMetadata` + JSON-LD) | route (page) | request-response | same file (existing `ProductDetailPage`) | n/a (edit in place) |
| `src/components/insights/InsightCard.tsx` | component | transform (render) | `src/components/products/ProductCard.tsx` | exact |
| `src/components/chrome/GlobalHeader.tsx` (edit — add nav key) | component | request-response | same file, `NAV_KEYS`/`NAV_HREFS` arrays | n/a (edit in place) |
| `src/components/chrome/MobileNavPanel.tsx` (edit — add nav key) | component | request-response | `GlobalHeader.tsx`'s `NAV_KEYS`/`NAV_HREFS` (duplicated list per UI-SPEC) | exact |
| `src/i18n/request.ts` (edit — add `dateTime.latn` format) | config | transform | same file, existing `formats.number.latn` entry | exact |
| `src/lib/payload-fetch.ts` (extend — no new function required, reused as-is by `translated-locales.ts`) | utility | request-response | itself | n/a (read-only reuse) |

## Pattern Assignments

### `src/collections/Insights.ts` (model, CRUD)

**Analog:** `src/collections/Products.ts` (fields shape) + `src/collections/Media.ts` (public-read access shape)

**Imports pattern** (Products.ts lines 1-2):
```typescript
import type { CollectionConfig } from "payload";
import { revalidateProduct } from "@/hooks/revalidateCatalog";
```
→ for Insights: `import { revalidateInsight } from "@/hooks/revalidateInsights";`

**Access pattern — deviate from Products, copy from Media.ts** (Media.ts lines 12-22):
```typescript
access: {
  read: () => true,               // PUBLIC — matches Media/SiteSettings, NOT Products' Boolean(user)
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
},
```
Reason (explicit in RESEARCH + CONTEXT code_context): Insights is read through Payload's auto-generated public REST endpoint, unlike Pages/Products which are always read via `payload-fetch.ts` with `overrideAccess: true`.

**Field shape pattern** (Products.ts lines 16-51 — localized cascading, unlocalized slug, `published` flag):
```typescript
{ name: "name", type: "text", required: true, localized: true },   // -> Insights: "title"
{ name: "slug", type: "text", required: true, unique: true, index: true }, // NOT localized
{ name: "category", type: "relationship", relationTo: "categories", required: true }, // Insights: required: false per D-02
{ name: "shortDescription", type: "textarea", required: true, localized: true }, // -> Insights: "excerpt"
{ name: "description", type: "richText", localized: true },        // -> Insights: "body", required: true
{ name: "published", type: "checkbox", defaultValue: true },       // copy verbatim (RESEARCH Open Question 1 recommends this)
```
`localized: true` on a parent field cascades to nested fields automatically — do NOT re-set on nested fields (Products.ts lines 31-34 comment, same pitfall documented for Insights' `specifications`-style fields if any are added later).

**Hook wiring** (Products.ts line 52):
```typescript
hooks: { afterChange: [revalidateProduct] },   // -> Insights: [revalidateInsight]
```

---

### `src/hooks/revalidateInsights.ts` (event-driven)

**Analog:** `src/hooks/revalidateCatalog.ts` (`revalidateProduct`, lines 1-27)

Copy the whole `revalidateAllLocales` helper + hook shape verbatim, retarget paths:
```typescript
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

---

### `src/payload.config.ts` (edit)

**Analog:** same file, existing `Products` wiring (lines 15, and its place in the `collections:` array further down — read full file before editing to find exact array location).

```typescript
import { Products } from "@/collections/Products";
// ADD:
import { Insights } from "@/collections/Insights";
```
Add `Insights` to the `collections: [...]` array alongside `Products`.

---

### `src/globals/SiteSettings.ts` (edit — D-09)

**Analog:** same file, existing `contact` group field (lines 41-74)

Copy the `type: "group"` structure verbatim for `address`, and add a `sameAs` array field:
```typescript
{
  type: "group",
  name: "address",
  label: "Company address",
  fields: [
    { name: "street", type: "text" },
    { name: "city", type: "text" },
    { name: "state", type: "text" },
    { name: "postalCode", type: "text" },
    { name: "country", type: "text" },
  ],
},
{
  name: "sameAs",
  type: "array",
  label: "Social / profile links (sameAs)",
  fields: [{ name: "url", type: "text", required: true }],
},
```
Access/hooks (`read: () => true`, `revalidateSiteSettings`) stay unchanged — file lines 8-18.

---

### `src/lib/seo/translated-locales.ts` (utility, request-response)

**Analog:** `src/lib/payload-fetch.ts` `getProduct`/`getPageContent` (lines 43-74, 146-174) — existence-check-only half.

**Core pattern to extract** (payload-fetch.ts lines 61-71, the fallback-OFF existence check):
```typescript
const nativeCheck = await payload.find({
  collection: "products",
  where: { slug: { equals: slug }, published: { equals: true } },
  limit: 1,
  locale,
  fallbackLocale: false,
  overrideAccess: true,
});
const isTranslated = locale === "en" || Boolean(nativeCheck.docs[0]?.name);
```
Generalize this exact shape across all 4 `routing.locales` (see RESEARCH Pattern 2 for the full new-file code — already vetted against this analog).

**Imports pattern** (payload-fetch.ts lines 1-5):
```typescript
import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
```

**Error handling / guard pattern:** none needed beyond the existing `.docs[0]?.field` optional-chain guard already used throughout `payload-fetch.ts` — no try/catch wrapper exists anywhere in that file; Payload's `find()` doesn't throw for empty results.

---

### `src/lib/seo/alternates.ts` (utility, transform)

No direct in-repo analog (pure new glue function). Consumes `getTranslatedLocales`'s output; must reuse `routing.defaultLocale`/`routing.locales` from `src/i18n/routing.ts` (lines 7-14) for locale-prefix-aware URL building — do NOT hand-concatenate `/${locale}${path}` (English has no prefix, `localePrefix: "as-needed"`). See RESEARCH Pattern 3's `localeUrl()` helper for the exact prefix logic to copy.

---

### `src/lib/seo/json-ld.tsx` (utility/component, transform)

No in-repo analog — first JSON-LD in this codebase. Use RESEARCH Pattern 4's code verbatim (official Next.js `<script>` + `.replace(/</g, "\\u003c")` XSS escaping). Field-mapping inputs come from:
- `getSiteBrand()` in `payload-fetch.ts` (lines 11-37) for `organizationJsonLd` — reuse `siteName`/`logoUrl` shape; extend that function or read `SiteSettings` directly for the new `address`/`sameAs` fields (D-09).
- `Product` type fields (`name`, `imageGallery`, `shortDescription`/`description`, `category`, `certifications`) already destructured in `products/[slug]/page.tsx` lines 57-69 for `productJsonLd`.

---

### `src/app/sitemap.ts` / `src/app/robots.ts` (route, batch / request-response)

No in-repo analog (greenfield special files). Query conventions to reuse from `payload-fetch.ts`:
```typescript
// Products/Insights enumeration — copy the payload.find() shape + published:true filter
// from getProductsByCategory (payload-fetch.ts lines 117-140) and getProduct (146-174).
const products = await payload.find({
  collection: "products", where: { published: { equals: true } }, locale: "en", overrideAccess: true, limit: 500,
});
```
Use `src/i18n/routing.ts`'s `routing.locales`/`routing.defaultLocale` for locale enumeration — never hardcode `["en","ar","fr","ru"]` a second time.

---

### `src/app/(site)/[locale]/layout.tsx` (edit)

Read the existing file in full before editing (not excerpted here — small edit, additive `metadata` export + one `<JsonLd>` call in the body). Do NOT touch `(payload)/layout.tsx` (auto-generated, per RESEARCH Pattern 1 explicit warning).

---

### `src/app/(site)/[locale]/insights/page.tsx` (route, CRUD-read)

**Analog:** `src/app/(site)/[locale]/products/page.tsx` (full file, 121 lines)

**Imports pattern** (lines 1-9):
```typescript
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import type { Locale } from "@/i18n/routing";
```

**ISR pattern** (line 13): `export const revalidate = 60;` — copy verbatim.

**Empty-state pattern** (lines 41-60): copy the whole `data-testid="hero"` empty-state block shape, retarget copy to `insights.emptyHeading`/`insights.emptyBody` keys (UI-SPEC Copywriting Contract).

**Grid composition pattern** (lines 62-120): `HeroBlock` (compact) → grid section → `CTABandBlock`, same structure; Insights drops the category-grouped-sections/anchor-nav part (UI-SPEC "Resolved discretion — no category filter UI in v1") — flatten to one reverse-chronological grid, no `sectionBg`/anchor-nav loop needed.

---

### `src/app/(site)/[locale]/insights/[slug]/page.tsx` (route, CRUD-read)

**Analog:** `src/app/(site)/[locale]/products/[slug]/page.tsx` (full file, 177 lines)

**`generateStaticParams` pattern** (lines 30-40): copy verbatim, retarget `collection: "insights"`, no `published` filter unless Insights gets one (RESEARCH recommends adding it — see Open Question 1, apply same filter here).

**PageHeader/breadcrumb pattern** (lines 77-103): copy structure, but per UI-SPEC "Resolved discretion — no category crumb," drop the `category` breadcrumb segment — Insights breadcrumb is 2 levels only (`Insights / [title]`), not 3.

**LocaleFallbackNotice pattern** (line 75): `{!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}` — reuse verbatim.

**RichText body pattern** (lines 111-117): copy the `max-w-[720px]` RichText container verbatim for the article body (UI-SPEC explicitly calls this out as reused, not reinvented).

**CTABand pattern** (lines 166-174): copy verbatim, same heading "Ready to Source With Confidence?" per UI-SPEC Copywriting Contract.

**Error handling:** `if (!product) notFound();` (line 55) — copy verbatim.

---

### `src/components/insights/InsightCard.tsx` (component, transform)

**Analog:** `src/components/products/ProductCard.tsx` (full file, 48 lines)

**Imports pattern** (lines 1-7):
```typescript
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
```

**Core card pattern** (lines 20-47): copy whole-card-as-Link, `Card` + `AspectRatio` + conditional `Badge` + line-clamped text structure. Deviations per UI-SPEC:
- `AspectRatio ratio={16/9}` (not `4/3` — editorial banner proportion, not product-photography proportion)
- excerpt uses `line-clamp-3` (not `line-clamp-2`)
- meta row adds category+date with conditional separator (new row not present on ProductCard — build fresh, following the same `text-neutral-600`/Label-token convention used elsewhere, e.g. `products/[slug]/page.tsx` breadcrumb line 81)
- grid is `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (not 2/3/4) — set at call-site (`insights/page.tsx`), not inside the card component.

**Empty-image guard pattern** (lines 32-36): copy verbatim.

---

### `src/components/chrome/GlobalHeader.tsx` / `MobileNavPanel.tsx` (edit)

**Analog:** `GlobalHeader.tsx` lines 16-36 (`NAV_KEYS`/`NAV_HREFS`)

```typescript
const NAV_KEYS = [
  "home", "about", "products", "certifications", "manufacturing", "export",
  "company", "insights", "contact",   // ADD "insights" between company and contact
] as const;

const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  // ...existing entries...
  insights: "/insights",   // ADD
};
```
`MobileNavPanel.tsx` duplicates this same list (UI-SPEC explicitly notes the duplication is existing, not new) — apply the identical one-line addition there; read that file before editing since it wasn't excerpted here (small, mechanical edit, same shape as GlobalHeader's).

---

### `src/i18n/request.ts` (edit — UI-SPEC RTL Extensions)

**Analog:** same file, existing `formats.number.latn` entry (lines 17-21)

```typescript
formats: {
  number: {
    latn: { numberingSystem: "latn" },
  },
  // ADD:
  dateTime: {
    latn: { numberingSystem: "latn", dateStyle: "long" },
  },
},
```
Consumed via `format.dateTime(date, "latn")` in the InsightCard meta row and Article byline — never bare `Intl.DateTimeFormat` (Arabic defaults to Arabic-Indic digits otherwise, per FOUND-03).

---

## Shared Patterns

### Translation-status / hreflang gating (D-07)
**Source:** `src/lib/payload-fetch.ts` lines 61-71 (fallback-OFF existence check, generalized in `src/lib/seo/translated-locales.ts`)
**Apply to:** `generateMetadata` on every content page (products/[slug], insights/[slug], and any interior page getting metadata), `sitemap.ts`'s per-item loop.
```typescript
const nativeCheck = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, locale, fallbackLocale: false, overrideAccess: true });
```

### Public-read access shape (D-09/Insights deviation from Products/Pages)
**Source:** `src/collections/Media.ts` lines 12-22, `src/globals/SiteSettings.ts` lines 8-11
**Apply to:** `src/collections/Insights.ts`
```typescript
access: { read: () => true, create: ({ req: { user } }) => Boolean(user), update: ..., delete: ... }
```

### Per-locale revalidation
**Source:** `src/hooks/revalidateCatalog.ts` lines 9-14 (`revalidateAllLocales` helper)
**Apply to:** `src/hooks/revalidateInsights.ts` (copy helper verbatim, retarget paths)

### ISR revalidate window
**Source:** `products/page.tsx` line 13, `products/[slug]/page.tsx` line 21
**Apply to:** `insights/page.tsx`, `insights/[slug]/page.tsx`
```typescript
export const revalidate = 60;
```

### Locale-prefix-aware URL building (SEO-05 canonical correctness)
**Source:** `src/i18n/routing.ts` lines 7-14 (`routing.defaultLocale`, `localePrefix: "as-needed"`)
**Apply to:** `src/lib/seo/alternates.ts`, `src/app/sitemap.ts` — never hand-concatenate `/${locale}${path}`; English has no prefix.

### Breadcrumb chevron (RTL mirroring)
**Source:** `products/[slug]/page.tsx` line 87/91
```typescript
<ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
```
**Apply to:** `insights/[slug]/page.tsx` breadcrumb, `breadcrumbJsonLd` visual counterpart.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/lib/seo/json-ld.tsx` | utility/component | transform | No JSON-LD anywhere in this repo yet — fully greenfield; use RESEARCH Pattern 4 (official Next.js doc pattern) as the source instead of a codebase analog. |
| `src/app/sitemap.ts` | route | batch | No `sitemap.ts`/`robots.ts`/any root-of-`src/app` special file exists yet; use RESEARCH Pattern 3 + `payload-fetch.ts` query conventions (partially reused for the `payload.find()` shape). |
| `src/app/robots.ts` | route | request-response | Same as above — greenfield; use RESEARCH Code Examples section. |
| `src/lib/seo/alternates.ts` | utility | transform | Pure new glue function combining two already-verified patterns (`routing.ts` locale-prefix logic + `getTranslatedLocales` output) — no single existing analog, but its two inputs are both analog-backed above. |

## Metadata

**Analog search scope:** `src/collections/`, `src/hooks/`, `src/globals/`, `src/lib/`, `src/i18n/`, `src/app/(site)/[locale]/products/**`, `src/components/products/`, `src/components/chrome/`, `src/payload.config.ts`
**Files scanned:** Products.ts, Categories.ts, Media.ts, payload-fetch.ts, revalidateCatalog.ts, SiteSettings.ts, routing.ts, request.ts, payload.config.ts, products/page.tsx, products/[slug]/page.tsx, ProductCard.tsx, GlobalHeader.tsx
**Pattern extraction date:** 2026-07-22
