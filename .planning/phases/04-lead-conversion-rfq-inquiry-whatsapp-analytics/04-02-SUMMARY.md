---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
plan: 02
subsystem: api
tags: [resend, react-email, cloudflare-turnstile, zod, server-actions, nextjs, spam-defense]

requires:
  - phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
    provides: "Plan 04-01's provider-agnostic trackEvent() wrapper and WhatsApp CTA (independent, no dependency here beyond shared phase scope)"
provides:
  - "submitContactForm Server Action composing honeypot -> rate-limit -> Turnstile siteverify -> resend.emails.send -> fire-and-forget notifyCrm"
  - "Extended contactSchema (email/phone, RFQ fields, honeypot, turnstileToken) as the single client+server validation source"
  - "In-memory rate limiter (checkRateLimit) and CRM webhook stub (notifyCrm)"
  - "LeadNotification.tsx react-email template for the sales-inbox notification"
affects: [04-03-contact-form-client-wiring, 04-04, 04-05]

tech-stack:
  added: [resend@6.17.2, react-email@6.9.0, "@marsidev/react-turnstile@1.5.3"]
  patterns:
    - "Server Action composes spam-defense layers cheapest-reject-first: honeypot (raw payload, pre-parse) -> rate-limit -> Turnstile siteverify -> send"
    - "from/to email addresses are fixed server-side env constants, never derived from user input"
    - "Module-scope third-party client (Resend) constructed with a placeholder fallback key so a missing credential never crashes the module at import; the real gate is an explicit env check before the network call"

key-files:
  created:
    - src/lib/contact-action.ts
    - src/lib/rate-limit.ts
    - src/lib/crm-webhook.ts
    - src/emails/LeadNotification.tsx
    - tests/unit/contact-action.spec.ts
    - tests/unit/rate-limit.spec.ts
    - tests/unit/crm-webhook.spec.ts
  modified:
    - src/lib/contact-schema.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Honeypot checked on the RAW payload before contactSchema.safeParse, not after — schema's max(0) constraint on companyWebsite would otherwise fail generic Zod validation for a bot-filled decoy instead of the required silent fake-success"
  - "submitContactForm gracefully returns {status:'error',message:'network'} when RESEND_API_KEY is unset rather than throwing at module import or call time"

patterns-established:
  - "Pattern: server-only secret env vars gated with an explicit check + typed error return, never NEXT_PUBLIC_ prefixed, never throw uncaught"
  - "Pattern: fire-and-forget void call for non-critical side effects (CRM) that must never block or fail the primary delivery path"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05]

coverage:
  - id: D1
    description: "General inquiry submission validates server-side and sends exactly one email to the fixed sales inbox"
    requirement: "LEAD-01"
    verification:
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#inquiry happy path: sends exactly once to the fixed sales inbox"
        status: pass
    human_judgment: false
  - id: D2
    description: "RFQ-mode submission (product/quantity/destinationCountry/incoterm) succeeds and delivers to the same fixed sales inbox"
    requirement: "LEAD-02"
    verification:
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#RFQ payload: includes RFQ fields in the sent email and uses the fixed sales inbox"
        status: pass
    human_judgment: false
  - id: D3
    description: "Honeypot-filled submission returns success without sending email; rate limiter rejects the 4th rapid submission from the same IP; Turnstile siteverify failure blocks the send"
    requirement: "LEAD-03"
    verification:
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#honeypot: returns success without calling resend.emails.send"
        status: pass
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#rate limit: the 4th rapid submission from the same IP is rejected"
        status: pass
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#turnstile failure blocks the send and returns an error"
        status: pass
      - kind: unit
        ref: "tests/unit/rate-limit.spec.ts#allows the first MAX_PER_WINDOW (3) calls and rejects the 4th"
        status: pass
    human_judgment: false
  - id: D4
    description: "Transactional email delivery via Resend with a react-email template; send failures never throw; graceful failure when RESEND_API_KEY is unset"
    requirement: "LEAD-04"
    verification:
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#send failure: resend.emails.send throws and the error never escapes"
        status: pass
      - kind: unit
        ref: "tests/unit/contact-action.spec.ts#returns a graceful network error when RESEND_API_KEY is unset, never throwing"
        status: pass
    human_judgment: true
    rationale: "Live SPF/DKIM/DMARC-authenticated delivery to the real sales inbox (per plan's backstop truth) requires a real Resend domain and account — cannot be automated by this agent; the send-path logic itself is fully unit-proven above, but end-to-end deliverability is a manual, deferred verification."
  - id: D5
    description: "CRM webhook stub fires fire-and-forget on every valid submission, no-ops safely when CRM_WEBHOOK_URL is unset, and its failure never affects the email-send success result"
    requirement: "LEAD-05"
    verification:
      - kind: unit
        ref: "tests/unit/crm-webhook.spec.ts#does not call fetch and does not throw when CRM_WEBHOOK_URL is unset"
        status: pass
      - kind: unit
        ref: "tests/unit/crm-webhook.spec.ts#POSTs the payload as JSON to CRM_WEBHOOK_URL when set"
        status: pass
      - kind: unit
        ref: "tests/unit/crm-webhook.spec.ts#swallows a fetch rejection and never throws"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-07-21
