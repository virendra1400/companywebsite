---
phase: 05-seo-infrastructure-insights-blog
verified: 2026-07-23T04:50:00Z
status: gaps_found
score: 3/5 roadmap success criteria verified (2 partial/failed); 6/7 requirement IDs functionally satisfied
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "An XML sitemap covering all locales and published pages is reachable and free of duplicate/conflicting canonical URLs (SC3/SEO-03)."
    status: partial
    reason: "Sitemap is reachable, published-filtered (drafts correctly excluded, confirmed live), and has no duplicate <url> entries — but it never emits the /insights or /products index/hub pages as entries at all (WR-02, confirmed live via curl on http://localhost:3000/sitemap.xml). Both are real, unique, crawlable pages this phase adds/exposes; their absence is a genuine sitemap coverage gap, not a deferred nice-to-have."
    artifacts:
      - path: "src/app/sitemap.ts"
        issue: "INTERIOR_SLUGS + product/insight detail enumeration never adds entries for /insights or /products themselves"
    missing:
      - "entriesFor(\"/insights\", ...) and entriesFor(\"/products\", ...) (or an ungated locale-invariant push) added to sitemap()"
  - truth: "Organization, Product, and BreadcrumbList structured data validate on relevant pages via a rich-results test (SC4/SEO-04)."
    status: partial
    reason: "All three JSON-LD types are emitted with correct shapes (confirmed live: Organization once per page, Product omits price/offers/review per D-10, BreadcrumbList present on product + insights article pages) and are unit-tested for XSS-escaping. However, on product-detail pages with a category, the BreadcrumbList emits two adjacent ListItem entries (\"Products\" and the category name) that share the IDENTICAL item URL (/products) — confirmed live via curl against /products/ground-turmeric. A BreadcrumbList with two distinct named items pointing at one URL is invalid/low-quality structured data that Google's Rich Results validator can flag (WR-01). This was found in code review and not auto-fixed."
    artifacts:
      - path: "src/app/(site)/[locale]/products/[slug]/page.tsx"
        issue: "breadcrumbTrail includes a category entry whose url is identical to the Products root entry's url (no real category archive page exists to link to)"
    missing:
      - "Either omit the category breadcrumb entry entirely, or omit its url field, so no two ListItem entries share a URL"
  - truth: "An invalid/unpublished /insights/[slug] returns 404 with the documented not-found copy (05-04-PLAN must-have, UI-SPEC error)."
    status: failed
    reason: "Confirmed live: GET /insights/does-not-exist returns 404 but renders Next's generic 404 boundary (page <title> is the site default, no custom heading) — not the documented insights.notFoundHeading/notFoundBody copy. The message keys exist in en/ar/fr/ru.json but are never read by any component (WR-03, dead code). The e2e spec only asserts res.status()===404, so nothing catches this gap. Not a novel regression (products/[slug] has the identical pre-existing gap), but it is an unmet, stated acceptance criterion in 05-04-PLAN.md."
    artifacts:
      - path: "src/app/(site)/[locale]/insights/[slug]/page.tsx"
        issue: "notFound() falls through to Next's default boundary; insights.notFoundHeading/notFoundBody are never rendered"
    missing:
      - "src/app/(site)/[locale]/insights/not-found.tsx rendering t(\"notFoundHeading\")/t(\"notFoundBody\") with a link back to /insights"
human_verification:
  - test: "Google Rich Results Test against a deployed/preview URL with NEXT_PUBLIC_SITE_URL set, for home (Organization), a product detail page (Product + BreadcrumbList), and an insights article (BreadcrumbList)."
    expected: "All three types validate with no errors once the WR-01 duplicate-breadcrumb-URL gap above is fixed."
    why_human: "Requires a live/preview deployment; this is the phase's own documented phase-gate manual checkpoint (05-03/05-05 <verification> sections), not automatable from the repo alone."
  - test: "Screaming Frog (or equivalent) crawl audit of a deployed preview confirming zero hreflang/canonical conflicts across ar/fr/ru once real (non-English) translations are published."
    expected: "No conflicting hreflang/canonical pairs reported."
    why_human: "Only English content exists in the current dataset (by design, per project's English-first priority); the multi-locale reciprocal case is unit-tested with synthetic data (buildAlternates ar/en case) but a real crawl against live ar/fr/ru content is a deploy-gated, content-dependent check the plans explicitly defer."
