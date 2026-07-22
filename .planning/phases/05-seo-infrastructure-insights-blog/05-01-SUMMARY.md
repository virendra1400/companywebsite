---
phase: 05-seo-infrastructure-insights-blog
plan: 01
subsystem: cms
tags: [payload, cms, collections, revalidation, next-cache, vitest]

# Dependency graph
requires:
  - phase: 04-forms-conversion
    provides: Products/Media/SiteSettings collection patterns, revalidateCatalog.ts per-locale revalidation shape
provides:
  - Insights Payload collection (title/slug/excerpt/coverImage/category/author/body/publishedDate/published)
  - revalidateInsight afterChange hook (per-locale revalidatePath for /insights + /insights/<slug>)
  - Insights registered in payload.config.ts collections array
  - payload-types.ts Insight interface
  - Integration test coverage for revalidation and translation-status fallback behavior
affects: [05-02-seo-translated-locales, 05-04-insights-pages, 05-05-sitemap]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Public-read Payload collection (access.read: () => true) for content served through Payload's auto-generated REST endpoint, copied from Media.ts rather than Products.ts's admin-gated read"
    - "revalidateAllLocales() per-collection hook helper, copied verbatim from revalidateCatalog.ts and retargeted per collection"

key-files:
  created:
    - src/collections/Insights.ts
    - src/hooks/revalidateInsights.ts
    - tests/int/insights-revalidate-hook.spec.ts
    - tests/int/insights-fallback.spec.ts
    - .planning/phases/05-seo-infrastructure-insights-blog/deferred-items.md
  modified:
    - src/payload.config.ts
    - payload-types.ts

key-decisions:
  - "Insights.access.read is public (() => true), matching Media/SiteSettings, deviating from Products' Boolean(user)-gated read, because Insights is served through Payload's auto-generated public REST endpoint per RESEARCH/CONTEXT."
  - "published:false drafts are excluded from every public query via the same published:checkbox pattern already used on Products (RESEARCH Open Question 1)."
  - "category relationship is required:false (D-02) — no tag/multi-taxonomy in v1; author is a plain localized text field (D-03) — no author sub-collection/photo."

patterns-established:
  - "Wave-0 RED-first integration specs before collection code exists, confirmed failing before implementation (products/pages-fallback and -revalidate-hook spec shapes reused verbatim)."

requirements-completed: [BLOG-02]

coverage:
  - id: D1
    description: "Insights Payload collection with title/slug/excerpt/coverImage/category/author/body/publishedDate/published fields, public read, admin-gated write"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "tests/int/insights-revalidate-hook.spec.ts#revalidateInsight afterChange hook"
        status: pass
      - kind: unit
        ref: "npx tsc --noEmit (no Insights-related errors)"
        status: pass
    human_judgment: false
  - id: D2
    description: "revalidateInsight afterChange hook fires per-locale revalidatePath for /insights and /insights/<slug> on publish, skips entirely under context.disableRevalidate"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "tests/int/insights-revalidate-hook.spec.ts#revalidates the 4 index paths AND the 4 detail paths"
        status: pass
      - kind: integration
        ref: "tests/int/insights-revalidate-hook.spec.ts#skips revalidation entirely when context.disableRevalidate is set"
        status: pass
    human_judgment: false
  - id: D3
    description: "Translation-status existence check (fallbackLocale:false) returns false for fallback-only content and true once real translated content exists"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "tests/int/insights-fallback.spec.ts#untranslated fr has isTranslated:false via the native (fallbackLocale:false) check"
        status: pass
      - kind: integration
        ref: "tests/int/insights-fallback.spec.ts#once fr has real content, isTranslated becomes true"
        status: pass
    human_judgment: false
  - id: D4
    description: "payload-types.ts regenerated with an Insight interface for downstream 05-04 page typing"
    requirement: BLOG-02
    verification:
      - kind: unit
        ref: "grep Insight payload-types.ts (interface Insight, InsightsSelect present)"
        status: pass
    human_judgment: false

# Metrics
duration: 15min
completed: 2026-07-22
status: complete
---

# Phase 05 Plan 01: Insights Collection + Revalidation Summary

**New Payload `Insights` collection (public-read, per-locale localized fields) with a `revalidateInsight` afterChange hook mirroring the existing Products/Categories per-locale revalidation pattern, backing BLOG-02.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-22T16:14:37Z
- **Completed:** 2026-07-22T16:29:15Z
- **Tasks:** 3
- **Files modified:** 7 (5 created, 2 edited)

## Accomplishments
- `Insights` Payload collection live with the full D-01..D-04 field set (title/slug/excerpt/coverImage/category/author/body/publishedDate/published), public read via `access.read: () => true` (Media-style), admin-gated write.
- `revalidateInsight` afterChange hook fires `revalidatePath` for all 4 locale variants of `/insights` and `/insights/<slug>` on publish, and is fully skipped under `context.disableRevalidate` — proven by 8-path assertion in `insights-revalidate-hook.spec.ts`.
- `payload-types.ts` regenerated; a new `Insight` interface and `InsightsSelect` type are exported for downstream pages (05-04) and hooks to typecheck against.
- Translation-status existence check (the `fallbackLocale:false` dual-query pattern from `getPageContent`) proven directly against the `insights` collection: `en` always true, untranslated `fr` false, `fr` becomes true once real fr content is written.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 — failing integration tests for the Insights collection** - `6029e8f` (test) — RED confirmed (collection did not exist yet).
2. **Task 2: Insights collection + revalidate hook + config registration** - `17564ac` (feat)
3. **Task 3: [BLOCKING] Apply schema to the database + regenerate types + green integration tests** - `cf87b37` (test)

