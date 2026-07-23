---
phase: 02-core-marketing-pages-trust-surfaces
plan: 04
subsystem: trust-surfaces
tags: [payload-blocks, feature-grid, stats-band, document-card, company-page, lexical-seed, homepage]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 03
    provides: CertCard generic primitive (name/subtitle/logo/pdf/halal/t), certStrip block, RenderBlocks BLOCK_MAP + sectionBg, seed-assets pattern
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 02
    provides: Pages collection + layout blocks field, RenderBlocks dispatch, getPageContent, PAGES_EN_SEED/scripts/seed-pages.ts idempotent upsert
provides:
  - featureGrid Payload block (variant icon|photo, items[] icon/photo/title/body) + FeatureGridBlock (fixed lucide icon allow-list, item-count-capped columns, 96px circular photo)
  - statsBand Payload block (stats[] value/label) + StatsBandBlock (no card border, Display/Label tokens)
  - documentCard Payload block (title/description/file) + DocumentCardBlock reusing CertCard verbatim for the company-profile document
  - Complete Company/Compliance page (leadership FeatureGrid photo, 2 compliance RichText blocks, Company Profile documentCard, no fabricated IEC/registration number)
  - Enriched homepage (FeatureGrid value props + StatsBand capability figures in UI-SPEC order) and About page (brand-story RichText added)
  - richText() seed helper — hand-authored minimal Lexical root>paragraph>text JSON, reusable by any future seeded richText block
  - Leadership placeholder avatar assets (3 self-authored initials-in-circle SVGs) + idempotent attachLeadershipPhotos() seed step
