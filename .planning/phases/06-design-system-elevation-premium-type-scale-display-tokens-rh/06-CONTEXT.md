---
phase: 6
phase_name: Design System Elevation
source: v2.0 Premium Redesign brief + .planning/references/REDESIGN-PLAN.md §3-4 + memory/redesign-v2-decisions.md
date: 2026-07-23
---

## Domain

Elevate the existing (already-good, launch-ready) design token system to Stripe/Linear/Vercel-tier premium, without a color overhaul, without breaking RTL, and without a framework/stack change. This is the gating foundation phase — Phase 7 (hero/homepage) cannot deliver a premium hero without the amended type scale this phase produces.

## Locked Decisions

1. **Type scale amendment (not a free-for-all).** The Phase-1 UI-SPEC lock of "exactly 4 sizes / 2 weights, 40px max" is amended for **display tiers only**:
   - Add `display-lg` (~52–56px) and `display-xl` (~40px) tiers.
   - Introduce a thin/light display weight (in addition to existing 400/600).
   - Add negative letter-spacing tokens for display use (reference: Stripe ~-1.4px at 56px — scale proportionally).
   - Body text tiers (sizes below display) are UNCHANGED — do not touch body scale, weights, or line-height.

2. **Fonts: keep IBM Plex, add a Latin display face — do NOT replace the stack.**
   - Keep IBM Plex Sans + Plex Sans Arabic exactly as-is for body text and all Arabic/RTL rendering (Arabic integrity is non-negotiable).
   - Add Geist or Inter as a **Latin-only display face**, scoped to display headings, never applied to `ar` locale content or body text.
   - Implementation must be locale-scoped (e.g. a CSS variable/class gated by `[dir="ltr"]` or locale, not a blanket font-family swap).

3. **Colors unchanged.** No palette overhaul. Existing tokens (`primary-900 #0F2E22`, `accent-600 #C9A227`, and neighbors) stay as the source of truth — brief's palette already matches within rounding.

4. **Rhythm/spacing:** bump section vertical padding toward 64–96px (from current — read existing `globals.css` for current values before setting new tokens). Tighten card radius/hairline border system. Replace heavier box-shadows with subtle elevation (border/hairline + soft ambient shadow, not drop-shadow stacks).

5. **Tabular figures:** add `font-feature-settings: "tnum"` (or equivalent Tailwind utility/token) for numeric/stat cells (StatsBand, spec tables, etc.) — this phase only needs the token/utility to exist; wiring it into StatsBand is Phase 8 (Component Polish).

## Non-Negotiable Constraints

- **RTL:** every new token/utility must work under `dir="rtl"`. Use logical properties only. `npm run lint:rtl` (or equivalent project RTL lint script) must stay green after this phase.
- **No color changes.** Do not touch `@theme` color tokens.
- **No body-text scale changes.** Only display tier gets new sizes/weights/tracking.
- **CMS-driven pages must not visually break.** This phase changes tokens in `globals.css` (`@theme`) — verify no layout regression on at least the homepage and one trust page before considering done.
- **English-first.** No translation work in this phase (per project-wide priority-english-first decision).

## Deliverable Shape (per REDESIGN-PLAN.md §4 Phase A)

- Updated `globals.css` `@theme` block: new display size tokens, display weight token, negative-tracking tokens, updated section-padding scale, card radius/hairline/shadow tokens, tabular-figure utility.
- Locale-scoped Latin display font wiring (font loading + CSS variable/class), verified not to leak into Arabic.
- A short amendment note appended to (or replacing the relevant section of) the existing Phase-1 UI-SPEC documenting the lifted type-scale constraint — so future phases/agents don't re-read the old "4 sizes/2 weights" lock as still-binding.
- Verify: `lint:rtl` green, homepage + one trust page render with no visual regression, existing tests pass.

## Explicitly Out of Scope (deferred to later phases)

- Applying the new display tokens to the actual Hero component → Phase 7.
- Applying tabular figures to StatsBand/SpecTable → Phase 8.
- New CMS blocks (Why Choose Us, Manufacturing Excellence, etc.) → Phase 7.
- Motion/animation → Phase 9.
- Full Lighthouse/CWV/a11y pass → Phase 10.

## Claude's Discretion

- Exact pixel values within the ~52–56px / ~40px ranges given.
- Exact letter-spacing values (interpolate from Stripe's -1.4px@56px reference, scaled to chosen sizes).
- Whether the light display weight is a new `font-weight` value or a separate font file, whichever the existing IBM Plex + new Latin display face setup supports most simply.
- Naming convention for new tokens (follow existing `@theme` naming patterns in `globals.css`).