status: complete
---

# Phase 4 Plan 2: Server-Side Lead Submission Pipeline Summary

**submitContactForm Server Action composing honeypot + in-memory rate-limit + Cloudflare Turnstile siteverify + Resend email delivery + fire-and-forget CRM webhook stub, all unit-proven with mocked service clients**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-21T03:12:01Z
- **Completed:** 2026-07-21T03:19:55Z
- **Tasks:** 3
- **Files modified:** 10 (7 created, 3 modified)

## Accomplishments
- Extended the single shared `contactSchema` with `email`/`phone` (D-01), RFQ fields (D-02/D-03/D-04), a `companyWebsite` honeypot, and a required `turnstileToken` — no fork, same export the client form will consume in 04-03
- Built `submitContactForm` (`"use server"`) composing all three spam-defense layers plus delivery in cheapest-reject-first order, with `from`/`to` always fixed server-side env constants
- Built the in-memory rate limiter (3-per-60s window, documented single-instance limitation + Upstash upgrade path inline) and the env-gated CRM webhook stub, both matching `revalidatePage.ts`'s "never throw to the caller" precedent
- Built `LeadNotification.tsx` using the current `react-email` package (not the deprecated per-component package), conditionally rendering the RFQ block
- All behaviors unit-proven with mocked `resend`, `next/headers`, and `fetch` — 17/17 unit tests pass, full suite (45/45 across 11 files) green

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps + extend shared contactSchema in place** - `f6a3675` (feat)
2. **Task 2: In-memory rate limiter + CRM webhook stub, with unit tests** - `6a38cc4` (test, RED) → `59c3393` (feat, GREEN)
3. **Task 3: submitContactForm Server Action + LeadNotification email template** - `89f6a15` (test, RED) → `09c70ee` (feat, GREEN)

**Plan metadata:** committed separately by the orchestrator after wave merge (worktree mode — this agent does not write STATE.md/ROADMAP.md).

_TDD tasks (2 and 3) each have a test → feat commit pair; no refactor commit was needed._

## Files Created/Modified
- `src/lib/contact-schema.ts` - extended in place with email/phone, RFQ fields, honeypot, turnstileToken, email-or-phone refine
- `src/lib/contact-action.ts` - `submitContactForm` Server Action, the composition entry point
- `src/lib/rate-limit.ts` - `checkRateLimit`, module-scoped Map, 3-per-60s window
- `src/lib/crm-webhook.ts` - `notifyCrm`, env-gated fire-and-forget POST with 5s timeout
- `src/emails/LeadNotification.tsx` - react-email template for the sales-inbox notification
- `tests/unit/contact-action.spec.ts` - 7 tests covering inquiry, RFQ, honeypot, rate-limit, turnstile failure, send failure, missing-credential graceful failure
- `tests/unit/rate-limit.spec.ts` - 3 tests covering the window boundary, reset, and per-key independence
- `tests/unit/crm-webhook.spec.ts` - 3 tests covering unset/set/fetch-rejection behavior
- `package.json` / `package-lock.json` - added `resend`, `react-email`, `@marsidev/react-turnstile`

