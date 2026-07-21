---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
plan: 03
subsystem: ui
tags: [react-hook-form, zod, cloudflare-turnstile, next-intl, playwright, server-actions]

requires:
  - phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
    provides: "submitContactForm Server Action, contactSchema (email/phone/honeypot/turnstileToken), rate limiter, CRM webhook stub (04-02)"
provides:
  - "ContactForm wired to submitContactForm for the general inquiry happy path"
  - "Full idle/loading/success/error/rate-limited UI state machine"
  - "Client honeypot field + Cloudflare Turnstile widget (LEAD-03 client half)"
  - "inquiry_submit analytics event fired on success (non-PII payload)"
  - "e2e coverage for error banner, real rate-limit trip, and Turnstile script-load backstop"
affects: [04-04-rfq-mode-fields]

tech-stack:
  added: ["@marsidev/react-turnstile (already in package.json from 04-02, installed into this worktree's node_modules)"]
  patterns:
    - "Shared mockTurnstileSuccess Playwright helper (tests/e2e/turnstile-mock.ts) for any spec whose submit is gated on turnstileToken"
    - "try/catch around a Server Action call so a dropped network connection (not just a typed error result) still resolves to a UI state"

key-files:
  created:
    - tests/e2e/contact-error-state.spec.ts
    - tests/e2e/turnstile-mock.ts
  modified:
    - src/components/blocks/ContactForm.tsx
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - tests/e2e/contact.spec.ts

key-decisions:
  - "Honeypot field uses Tailwind's sr-only utility instead of the plan's literal `-left-[9999px]` physical offset — the offset overflowed the document under dir=rtl, breaking an existing RTL e2e assertion; sr-only achieves the same 'present in DOM, invisible, unreachable by tab, not display:none' contract without the physical-direction violation"
  - "ar/fr/ru catalogs mirror the English contact.* copy verbatim (matching this codebase's existing convention for all other contact.* strings) rather than shipping ad hoc translations, per the project's English-first priority (translation work is explicitly deferred, not this executor's call to make)"
  - "Added a try/catch around `await submitContactForm(values)` — not explicitly in the plan's action text, but a Server Action call is itself a network request that can throw (dropped connection) rather than resolve to the typed SubmitResult error variant; without it a network failure would leave the form stuck in 'loading' via an unhandled rejection"
  - "Rate-limit e2e test drives the real in-memory limiter with bounded-retry real submissions (Turnstile script faked, but the actual Server Action call goes through) rather than attempting to hand-craft a fake Next.js Server Action RSC response body for a fabricated 'rate-limited' result — the wire format is undocumented/version-fragile, whereas the real limiter check runs before Turnstile's network round trip, so tripping it is fast and deterministic"
  - "Skipped the `useSearchParams` import listed in the plan's task text — the RFQ-mode `product` field doesn't exist on the form until 04-04 adds it, so nothing would consume it yet; would have been dead code / an eslint unused-import failure"

requirements-completed: [LEAD-01, LEAD-03, LEAD-04, LEAD-07]

coverage:
  - id: D1
    description: "General inquiry form submits through the real Server Action with honeypot + Turnstile widget active, full loading/success/error/rate-limit UI, and inquiry_submit fired on success with only the product slug (no PII)"
    requirement: "LEAD-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact-error-state.spec.ts#network/server failure shows destructive banner, retains input, re-enables submit"
        status: pass
      - kind: e2e
        ref: "tests/e2e/contact-error-state.spec.ts#legitimate user tripping the rate limit sees the distinct copy, not the generic banner"
        status: pass
      - kind: unit
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: false
  - id: D2
    description: "Honeypot field always renders, is aria-hidden/tabIndex=-1/unreachable to real users, and a filled honeypot silently succeeds server-side without sending email (server behavior verified in 04-02; this plan's slice is the client field + wiring)"
    requirement: "LEAD-03"
    verification:
      - kind: unit
        ref: "npx eslint src/components/blocks/ContactForm.tsx"
        status: pass
    human_judgment: true
    rationale: "The honeypot's silent-fake-success server branch was verified in 04-02's unit tests; this plan only adds the client field. No e2e test in this plan directly submits a filled honeypot end-to-end — flagged for human/future verification rather than assumed."
  - id: D3
    description: "Turnstile widget failing to load keeps submit disabled and shows the WhatsApp/email fallback error banner instead of a silently-dead button (backstop truth)"
    requirement: "LEAD-03"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact-error-state.spec.ts#Turnstile script failing to load keeps submit disabled and explains the failure"
        status: pass
    human_judgment: false
  - id: D4
    description: "Server/network failure renders the destructive error banner, retains typed field values, and re-enables submit for retry"
    requirement: "LEAD-04"
    verification:
      - kind: e2e
        ref: "tests/e2e/contact-error-state.spec.ts#network/server failure shows destructive banner, retains input, re-enables submit"
        status: pass
    human_judgment: false
  - id: D5
    description: "inquiry_submit fires only after a success result, passing only the product slug (never name/email/phone/company/message) — T-04-06 mitigation"
    requirement: "LEAD-07"
    verification:
      - kind: unit
        ref: "npx eslint src/components/blocks/ContactForm.tsx (manual code read: trackEvent call site passes { product } only)"
        status: pass
    human_judgment: true
    rationale: "No dedicated unit/e2e test asserts the exact trackEvent payload shape in this plan (no analytics vendor mounted yet, per D-06/ANALY-01 deferral) — verified by code inspection only, flagged for human confirmation."