---

# Phase 05: SEO Infrastructure & Insights/Blog Verification Report

**Phase Goal:** Every page is discoverable and correctly indexed per locale, and an insights/blog section exists for authority-building SEO content.
**Verified:** 2026-07-23T04:50:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every page emits correct per-locale metadata (title, description, OG), verifiable via view-source. | ✓ VERIFIED | Live curl on `/products/ground-turmeric` and `/insights/export-compliance-guide-2026` shows correct `<title>`, `<meta name="description">`, `og:title/description/image`; `layout.tsx` sets `metadataBase` from `NEXT_PUBLIC_SITE_URL` (falls back to localhost dev-only), cascading to every descendant `generateMetadata`. |
| 2 | Every localized page emits reciprocal hreflang tags plus exactly one x-default, generated from actual published-translation status, zero conflicts against canonical. | ✓ VERIFIED | Live curl confirms `<link rel="canonical">` + `hrefLang="x-default"` + `hrefLang="en"` self-referencing set (no phantom ar/fr/ru — correct, since no real translations exist yet). `getTranslatedLocales`/`buildAlternates` unit-tested for the multi-locale reciprocal + single-x-default case (`tests/unit/seo-alternates.spec.ts`, 14/14 passing incl. seo-metadata/seo-json-ld). Sitemap reuses the identical `buildAlternates` map (verified: sitemap.xml entries carry the same hreflang shape). |
| 3 | An XML sitemap covering all locales and published pages is reachable and free of duplicate/conflicting canonical URLs. | ✗ FAILED (partial) | Sitemap reachable at `/sitemap.xml`, no duplicate `<url>` entries, draft product (`draft-sesame-seeds`) and draft insight correctly excluded (confirmed live). **But** `/insights` and `/products` index/hub pages are never emitted as sitemap entries at all (WR-02, confirmed by inspecting the live sitemap.xml output — only home + 6 interior slugs + individual product/insight detail pages appear). |
| 4 | Organization, Product, and BreadcrumbList structured data validate on relevant pages via a rich-results test. | ✗ FAILED (partial) | All three JSON-LD types emit with correct D-09/D-10/D-11 shapes (confirmed live: Organization once per page; Product omits price/offers/availability/review/rating; BreadcrumbList present with 1-indexed ListItem). **But** the product-detail BreadcrumbList emits two adjacent ListItem entries ("Products" and the category name) sharing the IDENTICAL `item` URL (`/products`) — confirmed live via curl (WR-01). This is invalid/low-quality breadcrumb structure per Google's guidelines. Live Rich Results Test itself requires a deployed URL (human-verification item below). |
| 5 | Visitor can browse a blog/insights list and read an article, and staff can publish a new article per locale via the CMS. | ✓ VERIFIED | `tests/e2e/insights.spec.ts` — 7/8 green in this run (1 timeout was cold-Next.js-compile flakiness, re-ran in isolation and passed 1/1; matches the pattern the 05-04-SUMMARY itself documents as pre-existing sandbox flakiness, not a regression). Live curl confirms `/insights` list, an article page, and a 404 on unknown slug. CMS side: `Insights` collection registered in `payload.config.ts`, localized `title/excerpt/author/body`, admin-gated write (`Boolean(user)`), `revalidateInsight` fires per-locale `revalidatePath` on publish (`tests/int/insights-revalidate-hook.spec.ts`, `tests/int/insights-fallback.spec.ts` — both green). |