affects: [02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "FeatureGrid is ONE block with a variant flag (icon|photo), not two separate blocks — matches CertStrip's variant-flag precedent from 02-03"
    - "DocumentCardBlock feeds a doc-shaped object (logo:null, halal:false) into the existing CertCard primitive verbatim — zero forked card markup, second reuse of CertCard after CertStripBlock's grid variant"
    - "T-02-10 mitigation: FeatureGrid's icon field is a CMS-authored STRING name resolved through a fixed lucide-react allow-list map (never a dynamic import), unknown/missing name falls back to a generic icon"
    - "seed-content.ts's richText() helper hand-authors the Lexical SerializedEditorState JSON directly (root > paragraph > text nodes) rather than using a markdown-to-lexical conversion package — matches the exact shape @payloadcms/richtext-lexical's ParagraphJSXConverter/TextJSXConverter render"
    - "Post-seed idempotent patch step (attachLeadershipPhotos in scripts/seed-pages.ts): uploads Media docs AFTER the page doc exists, then payload.update()s only the items still missing a photo relation — needed because FeatureGrid's photo items hold a real Media relation ID, unlike CertStrip's render-time collection lookup"
    - "KNOWN PROJECT-WIDE PITFALL (logged in deferred-items.md, not fixed here): Tailwind v4's named max-w-{size} utilities (max-w-sm, max-w-xl, max-w-2xl...) collide with this project's custom --spacing-{size} theme tokens in src/app/globals.css, silently resolving to 8px/32px/48px instead of the intended container widths. Confirmed via compiled CSS (.max-w-sm { max-width: var(--spacing-sm) }). This plan's own new usage (DocumentCardBlock) was fixed with a bracket value; pre-existing occurrences in Hero.tsx/CTABandBlock.tsx (Phase 1/02-02) were NOT touched (out of this plan's files_modified scope)"

key-files:
  created:
    - src/blocks/FeatureGrid.ts
    - src/blocks/StatsBand.ts
    - src/blocks/DocumentCard.ts
    - src/components/blocks/FeatureGridBlock.tsx
    - src/components/blocks/StatsBandBlock.tsx
    - src/components/blocks/DocumentCardBlock.tsx
    - scripts/seed-assets/avatar-managing-director.svg
    - scripts/seed-assets/avatar-quality-compliance.svg
    - scripts/seed-assets/avatar-export-operations.svg
    - tests/int/blocks-placeholder.spec.ts
    - tests/e2e/company.spec.ts
    - tests/e2e/homepage.spec.ts
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/lib/seed-content.ts
    - scripts/seed-pages.ts
    - scripts/seed-assets/README.md
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - payload-types.ts
    - "src/app/(payload)/admin/importMap.js"

key-decisions:
  - "Homepage block order follows the plan's frontmatter must_haves and the UI-SPEC Page Composition table (Hero -> FeatureGrid -> CertStrip -> StatsBand -> CTABand) rather than the plan's own Task 2 action text, which inverted FeatureGrid/CertStrip order — see Deviations, both the frontmatter and UI-SPEC independently agree, so treated as the authoritative source over a same-plan prose inconsistency"
  - "Leadership items use ROLE TITLES (Managing Director / Head of Quality & Compliance / Export Operations Manager), never invented personal names — sidesteps any fabricated-identity risk while staying realistic-shaped per D-03"
  - "Company-profile PDF intentionally left unseeded (file field absent) — DocumentCardBlock/CertCard render the honest 'available on request' state, matching T-02-08's disposition"
  - "Compliance RichText mentions holding an IEC registration and APEDA registration by NAME ONLY (no digits/number) — same established precedent as the homepage hero's 'ISO / HACCP / APEDA CERTIFIED' eyebrow, never a specific fabricated registration/certificate number"

patterns-established:
  - "Pattern: any future block needing rich text data in a static seed array can reuse seed-content.ts's richText(...paragraphs) helper rather than re-deriving the Lexical JSON shape"
  - "Pattern: a block whose items need a Media relation ID that doesn't exist until seed time (unlike CertStrip's render-time lookup) gets its own idempotent post-seed patch function in scripts/seed-pages.ts, keyed by a stable identifier (item title) so re-runs never re-upload or re-link"

requirements-completed: [TRUST-05, PAGE-01, PAGE-02]

# Metrics
duration: 75min
completed: 2026-07-15
---

# Phase 2 Plan 04: FeatureGrid + StatsBand + Company/Compliance Page Summary

**Homepage now carries a full value-props FeatureGrid and capability StatsBand in UI-SPEC order, and the Company/Compliance page is complete end-to-end — leadership bios, IEC/APEDA compliance narrative (no fabricated registration numbers), logistics copy, and a Company Profile document card that honestly reuses CertCard's PDF-absent "available on request" state.**

## Performance

- **Duration:** ~75 min
- **Completed:** 2026-07-15
- **Tasks:** 3
- **Files:** 22 (11 created, 12 modified — 1 file, `payload-types.ts`, counted once despite two regenerations)

## Accomplishments

- Three new Payload blocks — `featureGrid` (variant `icon`\|`photo`, items[] with icon/photo/title/body), `statsBand` (stats[] value/label), `documentCard` (title/description/file) — registered in `blocks/index.ts`, `Pages.ts`, and `RenderBlocks`' `BLOCK_MAP`.
- `FeatureGridBlock.tsx`: a fixed lucide-react icon allow-list (T-02-10 mitigation — never a dynamic import of a CMS-authored string), item-count-driven column cap (1/2/3/4, never more), 96px circular photo variant for leadership, and the UI-SPEC Copywriting Contract empty-state line for `items: []`.
- `StatsBandBlock.tsx`: no card border (visually distinct from FeatureGrid/CertCard per UI-SPEC), Display-token value + Label-token caption, same empty-state fallback for `stats: []`.
- `DocumentCardBlock.tsx`: reuses `CertCard` verbatim (logo:null, halal:false) for the company-profile document — zero forked card markup, the second block (after `CertStripBlock`'s grid variant) to reuse the same primitive.
- Company/Compliance page composed exactly per UI-SPEC: compact Hero -> FeatureGrid(photo, 3 leadership roles) -> RichText(IEC/APEDA compliance narrative, no fabricated numbers) -> RichText(logistics/documentation) -> documentCard(Company Profile, file absent) -> CTABand.
- Homepage enriched: Hero(full) -> FeatureGrid(icon, 4 value props: Quality/Reliability/Compliance/Global Reach) -> CertStrip -> StatsBand(15+/40+/500+ shaped, non-fabricated) -> CTABand.
- About page gained its missing brand-story RichText block (Hero -> RichText -> CTABand); leadership intentionally NOT duplicated here per UI-SPEC's About-vs-Company split note.
- `richText()` seed helper hand-authors the minimal Lexical `root > paragraph > text` JSON — no new package, matches the exact shape Payload's own JSX converters render.
- `attachLeadershipPhotos()` idempotent post-seed step uploads 3 self-authored initials-in-circle placeholder avatars (no real people photos, T-02-09) and links them onto the seeded `company` page's `featureGrid` items, keyed by title, safe to re-run.
- Full verification green: `npx tsc --noEmit`, `npm run lint:rtl`, `npm run db:seed` (idempotent, verified twice), `npm run build` (exit 0, all pages x 4 locales prerender), `npx vitest run` (19/19 int across all files), `npx playwright test` (106/106 e2e, full suite, en+ar).

## Task Commits

Each task was committed atomically:

1. **Task 1: FeatureGrid + StatsBand + DocumentCard blocks, render components, registration, i18n** - `cdf0b64` (feat)
2. **Task 2: Compose Company page + enrich homepage/About; seed leadership + company-profile placeholders** - `115eb13` (feat)
3. **Task 3: e2e (company, homepage sequence) + int placeholder-resilience tests** - `06b20c5` (test)

_Plan metadata commit follows this summary._

## Files Created/Modified

- `src/blocks/FeatureGrid.ts` / `StatsBand.ts` / `DocumentCard.ts` - Payload block field-schema configs, no nested `localized:true` (cascades from `Pages.layout`)
- `src/components/blocks/FeatureGridBlock.tsx` - icon allow-list, column-count cap, photo/icon variant render
- `src/components/blocks/StatsBandBlock.tsx` - borderless stats band render
- `src/components/blocks/DocumentCardBlock.tsx` - reuses `CertCard`, bracket-value `max-w-[384px]` (see Deviations)
- `src/blocks/index.ts` / `src/collections/Pages.ts` / `src/components/blocks/RenderBlocks.tsx` - registration points, 3 new `BLOCK_MAP` entries
- `src/lib/seed-content.ts` - `featureGrid()`/`statsBand()`/`documentCard()`/`richText()` seed helpers; home/about/company layouts updated
- `scripts/seed-pages.ts` - `attachLeadershipPhotos()` idempotent post-seed Media-upload + layout-patch step
- `scripts/seed-assets/avatar-{managing-director,quality-compliance,export-operations}.svg` - self-authored placeholder leadership avatars; README updated
- `src/i18n/messages/{en,ar,fr,ru}.json` - `blocks.emptyState` key added (UI-SPEC Copywriting Contract generic empty-state fallback)
- `payload-types.ts` - regenerated for the 3 new block union members
- `src/app/(payload)/admin/importMap.js` - Payload auto-regenerated (Lexical richtext features now exercised by real seeded content)
- `tests/int/blocks-placeholder.spec.ts` - `react-dom/server` `renderToStaticMarkup` + mocked `next-intl/server`, 5 tests covering long strings + empty arrays for both blocks
- `tests/e2e/company.spec.ts` - leadership grid, compliance text, doc-card absent-state, no-fabricated-number assertion (en+ar)
- `tests/e2e/homepage.spec.ts` - relative block order + all 4 value props render (en+ar)
- `.planning/phases/02-core-marketing-pages-trust-surfaces/deferred-items.md` - logged the pre-existing project-wide `max-w-{size}` collision (not committed — `.planning/` is gitignored, `commit_docs=false`)

## Decisions Made

- Homepage block order followed the plan's own frontmatter `must_haves` truth and the UI-SPEC table (`Hero -> FeatureGrid -> CertStrip -> StatsBand -> CTABand`) over the plan's Task 2 action-text prose, which had inverted FeatureGrid/CertStrip — see Deviations.
- Leadership bios use role titles, not invented personal names, avoiding any fabricated-identity concern while staying realistic per D-03.
- Company-profile PDF left unseeded on purpose — the honest PDF-absent CertCard state is the intended shipped state until a real file exists.
- IEC/APEDA compliance copy names the registrations by type only, never a specific number — same precedent as the existing homepage hero eyebrow copy.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Homepage block order: followed frontmatter must_haves + UI-SPEC over the plan's own Task 2 action text**
- **Found during:** Task 2, drafting `PAGES_EN_SEED`'s home layout.
- **Issue:** This plan's own frontmatter `must_haves.truths` states the homepage order as "Hero -> FeatureGrid -> CertStrip -> StatsBand -> ... -> CTABand" (matching `02-UI-SPEC.md`'s Page Composition table verbatim: "Hero (full...) -> FeatureGrid (icon...) -> CertStrip -> StatsBand... -> CTABand"). But Task 2's action text instructs "insert featureGrid... after the CertStrip, and statsBand... after it" — CertStrip before FeatureGrid, the reverse order, while still claiming to match "UI-SPEC homepage order." The plan's Task 2 acceptance_criteria bullet repeats the same inverted order. Two independent authoritative sources (this plan's own frontmatter, and the UI-SPEC doc it's built from) agree with each other and disagree with the Task 2 prose.
- **Fix:** Implemented `Hero -> FeatureGrid -> CertStrip -> StatsBand -> CTABand`, matching the frontmatter/UI-SPEC, not the Task 2 prose. Verified via a live-server byte-offset check (`FeatureGrid/Quality` text appears before the `/certifications` CertStrip link, which appears before `Years Exporting` StatsBand text) and via `tests/e2e/homepage.spec.ts`'s bounding-box order assertions (en+ar, both pass).
- **Files affected:** src/lib/seed-content.ts (home layout array order)
- **Committed in:** 115eb13 (Task 2)

**2. [Rule 1 - Bug] DocumentCardBlock's `max-w-sm` collapsed to 8px — fixed to a bracket value**
- **Found during:** Task 3 e2e run — `company.spec.ts`'s doc-card "available on request" assertion failed with `toBeVisible()` reporting `hidden` despite the element being present in the accessibility tree.
- **Issue:** Investigated via a throwaway Playwright script measuring `getBoundingClientRect`/`getComputedStyle`: the `<div className="mx-auto max-w-sm">` wrapper computed `width: 8px`. Root cause confirmed in the compiled dev CSS: `.max-w-sm { max-width: var(--spacing-sm); }` — this project's `src/app/globals.css` `@theme` block defines a custom named spacing scale (`--spacing-sm: 8px`, etc.) that Tailwind v4 also uses to generate the NAMED `max-w-{size}` utility classes, overriding Tailwind's own built-in `--container-sm: 24rem` default. This is a pre-existing, project-wide collision (also affects `HeroBlock.tsx`'s `max-w-2xl`/`max-w-xl` and `CTABandBlock.tsx`'s `max-w-2xl`, predating this plan — those files are outside this plan's `files_modified` list and weren't touched).
- **Fix:** Switched `DocumentCardBlock.tsx`'s own new usage to the bracket value `max-w-[384px]` (the real intended `sm` size). Logged the broader project-wide instance (Hero/CTABand) in a new `.planning/phases/02-core-marketing-pages-trust-surfaces/deferred-items.md` for a future dedicated fix, per the Scope Boundary rule (pre-existing issue in files not modified by this plan).
- **Files affected:** src/components/blocks/DocumentCardBlock.tsx; `.planning/.../deferred-items.md` (not committed, gitignored)
- **Verification:** re-ran `tests/e2e/company.spec.ts` — the doc-card "available on request" assertion now passes en+ar.
- **Committed in:** 06b20c5 (Task 3)

**3. [Rule 1 - Bug] Homepage e2e's `/ar` CertStrip-link selector used a fixed en-locale href**
- **Found during:** Task 3, first `tests/e2e/homepage.spec.ts` run — the `/ar` case of the block-order test failed to find `a[href="/certifications"]`.
- **Issue:** `next-intl`'s locale-aware `Link` (used by `CertStripBlock.tsx`) prefixes hrefs on non-default locales (`/ar/certifications`, not `/certifications`) — confirmed directly via a throwaway Playwright script listing all cert-related hrefs on `/ar`.
- **Fix:** Changed the selector to a suffix match (`a[href$="/certifications"]`), matching both `/certifications` (en) and `/ar/certifications`.
- **Files affected:** tests/e2e/homepage.spec.ts
- **Committed in:** 06b20c5 (Task 3)

**4. [Rule 3 - Blocking] Fresh worktree had no node_modules, `.env`, `.planning` docs, or seeded DB**
- **Found during:** start of execution.
- **Issue:** Worktree had no `node_modules`, `.env`, `payload.db`, or the gitignored `.planning/` plan docs — nothing could be read, built, or seeded.
- **Fix:** Created a directory junction `node_modules -> D:\PW\node_modules` (`mklink /J` — a plain symlink required admin privilege this environment doesn't have; a junction doesn't), a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + freshly generated `PAYLOAD_SECRET`), and copied the needed `.planning/` docs (02-04-PLAN, 02-UI-SPEC, 02-CONTEXT, 02-RESEARCH, taste-techniques, plus the 02-02/02-03 SUMMARYs already present) from the main `D:\PW` checkout. Ran `npm run db:seed` before build/test.
- **Files affected:** none committed (all gitignored, local-environment-only)

