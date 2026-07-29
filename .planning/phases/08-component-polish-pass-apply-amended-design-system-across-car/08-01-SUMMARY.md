---
phase: 08-component-polish-pass-apply-amended-design-system-across-car
plan: 01
subsystem: ui
tags: [tailwind-v4, design-system, react, tabular-nums, card-recipe]

# Dependency graph
requires:
  - phase: 06-hero-and-homepage-narrative
    provides: "rounded-card / shadow-card / shadow-card-hover @theme tokens and the hairline card recipe (ProductCard/InsightCard/CertCard/TestimonialsBlock)"
provides:
  - "FeatureGridBlock and SpecTable cards converged onto the shared hairline card recipe"
  - "tabular-nums wired onto every stat/spec numeric figure sitewide (StatsBandBlock, ExportMapBlock StatTiles, SpecTable dd)"
affects: [08-04-checkpoint, component-polish-remaining-plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hairline card recipe: rounded-card border border-neutral-300 bg-white p-lg shadow-card (resting elevation only, no hover unless whole-card link)"
    - "tabular-nums as the standard utility for any numeric figure needing column alignment (native Tailwind v4 font-variant-numeric, no token required)"

key-files:
  created: []
  modified:
    - src/components/blocks/FeatureGridBlock.tsx
    - src/components/products/SpecTable.tsx
    - src/components/blocks/StatsBandBlock.tsx
    - src/components/blocks/ExportMapBlock.tsx

key-decisions:
  - "Applied Contract §1/§2/§3 class strings verbatim, no deviation from plan"
  - "Logged 5 pre-existing lint errors (unrelated files: insights/not-found.tsx, RenderBlocks.tsx) to deferred-items.md instead of fixing — out of scope per executor scope boundary rule, confirmed present on baseline via git stash diff"

patterns-established:
  - "Data-panel surfaces (bg-neutral-100) converge on radius/border/shadow only, never on background color, when they are deliberately distinct from white content cards"

requirements-completed: [POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05]

coverage:
  - id: D1
    description: "FeatureGridBlock feature cards render with the hairline card recipe (rounded-card, neutral-300 border, white surface, shadow-card resting elevation)"
    requirement: "POLISH-01"
    verification:
      - kind: unit
        ref: "grep -Fc 'gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card' src/components/blocks/FeatureGridBlock.tsx"
        status: pass
      - kind: unit
        ref: "npm test (tests/int/blocks-placeholder.spec.ts FeatureGrid cases)"
        status: pass
    human_judgment: false
  - id: D2
    description: "SpecTable data panel renders with the hairline recipe while keeping bg-neutral-100"
    requirement: "POLISH-02"
    verification:
      - kind: unit
        ref: "grep -Fc 'gap-0 rounded-card border border-neutral-300 bg-neutral-100 p-lg shadow-card' src/components/products/SpecTable.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "StatsBandBlock, ExportMapBlock StatTiles, and SpecTable dd values all carry tabular-nums for fixed-width digit alignment"
    requirement: "POLISH-03"
    verification:
      - kind: unit
        ref: "grep -Fc 'tabular-nums' across StatsBandBlock.tsx / ExportMapBlock.tsx / SpecTable.tsx (each returns 1 at the expected class string)"
        status: pass
      - kind: unit
        ref: "npm test (full vitest suite, 18 files / 80 tests)"
        status: pass
    human_judgment: false
  - id: D4
    description: "No new design token, color, spacing, radius, shadow, or typography-tier change introduced; lint:rtl stays green"
    requirement: "POLISH-04"
    verification:
      - kind: unit
        ref: "git diff src/app/globals.css (empty) + npm run lint:rtl (0 errors)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Live-render visual confirmation of card elevation + digit alignment on populated pages"
    requirement: "POLISH-05"
    verification: []
    human_judgment: true
    rationale: "Plan explicitly defers live-render confirmation to the 08-04 Wave 2 checkpoint, which loads /en and /en/products/<slug> pages — this plan is class-string-only and cannot self-verify visual rendering."

# Metrics
duration: 10min
completed: 2026-07-29
status: complete
---

# Phase 8 Plan 1: Card Recipe Convergence + Tabular-Nums Summary

**Converged FeatureGridBlock and SpecTable cards onto the Phase 6 hairline recipe and wired native Tailwind `tabular-nums` onto every stat/spec numeric figure sitewide — four class-string-only diffs, zero new tokens.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-29T05:38:00+05:30 (approx, file reads)
- **Completed:** 2026-07-29T05:46:38+05:30
- **Tasks:** 2 completed
- **Files modified:** 4 (`FeatureGridBlock.tsx`, `SpecTable.tsx`, `StatsBandBlock.tsx`, `ExportMapBlock.tsx`)

## Accomplishments
- `FeatureGridBlock` feature cards now carry the exact hairline recipe (`rounded-card border border-neutral-300 bg-white p-lg shadow-card`), resting elevation only, matching TestimonialsBlock/ProductCard/InsightCard/CertCard.
- `SpecTable`'s data panel converges on the same radius/border/shadow recipe while deliberately keeping its distinct `bg-neutral-100` data-panel surface.
- `tabular-nums` wired onto `StatsBandBlock` stat values, `ExportMapBlock` `StatTiles` values, and `SpecTable` `<dd>` value cells — fixed-width digits for column alignment sitewide.
- Zero new tokens: `git diff src/app/globals.css` empty throughout.

## Task Commits

Each task was committed atomically:

1. **Task 1: Converge FeatureGridBlock and SpecTable cards on the Phase 6 hairline recipe** - `f17abb3` (feat)
2. **Task 2: Wire tabular-nums onto every stat figure and spec value** - `f28158c` (feat)

**Plan metadata:** doc for deferred lint items - `b3f9080` (docs)

## Files Created/Modified
- `src/components/blocks/FeatureGridBlock.tsx` - Card className converged on hairline recipe (resting elevation, no hover)
- `src/components/products/SpecTable.tsx` - Card className converged on hairline recipe (kept bg-neutral-100); `<dd>` gained tabular-nums
- `src/components/blocks/StatsBandBlock.tsx` - stat value `<p>` gained tabular-nums
- `src/components/blocks/ExportMapBlock.tsx` - `StatTiles` stat value `<p>` gained tabular-nums

## Decisions Made
- Applied the plan's Contract §1/§2/§3 class strings verbatim with no deviation.
- Did not fix 5 pre-existing lint errors in unrelated files (`insights/not-found.tsx`, `RenderBlocks.tsx`) — confirmed present on the baseline commit via `git stash` before/after diff, so out of scope for this plan's class-string-only diff. Logged to `deferred-items.md`.

## Deviations from Plan

None — plan executed exactly as written. The pre-existing lint errors encountered during Task 2's `npm run lint` verify step are documented below as an out-of-scope discovery, not a deviation (no fix was applied, per the scope boundary rule).

### Out-of-Scope Discoveries (logged, not fixed)

**1. Pre-existing lint errors in unrelated files**
- **Found during:** Task 2 verify (`npm run lint`)
- **Issue:** 4x `@next/next/no-html-link-for-pages` errors in `src/app/(site)/[locale]/insights/not-found.tsx`, 1x `@typescript-eslint/no-explicit-any` in `src/components/blocks/RenderBlocks.tsx`
- **Confirmed pre-existing:** `git stash` + `npm run lint` on the pre-edit baseline reproduced the identical 35 problems / 5 errors
- **Action:** Not fixed (out of scope — neither file is in this plan's `files_modified`). Logged to `.planning/phases/08-component-polish-pass-apply-amended-design-system-across-car/deferred-items.md`.
- **Committed in:** `b3f9080` (docs commit)

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both card-recipe stragglers are converged; TestimonialsBlock's reference class string is now duplicated correctly on FeatureGridBlock/SpecTable with no repo-wide grep collisions.
- Live-render visual confirmation (card elevation + digit alignment on `/en` and `/en/products/<slug>`) is still pending — deferred to plan 08-04's Wave 2 checkpoint as designed.
- The 5 pre-existing lint errors in `insights/not-found.tsx` and `RenderBlocks.tsx` remain unresolved and are tracked in `deferred-items.md` for a future cleanup task.

---
*Phase: 08-component-polish-pass-apply-amended-design-system-across-car*
*Completed: 2026-07-29*

## Self-Check: PASSED

All created/modified files found on disk; all 3 task/docs commits (`f17abb3`, `f28158c`, `b3f9080`) found in git log.
