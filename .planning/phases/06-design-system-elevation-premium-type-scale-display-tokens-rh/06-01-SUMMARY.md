---
phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh
plan: 01
subsystem: ui
tags: [tailwind-v4, css-theme, next-font, i18n, rtl, design-tokens]

requires:
  - phase: 01-foundation-cms-decision
    provides: "Phase-1 @theme token system (color ramp, spacing xs-3xl, body-tier typography) and the --font-sans locale-scoped nested-fallback pattern this plan mirrors"
provides:
  - "text-display-lg (52px/300/1.1) and text-display-xl (56px/300/1.05) @theme tokens + tracking-display (-0.025em)"
  - "font-display token resolving to a Latin-only Geist face on en/fr/ru, falling back to font-sans (Plex) on ar"
  - "spacing-4xl (96px) 4th rhythm step, radius-card (10px), shadow-card / shadow-card-hover elevation tokens"
  - "Amendment note on the archived Phase-1 UI-SPEC scoping the 4-sizes/2-weights lock to body tiers only"
affects: ["07-hero-homepage-narrative", "08-component-polish", "06-02"]

tech-stack:
  added: ["next/font/google Geist loader (already in node_modules, no npm install)"]
  patterns:
    - "Nested CSS var fallback for locale-scoped fonts: --font-display: var(--font-geist-display, var(--font-sans))"
    - "Empty-string locale gate on ar for font variable classes, joined + trimmed on <html> className"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - "src/app/(site)/[locale]/layout.tsx"
    - .planning/milestones/v2.0-phases/01-foundation-cms-decision/01-UI-SPEC.md

key-decisions:
  - "Copied .env / payload.db from the main checkout into the worktree (both gitignored, dev-only, same-machine trust level) to actually run npm run build / npm test end-to-end, since the worktree ships with neither by default."

patterns-established:
  - "Display-tier tokens live in @theme as regular Tailwind v4 theme keys (--text-display-lg, --tracking-display, --spacing-4xl, --radius-card, --shadow-card*) — zero extra CSS, utilities auto-generate."

requirements-completed: [D-01, D-02, D-03, D-04, D-05]

coverage:
  - id: D1
    description: "globals.css @theme gains text-display-lg (52px/300/1.1) and text-display-xl (56px/300/1.05) plus tracking-display (-0.025em)"
    requirement: "D-01"
    verification:
      - kind: unit
        ref: "grep -F -- '--text-display-lg: 52px' / '--text-display-xl: 56px' / '--tracking-display: -0.025em' src/app/globals.css"
        status: pass
    human_judgment: false
  - id: D2
    description: "Geist Latin display face wired locale-scoped via next/font/google, structurally never applied to ar"
    requirement: "D-02"
    verification:
      - kind: unit
        ref: "grep assertions in layout.tsx (Geist import, geistDisplay loader, locale === \"ar\" ? \"\" gate)"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:3000/en and /ar, diffed <html class> — en carries geist_*-module variable class, ar does not"
        status: pass
    human_judgment: false
  - id: D3
    description: "Color ramp (11 --color-* tokens) and body-tier typography/spacing keys stay byte-identical"
    requirement: "D-03"
    verification:
      - kind: unit
        ref: "grep -c '^\\s*--color-' src/app/globals.css == 11; --text-display: 40px / --text-display--font-weight: 600 still present"
        status: pass
    human_judgment: false
  - id: D4
    description: "spacing-4xl (96px), radius-card (10px), shadow-card / shadow-card-hover ambient elevation tokens added"
    requirement: "D-04"
    verification:
      - kind: unit
        ref: "grep -F assertions for --spacing-4xl, --radius-card, --shadow-card, --shadow-card-hover in globals.css"
        status: pass
    human_judgment: false
  - id: D5
    description: "Tabular figures confirmed available via Tailwind v4 built-in tabular-nums utility (no new token added)"
    requirement: "D-05"
    verification: []
    human_judgment: true
    rationale: "Confirmation that tabular-nums is a Tailwind v4 built-in utility is a documentation/design-contract claim (06-UI-SPEC.md), not something this plan wires into a component or covers with a test — no code artifact exists to assert against."
  - id: D6
    description: "Archived Phase-1 UI-SPEC carries a Phase 6 amendment note lifting the type-scale lock for display tiers only"
    verification:
      - kind: unit
        ref: "grep -F 'Phase 6' / grep -Fi 'display-xl' / grep -Fi 'display-lg' .planning/milestones/v2.0-phases/01-foundation-cms-decision/01-UI-SPEC.md"
        status: pass
    human_judgment: false

duration: 20min
completed: 2026-07-23
status: complete
---

# Phase 6 Plan 1: Design Token Elevation Summary

