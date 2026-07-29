# Phase 9: Motion and Micro-interactions - Pattern Map

**Mapped:** 2026-07-29
**Files analyzed:** 15 (2 new, 13 modified)
**Analogs found:** 15 / 15 (RESEARCH.md's own Architecture Patterns section already IS the closest analog for the 2 net-new files — no prior motion code exists in this codebase to borrow from, confirmed by RESEARCH.md's "No IntersectionObserver usage anywhere in src/ today")

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/motion/useInView.ts` (NEW) | hook | event-driven | RESEARCH.md Pattern 1 (no codebase precedent) | new-pattern |
| `src/components/motion/Reveal.tsx` (NEW) | component (client wrapper) | event-driven | RESEARCH.md Pattern 2 (no codebase precedent) | new-pattern |
| `src/components/motion/RevealItem.tsx` (NEW) | component (client wrapper) | event-driven | RESEARCH.md Pattern 3; structurally close to `ProductCard.tsx` hover styling conventions | new-pattern |
| `src/components/blocks/RenderBlocks.tsx` | component (RSC composer) | transform | itself (existing `.map()` dispatch loop) | exact |
| `src/components/blocks/FeatureGridBlock.tsx` | component (RSC, grid) | CRUD-render | itself; also model for other grid blocks below | exact |
| `src/components/blocks/TestimonialsBlock.tsx` | component (RSC, grid) | CRUD-render | `FeatureGridBlock.tsx` (same `.map()` + `Card` shape) | role-match |
| `src/components/blocks/MediaGalleryBlock.tsx` | component (RSC, grid) | CRUD-render | `FeatureGridBlock.tsx` | role-match |
| `src/components/blocks/TrustBarBlock.tsx` | component (RSC, grid) | CRUD-render | `FeatureGridBlock.tsx` | role-match |
| `src/components/blocks/CertStripBlock.tsx` | component (RSC, grid) | CRUD-render | `FeatureGridBlock.tsx` | role-match |
| `src/components/products/ProductCard.tsx` | component (card, hover) | CRUD-render | itself (existing hover-lift pattern is the model to reuse, not replace) | exact |
| `src/components/insights/InsightCard.tsx` | component (card, hover) | CRUD-render | `ProductCard.tsx` (near-identical `Card` className recipe) | exact |
| `src/components/ui/accordion.tsx` | component (Radix primitive) | event-driven | itself (bug-fix in place, D-13) | exact |
| `src/components/ui/button.tsx` | component (Radix primitive, cva) | request-response | itself (single `buttonVariants` edit site, Phase 8 precedent) | exact |
| `src/components/chrome/WhatsAppFloatingButton.tsx` | component (RSC, persistent CTA) | transform | itself (add one class, no structural change) | exact |
| `src/components/chrome/MobileNavPanel.tsx` | component (client, Radix Sheet) | event-driven | itself (already `"use client"`, just needs `tw-animate-css` classes to resolve) | exact |
| `src/app/globals.css` | config (design tokens) | transform | itself (`@theme` block, Phase 6 precedent for adding tokens) | exact |
| `package.json` | config | n/a | itself | exact |

## Pattern Assignments

### `src/components/motion/useInView.ts` (NEW — hook, event-driven)

No codebase analog exists (RESEARCH.md confirmed: zero `IntersectionObserver` usage in `src/` today). Use RESEARCH.md Pattern 1 verbatim as the implementation — it is already fully specified, cites D-04/D-06/D-12, and was validated against this codebase's actual Server/Client boundary rules (see Pitfall 2/3 below). Place in `src/components/motion/` per Pitfall 3 — do NOT put in `src/hooks/` (that directory is reserved for Payload CMS collection lifecycle hooks: `revalidateCatalog.ts` etc., a completely different concept; confirmed via CLAUDE.md Architecture section).

```typescript
// src/components/motion/useInView.ts
"use client";
// RESEARCH Phase 9 / D-04, D-06, D-12: IntersectionObserver only (no
// window.scroll listener). Fires once, then unobserves — no replay on
// scroll-up-and-back-down. Reduced-motion users skip the observer entirely
// and start "revealed" so content is never hidden behind a JS trigger that
// intentionally never animates.
import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el); // D-06: no replay
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
```

---

### `src/components/motion/Reveal.tsx` (NEW — component, event-driven)

**Analog:** RESEARCH.md Pattern 2 (no codebase precedent — this is the first client boundary in the CMS block render path).

**Core pattern:**
```tsx
"use client";
import { useInView } from "./useInView";

