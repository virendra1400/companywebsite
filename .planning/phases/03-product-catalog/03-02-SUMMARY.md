---
phase: 03-product-catalog
plan: 02
subsystem: ui
tags: [next.js, react-server-components, next-intl, tailwind-v4, playwright, shadcn]

# Dependency graph
requires:
  - phase: 03-product-catalog
    provides: "Plan 01 — Categories/Products Payload collections, getProductsByCategory fetch helper (category-grouped, published-filtered, displayOrder-sorted), products i18n namespace, 4-category/6-product seed fixture"
provides:
  - "ProductCard component (src/components/products/ProductCard.tsx) — whole-card Link, AspectRatio 4/3 image w/ ImageOff placeholder, neutral category Badge, Body-600 name + line-clamp-2 teaser"
  - "/products CatalogIndex route (src/app/(site)/[locale]/products/page.tsx) — compact Hero, optional category anchor-nav, per-category alternating-bg sections, per-category + whole-catalog empty states, reused CTABand"
  - "products nav entry live in GlobalHeader/GlobalFooter/MobileNavPanel (D-06), resolving to /products in all 4 locales"
  - "tests/e2e/catalog-index.spec.ts — grouped-section, product-card-href, empty-category, and RTL coverage"
affects: [03-03-product-detail-route]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New sibling route folder (src/app/(site)/[locale]/products/page.tsx) instead of special-casing inside [slug]/page.tsx — Next resolves static-over-dynamic automatically, no catch-all changes needed"
    - "Synthesizing a hero-shaped/ctaBand-shaped plain object and passing it straight into HeroBlock/CTABandBlock — reuses Phase 1/2 block components on a non-CMS route with zero component changes"
    - "Media populate guard (item && typeof item === 'object' ? item as Media : null) reused verbatim from MediaGalleryBlock for ProductCard's imageGallery[0]"

key-files:
  created:
    - src/components/products/ProductCard.tsx
    - src/app/(site)/[locale]/products/page.tsx
    - tests/e2e/catalog-index.spec.ts
  modified:
    - src/components/chrome/GlobalHeader.tsx
    - src/components/chrome/GlobalFooter.tsx
    - src/components/chrome/MobileNavPanel.tsx

key-decisions:
  - "Category anchor-nav rendered only when grouped.length > 1 (currently 4 seeded categories, so it's live) — chip row uses Badge asChild wrapping a real <a href='#slug'> per category, matching UI-SPEC's 'planner's discretion, RECOMMENDED'"
  - "CTABand heading 'Ready to Source These Products?' follows the existing per-page ctaBand() question-heading convention (src/lib/seed-content.ts: 'Ready to Source With Confidence?', 'Want a Facility Walkthrough?', etc.) — same Request a Quote / Chat on WhatsApp CTA pair reused verbatim (same wa.me placeholder link), no new CTA copy invented"
  - "Category tag uses Badge variant='secondary' (bg-neutral-100 text-neutral-900), never accent — matches UI-SPEC's explicit 'category tag is wayfinding metadata, not a trust signal' ruling"

patterns-established:
  - "Pattern: any future non-CMS route needing Hero/CTABand can synthesize the block-shaped object inline rather than requiring a CMS-backed Page — no new component API needed"

requirements-completed: [CAT-01, CAT-04]

# Metrics
duration: 10min
completed: 2026-07-15
---

# Phase 03 Plan 02: Catalog Index Route Summary

**`/products` renders 4 seeded categories (Grains/Spices/Pulses/Oilseeds) as alternating-background sections of `ProductCard` grids, with a per-category empty state for zero-published-product categories, and the long-parked `products` nav link now resolves to the real route in all three chrome components.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-15T23:20:00+05:30
- **Completed:** 2026-07-15T23:27:46+05:30
- **Tasks:** 3 completed
- **Files modified:** 6