duration: 20min
completed: 2026-07-21
status: complete
---

# Phase 4 Plan 3: Contact Form Inquiry Wiring Summary

**ContactForm.tsx wired to the real submitContactForm Server Action with a full idle/loading/success/error/rate-limited state machine, honeypot + Cloudflare Turnstile spam defense, and inquiry_submit analytics firing on success.**

## Performance

- **Duration:** ~20 min of active execution (session included several interrupted/resumed turns; net work across two task commits)
- **Started:** 2026-07-21T07:20:00Z (approx, first task commit 07:26:55Z)
- **Completed:** 2026-07-21T09:37:00Z
- **Tasks:** 2/2
- **Files modified:** 9 (2 created, 7 modified — including message catalogs)

## Accomplishments
- `ContactForm.tsx` now submits real inquiries through `submitContactForm` (04-02), replacing the Phase 2 client-only stub
- Email/phone fields (D-01), always-rendered honeypot, and the Cloudflare Turnstile widget are live; submit stays disabled until a token is present
- Full loading (spinner + readOnly fields) / success (existing panel) / error (destructive banner, retains input) / rate-limited (distinct copy) cycle implemented per UI-SPEC
- `inquiry_submit` fires on success with a non-PII payload (product slug only); the `rfq_submit` branch is wired for 04-04 to populate
- New e2e coverage: network-failure banner + input retention, a real rate-limit trip with the distinct "submitting too quickly" copy, and the Turnstile-script-load-failure backstop

## Task Commits

1. **Task 1: Wire ContactForm inquiry path — fields, spam UI, state machine, inquiry_submit** - `987f19d` (feat)
2. **Task 2: e2e — error/rate-limit/Turnstile-fail states + repair stale stub assertions** - `feb317c` (test)

_Note: Task 2's commit also includes a small ContactForm.tsx fix (try/catch + honeypot sr-only) discovered while writing/running its own tests — documented below under Deviations._

## Files Created/Modified
- `src/components/blocks/ContactForm.tsx` - Full rewrite of the submit path: email/phone fields, honeypot, Turnstile widget, status state machine, inquiry_submit
- `src/i18n/messages/en.json` - New keys: emailLabel, phoneLabel, loadingSubmit, errorBanner, rateLimitBanner; updated successMessage
- `src/i18n/messages/ar.json`, `fr.json`, `ru.json` - Same keys mirrored in English (see Deviations)
- `tests/e2e/contact-error-state.spec.ts` - New: error banner, rate-limit, Turnstile backstop e2e coverage
- `tests/e2e/turnstile-mock.ts` - New: shared `mockTurnstileSuccess` Playwright helper
- `tests/e2e/contact.spec.ts` - Empty-submit test now primes a fake Turnstile token; comments updated from D-07 stub wording to the wired reality

