---
phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
verified: 2026-07-30T13:35:00Z
status: passed
score: 22/22 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 09: Motion and Micro-interactions — Verification Report

**Phase Goal:** Tasteful reveal/stagger/hover/section transitions across the site; prefers-reduced-motion respected; RTL-safe; zero CLS/LCP regression.
**Verified:** 2026-07-30T13:35:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Consolidated from all 5 plans' `must_haves.truths` (ROADMAP.md carries no separate Success Criteria list for Phase 9 beyond the goal statement — Option C fallback was not needed since PLAN frontmatter already supplied a full must-haves set).

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Reveal renders hidden on first paint (opacity-0 + translate-y-6), transitions only opacity/translate | VERIFIED | `src/components/motion/Reveal.tsx` — read directly, matches spec exactly |
| 2 | Reduced motion: `useInView` reports in-view immediately, attaches no observer | VERIFIED | `src/components/motion/useInView.ts` source + `tests/e2e/reduced-motion.spec.ts` test 1 re-run live: PASS |
| 3 | A revealed element never re-hides (unobserve after first intersection) | VERIFIED | `useInView.ts` calls `observer.unobserve(el)`; `reduced-motion.spec.ts` "zero replay" test re-run live: PASS |
| 4 | Stagger delay plateaus at 400ms (8 × 50ms) | VERIFIED | `RevealItem.tsx` `STAGGER_MS=50`/`STAGGER_CAP=8`; `tests/unit/motion-reveal.spec.tsx` asserts the plateau — full vitest run 91/91 pass, re-run live |
| 5 | Single item reveals at 0ms delay | VERIFIED | Same unit spec, index-0 case, re-run live (91/91 pass) |
| 6 | `direction="start"` emits both `-translate-x-4` and `rtl:translate-x-4` | VERIFIED | `RevealItem.tsx` source; `tests/e2e/rtl-arabic.spec.ts` sign-flip assertions (negative under LTR, positive under RTL) re-run live: PASS |
| 7 | No scroll event listener anywhere in motion code | VERIFIED | `grep -rn addEventListener src/components/motion/` → 0 matches; IntersectionObserver only |
| 8 | Every non-hero CMS block wrapped in Reveal uniformly, no per-block opt-in list — except hero (LCP) and the 4 blocks that own their own item-level stagger (post-review fix) | VERIFIED | `src/components/blocks/RenderBlocks.tsx` current source — `OWN_ITEM_REVEAL` set + single `<Reveal>` wrap site |
| 9 | Hero never wrapped in Reveal, paints immediately | VERIFIED | `reduced-motion.spec.ts` "hero is never gated" test re-run live: PASS |
| 10 | Populated content gets fade+rise reveal; reduced motion yields opacity 1 / `transitionDuration: 0s` | VERIFIED | `reduced-motion.spec.ts` tests 1–2 re-run live: PASS |
| 11 | Previously-dead shadcn animation utilities (`animate-in`/`fade-in-0`/etc.) now resolve to real keyframes (D-08) | VERIFIED | `globals.css` line 2 `@import "tw-animate-css"`; `reduced-motion.spec.ts` "tw-animate-css resolves" test re-run live: PASS |
| 12 | Existing block components remain async Server Components, none gains `"use client"` | VERIFIED | `grep -rc '"use client"' src/components/blocks/*.tsx` → all 0 |
| 13 | Grid items in FeatureGrid/Testimonials/MediaGallery/ExportProcess + product/insight catalog grids stagger 50ms/item | VERIFIED | `grep -c RevealItem` on all 6 target files — present; source read on `FeatureGridBlock.tsx`/`ExportProcessBlock.tsx` confirms wiring |
| 14 | Per-item delay plateaus at 400ms after 8th item in large grids | VERIFIED | Same `STAGGER_CAP` constant shared by all call sites (single source in `RevealItem.tsx`) |
| 15 | Equal-height card rows preserved after `RevealItem` wrapper (FeatureGrid/Testimonials) | VERIFIED | `grep -c h-full` = 2 in both `FeatureGridBlock.tsx` and `TestimonialsBlock.tsx` (wrapper + card pair) |
| 16 | ExportProcess steps slide from inline-start edge, mirror under `dir=rtl` | VERIFIED | `ExportProcessBlock.tsx` uses `direction="start"`; `rtl-arabic.spec.ts` 4 directional tests re-run live on `en`+`ar` projects: 22/22 PASS |
| 17 | `lint:rtl` stays green — no physical-direction utility introduced | VERIFIED | `npm run lint:rtl` re-run live: "RTL guard: no physical-direction classes under src/." exit 0 |
| 18 | FAQ accordion animates open AND close via `grid-template-rows`, `forceMount`, closed-state removed from a11y tree | VERIFIED | `src/components/ui/accordion.tsx` read directly — matches spec (`forceMount`, `grid-rows-[0fr]`/`grid-rows-[1fr]`, `data-[state=closed]:invisible`); `tests/e2e/contact.spec.ts` accordion test re-run live: PASS |
| 19 | Every Button scales to 0.98 while pressed, from a single `buttonVariants` base cva edit site, suppressed under reduced motion | VERIFIED | `button.tsx` line 8: `active:scale-[0.98] motion-reduce:active:scale-100`; `contact.spec.ts` tap-feedback test re-run live: PASS |
| 20 | Floating WhatsApp button: one-shot entrance + hover lift, stays a Server Component with no observer | VERIFIED | `WhatsAppFloatingButton.tsx` — `animate-float-in`/`hover:scale-105` present, no `"use client"`, no `useInView` import |
| 21 | Product/insight cards lift 2px + image scales on hover, instant under reduced motion | VERIFIED | `ProductCard.tsx`/`InsightCard.tsx` — `-translate-y-[2px]` (×2 each: hover + focus-visible) and `group-hover:scale-[1.03]` confirmed present |
| 22 | CLS at/near zero, LCP unchanged on the most block-dense page after sitewide reveal wrapping | VERIFIED | 09-05 blocking human checkpoint (already completed, not re-litigated here): Lighthouse mobile on `/products` — CLS 0 (score 1), LCP 2.1s (score 0.96), reported with concrete numbers, zero defects across all 9 verification steps in both `en`/`ar` |

