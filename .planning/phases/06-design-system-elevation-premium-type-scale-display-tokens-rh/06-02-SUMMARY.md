---
phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh
plan: 02
subsystem: ui
tags: [tailwind-v4, css-theme, rtl, design-tokens, cards]

requires:
  - phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh
    plan: "06-01"
    provides: "spacing-4xl (96px), radius-card (10px), shadow-card / shadow-card-hover @theme tokens this plan applies"
provides:
  - "9 CMS block wrappers (CTABandBlock, ContactBlockView, CertStripBlock, DocumentCardBlock, FeatureGridBlock, MediaGalleryBlock, ExportMapBlock, RichTextBlock, StatsBandBlock) apply xl:py-4xl for the 96px desktop rhythm step"
  - "ProductCard/InsightCard converged on rounded-card + shadow-card resting, shadow-card-hover on hover/focus"
  - "CertCard converged on rounded-card + shadow-card resting (both branches, no hover state)"
affects: ["07-hero-homepage-narrative", "08-component-polish"]

tech-stack:
  added: []
  patterns:
    - "Call-site className override via tailwind-merge on the shadcn Card primitive — no primitive edit, matches 06-01's D-04 recipe."

key-files:
  created: []
  modified:
    - src/components/blocks/CTABandBlock.tsx
    - src/components/blocks/ContactBlockView.tsx
    - src/components/blocks/CertStripBlock.tsx
    - src/components/blocks/DocumentCardBlock.tsx
    - src/components/blocks/FeatureGridBlock.tsx
    - src/components/blocks/MediaGalleryBlock.tsx
    - src/components/blocks/ExportMapBlock.tsx
    - src/components/blocks/RichTextBlock.tsx
    - src/components/blocks/StatsBandBlock.tsx
    - src/components/products/ProductCard.tsx
    - src/components/insights/InsightCard.tsx
    - src/components/blocks/CertCard.tsx

key-decisions:
  - "Executor session hit the platform session limit mid-Task-2 (after Task 1 committed, before Task 2 committed). Orchestrator resumed directly in the same worktree: verified Task 2's in-progress uncommitted diff against the plan's exact acceptance_criteria/verify command, confirmed it matched byte-for-byte, then committed it rather than discarding and re-running — no work lost."
  - "Full manual visual-regression sign-off (per CONTEXT.md non-negotiable / 06-UI-SPEC backstop) could not be performed as a human screenshot review in this environment. Substituted: npm run build (69/69 pages), npm test (17/17 files, 70/70 tests), npm run lint:rtl, plus a live dev-server smoke check confirming /en renders 200 with 10 instances of xl:py-4xl present in the served HTML. Card-bearing pages (/products, /insights, /certifications) were not confirmed via live render in this pass. This is recorded honestly per the plan's own instruction — 'if skipped, this is insufficient_spec at verify time, not a silent pass' — rather than claimed as a full pass."

patterns-established:
  - "Section-rhythm bump is a single xl:py-4xl class append to each block wrapper's existing padding recipe — no structural change."

requirements-completed: [D-04]

coverage:
  - id: D4a
    description: "9 CMS block wrappers apply xl:py-4xl (96px) desktop rhythm; HeroBlock and chrome untouched"
    requirement: "D-04"
    verification:
      - kind: unit
        ref: "grep -F 'xl:py-4xl' on all 9 block files"
        status: pass
      - kind: manual_procedural
        ref: "curl http://localhost:.../en — 10 occurrences of xl:py-4xl present in rendered HTML"
        status: pass
    human_judgment: false
  - id: D4b
    description: "ProductCard/InsightCard/CertCard converged on rounded-card + shadow-card(-hover); Card primitive unedited"
    requirement: "D-04"
    verification:
      - kind: unit
        ref: "grep assertions for rounded-card/shadow-card/shadow-card-hover per component; git diff --quiet src/components/ui/card.tsx"
        status: pass
      - kind: manual_procedural
        ref: "live-render confirmation on a card-bearing page (products/insights/certifications)"
        status: unknown
    human_judgment: true
    rationale: "Card visual convergence was confirmed by exact-string grep on the three components, but no live render of a card-bearing page (products/insights/certifications) was captured in this session — needs a human look, not just source assertions."
  - id: D4c
    description: "lint:rtl green, build succeeds, existing tests pass"
    requirement: "D-04"
    verification:
      - kind: unit
        ref: "npm run lint:rtl exit 0; npm run build (69/69 pages); npx vitest run (17 files / 70 tests pass)"
        status: pass
    human_judgment: false
  - id: D4d
    description: "Homepage + one trust page pass full visual-regression sign-off"
    requirement: "D-04 / CONTEXT.md non-negotiable"
    verification:
      - kind: manual_procedural
        ref: "Human screenshot/browser review of /en and a trust page (certifications or product detail)"
        status: unknown
    human_judgment: true
    rationale: "This is the CONTEXT.md non-negotiable visual-regression backstop — a subjective layout/no-overlap judgment call that only a human eyes-on-the-live-site check can close, not a source assertion."
---

## What Was Built

Applied the 06-01 design tokens across the component layer, completing Phase 6:

**Task 1 (rhythm):** All 9 CMS block wrappers (everything except HeroBlock, which Phase 7 owns) gained `xl:py-4xl` on their outer section padding, bumping desktop vertical rhythm to 96px at the xl breakpoint while leaving mobile (48px) and tablet (64px) steps untouched.

**Task 2 (cards):** ProductCard and InsightCard (identical Card className before this change) moved from `rounded-lg` / `shadow-md` hover to `rounded-card` (10px) resting + `shadow-card` resting + `shadow-card-hover` on hover/focus. CertCard's two-branch ternary (halal-featured vs. standard) gained `rounded-card` + `shadow-card` on both branches — no hover state, resting elevation only. The shadcn `Card` primitive (`src/components/ui/card.tsx`) was not touched in either task; all overrides ride the existing tailwind-merge call-site pattern.

## Verification Results

- `npm run lint:rtl`: pass (no physical-direction classes)
- `npm run build`: pass, all 69 static paths generated
- `npx vitest run`: pass, 17/17 files, 70/70 tests
- `git diff --quiet src/components/ui/card.tsx`: pass (primitive untouched)
- Live dev-server smoke check: `/en` → 200, 10× `xl:py-4xl` present in served HTML

## Outstanding

Full human visual-regression sign-off (homepage + one trust page, per CONTEXT.md non-negotiable) has NOT been performed as an actual browser/screenshot review — only automated build/test/lint plus a partial live-render smoke check on the homepage. This should be verified by a human (or `/gsd-verify-work 6`) before treating the visual-regression backstop as closed. Recorded as `human_needed`, not silently passed.

## Phase 6 Status

Both plans (06-01, 06-02) complete. Phase 6 — Design System Elevation — is implementation-complete pending the outstanding human visual-regression item above.
