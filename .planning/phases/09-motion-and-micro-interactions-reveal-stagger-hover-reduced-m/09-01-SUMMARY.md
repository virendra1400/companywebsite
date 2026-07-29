---
phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
plan: 01
subsystem: ui
tags: [motion, intersection-observer, tailwind-v4, reduced-motion, rtl, tw-animate-css]

# Dependency graph
requires:
  - phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh
    provides: "shadow-card/shadow-card-hover tokens, @theme block conventions in globals.css"
provides:
  - "useInView(threshold?) IntersectionObserver hook — src/components/motion/useInView.ts"
  - "Reveal client wrapper (section-level fade+rise) — src/components/motion/Reveal.tsx"
  - "RevealItem client wrapper (per-item stagger, direction-aware) — src/components/motion/RevealItem.tsx"
  - "--animate-float-in theme token + @keyframes float-in in globals.css"
  - "tw-animate-css import in globals.css resolving dead animate-in/fade-in-0/zoom-in-95/slide-in-from-* utilities in sheet.tsx/dropdown-menu.tsx/select.tsx"
  - "@media (scripting: none) no-JS reveal guard in globals.css"
affects: [09-02, 09-03, 09-04]

# Tech tracking
tech-stack:
  added: ["tw-animate-css@^1.4.0 (CSS-only devDependency, zero JS, no postinstall)"]
  patterns:
    - "src/components/motion/ as the dedicated home for client-only motion leaves (not src/hooks/, which is reserved for Payload lifecycle hooks)"
    - "Reveal/RevealItem use data-motion/data-revealed/data-direction attributes + data-[revealed]: Tailwind variant instead of conditional className branching"
    - "Transition property lists must name `translate` (not `transform`) to match how Tailwind v4 compiles translate-* utilities to the standalone CSS `translate` property"

key-files:
  created:
    - src/components/motion/useInView.ts
    - src/components/motion/Reveal.tsx
    - src/components/motion/RevealItem.tsx
    - tests/unit/motion-reveal.spec.tsx
  modified:
    - package.json
    - package-lock.json
    - src/app/globals.css

key-decisions:
  - "transition-[opacity,translate] not transition-[opacity,transform] — verified against installed Tailwind 4.3.2 output, translate-y-* compiles to the standalone `translate` CSS property"
  - "useInView's reduced-motion setState-in-effect flagged by react-hooks/set-state-in-effect (new in eslint-config-next 16); suppressed with a scoped eslint-disable-line + rationale comment rather than restructuring into a hydration-unsafe lazy useState initializer"

patterns-established:
  - "Motion class contract locked via unit spec using renderToStaticMarkup (useEffect never runs, so specs assert the exact pre-reveal SSR markup) — same precedent as tests/unit/seo-json-ld.spec.tsx"

requirements-completed: [PERF-01, PERF-03]

