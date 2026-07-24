---
phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
plan: 01
subsystem: ui
tags: [tailwind, next-intl, rtl, typography, hero]

requires:
  - phase: 06-component-and-block-polish (or equivalent Phase 6 token phase)
    provides: "text-display-xl/font-display/tracking-display/xl:py-4xl tokens in globals.css @theme"
provides:
  - "Homepage (full-variant) HeroBlock headline elevated to the display-xl (56px/300/-0.025em) tier"
  - "Softened full-variant atmospheric gradient overlay (from-primary-900/75 via-primary-900/25)"
  - "isFull-conditional heroPadding/stackGap/headlineClass/subheadClass/overlayClass pattern in HeroBlock.tsx"
affects: [07-02, 07-03, homepage-composition, ui-polish]

tech-stack:
  added: []
  patterns:
    - "isFull ternary variables computed once at top of component body, referenced in JSX template literals — same shape as the existing isFull boolean, extended for Phase 6 token application"

key-files:
  created: []
  modified:
    - src/components/blocks/HeroBlock.tsx

key-decisions:
  - "No deviations — plan's exact literal class strings applied verbatim from 07-UI-SPEC.md Part 1 Implementation shape block."

patterns-established:
  - "Variant-conditional Tailwind class variables (heroPadding/overlayClass/stackGap/headlineClass/subheadClass) computed from an existing isFull boolean, avoiding duplicated JSX branches — reusable pattern for any future variant-scoped elevation."

requirements-completed: [D-01, D-02, D-04]

coverage:
  - id: D1
    description: "Homepage full-variant Hero headline renders at text-display-xl font-display font-light tracking-display (56px/300/-0.025em); compact variant stays byte-identical (text-display font-semibold)"
    requirement: "D-01"
    verification:
      - kind: unit
        ref: "grep -F 'text-display-xl font-display font-light tracking-display' src/components/blocks/HeroBlock.tsx"
        status: pass
      - kind: unit
        ref: "grep -F 'text-display font-semibold text-white' src/components/blocks/HeroBlock.tsx"
        status: pass
      - kind: e2e
        ref: "playwright:tests/e2e/rtl-arabic.spec.ts (6/6 passed, en+ar projects)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Full-variant atmospheric overlay softened to bg-gradient-to-t from-primary-900/75 via-primary-900/25 to-transparent (vertical only, no filter/parallax/new dependency); xl:py-4xl 96px rhythm and gap-xl applied to full variant"
    requirement: "D-02"
    verification:
      - kind: unit
        ref: "grep -F 'from-primary-900/75 via-primary-900/25' src/components/blocks/HeroBlock.tsx"
        status: pass
      - kind: unit
        ref: "grep -F 'xl:py-4xl' src/components/blocks/HeroBlock.tsx"
        status: pass
      - kind: automated_ui
        ref: "npm run lint:rtl (scripts/check-physical-direction.mjs) — 0 violations"
        status: pass
    human_judgment: false
  - id: D3
    description: "data-testid=\"hero\" and data-testid=\"sample-count\" preserved verbatim; no globals.css/@theme edit; no new import"
    requirement: "D-04"
    verification:
      - kind: unit
        ref: "grep -c 'data-testid=\"hero\"' and grep -c 'data-testid=\"sample-count\"' src/components/blocks/HeroBlock.tsx — both return 1"
        status: pass
      - kind: integration
        ref: "npx tsc --noEmit"
        status: pass
      - kind: e2e
        ref: "playwright:tests/e2e/rtl-arabic.spec.ts:17 '/ar sample number uses Western (latn) digits' (en + ar projects)"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-07-24
status: complete
---

# Phase 7 Plan 1: Hero Display-XL Elevation Summary

**Homepage (full-variant) HeroBlock headline elevated to Phase 6's text-display-xl/font-display/font-light/tracking-display (56px/300/-0.025em) tier with softened atmospheric gradient and 96px desktop rhythm; compact (interior-page) hero left byte-identical.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T09:20:14Z
- **Completed:** 2026-07-24T09:28:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `HeroBlock.tsx`'s `full` variant now renders the 56px thin Geist/Plex display headline (`text-display-xl font-display font-light tracking-display`) at `max-w-[46rem]`, replacing the prior 40px/600 treatment.
- Full-variant section padding gains the Phase 6 96px desktop rhythm step (`xl:py-4xl`); content-stack gap widened to `gap-xl`; subhead column widened to `max-w-[38rem]`.
- Full-variant atmospheric overlay softened from `from-primary-900/80 via-primary-900/30` to `from-primary-900/75 via-primary-900/25` (single vertical `bg-gradient-to-t`, no filter, no new dependency).
- `compact` variant (every interior-page hero) is byte-identical to the pre-existing classes — `max-w-[42rem] text-display font-semibold`, `gap-lg`, unchanged padding, unchanged overlay stops.
- Both `data-testid="hero"` and `data-testid="sample-count"` test hooks preserved verbatim; the existing Arabic e2e digit assertion (`tests/e2e/rtl-arabic.spec.ts`) passes unchanged (6/6, en + ar projects).

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply Phase-6 display tokens to the full-variant Hero (compact untouched)** - `9bf0063` (feat)

**Plan metadata:** (final docs commit recorded below)

## Files Created/Modified
- `src/components/blocks/HeroBlock.tsx` - Added five `isFull`-conditional class variables (`heroPadding`, `overlayClass`, `stackGap`, `headlineClass`, `subheadClass`) computed from the existing `isFull` boolean; wired each into the section/overlay/content-stack/h1/subhead JSX. No other element (eyebrow, CTAs, WhatsApp link, sample-count line, both `data-testid` hooks) touched.

## Decisions Made
None - plan executed exactly as written. The five literal class strings were copied verbatim from 07-UI-SPEC.md Part 1's "Implementation shape" reference block.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The worktree lacked a dev `.env`/`payload.db` (both gitignored, dev-only); copied both from the main checkout at `/workspaces/companywebsite` per the orchestrator's note before running the e2e verification, per the existing STATE.md-logged precedent for this exact situation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `HeroBlock.tsx`'s full-variant elevation is complete and verified (lint:rtl, tsc, rtl-arabic e2e all green); ready for 07-02/07-03 (new CMS trust/process/testimonial blocks and homepage composition) to build alongside without touching this file's variant logic.
- No blockers or concerns carried forward.

---
*Phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust*
*Completed: 2026-07-24*

## Self-Check: PASSED
- FOUND: src/components/blocks/HeroBlock.tsx
- FOUND: .planning/phases/07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust/07-01-SUMMARY.md
- FOUND: commit 9bf0063
