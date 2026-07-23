---
phase: 02-core-marketing-pages-trust-surfaces
plan: 07
subsystem: ui
tags: [payload-blocks, react-hook-form, zod, contact-form, a11y, whatsapp]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 02
    provides: Pages collection, RenderBlocks BLOCK_MAP dispatch, sectionBg alternation, seed-content.ts/seed-pages.ts patterns
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 01
    provides: shadcn Input/Textarea/Label/Form primitives, react-hook-form/zod/@hookform/resolvers already installed
provides:
  - contactBlock Payload block config (intro/address/whatsapp/email/phone)
  - src/lib/contact-schema.ts — shared zod contactSchema (name/company/country/message), reused verbatim by Phase 4's server action
  - ContactForm.tsx — client-side-only inquiry form stub (react-hook-form + zodResolver, shadcn Form a11y wiring), NO network call (D-07)
  - ContactBlockView.tsx — two-column info+form layout, WhatsApp with visible label + aria-label (not icon-only)
  - Seeded /contact page (Hero compact -> contactBlock) with realistic placeholder details
  - tests/e2e/contact.spec.ts (en+ar)
affects: [phase-4-lead-inquiry-submission]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared zod schema module (contact-schema.ts) is the single reuse seam between a Phase 2 client-only form stub and a later Phase 4 server action — no locale-parameterization, no duplication into next-intl catalogs"
    - "aria-label on an anchor overrides its accessible name for role-based queries even though the visible text node remains in the DOM — a11y-visible text and accessible name can differ intentionally (WhatsApp link: aria-label is a fuller sentence than the shorter visible label+number)"

key-files:
  created:
    - src/lib/contact-schema.ts
    - src/blocks/ContactBlock.ts
    - src/components/blocks/ContactForm.tsx
    - src/components/blocks/ContactBlockView.tsx
    - tests/e2e/contact.spec.ts
  modified:
    - src/blocks/index.ts
    - src/collections/Pages.ts
    - src/components/blocks/RenderBlocks.tsx
    - src/lib/seed-content.ts
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - payload-types.ts

key-decisions:
  - "Message-field min length set to 20 characters (UI-SPEC's explicit Copywriting Contract example + error copy), not the plan's own generic 'min 1' gloss — UI-SPEC is the binding visual/copy contract per this plan's own context note"
  - "Validation error copy lives in src/lib/contact-schema.ts (the shared, non-locale-parameterized module Phase 4 imports verbatim), not duplicated into the next-intl 'contact' namespace — avoids two sources of truth for the same string; labels/submit/whatsapp/success copy DO live in next-intl since those vary by rendering context, not by validation logic"
  - "WhatsApp icon: no dedicated Lucide brand glyph exists, so used a single small hand-authored monochrome SVG path (UI-SPEC's explicit allowance), not a new icon-library dependency"

patterns-established:
  - "Pattern: a block's Payload config only carries CMS-authored data (ContactBlock.ts = address/whatsapp/email/phone); the actual interactive form UI is a separate always-present client component (ContactForm.tsx) with no CMS-editable fields of its own — matches the CertCard/DocumentCard precedent of narrow, reusable pieces"

requirements-completed: [PAGE-03]

# Metrics
duration: 62min
completed: 2026-07-15
---

# Phase 2 Plan 07: Contact Page — Info Block + Non-Submitting Inquiry Form Stub Summary

**contactBlock (address/WhatsApp-visible-label/email/phone) + a client-side-only react-hook-form+zod inquiry form stub wired via shadcn Form for aria-invalid/aria-describedby, sharing one contactSchema Phase 4 will reuse verbatim for the real submission — zero network call anywhere in this plan.**

## Performance

- **Duration:** 62 min
- **Started:** 2026-07-15T13:19:44+05:30 (branch base)
- **Completed:** 2026-07-15T14:21:44+05:30
- **Tasks:** 3
- **Files modified:** 14 (5 created, 9 modified)

## Accomplishments

