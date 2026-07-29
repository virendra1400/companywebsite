---
phase: 08-component-polish-pass-apply-amended-design-system-across-car
plan: 02
subsystem: ui
tags: [tailwind-v4, cva, button, design-system, shadcn]

# Dependency graph
requires:
  - phase: 08-component-polish-pass-apply-amended-design-system-across-car
    provides: "08-01's card-recipe/tabular-nums convergence pattern (same phase, same consolidation methodology)"
provides:
  - "buttonVariants base cva carries the sitewide full-opacity accent focus ring as its own default"
  - "buttonVariants default variant carries the real brand hover (bg-primary-500) as its own default"
  - "New outlineOnDark Button variant with an explicit transparent resting background for dark-surface secondary CTAs"
  - "All 8 Contract §4 Button call sites reduced to call-site-specific classes only"
affects: ["08-04 (Wave 2 live-render backstop checkpoint for outlineOnDark + focus-ring visibility)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Component-owned defaults over call-site overrides: shared treatments repeated across call sites move into the primitive's own cva, not into per-call-site className strings (mirrors the button.tsx vs card.tsx pass-through distinction from Contract §4)"

key-files:
  created: []
  modified:
    - src/components/ui/button.tsx
    - src/components/blocks/HeroBlock.tsx
    - src/components/blocks/CTABandBlock.tsx
    - src/components/chrome/GlobalHeader.tsx
    - src/components/chrome/MobileNavPanel.tsx
    - "src/app/(site)/[locale]/products/[slug]/page.tsx"

key-decisions:
  - "outlineOnDark added as a genuinely new variant (2 real consumers: Hero + CTA band secondary CTAs) rather than reusing/mutating the existing outline variant, preserving the light-surface outline variant untouched"
  - "GlobalHeader's outline-on-light WhatsApp treatment deliberately NOT generalized into a variant (single consumer) — kept as a call-site override per Contract §4"
  - "WhatsAppFloatingButton.tsx and card/thumbnail components explicitly out of scope — not Button consumers or single-use overrides that don't warrant generalization"

patterns-established:
  - "Contract-driven class-string diffs applied verbatim from 08-UI-SPEC, with grep-count acceptance gates asserting both presence of new treatment and absence of old (pre/post) across exact file scope"

requirements-completed: [POLISH-06, POLISH-07, POLISH-08]

coverage:
  - id: D1
    description: "buttonVariants base cva ring segment consolidated to full-opacity accent (focus-visible:ring-accent-600), replacing the token-opacity focus-visible:ring-ring/50 that call sites previously overrode 6x"
    requirement: POLISH-07
    verification:
      - kind: unit
        ref: "grep -Fc 'focus-visible:ring-[3px] focus-visible:ring-accent-600' src/components/ui/button.tsx"
        status: pass
      - kind: unit
        ref: "npm run typecheck"
        status: pass
    human_judgment: true
    rationale: "Grep proves the class string landed; actual rendered ring color/visibility on keyboard Tab requires a live-render check, deferred to the Wave 2 (08-04) blocking human-verify checkpoint per the plan's own backstop."
  - id: D2
    description: "buttonVariants default variant hover consolidated to the real brand ramp value bg-primary-500, replacing the token-opacity hover:bg-primary/90 previously overridden 5x at call sites"
    requirement: POLISH-06
    verification:
      - kind: unit
        ref: "grep -Fc 'bg-primary text-primary-foreground hover:bg-primary-500' src/components/ui/button.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "New outlineOnDark variant (border border-white bg-transparent text-white hover:bg-white/10) added; both dark-surface secondary CTAs (Hero, CTA band) switched to it, replacing hand-rolled outline+className overrides"
    requirement: POLISH-08
    verification:
      - kind: unit
        ref: "grep -Fc 'variant=\"outlineOnDark\"' src/components/blocks/HeroBlock.tsx and src/components/blocks/CTABandBlock.tsx (both 1); grep -Fc 'variant=\"outline\"' on same files (both 0)"
        status: pass
      - kind: unit
        ref: "npm run typecheck (proves outlineOnDark type-checks in the VariantProps union at both call sites)"
        status: pass
    human_judgment: true
    rationale: "Grep/typecheck prove the variant is wired and the fragile override pattern is gone; whether the hero photo/gradient actually shows through a genuinely transparent interior (vs. an opaque panel) is a visual property requiring the Wave 2 (08-04) live-render backstop."
  - id: D4
    description: "All 8 Contract §4 call sites (HeroBlock x2, CTABandBlock x2, GlobalHeader x2, MobileNavPanel x1, product detail page x1) reduced to call-site-specific classes only; GlobalHeader's single-use outline-on-light WhatsApp treatment and WhatsAppFloatingButton.tsx left untouched"
    requirement: POLISH-06
    verification:
      - kind: unit
        ref: "file-scoped grep gates (hover/ring literal counts = 0 across 5 files; border-primary-700 = 1 in GlobalHeader; size=sm + hidden sm:inline-flex = 1; className=mt-lg = 1; w-full = 1 in MobileNavPanel; git diff --stat on WhatsAppFloatingButton.tsx = empty)"
        status: pass
      - kind: unit
        ref: "npm run typecheck, npm run lint:rtl"
        status: pass
      - kind: integration
        ref: "npm test (18 files, 80 tests)"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-07-29
status: complete
---

# Phase 08 Plan 02: Button Primitive Consolidation Summary

**Consolidated three duplicated Button treatments (brand hover, accent focus ring, dark-surface outline) from 8 call sites into `buttonVariants` itself, adding a new `outlineOnDark` variant with an explicit transparent background.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-29T00:20:00Z
- **Completed:** 2026-07-29T00:32:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- `buttonVariants` base cva now carries the full-opacity accent focus ring (`focus-visible:ring-accent-600`) as its own default, replacing a treatment previously repeated as a className override at 6 call sites
- `buttonVariants` `default` variant now carries the real brand hover (`hover:bg-primary-500`) as its own default, replacing a treatment previously repeated at 5 call sites
- New `outlineOnDark` variant (`border border-white bg-transparent text-white hover:bg-white/10`) added with an explicit transparent resting background; both dark-surface secondary CTAs (HeroBlock, CTABandBlock) now use it instead of hand-rolled `variant="outline"` + className overrides
- All 8 Contract §4 call sites reduced to only their genuinely call-site-specific classes (size, width, margin, responsive visibility); GlobalHeader's single-use outline-on-light WhatsApp treatment deliberately preserved as a call-site override, not generalized into a variant

## Task Commits

Each task was committed atomically:

1. **Task 1: Consolidate the three treatments into buttonVariants** - `a1b2bbc` (feat)
2. **Task 2: Strip the now-redundant overrides from all 8 call sites** - `309cfe9` (refactor)

**Plan metadata:** (final docs commit follows this Summary)

## Files Created/Modified
- `src/components/ui/button.tsx` - Base cva ring consolidated to accent-600; default variant hover baked to primary-500; new outlineOnDark variant added
- `src/components/blocks/HeroBlock.tsx` - Primary CTA bare `<Button>`; secondary CTA on `variant="outlineOnDark"`
- `src/components/blocks/CTABandBlock.tsx` - Primary CTA bare `<Button>`; secondary CTA on `variant="outlineOnDark"`
- `src/components/chrome/GlobalHeader.tsx` - Quote CTA reduced to `size="sm"` + responsive visibility; WhatsAppCta className stripped of redundant ring, keeping its unique outline-on-light treatment
- `src/components/chrome/MobileNavPanel.tsx` - Quote CTA reduced to bare `<Button asChild>`
- `src/app/(site)/[locale]/products/[slug]/page.tsx` - RFQ CTA reduced to `className="mt-lg"` only

## Decisions Made
- `outlineOnDark` added as a new named variant (2 real consumers) rather than mutating the existing `outline` variant, per Contract §4's explicit authorization — the light-surface `outline` variant is untouched and still used by `WhatsAppCta`/`GlobalHeader`.
- GlobalHeader's outline-on-light WhatsApp button styling stays a call-site override (single use) — not generalized, per YAGNI and the plan's explicit instruction.
- `WhatsAppFloatingButton.tsx` (a raw `<a>`, not a `<Button>`) and card/thumbnail accent rings (`ProductCard`, `InsightCard`, `ProductGallery`) left untouched — confirmed out of Contract §4's 8-call-site scope.

## Deviations from Plan

None - plan executed exactly as written. All grep-count acceptance gates, `npm run typecheck`, `npm run lint:rtl`, and `npm test` passed on first attempt for both tasks.

`npm run lint` reported the same 5 pre-existing errors already logged in this phase's `deferred-items.md` from plan 08-01 (`insights/not-found.tsx` `<a>`-vs-`Link` x4, `RenderBlocks.tsx` `no-explicit-any` x1) — confirmed unrelated to this plan's files, not re-logged as a new deviation.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The base primitive and all 8 call sites are consolidated and type-safe; no visual regression is provable from source alone.
- Per this plan's own `<verification>` backstop, live-render confirmation of (a) `outlineOnDark`'s genuinely transparent interior on both dark-surface CTAs and (b) a visible gold focus ring on keyboard Tab across all 8 buttons is queued as a blocking human-verify checkpoint in **08-04 (Wave 2)** — this plan is not sign-off-complete on source greps alone.

---
*Phase: 08-component-polish-pass-apply-amended-design-system-across-car*
*Completed: 2026-07-29*

## Self-Check: PASSED

All 6 modified files found on disk; both task commits (`a1b2bbc`, `309cfe9`) verified present in git log.
