---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
plan: 04
subsystem: ui
tags: [nextjs, react-hook-form, zod, shadcn, radix-select, next-intl, playwright, vitest]

# Dependency graph
requires:
  - phase: 04-03
    provides: submitContactForm Server Action (LEAD-01/03/04), rfq_submit/inquiry_submit trackEvent branch already stubbed on values.product
provides:
  - RFQ-mode conditional fields in ContactForm.tsx (product banner, Quantity, Destination Country, Incoterm Select) driven by `?product=`/`productName=`
  - shadcn select component (src/components/ui/select.tsx)
  - RFQ catalog keys (quoteDetails, quantityLabel, quantityHelper, destinationCountryLabel, incotermLabel, incotermNotSure, productBanner, submitRfq, successRfq) in en/ar/fr/ru
  - e2e coverage of RFQ render states + unit coverage of the RFQ email payload
affects: [04-05, future-crm-integration]

# Tech tracking
tech-stack:
  added: ["radix-ui Select primitive (shadcn official registry add, no new package.json dependency — radix-ui was already installed)"]
  patterns:
    - "RFQ mode derived client-side from useSearchParams().get('product'); ContactForm now wrapped in <Suspense> at its ContactBlockView call site (Next.js requirement for useSearchParams on a statically-generated page)"
    - "Read-only banner + parallel hidden <input> registered via RHF's register() so a presentation-only value still submits (D-03)"
    - "<bdi>-wrapped trade-code rendering for RTL-safe Latin abbreviations inside a localized Select"

key-files:
  created:
    - src/components/ui/select.tsx
    - tests/e2e/contact-rfq-mode.spec.ts
  modified:
    - src/components/blocks/ContactForm.tsx
    - src/components/blocks/ContactBlockView.tsx
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - tests/unit/contact-action.spec.ts

key-decisions:
  - "Wrapped <ContactForm /> in <Suspense fallback={null}> inside ContactBlockView.tsx — not in the plan's task text, but required by Next.js 16 for any client subtree calling useSearchParams on a page using generateStaticParams (build/dev would otherwise throw). Rule 3 (blocking) fix."
  - "RFQ catalog keys added with identical English copy across en/ar/fr/ru, matching the established (pre-existing) precedent for the whole `contact` namespace in this codebase — none of the contact-form strings are translated yet in any locale file, consistent with the project's 'translation work deferred' stance."
  - "Incoterm Select trigger explicitly renders <bdi>{code}</bdi> (name) via a controlled SelectValue children override, rather than relying on Radix's default text-mirroring, so the RTL-safety requirement holds for both the dropdown list AND the selected-value display."
  - "productName is also submitted via a second hidden registered input (register('productName')) alongside product — not explicitly named in the plan's action text but required for the sales-inbox email subject/heading to show the real product name instead of always falling back to the raw slug."

requirements-completed: [LEAD-02, LEAD-07]

coverage:
  - id: D1
    description: "RFQ fields (product banner, Quantity, Destination Country, Incoterm Select) render only when ?product= is present; product identity is read-only and submits via a hidden input"
    requirement: "LEAD-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact-rfq-mode.spec.ts#RFQ mode with productName: banner, Quote Details group, and RFQ submit label all render"
        status: pass
      - kind: e2e
        ref: "tests/e2e/contact-rfq-mode.spec.ts#no product param: plain inquiry mode, no RFQ group, default submit label"
        status: pass
    human_judgment: false
  - id: D2
    description: "Missing/empty productName falls back to the raw product slug in the banner (backstop truth)"
    requirement: "LEAD-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact-rfq-mode.spec.ts#RFQ mode with NO productName: banner falls back to the raw slug (backstop)"
        status: pass
    human_judgment: false
  - id: D3
    description: "RFQ payload (product/quantity/destinationCountry/incoterm) reaches the sent email (subject + rendered LeadNotification props), not just the Resend envelope"
    requirement: "LEAD-02"
    verification:
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#RFQ payload: includes RFQ fields in the sent email and uses the fixed sales inbox"
        status: pass
    human_judgment: false
  - id: D4
    description: "trackEvent fires rfq_submit (not inquiry_submit) on a successful RFQ-mode submission, carrying only the product slug (T-04-06, no PII)"
    requirement: "LEAD-07"
    verification: []
    human_judgment: true
    rationale: "trackEvent's rfq_submit branch itself is unchanged from 04-03 (already covered there); this plan's only change is that values.product is now actually populated. No new automated test asserts the analytics call fires with the RFQ path specifically — worth a human/UAT spot-check of the browser network/dataLayer during a real RFQ submission."
  - id: D5
    description: "Incoterm Select renders the 11 Incoterms 2020 codes plus a real selectable 'Not sure yet' option, with the rendered code wrapped in <bdi> so it doesn't reverse under RTL"
    requirement: "LEAD-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact.spec.ts#/ar/contact: two-column info+form block renders under dir=rtl without horizontal overflow"
        status: pass
    human_judgment: true
    rationale: "The RTL overflow regression test passed with the new fields present, but no automated test asserts the <bdi> boundary specifically prevents code-reversal for an RTL reader — a visual RTL check of the Incoterm Select (open dropdown + selected value) under /ar/contact is worth a human UAT pass."