export function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      data-revealed={inView || undefined}
      className="translate-y-6 opacity-0 transition-[opacity,transform] duration-[0.6s] ease-[cubic-bezier(0.16,1,0.3,1)] data-[revealed]:translate-y-0 data-[revealed]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
    >
      {children}
    </div>
  );
}
```

**Critical boundary rule (Pitfall 2):** existing block components (`FeatureGridBlock.tsx` etc.) stay `async` Server Components exactly as written today — do NOT add `"use client"` to them. `Reveal` wraps their already-rendered JSX output as `children`; RSC output passed as children to a Client Component does not itself become client code (Next.js App Router behavior).

---

### `src/components/blocks/RenderBlocks.tsx` (controller/composer, transform)

**Analog:** itself, lines 50-60 (exact existing dispatch loop, minimal diff required).

**Current code (lines 50-60):**
```tsx
export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.blockType];
        if (!Component) return null; // unknown blockType: fail soft, not a blank crash
        return <Component key={block.id ?? index} block={block} index={index} />;
      })}
    </>
  );
}
```

**Target pattern (D-07 hero exception, LCP-safe):**
```tsx
import { Reveal } from "@/components/motion/Reveal";

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.blockType];
        if (!Component) return null;
        const rendered = <Component key={block.id ?? index} block={block} index={index} />;
        if (block.blockType === "hero") return rendered; // D-07: LCP exception, never gated
        return <Reveal key={block.id ?? index}>{rendered}</Reveal>;
      })}
    </>
  );
}
```
Keep the existing `if (!Component) return null` fail-soft guard and the existing `sectionBg(index)` helper (lines 43-48) untouched — out of scope.

---

### `src/components/blocks/FeatureGridBlock.tsx` (grid block, CRUD-render) — model for TestimonialsBlock/MediaGalleryBlock/TrustBarBlock/CertStripBlock

**Analog:** itself — this file's existing `.map()` loop (lines 46-66) is the template for wrapping items in `RevealItem`.

**Current item loop (lines 46-66):**
```tsx
{items.map((item, i) => {
  const photo = item.photo && typeof item.photo === "object" ? (item.photo as Media) : null;
  const Icon = ICONS[item.icon ?? ""] ?? Sparkles;
  return (
    <Card key={i} className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      {/* ... */}
    </Card>
  );
})}
```

**Target pattern (RESEARCH Pattern 3):**
```tsx
import { RevealItem } from "@/components/motion/RevealItem";
// ...
{items.map((item, i) => (
  <RevealItem key={i} index={i}>
    <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      {/* unchanged internals */}
    </Card>
  </RevealItem>
))}
```
Apply the identical wrap-the-`.map()`-item transform to `TestimonialsBlock.tsx`, `MediaGalleryBlock.tsx`, `TrustBarBlock.tsx`, `CertStripBlock.tsx` — each keeps its own `async` RSC data-fetching untouched; only the per-item `Card` gets the `RevealItem` wrapper. Note: since `RenderBlocks.tsx` already wraps the whole block in `<Reveal>`, these grid blocks get BOTH a section-level reveal AND per-item stagger — this is intended (RESEARCH Architecture Diagram shows both layers composing).

---

### `src/components/products/ProductCard.tsx` / `src/components/insights/InsightCard.tsx` (card, CRUD-render, hover)

**Analog:** `ProductCard.tsx` is itself the reference pattern (RESEARCH Pattern 4 cites it verbatim as "already-correct existing pattern to replicate"). `InsightCard.tsx` already carries the near-identical `Card` className.

**Existing hover pattern (ProductCard.tsx line 22, InsightCard.tsx line 28) — DO NOT REWRITE, this is already correct:**
```tsx
<Card className="gap-sm rounded-card border border-neutral-300 bg-white p-md shadow-card transition-transform duration-150 group-hover:-translate-y-[1px] group-hover:shadow-card-hover group-focus-visible:-translate-y-[1px] group-focus-visible:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-accent-600 md:p-lg">
```
Per CONTEXT.md discretion, optionally deepen the lift (`-translate-y-[2px]` to `-4px`) and/or add image `scale(1.03-1.05)` on the inner `<Image>` on hover if it reads as premium — planner's call, both changes stay inside this existing `group-hover:` convention (no new hover mechanism needed). If these grids get `RevealItem` wrapping too (Product/Insight catalog grids — CONTEXT.md leaves stagger-vs-whole-grid-fade open), wrap the outer `<Link>` per catalog page's `.map()` loop, same pattern as FeatureGridBlock above — but note these Card components themselves stay Server Components; only the catalog page's grid-item wrap point needs the client boundary, same Pitfall-2 rule applies.

---

### `src/components/ui/accordion.tsx` (Radix primitive, event-driven, D-13 bug fix)

**Analog:** itself — direct in-place fix, no external analog needed (RESEARCH Pattern 5 fully specifies the replacement).

**Current broken code (lines 50-64):**
```tsx
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
```
`animate-accordion-up`/`animate-accordion-down` resolve to nothing (no `tailwindcss-animate`, no matching `@theme` keyframes) — confirmed dead classes.

**Fix (RESEARCH Pattern 5 — `grid-template-rows`, D-03-compliant, NOT `tw-animate-css`'s stock height-based classes):**
```tsx
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount
      className="grid grid-rows-[0fr] text-sm transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
      {...props}
    >
      <div className={cn("overflow-hidden pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
```
`forceMount` is required (Pitfall 4) — without it, Radix's default `Presence` unmounts the content on close and the closing transition never plays (accordion "snaps closed" instead of animating).

---

### `src/components/ui/button.tsx` (cva primitive, request-response, D-11 tap feedback)

**Analog:** itself — Phase 8 already established the precedent of editing this exact `cva` base string for sitewide hover/focus consolidation (cited in RESEARCH Pattern 4).

**Current base string (line 8):**
```tsx
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-accent-600 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```

**Target — append `active:scale-[0.98] motion-reduce:active:scale-100`:**
```tsx
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-accent-600 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```
Single edit site — variants below (lines 10-40) untouched. Note: per D-12, hover/`:active` states must remain instant under reduced motion (state changes, just doesn't animate) — the `motion-reduce:` variant here should suppress the transition duration for this property, not the scale itself disappearing; verify `transition-all` combined with `motion-reduce:` produces "instant snap to 0.98" rather than "no scale at all" (Tailwind's `motion-reduce:transition-none` is the safer explicit choice if `active:scale-100` reads as fully disabling the feedback — planner/executor judgment call, cross-check against RESEARCH Code Examples section which uses `motion-reduce:transition-none` alongside `hover:-translate-y-1 active:scale-[0.98]`).

---

### `src/components/chrome/WhatsAppFloatingButton.tsx` (persistent CTA, transform, D-09)

**Analog:** itself — single class addition, no structural change (RESEARCH Pattern 6).

**Current (lines 14-26):**
```tsx
export async function WhatsAppFloatingButton() {
  const { waHref } = await getSiteBrand();
  const t = await getTranslations("contact");

  return (
    <WhatsAppTrackedLink
      href={waHref}
      location="floating-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappAria")}
      className="fixed bottom-md end-md z-40 inline-flex size-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-card-hover transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <WhatsAppIcon className="size-7" />
    </WhatsAppTrackedLink>
  );
}
```

**Target — append `animate-float-in motion-reduce:animate-none` to the existing className, no other change; component stays an RSC (no `IntersectionObserver` needed — always in viewport at mount):**
```tsx
className="fixed bottom-md end-md z-40 inline-flex size-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-card-hover transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 animate-float-in motion-reduce:animate-none"
```
Requires the new `--animate-float-in`/`@keyframes float-in` tokens in `globals.css` (see Shared Patterns below). Add a subtle hover treatment too per D-09 — reuse the existing `hover:bg-primary-500` color-shift already present; optionally add a small `hover:scale-105` transform if it reads as intentional (D-01 restraint — keep it minimal, this is a persistent chrome element, not a content card).

---

### `src/components/chrome/MobileNavPanel.tsx` (client, Radix Sheet, D-08)

**Analog:** itself — already `"use client"`, already wired to Radix `data-state=open/closed` via the `Sheet`/`SheetContent` primitives (imported from `src/components/ui/sheet.tsx`). No code change needed in this file itself; the abrupt-transition bug lives in `sheet.tsx`'s `data-[state=open]:animate-in`/`fade-in-0`/`slide-in-from-*` classes, which currently resolve to nothing (same root cause class as the accordion bug, minus the height issue). Fixed at the dependency level — see Shared Patterns → `tw-animate-css`.

---

## Shared Patterns

### `tw-animate-css` import (fixes Sheet/DropdownMenu/Select entrance transitions, D-08)
**Source:** RESEARCH.md Standard Stack — new devDependency, verified OK (npm legitimacy audit passed, no postinstall, 35M weekly downloads).
**Apply to:** `src/app/globals.css` (one `@import` line), unblocks `src/components/ui/sheet.tsx`, `dropdown-menu.tsx`, `select.tsx` — none of these three files need their own edits beyond the import resolving their already-present `animate-in`/`fade-in-0`/`zoom-in-95`/`slide-in-from-*` classes.
```bash
npm install -D tw-animate-css
```
```css
/* src/app/globals.css — near existing @import/@theme block */
@import "tw-animate-css";
```
**Do NOT** let this package's own `animate-accordion-up`/`animate-accordion-down` classes remain referenced anywhere — `accordion.tsx` is fixed separately with the hand-rolled `grid-template-rows` approach (Pitfall 1).

### `@theme` custom keyframe registration (float-in, WhatsApp button entrance)
**Source:** `src/app/globals.css` existing `@theme { ... }` block, lines 9-136 (Phase 6 precedent for adding design tokens in this exact block).
**Apply to:** `globals.css` only — add alongside existing color/spacing/typography tokens.
```css
/* src/app/globals.css — inside existing @theme block */
--animate-float-in: float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
@keyframes float-in {
  from { opacity: 0; transform: translateY(16px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### `motion-reduce:`/`motion-safe:` reduced-motion gating (D-12, applies everywhere)
**Source:** Tailwind v4 core variants (no custom code) — RESEARCH.md Code Examples section, cross-referenced against every pattern above (`Reveal`, `RevealItem`, `button.tsx`, `accordion.tsx`, `WhatsAppFloatingButton.tsx`).
**Apply to:** every new/modified motion className in this phase.
```tsx
className="transition-transform duration-150 hover:-translate-y-1 active:scale-[0.98] motion-reduce:transition-none"
```

### RTL logical properties for directional slide (D-10, Pitfall 6)
**Source:** `scripts/check-physical-direction.mjs` (existing lint enforcement) + RESEARCH Pattern 3's `direction` prop branch.
**Apply to:** `RevealItem` only where a directional slide is deliberately chosen (sparingly, per D-10).
```tsx
const initialTransform =
  direction === "start"
    ? "-translate-x-4 rtl:translate-x-4" // logical start edge, mirrors under rtl:
    : "translate-x-4 rtl:-translate-x-4";
```
`npm run lint:rtl` must stay green after every edit in this phase (it will not catch `translate-x-*` semantic-direction mistakes — that requires the manual/e2e `ar`-locale visual check per Pitfall 6).

## No Analog Found

None — every file in scope either has a direct existing-file analog (bug-fix-in-place cases) or a fully-specified RESEARCH.md pattern with no prior codebase precedent to search for (the two/three net-new `src/components/motion/` files — first motion code in this repo, RESEARCH.md's own patterns ARE the analog).

## Metadata

**Analog search scope:** `src/components/blocks/`, `src/components/products/`, `src/components/insights/`, `src/components/chrome/`, `src/components/ui/`, `src/app/globals.css`
**Files scanned:** `RenderBlocks.tsx`, `FeatureGridBlock.tsx`, `accordion.tsx`, `button.tsx`, `WhatsAppFloatingButton.tsx`, `ProductCard.tsx`, `InsightCard.tsx`, `MobileNavPanel.tsx`, `globals.css` (read directly this pass); `TestimonialsBlock.tsx`/`MediaGalleryBlock.tsx`/`TrustBarBlock.tsx`/`CertStripBlock.tsx` classified by role-match to `FeatureGridBlock.tsx` without re-reading (same `.map()`-over-`Card` shape confirmed via RESEARCH.md's own file inventory)
**Pattern extraction date:** 2026-07-29
</content>
