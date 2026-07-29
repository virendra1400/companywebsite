# Phase 9: Motion and Micro-interactions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-07-29
**Phase:** 09-motion-and-micro-interactions-reveal-stagger-hover-reduced-m
**Areas discussed:** Implementation approach, Motion coverage / scope, Reveal & stagger behavior, Hover style & RTL-safe motion

---

## Implementation approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS/Tailwind + scroll hook | Zero new deps, IntersectionObserver-based hook + Tailwind transitions | |
| motion/react library | Richer choreography, first animation dependency in project | |
| You decide | Claude picks per interaction | ✓ |

**User's choice:** You decide (initial pass), later refined to "reserve judgement, decide during research" when asked to lock CSS-only as final.
**Notes:** User did not want to fully commit either way before research sees exactly what's needed.

| Option | Description | Selected |
|--------|-------------|----------|
| IntersectionObserver hook | Broad browser support, pairs with CSS transitions | |
| CSS animation-timeline: view() | Zero JS but Chrome/Edge only | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it minimal | No measurable bundle growth priority | |
| Small budget OK (~5-10kb gzip) | Acceptable for meaningful polish | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Fix accordion animation gap in this phase | Falls in this phase's domain | ✓ |
| Leave it, log to deferred-items.md | Out of scope | |
| You decide | | |

**User's choice:** Fix it in this phase.
**Notes:** Discovered during codebase scout - `accordion.tsx` references `animate-accordion-up/down` classes with no matching keyframes anywhere; FAQ open/close currently has no animation.

| Option | Description | Selected |
|--------|-------------|----------|
| Lock CSS + hook, no library | Final, no re-litigation | |
| Reserve judgement, decide during research | Let researcher evaluate once it sees the interactions needed | ✓ |

**User's choice:** Reserve judgement, decide during research.

| Option | Description | Selected |
|--------|-------------|----------|
| Same Stripe/Linear restraint | No new reference needed | ✓ |
| Something else in mind | | |

**User's choice:** Same Stripe/Linear restraint.

| Option | Description | Selected |
|--------|-------------|----------|
| Count-up on reveal | Numbers animate 0 to final value | |
| Static, just fade/reveal with section | Simpler, less risk | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Selective, curated per block | Claude judges which blocks benefit | |
| Uniform - every block reveals the same way | Simpler mental model | ✓ |

**User's choice:** Uniform - every block reveals the same way.
**Notes:** Overrides Claude's initial recommendation of "selective, curated." Hero remains excluded as a technical LCP necessity, not a style choice (captured as D-07 in CONTEXT.md).

---

## Motion coverage / scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sitewide - all pages | Homepage + interior pages + all card grids | |
| Homepage + card grids only | Interior static pages get no new treatment | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Stagger individual cards | Premium-grid feel | |
| Fade grid in as one unit | Simpler, safer for large catalogs | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Out of scope - chrome unchanged | Avoid re-touching recently-polished chrome | |
| Light polish OK | Nav interactions fair game if currently abrupt | ✓ |
| You decide | | |

**User's choice:** Light polish OK.

| Option | Description | Selected |
|--------|-------------|----------|
| Include - entrance + hover treatment | Fits "micro-interactions" scope | ✓ |
| Leave as-is | Don't touch a recently-shipped element | |
| You decide | | |

**User's choice:** Include - entrance + hover treatment.

---

## Reveal & stagger behavior

*Informed by the `design-taste-frontend` skill (per the project's frontend-craft standard), cross-checked against this project's already-locked Phase 6-8 design tokens rather than treated as a fresh greenfield brief.*

| Option | Description | Selected |
|--------|-------------|----------|
| Restrained - fluid CSS tier | Subtle transform/opacity, modest stagger, no scroll-hijack/pin/magnetic effects | ✓ |
| More expressive | Richer choreography if it reads premium | |

**User's choice:** Restrained - fluid CSS tier.

| Option | Description | Selected |
|--------|-------------|----------|
| Fade + subtle rise | ~16-24px drift + opacity, ease-out-expo, ~0.5-0.6s | ✓ |
| Fade only | Opacity-only, zero movement | |
| You decide | | |

**User's choice:** Fade + subtle rise.

| Option | Description | Selected |
|--------|-------------|----------|
| Tight cascade, ~50ms | Cohesive reveal, scales to larger grids | |
| Looser cascade, ~120ms | Each item more distinctly separate | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Once only | Avoids twitchy re-triggering on scroll direction changes | ✓ |
| Replay every re-entry | More "alive" but can distract | |

**User's choice:** Once only.

---

## Hover style & RTL-safe motion

| Option | Description | Selected |
|--------|-------------|----------|
| Fade/rise only, no directional slide | Zero RTL mirroring risk | |
| Allow directional slide where it fits | Must use logical properties, lint:rtl must stay green | ✓ |

**User's choice:** Allow directional slide where it fits.
**Notes:** Carve-out from the otherwise-restrained register; captured as D-10 with explicit logical-property requirement.

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle lift + shadow deepen | Uses existing Phase 6 shadow-card tokens | |
| Lift + image zoom | More expressive, common in premium catalog sites | |
| You decide | | ✓ |

**User's choice:** You decide.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes - scale(0.98) on :active | Physical-push feel, transform-only | ✓ |
| Skip - hover state is enough | | |

**User's choice:** Yes - scale(0.98) on :active.

| Option | Description | Selected |
|--------|-------------|----------|
| Disable scroll-reveal only, keep hover/tap instant-but-present | Standard WCAG-aligned interpretation | ✓ |
| Disable all motion including hover transitions | Maximally conservative | |

**User's choice:** Disable scroll-reveal only, keep hover/tap instant-but-present.

---

## Claude's Discretion

- Library vs. CSS-only implementation approach (final call deferred to research)
- Scroll-reveal detection mechanism (leaning IntersectionObserver)
- JS bundle budget (no hard number)
- Count-up animation on StatsBand figures (leaning static)
- Product/Insights grid stagger vs. whole-grid fade (leaning stagger, tight increment)
- Exact stagger increment value (~40-120ms range)
- Card/button hover treatment specifics (leaning lift + shadow, optional image zoom)
- Accordion animation fix implementation approach (transform/grid-template-rows based, not animating height directly)

## Deferred Ideas

None - discussion stayed within phase scope. The accordion animation bug was raised as a codebase finding and folded into this phase's scope rather than deferred, since it falls squarely within "component micro-interaction motion."
