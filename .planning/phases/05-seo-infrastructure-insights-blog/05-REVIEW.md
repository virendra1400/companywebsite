---
phase: 05-seo-infrastructure-insights-blog
reviewed: 2026-07-23T00:00:00Z
depth: standard
files_reviewed: 30
files_reviewed_list:
  - scripts/seed-insights.ts
  - src/app/(site)/[locale]/insights/[slug]/page.tsx
  - src/app/(site)/[locale]/insights/page.tsx
  - src/app/(site)/[locale]/layout.tsx
  - src/app/(site)/[locale]/products/[slug]/page.tsx
  - src/app/robots.ts
  - src/app/sitemap.ts
  - src/collections/Insights.ts
  - src/components/chrome/GlobalHeader.tsx
  - src/components/chrome/MobileNavPanel.tsx
  - src/components/insights/InsightCard.tsx
  - src/globals/SiteSettings.ts
  - src/hooks/revalidateInsights.ts
  - src/i18n/messages/ar.json
  - src/i18n/messages/en.json
  - src/i18n/messages/fr.json
  - src/i18n/messages/ru.json
  - src/i18n/request.ts
  - src/lib/payload-fetch.ts
  - src/lib/seo/alternates.ts
  - src/lib/seo/json-ld.tsx
  - src/lib/seo/metadata.ts
  - src/lib/seo/translated-locales.ts
  - src/payload.config.ts
  - tests/e2e/insights.spec.ts
  - tests/int/insights-fallback.spec.ts
  - tests/int/insights-revalidate-hook.spec.ts
  - tests/int/sitemap.spec.ts
  - tests/unit/seo-alternates.spec.ts
  - tests/unit/seo-json-ld.spec.tsx
  - tests/unit/seo-metadata.spec.ts
findings:
  critical: 1
  warning: 3
  info: 4
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-07-23T00:00:00Z
**Depth:** standard
**Files Reviewed:** 30
**Status:** issues_found

## Summary

Reviewed the SEO infrastructure + Insights/blog feature set: the `Insights` Payload
collection, its afterChange revalidate hook, the `/insights` index and article
detail routes, the shared SEO helpers (`alternates.ts`, `json-ld.tsx`,
`metadata.ts`, `translated-locales.ts`), `sitemap.ts`/`robots.ts`, the seed
script, chrome nav wiring, and the associated unit/integration/e2e specs.

The SEO helper layer (`buildAlternates`, `buildMetadata`, `JsonLd` escaping,
`getTranslatedLocales`) is solid and well covered by unit tests. The most
serious finding is a real access-control gap: `Insights.access.read` grants
unauthenticated, unfiltered read access to Payload's auto-generated REST/
GraphQL API, so draft/unpublished articles are readable by anyone who queries
`/api/insights` directly — despite the phase's own plan documents asserting
this is "handled by the published flag + public-query filtering." That
filtering only exists in the Next.js page/sitemap query layer, not in the
collection's access control, so the stated mitigation was never actually
implemented. Three further Warnings and four Info-level issues are listed
below (a structured-data duplicate-URL breadcrumb, a sitemap coverage gap for
the `/insights` and `/products` index pages, and an unmet 404-copy acceptance
criterion, plus minor duplication/robustness items).

## Critical Issues

### CR-01: Insights collection publicly exposes unpublished/draft articles via the public REST/GraphQL API

**File:** `src/collections/Insights.ts:12-17`
**Issue:**
```ts
access: {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
},
```
`read: () => true` grants unconditional access with no query constraint. In
Payload, returning a boolean from an access function means "no row-level
filtering is applied" — a `Where` clause must be returned to scope which
documents are visible. Every application call site in this repo
(`getInsight`, `getPublishedInsights`, `sitemap.ts`, `getTranslatedLocales`)
correctly adds `where: { published: { equals: true } }` and uses
`overrideAccess: true`, so the Next.js pages themselves never render a draft.
But Payload also auto-generates a public REST endpoint at
`(payload)/api/[...slug]` (confirmed live in this repo) and a GraphQL
endpoint. Because `access.read` imposes no filter, an anonymous request such
as:
```
GET /api/insights                              -> returns every article, draft or published
GET /api/insights?where[published][equals]=false -> returns only drafts
```
returns full draft content (title, excerpt, body, author, cover image) to any
unauthenticated caller, bypassing the `published` gate entirely.

