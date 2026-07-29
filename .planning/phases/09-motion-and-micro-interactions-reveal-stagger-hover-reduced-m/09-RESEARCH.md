# Phase 9: Motion and Micro-interactions - Research

**Researched:** 2026-07-29
**Domain:** CSS/JS scroll-reveal, stagger, hover/tap micro-interactions, `prefers-reduced-motion`, Radix accordion height animation — Next.js 16 App Router / React 19 / Tailwind v4 / next-intl v4 RTL
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Restrained "fluid CSS" tier — subtle `transform`/`opacity` transitions, modest stagger. No scroll-hijacking, no pinned/sticky-stack sections, no magnetic-cursor physics, no GSAP-style choreography. Matches the Stripe/Linear trust-first register already locked for the v2.0 redesign; expressive/agency choreography reads wrong for a B2B procurement audience.
- **D-02:** No specific motion reference beyond the existing Stripe/Linear benchmark already set for this redesign.
- **D-03:** Animate only `transform` and `opacity` (never `top`/`left`/`width`/`height`) — hard constraint protecting PERF-01/PERF-02 CLS goals (Phase 10 hardening will verify).
- **D-04:** No `window.addEventListener('scroll')` for any scroll-linked logic — use IntersectionObserver (or CSS-native scroll-driven animation only where broadly supported; see Claude's Discretion).
- **D-05:** Reveal shape = fade + subtle upward rise (~16-24px drift + opacity, ease-out-expo-style curve, ~0.5-0.6s duration). Not fade-only, not a directional slide by default.
- **D-06:** Reveal triggers once per page load per section — no replay on repeated scroll-into-view (scrolling up and back down does not re-trigger).
- **D-07:** Reveal treatment is applied uniformly across every CMS block (user's explicit call, overriding Claude's initial "curated per block" suggestion) — **except** Hero, which is a technical exception, not a style choice: Hero must paint immediately for LCP and must never be gated behind a scroll-reveal trigger.
- **D-08:** GlobalHeader/GlobalFooter/nav: light polish is in scope (e.g. mobile menu open/close transition) if currently abrupt — not a full chrome redesign, just tightening what's jarring.
- **D-09:** Floating WhatsApp button (`WhatsAppFloatingButton.tsx`) and other persistent CTAs get an entrance animation + hover treatment as part of this phase's micro-interaction pass.
- **D-10:** Directional slide-in reveals ARE allowed where they fit (e.g. a card sliding in from inline-start) — not restricted to fade/rise-only. Any directional motion MUST use logical properties (`ms-*/me-*`, translate values mirrored via the `rtl:` variant) and `npm run lint:rtl` must stay green. Use sparingly and only where direction genuinely reads as intentional.
- **D-11:** Add button tactile `:active` feedback — `scale(0.98)` on tap/click, transform-only, identical behavior LTR/RTL.
- **D-12:** Reduced-motion fallback: `prefers-reduced-motion` disables scroll-reveal animations only (autoplaying, non-user-initiated motion). Hover and `:active` state changes remain present but become instant (no transition duration) — the state still changes, it just doesn't animate. This is the standard WCAG-aligned interpretation, not a blanket "kill all motion."
- **D-13:** `src/components/ui/accordion.tsx` references `animate-accordion-up`/`animate-accordion-down` with no matching keyframes or plugin (confirmed — no `tailwindcss-animate` dependency, no keyframes in `globals.css`). Fix as part of this phase's component micro-interaction work.

### Claude's Discretion
- **Library vs. CSS-only implementation approach** — deferred to research; this document's finding (CSS + small custom `IntersectionObserver` hook, zero new animation dependency) is the researched answer, see Summary/Standard Stack.
- **Scroll-reveal detection mechanism** — IntersectionObserver-based hook is the safe default (broad browser support across GCC/Africa/Europe/CIS). CSS `animation-timeline: view()` flagged as risky (Chrome/Edge only) — avoid as primary mechanism.
- **JS bundle budget** — no hard number; default to as-close-to-zero-as-possible, weighed against Phase 10's CWV hardening pass.
- **Count-up animation on StatsBand figures** — left open; default to static unless planning finds the added complexity clearly worth it.
- **Product/Insights grid stagger vs. whole-grid fade** — left open; judge per grid size during planning, keep per-item delay tight (~40-60ms) so larger catalogs (CAT-03) don't produce a slow item-by-item march.
- **Stagger increment exact value** — left open in the ~40-60ms to ~120ms range; Claude leans tight (~50ms), final value at planner's discretion.
- **Card/button hover treatment specifics** — default: subtle lift (`translateY(-2px` to `-4px)`) + shadow deepen using `shadow-card`/`shadow-card-hover` tokens (no new tokens needed). Image cards may additionally get a subtle `scale(1.03-1.05)` on hover if it reads as premium.
- **Accordion animation fix implementation** — likely candidates: keyframes matching `--radix-accordion-content-height`, or the `grid-template-rows` `0fr → 1fr` trick. Exact approach at planner's/executor's discretion, but must stay `transform`/`opacity`/`grid-template-rows`-based (no animating `height` directly) and must work in both LTR and RTL. This document's finding: use the `grid-template-rows` trick (Pattern 5), not height-based keyframes.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. The accordion animation bug (D-13) was raised as a codebase finding, not scope creep, and the user explicitly chose to fix it within this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

No requirement IDs are formally mapped to this phase in `REQUIREMENTS.md`'s traceability table (this is a v2.0 Premium Redesign phase, outside the original v1 scope). Per the phase brief, the following v1 requirements are relevant cross-cutting constraints this phase must not regress:

| ID | Description | Research Support |
|----|-------------|-------------------|
| PERF-01 | Good Core Web Vitals on key pages (home, product, catalog), mobile and desktop | Entire architecture is transform/opacity-only (D-03), IntersectionObserver-based (no scroll-listener jank), and the accordion fix explicitly avoids `height` animation — see Architecture Patterns, Pitfall 1 |
| PERF-02 | Images/video/PDFs optimized and lazy-loaded appropriately | Not directly touched by this phase; Reveal/RevealItem wrappers add no image-loading behavior, so existing `next/image` lazy-loading in block components is unaffected |
| PERF-03 | Cross-locale RTL/LTR QA pass before launch (Arabic layout, fonts, numerals) | Pitfall 6 (directional slide RTL mirroring) and the `rtl:` variant pattern in `RevealItem` (Pattern 3) directly address this for the new motion surface |

</phase_requirements>

## Summary

This phase needs zero new animation-orchestration dependency. Every locked behavior in CONTEXT.md — uniform once-per-load fade+rise reveal, tight (~50ms) per-item stagger, occasional directional slide, instant-but-present hover/`:active` states, and a scroll-reveal-only `prefers-reduced-motion` kill switch — is expressible with (a) Tailwind v4 CSS transitions/`@theme` keyframes, (b) one ~30-line `IntersectionObserver` hook behind a client-boundary leaf, and (c) two small wrapper components (`Reveal`, `RevealItem`) that receive already-rendered Server Component output as `children`. This confirms Claude's discretion lean in CONTEXT.md — CSS + a small custom hook is not just adequate, it is a better fit than a library here: nothing in this phase's scope needs spring physics, gesture tracking, or cross-component animation orchestration (`motion/react`'s actual value-add), and the project's own Phase 7 precedent explicitly requires a strong case before adding a new dependency.

One dependency IS justified, but it isn't an animation *library* — it's a static CSS utility-class package. `src/components/ui/accordion.tsx` (D-13), plus three other untouched shadcn files (`sheet.tsx`, `dropdown-menu.tsx`, `select.tsx`), already reference `animate-in`/`animate-out`/`fade-in-0`/`zoom-in-95`/`slide-in-from-*`/`animate-accordion-up`/`animate-accordion-down` utility classes that resolve to nothing today (no `tailwindcss-animate`, no matching `@theme` keyframes). `tw-animate-css` is the actively-maintained, zero-JS, zero-postinstall, 35M-weekly-download official shadcn-v4 companion package that defines exactly these class names — installing it and adding one `@import` line fixes the Sheet-based mobile nav (D-08), the dropdown/select popovers, AND resolves most of the accordion's missing classes in one shot. The one exception: `tw-animate-css`'s stock `accordion-down`/`accordion-up` keyframes animate the `height` property directly, which conflicts with this project's locked D-03 (transform/opacity only) and CONTEXT.md's explicit accordion guidance. The accordion needs a hand-rolled `grid-template-rows: 0fr → 1fr` fix instead (CONTEXT.md's second candidate), not the package's default classes.

**Primary recommendation:** CSS/Tailwind + one custom `IntersectionObserver` hook (`useInView`) + two thin client wrapper components (`Reveal` for section-level, `RevealItem` for per-item stagger inside grid blocks) — zero new *animation* dependency. Add `tw-animate-css` (~10KB CSS, zero JS, verified OK) as a devDependency solely to unblock the three already-broken shadcn `data-state` transition utilities (Sheet/DropdownMenu/Select); do NOT let its accordion keyframes drive the FAQ fix — hand-roll `grid-template-rows` for that specific case.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scroll-triggered reveal (fade/rise/slide) | Browser / Client | — | Requires `IntersectionObserver`, a browser-only API; must live behind a `"use client"` leaf per React 19 RSC rules |
| Stagger sequencing | Browser / Client | — | CSS `transition-delay` computed from a JS-supplied index; same client leaf as reveal |
| Hover / `:active` tap feedback | Browser / Client (CSS only) | — | Pure CSS pseudo-classes (`:hover`, `:active`) — no JS/observer needed at all |
| `prefers-reduced-motion` gating | Browser / Client (CSS) + Client (JS check) | — | CSS media query handles hover/active; the JS hook must also check `matchMedia` once on mount to skip the reveal transition entirely |
| Accordion open/close height animation | Browser / Client (CSS, Radix-driven) | — | Radix already exposes `--radix-accordion-content-height`; pure CSS via `grid-template-rows`, no new JS |
| Block-level reveal wiring (which blocks get wrapped) | Frontend Server (RSC composition) | Browser / Client | `RenderBlocks.tsx` (RSC) decides *which* rendered output to wrap in the client `Reveal` boundary; the boundary itself is Client tier |
| Mobile nav open/close transition (D-08) | Browser / Client (CSS, Radix Dialog-driven) | — | Already client-side (`MobileNavPanel.tsx`, Radix `Dialog`/Sheet); only the missing CSS utility classes need to resolve |
| Floating WhatsApp entrance (D-09) | Frontend Server (RSC, static CSS animation) | — | `WhatsAppFloatingButton.tsx` stays a Server Component; entrance is a `@theme` keyframe `animate-*` class with no JS trigger needed (always in viewport at mount) |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS v4 (already installed) | `~4.3.2` | Reveal/hover/active transitions, `@theme` custom keyframes, `motion-reduce:`/`motion-safe:` variants | Already the project's styling layer; v4's CSS-first `@theme` supports custom `--animate-*` + `@keyframes` natively, no plugin required [CITED: tailwindcss.com/docs/theme] |
| React 19 / Next.js 16 (already installed) | `19.2.4` / `16.2.10` | Client-boundary hook + wrapper components | No version-specific API needed beyond standard `useEffect`/`useRef`/`useState`; Server→Client children interleaving is core App Router behavior [CITED: nextjs.org/docs/app/getting-started/server-and-client-components] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tw-animate-css` | `1.4.0` (verified current, published 2025-09-24, last updated 2026-02-28) | Resolves already-referenced-but-undefined `animate-in`/`fade-in-0`/`zoom-in-95`/`slide-in-from-*` utility classes in `sheet.tsx`, `dropdown-menu.tsx`, `select.tsx` | Add once; import in `globals.css`. Do NOT rely on its `animate-accordion-down`/`animate-accordion-up` classes — those animate `height` directly (see Pitfall 1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `useInView` hook + CSS transitions | `motion/react` (`whileInView`, `useReducedMotion`) — the design-taste-frontend skill's own default | Motion is the *correct* default for orchestrated/spring/gesture-driven motion; this phase's scope (D-01 "restrained fluid CSS tier", no scroll-hijack, no magnetic cursor, no pinned stacks) never needs `useMotionValue`/`useTransform`/spring physics. Motion would add ~20-50KB gzipped bundle weight sitewide (every page renders CMS blocks) for zero orchestration benefit over CSS transitions + one observer. Rejected per Phase 7's explicit YAGNI precedent + this project's stated JS-bundle discretion ("as close to zero added weight as the chosen approach allows") |
| Hand-rolled `grid-template-rows` accordion fix | `tw-animate-css`'s stock `animate-accordion-down`/`up` | Rejected for the accordion specifically — those keyframes animate `height` (layout-triggering), violating locked D-03. Used only for Sheet/DropdownMenu/Select, whose `fade-*`/`zoom-*`/`slide-*` classes are transform+opacity only |
| CSS `animation-timeline: view()` (native scroll-driven animations) | IntersectionObserver hook | Chrome/Edge only as of this research; no Safari/Firefox support — CONTEXT.md already flags this as risky for the GCC/Africa/Europe/CIS audience. Not used as the primary mechanism; could be layered later as a progressive enhancement behind `@supports (animation-timeline: view())`, out of scope for this phase |

**Installation:**
```bash
npm install -D tw-animate-css
```

**Version verification:**
```bash
npm view tw-animate-css version
# 1.4.0
npm view tw-animate-css time.modified
# 2026-02-28T13:22:41.202Z (actively maintained)
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `tw-animate-css` | npm | ~10 months (first published 2025-09-24) | 35.3M/week | `github.com/Wombosvideo/tw-animate-css` | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Verified via `gsd-tools query package-legitimacy check --ecosystem npm tw-animate-css` → `{"verdict":"OK","signals":{"exists":true,"publishedAt":"2025-09-24T05:25:53.055Z","weeklyDownloads":35294133,"repoUrl":"git+https://github.com/Wombosvideo/tw-animate-css.git","deprecated":false,"postinstall":null}}`. No postinstall script (`npm view tw-animate-css scripts.postinstall` returns empty). [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```
CMS page.layout[] (Payload)
        |
        v
RenderBlocks.tsx (RSC — unchanged data flow)
        |
        | for each block:
        |   is blockType === "hero"?
        |     yes -> render <HeroBlock> directly (NO reveal wrapper — LCP exception, D-07)
        |     no  -> render <Component block index /> (still RSC, fetches CMS data server-side)
        |            then wrap the RESULT in <Reveal> (client boundary, children = already-rendered RSC output)
        v
<Reveal> (Client Component leaf)
        |
        | on mount: check prefers-reduced-motion via matchMedia
        |   reduced -> render children already "revealed" (no observer attached, no transition)
        |   not reduced -> attach ONE IntersectionObserver to its own wrapper div
        |                  on first intersect (threshold ~0.2) -> add data-revealed, THEN unobserve (D-06: no replay)
        v
Browser paints children with CSS transition (opacity + translateY, ease-out-expo curve, ~0.6s)
        |
        | INSIDE a grid block's own item .map() loop (FeatureGridBlock, TestimonialsBlock,
        | MediaGalleryBlock, TrustBarBlock, CertStripBlock, etc. — 6+ of the 14 registered blocks):
        v
<RevealItem index={i}> (Client Component leaf, own tiny IntersectionObserver instance)
        |
        | transition-delay = min(index, CAP) * 50ms  (CAP prevents slow march on large catalogs, CAT-03)
        v
Card/item fades+rises in with tight stagger

Separately, always-mounted chrome (no scroll trigger needed):
WhatsAppFloatingButton.tsx (RSC, fixed position)
        -> `animate-float-in` @theme keyframe class, plays once on paint, no JS

MobileNavPanel.tsx (already "use client", Radix Sheet/Dialog)
        -> data-state=open/closed already wired -> just needs tw-animate-css's
           fade-in-0/slide-in-from-{side} utility classes to resolve

accordion.tsx (Radix Accordion, already "use client")
        -> data-state=open/closed already wired -> grid-template-rows 0fr->1fr
           CSS trick (hand-rolled, NOT tw-animate-css's height-based classes)
```

### Recommended Project Structure
```
src/
├── components/
│   ├── motion/                  # NEW — small, colocated, UI-facing (not src/hooks/, see Pitfall 3)
│   │   ├── useInView.ts         # IntersectionObserver hook, "use client"
│   │   ├── Reveal.tsx           # section-level wrapper for RenderBlocks.tsx
│   │   └── RevealItem.tsx       # item-level wrapper for grid .map() loops, accepts index + optional direction
│   ├── blocks/
│   │   └── RenderBlocks.tsx     # EDIT — wraps non-hero block output in <Reveal>
│   └── ui/
│       ├── accordion.tsx        # EDIT — grid-template-rows fix (D-13)
│       ├── sheet.tsx            # untouched — just needs tw-animate-css import to resolve
│       ├── button.tsx           # EDIT — add active:scale-[0.98] to base cva string (D-11, sitewide in one place)
│       └── ...
└── app/
    └── globals.css              # EDIT — @import "tw-animate-css"; + @theme reveal/float keyframes
```

### Pattern 1: `useInView` hook (once-per-load, reduced-motion-safe)
**What:** A single `IntersectionObserver`-backed hook returning `{ ref, inView }`, unobserving after first trigger (D-06), short-circuiting entirely when `prefers-reduced-motion: reduce` is set.
**When to use:** Any scroll-triggered reveal — section-level (`Reveal`) and item-level (`RevealItem`) both build on this.
**Example:**
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

### Pattern 2: `Reveal` — section-level wrapper consuming RSC children
**What:** A client-boundary leaf that wraps already-rendered Server Component output. The block components (`StatsBandBlock`, `FeatureGridBlock`, etc.) remain `async` Server Components — nothing about their data-fetching changes.
**When to use:** In `RenderBlocks.tsx`, wrapping every non-hero block.
**Example:**
```tsx
// src/components/motion/Reveal.tsx
"use client";
import { useInView } from "./useInView";

// RESEARCH Phase 9 / D-05, D-07: uniform fade+rise reveal shape, applied by
// RenderBlocks.tsx around every non-hero block's already-rendered output.
// Server Components CAN be passed as children to a Client Component boundary
// without becoming Client Components themselves — the RSC payload for
// `children` is rendered server-side and streamed in as-is.
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
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
```tsx
// src/components/blocks/RenderBlocks.tsx — the only edit needed here
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

### Pattern 3: `RevealItem` — per-item stagger inside grid blocks
**What:** Same hook, own observer instance per item, `transition-delay` computed from index and capped.
**When to use:** Inside the `.map()` loop of grid-shaped blocks (`FeatureGridBlock`, `TestimonialsBlock`, `MediaGalleryBlock`, `TrustBarBlock`, `CertStripBlock`, plus `ProductCard`/`InsightCard` grids outside the block system) — the blocks are still `async` RSC; only the individual `<Card>` gets wrapped.
**Example:**
```tsx
// src/components/motion/RevealItem.tsx
"use client";
import { useInView } from "./useInView";

// RESEARCH Phase 9 / D-05/D-06/D-10 discretion ("tight stagger, cap for
// larger catalogs"): delay caps at STAGGER_CAP items so a 40-item grid
// doesn't take a slow item-by-item march to finish revealing (CAT-03).
const STAGGER_MS = 50;
const STAGGER_CAP = 8; // items beyond this all share the capped max delay

export function RevealItem({
  children,
  index,
  direction = "up", // "up" default (D-05); "start"/"end" for directional slide (D-10)
}: {
  children: React.ReactNode;
  index: number;
  direction?: "up" | "start" | "end";
}) {
  const { ref, inView } = useInView();
  const delay = Math.min(index, STAGGER_CAP) * STAGGER_MS;

  const initialTransform =
    direction === "up"
      ? "translate-y-4"
      : direction === "start"
        ? "-translate-x-4 rtl:translate-x-4" // D-10: logical direction via rtl: variant
        : "translate-x-4 rtl:-translate-x-4";

  return (
    <div
      ref={ref}
      data-revealed={inView || undefined}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${initialTransform} opacity-0 transition-[opacity,transform] duration-[0.5s] ease-[cubic-bezier(0.16,1,0.3,1)] data-[revealed]:translate-x-0 data-[revealed]:translate-y-0 data-[revealed]:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none`}
    >
      {children}
    </div>
  );
}
```
```tsx
// src/components/blocks/FeatureGridBlock.tsx — item map, minimal diff
import { RevealItem } from "@/components/motion/RevealItem";
// ...
{items.map((item, i) => (
  <RevealItem key={i} index={i}>
    <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      {/* unchanged */}
    </Card>
  </RevealItem>
))}
```
**Why per-item observers, not one shared observer + CSS ancestor selector:** `IntersectionObserver` was specifically designed to batch geometry computation off the main thread and stay cheap at scale (unlike scroll listeners) — the project's own D-04 rationale for banning `window.addEventListener("scroll")` already assumes this. CMS grids in this project render a handful to a few dozen cards per page (catalog pagination, not infinite lists), well within the range where N small observers is simpler and more robust than prop-drilling a shared "revealed" boolean through a context provider for a two-file feature.

### Pattern 4: Hover + tap feedback — pure CSS, no JS
**What:** Reuse the existing `shadow-card`/`shadow-card-hover` tokens (Phase 6) and `group-hover` pattern already proven in `ProductCard.tsx`. Add `active:scale-[0.98]` once, at the `buttonVariants` base string, not per call site.
**When to use:** Cards (D-10 default: `translateY(-2px` to `-4px)` + shadow deepen), buttons (D-11 tap feedback).
**Example — already-correct existing pattern to replicate (ProductCard.tsx, unchanged, cite as the model):**
```tsx
// src/components/products/ProductCard.tsx (EXISTING — this IS the pattern)
<Card className="... shadow-card transition-transform duration-150 group-hover:-translate-y-[1px] group-hover:shadow-card-hover ...">
```
**Example — button tap feedback, ONE edit site (D-11, D-08 P02 precedent: consolidate into buttonVariants, not per call site):**
```tsx
// src/components/ui/button.tsx — base cva string, append:
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none active:scale-[0.98] motion-reduce:active:scale-100 ...",
  { /* variants unchanged */ }
)
```
Note: `src/components/ui/**` carries a "shadcn registry, never hand-edited" comment in `scripts/check-physical-direction.mjs`, but Phase 8 P02 already edited `button.tsx`'s `buttonVariants` cva string to consolidate hover/focus treatment sitewide — this project's established practice is that *token-level* edits to the base `cva` string are in-scope; swapping the underlying Radix wiring is not. This phase's `active:scale-[0.98]` addition follows the same precedent.

### Pattern 5: Accordion fix — `grid-template-rows`, not `height`
**What:** Replace the (currently non-functional) `animate-accordion-up`/`animate-accordion-down` classes with a CSS grid trick that never animates `height`/`max-height` directly.
**When to use:** `src/components/ui/accordion.tsx`, `AccordionContent` (D-13).
**Example:**
```tsx
// src/components/ui/accordion.tsx — AccordionContent, replaced implementation
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount // keep mounted so the grid-rows transition can play both ways
      className="grid grid-rows-[0fr] text-sm transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
      {...props}
    >
      <div className={cn("overflow-hidden pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
```
`grid-template-rows` is explicitly carved out as an allowed exception in CONTEXT.md's Accordion discretion note ("transform/opacity/grid-template-rows-based") even though the general D-03 wording says "never top/left/width/height" — `grid-template-rows` is neither `height` nor a physical-direction property, and does not require Radix's `--radix-accordion-content-height` custom property or JS-measured pixel values at all, which is *more* robust than the CSS-custom-property keyframe alternative (no dependency on Radix internals staying stable across versions). Requires `forceMount` on `AccordionPrimitive.Content` so the closed (`0fr`) and open (`1fr`) states can both transition rather than the content unmounting on close (Radix's default `Presence`-driven unmount would otherwise skip the closing transition). [CITED: radix-ui.com/primitives/docs/components/accordion — `forceMount` prop documented for exactly this "animate content that would otherwise unmount" case]

### Pattern 6: Floating WhatsApp button entrance — pure `@theme` keyframe, no JS at all
**What:** A one-shot `@theme`-defined `animate-*` utility applied directly in the RSC (no client boundary needed — it's always in the viewport at mount, so no `IntersectionObserver` trigger is meaningful).
**Example:**
```css
/* src/app/globals.css — inside @theme */
--animate-float-in: float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
@keyframes float-in {
  from { opacity: 0; transform: translateY(16px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```
```tsx
// src/components/chrome/WhatsAppFloatingButton.tsx — stays an RSC, add ONE class
className="fixed bottom-md end-md z-40 inline-flex size-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-card-hover transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 animate-float-in motion-reduce:animate-none"
```

### Anti-Patterns to Avoid
- **A shared client-side context provider for "grid is revealed" state:** tempting for "one observer per grid instead of N", but adds a context boundary + provider file for a project this size's grids (a few to a couple dozen items per page). `RevealItem`'s per-instance observer is simpler and equally cheap; only revisit if a future phase renders hundreds of items per page.
- **Wrapping `HeroBlock` in `Reveal`:** breaks D-07's explicit LCP exception — `RenderBlocks.tsx` must special-case `blockType === "hero"` and skip the wrapper entirely, not rely on threshold timing to "happen to" paint immediately.
- **Animating `height`/`max-height` for the accordion:** this is exactly what's already broken (D-13) and exactly what `tw-animate-css`'s stock accordion classes would reintroduce if used as-is.
- **`window.addEventListener("scroll")` anywhere:** banned by D-04; not needed by any pattern above.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resolving the already-broken `fade-in-0`/`zoom-in-95`/`slide-in-from-*` utility classes referenced in `sheet.tsx`/`dropdown-menu.tsx`/`select.tsx` | Hand-written `@theme` keyframes duplicating Radix's `data-side`/`data-state`-aware enter/exit variants for 3 separate components | `tw-animate-css` `@import` | These are transform+opacity-only (safe under D-03), actively maintained, and re-deriving the same 6+ keyframe/variant combinations by hand for 3 files is strictly more code for an identical result |
| Cross-fading/height-animating Radix Accordion content | JS-measured `scrollHeight` + `useState` + manual transition (the pre-CSS-grid-trick approach) | `grid-template-rows: 0fr -> 1fr` (Pattern 5) | No JS measurement, no layout thrash from `height`, no dependency on `--radix-accordion-content-height` staying stable across Radix upgrades |
| `prefers-reduced-motion` detection for hover/`:active` | A JS `matchMedia` listener toggling a "no-hover-transition" class | Tailwind's native `motion-reduce:`/`motion-safe:` variants | Zero JS, zero re-render, works even before hydration — CSS media queries apply immediately on paint |

**Key insight:** Every "hand-roll" temptation in this phase is actually a sign that a CSS-native primitive (a variant, a media query, a grid property) already solves it — the phase's own restrained motion register (D-01) is what makes CSS sufficient; a JS orchestration library would be solving a problem this phase doesn't have.

## Common Pitfalls

### Pitfall 1: `tw-animate-css`'s accordion classes animate `height` — silently reintroducing the D-13 root cause
**What goes wrong:** Installing `tw-animate-css` alone (without also editing `accordion.tsx`) makes `animate-accordion-up`/`animate-accordion-down` "work" — but their keyframes animate `height: 0` -> `height: var(--radix-accordion-content-height)` directly, which is exactly the "no animating height/width/top/left" constraint D-03 forbids.
**Why it happens:** The class names already in `accordion.tsx` match `tw-animate-css`'s naming exactly, so the fix looks "free" once the package is installed — but free-and-correct are different things here.
**How to avoid:** Apply Pattern 5 (`grid-template-rows`) to `accordion.tsx` explicitly; do not delete/rewrite it expecting `tw-animate-css` to "just handle it."
**Warning signs:** If `AccordionContent`'s className still reads `data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down` after this phase, the height-based animation is still active.

### Pitfall 2: Wrapping a Server Component's *definition* in `"use client"` instead of wrapping its *rendered output*
**What goes wrong:** A natural first instinct is to add `"use client"` to the top of `FeatureGridBlock.tsx`/`StatsBandBlock.tsx` etc. so they can call `useInView()` directly. This breaks their existing `await getTranslations(...)` / CMS data-fetching (Client Components can't be `async` functions that `await` in the component body the way Server Components can) and unnecessarily ships them to the client bundle.
**Why it happens:** Reaching for a hook feels like it requires the calling component to be a Client Component — true in general, but not when the hook only needs to wrap already-rendered `children`.
**How to avoid:** Keep every existing block component as-is (still `async`, still server-rendered); only `Reveal`/`RevealItem` — new, tiny, presentation-only leaves — get `"use client"`. `RenderBlocks.tsx` and each block's `.map()` loop stay Server Components that simply nest a Client Component around output they already produced.
**Warning signs:** Any existing block file gaining an `"use client"` directive during this phase is a sign the wrong boundary was chosen.

### Pitfall 3: Naming collision with the existing `src/hooks/` directory
**What goes wrong:** `src/hooks/` already exists in this codebase — but it holds **Payload CMS collection lifecycle hooks** (`revalidateCatalog.ts`, `revalidateInsights.ts`, `revalidatePage.ts`, `revalidateSiteSettings.ts`), a completely different concept from a React hook. Dropping `useInView.ts` into `src/hooks/` would be confusing (and inconsistent with CLAUDE.md's own Architecture section, which documents `src/hooks/` as "Payload hooks").
**How to avoid:** New React client-motion code goes in `src/components/motion/` (Recommended Project Structure above), colocated with the two wrapper components that consume it — matches this project's existing pattern of keeping small, tightly-coupled client leaves together (e.g. `src/components/chrome/`).

### Pitfall 4: `AccordionContent` unmounting on close, silently skipping the closing transition
**What goes wrong:** Radix's `Accordion.Content` uses internal `Presence` to unmount when closed by default. A `grid-template-rows` transition on an element that's about to be removed from the DOM never gets to play — the accordion "snaps closed" instead of animating, looking identical to the pre-fix broken state.
**Why it happens:** `forceMount` is opt-in and easy to miss when adapting shadcn's default `AccordionContent`.
**How to avoid:** Pattern 5 above includes `forceMount` explicitly — verify it's present after the edit.
**Warning signs:** Accordion opens with a smooth animation but closes instantly.

### Pitfall 5: Unbounded stagger delay on large product/insight grids
**What goes wrong:** A naive `transitionDelay: index * 50ms` on a 40-item catalog grid means the last visible item doesn't finish revealing for 2 seconds after scrolling it into view — reads as sluggish, not premium, and actively fights CAT-03's scalability intent.
**How to avoid:** Cap the stagger multiplier (Pattern 3's `STAGGER_CAP`), so delay plateaus after ~8 items regardless of grid size.
**Warning signs:** Visually testing a page with more items than the initial CMS seed content (Phase 6's flagged "real content" gap) — verify against a padded/larger seed set, not just the current handful of placeholder items.

### Pitfall 6: Directional slide (D-10) reading backwards in RTL
**What goes wrong:** A card meant to "slide in from the inline-start edge" uses a hardcoded `-translate-x-4` — correct in LTR (start = left = negative X), but in Arabic RTL the inline-start edge is the *right* side, so the same `-translate-x-4` now slides in from the wrong visual direction.
**How to avoid:** Pattern 3's `direction="start"` branch pairs `-translate-x-4` with `rtl:translate-x-4` — Tailwind's `rtl:` variant flips the sign for Arabic. Run `npm run lint:rtl` (it will NOT catch this specific case since `translate-x-*` isn't in its banned-utilities list — this is a semantic RTL correctness check, not something the existing lint script enforces) plus a manual/e2e visual check in the `ar` Playwright project (`playwright.config.ts` already has an `"ar"` project configured).
**Warning signs:** A directional-slide card visually "arriving from the wrong side" when viewing an Arabic-locale page.

## Code Examples

### `motion-reduce:`/`motion-safe:` — Tailwind's built-in reduced-motion variants (D-12)
```tsx
// Hover/active stays PRESENT but instant under reduced motion — the state
// still changes, it just doesn't animate (D-12's WCAG-aligned interpretation).
className="transition-transform duration-150 hover:-translate-y-1 active:scale-[0.98] motion-reduce:transition-none"
```
[CITED: tailwindcss.com/docs/transition-duration, tailwindcss.com/docs/animation — `motion-reduce:`/`motion-safe:` are core Tailwind variants wrapping `@media (prefers-reduced-motion: ...)`]

### Tailwind v4 `@theme` custom keyframe registration (research focus #4)
```css
/* Keyframes defined INSIDE @theme are tied to their --animate-* variable and
   generate the utility class immediately, no plugin/JS config needed. */
@theme {
  --animate-float-in: float-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  @keyframes float-in {
    from { opacity: 0; transform: translateY(16px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
}
```
[CITED: tailwindcss.com/docs/theme — "Define the @keyframes rules for your --animate-* theme variables within @theme to include them in your generated CSS"]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `tailwindcss-animate` (JS-config plugin, Tailwind v3 era) | `tw-animate-css` (pure CSS `@import`, Tailwind v4 CSS-first config) | Tailwind v4 GA (2025) dropped JS `tailwind.config.js` plugins from the default flow; `tw-animate-css` is the community-maintained drop-in replacement for exactly the classes shadcn's registry output references | This project's `components.json` already targets Tailwind v4 (`"tailwind": {"config": ""}` — no JS config file); the shadcn components were scaffolded assuming a matching animate package that was never added |
| JS-measured accordion height (`scrollHeight` + inline style) | CSS `grid-template-rows: 0fr -> 1fr` | Popularized ~2023 as the standard "animate to auto height" CSS trick, now Radix's own docs also expose `--radix-accordion-content-height` as an alternative | Both are current; `grid-template-rows` is chosen here specifically for its D-03 compliance (no `height` property touched) |

**Deprecated/outdated:**
- `tailwindcss-animate`: superseded by `tw-animate-css` for Tailwind v4 projects; do not install the older package (it depends on the removed JS plugin API).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `motion-reduce:`/`motion-safe:` remain core (non-plugin) Tailwind v4 variants, unchanged from v3 | Code Examples, Pattern 4 | If removed/renamed in this project's exact `~4.3.2` patch, the reduced-motion hover/active gating would need `@media (prefers-reduced-motion: reduce)` written by hand instead — same outcome, one extra CSS rule. Low risk; these are simple built-in media-query variants, not part of the removed JS config surface, and were still returned as current in search results during this research pass. |
| A2 | CMS grids in this project render at most a few dozen items per page (justifying per-item `IntersectionObserver` instances over a shared-context approach) | Pattern 3 | If a future catalog page renders hundreds of items unpaginated, per-item observers could add measurable overhead; the fallback (shared ancestor `data-revealed` + CSS descendant selector, or a single container observer) is a small refactor, not a rewrite. |

## Open Questions

1. **Exact stagger increment value (40-60ms range, planner's discretion per CONTEXT.md)**
   - What we know: CONTEXT.md leaves the exact value open, leaning ~50ms; Pattern 3 above hardcodes 50ms as a reasonable default.
   - What's unclear: whether 50ms should differ between small (3-4 item) FeatureGrid-style blocks vs. larger ProductCard/InsightCard catalog grids.
   - Recommendation: ship with a single `STAGGER_MS = 50` constant across all uses; only split per-grid-type if a live QA pass finds one context reads too slow/fast.

2. **Count-up animation on StatsBand figures**
   - What we know: CONTEXT.md defaults to static (no interval/rAF counter) unless planning finds it clearly worth the complexity; `StatsBandBlock.tsx` is currently a plain server-rendered `<p>` with `tabular-nums`.
   - What's unclear: nothing technical — this is a scope call, not a research gap.
   - Recommendation: keep static per CONTEXT.md's stated default; a count-up would require converting `StatsBandBlock` (or its figure) into a client leaf plus a `requestAnimationFrame`-driven counter, adding real complexity D-01's restrained register doesn't ask for.

## Environment Availability

Skipped — this phase is pure frontend code/CSS (one new devDependency, `tw-animate-css`, already verified above via `npm view`/package-legitimacy gate). No new external services, CLIs, databases, or env vars are introduced.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^4.1.10` (unit/integration, `tests/unit/`, `tests/int/`) + Playwright `^1.61.1` (e2e, `tests/e2e/`) |
| Config file | `vitest.config.ts`, `playwright.config.ts` (testDir `tests/e2e`, `en`/`ar` locale projects already configured) |
| Quick run command | `npm run test -- <pattern>` (vitest), `npm run test:e2e -- <file>` (playwright, single spec) |
| Full suite command | `npm run test && npm run test:e2e && npm run lint:rtl && npm run typecheck` |

### Phase Requirement -> Test Map
| Area | Behavior | Test Type | Automated Command | File Exists? |
|------|----------|-----------|--------------------|-------------|
| Accordion open/close | FAQ accordion animates without JS error, respects `forceMount` | e2e (visual/state) | `npx playwright test tests/e2e/certifications.spec.ts` or a new spec targeting the Contact-page FAQ block | Existing FAQ e2e coverage not confirmed — likely a Wave 0 gap |
| Reduced-motion reveal | With `prefers-reduced-motion: reduce` emulated, content is visible immediately (no hidden `opacity-0` stuck state) | e2e (`page.emulateMedia({ reducedMotion: 'reduce' })`) | new spec, e.g. `tests/e2e/reduced-motion.spec.ts` | Wave 0 gap — no existing reduced-motion test found |
| RTL directional slide | Card slide-in direction mirrors correctly under `ar` locale | e2e (`ar` Playwright project already configured) | `npx playwright test --project=ar tests/e2e/<new-or-existing-block-spec>` | Wave 0 gap for motion-specific assertion; `rtl-arabic.spec.ts`/`responsive-rtl.spec.ts` exist as a base to extend |
| No physical-direction Tailwind classes introduced | `npm run lint:rtl` stays green | static lint | `npm run lint:rtl` | Existing, must stay green (CONTEXT.md canonical ref) |
| Hover/active feedback present but instant under reduced motion | `active:scale-[0.98]` still applies visually (state change), transition duration is `0` | e2e or manual visual check | new assertion inside an existing chrome/interaction spec, or manual QA note | Wave 0 gap |

### Sampling Rate
- **Per task commit:** `npm run typecheck && npm run lint:rtl` (fast, catches broken imports/RTL regressions immediately)
- **Per wave merge:** `npm run test && npm run test:e2e`
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus a manual Lighthouse/CLS spot-check on a page with the most blocks (homepage, per Phase 7's 11-block composition) given D-03's explicit CLS protection intent

### Wave 0 Gaps
- [ ] `tests/e2e/reduced-motion.spec.ts` — covers D-12 (reveal disabled, hover/active present-but-instant under `prefers-reduced-motion: reduce`)
- [ ] Extend an existing FAQ/Contact-page e2e spec (or add one) — covers D-13's accordion fix, verifying open AND close both animate (Pitfall 4)
- [ ] Extend `tests/e2e/rtl-arabic.spec.ts` or add a targeted spec — covers D-10's directional-slide RTL mirroring (Pitfall 6)
- [ ] No new framework install needed — Vitest + Playwright already fully configured with `en`/`ar` locale projects

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | Phase touches no auth surfaces |
| V3 Session Management | No | Phase touches no session/cookie logic |
| V4 Access Control | No | Phase touches no access-gated routes |
| V5 Input Validation | No (marginal) | No new user input is introduced. The only "dynamic" value flowing into a style attribute is a numeric array index (`RevealItem`'s `index` prop, always an internal `.map()` index, never CMS or user-supplied text) — not an injection surface |
| V6 Cryptography | No | Not applicable |

### Known Threat Patterns for this stack
None specific to this phase — no new data flow, no new dependency with a JS runtime footprint (`tw-animate-css` ships CSS only, confirmed no `postinstall` script). Standard dependency-supply-chain hygiene (Package Legitimacy Audit above) is the only relevant control, already satisfied.

## Sources

### Primary (HIGH confidence)
- `npm view tw-animate-css` (version, publish date, postinstall) — direct registry query
- `gsd-tools query package-legitimacy check` — `tw-animate-css` verdict OK, 35.3M weekly downloads, no postinstall
- Codebase inspection: `package.json`, `src/components/ui/accordion.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/select.tsx`, `src/components/blocks/RenderBlocks.tsx`, `src/components/products/ProductCard.tsx`, `src/components/blocks/FeatureGridBlock.tsx`, `src/components/blocks/StatsBandBlock.tsx`, `src/components/chrome/WhatsAppFloatingButton.tsx`, `src/components/chrome/MobileNavPanel.tsx`, `src/components/ui/button.tsx`, `src/app/globals.css`, `scripts/check-physical-direction.mjs`, `playwright.config.ts`, `vitest.config.ts`

### Secondary (MEDIUM confidence)
- [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) — `@theme` custom `@keyframes`/`--animate-*` registration syntax
- [nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — Server Component children passed to Client Component boundaries
- [radix-ui.com/primitives/docs/components/accordion](https://www.radix-ui.com/primitives/docs/components/accordion) — `forceMount`, `--radix-accordion-content-height`
- [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) — accordion keyframes animate `height` directly (verified via `unpkg.com/tw-animate-css@1.4.0/dist/tw-animate.css`)
- WebSearch-verified: Tailwind `motion-reduce:`/`motion-safe:` core variants (tailwindcss.com/docs/transition-duration, /docs/animation)

### Tertiary (LOW confidence)
- None — all claims above were either verified against the codebase directly, confirmed via tool query, or cited from official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack (CSS-only + tw-animate-css): HIGH — verified against `package.json`, npm registry, and package-legitimacy gate directly
- Architecture (Reveal/RevealItem/RenderBlocks wiring): HIGH — grounded in direct inspection of `RenderBlocks.tsx`, `BLOCK_MAP`, and representative block files; RSC/Client interleaving pattern is official documented Next.js behavior
- Pitfalls (accordion height, Server/Client boundary, RTL slide direction): HIGH — each traced to a specific file/line in the current codebase, not speculative

**Research date:** 2026-07-29
**Valid until:** 30 days (stable CSS/Tailwind APIs; re-verify `tw-animate-css` version if this phase's execution slips past ~2026-09)