## Accomplishments
- `ProductCard` renders image (or `ImageOff` placeholder when `imageGallery` is empty — proven against the seeded "Red Lentils" fixture), name, teaser, and a neutral category tag, entire card wrapped in a single `Link` to `/products/<slug>`
- `/products/page.tsx` lands as a brand-new sibling route folder (no edits to `[slug]/page.tsx`), composing a synthesized compact Hero, an optional category anchor-nav, one alternating-bg section per category, and a reused CTABand
- The seeded "Oilseeds" category (its only product is `published:false`) correctly renders its header followed by the generic `blocks.emptyState` copy instead of an empty grid — proves both CAT-01 grouping and CAT-04 empty-state paths against real seed data
- `products` now live in `NAV_KEYS`/`NAV_HREFS` across `GlobalHeader`, `GlobalFooter`, and `MobileNavPanel` (D-06) — stale "excluded (Phase 3)" comments removed
- Full verification gate green: `npx tsc --noEmit` clean, `npm run build` exits 0 with `/products` prerendered for all 4 locales, `catalog-index.spec.ts` (10/10) + `nav-links.spec.ts` (8/8) passing, `npm run lint:rtl` / `check-physical-direction.mjs` clean, no named `max-w-*` utilities anywhere in the new/modified files

## Task Commits

1. **Task 1: Failing e2e spec for the catalog index (RED)** - `e0ab422` (test)
2. **Task 2: ProductCard + CatalogIndex route (GREEN)** - `9e0ece3` (feat)
3. **Task 3: Wire `products` nav link + run catalog e2e green** - `6fa7f27` (feat)

## Files Created/Modified
- `src/components/products/ProductCard.tsx` - catalog grid card: image/ImageOff, category Badge, name, teaser, whole-card Link
- `src/app/(site)/[locale]/products/page.tsx` - CatalogIndex route: Hero, anchor-nav, per-category sections, empty states, CTABand
- `tests/e2e/catalog-index.spec.ts` - e2e: 200+hero, per-category h2 sections, product-card hrefs, Oilseeds empty state, /ar dir=rtl
- `src/components/chrome/GlobalHeader.tsx` - added `products` to NAV_KEYS/NAV_HREFS, removed stale exclusion comment
- `src/components/chrome/GlobalFooter.tsx` - same nav wiring change
- `src/components/chrome/MobileNavPanel.tsx` - same nav wiring change

## Decisions Made
- Task 2 (`type="auto"`, not `tdd="true"` at the plan level despite the RED/GREEN task naming) — Task 1 wrote the e2e spec first (compiles, discovered by Playwright `--list`) and Task 2 made it pass; both committed as separate `test`/`feat` commits per the plan's own task split, matching the RED→GREEN sequencing the plan names explicitly.
- No new npm dependency added — `Card`, `Badge`, `AspectRatio` (shadcn) and `ImageOff` (lucide-react, already a project dependency via the shadcn/lucide preset) were all already installed.

## Deviations from Plan

None - plan executed exactly as written. Task 3's e2e re-run required zero selector adjustments (the spec written in Task 1 already matched the real rendered markup from Task 2).

## Issues Encountered
- Fresh git worktree had no `.planning/` phase-03 docs (gitignored, `commit_docs=false`), no `node_modules`, `.env`, or `payload.db` — copied `03-02-PLAN.md`/`03-UI-SPEC.md`/`03-CONTEXT.md` (read-only reference, never modified) from the main checkout, symlinked `node_modules` to the main checkout, generated a fresh gitignored dev `.env` (`DATABASE_URI=file:./payload.db` + a freshly-generated `PAYLOAD_SECRET`, no Blob token) exactly per the plan's critical_rules, and ran `npm run db:seed` (idempotent — confirmed via Plan 01's seed script). None of these are committed; all covered by existing `.gitignore` entries.
- `git status` shows `payload-types.ts` as modified with an empty diff (CRLF-normalization warning only, no actual content change) — left unstaged/uncommitted, not part of this plan's file list.

## User Setup Required

None - no external service configuration required. The dev `.env` created in this worktree is local-only, gitignored, and mirrors the project's own `.env.example`.

## Next Phase Readiness
- Plan 03 (`/products/[slug]` product detail route) can now build against a live `/products` index that links to it, the same `ProductCard`/Media-guard patterns, and the same chrome/nav baseline.
- No blockers. `ProductCard` and the CatalogIndex composition are both proven against the full seed fixture spread (0/1/3/5-spec-row products, 0/1/2-image galleries, one deliberately-unpublished product).

## Self-Check: PASSED

All 3 created files confirmed present on disk; all 3 task commit hashes (`e0ab422`, `9e0ece3`, `6fa7f27`) confirmed present in `git log`.

---
*Phase: 03-product-catalog*
*Completed: 2026-07-15*