**Total deviations:** 4 auto-fixed (2 Rule 1 - bugs discovered in this plan's own new code/tests, 1 Rule 1 - plan-internal order inconsistency resolved via the more-authoritative source, 1 Rule 3 - environment setup). No architectural changes; no scope creep. No Rule 4 checkpoints. No auth gates.

## Known Stubs

- **Company Profile PDF is intentionally absent** — `documentCard`'s `file` field has no seeded Media doc; `DocumentCardBlock`/`CertCard` render the honest "Certificate available on request" state until the company provides a real profile PDF (T-02-08, matches the plan's explicit intent).
- **Leadership avatar photos are generic initials-in-circle placeholders**, not real people photography (T-02-09) — flagged in `scripts/seed-assets/README.md` for replacement (with consent) when the company provides real leadership photos.
- **Compliance RichText copy is generic prose** (holds an IEC + APEDA registration by name, no digits/number) — pending the company's actual verifiable registration details, which should replace this placeholder text before production launch, still with no publicly-displayed sensitive registration number unless the company explicitly wants that displayed.
- **ExportMap slot is still missing from the homepage sequence** (`Hero -> FeatureGrid -> CertStrip -> StatsBand -> [ExportMap gap] -> CTABand`) — explicitly deferred to plan 02-06 per this plan's own scope; `tests/e2e/homepage.spec.ts` asserts only the relative order of blocks that exist today, order-tolerant to this gap.

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary schema changes beyond what 02-02/02-03 already established. This plan's `<threat_model>` mitigations were honored: T-02-08 (no fabricated IEC/registration number; the company-profile PDF stays in its absent state; e2e assertion in `company.spec.ts` checks for absence of any IEC/FSSAI-shaped digit code), T-02-09 (self-authored placeholder avatars only, no real personal photos), T-02-10 (FeatureGrid icon is a fixed lucide allow-list, never a dynamic import of a CMS string).

