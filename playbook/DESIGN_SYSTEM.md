# DESIGN_SYSTEM — VNP Global

Scope: tokens + rules. Component-level specs live in COMPONENT_LIBRARY.md. Everything here is a hard constraint for implementation sessions unless DECISION_LOG marks it superseded.

## 1. Design Philosophy

- **Premium restraint over agri-clipart.** The site should feel like a food-safety-grade industrial company, not a farm brochure. Whitespace, few colors, strong typography, real photography.
- **Evidence-forward.** Every visual flourish must serve credibility: specs, process, facility, documentation. If a decorative element doesn't build trust, cut it.
- **Editorial green, not neon green.** Logo greens are vivid; UI surfaces use deepened/desaturated derivatives so the logo stays the brightest brand element on the page.
- Avoid AI-slop defaults: no purple gradients, no Inter-on-white sameness, no generic 3-card feature grids with emoji icons, no stocky handshake photos.

## 2. Color Tokens

### 2.1 Brand (from logo — LOCKED)
```
--brand-forest:   #165C2A;  /* Primary Green */
--brand-fresh:    #86B72F;  /* Secondary Green */
--brand-gold:     #F4B321;  /* Accent Gold */
--brand-gold-lt:  #FFD166;  /* Light Gold */
--brand-white:    #FFFFFF;
--brand-charcoal: #2B2B2B;
```

### 2.2 Extended UI palette (derived)
```
--green-950: #0B2E16;  /* ink green — dark sections, footer bg */
--green-900: #103F1E;  /* deep surface */
--green-700: #165C2A;  /* = brand-forest; primary buttons, links */
--green-600: #1E7A38;  /* hover state for green-700 */
--green-100: #E4F0E4;  /* tint backgrounds, badges */
--green-50:  #F2F7F2;  /* section alternate background */

--lime-500:  #86B72F;  /* = brand-fresh; ACCENT ONLY — icons, tags, data viz; never body text, never large fills */

--gold-500:  #F4B321;  /* = brand-gold; primary CTA accent, highlights */
--gold-600:  #D99A0B;  /* gold hover / on-light borders */
--gold-100:  #FBEED0;  /* subtle highlight background */

--neutral-950: #1A1D1A; /* near-black text (green-tinted, not pure black) */
--neutral-700: #454A45; /* secondary text */
--neutral-500: #6B716B; /* muted text, captions — smallest text ≥ this only on white */
--neutral-300: #D5D9D4; /* borders, dividers */
--neutral-100: #EFF1EE; /* card backgrounds */
--cream-50:    #FAF9F5; /* page background (warm off-white, NOT pure white) */

--error-600:  #B3261E;
--success-600: #1E7A38;
--info-600:   #1D4ED8;  /* sparing use */
```

### 2.3 Usage rules
- Page background: `--cream-50`. Cards: white or `--neutral-100`. Dark bands (footer, stat strips, facility section): `--green-950` with `--cream-50` text.
- **Primary CTA** ("Request a Quote"): `--gold-500` background, `--neutral-950` text (contrast 10.4:1). Hover `--gold-600`.
- **Secondary CTA/links:** `--green-700`. Never use `--lime-500` for text on white (contrast ~2.2:1 — fails WCAG).
- Gold used ONCE per viewport as CTA — never for decorative bulk.
- Contrast minimums: body text 4.5:1, large text/icons 3:1. Validated pairs: `neutral-950`/`cream-50` ✅, `green-700`/`cream-50` ✅ (5.9:1), `cream-50`/`green-950` ✅, `neutral-950`/`gold-500` ✅. Forbidden: `lime-500` text on white, `gold-500` text on white.

## 3. Typography

- **Display / headings:** `Fraunces` (Google Fonts, variable) — serif with warmth and authority; distances VNP from generic exporter sites. Weights 500–600. Optical size on.
- **Body / UI:** `Archivo` (Google Fonts, variable) — sturdy grotesque, excellent at small sizes, distinct from Inter-default. Weights 400/500/600.
- **Numeric/data (specs tables):** Archivo with `font-variant-numeric: tabular-nums`.
- Arabic-future: pair with `IBM Plex Sans Arabic` (body) + `Amiri` or keep Fraunces for Latin-only display; register in tokens now: `--font-display`, `--font-body`, `--font-body-ar`.

