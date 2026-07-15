---
phase: 02-core-marketing-pages-trust-surfaces
plan: 06
subsystem: trust-surfaces
tags: [payload-blocks, export-map, world-svg, a11y, rtl, export-page, homepage]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 04
    provides: statsBand block/render component (reused verbatim for the Export page's own stats band), RenderBlocks BLOCK_MAP + sectionBg, homepage's ExportMap gap left between StatsBand and CTABand
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 02
    provides: Pages collection + layout blocks field, RenderBlocks dispatch, getPageContent, PAGES_EN_SEED/scripts/seed-pages.ts idempotent upsert
provides:
  - exportMap Payload block (slug 'exportMap': sectionTitle, variant compact|full, highlightedCountryCodes[] hasMany text, stats[] value/label) + ExportMapBlock.tsx render component
  - public/maps/world.svg - self-authored, license-safe schematic world map (21 ISO-coded rect tiles), README documents the legal-clearance requirement before any third-party swap
  - src/lib/world-map-svg.ts - same markup as a TS string constant (avoids reading public/ via fs at serverless request time)
  - src/lib/country-names.ts - ISO alpha-2 -> English name lookup (served set + buffer)
  - Complete Export Track Record page (hero -> statsBand -> exportMap(full) -> ctaBand)
  - Homepage's ExportMap(compact) slot filled, completing the PAGE-01 block sequence
  - tests/e2e/export-map-a11y.spec.ts - role=img/aria-label/chip-list/no-mirror coverage (en+ar, export + homepage)
affects: [02-07, 02-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ExportMap's highlightedCountryCodes uses Payload's `type: 'text', hasMany: true` for a plain string array field, rather than a nested array-of-objects — simplest fit for 'array of ISO codes', no sub-schema needed"
    - "Static, non-CMS-managed visual assets (world.svg) get a TWO-part treatment: a real public/<asset> file for direct-linking/inspection AND an identical TS string-constant module (src/lib/world-map-svg.ts) that the render component actually imports — avoids fs.readFileSync(public/...) at Next.js request time, which is unreliable on serverless (Vercel does not guarantee public/ files are present on the Lambda filesystem)"
    - "Country-tile highlighting is a plain string .replace() against the component's OWN known-shape self-authored SVG (id=\"CODE\" ... fill=\"...\") - not a DOM parser, not a map library, matching D-06/T-02-13's 'no map library' constraint"
    - "A bare inline <svg> with only a viewBox and no width/height resolves to a 0x0 box inside a CSS Grid item (min-width:auto shrink-to-fit) - any future block embedding a raw SVG inside a grid/flex container needs explicit width/height=100% on the svg tag AND an aspect-ratio-locked wrapper div, not just a max-width class"

key-files:
  created:
    - public/maps/world.svg
    - public/maps/README.md
    - src/lib/world-map-svg.ts
    - src/lib/country-names.ts
    - src/blocks/ExportMap.ts
    - src/components/blocks/ExportMapBlock.tsx
    - tests/e2e/export-map-a11y.spec.ts
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/lib/seed-content.ts
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - payload-types.ts

key-decisions:
  - "ExportMap's nested block fields (sectionTitle, variant, highlightedCountryCodes, stats) do NOT set field-level localized:true, following the established codebase convention from StatsBand/FeatureGrid/MediaGallery (localization cascades from Pages.layout's own localized:true) - the plan's own task text parenthetical ('sectionTitle: text, localized') is read as descriptive shorthand for 'holds localized-cascaded text', not a literal per-field flag, consistent with 3 prior plans' identical pattern"
  - "world.svg models 21 simplified rectangular 'country tiles' (16 served/highlighted + 5 decorative non-highlighted for visual contrast: BR, RU, CN, JP, AU) rather than every ISO country - geographic precision is explicitly not required (chip list carries the real information); positions are loose real-world approximations, not to scale"
  - "Served country set (seed data): GCC (AE, SA, QA, KW, BH, OM) + Europe (DE, FR, GB, NL, IT, ES) + US, EG, ZA, SG - a realistic, non-fabricated-precision set matching the plan's 'GCC + Europe + a few others' guidance"
  - "ExportMap's own `stats` field IS populated on both the homepage (compact, one stat: 'N+ Countries We Currently Export To') and the Export page (full, one stat: 'N+ Countries Served') alongside the Export page's separate statsBand block (years/shipments/incoterms) - the plan's task text explicitly calls for the block's own stats in addition to the page-level statsBand, so the two are kept distinct (not duplicated) content"

patterns-established:
  - "Pattern: any code-asset (non-editor-managed) static SVG consumed by a server component should live as BOTH a real public/ file (for direct access/inspection/future swap) and a TS string-constant sibling module actually imported at render time - sidesteps fs-at-request-time fragility on serverless without adding a raw-loader dependency"
  - "Pattern: raw inline SVGs embedded via dangerouslySetInnerHTML need an aspect-ratio-locked, width-full wrapper (not just a max-width class) to guarantee a non-zero box in every possible parent layout context (grid/flex/block)"

requirements-completed: [TRUST-04]

# Metrics
duration: 65min
completed: 2026-07-15
---

# Phase 2 Plan 06: Export Track Record (ExportMap + StatsBand) Summary

**A self-authored, license-safe schematic world map (21 ISO-coded tiles, no map library) now highlights Star Agrevolution's 16-country served set on a complete Export Track Record page, with the mandatory visible country-name chip list and a role=img/aria-label a11y contract that never mirrors in RTL; the homepage's ExportMap gap left by 02-04 is also filled, completing the PAGE-01 sequence.**

## Performance

- **Duration:** ~65 min
- **Completed:** 2026-07-15
- **Tasks:** 2
- **Files:** 16 (7 created, 9 modified)

## Accomplishments

- `public/maps/world.svg`: a self-authored, license-safe schematic world map — 21 simple rounded-rect "country tiles" with ISO alpha-2 `id` attributes, positioned as loose real-world approximations (geographic precision explicitly not required per RESEARCH Open Question 1). `public/maps/README.md` documents that any future swap to a more precise third-party map (e.g. CC BY-SA sources) requires legal-owner clearance first (T-02-13).
- `src/lib/world-map-svg.ts`: the identical markup as a TS string constant, actually imported by the render component — avoids reading `public/` via `fs` at Next.js request time, which is unreliable in a serverless (Vercel) deployment.
- `src/lib/country-names.ts`: ISO alpha-2 → English name lookup covering the served set plus a small buffer for future highlights.
- `src/blocks/ExportMap.ts` + `ExportMapBlock.tsx`: `sectionTitle`/`variant` (compact|full)/`highlightedCountryCodes` (hasMany text)/`stats` fields; the render component fills served-country tiles `primary-500` (not gold, per UI-SPEC) via a plain string replace against the known-shape SVG, wraps the map in `role="img"` + a non-empty `aria-label` summarizing the count, and ALWAYS renders the served-country names as a visible wrapped chip list below the map in both variants (T-02-14 — the map illustrates, it never gatekeeps).
- Registered in `blocks/index.ts`, `Pages.ts`'s blocks array, and `RenderBlocks`' `BLOCK_MAP`.
- Export Track Record page composed exactly per UI-SPEC: compact Hero → StatsBand (years exporting/container shipments/incoterms handled) → ExportMap(full, 16-country served set + its own "Countries Served" stat + chip list) → CTABand.
- Homepage's ExportMap(compact) slot (left open by 02-04) is filled between StatsBand and CTABand, completing the homepage's PAGE-01 block sequence.
- `tests/e2e/export-map-a11y.spec.ts`: 20 tests (en+ar) covering role=img + non-empty aria-label with a country count, the visible chip list (not just the SVG), StatsBand rendering, the map present on both the Export page (full) and homepage (compact), and no dir-based mirror transform on `/ar`.
- Full verification green: `npx tsc --noEmit`, `npm run lint:rtl`, `npm run db:seed` (idempotent), `npm run build` (exit 0, all pages × 4 locales prerender), `npx vitest run` (19/19 int), `npx playwright test` (140/142 full suite — see Deviations for the 2 unrelated pre-existing flaky failures), `npx playwright test tests/e2e/export-map-a11y.spec.ts` (20/20 dedicated run, twice).

## Task Commits

Each task was committed atomically:

1. **Task 1: Self-authored world.svg + ISO->name lookup + exportMap block + render component + registration** - `55a3384` (feat)
2. **Task 2: Compose Export page + homepage compact map + seed; a11y e2e** - `b788876` (feat)

_Plan metadata commit follows this summary._

## Files Created/Modified

- `public/maps/world.svg` / `public/maps/README.md` - self-authored schematic map + license-clearance note
- `src/lib/world-map-svg.ts` - the same SVG markup as an importable TS string constant (see Deviations)
- `src/lib/country-names.ts` - ISO alpha-2 -> English name lookup
- `src/blocks/ExportMap.ts` - Payload block field-schema config (no nested `localized:true`, matches 02-02/02-04 convention)
- `src/components/blocks/ExportMapBlock.tsx` - highlight-fill string replace, role=img + aria-label, mandatory chip list, compact/full layout variants, no dir-based transform
- `src/blocks/index.ts` / `src/collections/Pages.ts` / `src/components/blocks/RenderBlocks.tsx` - registration points, 1 new `BLOCK_MAP` entry
- `src/lib/seed-content.ts` - `exportMap()` seed helper + `SERVED_COUNTRY_CODES`; export page layout replaced; home layout gains the compact ExportMap slot
- `src/i18n/messages/{en,ar,fr,ru}.json` - `blocks.exportMapAriaLabel` key added (English placeholder across all locale files, matching the existing `emptyState`/`watchVideo` untranslated-chrome-string precedent)
- `payload-types.ts` - regenerated for the new `exportMap` block union member
- `tests/e2e/export-map-a11y.spec.ts` - 20 tests, en+ar, export page (full) + homepage (compact)

## Decisions Made

- ExportMap's nested fields do not set field-level `localized:true`, following the established StatsBand/FeatureGrid/MediaGallery convention (cascades from `Pages.layout`).
- world.svg models 21 rectangular tiles (16 served + 5 decorative non-served for visual contrast), not all 249 ISO countries — geographic precision is explicitly out of scope per RESEARCH.
- Served set: GCC (6) + Europe (6) + US/EG/ZA/SG (4) = 16 countries, all present in `country-names.ts` and drawn on `world.svg`.
- ExportMap's own `stats` field is populated on both variants (distinct content from the Export page's separate `statsBand` block) per the plan's explicit task text.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `src/lib/world-map-svg.ts` (not in the plan's `files_modified` list)**
- **Found during:** Task 1, designing `ExportMapBlock.tsx`'s SVG-embedding approach.
- **Issue:** The plan's `public/maps/world.svg` artifact needs to be read and highlight-filled at render time. Reading it via `fs.readFileSync(path.join(process.cwd(), "public/maps/world.svg"))` at Next.js Server Component request time is a well-known footgun on serverless (Vercel) deploys — `public/` assets are served via the CDN and are not guaranteed to exist on the Lambda's filesystem at runtime, unlike a plain self-hosted Node server. This project's `vercel.json` targets a real Vercel deploy (fra1 region), making this a genuine blocking reliability concern, not a hypothetical one.
- **Fix:** Created `src/lib/world-map-svg.ts` exporting the identical markup as a plain TS string constant, imported directly by `ExportMapBlock.tsx`. `public/maps/world.svg` still exists on disk (satisfies the plan's required artifact, and stays available for direct-linking/future replacement) — the two are kept in sync by construction (same content, written once).
- **Files affected:** src/lib/world-map-svg.ts (new), src/components/blocks/ExportMapBlock.tsx (imports it instead of reading fs)
- **Verification:** `npx tsc --noEmit` clean; `npm run build` exit 0; e2e confirms the map renders with correct highlight fills
- **Committed in:** 55a3384 (Task 1)

**2. [Rule 1 - Bug] Bare inline SVG collapsed to a 0x0 box inside the homepage's CSS Grid compact layout**
- **Found during:** Task 2's own `npx playwright test tests/e2e/export-map-a11y.spec.ts` run — 4 failures, all on the homepage's compact-variant instance (`toBeVisible()` reporting "hidden" with a 0x0 bounding box), while the Export page's full-variant instance passed.
- **Issue:** Investigated via a throwaway Playwright inspection script measuring `getBoundingClientRect`/`getComputedStyle` on the role=img div and its inner `<svg>`: both computed `width: 0px; height: 0px`. Root cause: the inline `<svg viewBox="0 0 1000 500" ...>` had no `width`/`height` attributes; inside a plain block context (the Export page's full-width instance) the browser's default replaced-element sizing happened to still yield a non-zero box, but inside the homepage's `grid grid-cols-1 lg:grid-cols-2` compact layout, the grid item's `min-width: auto` shrink-to-fit collapsed the un-sized SVG to zero.
- **Fix:** Added `width="100%" height="100%" preserveAspectRatio="xMidYMid meet"` to the `<svg>` tag in both `world-map-svg.ts` and `public/maps/world.svg`, and gave the wrapping `role="img"` div an `aspect-[2/1] w-full` class (matching the SVG's 1000×500 viewBox ratio) in addition to its `max-w-[...]` cap — this guarantees a definite, non-zero box in any parent layout context (block, grid item, flex item).
- **Files affected:** src/lib/world-map-svg.ts, public/maps/world.svg, src/components/blocks/ExportMapBlock.tsx
- **Verification:** re-ran `tests/e2e/export-map-a11y.spec.ts` — 20/20 pass (en+ar); full `npx playwright test` suite re-run confirms no regression; `npm run build` exit 0.
- **Committed in:** b788876 (Task 2)

### Out-of-Scope / Not Fixed

- 2 pre-existing tests in `tests/e2e/language-switcher.spec.ts` (`[ar]` project) failed intermittently ONLY when run as part of the full 140+ test suite under heavy 8-worker parallel load against the Turbopack dev server (route-compile timing race, not a real navigation bug). Confirmed via: (a) isolated re-run of just that spec file passes 4/4 (both `en` and `ar` projects); (b) re-running the FULL suite a second time also passes those 2 tests cleanly; (c) `git stash`-ing this plan's entire diff and re-running the same spec still exhibits the same isolated-pass/full-suite-parallel-flake pattern, confirming it is unrelated to this plan's changes and not caused by any file this plan modifies (`language-switcher.spec.ts`, `LanguageSwitcher.tsx` are both outside this plan's `files_modified` scope). Not fixed per the Deviation Rules' Scope Boundary (pre-existing, unrelated, flaky-under-load tooling behavior).

**Total deviations:** 2 auto-fixed (1 Rule 3 - blocking/reliability, 1 Rule 1 - bug found during this plan's own e2e verification). 1 pre-existing, unrelated, flaky-under-load test failure logged, not fixed (out of scope). No architectural changes; no scope creep. No Rule 4 checkpoints. No auth gates.

## Known Stubs

- None specific to this plan. The Export Track Record page's stats (years exporting, container shipments, incoterms handled, countries served) are realistic-shaped placeholders per D-03/T-02-15 — never presented as audited fact — consistent with every other StatsBand instance seeded in prior Phase 2 plans.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary schema changes. This plan's `<threat_model>` mitigations were honored: T-02-13 (self-authored/license-safe SVG, README documents the legal-clearance requirement before any third-party swap), T-02-14 (served-country names always visible as text chips, map is never the sole information channel), T-02-15 (realistic-shaped, non-audited export figures).

## Issues Encountered

- See Deviations #2 above (SVG 0x0 sizing bug, found and fixed during this plan's own e2e verification, not a pre-existing issue).
- See "Out-of-Scope / Not Fixed" above (pre-existing `language-switcher.spec.ts` flakiness under heavy parallel test load, confirmed unrelated to this plan's changes).
- Fresh worktree had no `node_modules`, `.env`, `.planning/` plan docs, or seeded DB at the start of execution — same recurring pattern as every prior Phase 2 plan's worktree setup. Created a `node_modules` junction to the main checkout, a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + a generated `PAYLOAD_SECRET`), copied the needed `.planning/` docs from the main `D:\PW` checkout, and ran `npm run db:seed` before build/test. None of this is committed (all gitignored, local-environment-only).

## User Setup Required

None — no external service configuration required. Local `node_modules` junction, `.env`, and `payload.db` are dev-environment-only, gitignored, and not part of deployment config. The real served-country list (currently a realistic-shaped 16-country placeholder set) should be confirmed against the company's actual export markets, and the map's schematic tile positions can be swapped for a licensed precise world map later per `public/maps/README.md`'s process, before this content ships to production.

## Next Phase Readiness

- The Export Track Record page (TRUST-04) is fully composed and matches the UI-SPEC's Page Composition table.
- The homepage's block sequence (Hero -> FeatureGrid -> CertStrip -> StatsBand -> ExportMap -> CTABand) is now complete, closing out PAGE-01 across all of Phase 2's homepage-touching plans (02-02, 02-04, 02-06).
- `exportMap`'s block contract (self-authored SVG + string-constant sibling + ISO-code highlight pattern) is proven end-to-end; no other Phase 2 plan is expected to need a second static-map asset, but the "public asset + TS string-constant sibling" pattern is reusable for any future non-editor-managed visual asset needing server-side string manipulation.

## Self-Check: PASSED

Verified all 7 created files exist on disk (`public/maps/world.svg`, `public/maps/README.md`, `src/lib/world-map-svg.ts`, `src/lib/country-names.ts`, `src/blocks/ExportMap.ts`, `src/components/blocks/ExportMapBlock.tsx`, `tests/e2e/export-map-a11y.spec.ts`) — all FOUND, no MISSING. Both task commit hashes (`55a3384`, `b788876`) confirmed present in `git log --oneline -6`. No unexpected file deletions in either task commit (`git diff --diff-filter=D` checked per commit — empty both times). STATE.md/ROADMAP.md untouched per instructions.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