# Metrics
duration: ~2h15m (includes multiple sandbox dev-server cold starts/slow-filesystem compiles; hands-on implementation + verification time was well under an hour)
completed: 2026-07-21
status: complete
---

# Phase 04 Plan 04: RFQ Conditional Fields Summary

**Per-product RFQ path wired end-to-end: `/contact?product=slug&productName=Name` now renders a read-only product banner, Quantity/Destination Country/Incoterm fields, and submits as a distinct `rfq_submit` conversion with the qualifying fields reaching the sales-inbox email.**

## Performance

- **Duration:** ~2h15m elapsed (sandbox dev-server startup and Playwright compiles dominated wall-clock time; see Issues Encountered)
- **Tasks:** 2/2 completed
- **Files modified:** 9 (2 created, 7 modified)

## Accomplishments
- `ContactForm.tsx` now derives RFQ mode from `useSearchParams().get("product")`, rendering a read-only product-context banner (with raw-slug fallback), a "Quote Details" subheading, and a Quantity/Destination Country/Incoterm 3-field group — all gated on RFQ mode, per D-02/D-03/D-04.
- New shadcn `select.tsx` powers the Incoterm field: 11 Incoterms 2020 codes formatted `CODE (Full Name)` plus a real selectable "Not sure yet" option, codes wrapped in `<bdi>` for RTL safety in both the dropdown and the selected-value display.
- Product identity (`product` + `productName`) submits via hidden RHF-registered inputs, never as an editable/re-pickable control.
- Submit label and success copy swap to the RFQ variant (`Send Quote Request` / `successRfq`) in RFQ mode.
- `rfq_submit` now fires for real (the 04-03 branch was already wired but `values.product` was previously always empty — this plan is what populates it).
- e2e coverage of all three render states (full RFQ, missing-productName backstop, plain inquiry) and an extended unit assertion proving the RFQ fields reach the rendered email, not just the Resend envelope.

## Task Commits

1. **Task 1: Add shadcn select + RFQ-mode conditional fields** - `9e95ccc` (feat)
2. **Task 2: e2e RFQ mode (incl. missing-productName backstop) + RFQ-payload unit assertion** - `0200074` (test)

**Plan metadata:** committed alongside this SUMMARY (docs commit, see below).

## Files Created/Modified
- `src/components/ui/select.tsx` - shadcn official-registry Select primitive (Incoterm field)
- `src/components/blocks/ContactForm.tsx` - RFQ-mode conditional rendering, product banner + hidden inputs, Incoterm Select, RFQ submit/success copy swap
- `src/components/blocks/ContactBlockView.tsx` - wraps `<ContactForm />` in `<Suspense>` (required once ContactForm calls `useSearchParams`)
- `src/i18n/messages/{en,ar,fr,ru}.json` - RFQ catalog keys (`quoteDetails`, `quantityLabel`, `quantityHelper`, `destinationCountryLabel`, `incotermLabel`, `incotermNotSure`, `productBanner`, `submitRfq`, `successRfq`)
- `tests/e2e/contact-rfq-mode.spec.ts` - RFQ render states (full RFQ, missing-productName backstop, plain inquiry)
- `tests/unit/contact-action.spec.ts` - extends the existing RFQ-payload test with subject-line + rendered-email-props assertions (mocked `LeadNotification`)

