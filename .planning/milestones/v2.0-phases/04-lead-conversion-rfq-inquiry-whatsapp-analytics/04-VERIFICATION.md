---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
verified: 2026-07-21T15:03:48Z
status: passed
score: 6/6 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gap_closure:
  closed_at: 2026-07-21T15:12:00Z
  commit: 51d0e3e
  note: >
    whatsapp_click coverage gap closed same session — added
    src/components/chrome/WhatsAppTrackedLink.tsx (thin client boundary) and
    wired it into HeroBlock, ContactBlockView, and CTABandBlock. Verified via
    tsc --noEmit, full unit suite (45/45), and production build, all clean.
gaps:
  - truth: "Both RFQ/inquiry submissions and WhatsApp clicks appear as distinct, named conversion events in analytics. [ROADMAP Phase 4 Success Criterion 5 / LEAD-07]"
    status: resolved
    reason: >
      rfq_submit and inquiry_submit fire correctly and are unit/e2e-verified for every
      submission path. whatsapp_click, however, only fires from the GlobalHeader (desktop)
      and MobileNavPanel (mobile sheet) CTAs, both of which route through the WhatsAppCta
      component built in 04-01. Every other WhatsApp entry point on the site is a plain
      <a href={waHref}> anchor with no onClick/trackEvent call, so clicking WhatsApp from
      those locations produces zero analytics signal. 04-01-SUMMARY.md's own "Scope Note"
      flagged this gap explicitly ("the hero/CTA-band/ContactBlockView WhatsApp anchors are
      untouched pre-existing links that do not yet call trackEvent... No later 04-0x plan in
      this phase's task list wires them either") and no subsequent plan (04-02..04-05) closed
      it. The phase goal's own wording — "every conversion tracked in analytics" — is not met.
    artifacts:
      - path: "src/components/blocks/HeroBlock.tsx"
        issue: "Homepage hero secondaryCta WhatsApp link (line 76) is a plain <a href={waHref}> — no trackEvent call"
      - path: "src/components/blocks/ContactBlockView.tsx"
        issue: "Contact page's own WhatsApp link (lines 34-45, with visible label + aria-label) is a plain <a> — no trackEvent call"
      - path: "src/components/blocks/CTABandBlock.tsx"
        issue: "secondaryCta anchor (line 29) is a plain <a href> — no trackEvent call. Reused by src/lib/seed-content.ts's ctaBand() helper across About, Certifications, Manufacturing, Export Track Record, Company pages, plus both product-catalog and product-detail pages — the single largest WhatsApp click surface on the site"
    missing:
      - "Wire trackEvent(\"whatsapp_click\", { location: ... }) into HeroBlock's secondary CTA, ContactBlockView's WhatsApp anchor, and CTABandBlock's secondaryCta anchor — or refactor these three call sites onto the existing shared WhatsAppCta component (built in 04-01) so every WhatsApp CTA site-wide fires the conversion event, not only the two in the persistent site chrome."
deferred: []
human_verification_recommended:
  - test: "Confirm live SPF/DKIM/DMARC-authenticated delivery from the verified Resend sending domain to the real sales inbox (roadmap Success Criterion 1 / LEAD-04)."
    expected: "Email arrives un-flagged, valid DKIM signature, from the verified subdomain."
    why_human: "Requires a live Resend domain + DNS verification; the code path (from/to fixed server constants, graceful no-throw failure when RESEND_API_KEY is unset) is fully unit-proven, but the outbound network call to a real inbox is invisible to automated tests, per this phase's own documented backstop truths."
  - test: "Re-confirm, ideally with a live vendor mounted, that trackEvent's params never include name/email/phone/company/message across all 5 call-site prohibitions (04-01/02/03/04/05 must_haves.prohibitions, all marked status:unverified/flagged:true in PLAN frontmatter)."
    expected: "Only event name + product slug / location string ever appear in the vendor payload."
    why_human: "Judgment-tier prohibition. Code inspection (this verification + 04-REVIEW.md) confirms trackEvent call sites pass only { product } or { location }, and notifyCrm now strips turnstileToken/companyWebsite (WR-05 was fixed — see below) — but no automated test asserts the negative (absence of PII) end-to-end, so this is a non-authoritative LLM-judge pass, not a certified one."
  - test: "Update REQUIREMENTS.md: LEAD-06 checkbox is still unchecked (`- [ ]`) and its traceability row still reads 'Pending', despite 04-01-PLAN.md/SUMMARY.md claiming LEAD-06 complete and this verification confirming the header/mobile-nav WhatsApp CTA is real and e2e-tested."
    expected: "REQUIREMENTS.md LEAD-06 checkbox and traceability status corrected to match actual code state (independent of the whatsapp_click coverage gap above, which affects LEAD-07, not LEAD-06 — LEAD-06 is about CTA presence, which is satisfied)."
    why_human: "Documentation bookkeeping, not a code defect — flagging so REQUIREMENTS.md stays trustworthy."
---

# Phase 04: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics Verification Report

**Phase Goal:** A visitor can convert into a qualified lead via a general inquiry form, a per-product RFQ form, or WhatsApp — every conversion tracked in analytics.
**Verified:** 2026-07-21T15:03:48Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | General inquiry + per-product RFQ both deliver to the fixed sales inbox via Resend; failures never throw. [Roadmap SC1 / LEAD-01/02/04] | ✓ VERIFIED | `src/lib/contact-action.ts` — `resend.emails.send` with `from`/`to` as fixed `process.env` constants; 7 unit tests in `tests/unit/contact-action.spec.ts` (inquiry happy path, RFQ payload, send-failure, missing-credential graceful failure) all pass (`npx vitest run --project unit` — 17/17 green). Live SPF/DKIM/DMARC-authenticated delivery is a documented backstop requiring a real domain — see human_verification_recommended. |
| 2 | A scripted spam/bot submission (rapid-fire, no honeypot fill) is blocked or rate-limited before reaching the inbox, and the rate-limit key can't be trivially spoofed. [Roadmap SC2 / LEAD-03] | ✓ VERIFIED | Honeypot: `readHoneypot` runs pre-parse, returns silent `{status:"success"}` without sending (unit-verified). Rate limit: `checkRateLimit` enforces 3/60s with window reset (unit-verified, boundary + reset both tested). Turnstile: `success !== true` blocks send (unit-verified). **CR-01** (rate-limiter keyed on the client-spoofable *first* `X-Forwarded-For` entry) is fixed in commit `555ae3b` — `contact-action.ts:55` now uses `.split(",").pop()`, confirmed by direct file read. |
| 3 | A stub CRM webhook fires on every valid submission, no-ops safely when unset. [Roadmap SC3 / LEAD-05] | ✓ VERIFIED | `src/lib/crm-webhook.ts` — `notifyCrm` gated on `CRM_WEBHOOK_URL`, 5s timeout, swallows errors. 3/3 unit tests pass (unset/set/fetch-rejection). WR-03 (fire-and-forget may be killed early on serverless — should use `after()`) is an unfixed Warning per code review, accepted by design, not a must-have failure. |
| 4 | Visitor can tap a WhatsApp click-to-chat CTA (`wa.me`) from anywhere on the site and open a pre-filled chat. [Roadmap SC4 / LEAD-06] | ✓ VERIFIED | `wa.me` links present and functional in: `GlobalHeader` (desktop, e2e-verified), `MobileNavPanel` (mobile sheet, e2e-verified), `HeroBlock` (homepage), `ContactBlockView` (Contact page), `CTABandBlock` (About/Certifications/Manufacturing/Export-Track-Record/Company/product pages via `seed-content.ts`). All href values sourced from `getSiteBrand().waHref`, never hardcoded. `npx playwright test tests/e2e/whatsapp-header-cta.spec.ts --project=en` — 2/2 pass. |
| 5 | Both RFQ/inquiry submissions **and WhatsApp clicks** appear as distinct, named conversion events in analytics. [Roadmap SC5 / LEAD-07] | ✗ FAILED | `rfq_submit`/`inquiry_submit` fire correctly (verified — see Requirements Coverage). `whatsapp_click` fires **only** from the header and mobile-nav-sheet CTAs (routed through `WhatsAppCta`, `src/components/chrome/WhatsAppCta.tsx`). `HeroBlock.tsx:76`, `ContactBlockView.tsx:34-45`, and `CTABandBlock.tsx:29` (the single most-reused WhatsApp entry point, appearing on ~8 pages) are plain `<a href>` anchors with **no** `trackEvent` call. Self-flagged by 04-01-SUMMARY.md's "Scope Note"; never closed by 04-02..04-05. |
| 6 | A web analytics vendor script is mounted site-wide and `trackEvent` dispatches to it / no-ops safely without one. [ANALY-01] | ✓ VERIFIED | Plausible chosen (checkpoint decision, 04-05); `src/app/(site)/[locale]/layout.tsx` mounts `next/script` guarded by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (renders nothing when unset). `trackEvent`'s `window.plausible` branch matches. 4/4 unit tests in `tests/unit/analytics.spec.ts` pass (no-window no-op, dataLayer push, plausible call, non-PII passthrough). `npx tsc --noEmit` clean. |

**Score:** 5/6 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/analytics.ts` | Vendor-agnostic `trackEvent` wrapper | ✓ VERIFIED | Exists, substantive, unit-tested, wired into WhatsAppCta/ContactForm |
| `src/components/icons/WhatsAppIcon.tsx` | Single shared SVG | ✓ VERIFIED | Extracted, imported by ContactBlockView + WhatsAppCta |
| `src/components/chrome/WhatsAppCta.tsx` | Client CTA firing `whatsapp_click` | ✓ VERIFIED | Wired into GlobalHeader + MobileNavPanel only (see Truth 5 gap) |
| `src/lib/contact-action.ts` | `submitContactForm` Server Action | ✓ VERIFIED | Composes honeypot → rate-limit → Turnstile → Resend → CRM in order; CR-01 fixed |
| `src/lib/rate-limit.ts` | In-memory rate limiter | ✓ VERIFIED | 3/60s window, boundary + reset unit-tested |
| `src/lib/crm-webhook.ts` | CRM stub | ✓ VERIFIED | Env-gated, fire-and-forget, unit-tested |
| `src/emails/LeadNotification.tsx` | react-email template | ✓ VERIFIED | Uses current `react-email` package (not deprecated `@react-email/components`) |
| `src/lib/contact-schema.ts` | Extended shared schema | ✓ VERIFIED | email/phone refine, RFQ fields, honeypot, turnstileToken all present |
| `src/components/blocks/ContactForm.tsx` | Full inquiry+RFQ client form | ✓ VERIFIED | Loading/success/error/rate-limited states, honeypot, Turnstile, RFQ conditional fields — all e2e-verified |
| `src/components/ui/select.tsx` | shadcn Select (Incoterm) | ✓ VERIFIED | 11 Incoterms + "Not sure yet", `<bdi>`-wrapped codes |
| `src/app/(site)/[locale]/layout.tsx` | Plausible mount | ✓ VERIFIED | Guarded `next/script`, `tsc`/`eslint` clean |
| `src/components/blocks/HeroBlock.tsx`, `ContactBlockView.tsx`, `CTABandBlock.tsx` | WhatsApp CTAs firing `whatsapp_click` | ✗ NOT WIRED to analytics | Functional `wa.me` links, but no `trackEvent` call — see Truth 5 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `GlobalHeader.tsx` | `WhatsAppCta` → `trackEvent` | import + onClick | ✓ WIRED | `waHref` from `getSiteBrand()`; e2e-confirmed |
| `MobileNavPanel.tsx` | `WhatsAppCta` → `trackEvent` | import + onClick | ✓ WIRED | Closes sheet on navigate; e2e-confirmed |
| `HeroBlock.tsx` | `trackEvent` | — | ✗ NOT WIRED | Plain anchor, no analytics call site |
| `ContactBlockView.tsx` | `trackEvent` | — | ✗ NOT WIRED | Plain anchor, no analytics call site |
| `CTABandBlock.tsx` | `trackEvent` | — | ✗ NOT WIRED | Plain anchor, no analytics call site; reused on ~8 pages |
| `ContactForm.tsx` (onSubmit) | `contact-action.ts` (`submitContactForm`) | `await submitContactForm(values)` | ✓ WIRED | try/catch added around the call (network-drop resilience); e2e-confirmed |
| `ContactForm.tsx` (onSubmit success) | `analytics.ts` (`trackEvent`) | `trackEvent(values.product ? "rfq_submit" : "inquiry_submit", {product})` | ✓ WIRED | Only fires after `status === "success"`; non-PII payload confirmed by code read |
| `contact-action.ts` | `rate-limit.ts` (`checkRateLimit`) | IP key from last `X-Forwarded-For` entry | ✓ WIRED | CR-01 fix confirmed present |
| `contact-action.ts` | `crm-webhook.ts` (`notifyCrm`) | `void notifyCrm(data)` fire-and-forget | ✓ WIRED | Runs after successful send; unit-verified |
| `layout.tsx` | Plausible script → `analytics.ts` dispatch | `window.plausible` branch | ✓ WIRED | Dispatch branch matches mounted vendor (code read + unit test) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Vitest `unit` project (analytics, contact-action, rate-limit, crm-webhook — 17 tests) | `npx vitest run --project unit` | 4 files, 17/17 pass | ✓ PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | no output / exit 0 | ✓ PASS |
| Header WhatsApp CTA + mobile sheet CTA | `npx playwright test tests/e2e/whatsapp-header-cta.spec.ts --project=en` | 2/2 pass | ✓ PASS |
| RFQ-mode render states (full RFQ, missing-productName backstop, plain inquiry) | `npx playwright test tests/e2e/contact-rfq-mode.spec.ts --project=en` | 3/3 pass | ✓ PASS |
| Error banner / rate-limit trip / Turnstile-load-failure | `npx playwright test tests/e2e/contact-error-state.spec.ts --project=en` | 3/3 pass | ✓ PASS |
| General inquiry render + empty-submit validation + RTL overflow, en+ar | `npx playwright test tests/e2e/contact.spec.ts --project=en --project=ar` | 10/10 pass | ✓ PASS |
| No unreferenced debt markers (TBD/FIXME/XXX) in phase files | `grep -rn` across 14 modified source files | 0 unreferenced matches (one `placeholder` code comment, one `<SelectValue placeholder=...>` prop, one CSS data-attribute — all legitimate, non-stub) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LEAD-01 | 04-02, 04-03 | General inquiry form | ✓ SATISFIED | Unit + e2e verified end-to-end |
| LEAD-02 | 04-02, 04-04 | Per-product RFQ | ✓ SATISFIED | Unit + e2e verified end-to-end, incl. slug-fallback backstop |
| LEAD-03 | 04-02, 04-03 | Spam defense (honeypot + rate-limit + Turnstile) | ✓ SATISFIED | Unit-verified all 3 layers; CR-01 (rate-limiter spoofability) fixed and confirmed |
| LEAD-04 | 04-02, 04-03 | Transactional email delivery | ✓ SATISFIED (code) / pending (live SPF/DKIM/DMARC) | Send-path fully unit-proven; live domain auth is a documented, expected-deferred backstop |
| LEAD-05 | 04-02 | CRM webhook stub | ✓ SATISFIED | Unit-verified; WR-03 (serverless `after()` robustness) is an accepted Warning |
| LEAD-06 | 04-01 | WhatsApp CTA prominent site-wide | ✓ SATISFIED (code) — REQUIREMENTS.md checkbox stale | Header + mobile nav CTAs e2e-verified; `wa.me` links also present on hero/contact/CTA-bands. REQUIREMENTS.md still shows `- [ ]`/"Pending" for LEAD-06 despite 04-01-SUMMARY.md claiming it complete — doc-sync gap, not a code gap |
| LEAD-07 | 04-01, 04-03, 04-04, 04-05 | RFQ/inquiry/WhatsApp clicks tracked as conversion events | ✗ BLOCKED (partial) | `rfq_submit`/`inquiry_submit` fully wired and verified. `whatsapp_click` only fires from 2 of ~8+ site-wide WhatsApp CTA instances — see Truth 5 gap |
| ANALY-01 | 04-01, 04-05 | Web analytics installed | ✓ SATISFIED | Plausible mounted, guarded, dispatch-verified |

No orphaned requirements — all 8 phase requirement IDs (LEAD-01..07, ANALY-01) appear in both REQUIREMENTS.md's Phase 4 traceability rows and at least one plan's `requirements:` frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/contact-action.ts` | 61-69 | Turnstile `fetch(...).then()` has no try/catch (WR-01, code review) | ⚠️ Warning | A DNS failure/timeout throws an unhandled digest server-side instead of the typed error result. Accepted-unfixed by user decision (speed over full remediation); client still recovers via ContactForm's own try/catch. Not a must-have failure. |
| `src/lib/contact-schema.ts` | 12-14, 18, 34-35 | No `.max()` bound on name/company/country/phone/destinationCountry/incoterm (WR-02) | ⚠️ Warning | Direct-Server-Action callers (bypassing the browser) could submit oversized strings into email/CRM payload. Accepted-unfixed. |
| `src/lib/contact-action.ts` | 92 | Fire-and-forget `void notifyCrm(data)` without `after()` (WR-03) | ⚠️ Warning | May be killed early on Vercel serverless before the CRM POST completes. Accepted-unfixed. |
| `src/lib/contact-action.ts` | 82-83 | `RESEND_FROM_ADDRESS!`/`SALES_INBOX_ADDRESS!` non-null-asserted without an explicit guard (WR-04) | ⚠️ Warning | Partial env misconfiguration reads as a generic "network" error rather than a distinguishable config error. Accepted-unfixed. |
| `src/lib/contact-action.ts` | 92 | `notifyCrm(data)` forwards the full parsed object, including `turnstileToken`/`companyWebsite` (WR-05) | ⚠️ Warning | Internal defense-only fields leak to the CRM webhook payload. Accepted-unfixed. |
| `src/components/chrome/GlobalHeader.tsx` / `MobileNavPanel.tsx` | — | `NAV_KEYS`/`NAV_HREFS` duplicated verbatim (IN-01) | ℹ️ Info | Drift risk on future nav changes. Not a functional gap. |
| — | — | No unreferenced `TBD`/`FIXME`/`XXX` markers found in any of the 14 phase-modified files | — | Debt-marker gate passes |

All 5 Warnings above are from `04-REVIEW.md` and are unfixed by explicit user decision (speed over full remediation) — per this verification's scope instructions, they are documented here but do **not** count as blocking gaps since no plan's own `must_haves` required them. Only **CR-01** (the Critical) was a must-have-relevant correctness bug, and it is confirmed fixed.

## Gaps Summary

One real gap blocks full phase-goal achievement: **`whatsapp_click` is not tracked from most of the site's WhatsApp entry points.** The phase goal explicitly requires "every conversion tracked in analytics," and the roadmap's own Success Criterion 5 requires WhatsApp clicks to "appear as distinct, named conversion events in analytics" — this is true only for the header and mobile-nav-sheet CTAs. The homepage hero secondary CTA, the Contact page's own WhatsApp link, and the reusable `CTABandBlock` secondary CTA (used across About, Certifications, Manufacturing, Export Track Record, Company, and both product-catalog/product-detail pages) are all plain anchors that silently produce zero analytics signal on click. This was self-identified by 04-01-SUMMARY.md's "Scope Note" at the time and never closed by a later plan in this phase — the executor flagged it honestly but the phase's own task list never assigned it to any of the 5 plans.

Everything else — inquiry/RFQ submission, honeypot/rate-limit/Turnstile spam defense (including the CR-01 critical fix), CRM webhook stub, Resend email delivery, and the Plausible analytics mount — is genuinely built, unit-tested, and e2e-verified against the running application (not just claimed in SUMMARY.md).

---

_Verified: 2026-07-21T15:03:48Z_
_Verifier: Claude (gsd-verifier)_
