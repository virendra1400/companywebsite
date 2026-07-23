---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
reviewed: 2026-07-21T00:00:00Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - src/app/(site)/[locale]/layout.tsx
  - src/components/blocks/ContactBlockView.tsx
  - src/components/blocks/ContactForm.tsx
  - src/components/chrome/GlobalHeader.tsx
  - src/components/chrome/MobileNavPanel.tsx
  - src/components/chrome/WhatsAppCta.tsx
  - src/components/icons/WhatsAppIcon.tsx
  - src/components/ui/select.tsx
  - src/emails/LeadNotification.tsx
  - src/i18n/messages/ar.json
  - src/i18n/messages/en.json
  - src/i18n/messages/fr.json
  - src/i18n/messages/ru.json
  - src/lib/analytics.ts
  - src/lib/contact-action.ts
  - src/lib/contact-schema.ts
  - src/lib/crm-webhook.ts
  - src/lib/rate-limit.ts
  - tests/e2e/contact-error-state.spec.ts
  - tests/e2e/contact-rfq-mode.spec.ts
  - tests/e2e/contact.spec.ts
  - tests/e2e/turnstile-mock.ts
  - tests/e2e/whatsapp-header-cta.spec.ts
  - tests/unit/analytics.spec.ts
  - tests/unit/contact-action.spec.ts
  - tests/unit/crm-webhook.spec.ts
  - tests/unit/rate-limit.spec.ts
findings:
  critical: 1
  warning: 5
  info: 1
  total: 7
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-07-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Reviewed the RFQ/inquiry contact form, its Server Action pipeline (honeypot → rate-limit →
Turnstile → Resend → CRM webhook), the shared zod schema, the analytics wrapper, and the
WhatsApp CTA/nav chrome. The honeypot-never-revealed and PII-never-in-analytics requirements
are both correctly implemented (`trackEvent` only ever receives a product slug/location
string; `readHoneypot` runs pre-validation and returns a silent fake-success). No `NEXT_PUBLIC_`
secrets, no XSS/eval/dangerouslySetInnerHTML, no hardcoded credentials, and unit/e2e coverage
of the happy/error/rate-limit/RFQ paths is genuinely thorough.

The one BLOCKER is in the rate limiter's IP derivation: it trusts the first, client-controllable
entry of `X-Forwarded-For` rather than the trusted entry appended by the platform's edge, which
lets a single attacker defeat the entire in-memory throttle by sending a different fake header
value on every request — the exact "rate-limiter correctness" concern this review was asked to
focus on. The remaining findings are robustness/consistency gaps in the same submission pipeline
(unguarded Turnstile fetch, unbounded field lengths, fire-and-forget CRM delivery on serverless,
unvalidated env non-null assertions, internal-only fields leaking into the CRM payload).

## Critical Issues

### CR-01: Rate limiter keys off the client-controllable, wrongly-indexed X-Forwarded-For header

**File:** `src/lib/contact-action.ts:48`
**Issue:** `checkRateLimit` (LEAD-03) is keyed on:
```ts
const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
```
`X-Forwarded-For` is a comma-separated list where each hop *appends* the address it saw —
the only trustworthy entry is the one appended by the outermost trusted proxy (Vercel's edge),
which is the **last** entry, not the first. Any client can set its own `X-Forwarded-For` header
on the initial request (e.g. `X-Forwarded-For: 1.2.3.4`); Vercel's edge appends the real
connecting IP after it, producing `"1.2.3.4, <real-ip>"`. `.split(",")[0]` picks the
attacker-supplied `1.2.3.4`, not the real IP. A bot can therefore rotate a random fake first
IP on every POST and get a fresh 3-request window every single time, fully defeating the only
rate limit protecting the Resend send + Turnstile round-trip from abuse. This directly
undermines the "rate-limiter correctness" requirement called out for this phase.
**Fix:** Take the last entry (or better, prefer a platform-set header that can't be
client-forged, e.g. Vercel's `x-real-ip` / `x-vercel-forwarded-for` — verify against current
Vercel docs) instead of the first:
```ts
const forwardedFor = headersList.get("x-forwarded-for");
const ip =
  headersList.get("x-real-ip") ??
  forwardedFor?.split(",").map((s) => s.trim()).filter(Boolean).pop() ??
  "unknown";
```

## Warnings

### WR-01: Turnstile siteverify fetch has no error handling, breaking the documented graceful-failure contract

**File:** `src/lib/contact-action.ts:54-63`
**Issue:** Every other failure mode in this function (missing `RESEND_API_KEY`, `resend.emails.send`
throwing, rate-limit) is caught and converted into the typed `SubmitResult` error union. The
Turnstile `fetch(...).then((r) => r.json())` call is not wrapped in try/catch: a DNS failure,
timeout, non-JSON response, or Cloudflare outage throws out of `submitContactForm` instead of
returning `{ status: "error", message: "network" }`. Because this is a Next.js Server Action,
the client's `catch` in `ContactForm.onSubmit` still recovers visually, but the failure now
surfaces as an unhandled-exception digest in server logs rather than the graceful path the
module's own comments describe (LEAD-04), and there is no test covering this path (only the
`success: false` verification-failed case is tested, not a rejected/erroring fetch).
**Fix:**
```ts
let verify: { success: boolean };
try {
  verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: data.turnstileToken,
      remoteip: ip,
    }),
  }).then((r) => r.json());
} catch {
  return { status: "error", message: "network" };
}
if (!verify.success) return { status: "error", message: "network" };
```

