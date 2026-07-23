# Phase 3: Product Catalog - Context

**Gathered:** 2026-07-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a scalable product catalog: Category + Product Payload collections, a catalog index grouped by category, and per-product detail pages — all locale-aware, CMS-editable, ISR-revalidated, rendered in the existing chrome + design system.

**In scope:** Category collection (flat), Product collection (typed fields incl. specs + certifications relation), catalog index route grouped by category, product detail route, wiring the existing `products` nav entry to `/products`, placeholder seed data, tests.

Requirements: CAT-01..04.

**Out of scope (later):** RFQ/inquiry form submission + per-product RFQ logic (Phase 4 — LEAD-02; Phase 3 product page has an RFQ *CTA* linking to contact, not a functional per-product form); SEO structured-data for products (Phase 5 — Product JSON-LD); analytics (Phase 4); professional AR/FR/RU translation (post-launch). Nested subcategory trees, faceted search/filtering beyond simple category grouping.
</domain>

<decisions>
## Implementation Decisions

### Category Model
- **D-01:** **Flat categories** (single level — e.g. Grains, Spices, Pulses, Oilseeds). A `Categories` collection: name (localized), slug, displayOrder, optional short description + image. No parent/child tree.

### Product Model
- **D-02:** **Typed `Products` collection** (NOT the Phase-2 block page-builder — products are uniform/structured). Fields: name (localized), slug, category (relationship → Categories, one), shortDescription (localized), description (rich text, localized), imageGallery (array of upload→Media), specifications (see D-04), packaging (localized text or key/value), certifications (relationship → Phase-2 `Certifications`, many), displayOrder, published/draft.
- **D-03:** Product detail page renders: hero/name + gallery, description, **spec table**, packaging, applicable-certification badges (reuse the Phase-2 CertCard/cert primitive where sensible), and an **RFQ CTA** (links to `/contact` with product context in the query — the functional per-product RFQ form is Phase 4).

### Specs Format
- **D-04:** Specifications = **repeatable `{ label, value }` rows** (both localized) rendered as a scannable spec table. Structured, placeholder-ready, editor-friendly, consistent across products.

### Catalog Index UX
- **D-05:** **Single catalog index grouped by category** (CAT-01) — sections per category, each showing its products as cards. Optional in-page category anchor nav. Not per-category landing pages, not a JS faceted grid (revisit if product count grows large).

### Navigation
- **D-06:** Wire the existing `products` nav entry (placeholder since Phase 2 / D-08) to the real `/products` catalog route in GlobalHeader/GlobalFooter/MobileNavPanel.

### Claude's Discretion
- Exact field names/slugs, catalog route path (`/products` index + `/products/[slug]` detail — or `[slug]` under a products segment), ProductCard vs reuse, category anchor-nav vs plain sections, image gallery interaction (no lightbox per Phase-2 anti-feature), spec-table styling within the design system.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Phase
- `.planning/PROJECT.md` · `.planning/REQUIREMENTS.md` (CAT-01..04) · `.planning/ROADMAP.md` §"Phase 3: Product Catalog"

### Design (locked, extend)
- `.planning/phases/01-foundation-cms-decision/01-UI-SPEC.md` — base design system (tokens, IBM Plex, RTL contract, shadcn)
- `.planning/phases/02-core-marketing-pages-trust-surfaces/02-UI-SPEC.md` — block/card patterns, CertCard, page composition conventions to match
- `.planning/references/taste-techniques.md` — supplementary craft (grid over calc, long-list → card grid, no fabricated specs); UI-SPEC/CONTEXT win on conflict

### Phase 1/2 code to reuse (do NOT rebuild)
- `src/collections/{Certifications,Media,Pages}.ts` — patterns for a localized collection + relationships; Product relates to Certifications + Media
- `src/lib/payload-fetch.ts` — dual-query localized fetch + EN-notice fallback (D-06 rule); add getProducts/getCategories/getProduct helpers in this style
- `src/components/blocks/CertCard.tsx` / `RenderBlocks` conventions; `src/components/chrome/*` (nav to wire); `scripts/seed-pages.ts` (idempotent seed pattern — by name/slug); `scripts/seed-assets/` (self-authored placeholder assets, non-trademark)
- ISR/revalidate hook pattern (CMS-03) from Pages; apply to Products/Categories.

### Research/Pitfalls
- `.planning/research/FEATURES.md` (catalog features, anti-features) · `.planning/research/PITFALLS.md` (placeholder realism, RTL, no fabricated specs)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Localized-collection pattern (Certifications) → Categories/Products follow it (field-level `localized:true`, EN fallback).
- `payload-fetch.ts` dual-query + fallback → catalog fetch helpers mirror it.
- CertCard primitive + Media relation guard (`typeof === "object"`) → reuse for product cert badges + gallery images.
- Chrome nav (GlobalHeader/Footer/MobileNavPanel) has a `products` placeholder entry to wire (D-06).
- `scripts/seed-pages.ts` idempotent upsert (skip-by-slug/name) + `scripts/seed-assets/` placeholders → extend for products/categories.
- Vitest int (Local API) + Playwright en+ar e2e; `scripts/check-physical-direction.mjs` RTL gate.

### Integration Points
- New collections registered in `src/payload.config.ts` `collections: []`.
- New routes under `src/app/(site)/[locale]/`.
- Product → Certifications + Media relationships.
- Revalidate hook so new products/categories appear without rebuild (CMS-03).

### Deploy note (carry-forward ceiling)
- Prod build uses `payload migrate:fresh` (wipes+reseeds DB each deploy) + Blob `addRandomSuffix`. New Products/Categories tables sync via the same mechanism. Must replace with committed migrations before real content — see phase-02 deferred-items DEPLOY CEILING.
</code_context>

<specifics>
## Specific Ideas
- Premium bar: piyushfarms.com floor has products but shallow; our catalog must show real specs/packaging/certs per product (differentiator).
- Legal caution: placeholder product specs/names must be realistic-shaped but NOT fabricated certifications, grades, or false origin claims presented as real.
- Per-product RFQ CTA carries product context to /contact now; the actual per-product RFQ form is Phase 4 (LEAD-02) — keep the CTA→contact seam clean for that wiring.
</specifics>

<deferred>
## Deferred Ideas
- Functional per-product RFQ form + submission/spam/email → Phase 4 (LEAD-02/03/04).
- Product structured data (JSON-LD) + catalog in sitemap → Phase 5 (SEO).
- Nested subcategories, faceted search/filter, product compare → post-v1 if catalog scale demands.
- Analytics on product/RFQ interactions → Phase 4.

None of the discussion introduced new capabilities beyond the phase boundary.
</deferred>

---

*Phase: 3-Product Catalog*
*Context gathered: 2026-07-15*
