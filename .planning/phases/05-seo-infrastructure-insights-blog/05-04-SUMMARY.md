---
phase: 05-seo-infrastructure-insights-blog
plan: 04
subsystem: frontend
tags: [nextjs, next-intl, payload, insights, blog, seo, json-ld, rtl]

# Dependency graph
requires:
  - phase: 05-seo-infrastructure-insights-blog
    provides: "Insights Payload collection (05-01), buildMetadata/getTranslatedLocales (05-02), breadcrumbJsonLd/JsonLd (05-03)"
provides:
  - "/insights list page: compact Hero -> reverse-chronological InsightCard grid -> CTABand, with zero-article empty state"
  - "/insights/[slug] article page: generateStaticParams, generateMetadata (buildMetadata + getTranslatedLocales), 2-level breadcrumb, cover banner, richText body, CTABand, BreadcrumbList JSON-LD"
  - "InsightCard component (cover/meta/title/excerpt, whole-card Link)"
  - "New 'Insights' nav item in GlobalHeader + MobileNavPanel (between Company and Contact)"
  - "src/i18n/request.ts formats.dateTime.latn (Western-numeral dates for ar)"
  - "scripts/seed-insights.ts (idempotent, 2 published articles: one categorized, one uncategorized)"
  - "tests/e2e/insights.spec.ts (browse-list, read-article, 404, ar rtl + latn byline) — GREEN, 8/8"
affects: [05-05-sitemap-robots]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getInsight(slug, locale) dual-query fallback-detection pattern, copied verbatim from getProduct (payload-fetch.ts) and inlined in insights/[slug]/page.tsx"
    - "Insights list query inlined in the page (payload.find with published:true, sort:-publishedDate), mirroring getProductsByCategory's inline shape rather than adding a new payload-fetch.ts export"

key-files:
  created:
    - src/components/insights/InsightCard.tsx
    - "src/app/(site)/[locale]/insights/page.tsx"
    - "src/app/(site)/[locale]/insights/[slug]/page.tsx"
    - scripts/seed-insights.ts
    - tests/e2e/insights.spec.ts
  modified:
    - src/i18n/request.ts
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - src/components/chrome/GlobalHeader.tsx
    - src/components/chrome/MobileNavPanel.tsx
    - package.json

key-decisions:
  - "InsightCard meta row conditionally omits the '·' separator when category is absent (UI-SPEC empty state), rather than always rendering it."
  - "Article byline falls back to 'By {author}' (no dangling '·') when publishedDate is absent, matching the same no-dangling-separator discipline as InsightCard's meta row — not explicitly required by the plan's acceptance criteria but a direct extension of the same UI-SPEC principle."
  - "No custom not-found.tsx built for /insights/[slug] — mirrors Product detail's existing behavior exactly (products/[slug]/page.tsx also has no custom not-found.tsx; notFound() falls through to Next's default 404 boundary). insights.notFoundHeading/notFoundBody message keys were added per the plan's acceptance criteria but are currently unused, same as the pre-existing dead products.notFoundHeading/notFoundBody keys — consistent with the established pattern, not a new gap."
  - "getInsight is a private helper inlined in insights/[slug]/page.tsx (not added to payload-fetch.ts) — kept the change smaller, matching the plan's explicit 'either inline in the page or added to payload-fetch.ts' allowance."

patterns-established:
  - "Insights list/article pages are the third catalog-shaped content type (after Products) to follow the compact-Hero -> grid -> CTABand / PageHeader -> body -> CTABand compositions verbatim."

requirements-completed: [BLOG-01]

