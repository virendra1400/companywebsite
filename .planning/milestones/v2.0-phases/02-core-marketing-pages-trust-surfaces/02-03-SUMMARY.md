---
phase: 02-core-marketing-pages-trust-surfaces
plan: 03
subsystem: trust-surfaces
tags: [certifications, cert-card, cert-strip, halal-elevation, pdf-states, payload-blocks, seed-assets]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 02
    provides: Pages collection + layout blocks field, Certifications collection schema, RenderBlocks BLOCK_MAP + sectionBg helper, getPageContent fetch pattern, seed-content.ts PAGES_EN_SEED, scripts/seed-pages.ts idempotent upsert
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 01
    provides: shadcn Card/Badge/AspectRatio primitives
provides:
  - CertCard shared primitive (generic name/subtitle/logo/pdf/halal/t prop shape — reused later by the Company/Compliance document card)
  - certStrip Payload block (variant strip|grid) registered in blocks/index.ts + Pages.ts + RenderBlocks BLOCK_MAP
  - CertStripBlock async RSC (halal-first grid/strip render, empty-state copy, locale via next-intl getLocale)
  - getCertifications(locale) fetch helper (halal-first stable sort)
  - certs.* i18n namespace in en/ar/fr/ru
  - seeded sample certs (3) + self-authored placeholder assets (3 logo SVGs + 1 PDF) under scripts/seed-assets/
