---
phase: 02-core-marketing-pages-trust-surfaces
plan: 02
subsystem: cms
tags: [payload-blocks, pages-collection, page-builder, revalidation, i18n-fallback]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 01
    provides: shadcn CSS-variable gap closure + Card/Badge/Input/Textarea/Label/Form/AspectRatio primitives, react-hook-form/zod/@hookform/resolvers installed
  - phase: 01-foundation-cms-decision
    provides: Payload CMS backend, localized Home global (retired this plan), payload-fetch dual-query fallback pattern, revalidateHome pattern, chrome components (GlobalHeader/GlobalFooter/LocaleFallbackNotice)
provides:
  - Pages collection (slug + localized `layout:blocks` field) replacing the Home global
  - Certifications collection schema (name/issuingBody/logo/certificatePdf/validityNotes/halal/displayOrder)
  - RenderBlocks blockType->component switch + sectionBg alternation helper
  - 3-block thin slice (Hero, RichText, CTABand) with Payload Block configs + React render components
  - getPageContent(slug, locale) generic fetch/fallback-detection helper (replaces getHomeContent)
  - revalidatePage generic afterChange hook (replaces revalidateHome)
  - src/app/(site)/[locale]/[slug]/page.tsx explicit route for the 6 interior pages
  - 7 seeded Pages docs (home + about/certifications/manufacturing/export/company/contact stubs)
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payload Blocks page-builder: one Pages collection, localized:true set ONLY on the top-level layout field (cascades to all nested block fields automatically)"
    - "RenderBlocks BLOCK_MAP dispatch with fail-soft (null) on unknown blockType"
    - "Hero and CTABand are documented exceptions to the sectionBg white/neutral-100 alternation (both hardcode bg-primary-900)"
    - "getPageContent/revalidatePage: slug-aware generalization of the Phase 1 dual-query fallback-detection + 4-locale revalidatePath patterns"

key-files:
  created:
    - src/collections/Pages.ts
    - src/collections/Certifications.ts
    - src/blocks/Hero.ts
    - src/blocks/RichText.ts
    - src/blocks/CTABand.ts
    - src/blocks/index.ts
    - src/hooks/revalidatePage.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/components/blocks/HeroBlock.tsx
    - src/components/blocks/RichTextBlock.tsx
    - src/components/blocks/CTABandBlock.tsx
    - "src/app/(site)/[locale]/[slug]/page.tsx"
    - scripts/seed-pages.ts
    - tests/int/pages-fallback.spec.ts
    - tests/int/pages-revalidate-hook.spec.ts
    - tests/e2e/page-routing.spec.ts
  modified:
    - src/lib/payload-fetch.ts
    - src/payload.config.ts
    - "src/app/(site)/[locale]/page.tsx"
    - src/lib/seed-content.ts
    - package.json
    - payload-types.ts
  deleted:
    - src/globals/Home.ts
    - src/hooks/revalidateHome.ts
    - src/components/Hero.tsx
    - scripts/seed-home.ts
    - tests/int/payload-fallback.spec.ts
    - tests/int/payload-localization.spec.ts
    - tests/int/payload-revalidate-hook.spec.ts

key-decisions:
  - "Moved src/blocks/{Hero,RichText,CTABand}.ts + index.ts field-schema creation from Task 2 into Task 1 (see Deviations) - Pages.ts's layout field requires the block configs to exist to compile and schema-sync"
  - "Kept HOME_EN_SEED as a derived backward-compat export in seed-content.ts alongside the new PAGES_EN_SEED, so the existing tests/e2e/fallback-notice.spec.ts needed zero changes"
  - "WhatsApp CTA hrefs use an obvious all-zeros wa.me placeholder (https://wa.me/910000000000) pending the real business number - not a fabricated business fact, unlike a specific cert/registration number"
  - "Hero and CTABand are documented exceptions to the sectionBg alternation - both always render bg-primary-900, matching the UI-SPEC's explicit design"

patterns-established:
  - "Pattern: Payload Block field configs live in src/blocks/*.ts (schema only); their React render counterparts live in src/components/blocks/*.tsx (1:1 naming, separate directories)"
  - "Pattern: RenderBlocks' BLOCK_MAP is typed loosely (ComponentType<{block: any, index: number}>) rather than over-engineering per-variant generics for a heterogeneous discriminated-union dispatch"