This is not a hypothetical: the phase's own `05-01-PLAN.md` threat model
(T-05-04) explicitly claims *"Draft leakage handled by the `published` flag +
public-query filtering (owned by 05-04/05-05)"* — but neither 05-04 nor 05-05
added any query constraint to `Insights.access.read`; they only filtered the
application-layer page/sitemap queries (T-05-02). The stated mitigation for
T-05-04 was never delivered, so the accepted-risk disposition in that plan is
based on a false premise.

**Fix:** Scope the access function to a query constraint instead of a bare
boolean, or require auth for read (this collection's app-layer readers all
already pass `overrideAccess: true`, so nothing server-side depends on
public unauthenticated read):
```ts
access: {
  // Authenticated staff (admin panel) see everything; anonymous callers to
  // the public REST/GraphQL endpoint only ever see published articles.
  read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
},
```

## Warnings

### WR-01: BreadcrumbList JSON-LD emits a duplicate URL for two distinct items

**File:** `src/app/(site)/[locale]/products/[slug]/page.tsx:103-107`
**Issue:**
```ts
const breadcrumbTrail = [
  { name: t("breadcrumbRoot"), url: localeUrl(locale as Locale, "/products") },
  ...(category ? [{ name: category.name, url: localeUrl(locale as Locale, "/products") }] : []),
  { name: product.name, url: localeUrl(locale as Locale, `/products/${slug}`) },
];
```
When a product has a category, the emitted `BreadcrumbList` has a "Products"
item and a category item that share the exact same URL (`/products`), because
there is no category archive page. A `BreadcrumbList` is meant to represent a
navigable hierarchy of distinct pages; two adjacent list items pointing at the
identical URL under different names is invalid/confusing structured data and
can be flagged by Google's Rich Results validator as a low-quality breadcrumb.
**Fix:** Either omit the category breadcrumb entry entirely (since it isn't a
real navigable resource) or don't include a `url` field on it:
```ts
const breadcrumbTrail = [
  { name: t("breadcrumbRoot"), url: localeUrl(locale as Locale, "/products") },
  { name: product.name, url: localeUrl(locale as Locale, `/products/${slug}`) },
];
```

### WR-02: Sitemap never lists the `/insights` (or `/products`) index/listing pages

**File:** `src/app/sitemap.ts:12,43-77`
**Issue:** `INTERIOR_SLUGS` only covers `about/certifications/manufacturing/
export/company/contact`, and the sitemap enumerates the home page plus every
individual product/insight detail page — but the `/insights` index and
`/products` catalog index (both real, unique, crawlable pages built in this
and earlier phases) are never emitted as `<url>` entries anywhere in
`sitemap()`. For a phase explicitly named "seo-infrastructure," omitting the
canonical hub pages for the two content collections this phase adds/exposes
undermines the sitemap's coverage goal — these pages are only discoverable to
crawlers via internal links, not the sitemap signal.
**Fix:** Add explicit entries for these index routes, e.g. treat them like
another "pages"-gated interior slug (if a CMS Pages doc backs them) or add a
dedicated ungated entry:
```ts
entries.push(...(await entriesFor("/products", "pages", "products-index")));
entries.push(...(await entriesFor("/insights", "pages", "insights-index")));
```
(or a simpler locale-invariant push if no per-locale translation gating
applies to these routes).

### WR-03: `insights.notFoundHeading`/`notFoundBody` are unused — the 404 acceptance criterion is not actually met