**Score:** 3/5 roadmap success criteria verified; 2 partial/failed on real, previously-flagged code defects (not deferred, not resolved).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/collections/Insights.ts` | Insights Payload collection, public read scoped to published, admin-gated write | ✓ VERIFIED | CR-01 fix confirmed live in code: `read: ({ req: { user } }) => (user ? true : { published: { equals: true } })` — matches the documented fix exactly, commit `cf8735a`. |
| `src/hooks/revalidateInsights.ts` | Per-locale revalidate hook | ✓ VERIFIED | `tests/int/insights-revalidate-hook.spec.ts` green (8-path + disableRevalidate skip assertions). |
| `src/lib/seo/translated-locales.ts`, `alternates.ts`, `metadata.ts` | Pure SEO builder library | ✓ VERIFIED | 14/14 unit tests green (`seo-alternates`, `seo-metadata`, `seo-json-ld`); wired into sitemap.ts and both generateMetadata call sites. |
| `src/lib/seo/json-ld.tsx` | JsonLd + organizationJsonLd/productJsonLd/breadcrumbJsonLd | ✓ VERIFIED (with WR-01 defect) | Escaping unit-tested; builders emit correct shapes; consuming call site (product page) has a duplicate-URL breadcrumb-trail bug (not a builder bug — the builder faithfully renders what it's given). |
| `src/app/sitemap.ts` | Localized sitemap: home + interior + products + insights | ⚠️ PARTIAL | `tests/int/sitemap.spec.ts` green (11/11 combined int suite); live output missing `/insights` and `/products` hub entries (WR-02). |
| `src/app/robots.ts` | Disallow /admin + /api, sitemap pointer | ✓ VERIFIED | Live curl confirms `Disallow: /admin`, `Disallow: /api`, `Sitemap: .../sitemap.xml`. |
| `src/app/(site)/[locale]/layout.tsx` | metadataBase + Organization JSON-LD | ✓ VERIFIED | Live curl confirms metadataBase-resolved absolute URLs and exactly one Organization script per page. |
| `src/app/(site)/[locale]/products/[slug]/page.tsx` | generateMetadata + Product/BreadcrumbList JSON-LD | ⚠️ PARTIAL | Metadata/hreflang correct; BreadcrumbList has the WR-01 duplicate-URL defect. |
| `src/components/insights/InsightCard.tsx`, `insights/page.tsx`, `insights/[slug]/page.tsx` | Visitor-facing Insights UI | ✓ VERIFIED | e2e-covered, confirmed live (list, article, 404, ar rtl + latn byline). |
| `scripts/seed-insights.ts` | Idempotent 2-article seed | ✓ VERIFIED | Ran live during this verification; correctly skip-by-slug on re-run; seeded the 2 documented articles. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/collections/Insights.ts` | `src/hooks/revalidateInsights.ts` | `hooks.afterChange: [revalidateInsight]` | ✓ WIRED | Confirmed in source; int test proves it fires. |
| `src/payload.config.ts` | `src/collections/Insights.ts` | import + collections array | ✓ WIRED | `grep "Insights"` matches import (line 16) and array (line 66). |
| `src/lib/seo/metadata.ts` | `src/lib/seo/alternates.ts` | `buildMetadata` calls `buildAlternates` | ✓ WIRED | Unit test confirms delegation. |
| `src/app/sitemap.ts` | `src/lib/seo/translated-locales.ts` + `alternates.ts` | `getTranslatedLocales` + `localeUrl`/`buildAlternates` reuse | ✓ WIRED | Confirmed in source and live sitemap output (identical reciprocal map shape to generateMetadata). |
| `products/[slug]/page.tsx` | `src/lib/seo/json-ld.tsx` | `productJsonLd`/`breadcrumbJsonLd` via `<JsonLd>` | ✓ WIRED (output has a data defect, WR-01) | Confirmed live; renders but with duplicate breadcrumb URL. |
| `insights/[slug]/page.tsx` | `src/lib/seo/metadata.ts` + `json-ld.tsx` | `generateMetadata`/`breadcrumbJsonLd` | ✓ WIRED | Confirmed live: correct metadata + 2-level breadcrumb, no category crumb. |
| `GlobalHeader.tsx`/`MobileNavPanel.tsx` | `/insights` | `NAV_KEYS`/`NAV_HREFS.insights` | ✓ WIRED | grep confirms both files; e2e confirms the nav-driven route resolves. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `sitemap.ts` | `products`/`articles` docs | live `payload.find({ published: true })` against Postgres/SQLite | Yes — draft `draft-sesame-seeds` correctly excluded from live output | ✓ FLOWING |
| `insights/page.tsx` | list query | inline `payload.find` published-filtered, sorted `-publishedDate` | Yes — real seeded articles render | ✓ FLOWING |
| `products/[slug]/page.tsx` | `productJsonLd`/`breadcrumbJsonLd` inputs | already-fetched `product`/`category`/`certs`/`images` | Yes | ✓ FLOWING (with the WR-01 shape defect noted above) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unit suite (alternates/metadata/json-ld) | `npx vitest run --project=unit tests/unit/seo-*.spec.ts*` | 3 files, 14/14 passed | ✓ PASS |
| Integration suite (insights fallback/revalidate, sitemap) | `npx vitest run --project=int tests/int/insights-*.spec.ts tests/int/sitemap.spec.ts` | 3 files, 11/11 passed | ✓ PASS |
| Typecheck | `npx tsc --noEmit` | Clean, zero errors | ✓ PASS |
| e2e Insights (en+ar) | `npx playwright test tests/e2e/insights.spec.ts --project=en --project=ar` | 7/8 passed first run (1 cold-compile timeout); re-ran the failing test alone → 1/1 passed | ✓ PASS (flaky infra, not a code defect) |
| Live sitemap.xml | `curl http://localhost:3000/sitemap.xml` | 13 URL entries, no dupes, drafts excluded, `/insights` and `/products` hub pages absent | ⚠️ CONFIRMS WR-02 |
| Live robots.txt | `curl http://localhost:3000/robots.txt` | Disallows `/admin`, `/api`; sitemap pointer correct | ✓ PASS |
| Live product-page JSON-LD | `curl http://localhost:3000/products/ground-turmeric` | Organization/Product/BreadcrumbList present; BreadcrumbList has duplicate URL for "Products"/"Spices" | ⚠️ CONFIRMS WR-01 |
| Live insights 404 | `curl http://localhost:3000/insights/does-not-exist` | HTTP 404, generic Next boundary (no custom heading) | ⚠️ CONFIRMS WR-03 |

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes declared or found for this phase — SKIPPED (no runnable probe entry points beyond the vitest/playwright suites already exercised above).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| SEO-01 | 05-02, 05-05 | Every page emits correct per-locale metadata | ✓ SATISFIED | Live curl + unit tests. |
| SEO-02 | 05-02, 05-05 | Reciprocal hreflang + x-default, CMS-generated | ✓ SATISFIED | Live curl + unit tests; gated via `getTranslatedLocales`, never a hardcoded locale array. |
| SEO-03 | 05-05 | XML sitemap(s) including all locales/pages | ✗ BLOCKED (partial) | WR-02 — `/insights`/`/products` hub pages missing from sitemap. |
| SEO-04 | 05-03, 05-05 | Organization/Product/BreadcrumbList structured data | ✗ BLOCKED (partial) | WR-01 — duplicate breadcrumb URL on product pages. |
| SEO-05 | 05-02, 05-05 | Clean canonical URLs, no conflicts | ✓ SATISFIED | English canonical un-prefixed, self-referencing hreflang, no conflicts observed. |
| BLOG-01 | 05-04 | Visitor browses list + reads article | ✓ SATISFIED | e2e green + live curl. |
| BLOG-02 | 05-01 | Staff publish articles per locale via CMS | ✓ SATISFIED (code evidence) | Collection/hooks/fallback-detection all pass their integration tests; localized fields cascade correctly (`insights-fallback.spec.ts`). **Documentation-sync note:** `.planning/REQUIREMENTS.md` still shows `BLOG-02` as an unchecked `[ ]` item and "Pending" in its Traceability table, even though 05-01-PLAN.md declares it, 05-01-SUMMARY.md marks `status: complete` / `requirements-completed: [BLOG-02]` with all 4 coverage items passing, and the code/tests independently confirm the capability exists. This looks like a stale checkbox, not a code gap — flagged for whoever runs the next docs-sync pass, not treated as a blocking finding here. |

