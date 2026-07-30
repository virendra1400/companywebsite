---
phase: 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
reviewed: 2026-07-30T07:20:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - src/app/(site)/[locale]/insights/page.tsx
  - src/app/(site)/[locale]/products/page.tsx
  - src/app/globals.css
  - src/components/blocks/ExportProcessBlock.tsx
  - src/components/blocks/FeatureGridBlock.tsx
  - src/components/blocks/MediaGalleryBlock.tsx
  - src/components/blocks/RenderBlocks.tsx
  - src/components/blocks/TestimonialsBlock.tsx
  - src/components/chrome/WhatsAppFloatingButton.tsx
  - src/components/insights/InsightCard.tsx
  - src/components/motion/Reveal.tsx
  - src/components/motion/RevealItem.tsx
  - src/components/motion/useInView.ts
  - src/components/products/ProductCard.tsx
  - src/components/ui/accordion.tsx
  - src/components/ui/button.tsx
  - tests/e2e/contact.spec.ts
  - tests/e2e/reduced-motion.spec.ts
  - tests/e2e/rtl-arabic.spec.ts
  - tests/int/blocks-placeholder.spec.ts
  - tests/unit/motion-reveal.spec.tsx
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-07-30T07:20:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

The motion foundation itself (`useInView`, `Reveal`, `RevealItem`) is well built: SSR-safe, hydration-safe, correctly targets the standalone `translate` CSS property (verified against the installed `tailwindcss@4.3.2` compiler with a live probe build — `transition-transform` does resolve to `transform, translate, scale, rotate`, so the hover-lift/scale transitions on `ProductCard`/`InsightCard` are not vacuous), has a real no-JS `@media (scripting: none)` fallback, and correctly special-cases the LCP hero. Reduced-motion handling and the RTL directional-slide mirroring are consistent with their own inline documentation and covered by dedicated e2e specs.

The one real defect is architectural: `RenderBlocks.tsx` (09-02) unconditionally wraps every non-hero block in a section-level `<Reveal>`, but four of those same blocks (`FeatureGridBlock`, `MediaGalleryBlock`, `ExportProcessBlock`, `TestimonialsBlock`, added in 09-03) also wrap their own grid items in `<RevealItem>`. This produces nested, independently-triggered motion wrappers with compounding opacity/translate — a real behavioral bug that contradicts the phase's own documented per-layer Motion Contract (600ms/24px at section level vs. 500ms/16px+stagger at item level) and isn't caught by the existing test suite because every test either exercises the block components directly (bypassing `RenderBlocks`) or only asserts against the outer `[data-motion="reveal"]` element.

## Critical Issues

### CR-01: RenderBlocks double-wraps FeatureGrid/MediaGallery/ExportProcess/Testimonials in a redundant section-level Reveal, compounding with their own item-level RevealItem

**File:** `src/components/blocks/RenderBlocks.tsx:58-64`
**Issue:**
`RenderBlocks` wraps every non-hero block in `<Reveal>` unconditionally:

```tsx
const rendered = <Component key={block.id ?? index} block={block} index={index} />;
if (block.blockType === "hero") return rendered;
return <Reveal key={block.id ?? index}>{rendered}</Reveal>;
```

`BLOCK_MAP` routes `featureGrid`, `mediaGallery`, `exportProcess`, and `testimonials` to `FeatureGridBlock`, `MediaGalleryBlock`, `ExportProcessBlock`, and `TestimonialsBlock` respectively — and all four of those components (confirmed by `grep -rl RevealItem src/components/blocks/`) independently wrap their own grid/list items in `<RevealItem>` (see `src/components/blocks/FeatureGridBlock.tsx:55`, `MediaGalleryBlock.tsx:43`, `ExportProcessBlock.tsx:48`, `TestimonialsBlock.tsx:38`).

The result is two independent `IntersectionObserver`-driven wrappers nested inside each other on every CMS `Page` that uses one of these blocks:
- Outer `<Reveal>` (from `RenderBlocks`): `translate-y-6` (24px) / `opacity-0`, 600ms, own observer keyed to the whole `<section>`'s bounding box.
- Inner `<RevealItem>` (from the block itself): `translate-y-4`/`translate-x-4` (16px) / `opacity-0`, 500ms + per-index stagger, own observer keyed to each item's own bounding box.

Because CSS `opacity` compounds multiplicatively across ancestor/descendant chains and `translate` on a parent composes with `translate` on its child, whenever both observers cross their 20% threshold in the same scroll tick (which happens routinely for the first row of any such grid, since the section's own top edge and its first row's top edge are nearly co-located), the rendered motion is neither the documented 24px/600ms section treatment nor the documented 16px/500ms+stagger item treatment — it's an unspecified compound of both, with a doubled fade-in and a stacked ~40px initial offset collapsing to 0. This is a genuine visual regression on the phase's own signature feature, and it silently violates the phase's Motion Contract on four of the most commonly used content blocks.