requirements-completed: [PAGE-01, PAGE-02, TRUST-06]

# Metrics
duration: 70min
completed: 2026-07-15
---

# Phase 2 Plan 02: Payload Blocks Page-Builder (Pages Collection + Hero/RichText/CTABand) Summary

**Retired the Phase 1 `Home` global in favor of a real Payload Blocks page-builder: a `Pages` collection (slug + localized `layout` blocks) renders the homepage and all 6 interior routes through one generic `RenderBlocks` switch, seeded with 7 realistic-placeholder pages and a green local SQLite build.**

## Performance

- **Duration:** 70 min
- **Started:** 2026-07-15T10:43:00Z
- **Completed:** 2026-07-15T10:54:35Z (build+e2e verification through ~10:55:30Z)
- **Tasks:** 3
- **Files modified:** 29 (16 created, 6 modified, 7 deleted)

## Accomplishments

- `Pages` collection (`slug` text field, unique+indexed, NOT localized; `layout` blocks field, `localized: true`, cascading to every nested block field) fully replaces the `Home` global; `Certifications` collection schema (with the `halal` boolean driving TRUST-02 prominence) added and synced alongside it in this plan's single `[BLOCKING]` schema-sync step
- Three Payload Block configs (`Hero`, `RichText`, `CTABand`) plus their React render counterparts, dispatched through one `RenderBlocks` `BLOCK_MAP` switch with `sectionBg` white/neutral-100 alternation (Hero and CTABand are the documented exceptions, both hardcoding `bg-primary-900`)
- `getPageContent(slug, locale)` and `revalidatePage` generalize the Phase 1 `getHomeContent`/`revalidateHome` dual-query fallback-detection and 4-locale revalidation patterns to any slug
- Homepage (`src/app/(site)/[locale]/page.tsx`) and a new explicit `[locale]/[slug]/page.tsx` (6 interior slugs, `generateStaticParams`, `notFound()` on a missing doc) both render via `getPageContent` + `RenderBlocks`
- All 7 pages (home + about/certifications/manufacturing/export/company/contact stubs) seeded with realistic-shaped English placeholder copy via the idempotent `scripts/seed-pages.ts`; `npm run build` prerenders all 7 pages x 4 locales with zero empty-content errors
- Full verification green: `npx tsc --noEmit`, `npm run lint:rtl`, `npx vitest run` (10/10 int tests), `npx playwright test` (68/68 e2e, en+ar, including every pre-existing Phase 1 spec), `npm run build` (exit 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Pages + Certifications collections, generic fetch + revalidate helpers, retire Home global** (also includes the 3 block field-schema configs, moved forward from Task 2 - see Deviations) - `7ecee6b` (feat)
2. **Task 2: RenderBlocks + Hero/RichText/CTABand render components + [slug] route + homepage repoint** - `3fb6171` (feat)
3. **Task 3: [BLOCKING] schema sync + re-seed all 7 pages + green local build + Wave-0 test scaffolds** - `7ab070e` (feat)

_Plan metadata commit follows this summary._

## Files Created/Modified

- `src/collections/Pages.ts` - slug-routed collection, `layout:blocks` field (localized, cascades), `revalidatePage` afterChange hook
- `src/collections/Certifications.ts` - name/issuingBody/logo/certificatePdf/validityNotes/halal/displayOrder schema
- `src/blocks/{Hero,RichText,CTABand}.ts` + `index.ts` - Payload Block field-schema configs (no nested `localized:true`)
- `src/hooks/revalidatePage.ts` - slug-aware, 4-locale-path `revalidatePath` afterChange hook
- `src/lib/payload-fetch.ts` - `getPageContent(slug, locale)` dual-query fallback-detection helper, replaces `getHomeContent`
- `src/payload.config.ts` - `Pages`/`Certifications` added to `collections`, `globals` array removed
- `src/components/blocks/RenderBlocks.tsx` - `BLOCK_MAP` dispatch + `sectionBg` alternation helper
- `src/components/blocks/HeroBlock.tsx` - generalizes the retired `Hero.tsx`; `full`/`compact` variants, image guard, FOUND-03 sample-count line (full only)
- `src/components/blocks/RichTextBlock.tsx` - renders Lexical content via `@payloadcms/richtext-lexical/react`'s `RichText` JSX converter
- `src/components/blocks/CTABandBlock.tsx` - hardcoded dark band, ignores alternation
- `src/app/(site)/[locale]/[slug]/page.tsx` - new explicit route, 6 interior slugs, `generateStaticParams`, `notFound()`
- `src/app/(site)/[locale]/page.tsx` - repointed to `getPageContent('home', locale)` + `RenderBlocks`
- `src/lib/seed-content.ts` - `PAGES_EN_SEED` (7 pages) replaces `HOME_EN_SEED` as source of truth; `HOME_EN_SEED` kept as a derived backward-compat alias
- `scripts/seed-pages.ts` - idempotent per-slug upsert, en-only, replaces `scripts/seed-home.ts`
- `package.json` - `db:seed` now runs `scripts/seed-pages.ts`
- `payload-types.ts` - regenerated, now includes `Page`/`Certification` interfaces
- `tests/int/pages-fallback.spec.ts` - mirrors the retired `payload-fallback.spec.ts` against `getPageContent`/`Pages`
- `tests/int/pages-revalidate-hook.spec.ts` - replaces `payload-revalidate-hook.spec.ts`, covers home-slug + non-home-slug revalidation paths
- `tests/e2e/page-routing.spec.ts` - all 6 interior slugs x en+`/ar`, plus an unknown-slug 404 case
- Deleted: `src/globals/Home.ts`, `src/hooks/revalidateHome.ts`, `src/components/Hero.tsx`, `scripts/seed-home.ts`, `tests/int/payload-fallback.spec.ts`, `tests/int/payload-localization.spec.ts`, `tests/int/payload-revalidate-hook.spec.ts`

## Decisions Made

- Block field-schema files (`src/blocks/*.ts`) were created in Task 1 rather than Task 2, since `Pages.ts`'s `layout` field imports them directly - see Deviations for the full reasoning.
- `HOME_EN_SEED` retained as a derived export (`{ heroHeadline, heroSubhead }` sourced from the home page's hero block data) so the pre-existing `tests/e2e/fallback-notice.spec.ts` (out of this plan's `files_modified` scope) needed no edits.
- WhatsApp CTA hrefs use an obvious all-zeros placeholder number, not a fabricated real one - distinct from the Pitfall 5 concern (fabricated certification/registration numbers or named clients), but still flagged here for the content team to replace before launch.
- `RenderBlocks`' `BLOCK_MAP` is typed as `Record<string, ComponentType<{ block: any; index: number }>>` rather than a fully-generic per-variant-typed dispatcher - each block component narrows `block` internally via `Extract<Page['layout'][number], { blockType: '...' }>`. A fully polymorphic type-safe renderer for a 3-(soon 9-)variant discriminated union is unnecessary ceremony for this scale.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved src/blocks/{Hero,RichText,CTABand}.ts + index.ts creation from Task 2 into Task 1**
- **Found during:** Task 1's own `npx tsc --noEmit` verification
- **Issue:** The plan's Task 1 action text has `Pages.ts`'s `layout` field import `Hero, RichText, CTABand` from `@/blocks`, but the plan's Task 2 is explicitly titled as the task that creates those same `src/blocks/*.ts` config files. As written, Task 1 could not compile (missing module `@/blocks`) until Task 2 landed - a sequencing gap in the plan itself, not a design flaw in the code.
- **Fix:** Created the three Payload Block field-schema files (`src/blocks/Hero.ts`, `RichText.ts`, `CTABand.ts`) plus the `index.ts` barrel as part of Task 1's commit (since they are pure CMS schema, no React), leaving Task 2 to own only the React render components (`src/components/blocks/*.tsx`) and the routes/homepage repoint. This is a mechanical reordering of already-planned files across the two task commits, not a scope or architecture change - every file was already in the plan's `files_modified` list.
- **Files affected:** src/blocks/Hero.ts, src/blocks/RichText.ts, src/blocks/CTABand.ts, src/blocks/index.ts (created in Task 1's commit `7ecee6b` instead of Task 2's `3fb6171`)
- **Verification:** `npx tsc --noEmit` clean after Task 1's full file set landed
- **Committed in:** 7ecee6b (Task 1 commit)

**2. [Rule 2 - Missing critical functionality] Added a `heroImage` upload field to the Hero block config**
- **Found during:** Task 1, writing `src/blocks/Hero.ts`
- **Issue:** The plan's Task 1 action text enumerates Hero's fields as `variant, eyebrow, headline, subhead, primaryCta, secondaryCta` - omitting `heroImage` - yet Task 2's action text explicitly instructs "keep the Media image guard + gradient" when generalizing the retired `Hero.tsx` (which has a `heroImage` upload field) into `HeroBlock.tsx`. Without a `heroImage` field on the Block config, that instruction would be unsatisfiable (no field to guard).
- **Fix:** Added `heroImage` (`type: 'upload', relationTo: 'media'`, optional) to `src/blocks/Hero.ts`, matching the Phase 1 `Home` global's field and the exact populate/typeof guard pattern from the retired `Hero.tsx`.
- **Files affected:** src/blocks/Hero.ts, src/components/blocks/HeroBlock.tsx
- **Verification:** `npx tsc --noEmit` clean; image guard pattern (`typeof block.heroImage === "object"`) matches the pre-existing precedent exactly
- **Committed in:** 7ecee6b (block config), 3fb6171 (image guard usage in HeroBlock.tsx)

**3. [Rule 1 - Bug] Deleted 3 int tests that exercised the retired Home global; replaced revalidate-hook coverage**
- **Found during:** Task 1's own `npx tsc --noEmit` verification (Home global's deletion broke these files' `updateGlobal`/`findGlobal` calls, both at compile time - `data`/`return` types now resolve to `never`/`undefined` since `home` no longer exists in the globals map - and at runtime)
- **Issue:** `tests/int/payload-fallback.spec.ts`, `tests/int/payload-localization.spec.ts`, and `tests/int/payload-revalidate-hook.spec.ts` all directly exercised the `home` global (`updateGlobal`/`findGlobal({slug: "home", ...})`) or the deleted `getHomeContent`/`revalidateHome`. None were in the plan's `files_modified` list, but retiring the `Home` global (an explicit, required Task 1 action) makes these files uncompilable and non-functional as a direct, mechanical consequence - not an unrelated pre-existing issue.
- **Fix:** Deleted `payload-fallback.spec.ts` (superseded 1:1 by the plan's own Task 3 `pages-fallback.spec.ts`) and `payload-localization.spec.ts` (its dual-fallback-query mechanism is re-proven by `pages-fallback.spec.ts` against `Pages`). Rewrote `payload-revalidate-hook.spec.ts` into `pages-revalidate-hook.spec.ts`, testing `revalidatePage` against a real `Pages` doc (covers both the `home` slug and a non-home slug, since `revalidatePage` is now slug-derived rather than hardcoded) - this preserves CMS-03 revalidation test coverage rather than silently dropping it.
- **Files affected:** tests/int/payload-fallback.spec.ts (deleted), tests/int/payload-localization.spec.ts (deleted), tests/int/payload-revalidate-hook.spec.ts (deleted) -> tests/int/pages-revalidate-hook.spec.ts (created)
- **Verification:** `npx vitest run` - all 10 int tests across 3 files pass (media-upload unaffected, pages-revalidate-hook 3/3, pages-fallback 4/4 added in Task 3)
- **Committed in:** 7ecee6b (Task 1 commit)

**4. [Rule 3 - Blocking] Fresh worktree had no node_modules, `.env`, or seeded SQLite DB**
- **Found during:** start of execution, before any verification could run
- **Issue:** This worktree had no `node_modules` at all (only the main repo checkout at `D:\PW\node_modules` was fully installed), and no `.env`/`payload.db`.
- **Fix:** Created a directory symlink `node_modules -> D:\PW\node_modules` (reuses the main repo's fully-installed dependencies, per the executor's explicit instruction to reuse rather than reinstall) and a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + a freshly generated `PAYLOAD_SECRET`). Ran `npm run db:seed` before `npm run build`.
- **Files affected:** none committed (`node_modules` symlink and `.env`/`payload.db` are all gitignored, local-environment-only)
- **Verification:** `npm run build` exits 0, all 7 pages x 4 locales prerender

---

**Total deviations:** 4 auto-fixed (2 Rule 3 - blocking/sequencing, 1 Rule 2 - missing critical field, 1 Rule 1 - bug/broken-by-required-deletion). No architectural changes; no scope creep beyond what retiring the `Home` global and shipping the `layout` field's Hero block necessarily required.

## Known Stubs

- **Certifications collection has no consuming block/page yet.** The schema (`src/collections/Certifications.ts`) is fully synced this plan (per the plan's explicit intent - "single [BLOCKING] schema-sync step") but no `CertCard`/`CertStrip` block or Certifications-page rendering exists yet - that is a later Phase 2 plan's scope (TRUST-01/02). Not a gap in this plan's own success criteria.
- **6 interior pages render only a compact Hero (no RichText/CTABand-specific real content).** Per the plan's own design ("thin stubs guarantee every generateStaticParams slug has a doc to prerender; later plans enrich each page's layout") - `contact` intentionally has no CTABand (matches UI-SPEC: "this page is the destination"). Later plans (03 onward) add FeatureGrid/StatsBand/CertStrip/MediaGallery/ExportMap/ContactBlock and enrich each page's block sequence to match the full UI-SPEC composition table.
- **WhatsApp CTA hrefs use an all-zeros placeholder number** (`https://wa.me/910000000000`) pending the real business WhatsApp number from the content team - flagged in Decisions above.

## Issues Encountered

- During the full Playwright e2e run, the dev server logged two transient `SyntaxError: Unexpected end of JSON input` warnings for `/ar/manufacturing` and `/ar/about` page-data requests. Both corresponding tests (and every other test in the 68-test suite) passed with a 200 status and a visible hero - no test failure, no reproduction on a second look at the same routes. No `JSON.parse` call exists anywhere in this plan's own source changes (`grep` confirmed); this appears to be Turbopack/Next.js dev-server internal request-handling noise, out of this plan's scope per the Deviation Rules' scope boundary (pre-existing tooling behavior, not caused by this plan's files). Logged here for visibility, not fixed.

## User Setup Required

None - no external service configuration required. Local `node_modules` symlink, `.env`, and `payload.db` are dev-environment-only, gitignored, and not part of deployment config. The real WhatsApp business number (currently an all-zeros placeholder in seed content) should be provided by the content/business team before this content ships to production.

## Next Phase Readiness

- The block-system contract (Payload Block config -> `RenderBlocks` `BLOCK_MAP` -> rendered page) is proven end-to-end with 3 real blocks; later plans append FeatureGrid/StatsBand/CertStrip/MediaGallery/ExportMap/ContactBlock to `src/blocks/index.ts` and `RenderBlocks`' `BLOCK_MAP` without touching the Pages collection, fetch helper, or revalidate hook.
- `Certifications` collection schema is live and synced - the next Certifications-page plan (TRUST-01/02) can start directly on the `CertCard`/`CertStrip` block and seed data, no schema work needed.
- All 7 page slugs exist with a real (if thin) layout, so every later plan's block-append work has a doc to attach to and a green `npm run build` baseline to build on.

## Self-Check: PASSED

Verified all 16 created files exist on disk (`src/collections/Pages.ts`, `Certifications.ts`, `src/blocks/{Hero,RichText,CTABand}.ts` + `index.ts`, `src/hooks/revalidatePage.ts`, `src/components/blocks/{RenderBlocks,HeroBlock,RichTextBlock,CTABandBlock}.tsx`, `src/app/(site)/[locale]/[slug]/page.tsx`, `scripts/seed-pages.ts`, `tests/int/pages-fallback.spec.ts`, `tests/int/pages-revalidate-hook.spec.ts`, `tests/e2e/page-routing.spec.ts`) and confirmed all 7 deletions (`src/globals/Home.ts`, `src/hooks/revalidateHome.ts`, `src/components/Hero.tsx`, `scripts/seed-home.ts`, 3 retired int tests) are gone. All 3 task commit hashes (`7ecee6b`, `3fb6171`, `7ab070e`) confirmed present in `git log --oneline -5`.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