**Score:** 22/22 truths verified (0 present-but-behavior-unverified)

### Code-Review Fix Confirmation (explicit task ask)

09-REVIEW.md found one CRITICAL (CR-01: `RenderBlocks.tsx` double-wrapped `FeatureGrid`/`MediaGallery`/`ExportProcess`/`Testimonials` in both a section-level `Reveal` and their own item-level `RevealItem`, compounding opacity/translate) and two WARNINGs (WR-01: `CTABandBlock` un-revealed on Products/Insights pages; WR-02: dead `key` prop). 09-REVIEW-FIX.md claims all three fixed in commits `be50303`/`7586072`/`bd5ff45`.

| Check | Result |
|-------|--------|
| Commits `be50303`, `7586072`, `bd5ff45` present in `git log` | CONFIRMED (`git log --oneline` shows all three, in that order, immediately after the Wave-2 merge) |
| `RenderBlocks.tsx` current source matches the CR-01 fix (OWN_ITEM_REVEAL set excludes hero + the 4 blocks with own stagger from the outer Reveal) | CONFIRMED — read directly, matches reviewer's suggested fix verbatim, plus the WR-02 key-placement cleanup |
| `products/page.tsx` / `insights/page.tsx` wrap the direct `CTABandBlock` call in `Reveal` (WR-01) | CONFIRMED — both files import `Reveal` and wrap `<CTABandBlock>` |
| Regression suite (homepage.spec.ts + rtl-arabic.spec.ts, both `en`+`ar` projects) re-passes on the fixed tree | CONFIRMED — re-ran live in this verification, freshly: **22/22 passed** (matches the reapplied-worktree claim in 09-REVIEW-FIX.md, independently reproduced, not trusted from narration) |
| Full merged-tree gate suite still green after the fix | CONFIRMED — `npm run typecheck` exit 0, `npm run lint:rtl` exit 0, `npm run test` 19 files/91 tests pass, plus live re-runs of `reduced-motion.spec.ts` (5/5) and `contact.spec.ts` (7/7) |