## Decisions Made
- Added a `<Suspense>` boundary around `ContactForm` in `ContactBlockView.tsx` — not explicit in the plan's task text, but `useSearchParams()` on a statically-generated page (`generateStaticParams` + `revalidate = 60`) requires one; without it, `next build`/dev throws. Classified as Rule 3 (blocking issue, auto-fixed).
- RFQ catalog keys use identical English copy in all four locale files, matching the pre-existing (untranslated) convention already established for the entire `contact` namespace in this codebase — consistent with the project's "translation work deferred" stance (see MEMORY.md priority note).
- `productName` is submitted via its own hidden registered input (alongside `product`) so the sales-inbox email subject/heading shows the real product name rather than always falling back to the raw slug — the plan's action text only explicitly named the `product` hidden input, but `productName` was already a schema field this plan needed to actually populate for the banner/email to be coherent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added a `<Suspense>` boundary around `ContactForm`**
- **Found during:** Task 1 (wiring `useSearchParams` into `ContactForm.tsx`)
- **Issue:** `ContactForm` is rendered from `ContactBlockView` (an async server component) inside `/contact`, which uses `generateStaticParams` + `revalidate = 60`. Next.js 16 requires any client subtree calling `useSearchParams()` to sit under a `<Suspense>` boundary on a statically-generated route, or the page fails to build/serve correctly.
- **Fix:** Wrapped `<ContactForm />` with `<Suspense fallback={null}>` in `ContactBlockView.tsx`.
- **Files modified:** `src/components/blocks/ContactBlockView.tsx`
- **Verification:** `npx tsc --noEmit` clean; full e2e regression run (`contact.spec.ts`, `contact-error-state.spec.ts`, `contact-rfq-mode.spec.ts`, `whatsapp-header-cta.spec.ts` — 13/13 passed) confirms the page renders and hydrates correctly in both LTR and RTL.
- **Committed in:** `9e95ccc` (Task 1 commit)

**2. [Rule 1 - Bug/Missing local dev config] Recreated `.env` and seeded the local Payload SQLite DB**
- **Found during:** Task 2 verification (Playwright e2e run)
- **Issue:** This worktree had no `.env` (the sandbox note said one existed "in the main checkout" but it was absent here), so `next dev` failed with "missing secret key. A secret key is needed to secure Payload." Once created, `/contact` still 404'd because the freshly auto-created `payload.db` had no seeded CMS pages.
- **Fix:** Recreated `.env` with the same two lines documented in the sandbox note (`DATABASE_URI=file:./payload.db`, placeholder `PAYLOAD_SECRET`), then ran the existing `npm run db:seed` (`scripts/seed-pages.ts`) to populate the `contact` page and other seed content. Both are local dev-only artifacts — `.env` is gitignored (`.gitignore:34 .env*`) and `payload.db` is gitignored (`.gitignore:54 /payload.db`); neither was staged or committed.
- **Files modified:** none tracked (local-only `.env` + `payload.db`, both gitignored)
- **Verification:** `/contact`, `/contact?product=...` all return 200 and render correctly; full e2e suite (13/13) passes against the seeded DB.
- **Committed in:** N/A (gitignored local files, not part of any commit)

---

**Total deviations:** 2 auto-fixed (1 blocking/Suspense, 1 blocking/local-env-and-seed-data)
**Impact on plan:** Both fixes were necessary to make the plan's own verification commands actually runnable in this sandbox; neither changes the shipped feature's behavior or scope.

## Issues Encountered
- The sandbox's `next dev` cold start + Turbopack compile was slow (multiple minutes per run, plus a "Slow filesystem detected" warning for the worktree's `.next/dev` directory) — most of this plan's wall-clock time was waiting on dev-server startup/compile across three Playwright runs (initial RFQ e2e, re-run after DB seed, and a regression pass over `contact.spec.ts`/`contact-error-state.spec.ts`/`whatsapp-header-cta.spec.ts`), not on implementation itself. All runs eventually succeeded; no code-level issue.
- `.env.example` was not touched — this plan's tasks never called for it, so the sandbox's documented permission block on that file was never encountered.

## User Setup Required
None - no external service configuration required. (Resend/Turnstile/CRM env vars remain as configured by 04-02/04-03; this plan added no new env vars.)

## Next Phase Readiness
- LEAD-02 (per-product RFQ) and the RFQ half of LEAD-07 (`rfq_submit` event) are both functionally complete and verified.
- `whatsapp_click`/analytics-vendor wiring (ANALY-01) and any remaining LEAD-07 (`inquiry_submit`/`whatsapp_click`) coverage are out of this plan's scope — see 04-05.
- D4/D5 in the coverage block above are flagged `human_judgment: true` for a UAT spot-check (real RFQ submit → confirm `rfq_submit` fires with only the product slug; visual RTL check of the Incoterm Select) — not blockers, but worth a quick manual pass before phase close.

---
*Phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics*
*Completed: 2026-07-21*

## Self-Check: PASSED

- FOUND: src/components/ui/select.tsx
- FOUND: tests/e2e/contact-rfq-mode.spec.ts
- FOUND: .planning/phases/04-lead-conversion-rfq-inquiry-whatsapp-analytics/04-04-SUMMARY.md
- FOUND commit: 9e95ccc (Task 1)
- FOUND commit: 0200074 (Task 2)
- FOUND commit: 42df0e6 (SUMMARY)