coverage:
  - id: D1
    description: "useInView hook: IntersectionObserver-only detection, unobserves after first intersection (no replay), short-circuits to revealed under prefers-reduced-motion with zero observer construction"
    requirement: "PERF-01"
    verification:
      - kind: unit
        ref: "npm run lint (react-hooks rules) + manual grep verification of unobserve/matchMedia/addEventListener counts per plan acceptance criteria — no automated behavioral test of the observer callback itself (jsdom IntersectionObserver not mocked in this spec)"
        status: pass
    human_judgment: true
    rationale: "No unit test exercises the actual IntersectionObserver callback or matchMedia branch (would require jsdom + observer mocking, out of this plan's fast-unit-spec scope per the plan's own acceptance criteria, which rely on grep-based structural checks instead). Behavioral correctness of the reveal-on-scroll trigger is genuinely first exercised by the e2e specs in 09-02/09-03."
  - id: D2
    description: "Reveal component: pre-reveal SSR markup (opacity-0, translate-y-6, data-motion=reveal, no data-revealed) and children passthrough"
    requirement: "PERF-03"
    verification:
      - kind: unit
        ref: "tests/unit/motion-reveal.spec.tsx#Reveal renders the pre-reveal class contract, no data-revealed attribute"
        status: pass
      - kind: unit
        ref: "tests/unit/motion-reveal.spec.tsx#Reveal wraps its children rather than replacing server-rendered output"
        status: pass
    human_judgment: false
  - id: D3
    description: "RevealItem stagger delay: index 0 -> 0ms, index 3 -> 150ms, index 20 -> 400ms (STAGGER_CAP plateau)"
    requirement: "PERF-03"
    verification:
      - kind: unit
        ref: "tests/unit/motion-reveal.spec.tsx#RevealItem index 0/3/20 renders transition-delay:*ms"
        status: pass
    human_judgment: false
  - id: D4
    description: "RevealItem direction prop: start/end emit RTL-mirrored translate-x classes, default up has no x-axis class, className passthrough works"
    requirement: "PERF-03"
    verification:
      - kind: unit
        ref: "tests/unit/motion-reveal.spec.tsx#RevealItem direction=start/end/up/className cases"
        status: pass
    human_judgment: true
    rationale: "Unit spec proves the correct class strings are present in server-rendered markup, but visual RTL mirroring correctness under dir=\"rtl\" (does the slide actually arrive from the right edge in Arabic) is only provable by rendering in a real browser under the ar locale — deferred to the e2e spec in plan 09-03 per the plan's own text (lint:rtl cannot catch a translate-x-* sign mistake)."
  - id: D5
    description: "globals.css: tw-animate-css import ordered after tailwindcss, --animate-float-in token with nested keyframes, @media (scripting: none) no-JS guard"
    requirement: "PERF-01"
    verification:
      - kind: other
        ref: "grep -c checks against globals.css matching every acceptance_criteria line in 09-01-PLAN.md Task 1 (import position, token/keyframe count and nesting, scripting:none rule content) — all passed"
        status: pass
    human_judgment: false

duration: 44min
completed: 2026-07-29
status: complete
---

# Phase 9 Plan 1: Motion Foundation Summary

**IntersectionObserver-based useInView hook plus Reveal/RevealItem client wrappers, tw-animate-css devDependency, and three globals.css additions (float-in keyframes, no-JS guard) that every later Phase 9 plan wires into — zero user-visible change on its own.**

## Performance

- **Duration:** 44 min
- **Started:** 2026-07-29T16:01:00Z (approx, per STATE.md pre-execution timestamp)
- **Completed:** 2026-07-29T16:45:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- `useInView` hook: single IntersectionObserver instance per wrapper, unobserves after first intersection (D-06 no-replay), short-circuits to `inView=true` with zero observer construction under `prefers-reduced-motion: reduce` (D-12)
- `Reveal`/`RevealItem` client wrapper components carrying the exact locked class strings from 09-UI-SPEC, using `transition-[opacity,translate]` (not `transform`) to match Tailwind v4's actual compiled output for `translate-*` utilities
- `RevealItem` stagger: `STAGGER_MS=50`/`STAGGER_CAP=8` giving a 400ms delay plateau for large grids (CAT-03 scalability), plus `direction="start"|"end"` with `rtl:`-mirrored offsets for RTL-safe directional slides (D-10)
- `tw-animate-css` installed and imported in `globals.css`, resolving three already-dead shadcn animation utility sets (`sheet.tsx`, `dropdown-menu.tsx`, `select.tsx`) with a single import line and zero component edits
- `--animate-float-in` theme token + nested `@keyframes float-in` for the WhatsApp button entrance (consumed by plan 09-04) and a `@media (scripting: none)` guard so scripting-disabled agents never see permanently blank reveal-wrapped sections
- 9-assertion unit spec (`tests/unit/motion-reveal.spec.tsx`) locking the pre-reveal SSR class contract, the stagger-cap plateau, and the RTL direction mapping — full vitest suite (19 files, 91 tests) green

## Task Commits

Each task was committed atomically:

