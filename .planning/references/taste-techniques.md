# Frontend Design Techniques — Reference Notes

> **Source:** design-technique rules extracted from the `taste-skill` repo
> (github.com/Leonxlnx/taste-skill), MIT. Persona / security-override /
> hidden-reasoning wrapper content was **stripped** — only neutral, factual
> design guidance is kept here.
>
> **Authority:** this is a SUPPLEMENTARY execution heuristic, not a contract.
> Where anything here conflicts with a phase UI-SPEC or CONTEXT decision, the
> **UI-SPEC / CONTEXT wins** (e.g. we use IBM Plex per Phase 1, and a
> deliberate green+gold two-accent system — do not "correct" those to match a
> generic rule below). Use these to raise execution polish, not to override
> locked decisions.

## Typography
- Display headlines: tight tracking, `leading-none` on large sizes.
- Body: relaxed leading, cap measure at ~65ch (`max-w-[65ch]`).
- Italics with descenders (y g j p q): reserve line-height/padding so they don't clip.
- Emphasis via italic/bold within the SAME family (we use IBM Plex — no mixed-family).

## Spacing & Layout
- Hero content fits the initial viewport; cap hero top padding.
- Hero stack: ≤4 elements (optional eyebrow, headline ≤2 lines, subtext ≤~20 words, CTAs).
- Prefer CSS Grid over flex `calc()` math for columns.
- Viewport stability: `min-h-[100dvh]` not `h-screen`.
- Vary layout family every section; avoid >2 consecutive image+text splits.

## Color & Contrast
- Off-black / off-white, never pure `#000`/`#fff`.
- Tinted shadows (background-hue), no neon outer glows — prefer inner borders / tinted shadows.
- One color theme per page (no mid-scroll inverted sections).
- WCAG AA min (4.5:1 body, 3:1 large); AAA target for hero copy.
- (Our system: single-per-page dominant + green primary + gold accent-as-trim — already compliant.)

## Cards & Surfaces
- Cards only for real hierarchy elevation; otherwise group with borders / negative space.
- Consistent corner-radius family across the page.
- High-density sections: drop card containers, let data breathe.

## Interactive States
- `:active`: subtle `-translate-y-[1px]` or `scale-[0.98]` tactile feedback.
- Button labels 1–3 words, one line at desktop.
- One CTA intent per page (no synonym duplication).
- Labels above inputs; error text below; never placeholder-as-label. (Matches our Contact form spec.)

## Motion
- Animate ONLY `transform` + `opacity` (composited).
- Every animation justified in one sentence (hierarchy / feedback / state / storytelling).
- Gate non-trivial motion behind `prefers-reduced-motion: no-preference`.
- No raw scroll listeners in React — use IntersectionObserver / a scroll hook.
- (Our brief = restrained/calm premium: keep motion low.)

## Images & Visuals
- Real photography / real SVG logos (no text-only fake screenshots, no fake wordmark logo walls).
- Hero needs a real visual asset (we use a photography slot + gradient; placeholder now).
- Bento/feature grids: real variation per cell, not all white text cards.

## Data & Lists
- Long lists (>5): card grid / tabs / carousel, not default `<ul> divide-y`.
- Spec tables: 2-col card grid or grouped chunks, not row-by-row borders.
- Never fabricate spec numbers — real data or label as mock. (Matches our no-fabrication legal caution.)

## Content Density
- Sub-paragraphs ≤~25 words; eyebrow labels sparingly (≤1 per 3 sections).
- Project house-style note from source: avoid em-dash. **(IGNORE for our copy — not a real constraint; our content style is its own decision.)**

## Responsive
- Nav one line at desktop, condense/hamburger otherwise (we already do — Phase 1 chrome).
- Asymmetric layouts collapse to single column below `md` (768px).
- Mobile-first with explicit `<768px` fallbacks per multi-column section.

## Performance
- Hero image `priority`/preload; lazy-load below-fold; document z-index scale.
- Animate only composited props. (Aligns with PERF phase.)

## Glassmorphism / Dark mode (situational)
- Glass: only for premium/luxury accents, with a solid fallback under `prefers-reduced-transparency`. Use sparingly if at all.
- Dark mode: NOT in current scope — our design system is light-first (deep-green footer only). Skip unless requested.
