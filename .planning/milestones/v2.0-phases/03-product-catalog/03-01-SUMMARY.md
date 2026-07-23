---
phase: 03-product-catalog
plan: 01
subsystem: database
tags: [payload-cms, typescript, next.js, sqlite, i18n, next-intl, revalidation]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    provides: Certifications collection (access-control + localization shape to mirror), getPageContent/getCertifications dual-query fetch patterns, revalidatePage hook mechanics, seed-pages.ts idempotency pattern, tests/int harness (getTestPayload, vi.mock("next/cache"))
provides:
  - Categories + Products Payload collections (localized, relationships), registered in payload.config.ts
  - payload-types.ts regenerated with flat (non-per-locale) Category/Product interfaces
  - revalidateCategory/revalidateProduct afterChange hooks (src/hooks/revalidateCatalog.ts)
  - getCategories/getProductsByCategory/getProduct fetch helpers (src/lib/payload-fetch.ts)
  - products i18n namespace in all 4 locale message files
  - Idempotent scripts/seed-products.ts (4 categories incl. 1 empty, 6 products spanning 0/1/3/5 spec rows + present/absent gallery), wired into npm run db:seed
affects: [03-02-catalog-index-route, 03-03-product-detail-route]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Localized array cascade: set localized:true on the top-level array field only (Products.specifications), never re-set it on nested fields — matches Pages.ts's layout block cascade"
    - "Two-query fetch helper (display query with fallback ON + native-check query with fallback OFF) for isTranslated detection, reused verbatim for getProduct from getPageContent"
    - "Category-to-products grouping via two flat find() queries + one JS .filter() pass, no Payload join field"

key-files:
  created:
    - src/collections/Categories.ts
    - src/collections/Products.ts
    - src/hooks/revalidateCatalog.ts
    - scripts/seed-products.ts
    - scripts/seed-assets/product-basmati-rice.svg
    - scripts/seed-assets/product-turmeric.svg
    - scripts/seed-assets/product-lentils.svg
    - tests/int/products.spec.ts
    - tests/int/products-revalidate-hook.spec.ts
  modified:
    - src/payload.config.ts
    - src/lib/payload-fetch.ts
    - payload-types.ts
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - package.json
    - scripts/seed-assets/README.md

key-decisions:
  - "specifications localized at the array level only (Pitfall 3) — payload generate:types confirms a flat { label, value, id? }[] type, not a per-locale object"
  - "imageGallery, category, and certifications are NOT localized (Pitfall 4) — photography and relationships carry no per-locale meaning"
  - "revalidateCategory only revalidates the catalog index (4 locale paths); revalidateProduct revalidates the index AND its own detail path (8 locale paths total) — Category changes never affect a per-category landing page since D-05 is flat grouping"
  - "Oilseeds is seeded with zero PUBLISHED products (its only product, Draft Sesame Seeds, is published:false) — exercises both the empty-category grouping state and the published-exclusion filter in one fixture"
  - "products i18n namespace copy taken verbatim from the plan/UI-SPEC Copywriting Contract, English source-of-truth in all 4 locale files (not machine-translated), matching the existing certs/blocks namespace precedent"

patterns-established:
  - "Pattern: typed localized Payload collection mirrors Certifications.ts's access shape 1:1 for any future structured (non-Blocks) collection"
  - "Pattern: revalidateCatalog.ts's two-thin-exports-per-file style is the template for any future collection-pair revalidate hook"

requirements-completed: [CAT-01, CAT-02, CAT-03, CAT-04]

# Metrics
duration: 13min
completed: 2026-07-15
---

# Phase 03 Plan 01: Product Catalog Data Backbone Summary

**Categories + Products Payload collections with array-level localized specifications, ISR revalidate hooks, three catalog fetch helpers, and an idempotent 4-category/6-product placeholder seed — all mirroring the proven Certifications/Pages/getPageContent patterns 1:1.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-15T23:03:00+05:30
- **Completed:** 2026-07-15T23:15:57+05:30
- **Tasks:** 3 completed
- **Files modified:** 19

## Accomplishments
- `Categories`/`Products` collections registered in `/admin`, with `specifications` proven localized at the array level only (flat generated type, no fallback bleed between locales — int-test-verified)
- `getCategories`/`getProductsByCategory`/`getProduct` fetch helpers land with 9 passing int-test assertions covering grouping, displayOrder, empty-category, published-exclusion, and en→fr fallback-detection
- `revalidateCategory`/`revalidateProduct` afterChange hooks verified via mocked `next/cache`: category change hits exactly the 4 index paths, product change hits the 4 index + 4 detail paths, and `disableRevalidate` skips entirely
- Idempotent `scripts/seed-products.ts` seeds 4 categories (Grains/Spices/Pulses/Oilseeds) and 6 products spanning 0/1/3/5 specification rows and 2/1/0-image galleries, wired into `npm run db:seed`; confirmed idempotent on a second run (all-skip, zero duplicates)
- Full verification gate green: `npx tsc --noEmit` clean, `npm run lint:rtl` clean, full int suite 28/28 passing, `npm run db:seed` idempotent, `npm run build` exits 0

## Task Commits

