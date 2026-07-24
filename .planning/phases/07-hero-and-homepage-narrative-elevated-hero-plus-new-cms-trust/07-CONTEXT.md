---
phase: 7
phase_name: Hero and Homepage Narrative
source: v2.0 Premium Redesign brief + .planning/references/REDESIGN-PLAN.md §4 Phase B + memory/redesign-v2-decisions.md + Phase 6 delivered tokens
date: 2026-07-24
---

## Domain

Elevate the homepage hero to premium tier using the display-tier tokens Phase 6 delivered, and fill the homepage narrative gaps identified in REDESIGN-PLAN.md §4 Phase B: trust indicators, a process/timeline story, and testimonials. This phase is CMS-block work on the existing `pages` collection + block-builder pattern (`src/blocks/*.ts` Payload configs + `src/components/blocks/*Block.tsx` renderers), not a new page type.

## What Phase 6 Already Delivered (available now, apply here)

- `--text-display-lg: 52px` (weight 300, line-height 1.1) and `--text-display-xl: 56px` (weight 300, line-height 1.05) in `globals.css` `@theme`.
- `--tracking-display: -0.025em` — shared negative-tracking token for both new tiers.
- `--font-display` — resolves to a locale-scoped Geist Latin display face on en/fr/ru, falls back to `--font-sans` (Plex) on `ar`. Tailwind utility: `font-display`.
- `font-light` (300) is Tailwind's default utility, RESERVED for `text-display-lg`/`text-display-xl` only per Phase 6's contract — do not apply it to body/heading/label text.
- `--spacing-4xl: 96px` (`xl:py-4xl`), `--radius-card: 10px` (`rounded-card`), `--shadow-card` / `--shadow-card-hover` — already applied to the 9 non-Hero block wrappers and 3 card components in Phase 6. HeroBlock and `card.tsx` primitive were explicitly left untouched by Phase 6 — this phase applies the display tokens to Hero specifically.

## Locked Decisions

1. **Hero elevation — apply Phase 6 tokens to `HeroBlock.tsx`.** Replace the current `text-display font-semibold` (40px/600) headline treatment with `text-display-xl font-display font-light tracking-display` (56px/300, Geist on Latin locales, Plex on `ar`) for the `full` (homepage) variant. Keep the `compact` (interior-page) variant on the existing smaller `text-display`/40px — this phase's "premium hero" scope is the homepage only, per REDESIGN-PLAN.md §4 Phase B ("Elevate HeroBlock: large thin display headline"). Preserve the existing `full`/`compact` variant split, the `data-testid="hero"` and `data-testid="sample-count"` test hooks (an existing Arabic e2e test asserts on `sample-count` — do not rename or remove), and the eyebrow/subhead/CTA structure — only the headline typography and image/gradient treatment change.
2. **Atmospheric image treatment, not a heavier overlay.** REDESIGN-PLAN.md explicitly wants "better image treatment + atmospheric gradient (not heavy overlay)" — refine the existing `bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent` overlay rather than replacing it with a flat scrim or darkening it further. No new dependency (no parallax library, no video hero) — CSS gradient refinement only.
3. **New CMS blocks — only for genuinely new content shapes.** Reuse existing blocks wherever the content shape already fits (ponytail: reuse before build):
   - **"Why Choose Us"** → reuse `FeatureGrid` (`variant: icon`) — this block's own code comment already scopes it for "the homepage value-props section." No new block.
   - **"Manufacturing Excellence"** → reuse `MediaGallery` (photo grid) + `StatsBand` (capacity/QC figures) — do not build a new combined block. If a condensed homepage teaser is wanted (vs. the full existing `/manufacturing` page), compose it from these two existing blocks with homepage-scoped copy.
   - **"Trust-indicator / partner-logo row"** → genuinely new, small block. `CertStrip` is certification-specific (reads from the Certifications collection at render time) and is NOT the right vehicle for generic partner/buyer logos. New block: a lightweight logo-strip block (own media-upload array field, no collection dependency) — name and exact field shape at UI researcher's/planner's discretion, but must NOT reuse or extend `CertStrip`'s Certifications-collection binding.
   - **"Export Process" (timeline)** → genuinely new. No existing timeline/stepper block. Steps: inquiry → quote → production/QC → shipping → delivery (or similar export-flow sequence) — exact step copy at planner's discretion, sourced from existing Export Track Record page content (Phase 2 TRUST-03) if available, otherwise realistic placeholder.
   - **"Testimonials"** → genuinely new. Quote + name + company + country per testimonial; grid or simple stacked layout — no carousel library dependency (YAGNI unless UI-SPEC finds a compelling need; a static grid/list is the default).