No regression from the review-fix pass. CR-01's root cause (nested independently-triggered observers with compounding opacity/translate) is gone in the current tree.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/motion/useInView.ts` | IntersectionObserver hook, reduced-motion short-circuit, once-only unobserve | VERIFIED | Present, matches spec |
| `src/components/motion/Reveal.tsx` | Section-level fade+rise wrapper | VERIFIED | Present, matches spec (incl. 09-02's `motion-reduce:duration-0` bugfix) |
| `src/components/motion/RevealItem.tsx` | Per-item stagger wrapper, direction-aware | VERIFIED | Present, matches spec |
| `src/app/globals.css` motion additions | `@import "tw-animate-css"`, `--animate-float-in` token+keyframes, `@media (scripting: none)` guard | VERIFIED | All 3 present at expected lines |
| `tests/unit/motion-reveal.spec.tsx` | Class-contract unit spec | VERIFIED | Present, part of the 91/91 passing vitest run |
| `tests/e2e/reduced-motion.spec.ts` | D-06/D-07/D-08/D-12 e2e proof | VERIFIED | Present, 5/5 pass (re-run live) |
| `tests/e2e/rtl-arabic.spec.ts` directional additions | Class-attribute + CSS-probe mirroring proof | VERIFIED | Present, re-run live on en+ar: pass |
| `tests/e2e/contact.spec.ts` accordion + tap-feedback additions | e2e a11y + tap-feedback proof | VERIFIED | Present, 7/7 pass (re-run live) |
| `src/components/ui/accordion.tsx` | `grid-template-rows` open/close + a11y guard | VERIFIED | Read directly, matches spec |
| `src/components/ui/button.tsx` | `active:scale-[0.98]` in base cva | VERIFIED | Single edit site confirmed |
| `src/components/chrome/WhatsAppFloatingButton.tsx` | entrance + hover, still Server Component | VERIFIED | Confirmed, no client directive |
| `ProductCard.tsx`/`InsightCard.tsx` | 2px lift + image scale | VERIFIED | Confirmed |
| `09-05-SUMMARY.md` | Merged-tree verification + human sign-off | VERIFIED | Present, contains D-01..D-13 evidence table and Lighthouse figures |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `RenderBlocks.tsx` dispatch loop | `Reveal` | single wrap site, hero + own-item-reveal blocks excluded | WIRED | Confirmed post-CR-01-fix |
| `globals.css --animate-float-in` | `WhatsAppFloatingButton.tsx` | `animate-float-in` utility class | WIRED | Class present in component, token present in CSS |
| `globals.css @import "tw-animate-css"` | `sheet.tsx`/`dropdown-menu.tsx`/`select.tsx` dead classes | resolves `animate-in`/`fade-in-0`/etc. | WIRED | e2e probe confirms `animationName !== "none"` |
| Grid block `.map()` item | `RevealItem index` prop | drives `transitionDelay` | WIRED | Confirmed in FeatureGrid/ExportProcess source |
| `ExportProcessBlock` step | `RevealItem direction="start"` | `rtl:` variant → Arabic mirroring | WIRED | e2e sign-flip assertions pass both directions |
| `RevealItem className` passthrough | `h-full` → Card `h-full` | equal-height rows | WIRED | grep counts confirm both files |

### Behavioral Spot-Checks / Live Regression Re-runs (performed in this verification, not trusted from SUMMARY narration)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full typecheck on current tree | `npm run typecheck` | exit 0 | PASS |
| RTL lint guard | `npm run lint:rtl` | "RTL guard: no physical-direction classes under src/." exit 0 | PASS |
| Full vitest suite | `npm run test` | 19 files / 91 tests passed | PASS |
| homepage.spec.ts + rtl-arabic.spec.ts, en+ar | `npx playwright test tests/e2e/homepage.spec.ts tests/e2e/rtl-arabic.spec.ts --project=en --project=ar` | 22 passed | PASS |
| reduced-motion.spec.ts, en | `npx playwright test tests/e2e/reduced-motion.spec.ts --project=en` | 5 passed | PASS |
| contact.spec.ts, en | `npx playwright test tests/e2e/contact.spec.ts --project=en` | 7 passed | PASS |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PERF-01 | 09-01, 09-02, 09-03, 09-04, 09-05 | Good CWV on key pages | SATISFIED | CLS 0 / LCP 2.1s reported (09-05 human checkpoint); transform/opacity-only motion, IntersectionObserver-only detection confirmed in source |
| PERF-03 | 09-01, 09-03, 09-05 | Cross-locale RTL/LTR QA pass | SATISFIED | `rtl-arabic.spec.ts` directional-mirroring assertions pass on both `en`/`ar`; `lint:rtl` green; human confirmed Arabic mirroring in step 7 of the 09-05 checkpoint |

**Traceability note:** `.planning/REQUIREMENTS.md`'s formal traceability table maps PERF-01/PERF-03 to "Phase 6 / Complete" — this is a v1-milestone artifact predating the v2.0 redesign. Every Phase 9 plan's frontmatter and ROADMAP.md's Phase 9 entry both explicitly document this as expected ("no v1 requirement IDs map to this v2.0 redesign phase; cross-cutting instead"). Not an orphan — this is the documented, intentional state, consistently recorded in three independent places (ROADMAP.md, REQUIREMENTS.md, every PLAN.md frontmatter).

### Anti-Patterns Found

None blocking. Scanned all 20 files from 09-REVIEW.md's `files_reviewed_list` plus this verification's own reads for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`placeholder` markers — none found in source files (motion primitives, RenderBlocks, grid blocks, accordion, button, WhatsApp button, cards). No empty implementations, no hardcoded-empty stub data.

**Info (non-blocking, carried forward from 09-REVIEW.md IN-01):** `Reveal` (24px/600ms) and `RevealItem` (16px/500ms) use different offset magnitudes as two intentional design tiers, but the two files don't cross-reference each other's magic numbers in comments. Cosmetic; no functional risk.

**Info (this verification's own finding, non-blocking):** 09-REVIEW.md explicitly suggested adding "an e2e/unit assertion that a `Page` containing one of these blocks never renders a `[data-motion="reveal-item"]` nested inside a `[data-motion="reveal"]`" as a regression guard for CR-01. No such dedicated assertion exists in the current test suite — the fix is structurally verified correct by direct source reading (`OWN_ITEM_REVEAL` set) and by the full e2e suite passing, but a future edit to `RenderBlocks.tsx` could silently reintroduce the double-wrap without a test failing to catch it specifically. Not a phase-goal blocker since the current codebase is correct; worth a one-line follow-up (e.g., in Phase 10) rather than reopening this phase.

### Human Verification Required

None outstanding. The phase's one inherently-human item (motion "feel"/register, CLS/LCP Lighthouse numbers, Arabic mirroring judgment) was already run as a blocking `checkpoint:human-verify` gate in 09-05 Task 2, with the human's response recorded verbatim in `09-05-SUMMARY.md`: all nine `<how-to-verify>` steps answered, zero defects, concrete Lighthouse figures (CLS 0, LCP 2.1s). Re-litigating an already-completed, evidence-backed human checkpoint is not this verification's job — its job is confirming that checkpoint's evidence is real and the code hasn't drifted since, which it has not (fresh re-runs above all pass).

### Gaps Summary

No gaps. All 22 must-haves verified against the current codebase, not inferred from SUMMARY claims. The one CRITICAL code-review finding (CR-01) plus its two associated WARNINGs were confirmed fixed by direct source inspection and a fresh, independent re-run of the regression suite (22/22 homepage+rtl-arabic tests, plus 5/5 reduced-motion and 7/7 contact tests) — not by trusting 09-REVIEW-FIX.md's narration. Two non-blocking informational notes are carried forward for awareness (no shared-constant comment between Reveal/RevealItem offsets; no dedicated regression test for the CR-01 nesting bug specifically) but neither blocks phase goal achievement.

---

_Verified: 2026-07-30T13:35:00Z_
_Verifier: Claude (gsd-verifier)_