- `src/lib/contact-schema.ts` — one shared zod `contactSchema` (name/company/country required, message min-20-chars per UI-SPEC's Copywriting Contract) that both this plan's client stub and Phase 4's future server action will import verbatim
- `src/blocks/ContactBlock.ts` — Payload block config (intro/address/whatsapp/email/phone), registered in the `blocks/index.ts` barrel, `Pages.ts` layout array, and `RenderBlocks` `BLOCK_MAP`
- `ContactForm.tsx` — react-hook-form + `zodResolver(contactSchema)`, shadcn `Form`/`FormField`/`FormControl`/`FormMessage` wiring `aria-invalid` + `aria-describedby` automatically; `onSubmit` only flips a local success-state boolean — grep confirms no fetch/axios/server-action/route-handler import anywhere in the file
- `ContactBlockView.tsx` — two-column (`grid-cols-1 lg:grid-cols-2`) info+form layout; WhatsApp link carries a VISIBLE text label + number beside a hand-authored monochrome SVG glyph, plus an `aria-label` (UI-SPEC's explicit "not icon-only" requirement); email `mailto:`, phone `tel:`, address text, all visible
- `/contact` page composition extended to Hero(compact) -> contactBlock with realistic placeholder details (Nashik, Maharashtra address; all-zeros WhatsApp placeholder matching the existing homepage CTA precedent; no fabricated registration/IEC numbers)
- `tests/e2e/contact.spec.ts` (en+ar, 10 tests): contact-channel visibility, WhatsApp visible-label + wa.me href + aria-label, empty-submit field errors + `aria-invalid="true"` + zero navigation/network, and dir=rtl no-overflow
- Full verification green: `npx tsc --noEmit`, `npm run lint:rtl` / `node scripts/check-physical-direction.mjs`, `npm run build` (exit 0, `/contact` prerenders across all 4 locales), `npx playwright test` (152/152, full suite incl. every pre-existing spec), `npx vitest run` (19/19 int tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install form deps + shadcn form primitives; shared contactSchema; contactBlock config + registration + i18n keys** - `ac2c122` (feat)
2. **Task 2: ContactForm stub (rhf+zod, a11y, no network) + ContactBlockView two-column + compose & seed contact page** - `9e0d8f0` (feat)
3. **Task 3: e2e test — contact info visible, form validation + no-submit, chrome + RTL** - `3b90dcf` (test)

_Plan metadata commit follows this summary._

## Files Created/Modified

- `src/lib/contact-schema.ts` - shared zod `contactSchema` + inferred `ContactFormValues` type
- `src/blocks/ContactBlock.ts` - Payload block config (intro/address/whatsapp/email/phone), no per-field `localized` (cascades from `Pages.layout`)
- `src/blocks/index.ts` - barrel export for `ContactBlock`
- `src/collections/Pages.ts` - `ContactBlock` appended to the `layout.blocks` array
- `src/components/blocks/ContactForm.tsx` - "use client" rhf+zod stub, shadcn Form a11y wiring, local success state only
- `src/components/blocks/ContactBlockView.tsx` - server component, two-column info+form, hand-authored `WhatsAppIcon` SVG
- `src/components/blocks/RenderBlocks.tsx` - `contactBlock: ContactBlockView` added to `BLOCK_MAP`
- `src/lib/seed-content.ts` - `contactBlock()` helper + appended to the seeded `contact` page's layout
- `src/i18n/messages/{en,ar,fr,ru}.json` - `contact` namespace (labels, submit, whatsapp visible-label/aria, success message); ar/fr/ru copy en verbatim as placeholder, matching the existing `certs`/`blocks` namespace precedent
- `payload-types.ts` - regenerated (`contactBlock` now in `Page['layout']` union)
- `tests/e2e/contact.spec.ts` - en+ar, 10 tests (info visibility, WhatsApp label/href/aria, validation+no-submit, RTL overflow)

## Decisions Made

- Message field validation set to a 20-character minimum (matching UI-SPEC's Copywriting Contract error text "Please tell us a bit more (at least 20 characters)."), not the plan's own shorthand "min 1, max ~2000" — UI-SPEC is this plan's binding visual/copy contract per its own context note, and the plan's Task 2 `read_first` explicitly points to the Copywriting Contract for this exact field.
- Validation error strings live in `contact-schema.ts` itself (the one module both this stub and Phase 4's server action import verbatim), not duplicated into the next-intl `contact` namespace — avoids a second source of truth for the same copy. Field labels, the submit button, WhatsApp visible-label/aria, and the success message DO live in next-intl since they're presentation strings, not shared validation logic.
- WhatsApp glyph: no dedicated Lucide brand icon exists, so a single small hand-authored monochrome SVG path is used inline in `ContactBlockView.tsx` (UI-SPEC's explicit allowance for exactly this situation) — no new icon-library dependency.
- WhatsApp link carries BOTH a visible text label ("Message us on WhatsApp (910000000000)") and an `aria-label` ("Message Star Agrevolution on WhatsApp") that is a fuller, more natural sentence — per ARIA's accessible-name computation, the `aria-label` becomes the link's accessible name (used by screen readers and `getByRole` queries), while the visible text remains in the DOM for sighted users. Both satisfy UI-SPEC's "not icon-only" requirement; they intentionally differ in exact wording.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fresh worktree had no `node_modules`, `.env`, or seeded SQLite DB**
- **Found during:** start of execution, before any verification could run
- **Issue:** This worktree had no `node_modules` (only the main repo checkout at `D:\PW\node_modules` was fully installed) and no `.env`/`payload.db` — same category of gap as every prior Phase 2 plan's worktree.
- **Fix:** Created a directory symlink `node_modules -> D:\PW\node_modules` and a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + a freshly generated `PAYLOAD_SECRET`). Ran `npx payload generate:types` then `npm run db:seed` before verification.
- **Files affected:** none committed (symlink/`.env`/`payload.db` are gitignored, local-environment-only, matching 02-01/02-02 precedent).
- **Verification:** `npm run build` exits 0, all pages x 4 locales prerender.

**2. [Rule 1 - Bug] e2e WhatsApp-link assertion initially matched the wrong accessible name**
- **Found during:** Task 3's own `npx playwright test tests/e2e/contact.spec.ts` verification run
- **Issue:** The first test draft queried `getByRole("link", { name: /message us on whatsapp/i })` (the VISIBLE label text), but the same anchor also carries `aria-label="Message Star Agrevolution on WhatsApp"` — per ARIA accessible-name computation, `aria-label` overrides visible text content for role-based name matching, so the query found no match and 4 sub-assertions failed across en/ar.
- **Fix:** Split the assertion: query by role name against the actual accessible name (the aria-label text), and separately assert the visible label text is present via `getByText` scoped to the same link. This is the correct a11y-accurate test, not a workaround — the component code was already correct per UI-SPEC (both a fuller aria-label AND a shorter visible label are required, and they may differ in wording).
- **Files affected:** tests/e2e/contact.spec.ts
- **Verification:** re-ran `npx playwright test tests/e2e/contact.spec.ts` — 10/10 pass (en+ar); full suite re-run afterward, 152/152 pass.
- **Committed in:** 3b90dcf (Task 3 commit)

**3. [Rule 3 - Blocking] Local dev/test port 3000 was occupied by an unrelated, unresponsive process**
- **Found during:** Task 3 verification, first `npx playwright test` attempt
- **Issue:** `localhost:3000` was already bound by a pre-existing `next start-server.js` process (unrelated to this worktree — a separate, already-running server, confirmed not spawned by this session and unresponsive to any HTTP request during multiple retries). Playwright's `webServer.reuseExistingServer` logic saw the port already answering (at the TCP level) and skipped starting its own dev server, silently pointing tests at the wrong/stalled server. Two earlier duplicate manual seed-script invocations of my own (redundant re-runs while diagnosing this) also lingered as zombie processes after their work completed (a known `payload.destroy()` cleanup quirk that doesn't always exit the event loop) and were terminated by PID once identified as mine via an explicit worktree-path match in `Get-CimInstance Win32_Process`.
- **Fix:** Killed only the processes I could unambiguously confirm were mine (matched my own worktree path or were direct children of my own invocations) by specific PID — never a system-wide or blanket kill, and never touching the unrelated port-3000 process or any process belonging to a different worktree. Started my own dev server on a dedicated port (3100) instead, verified it served the actual updated `/contact` content via `curl` before running Playwright against it with `BASE_URL=http://localhost:3100`.
- **Files affected:** none (process/runtime hygiene only, no source changes).
- **Verification:** `npx playwright test tests/e2e/contact.spec.ts` (10/10) then the full suite (152/152) both green against the dedicated port; dev server process cleaned up (by specific PID) once verification completed.

---

**Total deviations:** 3 auto-fixed (2 Rule 3 - blocking/environment, 1 Rule 1 - bug in the test's own assertion, not the component). No architectural changes; no scope creep beyond what a fresh worktree + local verification required.

## Known Stubs

None that block this plan's own goal. The form is intentionally a non-submitting stub per D-07 — this is the plan's explicit, documented scope boundary, not an unintentional gap. `onSubmit` sets local success state only; the code carries an explicit comment marking the honeypot/spam-defense insertion point for Phase 4/LEAD-03.

## Issues Encountered

- Two of my own manual `seed-pages.ts` re-invocations (run while confirming the first `npm run db:seed` had actually finished) never exited on their own after completing their work — a known Payload/libsql cleanup quirk where `payload.destroy()` doesn't always release all handles/timers. Identified precisely by PID via `Get-CimInstance Win32_Process` matching my own worktree path (never a blanket `taskkill /IM node.exe`), then terminated. No data corruption resulted; the DB was verified correct (`contact` page's `contactBlock` row) via a direct `@libsql/client` query before and after.

## User Setup Required

None - no external service configuration required. The real WhatsApp business number, registered address, business email, and phone (currently realistic placeholders in seed content) should be provided by the content/business team before this content ships to production - same category of pending-real-value note as the existing homepage WhatsApp CTA placeholder (02-02).

## Next Phase Readiness

- `src/lib/contact-schema.ts`'s `contactSchema` is the exact seam Phase 4 (LEAD) needs: import it verbatim into the real server action, replace `ContactForm.tsx`'s `onSubmit` body with a call to that action, and add the honeypot field at the marked insertion point — no other change to the form's structure, fields, or a11y wiring required.
- The `contactBlock` Payload block, `RenderBlocks` wiring, and seeded `/contact` page are fully live; Phase 4 does not need any CMS schema work to land the real submission flow.
- Full regression baseline confirmed clean: `npx tsc --noEmit`, `npm run lint:rtl`, `npm run build`, `npx playwright test` (152/152), `npx vitest run` (19/19) — no pre-existing test was broken by this plan's changes.

## Self-Check: PASSED

Verified all 5 created files exist on disk (`src/lib/contact-schema.ts`, `src/blocks/ContactBlock.ts`, `src/components/blocks/ContactForm.tsx`, `src/components/blocks/ContactBlockView.tsx`, `tests/e2e/contact.spec.ts`) and all 3 task commit hashes (`ac2c122`, `9e0d8f0`, `3b90dcf`) confirmed present in `git log --oneline -5`.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
