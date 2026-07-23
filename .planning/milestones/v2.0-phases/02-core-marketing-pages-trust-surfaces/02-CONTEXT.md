# Phase 2: Core Marketing Pages & Trust Surfaces - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the real premium marketing + trust pages, all CMS-authored via a block page-builder with realistic placeholder content: homepage, About/company, Contact, Certifications, Manufacturing/process, Export Track Record, Company/Compliance. All render through the existing Phase 1 global chrome.

**In scope:** Payload Blocks library + page rendering; Certifications collection; static export map + stat tiles; contact page (info + non-submitting form UI stub); homepage composed of blocks; nav wired to the real page set; English content (placeholders), locale-ready per Phase 1 i18n.

Requirements: PAGE-01..04, TRUST-01..06.

**Out of scope (later phases):** functional RFQ/inquiry form submission, spam defense, email/CRM (Phase 4 — LEAD); product catalog + product detail pages (Phase 3 — CAT); SEO infra/hreflang/sitemaps/blog (Phase 5); analytics (Phase 4); professional AR/FR/RU translation (post-launch). WhatsApp button may appear as a static `wa.me` link in chrome/contact but its analytics tracking is Phase 4.
</domain>

<decisions>
## Implementation Decisions

### Content Model
- **D-01:** Page content = a **Payload Blocks page-builder**. Build a reusable Blocks library (e.g. Hero, RichText, FeatureGrid, StatsBand, CertStrip, Gallery/MediaGrid, CTABand, MapBlock, ContactBlock). Editors compose each page from blocks — new pages/sections need no developer. Matches success criterion 5 + non-technical editing (CMS-01 spirit).
- **D-02:** Introduce a **Pages collection** (slug-routed) OR per-page globals hosting a `blocks` field — planner's choice, but pages must be locale-aware (field-level `localized:true`) and slot into the existing `[locale]` routing with the Phase 1 fallback rule (EN + notice). Blocks content is localized.
- **D-03:** Every block must render with **realistic-shaped placeholders** (long strings, real-resolution image slots) so real assets slot in later without layout breakage (Pitfall 4). No lorem ipsum.

### Certifications
- **D-04:** Dedicated **Certifications collection** — each entry: name, issuing body, logo (Media), certificate PDF (Media), validity/notes, and a **`halal` boolean flag**. The Certifications page + a homepage cert strip render from it; editors add/remove certs freely.
- **D-05:** **Halal featured prominently** (TRUST-02) — the `halal` flag drives elevated placement/badge on the certifications page and cert strip when set.

### Export Track Record
- **D-06:** **Static highlighted SVG world map** (served countries highlighted) + stat tiles (years exporting, volume/shipment stats, incoterms handled). Lightweight, no heavy map lib, RTL-safe. Interactive/3D globe is an explicit anti-feature (research). Countries-served + stats are CMS-editable data.

### Contact Page
- **D-07:** Phase 2 ships the **full contact page**: registered address, WhatsApp (`wa.me` link), email, phone — plus a **styled, NON-submitting inquiry form UI stub**. Phase 4 (LEAD) wires submission, spam defense, and email/CRM. The form markup/validation-ready structure is built now so Phase 4 only adds the action.

### Navigation
- **D-08:** Top-nav + footer nav wired to the real Phase 2 page set (Home, About, Certifications, Manufacturing, Export, Company/Compliance, Contact). Products/catalog nav entry may be a placeholder/stub until Phase 3.

### Claude's Discretion
- Exact block palette + naming, Pages-collection vs per-page-global structure (D-02), homepage section composition, block field schemas, map SVG source, and stat-tile layout — within the UI-SPEC design system and the decisions above.
- Whether nav is hardcoded vs a small CMS nav global (either acceptable; hardcoded is fine for a fixed page set — ponytail).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Phase
- `.planning/PROJECT.md` — core value, positioning, constraints, key decisions
- `.planning/REQUIREMENTS.md` — PAGE-01..04, TRUST-01..06 + traceability
- `.planning/ROADMAP.md` §"Phase 2: Core Marketing Pages & Trust Surfaces" — goal + 5 success criteria

### Design (locked, extend — do not re-derive)
- `.planning/phases/01-foundation-cms-decision/01-UI-SPEC.md` — design system: deep-green+gold tokens, IBM Plex fonts, spacing/type scale, RTL contract, chrome specs, shadcn. Phase 2 pages MUST use these tokens/components and the logical-property RTL rules.