## Issues Encountered

- During the Playwright e2e run, the dev server logged two transient `SyntaxError: Unexpected end of JSON input` warnings for `/en/company` and `/ar/company` page-data requests. Every corresponding test still passed with a 200 status and full content visible; this is the same pre-existing Turbopack/Next.js dev-server internal-request-handling noise already documented in 02-02-SUMMARY.md's Issues Encountered section (not caused by this plan's own source changes, out of scope per the Deviation Rules' Scope Boundary).
- Discovered and logged (not fixed) a project-wide Tailwind `max-w-{size}` / `--spacing-{size}` theme-token collision affecting `Hero.tsx`/`CTABandBlock.tsx` (predates this plan) — see Deviation #2 above and `.planning/phases/02-core-marketing-pages-trust-surfaces/deferred-items.md`.

## User Setup Required

None - no external service configuration required. Local `node_modules` junction, `.env`, and `payload.db` are dev-environment-only, gitignored, and not part of deployment config. The real company-profile PDF, verified compliance/registration copy, and real leadership photography (with consent) should be provided by the business/content team before this content ships to production.

## Next Phase Readiness

- `featureGrid`/`statsBand`/`documentCard` are proven end-to-end (build + int + e2e); later plans (Manufacturing/Export Track Record, per UI-SPEC Page Composition) can reuse `statsBand` directly with no new schema work.
- The Company/Compliance page is fully composed and matches TRUST-05's requirement; the About/Company split (leadership on Company only) is honored, satisfying the UI-SPEC's explicit "do not duplicate" note.
- Homepage's remaining gap (ExportMap between StatsBand and CTABand) is the sole item left for 02-06 to fill in; `tests/e2e/homepage.spec.ts`'s order-tolerant assertions won't need rewriting when that block lands, only extending.

## Self-Check: PASSED

Verified all 12 created files exist on disk (checked directly, all FOUND, no MISSING) (`src/blocks/{FeatureGrid,StatsBand,DocumentCard}.ts`, `src/components/blocks/{FeatureGridBlock,StatsBandBlock,DocumentCardBlock}.tsx`, 3 avatar SVGs, `tests/int/blocks-placeholder.spec.ts`, `tests/e2e/{company,homepage}.spec.ts`). All 3 task commit hashes (`cdf0b64`, `115eb13`, `06b20c5`) confirmed present in `git log --oneline -5`. No unexpected file deletions in any task commit (`git diff --diff-filter=D` checked per commit — empty). STATE.md/ROADMAP.md untouched per instructions.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