## Decisions Made
- Honeypot detection moved to run on the raw, pre-parse payload rather than the Zod-parsed `data` object (see Deviations) — this also matches the plan's own frontmatter `key_links` ordering, which lists honeypot as the very first composed step, ahead of schema validation.
- `RESEND_API_KEY` absence is treated as a graceful, typed failure everywhere (module-scope client construction uses a placeholder fallback key; the actual send call is gated behind an explicit env check) rather than allowing the Resend SDK's own constructor to throw at import time.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Honeypot check reordered to run before schema validation**
- **Found during:** Task 3 (submitContactForm implementation)
- **Issue:** The plan's `<action>` text (mirroring RESEARCH.md Pattern 1) specifies `contactSchema.safeParse` as step 1 and the honeypot truthy-check on the parsed `data.companyWebsite` as step 2. But Task 1's schema (also per the plan/RESEARCH code example) constrains `companyWebsite` to `.max(0)` — meaning any bot-filled (non-empty) value fails Zod validation itself, so `safeParse` would return `{success:false}` and the action would return a generic `{status:"error",message:"network"}` before ever reaching the honeypot branch. This directly violates the plan's own required behavior ("A honeypot-filled submission returns the success result... detection is never revealed to the sender") and the must_haves truth for LEAD-03, since a distinct error path on honeypot fill silently reveals detection.
- **Fix:** `submitContactForm` now reads and trims `companyWebsite` off the *raw*, pre-parse payload via a small type-safe helper (`readHoneypot`) and returns `{status:"success"}` immediately if it's non-empty — before `contactSchema.safeParse` ever runs. This is also consistent with the plan's frontmatter `key_links` line, which lists the composition order as `honeypot -> rate-limit -> Turnstile siteverify -> resend.emails.send -> fire-and-forget notifyCrm` (honeypot first, ahead of any parse step).
- **Files modified:** src/lib/contact-action.ts
- **Verification:** `tests/unit/contact-action.spec.ts#honeypot: returns success without calling resend.emails.send` passes; the schema's existing `.max(0)` constraint is left untouched (Task 1 commit unchanged) as harmless defense-in-depth.
- **Committed in:** 09c70ee (Task 3 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary correctness fix for the honeypot's core "never reveal detection" requirement, explicitly required by the plan's own must_haves. No scope creep — contained entirely within Task 3's `contact-action.ts`.

## Issues Encountered
- The `vi.mock("resend", ...)` factory initially returned an arrow function (`Resend: vi.fn().mockImplementation(() => ({...}))`), which Vitest/V8 rejects as a non-constructor when the module under test does `new Resend(...)`. Fixed by mocking `Resend` as a plain class with an `emails.send` instance property. No production code affected — test-only fix, folded into the Task 3 GREEN commit.

## User Setup Required

None yet in this plan — `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `SALES_INBOX_ADDRESS`, `TURNSTILE_SECRET_KEY`, and `CRM_WEBHOOK_URL` are all designed to fail gracefully / no-op when absent, so this plan's code ships and is fully unit-tested without live credentials. The plan's `user_setup` block (Resend domain verification + SPF/DKIM/DMARC + `_dmarc` TXT record, Cloudflare Turnstile secret key) remains a pending manual pre-launch task — not a blocker to this plan's completion, tracked as a backstop truth in 04-02-PLAN.md and 04-VALIDATION.md.

## Next Phase Readiness
- `submitContactForm`, the extended `contactSchema`, and the discriminated `SubmitResult` union are ready for 04-03 to wire `ContactForm.tsx`'s `onSubmit` to this Server Action, add the honeypot/Turnstile UI, and read the RFQ query param.
- No blockers. Live Resend/Turnstile credential provisioning and DNS verification remain a human-owned, pre-launch task independent of code readiness.

---
*Phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics*
*Completed: 2026-07-21*

## Self-Check: PASSED

All 8 created/modified artifact files verified present on disk (src/lib/contact-action.ts, src/lib/rate-limit.ts, src/lib/crm-webhook.ts, src/emails/LeadNotification.tsx, tests/unit/contact-action.spec.ts, tests/unit/rate-limit.spec.ts, tests/unit/crm-webhook.spec.ts, this SUMMARY.md). All 6 commit hashes (f6a3675, 6a38cc4, 59c3393, 89f6a15, 09c70ee, 93da22a) verified present in git log.
