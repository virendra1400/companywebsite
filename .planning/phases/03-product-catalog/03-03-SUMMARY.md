---
phase: 03-product-catalog
plan: 03
subsystem: ui
tags: [next.js, react-server-components, next-intl, tailwind-v4, playwright, shadcn, a11y]

# Dependency graph
requires:
  - phase: 03-product-catalog
    provides: "Plan 01 — getProduct dual-query fetch helper (published-filtered, en-fallback + isTranslated), Products/Categories collections, products i18n namespace, 6-product seed fixture spanning 0/1/3/5 spec rows and 0/1/2-image galleries"
  - phase: 03-product-catalog
    provides: "Plan 02 — ProductCard, /products CatalogIndex route, sibling-route-folder pattern (static-over-dynamic), Media populate guard convention"
provides:
  - "SpecTable component (src/components/products/SpecTable.tsx) — semantic <dl>/<dt>/<dd>, 2-col CSS Grid, packaging as an appended row, whole-region omission when empty"
  - "ProductGallery component (src/components/products/ProductGallery.tsx) — client thumbnail-swap gallery, aria-pressed a11y, ImageOff empty state, no lightbox/carousel dep"
  - "/products/[slug] ProductDetail route — PageHeader, two-column gallery/info region, SpecTable, applicable-cert CertCard grid, RFQ CTA, CTABand"
  - "generateStaticParams querying Payload published-product slugs (CAT-03), dynamicParams left at Next default"
  - "tests/e2e/product-detail.spec.ts — 18 passing assertions across detail regions, SpecTable, gallery a11y, RFQ href, 404, /ar RTL"
affects: [phase-04-lead-capture]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New sibling dynamic-route folder (products/[slug]/page.tsx) alongside the static products/page.tsx — Next resolves static-over-dynamic automatically, no special-casing needed in the generic [locale]/[slug] catch-all"
    - "Client component receives precomputed localized label ARRAY (thumbLabels: string[]) rather than a translation function — functions aren't serializable across the RSC server->client prop boundary"
    - "SpecTable renders 2-col grid via <dl> auto-flow (dt then dd in DOM order) instead of subgrid or nested divs — simplest correct layout for a flat label/value list"

key-files:
  created:
    - src/components/products/SpecTable.tsx
    - src/components/products/ProductGallery.tsx
    - src/app/(site)/[locale]/products/[slug]/page.tsx
    - tests/e2e/product-detail.spec.ts
  modified: []

key-decisions:
  - "Thumbnail strip only renders when a product has >1 image (single-image products show just the primary image, no redundant one-thumbnail row) — not explicitly required by the spec but avoids a pointless single-button gallery control; not exercised by e2e (no seeded product needed this distinction beyond Basmati's 2 images)"
  - "RFQ CTA and CTABand/index-page hrefs use plain <a> tags (not the locale-aware next-intl Link) — matches the existing CTABandBlock/products index precedent already established in Plans 01-02; not introduced by this plan, out of scope to fix per SCOPE BOUNDARY"
  - "Product-not-found uses next/navigation's notFound() (Next's default 404), mirroring the existing [locale]/[slug]/page.tsx precedent, rather than a custom product-specific 404 page body — the UI-SPEC's 'Product not found' copy exists in the products i18n namespace for future use if a custom not-found.tsx is ever added, but no route in this codebase currently renders custom 404 copy"
  - "Applicable-certification CertCard reuse passes t={(key) => tCerts(key)} (matching CertStripBlock's existing wrapper pattern) rather than passing the getTranslations return value directly — keeps CertCard's simple (key: string) => string prop contract unchanged"

patterns-established:
  - "Pattern: any future detail-page-style route needing a locale-agnostic media gallery can reuse ProductGallery's images+thumbLabels prop shape directly"

requirements-completed: [CAT-02, CAT-03, CAT-04]

# Metrics
duration: 20min
completed: 2026-07-15
---

# Phase 03 Plan 03: Product Detail Route Summary

**`/products/[slug]` renders a PageHeader, thumbnail-swap gallery, SpecTable (`<dl>`, incl. Packaging row), applicable-certification CertCard grid, and an RFQ CTA linking to `/contact?product=<slug>&productName=<encoded name>`; `generateStaticParams` queries Payload for slugs with `dynamicParams` left at the Next default so post-build products render without a rebuild.**

## Performance

- **Duration:** ~20 min (context/worktree setup + 3 tasks + full verification gate)
- **Started:** 2026-07-15T23:31:00+05:30
- **Completed:** 2026-07-15T23:41:00+05:30
- **Tasks:** 3 completed
- **Files modified:** 3 created (+ 1 e2e spec created in Task 1)

