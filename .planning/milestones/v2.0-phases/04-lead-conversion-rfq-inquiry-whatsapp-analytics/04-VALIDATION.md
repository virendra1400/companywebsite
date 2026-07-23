---
phase: 4
slug: lead-conversion-rfq-inquiry-whatsapp-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 (unit/integration, `tests/int/**`) + Playwright 1.61.1 (e2e, `tests/e2e/**`) — both already configured |
| **Config file** | `vitest.config.ts` (int project, isolated SQLite test DB), `playwright.config.ts` |
| **Quick run command** | `npx vitest run tests/unit/contact-action.spec.ts` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~90 seconds (Vitest) + ~3-5 min (Playwright en+ar matrix) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/unit/<changed-file>.spec.ts` (fast, targeted)
- **After every plan wave:** Run `npm run test` (full Vitest, `int` + new `unit` project) + `npm run test:e2e` (full Playwright suite)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-0X | TBD | TBD | LEAD-01 | T-04-04 | Zod schema re-validated server-side, not trusting client validation | unit (Vitest, `vi.mock("resend")`) | `npx vitest run tests/unit/contact-action.spec.ts -t "inquiry"` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-02 | — | RFQ-mode payload includes product/quantity/destinationCountry/incoterm | unit (Vitest) | `npx vitest run tests/unit/contact-action.spec.ts -t "rfq"` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-02 | — | `?product=`/`productName=` renders RFQ field group + read-only banner | e2e (Playwright) | `npx playwright test tests/e2e/contact-rfq-mode.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-03 | T-04-01 | Honeypot-filled submission returns success but Resend NOT called | unit (Vitest, assert mock not called) | `npx vitest run tests/unit/contact-action.spec.ts -t "honeypot"` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-03 | T-04-01 | Rapid-fire submissions beyond rate-limit threshold rejected | unit (Vitest, call action N+1 times) | `npx vitest run tests/unit/rate-limit.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-03 | T-04-02 | Turnstile `siteverify` failure blocks the send | unit (Vitest, mock `fetch` → `success: false`) | `npx vitest run tests/unit/contact-action.spec.ts -t "turnstile"` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-04 | — | Email send failure shows destructive error banner, form retains values | e2e (Playwright, force a 500-equivalent) | `npx playwright test tests/e2e/contact-error-state.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-05 | T-04-05 | CRM webhook called when `CRM_WEBHOOK_URL` set; no-op (no throw) when unset | unit (Vitest, `vi.mock` global `fetch`) | `npx vitest run tests/unit/crm-webhook.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-06 | — | Header WhatsApp CTA correct `href`/`aria-label`, desktop + mobile sheet | e2e (Playwright) | `npx playwright test tests/e2e/whatsapp-header-cta.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | LEAD-07 | — | `rfq_submit`/`inquiry_submit`/`whatsapp_click` fire with correct event name | unit (Vitest, mock `window.dataLayer`/`window.plausible`) | `npx vitest run tests/unit/analytics.spec.ts` | ❌ W0 | ⬜ pending |
| 04-0X | TBD | TBD | ANALY-01 | — | Analytics wrapper no-ops safely with no vendor mounted | unit (Vitest) | `npx vitest run tests/unit/analytics.spec.ts -t "no-op"` | ❌ W0 | ⬜ pending |

*Task/Plan/Wave columns are TBD — filled in once gsd-planner assigns concrete task IDs. Requirement/Test/Command columns are locked from RESEARCH.md's Phase Requirements → Test Map and must not drift.*

**Note (Pitfall 6, RESEARCH.md):** LEAD-04's real Resend delivery success and LEAD-03's real Turnstile success path are not meaningfully e2e-testable (third-party calls never touch the browser). Unit-level Vitest mocking is the correct boundary; Playwright stays restricted to client-observable states.

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — add a `unit` test project (or extend `int`) covering `tests/unit/**/*.spec.ts`, for modules that don't need the SQLite test DB (`contact-action.spec.ts`, `rate-limit.spec.ts`, `crm-webhook.spec.ts`, `analytics.spec.ts`) — currently `int` is the only project, scoped to `tests/int/**`
- [ ] `tests/unit/` directory — does not exist yet
- [ ] `tests/e2e/contact.spec.ts` — currently asserts "empty submit issues NO navigation/network" (D-07 stub behavior); becomes **false** once the Server Action is wired — must be updated in Wave 0 or the first wave, not left stale
- [ ] `tests/e2e/contact.spec.ts` — also asserts WhatsApp accessible name = "Message us on WhatsApp"; changes to "Chat on WhatsApp" per UI-SPEC Copywriting Contract — locator needs updating alongside the message-catalog change

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live SPF/DKIM/DMARC-authenticated delivery to a real inbox | LEAD-04 | Needs the user's real sending domain + DNS access + a live Resend account — code ships testable via mocks independent of this | After domain verified in Resend dashboard, submit the live form once, confirm the email arrives un-flagged (not spam) in the sales inbox with valid DKIM signature |
| Real Cloudflare Turnstile widget renders and blocks a scripted bot in production | LEAD-03 | Requires live Turnstile site/secret keys on a deployed URL, not mockable pre-deploy | Post-deploy: attempt a scripted rapid-fire submission against the live `/contact` URL, confirm it's blocked before reaching the inbox |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