4. **Colors, body-tier typography, and rhythm/card tokens are Phase 6's contract — do not re-litigate.** No new color tokens, no changes to `--text-label/body/heading` or their weights, no changes to `--spacing-4xl`/`--radius-card`/`--shadow-card*` values. New blocks apply the *existing* Phase 6 rhythm/card tokens (`xl:py-4xl` on their outer section wrapper, `rounded-card`/`shadow-card` on any card-shaped sub-elements), consistent with the other 9 blocks.
5. **CMS-driven, non-technical-editable, English-first.** All new blocks are Payload `Block` configs registered in `src/blocks/index.ts` + `Pages.ts`'s `layout.blocks` array, with renderer components wired into `RenderBlocks.tsx`'s `BLOCK_MAP`, following the exact pattern of the 9 existing blocks (field-level localization NOT set — cascades from `Pages.layout`'s top-level `localized: true`, per the established `RESEARCH Pattern 2` comment convention). Seed realistic-shaped English placeholder content; translation is deferred per project-wide English-first priority.

## Non-Negotiable Constraints

- **RTL:** every new block/component uses logical properties only (`ms/me/ps/pe`, `rtl:` variant); `npm run lint:rtl` must stay green.
- **No color-token or body-tier changes.** Phase 6's contract stands.
- **Existing e2e/test hooks preserved:** `data-testid="hero"`, `data-testid="sample-count"`, and the `full`/`compact` variant distinction on HeroBlock must not be renamed or removed.
- **No new npm dependencies** for hero image treatment, timeline, or testimonials unless a UI-SPEC finding makes a strong case (default assumption: pure CSS/Tailwind + existing shadcn primitives are sufficient — YAGNI on carousel/animation libraries; motion is Phase 9's scope anyway, not this phase's).
- **English-first.** No translation work this phase.
- **Homepage composition:** the phase should also decide how these blocks compose on the actual homepage `pages` document (order, which existing blocks like `StatsBand`/`CertStrip` stay, which are new) — this is page-content/seed work, not schema work, and can be scoped by the planner from REDESIGN-PLAN.md's suggested 12-section flow (Hero → Trust Indicators → Featured Products → About → Why Choose Us → Manufacturing Excellence → Certifications → Export Process → Global Presence → Testimonials → Contact CTA → Footer), adapted to what already exists (ExportMap block already covers "Global Presence").

## Deliverable Shape (per REDESIGN-PLAN.md §4 Phase B)

- Elevated `HeroBlock.tsx` (homepage `full` variant): large thin display headline (`text-display-xl font-display font-light tracking-display`), refined eyebrow/subhead/CTA rhythm, atmospheric gradient refinement.
- New Payload blocks: partner/trust-logo strip, Export Process timeline, Testimonials — each with a `src/blocks/{Name}.ts` config and a `src/components/blocks/{Name}Block.tsx` renderer, registered in `src/blocks/index.ts`, `Pages.ts`, and `RenderBlocks.tsx`.
- Homepage `pages` document updated/seeded to compose Hero + existing blocks (FeatureGrid "Why Choose Us", MediaGallery+StatsBand "Manufacturing Excellence", CertStrip, ExportMap) + the 3 new blocks into a coherent flow, all CMS-editable with realistic placeholder content.
- Verify: `lint:rtl` green, existing tests (including the Arabic e2e `sample-count` assertion) pass, homepage renders without regression.

## Explicitly Out of Scope (deferred to later phases)

- Motion/animation on the hero or new blocks → Phase 9.
- Applying `tabular-nums` to StatsBand figures → Phase 8 (Component Polish).
- Interior-page (`compact` variant) hero elevation → not in this phase's brief; only the homepage `full` hero is elevated.
- Full Lighthouse/CWV/a11y pass → Phase 10.
- Real photography/testimonial content (client assets don't exist yet) → build against realistic-shaped placeholders now; real-content swap is a later, non-code task.

## Claude's Discretion

- Exact field shape and naming for the 3 new blocks (TrustBar/PartnerLogos, ExportProcess/Timeline, Testimonials) — follow the existing block-config conventions (see `src/blocks/FeatureGrid.ts`, `StatsBand.ts`, `MediaGallery.ts` for the established comment/structure style).
- Exact homepage section order and copy, informed by REDESIGN-PLAN.md's suggested flow but adapted to existing blocks.
- Whether "Manufacturing Excellence" gets a homepage-specific condensed composition or simply links to the existing `/manufacturing` page with a teaser — planner's call based on what reads best without over-building.
