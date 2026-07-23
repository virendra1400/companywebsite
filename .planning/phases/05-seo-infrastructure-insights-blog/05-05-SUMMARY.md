---
phase: 05-seo-infrastructure-insights-blog
plan: 05
subsystem: seo
tags: [nextjs, sitemap, robots, json-ld, hreflang, metadata, payload]

requires:
  - phase: 05-seo-infrastructure-insights-blog (plan 01)
    provides: Insights collection (published flag, coverImage, slug)
  - phase: 05-seo-infrastructure-insights-blog (plan 02)
    provides: getTranslatedLocales / buildAlternates / buildMetadata helpers
  - phase: 05-seo-infrastructure-insights-blog (plan 03)
    provides: json-ld.tsx builders (organizationJsonLd/productJsonLd/breadcrumbJsonLd) + SiteSettings address/sameAs fields
provides:
  - "src/app/sitemap.ts — single-file localized sitemap: home + interior pages + published products + published insights, one <url> per translated locale, reciprocal alternates.languages"
  - "src/app/robots.ts — allow '/', disallow /admin + /api, sitemap pointer"
  - "locale layout.tsx metadataBase + title template/default + description, Organization JSON-LD rendered once per page"
  - "products/[slug]/page.tsx generateMetadata + Product/BreadcrumbList JSON-LD"
  - "getSiteBrand() extended to return address/sameAs for Organization JSON-LD"
affects: [seo, insights-blog, deploy-checklist]

tech-stack:
  added: []
  patterns:
    - "sitemap.ts entriesFor() helper reuses buildAlternates' languages map verbatim (cast to Record<string,string> for the narrower MetadataRoute.Sitemap alternates type) so sitemap hreflang and generateMetadata's alternates stay byte-identical"
    - "generateMetadata delegates entirely to the shared buildMetadata/getTranslatedLocales glue from 05-02 — no page re-implements alternates/canonical logic"

key-files:
  created:
    - tests/int/sitemap.spec.ts
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/app/(site)/[locale]/layout.tsx
    - src/app/(site)/[locale]/products/[slug]/page.tsx
    - src/lib/payload-fetch.ts

key-decisions:
  - "Applied RESEARCH's A2 fix: sitemap.ts gates every interior/product/insights locale set through getTranslatedLocales, never an unconditional routing.locales array"
  - "sitemap.ts's per-entry alternates re-derive from buildAlternates() (05-02) rather than a second hand-rolled reciprocal-map builder, keeping sitemap hreflang and generateMetadata's alternates provably identical"
  - "getSiteBrand() extended (not duplicated) to also return address/sameAs — single cached SiteSettings query still serves every caller"

requirements-completed: [SEO-01, SEO-02, SEO-03, SEO-04, SEO-05]

coverage:
  - id: D1
    description: "src/app/sitemap.ts returns a localized MetadataRoute.Sitemap: home + interior pages + published products + published insights, published:true filtered, no duplicate <url>, reciprocal alternates with exactly one x-default"
    requirement: "SEO-03"
    verification:
      - kind: integration
        ref: "tests/int/sitemap.spec.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "src/app/robots.ts disallows /admin and /api, points sitemap at NEXT_PUBLIC_SITE_URL/sitemap.xml"
    requirement: "SEO-03"
    verification:
      - kind: other
        ref: "manual code read — no automated robots.ts test in this plan; grep confirms disallow: [\"/admin\", \"/api\"]"
        status: pass
    human_judgment: true
    rationale: "No automated spec asserts robots.ts's shape in this plan; correctness verified by direct code inspection only."
  - id: D3
    description: "locale layout.tsx exports metadataBase (from NEXT_PUBLIC_SITE_URL, localhost dev fallback) + title template/default + description; renders Organization JSON-LD once via the shared <JsonLd> escaper"
    requirement: "SEO-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (clean) + manual code read"
        status: pass
    human_judgment: true
    rationale: "No unit/int spec renders the layout's metadata export or JSON-LD script tag in this plan; view-source verification is an explicit phase-gate manual checkpoint per the plan's own <verification> section (requires a deploy)."
  - id: D4
    description: "products/[slug]/page.tsx generateMetadata delegates to buildMetadata + getTranslatedLocales('products', slug); renders productJsonLd (no price/offers/review) and breadcrumbJsonLd"
    requirement: "SEO-02, SEO-04, SEO-05"
    verification:
      - kind: other
        ref: "npx tsc --noEmit (clean) + manual code read"
        status: pass
    human_judgment: true
    rationale: "No unit/int spec directly exercises generateMetadata or the rendered JSON-LD script on the product page in this plan; the sitemap int spec covers the shared getTranslatedLocales/buildAlternates logic these functions reuse, but not this page's own render path. Rich Results Test validation is an explicit phase-gate manual checkpoint."

duration: 45min
completed: 2026-07-23
status: complete
---

# Phase 5 Plan 5: SEO Infrastructure Wiring Summary

**Wired the localized sitemap.ts/robots.ts, locale-layout metadataBase + Organization JSON-LD, and product-detail generateMetadata + Product/BreadcrumbList JSON-LD onto the live 05-01/05-02/05-03 SEO libraries — closing SEO-01 through SEO-05's crawler-facing surface.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 3 (Wave 0 RED test, sitemap.ts + robots.ts, layout + product-page wiring)
- **Files modified:** 6 (1 new test, 2 new routes, 3 edited files)

