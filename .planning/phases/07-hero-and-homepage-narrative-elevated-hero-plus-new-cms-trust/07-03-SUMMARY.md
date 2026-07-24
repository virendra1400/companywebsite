---
phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
plan: 03
subsystem: cms
tags: [payload, seed-content, homepage, next-intl, rtl]

# Dependency graph
requires:
  - phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust (07-02)
    provides: "TrustBar/ExportProcess/Testimonials Payload Block configs, renderers, BLOCK_MAP wiring, and regenerated payload-types.ts"
provides:
  - "Homepage `home` Pages document composed into the full 11-block trust narrative (Hero -> TrustBar -> FeatureGrid -> MediaGallery -> StatsBand -> CertStrip -> StatsBand -> ExportProcess -> ExportMap -> Testimonials -> CTABand)"
  - "3 new seed helper functions (trustBar/exportProcess/testimonials) in seed-content.ts"
  - "injectFacilityPhotos() generalized to attach facility placeholder photos to every page's mediaGallery block(s), not just manufacturing"
affects: [phase-08-component-polish, homepage-content-model]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed helper functions return `{ blockType: '<slug>' as const, ... }` object literals matching the Payload Block field shape exactly — same pattern as the 9 pre-existing helpers (featureGrid/statsBand/certStrip/etc.)"

key-files:
  created: []
  modified:
    - src/lib/seed-content.ts
    - scripts/seed-pages.ts

key-decisions:
  - "Manufacturing Excellence homepage teaser reuses the existing MediaGallery (3 of 4 /manufacturing captions, Packing & Dispatch dropped) + StatsBand (capacity/QC/cold-chain figures) verbatim rather than a bare teaser link, per CONTEXT.md discretion — near-zero new authoring cost, reads as its own narrative beat"
  - "The two StatsBand instances on the homepage carry distinct label sets (capacity/QC/cold-chain vs. years/countries/shipments) specifically so tests/e2e/homepage.spec.ts's getByText('Years Exporting').first() still resolves to the later (row 7) band and the monotonic order assertion stays intact"

patterns-established: []

requirements-completed: [D-03, D-04, D-05]

coverage:
  - id: D1
    description: "The home Pages document composes the 11-block narrative in the exact UI-SPEC Part 3 order (Hero -> TrustBar -> FeatureGrid -> MediaGallery -> StatsBand -> CertStrip -> StatsBand -> ExportProcess -> ExportMap -> Testimonials -> CTABand)"
    requirement: D-03
    verification:
      - kind: unit
        ref: "npx tsc --noEmit (home layout type-checks against 07-02 payload-types.ts)"
        status: pass
      - kind: unit
        ref: "grep -F 'Trusted by Importers Across the Globe' / 'How an Order Moves From Inquiry to Delivery' / 'What Our Buyers Say' src/lib/seed-content.ts"
        status: pass
      - kind: e2e
        ref: "tests/e2e/homepage.spec.ts (monotonic Hero < FeatureGrid < CertStrip < StatsBand('Years Exporting') < ExportMap < CTABand order, both / and /ar)"
        status: pass
    human_judgment: false
  - id: D2
    description: "TrustBar seeded with 5 logo-less region descriptors (no fabricated named clients); ExportProcess seeded with the 5 inquiry-to-delivery steps; Testimonials seeded with 3 role+buyer-category+country quotes flagged in-code as placeholder"
    requirement: D-05
    verification:
      - kind: unit
        ref: "manual review: src/lib/seed-content.ts trustBar/testimonials seed items are region/segment descriptors and role+category+country, not invented company names — Pitfall 5"
        status: pass
    human_judgment: false
  - id: D3
    description: "The homepage MediaGallery ('Manufacturing Excellence') is a condensed on-page composition reusing the existing MediaGallery+StatsBand blocks with verbatim /manufacturing copy — no new block, no schema change"
    requirement: D-03
    verification:
      - kind: unit
        ref: "grep -F 'Manufacturing Excellence' src/lib/seed-content.ts; captions 'Processing Floor'/'Quality Control Lab'/'Cold Storage' present in home layout"
        status: pass
      - kind: other
        ref: "sqlite3 payload.db query on pages_blocks_media_gallery_items after re-seed: home's 3 gallery items all carry non-zero image_id (1,2,3)"
        status: pass
    human_judgment: false
  - id: D4
    description: "injectFacilityPhotos() attaches the existing FACILITY_PHOTOS placeholder images to the home page's new MediaGallery items (keyed by caption), reusing upsertMediaByAlt as-is"
    requirement: D-05
    verification:
      - kind: other
        ref: "npx tsx scripts/seed-pages.ts after deleting the home doc — logs 'Seeded page home (en).' and completes without error; sqlite3 query confirms home gallery items have real image ids"
        status: pass
    human_judgment: false
  - id: D5
    description: "Existing tests/e2e/homepage.spec.ts monotonic order, tests/e2e/rtl-arabic.spec.ts sample-count, and fallback-notice.spec.ts all still pass; no en.json/color/body-tier/globals.css change"
    requirement: D-04
    verification:
      - kind: e2e
        ref: "npm run test:e2e -- homepage.spec.ts rtl-arabic.spec.ts (14 passed); npm run test:e2e -- fallback-notice.spec.ts (4 passed)"
        status: pass
      - kind: other
        ref: "npm run lint:rtl (RTL guard: no physical-direction classes under src/.)"
        status: pass
      - kind: unit
        ref: "npm run test (vitest: 76 tests, 17 files, all passed)"
        status: pass
    human_judgment: false

duration: 36min
completed: 2026-07-24
status: complete
---