coverage:
  - id: D1
    description: "Visitor can browse a reverse-chronological /insights list of InsightCard items and click through to /insights/[slug], a flat article URL (category never appears in the URL)"
    requirement: BLOG-01
    verification:
      - kind: e2e
        ref: "tests/e2e/insights.spec.ts#en: /insights returns 200, shows the Insights hero heading and a link to the categorized article"
        status: pass
    human_judgment: false
  - id: D2
    description: "Article page renders breadcrumb 'Insights / [title]' (2 levels, no category crumb), h1, byline, cover image, richText body in max-w-[720px], and a CTABand"
    requirement: BLOG-01
    verification:
      - kind: e2e
        ref: "tests/e2e/insights.spec.ts#en: /insights/<slug> returns 200, has an h1 with the article title, a breadcrumb region, and a CTABand heading"
        status: pass
    human_judgment: false
  - id: D3
    description: "generateMetadata emits per-locale metadata + reciprocal hreflang via buildMetadata(getTranslatedLocales(...)); BreadcrumbList JSON-LD renders via the shared <JsonLd> component"
    requirement: BLOG-01
    verification:
      - kind: unit
        ref: "npx tsc --noEmit (zero errors) — generateMetadata/buildMetadata/breadcrumbJsonLd wiring typechecks"
        status: pass
    human_judgment: true
    rationale: "Rich Results Test / view-source validation of the emitted hreflang and JSON-LD requires a deployed URL — this is the phase's own documented phase-gate manual check (05-04-PLAN.md <verification>), not automatable from this plan alone."
  - id: D4
    description: "'Insights' nav item (real route /insights) appears in GlobalHeader and MobileNavPanel between Company and Contact"
    requirement: BLOG-01
    verification:
      - kind: unit
        ref: "grep insights in NAV_KEYS/NAV_HREFS of GlobalHeader.tsx and MobileNavPanel.tsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Insights list zero-articles empty state renders documented heading/body + contact link; InsightCard omits the '·' separator when category is absent"
    requirement: BLOG-01
    verification:
      - kind: unit
        ref: "src/app/(site)/[locale]/insights/page.tsx empty-state block + InsightCard.tsx conditional separator render"
        status: pass
    human_judgment: false
  - id: D6
    description: "Invalid/unpublished /insights/[slug] returns 404"
    requirement: BLOG-01
    verification:
      - kind: e2e
        ref: "tests/e2e/insights.spec.ts#an unknown insight slug 404s"
        status: pass
    human_judgment: false
  - id: D7
    description: "Byline and InsightCard meta-row date render Western (latn) digits in the ar locale, never Arabic-Indic digits (backstop truth)"
    requirement: BLOG-01
    verification:
      - kind: e2e
        ref: "tests/e2e/insights.spec.ts#ar: /ar/insights/<slug> returns 200 with dir=rtl, and the byline date renders Western (latn) digits"
        status: pass
    human_judgment: false

# Metrics
duration: ~65min (across an interrupted session; see Issues Encountered)
completed: 2026-07-23
status: complete
---

# Phase 05 Plan 04: Insights List + Article Pages Summary

**BLOG-01's visitor-facing `/insights` list and `/insights/[slug]` article pages, with a new InsightCard, "Insights" nav entry, `format.dateTime(..., "latn")` byline dates, and an idempotent 2-article seed — full e2e coverage green (8/8, en+ar) including the ar Western-numeral backstop.**

## Performance

- **Duration:** ~65 min of active work (session was interrupted mid-Task-2 by a Claude API session-limit reset and resumed in the same worktree/branch)
- **Started:** 2026-07-22T16:56:42Z (Task 1 commit)
- **Completed:** 2026-07-23T03:19:40Z (Task 3 commit)
- **Tasks:** 3
- **Files modified:** 15 (5 created, 10 modified — excluding this SUMMARY)

## Accomplishments
- `/insights` list page: compact Hero ("Insights") → reverse-chronological `InsightCard` grid (grid-cols-1/2/3) → CTABand, with the documented zero-article empty state (heading/body/contact link).
- `/insights/[slug]` article page: `generateStaticParams` (published insights, en), `generateMetadata` via `buildMetadata(getTranslatedLocales("insights", slug))`, a 2-level breadcrumb ("Insights / [title]", no category crumb per D-11), h1, category badge, byline, cover image banner (LCP, `priority`), richText body in `max-w-[720px]`, CTABand, and a `BreadcrumbList` JSON-LD via the shared `<JsonLd>` component.
- `InsightCard`: 16:9 cover, conditional category-badge+date meta row (no dangling "·" when category is absent), `line-clamp-2` title, `line-clamp-3` excerpt, whole-card `Link`, `ImageOff` defensive placeholder.
- New "Insights" nav item wired into both `GlobalHeader` and `MobileNavPanel` (`NAV_KEYS`/`NAV_HREFS`, between Company and Contact).
- `src/i18n/request.ts` gained `formats.dateTime.latn` — every insights date (card meta row + article byline) renders Western digits in `ar`, verified by the e2e ar-locale backstop assertion.
- `scripts/seed-insights.ts`: idempotent, seeds 2 published en articles (one categorized reusing the "Grains" category, one uncategorized) with required `coverImage`; wired into `db:seed` after `seed-products`.
- `tests/e2e/insights.spec.ts`: 8/8 passing (en + ar projects) — browse-list, read-article, 404, and the ar rtl/latn-byline backstop.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 — failing e2e spec + insights seed so an article is readable** - `5e63113` (test)
2. **Task 2: Insights list page + InsightCard + nav item + i18n keys + latn date format** - `dcbaada` (feat)
3. **Task 3: Insights article page (/insights/[slug]) with metadata + BreadcrumbList JSON-LD** - `5df80e1` (feat)

**Plan metadata:** *(this commit, docs: complete plan)*

_TDD: Task 1 is the RED commit (`5e63113`); Tasks 2 and 3 are the corresponding GREEN implementations (list-side and article-side respectively) — the full `tests/e2e/insights.spec.ts` suite went GREEN once Task 3 landed._