## Accomplishments
- `SpecTable` renders a real `<dl>`/`<dt>`/`<dd>` (screen-reader label/value association), 2-col CSS Grid, packaging folded in as one appended row, whole region self-omits when both rows and packaging are absent (proven against the seeded 0-spec/no-packaging "Whole Cumin Seeds" fixture)
- `ProductGallery` ships thumbnail buttons with `aria-label="View image {n} of {total}"` + `aria-pressed`, ImageOff placeholder for the seeded empty-gallery "Red Lentils" fixture, no lightbox/carousel dependency, and does not flex-reverse in RTL (proven on `/ar`)
- `/products/[slug]` composes PageHeader (mirroring breadcrumb chevron) → two-column gallery/info region with RFQ CTA → SpecTable → applicable-cert `CertCard` grid (Halal + FSSC proven on Basmati Rice) → CTABand, all inside existing Phase 1 chrome
- `generateStaticParams` queries `payload.find({collection:"products", where:{published:true}})` for slugs (no hardcoded list) with `dynamicParams` left at the Next default — `npm run build` prerenders all 5 published products × 4 locales (20 static paths)
- Full verification gate green: `npx tsc --noEmit` clean, `npm run build` exit 0, `product-detail.spec.ts` 18/18 passing (en + ar projects), `npm run lint:rtl`/`check-physical-direction.mjs` clean, zero named `max-w-*` utilities in the new files

## Task Commits

1. **Task 1: Failing e2e spec for product detail (RED)** - `88268b6` (test)
2. **Task 2: SpecTable + ProductGallery components** - `facd21f` (feat)
3. **Task 3: ProductDetail route (generateStaticParams + fallback + RFQ CTA) → e2e green** - `904c218` (feat)

_Note: unlike Plan 01's Task 2, this plan's Task 1 (e2e spec) genuinely failed at commit time (no route existed yet — `--list` only confirmed the spec compiled), and Task 3's real markup matched Task 1's selectors on the first run with zero adjustments needed — no selector-reconciliation edits were required._

## Files Created/Modified
- `src/components/products/SpecTable.tsx` - semantic `<dl>` spec table, 2-col grid, packaging row, region/row omission logic
- `src/components/products/ProductGallery.tsx` - client thumbnail-swap gallery, aria-pressed a11y, ImageOff empty state
- `src/app/(site)/[locale]/products/[slug]/page.tsx` - ProductDetail route: generateStaticParams, PageHeader, two-column region, SpecTable, cert grid, RFQ CTA, CTABand
- `tests/e2e/product-detail.spec.ts` - 18 e2e assertions (detail regions, SpecTable, gallery a11y, RFQ href, 0-spec/empty-gallery states, 404, /ar RTL)

## Decisions Made
- See `key-decisions` in frontmatter above (thumbnail-strip single-image suppression, plain-`<a>` RFQ CTA matching existing precedent, `notFound()` over custom 404 copy, CertCard `t` wrapper pattern).
- No new npm dependency added — `Card`, `Badge`, `Button`, `AspectRatio` (shadcn) and `ImageOff`/`ChevronRight` (lucide-react) were all already installed.

## Deviations from Plan

None - plan executed exactly as written. Task 3's e2e re-run required zero selector adjustments; the spec written in Task 1 already matched the real rendered markup from Task 3.

## Issues Encountered
- Fresh git worktree had no `.planning/` phase-03 docs (`03-03-PLAN.md`, `03-UI-SPEC.md`, `03-CONTEXT.md`, `03-RESEARCH.md` — gitignored, `commit_docs=false`), no `node_modules`, `.env`, or `payload.db` — read the plan/spec docs directly from the main checkout (read-only reference, never modified), symlinked `node_modules` to the main checkout via a Windows junction, and generated a fresh gitignored dev `.env` (`DATABASE_URI=file:./payload.db` + a freshly-generated `PAYLOAD_SECRET`, no Blob token) exactly per the plan's critical_rules, then ran `npm run db:seed` (idempotent, confirmed against Plan 01/02's seed scripts).
- `git status` shows `payload-types.ts` as modified with an empty diff (CRLF-normalization warning only, no actual content change) — left unstaged/uncommitted, consistent with the same non-issue documented in 03-02-SUMMARY.md.
- Pre-existing `next/image` console warnings ("has 'fill' but is missing 'sizes' prop") surfaced during the e2e run for `CertCard`'s logo image — this is Phase 2's existing `CertCard.tsx` component, not a file this plan modifies; out of scope per the deviation rules' SCOPE BOUNDARY (logged here, not fixed).

## User Setup Required

None - no external service configuration required. The dev `.env` created in this worktree is local-only, gitignored, and mirrors the project's own `.env.example`.

## Next Phase Readiness
- Phase 4 (lead capture / RFQ form) can now consume the `?product=<slug>&productName=<encoded-name>` query-string context landing on `/contact` from every product detail page's RFQ CTA — the seam is live, encoded, and e2e-verified; Phase 4 owns wiring `/contact` to actually read and prefill from these params.
- No blockers. Both Phase 3 catalog routes (`/products` index and `/products/[slug]` detail) are now live, sharing the same `getProduct`/`getProductsByCategory` fetch helpers, Media guard convention, and CertCard reuse pattern.

## Self-Check: PASSED

All 4 created/modified files confirmed present on disk (verified below); all 3 task commit hashes (`88268b6`, `facd21f`, `904c218`) confirmed present in `git log`.

---
*Phase: 03-product-catalog*
*Completed: 2026-07-15*