# Phase 7 Plan 3: Homepage Composition + Trust/Process/Testimonial Seed Content Summary

**Rewrote the `home` Pages seed into the full 11-block trust narrative (TrustBar, condensed Manufacturing Excellence teaser, ExportProcess, Testimonials interleaved with the existing blocks) and generalized `injectFacilityPhotos()` so the homepage's reused MediaGallery instance gets real placeholder photos.**

## Performance

- **Duration:** 36 min
- **Started:** 2026-07-24T10:03:00Z
- **Completed:** 2026-07-24T10:39:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added 3 seed helper functions (`trustBar`, `exportProcess`, `testimonials`) to `seed-content.ts`, matching the existing helper-function convention exactly
- Rewrote the `home` layout array to compose all 11 blocks in the UI-SPEC Part 3 order, with the Manufacturing Excellence teaser reusing the `/manufacturing` page's MediaGallery captions (minus Packing & Dispatch) and StatsBand figures verbatim
- Seeded TrustBar with 5 logo-less region/segment descriptors and Testimonials with 3 role+buyer-category+country placeholder quotes — no fabricated named clients (Pitfall 5)
- Generalized `injectFacilityPhotos()` in `scripts/seed-pages.ts` to iterate every `PAGES_EN_SEED` page's `mediaGallery` block(s) instead of hardcoding the `manufacturing` slug, reusing `upsertMediaByAlt` unchanged
- Deleted the existing dev `home` Pages doc and re-ran `npx tsx scripts/seed-pages.ts`, confirming a clean re-seed and that the home gallery items received real Media ids
- Ran the full verification suite: `lint:rtl`, `tsc --noEmit`, `homepage.spec.ts` + `rtl-arabic.spec.ts` + `fallback-notice.spec.ts` (e2e), and the full vitest suite (76 tests) — all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Add the 3 seed helpers and rewrite the home layout to the 11-block narrative** - `f5095b7` (feat)
2. **Task 2: Generalize injectFacilityPhotos to the home MediaGallery, re-seed, and run the e2e regression** - `0639ba8` (feat)

**Plan metadata:** (final commit hash recorded below in Next Phase Readiness / completion marker)

## Files Created/Modified
- `src/lib/seed-content.ts` - +3 seed helper functions (`trustBar`, `exportProcess`, `testimonials`); `home` layout rewritten from 6 to 11 blocks
- `scripts/seed-pages.ts` - `injectFacilityPhotos()` generalized from a single `manufacturing`-slug lookup to iterating all `PAGES_EN_SEED` pages' `mediaGallery` blocks

## Decisions Made
- Manufacturing Excellence homepage teaser reuses the existing MediaGallery + StatsBand blocks with verbatim `/manufacturing` copy rather than a bare teaser link, per CONTEXT.md's explicit discretion — near-zero new authoring cost since both blocks already exist with real seeded copy.
- The homepage's two StatsBand instances carry distinct label sets by design (capacity/QC/cold-chain on the new row 5, years/countries/shipments on the unmoved row 7) so `homepage.spec.ts`'s `getByText('Years Exporting').first()` continues to resolve to the correct (later) band and the monotonic vertical-order assertion stays valid.

## Deviations from Plan

None - plan executed exactly as written. Both tasks completed with all specified acceptance criteria met; no Rule 1-4 auto-fixes were needed.

## Issues Encountered
- Worktree had no `.env`/`payload.db`/`node_modules` (gitignored/build artifacts, expected in a fresh worktree). Copied `.env` and `payload.db` from the main checkout and symlinked `node_modules` (verified `package-lock.json` matched via `diff` first) to run `tsc`, `lint:rtl`, `vitest`, `playwright`, and the seed script in this worktree.
- The first `homepage.spec.ts` e2e run showed 2 failures on the `[en]`/`/` path only ("Page crashed" and a 30s navigation timeout) — both were a transient Next.js dev-server cold-start compile flake on the very first hit to a fresh route (the same server, same route, passed immediately on every subsequent run and every other path/project in the same run). Re-ran `homepage.spec.ts` and the combined `homepage.spec.ts rtl-arabic.spec.ts` suite twice more — all 14/14 and 8/8 passed cleanly with no code changes. Not a plan deviation: no fix was applied because there was nothing to fix in the seed/composition code; documented here per the "Issues Encountered" contract.
- Needed to delete the existing dev `home` Pages document before re-seeding (seed-pages.ts is skip-by-slug idempotent, per the plan's own key_links note). Wrote a small one-off `payload.delete()` script, ran it, then deleted it immediately — not committed, not part of the plan's file-modification scope.

## User Setup Required

None - no external service configuration required. The homepage's new blocks reuse existing block tables from the 07-02 migration; the re-seed only affects the dev SQLite database (`payload.db`, gitignored) via the standard `db:seed`/`seed-pages.ts` flow already wired into `vercel.json`'s prod build step.

## Next Phase Readiness
- Phase 07 is now fully complete: hero elevation (07-01), the 3 new CMS blocks (07-02), and the full homepage composition + seed content (07-03) have all shipped.
- The homepage tells the complete trust -> process -> social-proof narrative an international buyer needs, with every section CMS-editable via `/admin`.
- No blockers. Phase 8 (Component Polish) can proceed — `tabular-nums` wiring for StatsBand figures (deferred from Phase 7) remains open for that phase per 07-CONTEXT.md's explicit scope note.

---
*Phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust*
*Completed: 2026-07-24*

## Self-Check: PASSED

Both created files verified present on disk (`src/lib/seed-content.ts`, `scripts/seed-pages.ts` — modified, not created); both task commits (`f5095b7`, `0639ba8`) verified present in `git log`.