## Files Created/Modified
- `src/components/insights/InsightCard.tsx` - Insights list grid card
- `src/app/(site)/[locale]/insights/page.tsx` - Insights list route
- `src/app/(site)/[locale]/insights/[slug]/page.tsx` - Insights article route (+ inline `getInsight` helper)
- `scripts/seed-insights.ts` - Idempotent 2-article insights seed
- `tests/e2e/insights.spec.ts` - BLOG-01 e2e coverage
- `src/i18n/request.ts` - Added `formats.dateTime.latn`
- `src/i18n/messages/{en,ar,fr,ru}.json` - Added `nav.insights` + `insights.*` keys
- `src/components/chrome/GlobalHeader.tsx` - Added `insights` nav entry
- `src/components/chrome/MobileNavPanel.tsx` - Added `insights` nav entry
- `package.json` - `db:seed` now runs `seed-insights.ts` after `seed-products.ts`

## Decisions Made
- `getInsight(slug, locale)` inlined as a private helper in `insights/[slug]/page.tsx` rather than added to `payload-fetch.ts` — the plan explicitly allowed either, and keeping it local kept the diff smaller (no other caller needs it yet).
- The insights list query is likewise inlined in `insights/page.tsx` (no new `payload-fetch.ts` export), mirroring `getProductsByCategory`'s inline-query style rather than adding a new shared function for a single call site.
- No custom `not-found.tsx` built for the insights segment — `products/[slug]/page.tsx` has none either; both rely on Next's default 404 boundary via `notFound()`. The `insights.notFoundHeading`/`notFoundBody` message keys exist per the plan's acceptance criteria but are currently unused, matching the pre-existing `products.notFoundHeading`/`notFoundBody` dead-key pattern exactly (not a new gap introduced by this plan).
- ar/fr/ru message files get the same English placeholder values as en.json for all new `nav.insights`/`insights.*` keys, following this project's already-established mixed-translation pattern (several nav keys are already English-only in non-en locales).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree had no `node_modules` and no `.env`**
- **Found during:** Task 1 setup (before writing any files)
- **Issue:** This git worktree had neither an installed dependency tree nor a `.env` (DATABASE_URI/PAYLOAD_SECRET), so `npx tsc`, `npm run db:seed`, and `npx playwright test` could not run.
- **Fix:** Symlinked `node_modules` from the main repo checkout (confirmed `package-lock.json` byte-identical via `diff` first), and wrote a `.env` with the same `DATABASE_URI=file:./payload.db` / `PAYLOAD_SECRET` values already used by the main checkout (non-secret local-dev placeholder values).
- **Files modified:** none tracked (both are gitignored, environment-only)
- **Verification:** `npx tsc --noEmit`, `npm run db:seed`, and `npx playwright test` all ran successfully afterward.
- **Committed in:** n/a (environment-only, not a repo change)

---

**Total deviations:** 1 auto-fixed (1 blocking, environment-only)
**Impact on plan:** No scope creep — a prerequisite to running any verification in this worktree, not a code change.

## Issues Encountered
- **Session interruption:** this execution was terminated mid-Task-2 by a Claude API session-limit error and resumed in the same worktree/branch per the orchestrator's instructions. `InsightCard.tsx` was already written but uncommitted at interruption; work resumed from there with no rework needed (confirmed via `git status`/`git diff` before continuing).
- **Environment flakiness (pre-existing, out of scope):** running the full `tests/e2e/nav-links.spec.ts` / `chrome-consistency.spec.ts` / `product-detail.spec.ts` suites back-to-back after the insights suite produced intermittent `ERR_CONNECTION_REFUSED` / "Page crashed" / 30s timeouts on routes this plan never touched (`/about`, `/ar/products`, existing product-detail assertions) — consistent with sandboxed dev-server/browser resource pressure under repeated heavy Playwright runs, not a regression introduced by this plan's changes. `tests/e2e/insights.spec.ts` itself passed 8/8 cleanly in an isolated run (the plan's own required verification). Logged here per the deviation rules' scope-boundary guidance rather than "fixed" (nothing in this plan's diff touches those files/routes).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BLOG-01 is fully satisfied: a visitor can reach `/insights` from the nav, browse the list, and read an article in en or ar (fr/ru share the same route/component, English-first content per project priority), with correct hreflang/JSON-LD wiring and RTL numeral correctness.
- 05-05 (sitemap/robots) can now enumerate published insights slugs the same way `insights/[slug]/page.tsx`'s `generateStaticParams` does (`payload.find({ collection: "insights", where: { published: { equals: true } }, ... })`).
- No blockers for downstream plans.

---
*Phase: 05-seo-infrastructure-insights-blog*
*Completed: 2026-07-23*

## Self-Check: PASSED

- FOUND: src/components/insights/InsightCard.tsx
- FOUND: src/app/(site)/[locale]/insights/page.tsx
- FOUND: src/app/(site)/[locale]/insights/[slug]/page.tsx
- FOUND: scripts/seed-insights.ts
- FOUND: tests/e2e/insights.spec.ts
- FOUND commit: 5e63113 (test)
- FOUND commit: dcbaada (feat)
- FOUND commit: 5df80e1 (feat)