affects: [02-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CertCard takes a GENERIC prop shape (name/subtitle/logo/pdf/halal/t), never a raw Certification — so the later Company/Compliance document card reuses it with zero new components (UI-SPEC 'not a new component')"
    - "certStrip block carries NO cert data — CertStripBlock queries the Certifications collection at render via getCertifications(locale); the block only holds variant + optional sectionTitle/intro"
    - "Block components read locale internally via next-intl getLocale() rather than prop-drilling (matches Hero/RichText/CTABand, none of which receive locale as a prop)"
    - "halal-first ordering is a JS stable re-sort on top of the DB displayOrder sort — no second DB round-trip, avoids a compound-sort query"
    - "Binary seed asset (PDF) pinned with a scripts/seed-assets/.gitattributes `*.pdf binary` rule so core.autocrlf=true can't corrupt its xref byte offsets"

key-files:
  created:
    - src/components/blocks/CertCard.tsx
    - src/blocks/CertStrip.ts
    - src/components/blocks/CertStripBlock.tsx
    - scripts/seed-assets/README.md
    - scripts/seed-assets/.gitattributes
    - scripts/seed-assets/logo-iso-22000.svg
    - scripts/seed-assets/logo-food-safety.svg
    - scripts/seed-assets/logo-halal.svg
    - scripts/seed-assets/sample-certificate.pdf
    - tests/int/certifications.spec.ts
    - tests/e2e/certifications.spec.ts
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/lib/payload-fetch.ts
    - src/lib/seed-content.ts
    - scripts/seed-pages.ts
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - payload-types.ts

key-decisions:
  - "Both PDF-present certs share ONE placeholder PDF Media doc (sharedPdfId) rather than uploading a duplicate — fewer Media rows, and the placeholder content is identical anyway"
  - "Logos are SVG (image/svg+xml, already allowed by Media's image/* mimeType) rather than PNG — smaller, resolution-independent, and trivially hand-authored as labeled boxes with no trademark risk"
  - "Added scripts/seed-assets/.gitattributes to force the PDF as binary — core.autocrlf=true would otherwise rewrite bytes and break the PDF's internal xref offsets (verified byte-identical after staging)"
  - "issuingBody names are realistic-length but generic; NO fabricated certificate/IEC/registration numbers or named clients (Pitfall 5/9, threat T-02-07 accept disposition)"

patterns-established:
  - "Pattern: a collection-backed block (certStrip) stores only presentational config; its React component fetches the collection at render — keeps editor-facing block config minimal and the cert list a single source of truth"

requirements-completed: [TRUST-01, TRUST-02]

# Metrics
duration: 40min
completed: 2026-07-15
---

# Phase 2 Plan 03: Certifications Page + Homepage CertStrip Summary

**The Certifications collection (schema-only after 02-02) is now consumed end-to-end: a generic `CertCard` primitive + a collection-backed `certStrip` block render every published cert as a card on `/certifications` (Halal cert elevated with an accent border, badge, and 2-column span) and as a compact logo strip on the homepage, with honest PDF-present/PDF-absent states and legally-safe self-authored placeholder assets.**

## Performance

- **Duration:** ~40 min
- **Completed:** 2026-07-15
- **Tasks:** 3
- **Files:** 22 (11 created, 11 modified)

## Accomplishments

- `CertCard.tsx` — the single reusable card primitive with a GENERIC prop shape (`name/subtitle/logo/pdf/halal/t`), NOT a raw `Certification`, so the later Company/Compliance document card reuses it without a new component. Standard vs. halal treatment (2px `border-accent-600`, `bg-accent-100`/`text-accent-800` "Halal Certified" badge, `col-span-2`), PDF-present safe download anchor (`download` + `target="_blank"` + `rel="noopener noreferrer"` + `aria-label`), PDF-absent muted "Certificate available on request" line (never a dead link). Media typeof-object guard repeated for logo + pdf (Pitfall 3). Logical properties only.
- `CertStrip.ts` block (`slug: certStrip`, `variant` select strip|grid, optional `sectionTitle`/`intro`) — no cert data on the block; registered in `blocks/index.ts`, `Pages.ts` blocks array, and `RenderBlocks` `BLOCK_MAP`.
- `CertStripBlock.tsx` async RSC — reads locale via `getLocale()`, calls `getCertifications(locale)`, renders the `grid` variant (CertCard grid, halal first + spanning) or the `strip` variant (logos-only wrapped row, each `<Link href="/certifications">`, halal logo keeps its accent border), and the UI-SPEC "Certifications coming soon" empty state when zero certs exist.
- `getCertifications(locale)` in `payload-fetch.ts` — `overrideAccess:true`, locale + en fallback, DB sort by `displayOrder`, then a stable JS re-sort putting `halal:true` first (TRUST-02).
- `certs.*` i18n namespace (`halalBadge`/`downloadPdf`/`pdfUnavailable`/`comingSoonHeading`/`comingSoonBody`) added to all 4 catalogs (en real; ar/fr/ru copy the English value as the fallback-ready placeholder, matching the established convention — these are next-intl UI chrome strings, not CMS content).
- Sample data seeded idempotently: 3 certs — (1) halal + PDF, (2) standard + PDF, (3) standard without PDF — exercising every CertCard state. Self-authored placeholder assets under `scripts/seed-assets/` (3 generic labeled-box logo SVGs + 1 minimal generated PDF) with a README flagging them as non-trademark generated placeholders. `certStrip('strip')` seeded on the home layout after the hero; `certStrip('grid', 'Our Certifications')` on the certifications layout before its CTABand.
- Full verification green: `npx tsc --noEmit`, `npm run lint:rtl` / `check-physical-direction.mjs`, `npm run build` (exit 0, all pages x 4 locales prerender), `npx vitest run` (14/14 int, incl. 4 new), `npx playwright test` (82/82 e2e, incl. 14 new across en+ar). Manual `next start` smoke check confirmed the Halal badge, Download PDF link, "Certificate available on request" copy, and homepage strip links all render.

## Task Commits

1. **Task 1: CertCard primitive + certStrip block + getCertifications + i18n keys** — `4ab58c0` (feat)
2. **Task 2: compose Certifications page + homepage CertStrip; seed sample certs** — `ccb6a94` (feat)
3. **Task 3: int + e2e coverage for cert rendering, halal elevation, PDF states** — `0ada687` (test)

_Plan metadata commit follows this summary._

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fresh worktree had no node_modules, `.env`, or seeded DB**
- **Found during:** start of execution.
- **Issue:** Worktree had no `node_modules`, `.env`, or `payload.db` — nothing could build/test/seed.
- **Fix:** Symlinked `node_modules -> D:\PW\node_modules` (reuse main checkout, per executor instructions — no reinstall), created a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + a freshly generated `PAYLOAD_SECRET`), ran `npm run db:seed`. Also copied the gitignored `.planning/` plan docs (02-03-PLAN, 02-UI-SPEC, 02-RESEARCH, 02-CONTEXT, taste-techniques) from the main checkout into the worktree so the plan could be read.
- **Files affected:** none committed (all gitignored, local-environment-only).