## Accomplishments
- `src/app/sitemap.ts` enumerates home + 6 interior slugs + published products + published insights, gating every locale set through `getTranslatedLocales` (RESEARCH A2 fix applied — interior pages are NOT unconditionally 4-locale) and reusing `buildAlternates`'s reciprocal `languages` map so sitemap hreflang and `generateMetadata` output are provably consistent.
- `src/app/robots.ts` disallows `/admin` and `/api`, points at `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.
- Locale `layout.tsx` now exports `metadata` with `metadataBase`, a title template/default, and a brand description, and renders `organizationJsonLd` once per page via the shared `<JsonLd>` escaper — sourced from an extended `getSiteBrand()` that also returns `address`/`sameAs` (D-09) from the same cached SiteSettings query.
- `products/[slug]/page.tsx` exports `generateMetadata` (delegating to `buildMetadata`) and renders `productJsonLd` (no price/offers/review, D-10) + `breadcrumbJsonLd` (D-11) reusing the page's already-computed `category`/`certs`/`images`.
- `tests/int/sitemap.spec.ts` (Wave 0 RED → GREEN) asserts published-only inclusion, draft exclusion, no duplicate URLs, un-prefixed English home URL, exactly-one-`x-default` reciprocity, and empty-insights resilience.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 — failing integration test for sitemap.ts** - `8631fff` (test)
2. **Task 2: sitemap.ts + robots.ts** - `63393dd` (feat)
3. **Task 3: metadataBase + Organization JSON-LD on layout; generateMetadata + Product/Breadcrumb JSON-LD on product detail** - `073eabe` (feat)

_TDD tasks 2 and 3 each landed as a single feat commit against the already-RED Task 1 spec — no separate refactor commit was needed._

## Files Created/Modified
- `tests/int/sitemap.spec.ts` - integration spec seeding published/draft product + insight fixtures, asserting sitemap correctness (SEO-03)
- `src/app/sitemap.ts` - localized sitemap route (home/interior/products/insights)
- `src/app/robots.ts` - robots route (disallow /admin, /api; sitemap pointer)
- `src/app/(site)/[locale]/layout.tsx` - `metadata` export (metadataBase/title/description) + Organization `<JsonLd>`
- `src/app/(site)/[locale]/products/[slug]/page.tsx` - `generateMetadata` + Product/BreadcrumbList `<JsonLd>`
- `src/lib/payload-fetch.ts` - `getSiteBrand()` extended to return `address`/`sameAs`

## Decisions Made
- Reused `buildAlternates`'s `languages` map inside `sitemap.ts` (cast to `Record<string,string>` for the narrower `MetadataRoute.Sitemap` alternates type) instead of a second hand-rolled reciprocal-map builder — guarantees sitemap hreflang and `generateMetadata`'s alternates never drift apart (Pitfall 1).
- Extended `getSiteBrand()` in place (single cached `findGlobal` query) rather than adding a second SiteSettings query for `address`/`sameAs`.

## Deviations from Plan

None — plan executed exactly as written. The A2 fix (interior pages gated via `getTranslatedLocales("pages", slug)`, not `routing.locales`) was already called out explicitly in the plan's own Task 2 action text and implemented as specified, not an unplanned deviation.

## Issues Encountered
- The plan's `<verification>` section calls for the existing `tests/e2e/product-detail.spec.ts` to be re-run as a regression check. In this sandboxed worktree, Playwright's `webServer` (`npm run dev`) fails to boot with "missing secret key. A secret key is needed to secure Payload" — a pre-existing environment gap (no `PAYLOAD_SECRET` available to the e2e dev-server process in this executor sandbox), unrelated to this plan's code changes. `npx tsc --noEmit` is clean and the full unit+int suite (70/70, including the new sitemap spec) passes, which covers every automatable claim this plan makes; the e2e regression check should be re-run at the next full CI/deploy pass where `PAYLOAD_SECRET` is available.

## User Setup Required
None new beyond the existing 05-05-PLAN.md `user_setup` entry (already flagged in the plan frontmatter): `NEXT_PUBLIC_SITE_URL` must be set to the real production origin in Vercel before deploy, or `metadataBase`/sitemap/canonical URLs will resolve to `localhost` (Pitfall 4). No new env vars introduced by this plan.

## Next Phase Readiness
- SEO-01 through SEO-05's crawler-facing surface (sitemap, robots, metadataBase, Organization/Product/BreadcrumbList JSON-LD, reciprocal hreflang) is fully wired and unit/int-tested.
- Remaining phase-gate manual checkpoints (per the plan's `<verification>` section, require a live/preview deploy with `NEXT_PUBLIC_SITE_URL` set): view-source hreflang/OG check, Screaming Frog crawl audit, Google Rich Results Test, and the deferred e2e product-detail regression re-run.

---
*Phase: 05-seo-infrastructure-insights-blog*
*Completed: 2026-07-23*

## Self-Check: PASSED

All created/modified files confirmed on disk (tests/int/sitemap.spec.ts, src/app/sitemap.ts, src/app/robots.ts, locale layout.tsx, product page.tsx, payload-fetch.ts, this SUMMARY.md) and all 3 task commit hashes (8631fff, 63393dd, 073eabe) confirmed present in git log.