### Scale (1.25 ratio, rem)
```
--text-xs: 0.75rem/1.4      captions, badges
--text-sm: 0.875rem/1.5     secondary UI
--text-base: 1rem/1.65      body (min 16px)
--text-lg: 1.125rem/1.6     lead paragraphs
--text-xl: 1.375rem/1.4     card titles      (display font optional)
--text-2xl: 1.75rem/1.3     section H2 mobile / H3 desktop
--text-3xl: 2.25rem/1.2     section H2 desktop
--text-4xl: 3rem/1.1        page H1
--text-5xl: 3.75rem/1.05    homepage hero only
```
- H1 once per page. Hero H1 in Fraunces 500. Section H2s in Fraunces; H3 and below in Archivo 600.
- Max line length 68ch for prose; never full-bleed paragraphs.

## 4. Spacing, Grid, Radius, Elevation

```
Spacing scale (px): 4 8 12 16 24 32 48 64 96 128   (--space-1 … --space-10)
Section vertical padding: 96 desktop / 64 tablet / 48 mobile
Container: max-width 1200px, gutter 24 (16 mobile)
Grid: 12-col desktop, 6-col tablet, 4-col mobile; card grids use gap-24/32
Radius: --radius-sm 6px (inputs, badges) · --radius-md 12px (cards) · --radius-lg 20px (feature media) · pill for tags/CTA optional
Elevation: shadow-sm 0 1px 2px rgb(11 46 22 / 6%) · shadow-md 0 4px 16px rgb(11 46 22 / 10%) — green-tinted shadows, no harsh black
Borders preferred over heavy shadows: 1px --neutral-300
```

## 5. Imagery

- **Photography style (target, real shoot):** natural daylight, honest industrial-clean; stainless steel lines, cold storage, crates of raw produce, gloved hands + hairnets (food-safety visual cues), Maharashtra farm fields at golden hour. Slightly warm grade echoing `--cream-50`/gold. No heavy HDR, no fake bokeh smiles.
- **Product imagery:** consistent set — product on neutral `--cream-50` seamless + one "context" shot (pulp poured, frozen peas macro with frost). Same angle/lighting across catalog.
- **Interim AI imagery rules:** allowed for produce macro shots and abstract texture bands; NOT allowed for: facility exteriors presented as the Karad plant, people presented as staff, certificates, documents. Label internally in CMS `source: ai-interim` for later replacement.
- Icons: single set, 1.5px stroke, rounded joins (Lucide fits); icon color `--green-700` or `--neutral-700`; NEVER multicolor emoji icons.
- Illustration: avoid cartoon agri illustration entirely; permitted: thin-line schematic diagrams for process flow (farm → intake → processing → QC → cold chain → port) in `--green-700`/`--gold-500` on `--green-50`.

## 6. Motion

- Purposeful and rare: fade+8px rise on section entry (200–300ms, ease-out, once), micro-transitions on hover (150ms), number count-up ONLY for real verified stats.
- No parallax, no auto-playing carousels, no scroll-jacking.
- `prefers-reduced-motion: reduce` → all entry animations become opacity-only or none.

## 7. Interaction Rules

- Hover: buttons darken one step + subtle translateY(-1px); cards raise shadow-sm→md and border darkens.
- Focus: 2px `--gold-600` outline with 2px offset, visible on ALL interactive elements (keyboard parity with hover).
- Tap targets ≥44×44px. Sticky header shrinks after 80px scroll (72→60px height).
- WhatsApp floating button: bottom-right, 56px, `--green-700`, hidden while contact form is in viewport (avoid duplicate CTA).

## 8. Accessibility Rules (bake in, not retrofit)

- Semantic landmarks: one `<main>`, `<nav aria-label>`, `<footer>`; heading order strict (no skipped levels).
- All images meaningful `alt` (product name + form, e.g. "Aseptic mango pulp in 215 kg drum"); decorative images `alt=""`.
- Forms: visible `<label>` for every field (no placeholder-as-label), `aria-describedby` for errors, error text + icon (not color alone).
- Keyboard: full nav operability incl. mobile menu (focus trap + Esc), skip-to-content link.
- Language: `<html lang="en">`; future Arabic `lang="ar" dir="rtl"` — use CSS logical properties (`margin-inline-start` etc.) from day one.
- Motion/media: no autoplay video with sound; captions on facility video.

## 9. Responsive Behavior

- Breakpoints: 640 / 768 / 1024 / 1280.
- Mobile-first build. Nav collapses ≤1024 to full-screen overlay menu (not tiny dropdown), CTA "Request a Quote" persists in mobile header.
- Tables (product specs) → stacked key-value cards below 768px, never horizontal scroll for primary specs.
- Hero: min-height 80vh desktop / auto mobile; hero image art-directed (different crop mobile).

## 10. Voice & Tone (summary — full version CONTENT_PLAYBOOK.md)

Confident, precise, factual, warm-professional. Short sentences. Specifics over adjectives ("aseptic 215 kg drums" beats "premium quality"). Never: superlatives without evidence, fake urgency, "world-class/best-in-class".