**2. [Rule 1 - Bug] `scripts/seed-assets/.gitattributes` added to protect the binary PDF**
- **Found during:** Task 2 staging — Git warned `LF will be replaced by CRLF` for `sample-certificate.pdf` under `core.autocrlf=true`.
- **Issue:** A PDF's internal `xref` byte offsets are byte-exact; autocrlf line-ending conversion would corrupt the committed file so it fails Payload's PDF byte-signature validation on a fresh clone.
- **Fix:** Added a scoped `scripts/seed-assets/.gitattributes` with `*.pdf -text binary`, re-staged, and verified the staged blob is byte-identical to the working file (`git show :... | cmp`).
- **Files affected:** scripts/seed-assets/.gitattributes (created), scripts/seed-assets/sample-certificate.pdf.
- **Committed in:** ccb6a94 (Task 2 commit).

**3. [Rule 3 - Blocking] Regenerated payload-types.ts twice (once per new-schema task)**
- **Found during:** Task 1 tsc (`certStrip` block union member didn't exist yet) and Task 2 (seed data references the new block).
- **Issue:** The `certStrip` block config adds a new member to the `Page['layout']` discriminated union; `tsc` and the seed's typed layout array both need the regenerated types.
- **Fix:** Ran `npx payload generate:types` after adding the block config (Task 1) and again after the seed changes (Task 2) — standard, planned step per the plan's own Task 2 action.
- **Files affected:** payload-types.ts.
- **Committed in:** 4ab58c0 (Task 1), no further type delta by Task 2's regeneration.

**Total deviations:** 3 auto-fixed (2 Rule 3 - environment/schema, 1 Rule 1 - binary-file corruption guard). No architectural changes; no scope creep. No Rule 4 checkpoints. No auth gates.

## Known Stubs

- **Placeholder cert content is intentional and legally-safe.** The 3 seeded certs use generic issuing-body names and self-authored labeled-box logos + a placeholder PDF (no real cert-body trademarks, no fabricated certificate/IEC/registration numbers, no named clients) — this is the deliberate, planned state (02-CONTEXT D-03, threat T-02-07 `accept` disposition, flagged in `scripts/seed-assets/README.md`). Replace with real licensed assets + signed PDFs when the company provides them; the PDF-absent cert stays honestly in the "available on request" state until then.
- **ar/fr/ru `certs.*` strings are English placeholders** pending professional human translation, matching the project's fallback-ready convention for all UI chrome strings (English is the source of truth).

## Threat Flags

None — no new network endpoints, auth paths, or trust-boundary schema changes beyond what 02-02's Certifications collection already established. The plan's `<threat_model>` mitigations were honored: `rel="noopener noreferrer"` on every download anchor (T-02-06), reads only via `overrideAccess` Local API (T-02-05), placeholder-only cert content (T-02-07).

## Self-Check: PASSED

All 11 created files verified present on disk (CertCard.tsx, CertStrip.ts, CertStripBlock.tsx, the 5 seed-assets files, 2 test specs, +.gitattributes). All 3 task commit hashes (`4ab58c0`, `ccb6a94`, `0ada687`) confirmed present in `git log`. No unexpected file deletions in any task commit. STATE.md / ROADMAP.md untouched per instructions.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
