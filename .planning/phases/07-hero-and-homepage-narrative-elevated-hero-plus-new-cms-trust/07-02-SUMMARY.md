---
phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
plan: 02
subsystem: cms
tags: [payload, blocks, postgres-migration, next-intl, rtl]

# Dependency graph
requires:
  - phase: 06-component-polish-and-token-refinement
    provides: "Phase 6 rhythm/card tokens (xl:py-4xl, rounded-card, shadow-card) applied by the new block renderers"
provides:
  - "Three new Payload Block configs: trustBar, exportProcess, testimonials, registered end-to-end (barrel, Pages.layout, RenderBlocks BLOCK_MAP, payload-types.ts)"
  - "Committed additive Postgres migration for the 3 new block tables"
affects: [07-03, homepage-composition, cms-content-model]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New block registration follows the exact 4-point pattern (blocks/index.ts barrel, Pages.ts layout array, RenderBlocks.tsx BLOCK_MAP, regenerated payload-types.ts) established by the 9 prior blocks"

key-files:
  created:
    - src/blocks/TrustBar.ts
    - src/blocks/ExportProcess.ts
    - src/blocks/Testimonials.ts
    - src/components/blocks/TrustBarBlock.tsx
    - src/components/blocks/ExportProcessBlock.tsx
    - src/components/blocks/TestimonialsBlock.tsx
    - src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts
    - src/migrations/20260724_093617_phase7_homepage_narrative_blocks.json
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/migrations/index.ts
    - payload-types.ts
    - tests/int/blocks-placeholder.spec.ts

key-decisions:
  - "TrustBar's logo field is optional (unlike MediaGallery's required image) so a logo-less item renders as an honest text chip, never a broken image box"
  - "ExportProcess step badges are literal String(i+1).padStart(2,'0') strings, never Intl.NumberFormat, so they cannot leak Arabic-Indic digits on ar"
  - "Stripped an unrelated site_settings.site_name default-value ALTER from the auto-generated migration diff (pre-existing schema drift from an earlier rebrand, out of this task's scope) to keep the migration strictly additive"

patterns-established:
  - "Numbered-badge sequence pattern for ExportProcess: literal padStart string badges instead of Intl.NumberFormat, reusable for any future ordered-step block"

requirements-completed: [D-03, D-04, D-05]

coverage:
  - id: D1
    description: "TrustBar, ExportProcess, Testimonials Payload Block configs exist with the exact field shapes (TrustBar items[{logo optional, name required}], ExportProcess steps[{title, body}], Testimonials items[{quote, name, company?, country?}]), no field-level localized (cascades from Pages.layout)"
    requirement: D-03
    verification:
      - kind: unit
        ref: "grep -F 'slug: \"trustBar\"' src/blocks/TrustBar.ts / 'slug: \"exportProcess\"' src/blocks/ExportProcess.ts / 'slug: \"testimonials\"' src/blocks/Testimonials.ts"
        status: pass
      - kind: unit
        ref: "npx payload generate:types; grep blockType: 'trustBar'|'exportProcess'|'testimonials' payload-types.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "TrustBar does not reuse or extend CertStrip's Certifications-collection binding — standalone editor-authored block"
    requirement: D-03
    verification:
      - kind: unit
        ref: "manual review: src/blocks/TrustBar.ts and src/components/blocks/TrustBarBlock.tsx have zero imports from CertStrip/Certifications collection"
        status: pass
    human_judgment: false
  - id: D3
    description: "All three renderers registered in RenderBlocks.tsx BLOCK_MAP, render seeded and empty states without crashing"
    requirement: D-05
    verification:
      - kind: integration
        ref: "tests/int/blocks-placeholder.spec.ts#TrustBar/ExportProcess/Testimonials placeholder resilience (6 new cases)"
        status: pass
    human_judgment: false
  - id: D4
    description: "ExportProcess badges render literal two-character '01'-'05' strings, never Intl.NumberFormat, cannot leak Arabic-Indic digits on ar"
    requirement: D-05
    verification:
      - kind: integration
        ref: "tests/int/blocks-placeholder.spec.ts#ExportProcess with two steps renders literal '01'/'02' badge text"
        status: pass
      - kind: unit
        ref: "grep -F 'padStart(2, \"0\")' src/components/blocks/ExportProcessBlock.tsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Logical properties only (no ml-/mr-/pl-/pr-/left-/right-) in all new blocks/renderers; lint:rtl stays green; no color/typography/globals.css token change"
    requirement: D-04
    verification:
      - kind: other
        ref: "npm run lint:rtl"
        status: pass
    human_judgment: false
  - id: D6
    description: "A committed Postgres migration adds the three new block tables, additive-only (no DROP/ALTER of existing tables)"
    requirement: D-05
    verification:
      - kind: other
        ref: "src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts (manual review: up() contains only CREATE TABLE/ALTER TABLE ADD CONSTRAINT/CREATE INDEX for the 6 new block tables; no DROP/ALTER of pre-existing tables)"
        status: pass
    human_judgment: false