**Amended `globals.css` `@theme` with a display-tier type scale (52/56px, weight 300), a locale-scoped Geist Latin display face that structurally never reaches Arabic, a 96px rhythm step, and hairline card/shadow tokens — color ramp and body-tier typography left byte-identical.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-07-23T13:56:26Z
- **Completed:** 2026-07-23T14:12:00Z
- **Tasks:** 3/3 completed
- **Files modified:** 3

## Accomplishments
- Added 8 new `@theme` tokens (`text-display-lg`/`xl`, `tracking-display`, `font-display`, `spacing-4xl`, `radius-card`, `shadow-card`, `shadow-card-hover`) with zero color or body-tier changes — verified the color ramp is still exactly 11 `--color-*` tokens and `--text-display: 40px` / `--text-display--font-weight: 600` (body-tier lock) are untouched.
- Wired a `Geist` font loader (`next/font/google`, latin subset, weight 300, `--font-geist-display`, `display: swap`) into the locale layout, gated so `displayVar` is an empty string on `ar` — confirmed by direct HTTP inspection that `/en`'s `<html>` carries the Geist variable class and `/ar`'s does not.
- Appended a concise amendment note to the archived Phase-1 UI-SPEC so future agents read the display-tier lock as lifted (body tiers still locked at 2 weights), cross-referencing `06-CONTEXT.md` and `06-UI-SPEC.md`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Amend globals.css @theme with display-tier, rhythm, and card tokens** - `185a666` (feat)
2. **Task 2: Wire Geist Latin display font, locale-scoped so it never reaches Arabic** - `65597af` (feat)
3. **Task 3: Append display-tier amendment note to the archived Phase-1 UI-SPEC** - `8941ab3` (docs)

_No TDD tasks in this plan (design-token amendment, `tdd` not set)._

## Files Created/Modified
- `src/app/globals.css` - 8 new `@theme` tokens (display-lg/xl, tracking-display, font-display, spacing-4xl, radius-card, shadow-card/-hover); corrected the stale "exactly 4 sizes/2 weights" comment to scope it to body tiers only.
- `src/app/(site)/[locale]/layout.tsx` - Added `Geist` import + `geistDisplay` loader; `displayVar` locale gate (empty on `ar`); `<html>` className now joins `fontVar` + `displayVar`, trimmed.
- `.planning/milestones/v2.0-phases/01-foundation-cms-decision/01-UI-SPEC.md` - Appended a Phase 6 amendment blockquote under the Typography section's lock statement.

## Decisions Made
- Copied `.env` and `payload.db` (both gitignored, dev-only SQLite/secret files) from the main checkout into this worktree purely to run `npm run build` / `npm run dev` verification end-to-end — the worktree ships without them by default (per `.planning/SESSION-HANDOFF.md` §"Local `.env`"). No secrets committed; both files remain untracked/gitignored in the worktree.
- Used one proportional `--tracking-display: -0.025em` shared by both display tiers (per plan/UI-SPEC), rather than two separate px-based tracking tokens — it self-scales to the Stripe 56px/-1.4px reference exactly at the xl tier per the UI-SPEC's own math.

## Deviations from Plan

None - plan executed exactly as written. (The `.env`/`payload.db` copy above is execution-environment setup to run the plan's own verification commands, not a change to any plan-scoped file.)

## Issues Encountered
- `npm run build` initially failed with `missing secret key` (Payload) and then `no such table: insights` (empty SQLite file) — both were the worktree lacking the main checkout's local dev `.env` and seeded `payload.db` (gitignored, not carried into a fresh worktree). Copied both from `/workspaces/companywebsite` and the build/tests then ran clean. Not caused by this plan's changes (globals.css/layout.tsx font/token additions are unrelated to Payload/DB wiring).

## User Setup Required

None - no external service configuration required. (The `.env`/`payload.db` copy was a one-time local verification convenience in this worktree, not a deliverable.)

## Next Phase Readiness
- Tokens and Geist font wiring exist and are verified (lint:rtl, tsc, build, all 70 vitest tests, and a live `/en` vs `/ar` `<html class>` diff). Ready for Plan 06-02 (rhythm/card recipe rollout to the 9 block components) and Phase 7 (Hero applying `text-display-xl font-display font-light tracking-display`).
- No blockers. `--font-display`/`--tracking-display`/`--radius-card`/`--shadow-card*` are declared but intentionally unapplied to any component per this plan's scope boundary (D-01/D-04 note: "this plan only makes the tokens/utilities exist").

---
*Phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh*
*Completed: 2026-07-23*

## Self-Check: PASSED

- FOUND: src/app/globals.css
- FOUND: src/app/(site)/[locale]/layout.tsx
- FOUND: .planning/milestones/v2.0-phases/01-foundation-cms-decision/01-UI-SPEC.md
- FOUND: commit 185a666
- FOUND: commit 65597af
- FOUND: commit 8941ab3