## Decisions Made
See `key-decisions` in frontmatter — honeypot `sr-only` fix, English-mirrored locale copy, defensive try/catch around the Server Action call, real-limiter-driven rate-limit test, and the skipped (unused) `useSearchParams` import.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Honeypot's literal off-canvas class overflowed the document under RTL**
- **Found during:** Task 2, running `tests/e2e/contact.spec.ts`'s existing RTL overflow assertion
- **Issue:** The plan's literal `className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"` is a physical-direction offset. Under `dir="rtl"` it pushed the element far outside the document's scrollable area, causing `document.documentElement.scrollWidth > clientWidth`, which broke the pre-existing `/ar/contact: two-column info+form block renders under dir=rtl without horizontal overflow` test.
- **Fix:** Swapped to Tailwind's built-in `sr-only` utility (already used elsewhere in this codebase, e.g. `sheet.tsx`) — same "present in DOM, invisible, unreachable by tab, not display:none/visibility:hidden" contract via `clip`/1px-box, no physical offset, no overflow.
- **Files modified:** `src/components/blocks/ContactForm.tsx`
- **Verification:** `npx playwright test tests/e2e/contact.spec.ts` — RTL overflow assertion passes.
- **Committed in:** `feb317c` (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added try/catch around the Server Action call**
- **Found during:** Task 2, writing the network-failure e2e test
- **Issue:** `await submitContactForm(values)` is itself a network request under the hood (Next.js Server Action wire call). A dropped connection throws rather than resolving to the typed `{status:"error",...}` result, which would leave the form stuck in the "loading" state via an unhandled promise rejection — a real (not just test-only) resilience gap.
- **Fix:** Wrapped the call in try/catch; a caught exception now maps to the same generic `status="error"` banner as a typed network-error result.
- **Files modified:** `src/components/blocks/ContactForm.tsx`
- **Verification:** `tests/e2e/contact-error-state.spec.ts#network/server failure...` passes by aborting the POST at the network layer.
- **Committed in:** `feb317c` (Task 2 commit)

**3. [Rule 3 - Blocking] Seeded the local SQLite DB before e2e could run**
- **Found during:** Task 2 verification
- **Issue:** This worktree's `payload.db` was freshly created (empty schema, no seeded pages) — `/contact` 404'd, causing every e2e navigation to time out.
- **Fix:** Ran `npm run db:seed` (with inline `DATABASE_URI`/`PAYLOAD_SECRET` env vars — see next item) before running Playwright.
- **Files modified:** None (runtime DB state only; `payload.db` is gitignored)
- **Verification:** `/contact` returns 200 after seeding; full e2e suite passes.

### Not Auto-fixed — Flagged for Follow-up

**4. `.env.example` could not be updated (environment permission restriction)**
- **Issue:** The plan requires documenting `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client, user_setup) plus the 04-02 server env vars (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `SALES_INBOX_ADDRESS`, `CRM_WEBHOOK_URL`) in `.env.example`. This session's harness permission settings deny all Read/Write/Edit/Bash access to any `.env*` path (confirmed via repeated tool denials, not a project-level restriction) — a legitimate safety guard I did not attempt to circumvent.
- **Impact:** `.env.example` is unchanged from before this plan (only has `DATABASE_URI`/`PAYLOAD_SECRET`/prod placeholders from 01-02). The actual `.env`/`.env.local` used for local dev (outside this harness's view) still needs these vars added manually.
- **Follow-up needed:** A human (or an agent running outside this permission scope) should add to `.env.example`:
  ```
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=<changeme>
  TURNSTILE_SECRET_KEY=<changeme>
  RESEND_API_KEY=<changeme>
  RESEND_FROM_ADDRESS=<changeme>
  SALES_INBOX_ADDRESS=<changeme>
  CRM_WEBHOOK_URL=
  ```
- **Also needed for e2e/dev to run in a fresh worktree:** `npm run db:seed` before starting the dev server (SQLite is fresh/empty per worktree).

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing-critical, 1 blocking) + 1 flagged follow-up (environment permission restriction, not code).
**Impact on plan:** All auto-fixes were necessary for correctness (RTL layout, resilience) or to run verification at all. No scope creep. The `.env.example` gap is a real pending item, not silently dropped.

## Issues Encountered
- Two overlapping `page.route()` handlers (Turnstile-script mock + Server-Action-POST abort) initially caused the mocked Turnstile script to never resolve, because the later-registered catch-all used `route.continue()` instead of `route.fallback()` — `continue()` sends straight to the real network rather than deferring to the earlier-registered handler. Fixed by using `route.fallback()`.
- Local dev server startup was flaky/slow across several attempts in this sandboxed environment (stray background processes from earlier tool calls competing for 2 CPUs / low free memory); resolved by explicitly killing stray `next-server` processes before each clean run.

## User Setup Required
None beyond what 04-02 already flagged (live Resend/Turnstile/CRM credentials). See Deviation #4 above for the `.env.example` documentation gap specifically introduced by this plan's scope.

## Next Phase Readiness
- 04-04 (RFQ-mode fields) can add the hidden `product` field + Quote Details field group directly into the existing form/schema; the `trackEvent(values.product ? "rfq_submit" : ...)` branch is already wired and will start firing correctly once `product` is populated.
- `mockTurnstileSuccess` (tests/e2e/turnstile-mock.ts) is reusable for any 04-04 e2e tests that also need a submittable token.
- Blocker for a live deploy (not this plan's scope): `.env.example`/real `.env` still need Turnstile/Resend/CRM values — flagged, not blocking further Phase 4 development.

---
*Phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics*
*Completed: 2026-07-21*

## Self-Check: PASSED

- FOUND: src/components/blocks/ContactForm.tsx
- FOUND: tests/e2e/contact-error-state.spec.ts
- FOUND: tests/e2e/turnstile-mock.ts
- FOUND: .planning/phases/04-lead-conversion-rfq-inquiry-whatsapp-analytics/04-03-SUMMARY.md
- FOUND commit: 987f19d (Task 1)
- FOUND commit: feb317c (Task 2)
- FOUND commit: 4fe04fe (SUMMARY.md)
