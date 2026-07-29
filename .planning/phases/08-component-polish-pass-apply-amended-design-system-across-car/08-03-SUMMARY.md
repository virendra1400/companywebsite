---
phase: 08-component-polish-pass-apply-amended-design-system-across-car
plan: 03
subsystem: cms
tags: [payload, blocks, shadcn, radix-ui, accordion, postgres-migration, next-intl, rtl]

# Dependency graph
requires:
  - phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
    provides: "Block registration pattern (blocks/index.ts barrel, Pages.layout array, RenderBlocks.tsx BLOCK_MAP, regenerated payload-types.ts, additive Postgres migration) established by TrustBar/ExportProcess/Testimonials"
provides:
  - "New Payload Block config `faq` (src/blocks/Faq.ts) — sectionTitle + items[{question, answer}], registered end-to-end"
  - "New shadcn Accordion primitive (src/components/ui/accordion.tsx) over the existing radix-ui package, RTL-corrected"
  - "FaqBlock renderer — single-collapsible, card-less accordion, shared emptyState fallback, standard section rhythm"
  - "Committed additive Postgres migration for the new faq block/items tables"
  - "Seeded four-item FAQ section on the Contact page"
affects: [08-04, live-render-checkpoint, seo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New block registration follows the exact 4-point pattern (blocks/index.ts barrel, Pages.ts layout array, RenderBlocks.tsx BLOCK_MAP, regenerated payload-types.ts) established by the 12 prior blocks — Faq is the 13th"
    - "Official shadcn generators (npx shadcn add <component>) can be trusted to reuse the existing unified radix-ui package when it already exports the primitive — no new dependency was introduced"

key-files:
  created:
    - src/blocks/Faq.ts
    - src/components/ui/accordion.tsx
    - src/components/blocks/FaqBlock.tsx
    - src/migrations/20260729_002548_phase8_faq_block.ts
    - src/migrations/20260729_002548_phase8_faq_block.json
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - payload-types.ts
    - src/migrations/index.ts
    - src/components/blocks/RenderBlocks.tsx
    - tests/int/blocks-placeholder.spec.ts
    - src/lib/seed-content.ts

key-decisions:
  - "shadcn's accordion generator already imported Accordion from the unified radix-ui package (matching sheet.tsx's convention) — zero new npm dependency, confirmed via empty package.json/package-lock.json diff"
  - "Only the RTL-unsafe text-left -> text-start utility was corrected in the generated accordion.tsx; all other generated classes (focus ring, animation, chevron rotate) left untouched per Contract §4/§6 scope discipline"
  - "AccordionContent's answer text is architecturally absent from the initial closed-state SSR/static markup (verified against @radix-ui/react-collapsible source: Presence's isPresent/isOpen gating means content only renders when actually open, and forceMount cannot bypass this without permanently opening every item) -- the resilience test asserts the long question renders and the block never throws, but does not assert the closed-state answer substring, since asserting it would require violating the locked 'no item pre-opened' contract"

patterns-established:
  - "Faq() seed helper follows the exact one-line-factory style of testimonials()/exportProcess(), appended to the Contact page's layout array after contactBlock()"

requirements-completed: [FAQ-01]

coverage:
  - id: D1
    description: "Faq Payload Block config exists (slug faq, sectionTitle optional + items[{question required, answer required}]), no field-level localized set (cascades from Pages.layout), registered in blocks/index.ts barrel, Pages.ts layout.blocks, and regenerated payload-types.ts blockType union"
    requirement: FAQ-01
    verification:
      - kind: unit
        ref: "grep -F 'slug: \"faq\"' src/blocks/Faq.ts; grep -F 'export { Faq }' src/blocks/index.ts; grep -c 'Faq' src/collections/Pages.ts"
        status: pass
      - kind: unit
        ref: "npx payload generate:types; grep \"blockType: 'faq'\" payload-types.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Additive-only Postgres migration for the new faq block/items tables, registered in src/migrations/index.ts, no pre-existing migration modified, no DROP/ALTER of pre-existing tables in up()"
    requirement: FAQ-01
    verification:
      - kind: other
        ref: "src/migrations/20260729_002548_phase8_faq_block.ts (manual review: up() contains only CREATE TABLE/ALTER TABLE ADD CONSTRAINT/CREATE INDEX for pages_blocks_faq and pages_blocks_faq_items; down() only drops those two tables)"
        status: pass
    human_judgment: false
  - id: D3
    description: "shadcn Accordion primitive added with zero new npm dependency (imports from the existing radix-ui package) and zero physical-direction utilities (text-left corrected to text-start)"
    requirement: FAQ-01
    verification:
      - kind: unit
        ref: "grep -c 'radix-ui' src/components/ui/accordion.tsx; grep -c 'text-left' src/components/ui/accordion.tsx; git diff --stat package.json package-lock.json"
        status: pass
      - kind: other
        ref: "npm run lint:rtl"
        status: pass
    human_judgment: false
  - id: D4
    description: "FaqBlock renders a single-collapsible, nothing-pre-opened, card-less accordion with the shared emptyState fallback and the standard section rhythm string, registered under BLOCK_MAP.faq"
    requirement: FAQ-01
    verification:
      - kind: unit
        ref: "grep -F 'type=\"single\"' / 'defaultValue' (0 matches) / 'rounded-card' (0 matches) / 'shadow-card' (0 matches) in src/components/blocks/FaqBlock.tsx; grep -F 'faq: FaqBlock' src/components/blocks/RenderBlocks.tsx"
        status: pass
      - kind: integration
        ref: "tests/int/blocks-placeholder.spec.ts#FaqBlock placeholder resilience (2 cases: empty-state, long-question no-throw)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Seeded Contact page carries a live four-item FAQ whose answers restate only already-published process facts (no invented certifications/volumes/prices/client names); no other page or seed script changed"
    requirement: FAQ-01
    verification:
      - kind: unit
        ref: "grep -F 'blockType: \"faq\"' / 'Frequently Asked Questions' src/lib/seed-content.ts; git diff --stat scripts/seed-pages.ts (empty)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Live render of the FAQ on /en/contact and /ar/contact (RTL chevron/direction) — backstop human verification, per 08-UI-SPEC's 'verify at build time, don't assume' instruction for the accordion chevron under RTL"
    verification: []
    human_judgment: true
    rationale: "No automated visual-regression tooling exists in this repo (same gap prior phases recorded for their own card/button changes); the plan itself defers this to a blocking checkpoint in plan 08-04 (Wave 2), not to this plan's automated verification."

duration: 89min
completed: 2026-07-29
status: complete
---

# Phase 8 Plan 3: FAQ Block (Payload config, shadcn Accordion, renderer, migration, seed) Summary

**Built the FAQ block end-to-end — Payload config, shadcn Accordion primitive over the existing radix-ui package, single-collapsible card-less renderer, four-point registration, additive Postgres migration, and a seeded four-item Contact-page FAQ — closing the 08-UI-SPEC Component Audit #9 scope gap.**

## Performance

- **Duration:** 89 min
- **Started:** 2026-07-29T05:56:00+05:30
- **Completed:** 2026-07-29T07:25:22+05:30
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Built `src/blocks/Faq.ts` (Payload Block config, slug `faq`, `sectionTitle` optional + `items[{question, answer}]`), registered it in `blocks/index.ts`, `Pages.ts`'s `layout.blocks`, regenerated `payload-types.ts`, and generated a clean additive-only Postgres migration (no unrelated schema drift this time)
- Generated the shadcn `accordion` primitive via the official registry; confirmed zero new npm dependency (already imports `Accordion` from the existing `radix-ui` package, matching `sheet.tsx`'s convention) and corrected the one RTL-unsafe `text-left` utility to `text-start`
- Built `FaqBlock.tsx`: single-collapsible (`type="single" collapsible`), nothing pre-opened (no `defaultValue`), no card wrapper (`rounded-card`/`shadow-card` both absent), shared `emptyState` fallback for zero items, and the identical section-rhythm string every other block uses
- Registered `faq: FaqBlock` in `RenderBlocks.tsx`'s `BLOCK_MAP`
- Extended `tests/int/blocks-placeholder.spec.ts` with FAQ resilience cases (empty-state, long-question no-throw)
- Seeded a four-item FAQ section on the Contact page (`src/lib/seed-content.ts`) restating only already-published process facts (response time, documentation, samples) — no invented certifications, volumes, prices or client names

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the Faq block config, register it, regenerate types, generate the additive migration** - `fafc89f` (feat)
2. **Task 2: Add the Accordion primitive, build FaqBlock, register it in BLOCK_MAP, extend the int tests** - `368c099` (feat)
3. **Task 3: Seed a real FAQ section onto the Contact page** - `1a09fb4` (feat)

## Files Created/Modified
- `src/blocks/Faq.ts` - Payload Block config, slug `faq`, `sectionTitle` + `items[{question, answer}]`
- `src/blocks/index.ts` - +1 barrel re-export (`export { Faq }`)
- `src/collections/Pages.ts` - `Faq` added to `@/blocks` import and `layout.blocks` array
- `payload-types.ts` - regenerated, +1 `blockType: 'faq'` union member
- `src/migrations/20260729_002548_phase8_faq_block.ts` + `.json` - new committed additive Postgres migration (2 tables: `pages_blocks_faq`, `pages_blocks_faq_items`)
- `src/migrations/index.ts` - registered the new migration
- `src/components/ui/accordion.tsx` - shadcn Accordion/AccordionItem/AccordionTrigger/AccordionContent, RTL-corrected
- `src/components/blocks/FaqBlock.tsx` - async server renderer, single-collapsible card-less accordion
- `src/components/blocks/RenderBlocks.tsx` - +1 import, +1 `BLOCK_MAP` entry (`faq: FaqBlock`)
- `tests/int/blocks-placeholder.spec.ts` - +2 FaqBlock resilience cases
- `src/lib/seed-content.ts` - `faq()` block helper + four-item FAQ section on the seeded Contact page

## Decisions Made
- The shadcn accordion generator already imported from the unified `radix-ui` package (no per-primitive `@radix-ui/react-accordion` package added) — confirmed by an empty `package.json`/`package-lock.json` diff, satisfying the T-08-03-SC supply-chain gate with no revert/rewrite needed.
- Only `text-left` -> `text-start` was corrected in the generated `accordion.tsx`; all other generated classes (focus ring, animation, chevron `rotate-180`) were left untouched, per Contract §6/§4 scope discipline.
- The migration this time contained zero unrelated schema drift (unlike Phase 7's migration, which required stripping a `site_settings` line) — reviewed and committed as-generated.
- `FaqBlock`'s `AccordionContent` for a closed (never-opened) item is architecturally absent from initial static/SSR markup — traced through `@radix-ui/react-collapsible`'s source (`isOpen = context.open || isPresent`, gated by `Presence`'s `usePresence` state machine) to confirm this is inherent to the mandated "no item pre-opened" contract, not a bug in `FaqBlock`. `forceMount` was ruled out as a fix because it forces `isPresent` permanently true, which would make every item permanently visually open — a worse regression than the test gap it would close.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test correctness] Adjusted the populated-content FAQ test assertion to match Radix Accordion's real, spec-compliant behavior**
- **Found during:** Task 2 (`npm test` verification)
- **Issue:** The plan's Task 2 action 6 specified a test case asserting that a populated FAQ block "renders both a long question string and a long answer string." When implemented literally, this failed: `@radix-ui/react-collapsible`'s `Presence`-driven `AccordionContent` only renders its `children` when the item is actually open (`isOpen = context.open || isPresent`), and since Contract §6 mandates "no item pre-opened," a closed item's answer text is never present in the initial static/SSR markup — traced through the installed `node_modules/@radix-ui/react-collapsible/dist/index.mjs` source to confirm this, not assumed. `forceMount` does not fix this: it forces `isPresent` permanently true, which makes `isOpen` permanently true too, breaking the visual collapse for every item (a worse regression).
- **Fix:** Kept the production `FaqBlock`/`accordion.tsx` exactly as specified (single-collapsible, no `defaultValue`, no `forceMount`, no touched animation classes). Adjusted only the test assertion to verify the long question renders in the trigger (always present regardless of open state) and the block never throws on long content, documenting in the test's own `it(...)` description why the closed-state answer substring is not asserted.
- **Files modified:** `tests/int/blocks-placeholder.spec.ts`
- **Verification:** `npm test` — 82/82 passing, including the two new FaqBlock cases.
- **Committed in:** `368c099` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 test-correctness)
**Impact on plan:** No production-code deviation — `FaqBlock` and `accordion.tsx` match Contract §6 verbatim. Only the test's literal wording was adjusted to reflect Radix Accordion's actual, verified behavior rather than an incorrect assumption in the plan's test spec. No scope creep.

## Issues Encountered
- The `npm test` run after Task 3 took anomalously long in the background shell (vitest self-reported ~4743s import time vs. ~40-60s on the two earlier foreground runs in this same plan) despite identical test files and an unrelated one-file change (`seed-content.ts`). All 82 tests still passed with no failures — treated as background-environment flakiness (resource contention), not a code regression, since the two prior runs of the identical suite completed quickly and consistently.

## User Setup Required

None - no external service configuration required. The committed Postgres migration (`20260729_002548_phase8_faq_block`) will run automatically via `vercel.json`'s `payload migrate` build step on the next prod deploy.

## Next Phase Readiness
- The `faq` block is selectable in `/admin`'s layout builder on any page and is live on the seeded Contact page with four honest, process-only Q&A pairs.
- **Blocking checkpoint carried to plan 08-04 (Wave 2):** live render verification of the FAQ on `/en/contact` and `/ar/contact` (RTL chevron/direction) per this plan's own `<verification>` section — not yet performed in this plan.
- No blockers.

---
*Phase: 08-component-polish-pass-apply-amended-design-system-across-car*
*Completed: 2026-07-29*

## Self-Check: PASSED

All 5 created files verified present on disk; all 3 task commits (`fafc89f`, `368c099`, `1a09fb4`) verified present in `git log`.
