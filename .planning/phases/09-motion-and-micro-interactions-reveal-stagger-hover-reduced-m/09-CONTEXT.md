# Phase 9: Motion and Micro-interactions - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Tasteful reveal/stagger/hover/section-transition motion applied across the site, sitewide (not just homepage). `prefers-reduced-motion` respected; RTL-safe; zero CLS/LCP regression. Restrained "fluid CSS" register (Stripe/Linear tier), not expressive/agency-style choreography.

</domain>

<decisions>
## Implementation Decisions

### Motion register (locked)
- **D-01:** Restrained "fluid CSS" tier — subtle `transform`/`opacity` transitions, modest stagger. No scroll-hijacking, no pinned/sticky-stack sections, no magnetic-cursor physics, no GSAP-style choreography. Matches the Stripe/Linear trust-first register already locked for the v2.0 redesign; expressive/agency choreography reads wrong for a B2B procurement audience.
- **D-02:** No specific motion reference beyond the existing Stripe/Linear benchmark already set for this redesign.
- **D-03:** Animate only `transform` and `opacity` (never `top`/`left`/`width`/`height`) — hard constraint protecting PERF-01/PERF-02 CLS goals (Phase 10 hardening will verify).
- **D-04:** No `window.addEventListener('scroll')` for any scroll-linked logic — use IntersectionObserver (or CSS-native scroll-driven animation only where broadly supported; see Claude's Discretion).

### Reveal & stagger behavior (locked)
- **D-05:** Reveal shape = fade + subtle upward rise (~16-24px drift + opacity, ease-out-expo-style curve, ~0.5-0.6s duration). Not fade-only, not a directional slide by default.
- **D-06:** Reveal triggers once per page load per section — no replay on repeated scroll-into-view (scrolling up and back down does not re-trigger).
- **D-07:** Reveal treatment is applied uniformly across every CMS block (user's explicit call, overriding Claude's initial "curated per block" suggestion) — **except** Hero, which is a technical exception, not a style choice: Hero must paint immediately for LCP and must never be gated behind a scroll-reveal trigger.

### Motion coverage (locked)
- **D-08:** GlobalHeader/GlobalFooter/nav: light polish is in scope (e.g. mobile menu open/close transition) if currently abrupt — not a full chrome redesign, just tightening what's jarring.
- **D-09:** Floating WhatsApp button (`WhatsAppFloatingButton.tsx`) and other persistent CTAs get an entrance animation + hover treatment as part of this phase's micro-interaction pass.

### Hover & tap treatment (locked)
- **D-10:** Directional slide-in reveals ARE allowed where they fit (e.g. a card sliding in from inline-start) — not restricted to fade/rise-only. Any directional motion MUST use logical properties (`ms-*/me-*`, translate values mirrored via the `rtl:` variant) and `npm run lint:rtl` must stay green. This is an exception carved out of the otherwise-restrained register — use sparingly and only where direction genuinely reads as intentional.
- **D-11:** Add button tactile `:active` feedback — `scale(0.98)` on tap/click, transform-only, identical behavior LTR/RTL.
- **D-12:** Reduced-motion fallback: `prefers-reduced-motion` disables scroll-reveal animations only (autoplaying, non-user-initiated motion). Hover and `:active` state changes remain present but become instant (no transition duration) — the state still changes, it just doesn't animate. This is the standard WCAG-aligned interpretation, not a blanket "kill all motion."

### Existing bug to fix in this phase (locked)
- **D-13:** `src/components/ui/accordion.tsx` references `animate-accordion-up`/`animate-accordion-down` Tailwind utility classes with no matching keyframes or plugin found anywhere in the codebase (confirmed via `scout_codebase` — no `tailwindcss-animate` dependency, no keyframes in `globals.css`). The FAQ accordion currently has no functioning open/close animation. Fix this as part of this phase's component micro-interaction work.

### Claude's Discretion
- **Library vs. CSS-only implementation approach** — user explicitly deferred this to research ("reserve judgement, decide during research"), rather than locking now. Claude's working lean (stated during discussion, not yet locked): CSS/Tailwind + a small custom IntersectionObserver-based scroll-reveal hook, zero new npm dependency — consistent with Phase 7's explicit YAGNI stance on animation libraries ("no new dependency ... unless a UI-SPEC finding makes a strong case"). The phase researcher should validate this against what the "uniform sitewide + directional slide where it fits" scope actually requires before finalizing — if orchestration complexity (e.g. coordinated stagger across many block types) makes a lightweight library clearly cheaper to build/maintain correctly, that's a legitimate finding, not scope creep.
- **Scroll-reveal detection mechanism** — IntersectionObserver-based hook is the safe default (broad browser support across all target markets: GCC/Africa/Europe/CIS). CSS `animation-timeline: view()` was flagged as risky (Chrome/Edge only, no Safari/Firefox) — avoid as the primary mechanism; researcher may note it as a progressive enhancement only if it doesn't complicate the fallback path.
- **JS bundle budget** — no hard number set; default to "as close to zero added bundle weight as the chosen approach allows," weighed against Phase 10's upcoming CWV hardening pass.
- **Count-up animation on StatsBand figures** — left open; default to static (fade/reveal with the rest of the section, no interval/rAF counter logic) unless planning finds the added complexity clearly worth it. Static is lower-risk for reduced-motion edge cases and layout stability.
- **Product/Insights grid stagger vs. whole-grid fade** — left open; judge per grid size during planning. Guidance from the locked stagger-shape decision (D-05/D-06): if staggering, keep the per-item delay tight (~40-60ms) so larger catalogs (CAT-03 scalability) don't produce a slow item-by-item march.
- **Stagger increment exact value** — left open in the ~40-60ms (tight) to ~120ms (loose) range discussed; Claude leans tight (~50ms) for cohesiveness on larger grids, final value at planner's discretion.
- **Card/button hover treatment specifics** — left open. Default: subtle lift (`translateY(-2px` to `-4px)`) + shadow deepen using Phase 6's existing `shadow-card` → `shadow-card-hover` tokens (already defined, no new tokens needed). Image cards (ProductCard, InsightCard) may additionally get a subtle image `scale(1.03-1.05)` on hover if it reads as premium rather than gimmicky — planner's call.
- **Accordion animation fix implementation** — likely candidates: define the missing keyframes (matching Radix's `--radix-accordion-content-height` CSS custom property, which Radix already exposes), or use the CSS grid-template-rows `0fr → 1fr` trick for a transform/opacity-safe height reveal. Exact approach at planner's/executor's discretion, but must stay `transform`/`opacity`/`grid-template-rows`-based (no animating `height` directly, to avoid layout thrash) and must work in both LTR and RTL.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Redesign brief
- `.planning/references/REDESIGN-PLAN.md` §4 Phase D "Motion & micro-interactions" — original phase brief: "Tasteful reveal/stagger/hover/section transitions. `prefers-reduced-motion` respected; RTL-safe; no CLS/LCP regression."
- `.planning/ROADMAP.md` Phase 9 section — goal statement and dependency on Phase 8.

### Prior-phase tokens this phase builds on (do not re-litigate)
- `.planning/phases/06-design-system-elevation-premium-type-scale-display-tokens-rh/06-CONTEXT.md` — `shadow-card`/`shadow-card-hover`, `radius-card`, rhythm/spacing tokens already exist in `globals.css` `@theme`; this phase applies motion to elements already styled with these tokens, does not add new visual tokens.
- `.planning/phases/07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust/07-CONTEXT.md` — explicitly deferred "Motion/animation on the hero or new blocks" to this phase; also set the precedent of "no new npm dependencies ... unless a UI-SPEC finding makes a strong case" (YAGNI on libraries) which directly informs this phase's Implementation Approach discretion above.
- `.planning/phases/08-component-polish-pass-apply-amended-design-system-across-car/08-CONTEXT.md` — component polish (cards, buttons, FAQ accordion structure) is complete; this phase adds motion on top of that finished visual work, not more visual changes.

### RTL enforcement
- `scripts/check-physical-direction.mjs` (run via `npm run lint:rtl`) — must stay green. Any directional motion (D-10) must use logical properties, never `left`/`right`/`ml-*`/`mr-*`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadow-card` / `shadow-card-hover` tokens in `src/app/globals.css` `@theme` (Phase 6) — ready to use for hover-lift treatment, no new tokens needed.
- `src/components/ui/accordion.tsx` — Radix-based, exposes `--radix-accordion-content-height`; needed for the accordion animation fix (D-13).

### Established Patterns
- CMS block registration pattern (`src/blocks/*.ts` config + `src/components/blocks/*Block.tsx` renderer + `RenderBlocks.tsx` `BLOCK_MAP`) — motion wrapping should follow this existing per-block renderer structure, not a global wrapper that bypasses it.
- No motion/animation library currently installed (`package.json` has no `framer-motion`, `motion`, `gsap`, or `react-spring`) — confirmed via codebase scout.
- No `IntersectionObserver` usage anywhere in `src/` today — this phase introduces the pattern from scratch.
- No `prefers-reduced-motion` handling anywhere in `src/app/globals.css` today — this phase introduces it from scratch (non-negotiable per D-12).

### Integration Points
- 17 block renderers in `src/components/blocks/` — all in scope for uniform reveal treatment (D-07) except `HeroBlock.tsx` (LCP exception).
- `src/components/products/ProductCard.tsx`, `src/components/insights/InsightCard.tsx`, `src/components/blocks/CertCard.tsx` — card grids in scope for hover + stagger/reveal decisions.
- `src/components/chrome/WhatsAppFloatingButton.tsx` — in scope per D-09.

</code_context>

<specifics>
## Specific Ideas

No specific reference site beyond the existing Stripe/Linear benchmark for the v2.0 redesign (confirmed, not changed this phase).

Craft-bar guidance sourced via the `design-taste-frontend` skill (per project's frontend-craft standard) informed the reveal-shape, stagger-pace, and motion-register decisions above — cross-checked against this project's already-locked design language (Phase 6-8 tokens) rather than treated as a fresh greenfield brief.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. The accordion animation bug (D-13) was raised as a codebase finding, not scope creep, and the user explicitly chose to fix it within this phase since it falls squarely within "component micro-interaction motion."

</deferred>

---

*Phase: 9-motion-and-micro-interactions-reveal-stagger-hover-reduced-m*
*Context gathered: 2026-07-29*
