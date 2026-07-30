---
phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
plan: 02
subsystem: ui
tags: [motion, reveal, intersection-observer, playwright, reduced-motion, tailwind-v4]

requires:
  - phase: 09-01
    provides: useInView hook, Reveal/RevealItem client wrappers, tw-animate-css import, data-motion/data-revealed DOM contract
provides:
  - RenderBlocks.tsx wires every non-hero CMS block through Reveal at a single dispatch site
  - Hero block explicitly excluded from Reveal via blockType === "hero" short-circuit (D-07 LCP guard)
  - tests/e2e/reduced-motion.spec.ts proving D-06 zero-replay, D-07 hero exception, D-08 tw-animate-css resolution, D-12 reduced-motion contracts
  - Fixed Reveal.tsx bug where motion-reduce:transition-none left transitionDuration non-zero under prefers-reduced-motion
affects: [09-03, 09-04]

tech-stack:
  added: []
  patterns:
    - "RenderBlocks single wrap-site pattern: build `rendered` once, short-circuit blockType === 'hero' to return unwrapped, otherwise wrap in <Reveal>"
    - "e2e reduced-motion assertions read getComputedStyle().translate/transitionProperty, never .transform (Tailwind v4 emits standalone translate property)"

key-files:
  created:
    - tests/e2e/reduced-motion.spec.ts
  modified:
    - src/components/blocks/RenderBlocks.tsx
    - src/components/motion/Reveal.tsx

key-decisions:
  - "Reveal.tsx's motion-reduce:transition-none only zeroes transition-property, not transition-duration, so getComputedStyle().transitionDuration still read 0.6s under prefers-reduced-motion — fixed by swapping to motion-reduce:duration-0 (Rule 1 auto-fix, discovered while writing the e2e assertion the plan required)"
  - "Test 2 strengthened with a static transitionProperty assertion (must contain 'translate', not 'transform') since the originally-planned final-state-only assertions would pass even with an inverted, non-transitioning property list"

requirements-completed: [PERF-01]

coverage:
  - id: D1
    description: "Every non-hero CMS block is wrapped in a Reveal boundary at a single RenderBlocks dispatch site; hero is explicitly excluded via blockType check"
    requirement: "PERF-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/reduced-motion.spec.ts#hero is never gated behind Reveal (LCP exception, D-07)"
        status: pass
      - kind: unit
        ref: "npm run typecheck"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reduced motion yields fully visible content with 0s transition duration"
    requirement: "PERF-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/reduced-motion.spec.ts#reduced motion: below-the-fold content is visible immediately, no transition"
        status: pass
    human_judgment: false
  - id: D3
    description: "No-preference reveal starts hidden, transitions the translate property (not transform), and never replays after scroll-away-and-back"
    requirement: "PERF-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/reduced-motion.spec.ts#no preference: below-the-fold content is hidden until scrolled, then reveals"
        status: pass
      - kind: e2e
        ref: "tests/e2e/reduced-motion.spec.ts#zero replay: a revealed section never returns to hidden after scrolling away and back"
        status: pass
    human_judgment: false
  - id: D4
    description: "tw-animate-css import resolves real keyframes, closing D-08 mobile-nav polish without touching chrome components"
    requirement: "PERF-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/reduced-motion.spec.ts#tw-animate-css resolves real keyframes (unblocks D-08 mobile-nav polish)"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-07-29
status: complete
---

# Phase 9 Plan 2: RenderBlocks Reveal Wiring + Reduced-Motion E2E Contract Summary

**Wired every non-hero CMS block through a single `<Reveal>` dispatch site in `RenderBlocks.tsx`, and proved the D-06/D-07/D-08/D-12 motion contracts with a 5-test Playwright spec — catching and fixing a real Reveal bug where reduced-motion left the transition duration non-zero.**

## Performance

- **Duration:** ~50 min
- **Started:** 2026-07-29T22:17:08+05:30 (branch base)
- **Completed:** 2026-07-29T23:05:27+05:30
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- `RenderBlocks.tsx` wraps every non-hero block in `Reveal` at exactly one dispatch site — no per-block opt-in list, matching D-07's uniform-reveal requirement
- Hero block short-circuits explicitly on `blockType === "hero"`, never gated behind a scroll-triggered observer (LCP-safe)
- `tests/e2e/reduced-motion.spec.ts` proves: reduced-motion visibility + 0s transition duration, no-preference hidden-then-revealed with a real `translate`-property transition check, zero-replay after scroll-away-and-back, hero's Reveal-ancestor-free LCP exception, and `tw-animate-css` keyframe resolution
- Found and fixed a real bug in `Reveal.tsx` (created in 09-01): `motion-reduce:transition-none` only clears `transition-property`, not `transition-duration`, so the computed duration stayed `0.6s` under `prefers-reduced-motion: reduce` — violates D-12. Swapped for `motion-reduce:duration-0`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wrap every non-hero block in Reveal inside the RenderBlocks dispatch loop** - `ce67bad` (feat)
2. **Task 2: Add tests/e2e/reduced-motion.spec.ts covering reduced-motion, zero-replay and hero-exception contracts** - `e5907f9` (test, includes the Rule 1 Reveal.tsx fix)

**Plan metadata:** committed alongside this SUMMARY (see final commit).