duration: 23min
completed: 2026-07-24
status: complete
---

# Phase 7 Plan 2: New CMS Blocks (TrustBar, ExportProcess, Testimonials) Summary

**Three new Payload Block configs (trustBar, exportProcess, testimonials) + async server renderers, wired through the full 4-point registration pattern, plus a committed additive Postgres migration for the new block tables.**

## Performance

- **Duration:** 23 min
- **Started:** 2026-07-24T09:20:14Z
- **Completed:** 2026-07-24T09:43:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Built `TrustBar`, `ExportProcess`, `Testimonials` Payload Block configs matching the StatsBand/MediaGallery config style exactly, with TrustBar deliberately standalone (no CertStrip/Certifications dependency)
- Built the 3 matching async server renderers (section-rhythm wrapper, `sectionBg` alternation, shared `blocks.emptyState` fallback), following FeatureGridBlock/ExportMapBlock/MediaGalleryBlock conventions
- Registered all three end-to-end: `src/blocks/index.ts` barrel, `Pages.ts` `layout.blocks` array, `RenderBlocks.tsx` `BLOCK_MAP`, regenerated `payload-types.ts`
- Generated and reviewed a committed, additive-only Postgres migration for the 6 new block/array tables (stripped one unrelated pre-existing schema-drift line before committing)
- Extended `tests/int/blocks-placeholder.spec.ts` with 6 new resilience cases (empty-state + basic-content, including the ExportProcess literal "01"/"02" badge assertion)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the 3 block configs, register them, regenerate types, create the migration** - `93843a6` (feat)
2. **Task 2: Build the 3 renderer components, wire BLOCK_MAP, extend the resilience test** - `986ec8b` (feat)

**Plan metadata:** (final commit hash recorded below in Next Phase Readiness / completion marker)

## Files Created/Modified
- `src/blocks/TrustBar.ts` - Payload Block config, slug `trustBar`, `sectionTitle` + `items[{logo? upload, name required}]`
- `src/blocks/ExportProcess.ts` - Payload Block config, slug `exportProcess`, `sectionTitle` + `steps[{title, body}]`
- `src/blocks/Testimonials.ts` - Payload Block config, slug `testimonials`, `sectionTitle` + `items[{quote, name, company?, country?}]`
- `src/blocks/index.ts` - +3 barrel re-exports
- `src/collections/Pages.ts` - +3 blocks in `@/blocks` import and `layout.blocks` array
- `src/components/blocks/TrustBarBlock.tsx` - centered logo/chip row renderer with grayscale logo tile + text-chip fallback
- `src/components/blocks/ExportProcessBlock.tsx` - semantic `<ol>` numbered-step renderer, literal "01"-"05" badges
- `src/components/blocks/TestimonialsBlock.tsx` - 3-up Card grid renderer with lucide `Quote` accent glyph
- `src/components/blocks/RenderBlocks.tsx` - +3 imports, +3 `BLOCK_MAP` entries
- `tests/int/blocks-placeholder.spec.ts` - +6 resilience test cases for the new blocks
- `payload-types.ts` - regenerated, +3 block union members
- `src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts` + `.json` - new committed Postgres migration (6 tables)
- `src/migrations/index.ts` - registered the new migration