**Coverage check:** All 7 requirement IDs declared across the phase's 5 PLAN.md frontmatters (SEO-01/02/05 in 05-02; SEO-04 in 05-03; BLOG-02 in 05-01; BLOG-01 in 05-04; SEO-01/02/03/04/05 again in 05-05) are accounted for. No orphaned requirement IDs found — REQUIREMENTS.md's Phase 5 traceability rows match the union of PLAN-declared IDs exactly (modulo the BLOG-02 checkbox staleness noted above).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `src/app/(site)/[locale]/products/[slug]/page.tsx` | 103-106 | `breadcrumbTrail` category entry reuses the "Products" root URL | 🛑 Blocker (SC4/SEO-04) | Duplicate-URL BreadcrumbList is invalid/low-quality structured data (WR-01, confirmed live). |
| `src/app/sitemap.ts` | 43-77 | No entries for `/insights`/`/products` hub pages | 🛑 Blocker (SC3/SEO-03) | Two real, unique, crawlable pages are undiscoverable via the sitemap signal (WR-02, confirmed live). |
| `src/app/(site)/[locale]/insights/[slug]/page.tsx` | 112 | `notFound()` with no `not-found.tsx`; dead `insights.notFoundHeading/notFoundBody` keys | ⚠️ Warning | Unmet 05-04-PLAN acceptance criterion (WR-03, confirmed live: generic 404 renders). Mirrors a pre-existing identical gap on `products/[slug]`, so not a novel regression, but still unresolved. |
| `src/components/chrome/GlobalHeader.tsx` / `MobileNavPanel.tsx` | — | `NAV_KEYS`/`NAV_HREFS` duplicated verbatim (IN-01, review-only) | ℹ️ Info | Maintenance risk, not a goal blocker. |
| `src/hooks/revalidateInsights.ts` | — | No `afterDelete` hook (IN-02, review-only) | ℹ️ Info | Stale cache up to 60s after delete; mirrors pre-existing Products gap. |
| `scripts/seed-insights.ts` | 121-161 | No try/finally around `payload.destroy()` (IN-03, review-only) | ℹ️ Info | Robustness gap on thrown errors mid-seed. |
| `src/i18n/messages/{ar,fr,ru}.json` | insights.* block | English placeholder copy (IN-04, review-only) | ℹ️ Info | Explicitly intentional per project's English-first priority; not a defect. |