1. **Task 1: Categories + Products collections, revalidate hooks, config registration, type generation** - `97bc70d` (feat)
2. **Task 2: Catalog fetch helpers** - `0d0552e` (feat)
2b. **Task 2: int tests (grouping, fallback, cascade, revalidate hooks)** - `65b92c7` (test)
3. **Task 3: products i18n namespace + idempotent catalog seed [BLOCKING]** - `d23691a` (feat)

_Note: Task 2 (`tdd="true"`) is split into a `feat` commit (helpers) and a `test` commit (spec files); the plan's own `<action>` text specified implementation-then-tests ordering rather than strict test-first RED/GREEN, so this executes that explicit ordering rather than the generic TDD flow — both commits landed together in the same task, verification (`npx vitest run`) passed before either was committed._

## Files Created/Modified
- `src/collections/Categories.ts` - flat, localized Categories collection (D-01)
- `src/collections/Products.ts` - typed, localized Products collection with relationships + array-level-localized specifications (D-02/D-04)
- `src/hooks/revalidateCatalog.ts` - revalidateCategory (index-only) + revalidateProduct (index + detail) afterChange hooks
- `src/payload.config.ts` - registered Categories/Products in the collections array
- `payload-types.ts` - regenerated; Product.specifications typed as a flat array
- `src/lib/payload-fetch.ts` - added getCategories, getProductsByCategory, getProduct
- `tests/int/products.spec.ts` - grouping/empty-category/published-exclusion/fallback/cascade assertions
- `tests/int/products-revalidate-hook.spec.ts` - mocked-next/cache hook assertions
- `src/i18n/messages/{en,ar,fr,ru}.json` - added `products` namespace (English source-of-truth in all 4)
- `scripts/seed-products.ts` - idempotent catalog seed
- `scripts/seed-assets/product-{basmati-rice,turmeric,lentils}.svg` - self-authored placeholder product images
- `scripts/seed-assets/README.md` - documented the 3 new placeholder assets
- `package.json` - `db:seed` now runs `seed-pages.ts && seed-products.ts`

## Decisions Made
- Task 2 committed as two commits (feat then test) rather than one, giving a clean per-concern git history while still landing together as a single task's work — see Task Commits note above.
- Cascade int-test fixture required supplying `name`/`shortDescription` alongside `specifications` on the fr-locale update, since Payload's required-field validation checks the value at write-time for the target locale rather than falling back to the en value during a write — not a bug in the collection design, just a test-fixture detail (documented inline in the spec).
- No new npm dependency added anywhere in this plan (confirmed: `package.json`'s dependency lists unchanged, only the `db:seed` script string changed).

## Deviations from Plan

**1. [Rule 2 - Missing documentation] Updated `scripts/seed-assets/README.md` to describe the 3 new product placeholder SVGs**
- **Found during:** Task 3
- **Issue:** The plan's `files_modified` list didn't include the README, but the existing file's own stated discipline ("self-authored placeholder assets... see this dir's README") would go stale/incomplete without documenting the 3 new product images the same way every prior asset is documented.
- **Fix:** Added one bullet describing `product-basmati-rice.svg`/`product-turmeric.svg`/`product-lentils.svg` following the exact phrasing pattern already used for the facility/avatar/logo assets.
- **Files modified:** `scripts/seed-assets/README.md`
- **Commit:** `d23691a` (part of Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing documentation, low-risk)
**Impact on plan:** No scope creep — purely keeps the existing self-imposed asset-provenance documentation discipline consistent with the new files this plan added.

## Issues Encountered
- Fresh git worktree had no `.planning/` docs (gitignored, `commit_docs=false`) and no `node_modules`/`.env`/`payload.db` — copied the phase 03 planning docs + top-level `.planning/{ROADMAP,STATE,REQUIREMENTS,config.json}` from the main checkout (read-only reference, never modified), symlinked `node_modules` to the main checkout, and generated a fresh gitignored dev `.env` (`DATABASE_URI=file:./payload.db` + a freshly-generated `PAYLOAD_SECRET`, no `BLOB_READ_WRITE_TOKEN`) exactly per the plan's critical_rules. None of these are committed (all covered by existing `.gitignore` entries: `/node_modules`, `.env*`, `/payload.db*`).
- `npm run build` was first invoked with a bash redirect to `/tmp_build_out.txt`, which failed with a permission error unrelated to the build itself (should have used the scratchpad directory) — re-ran with output captured to the scratchpad and confirmed exit code 0 directly.

## User Setup Required

None - no external service configuration required. The dev `.env` created in this worktree is local-only, gitignored, and mirrors the project's own `.env.example` (SQLite dev, no Postgres/Blob vars).

## Next Phase Readiness
- Plans 03-02 (catalog index route) and 03-03 (product detail route) can now consume `getCategories`/`getProductsByCategory`/`getProduct` and the `products` i18n namespace directly — the data backbone, revalidation, and seed content they need all exist and are int-test-verified.
- No blockers. The `/[locale]/products` route itself does not exist yet (by design — out of this plan's scope, owned by Plans 02/03), so `npm run build`'s current output does not yet show a `/products` page; this plan's own verification gate (`npx tsc --noEmit`, `npm run lint:rtl`, full int suite, `npm run db:seed` idempotency, `npm run build` exit 0) is the correct and complete scope for a data-only plan.

## Self-Check: PASSED

All 9 created files confirmed present on disk; all 4 task commit hashes (`97bc70d`, `0d0552e`, `65b92c7`, `d23691a`) confirmed present in `git log`.