Not caught by the existing suite because:
- `tests/int/blocks-placeholder.spec.ts` renders the block components directly (`renderToStaticMarkup(await FeatureGridBlock(...))`), never through `RenderBlocks`, so the outer `Reveal` is never present.
- `tests/e2e/reduced-motion.spec.ts` only asserts against `[data-motion="reveal"]` (the outer wrapper), never checks whether a `[data-motion="reveal-item"]` is nested inside one.
- `tests/unit/motion-reveal.spec.tsx` tests `Reveal` and `RevealItem` in isolation, never composed.

**Fix:** Exclude blocks that already implement their own item-level reveal from `RenderBlocks`' automatic section wrap (mirroring the existing hero exception), e.g.:

```tsx
// D-07/09-03: hero is the LCP exception; these blocks already implement
// their own item-level RevealItem stagger and must not also receive the
// section-level Reveal, or opacity/translate compound.
const OWN_ITEM_REVEAL = new Set(["hero", "featureGrid", "mediaGallery", "exportProcess", "testimonials"]);

const rendered = <Component key={block.id ?? index} block={block} index={index} />;
if (OWN_ITEM_REVEAL.has(block.blockType)) return rendered;
return <Reveal key={block.id ?? index}>{rendered}</Reveal>;
```

(Alternatively, keep the section-level `Reveal` and strip the internal `RevealItem` usage from these four blocks — but that would lose the per-item stagger that 09-03 was explicitly built to add, so excluding them from the outer wrap is the smaller, contract-preserving fix.) Whichever direction is chosen, add an e2e/unit assertion that a `Page` containing one of these blocks never renders a `[data-motion="reveal-item"]` nested inside a `[data-motion="reveal"]`.

## Warnings

### WR-01: CTABandBlock loses its Reveal treatment when rendered outside RenderBlocks (Products/Insights pages)

**File:** `src/app/(site)/[locale]/products/page.tsx:112-120`, `src/app/(site)/[locale]/insights/page.tsx:89-97`
**Issue:** Every CMS `Page` document renders its layout through `RenderBlocks`, which wraps every non-hero block (including `ctaBand`) in `<Reveal>`. The Products and Insights index pages, however, call `<CTABandBlock ... />` directly (they're hand-built pages, not `Page` layouts) and never wrap it in `<Reveal>`:

```tsx
<CTABandBlock
  block={{ blockType: "ctaBand", heading: "Ready to Source These Products?", ... }}
  index={grouped.length}
/>
```

So the exact same `CTABandBlock` component fades/rises into view everywhere it's used via a CMS `Page`, but renders at full opacity immediately (no scroll-reveal at all) on `/products` and `/insights` — an inconsistency a QA pass on this phase would likely flag, since `HeroBlock`'s exclusion here is intentional (D-07) but `CTABandBlock`'s is very likely an oversight of the same "bypasses RenderBlocks entirely" gap.

**Fix:** Wrap the direct `CTABandBlock` calls in `Reveal` on both pages:

```tsx
import { Reveal } from "@/components/motion/Reveal";
...
<Reveal>
  <CTABandBlock block={{ ... }} index={grouped.length} />
</Reveal>
```

### WR-02: Redundant/dead `key` prop after Reveal wrapping in RenderBlocks

**File:** `src/components/blocks/RenderBlocks.tsx:57-63`
**Issue:**
```tsx
const rendered = <Component key={block.id ?? index} block={block} index={index} />;
if (block.blockType === "hero") return rendered;
return <Reveal key={block.id ?? index}>{rendered}</Reveal>;
```
For every non-hero block, `rendered` is passed as a single child of `<Reveal>`, not returned directly into the `.map()` array — React only honors `key` on elements that are direct children of an array/iterable, so the `key={block.id ?? index}` on `<Component>` is inert for every block except `hero`. It's harmless today (no console warning, no misreconciliation, since `Reveal`'s own key already anchors the list identity) but reads as if it still matters and could mislead a future edit that removes the outer `Reveal`.
**Fix:** Drop the now-unused inner key, or restructure so the key lives only where it's actually load-bearing:
```tsx
const rendered = block.blockType === "hero"
  ? <Component block={block} index={index} />
  : <Reveal>{<Component block={block} index={index} />}</Reveal>;
return <div key={block.id ?? index}>{rendered}</div>; // or keep key only on the single returned element per branch
```

## Info

### IN-01: `Reveal` and `RevealItem` use different offset magnitudes with no shared constant

**File:** `src/components/motion/Reveal.tsx:18`, `src/components/motion/RevealItem.tsx:39`
**Issue:** `Reveal` rises from `translate-y-6` (24px, 600ms) while `RevealItem` rises from `translate-y-4`/`translate-x-4` (16px, 500ms). Given CR-01, once the two are no longer nested for the same surface this is fine as an intentional two-tier design (section vs. item), but the two values are magic numbers duplicated with no comment cross-referencing the other file's value, making a future "keep these in sync" edit easy to miss half of.
**Fix:** A one-line comment in each file pointing at the other's value (e.g. "// section-level offset — see RevealItem.tsx for the smaller item-level offset") is enough; no shared constant needed for two values used in exactly two places.

---

_Reviewed: 2026-07-30T07:20:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
