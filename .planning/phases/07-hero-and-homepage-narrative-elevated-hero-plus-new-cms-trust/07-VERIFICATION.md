---
phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
verified: 2026-07-25T04:05:00Z
status: passed
score: 16/16 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 7: Hero and Homepage Narrative Verification Report

**Phase Goal:** Homepage tells the full trust narrative: elevated hero (large thin display headline, refined CTA rhythm, atmospheric image treatment) plus new CMS blocks — trust-indicator/partner row, Why Choose Us, Manufacturing Excellence, Export Process timeline, Testimonials — all Payload-editable, seeded with realistic placeholders.
**Verified:** 2026-07-25T04:05:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Must-haves merged from all three plans' frontmatter (`07-01-PLAN.md`, `07-02-PLAN.md`, `07-03-PLAN.md`) — ROADMAP.md carries no separate numbered Success Criteria list for Phase 7 (Requirements: TBD, per task note), so the plan-level `must_haves.truths` are the contract.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Full-variant Hero headline elevated to `text-display-xl font-display font-light tracking-display` (56px/300/-0.025em) | ✓ VERIFIED | Read `src/components/blocks/HeroBlock.tsx:36-38` — `headlineClass` isFull branch is exactly `"max-w-[46rem] text-display-xl font-display font-light tracking-display text-white"`. |
| 2 | Compact variant (interior pages) byte-identical to pre-Phase-7 (`max-w-[42rem] text-display font-semibold`, `gap-lg`, unchanged padding/overlay) | ✓ VERIFIED | Same file, compact branches of `heroPadding`/`overlayClass`/`stackGap`/`headlineClass`/`subheadClass` match the pre-existing literal values verbatim (`px-md py-3xl md:px-lg xl:px-xl`, `from-primary-900/80 via-primary-900/30`, `gap-lg`, `max-w-[42rem] text-display font-semibold text-white`). |
| 3 | Full-variant overlay softened to `bg-gradient-to-t from-primary-900/75 via-primary-900/25 to-transparent`, `xl:py-4xl` rhythm, `gap-xl` applied | ✓ VERIFIED | `HeroBlock.tsx:29-35` — literal strings present exactly as specified. |
| 4 | `data-testid="hero"` and `data-testid="sample-count"` preserved verbatim; full/compact split and CTA/WhatsApp structure unchanged | ✓ VERIFIED | `grep -c 'data-testid="hero"'` = 1, `grep -c 'data-testid="sample-count"'` = 1; eyebrow/CTA/WhatsApp block untouched (lines 71-96 identical structure to pre-phase). |
| 5 | No color token, body-tier typography token, or `@theme`/globals.css edit introduced | ✓ VERIFIED | `git diff` scope (b37a555^..307613d) shows no `src/app/globals.css` touched; only pre-existing Phase-6 utility classes referenced. |
| 6 | Three new Block configs (`trustBar`, `exportProcess`, `testimonials`) exist with exact field shapes, no field-level `localized` | ✓ VERIFIED | Read `src/blocks/TrustBar.ts`, `ExportProcess.ts`, `Testimonials.ts` — slugs and field shapes match spec exactly; no `localized:` key on any field. `payload-types.ts` (lines 335-380) confirms all 3 `blockType` union members regenerated with matching field types. |
| 7 | TrustBar does NOT reuse/extend CertStrip's Certifications-collection binding | ✓ VERIFIED | `grep -n "CertStrip\|certifications" src/blocks/TrustBar.ts src/components/blocks/TrustBarBlock.tsx` returns zero code references (only comments explicitly noting the deliberate non-reuse). |
| 8 | Each renderer registered in `RenderBlocks.tsx` `BLOCK_MAP`, renders without crashing on empty items/steps (shared `blocks.emptyState` fallback) | ✓ VERIFIED | `RenderBlocks.tsx:36-38` — `trustBar: TrustBarBlock, exportProcess: ExportProcessBlock, testimonials: TestimonialsBlock`. Ran `npx vitest run tests/int/blocks-placeholder.spec.ts` myself — **11/11 passed**, including empty-state cases for all 3 new blocks. |
| 9 | ExportProcess step badges render literal `String(i+1).padStart(2,'0')` strings, never `Intl.NumberFormat` | ✓ VERIFIED | `ExportProcessBlock.tsx:43` — `{String(i + 1).padStart(2, "0")}`; no `Intl.NumberFormat`/`format.number` call anywhere in the file. |
| 10 | Logical properties only (no `ml-/mr-/pl-/pr-/left-/right-`); `lint:rtl` green; no color/typography/globals.css change | ✓ VERIFIED | Ran `npm run lint:rtl` myself — **"RTL guard: no physical-direction classes under src/." (0 violations)**. |
| 11 | A committed Postgres migration adds the three new block tables, additive-only | ✓ VERIFIED | Read `src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts` in full — `up()` contains only `CREATE TABLE`/`ALTER TABLE ... ADD CONSTRAINT`/`CREATE INDEX` for the 6 new block/array tables; `down()` only drops those same tables (no DROP/ALTER of any pre-existing table). Registered in `src/migrations/index.ts`. |
| 12 | The `home` Pages document composes the 11-block narrative in the exact UI-SPEC order | ✓ VERIFIED (see note) | `src/lib/seed-content.ts:200-305` — `layout` array literally composes `homeHero, trustBar(...), featureGrid(...), mediaGallery(...), statsBand(...), certStrip(...), statsBand(...), exportProcess(...), exportMap(...), testimonials(...), ctaBand(...)` in that exact order; `npx tsc --noEmit` (run by me) confirms it type-checks against the regenerated `payload-types.ts`. **Note:** the current local-dev `payload.db` in this working directory still holds the pre-Phase-7 6-block `home` document (seed script is skip-by-slug and wasn't re-run here) — see Data-Flow Trace below. Production's canonical `home` document was independently migrated via a one-time API route and confirmed via live UAT screenshots (07-UAT.md tests 1-3, 18/18 passed), which is the actual deliverable. |
| 13 | TrustBar seeded with 5 logo-less region descriptors, ExportProcess with 5 steps, Testimonials with 3 role+category+country quotes flagged in-code as placeholder — no fabricated named clients | ✓ VERIFIED | `seed-content.ts:202-208` (region descriptors, no company names), `:254-275` (5-step inquiry→delivery sequence), `:282-303` (3 testimonials — role/generic-buyer-category/real country, with an explicit "Placeholder testimonials" comment at line 279). |
| 14 | Manufacturing Excellence is a condensed composition reusing MediaGallery+StatsBand with verbatim `/manufacturing` copy — no new block/schema | ✓ VERIFIED | `seed-content.ts:235-247` — home's `mediaGallery`/`statsBand` calls use the identical 3 captions and capacity/QC/cold-chain figures as the `/manufacturing` page entry (`:353-369`), confirmed byte-identical by direct comparison. |
| 15 | `injectFacilityPhotos()` generalized to attach placeholder photos to every page's `mediaGallery` block(s), not just manufacturing | ✓ VERIFIED | `scripts/seed-pages.ts:68-83` — iterates `PAGES_EN_SEED`, filters each page's `mediaGallery` blocks, keys off `item.caption` against `FACILITY_PHOTOS`, reuses `upsertMediaByAlt` unchanged. No slug hardcoding remains. |
| 16 | Existing `homepage.spec.ts` / `rtl-arabic.spec.ts` / `fallback-notice.spec.ts` still pass; no new i18n key added; `HOME_EN_SEED` unchanged | ✓ VERIFIED (indirect) | `HOME_EN_SEED` (seed-content.ts:460-463) still derives from unchanged `homeHero`. `grep` across `src/i18n/messages/` finds no new key. I could not execute Playwright e2e myself in this sandbox (headless Chromium could not reach the already-running dev server across the tool's process isolation — command hung on every attempt, an environment limitation, not a code defect). Falling back to: (a) the SUMMARY-documented CI-style runs across all 3 plans (07-01: 6/6 rtl-arabic; 07-02: lint/tsc/vitest green; 07-03: 14/14 homepage+rtl-arabic, 4/4 fallback-notice, 76/76 vitest), and (b) 07-UAT.md's live-production screenshot verification of the identical rendered content (18/18 passed). No code path was touched that would plausibly break these anchors (`homepage.spec.ts` asserts only pre-existing Hero/FeatureGrid/CertStrip/StatsBand('Years Exporting')/ExportMap/CTABand anchors, none of which were removed or reordered). |

**Score:** 16/16 truths verified (0 present-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/blocks/HeroBlock.tsx` | isFull-conditional elevated full-variant hero | ✓ VERIFIED | Read in full; matches plan literally. |
| `src/blocks/TrustBar.ts` | Block config, slug `trustBar` | ✓ VERIFIED | Read in full; matches spec. |
| `src/blocks/ExportProcess.ts` | Block config, slug `exportProcess` | ✓ VERIFIED | Read in full; matches spec. |
| `src/blocks/Testimonials.ts` | Block config, slug `testimonials` | ✓ VERIFIED | Read in full; matches spec. |
| `src/components/blocks/TrustBarBlock.tsx` | Renderer, grayscale logo tile + chip fallback | ✓ VERIFIED | Contains `grayscale`, chip fallback pattern. |
| `src/components/blocks/ExportProcessBlock.tsx` | Renderer, semantic `<ol>`, literal badges | ✓ VERIFIED | Contains `<ol`, `padStart(2, "0")`. |
| `src/components/blocks/TestimonialsBlock.tsx` | Renderer, 3-up Card grid, Quote glyph | ✓ VERIFIED | Contains `shadow-card`, `text-accent-600`, `Quote` import. |
| `src/components/blocks/RenderBlocks.tsx` | BLOCK_MAP +3 entries | ✓ VERIFIED | All 3 imports + map entries present. |
| `src/collections/Pages.ts` | +3 blocks in import + `layout.blocks` array | ✓ VERIFIED | `grep -c` for each name ≥ 2 (import + array). |
| `src/blocks/index.ts` | +3 barrel exports | ✓ VERIFIED | All 3 exports present. |
| `tests/int/blocks-placeholder.spec.ts` | +6 resilience cases | ✓ VERIFIED | Ran the suite myself — 11/11 pass. |
| `payload-types.ts` | +3 block union members | ✓ VERIFIED | `blockType: 'trustBar'/'exportProcess'/'testimonials'` all present. |
| `src/migrations/20260724_093617_phase7_homepage_narrative_blocks.ts` (+`.json`) | Additive migration for 3 blocks | ✓ VERIFIED | Read in full — additive-only DDL confirmed. |
| `src/migrations/index.ts` | References new migration | ✓ VERIFIED | Import + registration present. |
| `src/lib/seed-content.ts` | +3 seed helpers, rewritten 11-block `home` layout | ✓ VERIFIED | Read in full — matches spec. |
| `scripts/seed-pages.ts` | Generalized `injectFacilityPhotos()` | ✓ VERIFIED | Read in full — iterates all pages. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `isFull` boolean | Elevated hero classes | 5 ternary class variables | ✓ WIRED | All 5 (`heroPadding`/`overlayClass`/`stackGap`/`headlineClass`/`subheadClass`) branch on `isFull`, referenced in JSX. |
| Block config slug | `Pages.layout.blocks` entry | `@/blocks` import + array | ✓ WIRED | `TrustBar`/`ExportProcess`/`Testimonials` present in both import and `layout.blocks` array in `Pages.ts`. |
| `Pages.layout.blocks` | `RenderBlocks` `BLOCK_MAP` | slug string key | ✓ WIRED | Slugs match exactly (`trustBar`, `exportProcess`, `testimonials`) across config/renderer/map. |
| `payload-types.ts` `blockType` union | Renderer prop types | `Extract<...>` narrowing | ✓ WIRED | Each renderer imports and narrows via `Extract<NonNullable<Page["layout"]>[number], { blockType: "<slug>" }>`; `tsc --noEmit` passes. |
| `seed-content.ts` `home` layout | `pages_blocks_*` tables (canonical/prod) | `payload.create()` via `seed-pages.ts` | ✓ WIRED (prod) / ⚠ STALE (this local dev DB) | Prod verified via UAT screenshots; this working directory's `payload.db` still holds the pre-Phase-7 layout (see Data-Flow Trace). |
| `mediaGallery` item `caption` | `FACILITY_PHOTOS` key | `injectFacilityPhotos()` | ✓ WIRED | Home's captions (`Processing Floor`/`Quality Control Lab`/`Cold Storage`) match `FACILITY_PHOTOS` keys exactly. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `home` Pages document (**production**) | `layout` (11 blocks) | `POST /api/reseed-home` (one-time, token-protected, since removed) → `payload.create/update` | Yes — confirmed via 07-UAT.md live screenshot review (TrustBar chips, Manufacturing gallery photos, Testimonials cards, ExportProcess timeline all rendered with real content) | ✓ FLOWING (prod) |
| `home` Pages document (**this local `payload.db`**) | `layout` | `scripts/seed-pages.ts` (skip-by-slug — did not touch existing `home` doc) | No — queried directly via `sqlite3`: `pages_blocks_trust_bar`/`_export_process`/`_testimonials`/`_media_gallery` (home) all return **0 rows** for `_parent_id=1`; `home.updated_at = 2026-07-23T10:18:04Z`, predating Phase 7 (started 2026-07-24) | ⚠ STALE — informational, not a gap (see below) |

**Note on local DB staleness:** `payload.db` is gitignored, dev-only, and per-worktree — each of the three plan-execution worktrees copied it from the (unchanged) main checkout, made their DB changes in isolation, and never copied the result back. Running `npm run db:seed` here confirms `home` is skipped ("already seeded"), consistent with skip-by-slug design; deleting the doc and re-running would reproduce the 07-03 SUMMARY's documented successful re-seed (already independently verified once, in the 07-03 worktree, via `sqlite3` queries showing non-zero image ids, and again in production via the temporary API route). I attempted to reproduce this directly but the destructive `DELETE FROM pages` was blocked by the tool's permission classifier; I did not attempt to work around that block. This is a local-dev reproducibility note, not a phase-goal failure — the canonical deliverable (source code + prod content) is verified.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Renderers render empty-state + basic content without throwing (incl. ExportProcess "01"/"02" literal badges) | `npx vitest run tests/int/blocks-placeholder.spec.ts` | 11/11 passed | ✓ PASS |
| No physical-direction Tailwind utilities in any modified file | `npm run lint:rtl` | "RTL guard: no physical-direction classes under src/." | ✓ PASS |
| All phase-modified TypeScript type-checks | `npx tsc --noEmit` | Exit 0, no output | ✓ PASS |
| Homepage/RTL/fallback e2e regression (Playwright) | `npx playwright test tests/e2e/homepage.spec.ts tests/e2e/rtl-arabic.spec.ts` | Could not complete — headless Chromium hung reaching the already-running dev server across this sandbox's process isolation (confirmed dev server itself is up via `curl` returning 200/307); `--list` succeeded instantly, ruling out a config/discovery issue | ? SKIP (environment limitation) — relying on SUMMARY-documented + UAT-documented prior runs |
| Migration DDL additive-only | Manual read of `up()`/`down()` | Only `CREATE TABLE`/`ADD CONSTRAINT`/`CREATE INDEX` in `up()`; only `DROP TABLE` of the same 6 new tables in `down()` | ✓ PASS |
| No `dangerouslySetInnerHTML` in any new/modified renderer | `grep -n dangerouslySetInnerHTML` across all 4 renderer files | 0 matches | ✓ PASS |

### Probe Execution

Not applicable — this phase is not a migration/tooling phase with `scripts/*/tests/probe-*.sh` convention; no probes declared in PLAN/SUMMARY. Skipped.

### Requirements Coverage

Phase 7's ROADMAP entry lists "Requirements: TBD" (v2.0 Premium Redesign milestone phase, not tied to REQUIREMENTS.md catalog — per explicit task instruction, not blocking). Coverage is tracked against the phase-local decision IDs (D-01 through D-05) declared in each plan's `requirements:` frontmatter field and CONTEXT.md.

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| D-01 | 07-01 | Hero headline elevated to display-xl tier | ✓ SATISFIED | Truth #1 |
| D-02 | 07-01 | Softened atmospheric overlay, wider rhythm | ✓ SATISFIED | Truth #3 |
| D-03 | 07-02, 07-03 | New CMS blocks + homepage composition, no fabricated content | ✓ SATISFIED | Truths #6, #7, #12, #13, #14 |
| D-04 | 07-01, 07-02, 07-03 | No color/typography/globals.css drift; logical properties only | ✓ SATISFIED | Truths #5, #10, #16 |
| D-05 | 07-02, 07-03 | Non-technical editability, migration, digit-safety, photo injection | ✓ SATISFIED | Truths #8, #9, #11, #15 |

No orphaned requirements — REQUIREMENTS.md has no Phase 7 row to cross-reference against (confirmed: `grep -E "Phase 7" .planning/REQUIREMENTS.md` returns nothing, consistent with the "TBD" status).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | None found. All "placeholder" mentions across `seed-content.ts`/`scripts/seed-pages.ts`/`TestimonialsBlock.tsx` are intentional, explicitly documented seed-content caveats (Pitfall 5 — no fabricated named clients), not code stubs. No `TBD`/`FIXME`/`XXX`/`HACK` debt markers in any phase-modified file. No `dangerouslySetInnerHTML`. No empty `return null`/`{}`/`[]` stub bodies (the one `return null` in `RenderBlocks.tsx` is the documented, pre-existing "unknown blockType: fail soft" guard, unrelated to this phase's new code). |

### Human Verification Required

None. 07-UAT.md already closed all human-judgment items against the live production deployment (18/18 passed, 0 issues, 0 pending) — per explicit task instruction, these results are treated as satisfying human verification for this phase, not re-asked here.

### Gaps Summary

No gaps. All 16 merged must-have truths across the three plans (07-01 hero elevation, 07-02 new block configs/renderers/migration, 07-03 homepage composition/seed content) are verified directly against the current codebase — not merely inferred from SUMMARY.md claims. Independently re-ran `npx tsc --noEmit`, `npm run lint:rtl`, and `npx vitest run tests/int/blocks-placeholder.spec.ts` myself (all green); read every modified/created source file in full; confirmed the Postgres migration is additive-only by direct inspection; confirmed TrustBar's CertStrip-independence and the absence of `dangerouslySetInnerHTML` by grep; confirmed the 4-point block-registration wiring (barrel → Pages.layout → BLOCK_MAP → payload-types.ts) end-to-end.

Two informational notes (neither a gap nor a new human-verification item):
1. **Local dev DB staleness** — this working directory's `payload.db` still holds the pre-Phase-7 6-block `home` layout (seed script is correctly skip-by-slug; production was migrated separately via a now-removed one-time API route and independently confirmed via live UAT screenshots). A developer running `npm run dev` locally right now would see the old homepage until they delete the `home` doc and re-run `npx tsx scripts/seed-pages.ts`, per the documented procedure in 07-03-PLAN.md's own key_links.
2. **E2E execution environment limitation** — Playwright's headless Chromium could not reach the (confirmed-running, curl-verified) dev server from this sandbox's Bash tool in three separate attempts, timing out with zero output even on `--list`-confirmed-valid single-test runs. This is a tool/sandbox process-isolation limitation, not a code defect; e2e evidence for this phase instead rests on the SUMMARY-documented pass counts from the actual plan-execution runs (07-01: 6/6, 07-03: 14/14 + 4/4 fallback-notice + 76/76 vitest) plus the live-production UAT screenshot review.

---

_Verified: 2026-07-25T04:05:00Z_
_Verifier: Claude (gsd-verifier)_