**Plan metadata:** *(this commit, docs: complete plan)*

## Files Created/Modified
- `src/collections/Insights.ts` - New Payload collection: public-read, D-01..D-04 field set, `hooks.afterChange: [revalidateInsight]`
- `src/hooks/revalidateInsights.ts` - `revalidateInsight` afterChange hook, per-locale `revalidatePath` for `/insights` + `/insights/<slug>`, guarded by `context.disableRevalidate`
- `src/payload.config.ts` - Import + register `Insights` in the `collections` array
- `payload-types.ts` - Regenerated (`npx payload generate:types`); adds `Insight` interface, `InsightsSelect` type
- `tests/int/insights-revalidate-hook.spec.ts` - New: revalidation path assertions (8-path + disableRevalidate skip), mirrors `products-revalidate-hook.spec.ts`
- `tests/int/insights-fallback.spec.ts` - New: translation-status existence-check coverage, mirrors `pages-fallback.spec.ts`
- `.planning/phases/05-seo-infrastructure-insights-blog/deferred-items.md` - New: logs one out-of-scope pre-existing issue (see Issues Encountered)

## Decisions Made
- `access.read: () => true` (public) copied from `Media.ts`/`SiteSettings.ts`, not `Products.ts`'s `Boolean(user)`-gated read — Insights is served through Payload's auto-generated public REST endpoint (explicit in RESEARCH/CONTEXT).
- `published: { type: "checkbox", defaultValue: true }` added per RESEARCH Open Question 1, mirroring `Products.published`, so drafts are hard-filterable from every public query (owned by 05-04/05-05, not this plan).
- `category` relationship kept `required: false` (D-02, no multi-taxonomy in v1); `author` kept a plain localized text field with `defaultValue: "Export Team"` (D-03, no author sub-collection).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `insights-fallback.spec.ts`'s fr-locale write to satisfy required+localized field validation**
- **Found during:** Task 3 (green-ification of Task 1's specs)
- **Issue:** The "once fr has real content, isTranslated becomes true" test originally wrote only `{ title: "... FR" }` to the `fr` locale, mirroring `pages-fallback.spec.ts` exactly. Unlike `Pages` (where only `title` is `required + localized`), `Insights` also has `excerpt` and `body` as `required + localized` fields. Payload validates all required fields for the locale being written, so the update failed with `ValidationError: The following fields are invalid: Excerpt, Body`.
- **Fix:** Updated the test to also supply `excerpt` and `body` values when writing the `fr` locale, matching how a real content editor would fill in a full localized article rather than a single field.
- **Files modified:** `tests/int/insights-fallback.spec.ts`
- **Verification:** Full `--project=int` suite green (9 files, 33 tests) after the fix.
- **Committed in:** `cf87b37` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test-only fix reflecting a genuine schema difference (Insights has two required+localized fields beyond title, Pages has one) — no scope creep, no production code changed.

## Issues Encountered
- `CI=true PAYLOAD_MIGRATING=true npx payload migrate` (Task 3, step 2) failed with `TypeError: db.execute is not a function` against the pre-existing `src/migrations/20260716_120723_init.ts` file. This migration predates 05-01 and is unrelated to the Insights collection change — out of scope per the executor's scope-boundary rule (only auto-fix issues directly caused by the current task's changes). Local dev uses SQLite auto-sync-on-connect (no migration file needed), so this did not block verification: both integration specs ran green against the live `insights` table through the normal test-DB connect path (`tests/int/config.ts`'s `getTestPayload()`), which is the plan's stated authoritative proof. Logged to `.planning/phases/05-seo-infrastructure-insights-blog/deferred-items.md` for whoever owns the committed-migrations path.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- BLOG-02 backbone is live: staff can create/edit/publish per-locale Insights articles in `/admin`; the collection is public-read, drafts are excludable via `published`, and per-locale revalidation fires on publish.
- 05-02 (SEO translated-locales helper) can now build `getTranslatedLocales("insights", slug)` against a real collection — this plan's fallback spec used a self-contained raw `payload.find` check since 05-02 had not landed yet at execution time; 05-02 should retarget that spec to import the real helper once it exists (not required by this plan's scope).
- 05-04 (Insights pages) can rely on `payload-types.ts`'s `Insight` interface for typing.
- No blockers for downstream plans.

---
*Phase: 05-seo-infrastructure-insights-blog*
*Completed: 2026-07-22*

## Self-Check: PASSED

All created files verified present on disk; all task commit hashes (6029e8f, 17564ac, cf87b37) verified in git log.
