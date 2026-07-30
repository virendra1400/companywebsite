---
phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
fixed_at: 2026-07-30T07:21:22Z
review_path: .planning/phases/09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m/09-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 09: Code Review Fix Report

**Fixed at:** 2026-07-30T07:21:22Z
**Source review:** .planning/phases/09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m/09-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (Critical + Warning; Info excluded per `fix_scope: critical_warning`)
- Fixed: 3
- Skipped: 0

## Fixed Issues

### CR-01: RenderBlocks double-wraps FeatureGrid/MediaGallery/ExportProcess/Testimonials in a redundant section-level Reveal, compounding with their own item-level RevealItem

**Files modified:** `src/components/blocks/RenderBlocks.tsx`
**Commit:** be50303
**Applied fix:** Verified via `grep -rl RevealItem src/components/blocks/` that `FeatureGridBlock`, `MediaGalleryBlock`, `ExportProcessBlock`, and `TestimonialsBlock` all wrap their own grid/list items in `RevealItem`. Added an `OWN_ITEM_REVEAL` Set (`hero`, `featureGrid`, `mediaGallery`, `exportProcess`, `testimonials`) alongside the existing hero exclusion and excluded those blockTypes from the outer section-level `Reveal` in `RenderBlocks`, matching the reviewer's suggested fix. This preserves the per-item stagger these blocks were built for (09-03) while eliminating the nested-observer double-fade/translate bug.

### WR-01: CTABandBlock loses its Reveal treatment when rendered outside RenderBlocks (Products/Insights pages)

**Files modified:** `src/app/(site)/[locale]/products/page.tsx`, `src/app/(site)/[locale]/insights/page.tsx`
**Commit:** 7586072
**Applied fix:** Confirmed both pages call `CTABandBlock` directly (hand-built pages, not CMS `Page` layouts routed through `RenderBlocks`) with no `Reveal` wrapper. Imported `Reveal` from `@/components/motion/Reveal` and wrapped the direct `CTABandBlock` call site in both files, matching the treatment every CMS `Page`'s `ctaBand` block already gets automatically.

### WR-02: Redundant/dead `key` prop after Reveal wrapping in RenderBlocks

**Files modified:** `src/components/blocks/RenderBlocks.tsx`
**Commit:** bd5ff45
**Applied fix:** Restructured the two branches so `key` is only ever set on the element that is actually the direct child of the `.map()` array: `<Component key={key} .../>` when returned bare (blocks in `OWN_ITEM_REVEAL`), or `<Reveal key={key}>` when `Component` is wrapped (no longer carries its own now-dead `key`). Applied after CR-01's edit landed, since both findings touch the same function.

## Verification Notes

Tier 2 syntax/type verification initially produced a false pass: `npx tsc` inside the isolated git worktree silently failed to resolve (`npx` fetch prompt, not the project's installed `tsc`) because `node_modules` isn't tracked by git and therefore absent in a fresh worktree. Caught by re-running with an explicit exit-code/output check rather than trusting an empty `grep` match on a failed command's output. Fixed by symlinking the main repo's `node_modules` into the worktree for verification purposes only (removed before handoff — never committed). With that in place: `tsc --noEmit -p tsconfig.json` returns 0 errors project-wide, and `vitest run tests/unit/motion-reveal.spec.tsx tests/int/blocks-placeholder.spec.ts` passes 22/22 (both suites render `Reveal`/`RevealItem` and the four affected block components directly, so they remain green under the RenderBlocks-level fix, which doesn't touch their own markup).

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-07-30T07:21:22Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
