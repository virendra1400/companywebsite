---
quick_id: 260809-djh
slug: richtext-formatting-whatsapp-centralize
date: 2026-08-09
status: complete
---

Two owner-observed bugs, both confirmed real via investigation before fixing.

## Task 1 — Rich-text formatting (D-59)

Owner observed page text "not well formatted." Confirmed: `RichTextBlock.tsx`, Insight article body, and product description all render Payload's Lexical output with zero CSS — bare `<h2>`/`<p>`/`<ul>`, browser defaults only. Fixed with one shared `.cms-richtext` class in globals.css using the project's real design tokens (Fraunces/text-heading for h2, spacing-scale rhythm, logical properties), applied at all 3 call sites. Verified via Playwright screenshot + computed-style check, not just "CSS exists."

## Task 2 — WhatsApp number centralization (D-60)

Owner observed WhatsApp button needs centralizing, same number everywhere. Investigated every WhatsApp CTA site-wide: `WhatsAppFloatingButton`/`GlobalHeader`/`MobileNavPanel`/`ContactBlockView`/`HeroBlock` already correctly used the centralized `getSiteBrand().waHref`. `CTABandBlock.tsx` (bottom of nearly every page) was the one exception — read a per-page CMS-seeded href frozen at seed time instead. Fixed to match `HeroBlock`'s existing pattern. Verified via curl across all 6 page types — identical number everywhere now.

## Acceptance

- `npx tsc --noEmit` clean.
- Unit suite 94/97 (unchanged baseline).
- Formatting: Playwright-verified computed styles match design tokens.
- WhatsApp: curl-verified identical number across `/`, `/about`, `/certifications`, `/products`, `/insights`, `/resources`.