## Decisions Made
- TrustBar's `logo` field left optional (no `required: true`) so a logo-less seed item renders as an honest text chip rather than a broken image box, matching the UI-SPEC's explicit design.
- ExportProcess step badges built as literal `String(i + 1).padStart(2, "0")` strings rather than any locale-aware number formatting, guaranteeing they never mirror to Arabic-Indic digits regardless of locale.
- Stripped one unrelated `ALTER TABLE "site_settings" ALTER COLUMN "site_name" SET DEFAULT ...` line that `payload migrate:create` auto-included in its schema diff (a pre-existing drift from an earlier company-rebrand change, unrelated to this task's block-table scope) from both `up()` and `down()` before committing the migration, keeping it strictly scoped to additive CREATE TABLE statements for the 3 new blocks per the plan's explicit "additive-only" acceptance criterion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking/scope-cleanliness] Removed unrelated schema-drift line from the generated migration**
- **Found during:** Task 1 (migration generation)
- **Issue:** `npx payload migrate:create` diffs against the full current schema state, so it captured an unrelated pre-existing drift (`site_settings.site_name` default value, from the earlier VNP Global rebrand) alongside the intended new block tables. The plan's acceptance criteria and threat model (T-07-02-02) require the migration's `up()` to be additive-only for the new block tables — including this line would have made the migration both add tables AND alter an unrelated existing table.
- **Fix:** Removed the `ALTER TABLE "site_settings" ...` line from both `up()` and `down()` in the generated migration file before committing. The block-table DDL itself was untouched.
- **Files modified:** `src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts`
- **Verification:** Manually reviewed the full migration file after the edit — `up()` now contains only `CREATE TABLE`, `ALTER TABLE ... ADD CONSTRAINT`, and `CREATE INDEX` statements scoped to the 6 new block/array tables; `down()` only drops those same tables.
- **Committed in:** `93843a6` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking/scope-cleanliness)
**Impact on plan:** Necessary to satisfy the plan's own additive-only migration acceptance criterion. No scope creep — the removed line was unrelated to this task and is not needed for the 3 new blocks to function; it remains an existing (harmless, code-level) drift for a future phase to reconcile if ever needed.

## Issues Encountered
- Worktree had no `.env`/`payload.db`/`node_modules` (all gitignored/build artifacts, expected in a fresh worktree). Copied `.env` and `payload.db` from the main checkout (both dev-only, gitignored) and symlinked `node_modules` from the main checkout (identical `package-lock.json`, verified via `diff` before symlinking) to run `payload generate:types`, `payload migrate:create`, `vitest`, `lint:rtl`, and `tsc` in this worktree.
- One test assertion (`TrustBar with a logo-less item ...`) initially failed because `renderToStaticMarkup` HTML-escapes `&` to `&amp;` — corrected the assertion string, no renderer change needed.

## User Setup Required

None - no external service configuration required. The committed Postgres migration will run automatically via `vercel.json`'s `payload migrate` build step on the next prod deploy.

## Next Phase Readiness
- The 3 new blocks (`trustBar`, `exportProcess`, `testimonials`) are selectable in `/admin`'s layout builder and ready to be composed into the homepage `pages` document.
- Plan 07-03 (homepage composition + seed content) can now reference these blocks by slug and seed realistic placeholder content per UI-SPEC §2a/2b/2c and §3.
- No blockers.

---
*Phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust*
*Completed: 2026-07-24*

## Self-Check: PASSED

All 8 created files verified present on disk; both task commits (`93843a6`, `986ec8b`) verified present in `git log`.