**File:** `src/i18n/messages/en.json:85-86` (and mirrored in ar/fr/ru); `src/app/(site)/[locale]/insights/[slug]/page.tsx:112`
**Issue:** `05-04-PLAN.md`'s acceptance criteria state: *"An invalid/
unpublished /insights/[slug] returns 404 with the documented not-found copy
(UI-SPEC error)."* The implementation only calls `notFound()` — there is no
`not-found.tsx` for the insights segment, so Next's generic 404 boundary
renders instead of the documented "Article not found." heading + "Browse all
insights" link. The message keys exist but are dead code; the stated
acceptance criterion is not fulfilled (this mirrors a pre-existing identical
gap for `products.notFoundHeading/notFoundBody`, so it is a known, not novel,
pattern — but it's still an unmet requirement, and the e2e spec
(`tests/e2e/insights.spec.ts`) only asserts `res.status() === 404`, so nothing
catches this gap).
**Fix:** Add `src/app/(site)/[locale]/insights/not-found.tsx` (and ideally a
shared one for products too) that renders `t("notFoundHeading")`/
`t("notFoundBody")` with a link back to `/insights`, or remove the unmet
acceptance criterion/dead keys if the generic 404 is actually the intended
behavior going forward.

## Info

### IN-01: `NAV_KEYS`/`NAV_HREFS` duplicated verbatim between GlobalHeader and MobileNavPanel

**File:** `src/components/chrome/GlobalHeader.tsx:16-38`, `src/components/chrome/MobileNavPanel.tsx:28-50`
**Issue:** Both files define an identical `NAV_KEYS` tuple and `NAV_HREFS`
record (this phase added the same `"insights"` entry to both, in lockstep).
Any future nav change (add/remove/reorder a route) must be applied in two
places or the header and mobile panel silently drift.
**Fix:** Extract both constants into a shared module (e.g.
`src/components/chrome/nav-items.ts`) and import from both components.

### IN-02: `revalidateInsight` hook has no `afterDelete` — deleting an article leaves stale cached pages until the ISR window elapses

**File:** `src/hooks/revalidateInsights.ts:14-20`
**Issue:** Only `afterChange` is wired. Deleting a published Insights article
does not revalidate `/insights` or `/insights/<slug>` on demand, so the
deleted article's detail page and its card on the index keep serving from
cache for up to `revalidate = 60` seconds. This mirrors the identical
pre-existing gap in `revalidateCatalog.ts` for Products, so it's a consistent
(not novel) limitation, but worth tracking since delete is a real editorial
action.
**Fix:** Add an `afterDelete` hook (for both Insights and Products) that
calls the same `revalidateAllLocales` for index + detail paths.

### IN-03: `seed-insights.ts` has no try/catch/finally around the seed loop — a thrown error skips `payload.destroy()`

**File:** `scripts/seed-insights.ts:121-161`
**Issue:** If `payload.create` throws partway through the loop (e.g. a
unique-slug collision or a bad `filePath`), `payload.destroy()` on line 161
never runs, potentially leaving the DB/connection pool open in a CI/build
context. This mirrors the pre-existing `seed-products.ts` pattern the file's
own header comment says it deliberately mirrors, so it's not a new
regression, but it is still a real robustness gap in a script that runs as
part of `db:seed`/prod bootstrap.
**Fix:** Wrap the loop in `try { ... } finally { await payload.destroy(); }`.

### IN-04: `ar`/`fr`/`ru` insights.* strings are byte-identical English placeholders

**File:** `src/i18n/messages/ar.json`, `src/i18n/messages/fr.json`, `src/i18n/messages/ru.json` (insights block)
**Issue:** All four locale files have identical English copy for the new
`insights.*` keys (heading, empty state, byline, not-found). This is
explicitly called out and intentional per `05-04-SUMMARY.md` ("English
placeholders... per project English-first priority, real translations land
later") and matches the project's existing mixed nav-key precedent, so it is
not a defect — flagged here only for completeness/tracking since
"Translation quality: published non-English copy = professional human
translation" is a stated project constraint that these placeholders don't
yet meet.
**Fix:** No action needed until the translation phase; ensure these keys are
included in that pass's scope.

---

_Reviewed: 2026-07-23T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