## Files Created/Modified
- `src/components/blocks/RenderBlocks.tsx` - single `<Reveal>` wrap site in the block dispatch loop, hero excluded via explicit `blockType` check (D-07)
- `tests/e2e/reduced-motion.spec.ts` - 5-test Playwright spec covering reduced-motion, no-preference, zero-replay, hero exception, tw-animate-css resolution
- `src/components/motion/Reveal.tsx` - `motion-reduce:transition-none` → `motion-reduce:duration-0` so `transitionDuration` genuinely reads `0s` under reduced motion

## Decisions Made
- Matched `RenderBlocks.tsx`'s target pattern verbatim from `09-PATTERNS.md` (build `rendered` once with its own key, short-circuit on hero, wrap everything else in `Reveal` with the key moved to the wrapper) rather than inventing a different shape.
- Added a static `transitionProperty` assertion to test 2 (must contain `"translate"`, must not contain `"transform"`) because the plan-specified final-state-only assertions (opacity 0 → 1) would pass unchanged even if the underlying `Reveal` implementation transitioned the wrong CSS property — the acceptance criteria explicitly required this inversion to make the spec fail, so the spec needed a check that actually depends on the property list.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Reveal.tsx computed transition-duration under prefers-reduced-motion**
- **Found during:** Task 2, while implementing the reduced-motion e2e test that asserts `getComputedStyle(el).transitionDuration === "0s"`
- **Issue:** `Reveal.tsx` (created in plan 09-01) used `motion-reduce:transition-none`, which Tailwind compiles to `transition-property: none` only — it does not reset `transition-duration`. Under `prefers-reduced-motion: reduce` the computed `transitionDuration` still read `0.6s`, violating the D-12 contract this plan's `must_haves.truths` requires ("computed transition-duration is 0s").
- **Fix:** Swapped `motion-reduce:transition-none` for `motion-reduce:duration-0` in `Reveal.tsx`'s className. Content already snaps to its final `opacity-100`/`translate-y-0` state via the existing `motion-reduce:` utilities; zeroing duration makes that snap instant and the computed style now genuinely reads `0s`.
- **Files modified:** `src/components/motion/Reveal.tsx`
- **Verification:** `tests/e2e/reduced-motion.spec.ts` first reduced-motion test failed before the fix (`Expected: "0s", Received: "0.6s"`) and passed after. Full 9-test suite (5 reduced-motion + 4 homepage) green after the fix; `npm run typecheck`, `npm run lint:rtl`, `npm run test` (91/91) all clean.
- **Committed in:** `e5907f9` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug, in a 09-01-created file touched only to satisfy this plan's explicit acceptance criteria)
**Impact on plan:** Necessary for the plan's own e2e spec to be a real gate rather than passing vacuously. No scope creep — `RenderBlocks.tsx`'s `sectionBg`, `BLOCK_MAP`, and every block component's Server Component status were left untouched exactly as directed.

## Issues Encountered
- The worktree had no `.env`/sqlite `payload.db` (both gitignored, not synced into worktrees). Copied the main checkout's local-dev `.env` (placeholder `PAYLOAD_SECRET`, sqlite `DATABASE_URI`) and seeded `payload.db` into the worktree so `npm run dev`/Playwright's `webServer` could boot. Neither file is tracked by git — no risk of committing them.
- First Playwright run hit stray leftover `next dev` processes from an earlier interrupted attempt binding the same port, causing flaky/missing-element failures; killed the stale processes before the verified runs below.
- Per acceptance criteria, spot-checked both required test inversions locally (`transition-[opacity,transform]` in `Reveal.tsx`, and removing the `blockType === "hero"` short-circuit in `RenderBlocks.tsx`) — each made its target test fail as required — then restored both files to their correct state before committing.
- Pre-existing, unrelated `npm run lint` failures noted but not touched (out of scope per deviation rule scope boundary): 4 `@next/next/no-html-link-for-pages` errors in `src/app/(site)/[locale]/insights/not-found.tsx`, and 1 pre-existing `@typescript-eslint/no-explicit-any` on `RenderBlocks.tsx`'s `BLOCK_MAP` type declaration (present before this plan touched the file; the plan explicitly directs leaving `BLOCK_MAP` untouched). `npm run typecheck`, `npm run lint:rtl`, and `npm run test` are all clean. `npm run lint` was already failing on `main` before this plan ran.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 09-03 (per-item `RevealItem` stagger in grid blocks) can build directly on this plan's confirmed `Reveal`/`data-motion`/`data-revealed` contract.
- 09-04 (accordion + button `:active` polish, `tests/e2e/contact.spec.ts`) is unblocked — this plan intentionally left accordion/button assertions out of `reduced-motion.spec.ts` to avoid file contention within the same wave.
- Known pre-existing `npm run lint` errors (see Issues Encountered) remain outstanding and unrelated to this plan; flagging for whichever future plan/cleanup pass owns lint hygiene.

## Self-Check: PASSED

- FOUND: src/components/blocks/RenderBlocks.tsx
- FOUND: tests/e2e/reduced-motion.spec.ts
- FOUND: src/components/motion/Reveal.tsx
- FOUND: .planning/phases/09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m/09-02-SUMMARY.md
- FOUND commit: ce67bad
- FOUND commit: e5907f9
- FOUND commit: 025a3d7

---
*Phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m*
*Completed: 2026-07-29*