No `TBD`/`FIXME`/`XXX` debt markers found in any file this phase modified.

### Human Verification Required

1. **Google Rich Results Test** — Test: run against a deployed/preview URL (home, a product detail page, an insights article) with `NEXT_PUBLIC_SITE_URL` set. Expected: Organization/Product/BreadcrumbList all validate cleanly once WR-01 is fixed. Why human: requires a live deployment; explicitly the phase's own documented phase-gate checkpoint.
2. **Screaming Frog crawl audit** — Test: crawl a deployed preview once real ar/fr/ru translations exist. Expected: zero hreflang/canonical conflicts. Why human: content-dependent (only English content exists today) and deploy-gated; the reciprocal-hreflang logic itself is already unit-proven with synthetic multi-locale data.

### Gaps Summary

Two of the five roadmap success criteria (SC3/sitemap coverage, SC4/structured-data validity) have real, previously-identified-but-unfixed code defects: the sitemap never lists the `/insights` or `/products` hub pages (WR-02), and the product-detail BreadcrumbList emits two ListItems sharing one URL (WR-01). A third, PLAN-level (not roadmap-level) acceptance criterion — documented 404 copy for `/insights/[slug]` — is also unmet (WR-03), mirroring a pre-existing identical gap on the product pages. All three were surfaced by the phase's own code review (`05-REVIEW.md`) as Warnings and explicitly NOT auto-fixed, and this verification independently confirms all three live against the running application (curl evidence above). The one Critical finding (CR-01, draft-article REST/GraphQL exposure) has been fixed, committed (`cf8735a`), and is confirmed correct in source and re-passing integration tests. BLOG-02 is functionally satisfied by the code/tests but its `REQUIREMENTS.md` checkbox and traceability row were never flipped to reflect that — a documentation-sync note, not a code gap.

---

_Verified: 2026-07-23T04:50:00Z_
_Verifier: Claude (gsd-verifier)_