1. **Task 1: Add tw-animate-css and the three globals.css motion additions** - `6193f8f` (feat)
2. **Task 2: Create the useInView hook and the Reveal / RevealItem client wrappers** - `3fdcb73` (feat)
3. **Task 3: Lock the motion class contract with a unit spec** - `286525d` (test)

## Files Created/Modified
- `package.json` / `package-lock.json` - `tw-animate-css` devDependency
- `src/app/globals.css` - `@import "tw-animate-css"`, `--animate-float-in` token + nested keyframes, `@media (scripting: none)` no-JS guard
- `src/components/motion/useInView.ts` - IntersectionObserver hook, reduced-motion short-circuit, once-only unobserve
- `src/components/motion/Reveal.tsx` - section-level fade+rise wrapper consumed by `RenderBlocks.tsx` in plan 09-02
- `src/components/motion/RevealItem.tsx` - per-item stagger wrapper consumed by 4 grid blocks + 2 catalog grids in plan 09-03
- `tests/unit/motion-reveal.spec.tsx` - class-contract unit spec (9 assertions)

## Decisions Made
- Kept `transition-[opacity,translate]` exactly as specified in the plan (not `transform`) — verified against the installed Tailwind 4.3.2 compiler output rather than trusting the draft snippet in 09-RESEARCH.md Pattern 2, which used `transform`.
- Suppressed the `react-hooks/set-state-in-effect` ESLint error in `useInView.ts` with a scoped `eslint-disable-line` and rationale comment (matches existing codebase precedent in `BrandMark.tsx`/`json-ld.tsx`) rather than restructuring the reduced-motion check into a `useState` lazy initializer, which would read `window` during the initial client render and cause a hydration mismatch against the server-rendered `opacity-0` markup.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed a new ESLint error (`react-hooks/set-state-in-effect`) introduced by `useInView.ts`**
- **Found during:** Task 2 (Creating the useInView hook)
- **Issue:** `npm run lint` requires exit 0 per the plan's acceptance criteria. The plan's exact specified implementation (`setInView(true)` as the first statement in the reduced-motion branch of the effect) triggers `eslint-plugin-react-hooks`'s `set-state-in-effect` rule, shipped as part of `eslint-config-next@16`'s `core-web-vitals` preset — this rule did not exist when 09-RESEARCH.md/09-PATTERNS.md drafted the reference implementation.
- **Fix:** Added a single-line `// eslint-disable-line react-hooks/set-state-in-effect` with a preceding rationale comment explaining why this specific setState-in-effect has no hydration-safe alternative (window.matchMedia is unavailable during SSR/render; a `useState` lazy initializer would read `window` on the client's first render and diverge from the server-rendered `opacity-0` markup).
- **Files modified:** `src/components/motion/useInView.ts`
- **Verification:** `npm run lint` error count returned to the pre-existing baseline (5 errors, all unrelated/pre-existing in `not-found.tsx` and `RenderBlocks.tsx`) — confirmed by comparing lint output with and without the new files via `git stash`.
- **Committed in:** `3fdcb73` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to satisfy the plan's own `npm run lint` exit-0 acceptance criterion. No scope creep — single-line fix, no behavioral change, no other file touched.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plans 09-02 (Reveal wiring in `RenderBlocks.tsx`), 09-03 (`RevealItem` wiring in grid blocks/catalog grids), and 09-04 (accordion fix, button tap feedback, WhatsApp button entrance) can now import `Reveal`/`RevealItem`/`animate-float-in` directly — all three artifacts exist, compile clean, and are unit-tested.
- No blockers. The `tw-animate-css` import unblocks D-08's mobile-nav/dropdown/select polish with zero additional code in a later plan (already resolved by this plan's single import line).

---
*Phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m*
*Completed: 2026-07-29*

## Self-Check: PASSED

All created files verified present on disk (package.json, src/app/globals.css, src/components/motion/useInView.ts, src/components/motion/Reveal.tsx, src/components/motion/RevealItem.tsx, tests/unit/motion-reveal.spec.tsx). All task commit hashes (6193f8f, 3fdcb73, 286525d) verified present in git log. No missing items.