### Phase 1 (built — reuse, don't rebuild)
- `.planning/phases/01-foundation-cms-decision/01-02-SUMMARY.md` — Payload setup, localized content model, Media collection, payload-fetch helper, env-driven adapters (SQLite dev / Postgres+Blob prod)
- `.planning/phases/01-foundation-cms-decision/01-03-SUMMARY.md` — chrome components (GlobalHeader/Footer/LanguageSwitcher/MobileNavPanel/LocaleFallbackNotice/Hero), home-wired-to-CMS pattern
- Code: `src/globals/Home.ts`, `src/collections/{Media,Users}.ts`, `src/lib/payload-fetch.ts`, `src/components/chrome/*`, `src/components/Hero.tsx`, `src/components/ui/*` (shadcn Button/DropdownMenu/Sheet)

### Design execution reference (supplementary)
- `.planning/references/taste-techniques.md` — neutral frontend-craft heuristics (spacing/motion/cards/lists/images/perf) extracted + sanitized from the taste-skill repo. SUPPLEMENTARY only: the UI-SPEC and CONTEXT win on any conflict; do NOT override locked decisions (IBM Plex, green+gold two-accent, light-first) to match a generic rule. Ignore its "no em-dash" house-style note.

### Research
- `.planning/research/FEATURES.md` — trust-surface features, table-stakes vs differentiators, anti-features (3D globe, generic page-builder overbuild)
- `.planning/research/PITFALLS.md` — placeholder-content realism (Pitfall 4), RTL (Pitfall 1), trust-content legal risk (unverified logos/claims)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/chrome/*` — global header/footer/switcher/mobile-nav/fallback-notice already built; pages render inside these via `[locale]/layout.tsx`.
- `src/components/Hero.tsx` — hero pattern (photography slot + Display headline + CTA); generalize into a Hero block.
- `src/lib/payload-fetch.ts` — `getHomeContent` pattern (display query + fallback-off existence check for D-06 fallback rule). Reuse this dual-query pattern for page/block fetching.
- `src/collections/Media.ts` — upload collection (image + PDF, mimeType-restricted, Blob in prod). Certifications logos/PDFs reference Media.
- `src/globals/Home.ts` — pattern for a localized global; extend or replace with block-based Pages.

### Established Patterns
- Field-level `localized: true` + `defaultLocale: en` + `fallback: true` (Payload). All new page/block/cert content follows this.
- Logical-property-only CSS (grep gate `scripts/check-physical-direction.mjs`); NO physical-direction classes. Every new component must pass it.
- shadcn components under `src/components/ui/` (vendor — RTL gate skips this dir).
- Playwright e2e (en + ar matrix) + Vitest int (Payload Local API). New pages get e2e + block-render int tests.

### Integration Points
- New pages plug into `src/app/(site)/[locale]/` routing.
- CMS reads via Payload Local API in RSC (payload-fetch helper).
- Media/PDF served via Vercel Blob in prod (adapter already wired).
</code_context>

<specifics>
## Specific Ideas

- Premium bar reference: piyushfarms.com is the FLOOR — Phase 2 must clearly exceed it (real certifications page with PDFs, evidence-based export track record, no consumer-recipe blog). These are the research-identified differentiators most India agro-exporters lack.
- Trust-content legal caution (Pitfall): placeholder certs/logos/testimonials must be clearly placeholder; do not fabricate specific certification numbers, client logos, or unverifiable claims in placeholder copy.
- Halal prominence is a deliberate GCC-market trust lever (D-05).
</specifics>

<deferred>
## Deferred Ideas

- Functional inquiry/RFQ form submission + spam + email/CRM → Phase 4 (LEAD). Phase 2 ships the form UI stub only (D-07).
- Product catalog + product detail pages → Phase 3 (CAT).
- SEO infra (hreflang/sitemaps/structured data) + blog → Phase 5.
- Analytics + WhatsApp click tracking → Phase 4.
- Professional AR/FR/RU translations of the new pages → post-launch (FOUND-02); build EN + locale-ready now.

None of the discussion introduced new capabilities beyond the phase boundary.
</deferred>

---

*Phase: 2-Core Marketing Pages & Trust Surfaces*
*Context gathered: 2026-07-14*