### WR-02: No max-length bounds on several PII fields in contactSchema

**File:** `src/lib/contact-schema.ts:12-14, 18, 34-35`
**Issue:** `message` (max 2000) and `quantity` (max 200) are bounded, but `name`, `company`,
`country`, `phone`, `destinationCountry`, and `incoterm` have no `.max()` at all. Since this
schema is also the server-side gate (not just client UX), a caller invoking the Server Action
directly (bypassing the browser form) can submit megabyte-scale strings in any of these fields,
which then flow unmodified into the Resend email body and the outbound CRM webhook payload.
**Fix:** Add reasonable caps, e.g. `z.string().trim().min(1, "...").max(200)` for name/company/
country/destinationCountry/incoterm, and `.max(50)` for phone.

### WR-03: Fire-and-forget CRM webhook may never complete on a serverless runtime

**File:** `src/lib/contact-action.ts:85`
**Issue:** `void notifyCrm(data);` starts the CRM POST without awaiting it, then the function
returns immediately after. On Vercel's Node serverless functions, once a Server Action's
response is sent, the runtime is not guaranteed to keep the invocation's event loop alive for
unawaited promises — this is precisely the gap Next.js's `after()` API (available in this
project's Next 16) exists to close. Without it, the CRM notification can be silently dropped
on a fraction of requests depending on runtime scheduling, with no way to detect it (errors are
already swallowed inside `notifyCrm`'s catch).
**Fix:** Use Next's background-work API instead of a bare unawaited call:
```ts
import { after } from "next/server";
// ...
after(() => notifyCrm(data));
```

### WR-04: `RESEND_FROM_ADDRESS` / `SALES_INBOX_ADDRESS` are non-null-asserted without validation

**File:** `src/lib/contact-action.ts:65-68, 75-76`
**Issue:** Only `RESEND_API_KEY` is checked before calling `resend.emails.send`. `from` and `to`
use `!` non-null assertions on `RESEND_FROM_ADDRESS` / `SALES_INBOX_ADDRESS` with no equivalent
guard. If either is unset in an environment where `RESEND_API_KEY` *is* set (a very plausible
partial-misconfiguration state), `resend.emails.send` is called with `from: undefined, to:
undefined`; the resulting throw is caught generically and reported to the user as the same
"network" error as a transient outage, making a deploy-config bug indistinguishable from a
real transient failure in logs/monitoring.
**Fix:** Extend the existing env guard: `if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_ADDRESS || !process.env.SALES_INBOX_ADDRESS) return { status: "error", message: "network" };`

### WR-05: Internal defense-only fields (`turnstileToken`, `companyWebsite`) are forwarded to the third-party CRM webhook

**File:** `src/lib/contact-action.ts:85`
**Issue:** `notifyCrm(data)` passes the entire parsed schema object, which still includes the
solved Turnstile token and the (always-empty, for real submitters) honeypot field. Neither has
any value to a CRM and both are internal implementation details of this app's spam defense;
forwarding the Turnstile token specifically to an external system is unnecessary exposure of a
security-adjacent value with no offsetting benefit.
**Fix:** Build an explicit CRM payload instead of forwarding the raw parsed object:
```ts
const { turnstileToken: _t, companyWebsite: _h, ...crmPayload } = data;
void notifyCrm(crmPayload);
```

## Info

### IN-01: NAV_KEYS / NAV_HREFS duplicated verbatim between GlobalHeader and MobileNavPanel

**File:** `src/components/chrome/GlobalHeader.tsx:16-36`, `src/components/chrome/MobileNavPanel.tsx:28-48`
**Issue:** Both files define byte-for-byte identical `NAV_KEYS` tuples and `NAV_HREFS` records.
Any future nav change (new page, renamed route) has to be applied twice and can silently drift.
**Fix:** Extract both constants to a shared module (e.g. `src/components/chrome/nav-config.ts`)
and import from both call sites.

---

_Reviewed: 2026-07-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
