# Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-20
**Phase:** 4-Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics
**Areas discussed:** Form fields & RFQ path, WhatsApp reach & analytics event taxonomy

---

## Form fields & RFQ path

| Option | Description | Selected |
|--------|-------------|----------|
| Add required email field | Validated email, sales replies directly | |
| Add optional email, rely on phone/WhatsApp too | Email optional, add a phone field, visitor picks contact method | ✓ |

**User's choice:** Optional email + phone field.

| Option | Description | Selected |
|--------|-------------|----------|
| Single form, RFQ fields shown conditionally | One ContactForm + schema; ?product= reveals quantity/destination/incoterm | ✓ |
| Two separate forms | Dedicated /rfq route, keep /contact general-only | |

**User's choice:** Single form, conditional RFQ fields.

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only field auto-filled from query param | Product name locked, taken from slug/query param | ✓ |
| Dropdown to pick/confirm from product list | Prefilled but editable select | |

**User's choice:** Read-only auto-filled field.

| Option | Description | Selected |
|--------|-------------|----------|
| Two separate fields | Keep "country" (company) + add "destinationCountry" (RFQ shipping) | ✓ |
| One field, reused for both | Simpler form, assumes company country == shipping destination | |

**User's choice:** Two separate fields.

---

## WhatsApp reach & analytics event taxonomy

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent header button | WhatsApp CTA in GlobalHeader, desktop + mobile nav | ✓ |
| Floating action button (site-wide) | Fixed-position bubble, bottom-corner | |
| Keep as-is (Hero + product pages only) | No change | |

**User's choice:** Persistent header button.

| Option | Description | Selected |
|--------|-------------|----------|
| rfq_submit / inquiry_submit / whatsapp_click | Three distinct events, snake_case | ✓ |
| single generic lead_conversion event + 'type' property | One event, differentiated by property | |

**User's choice:** Three distinct named events.

---

## Claude's Discretion

- CRM webhook stub behavior (no vendor chosen — LEAD-05 is stub-only): internal function, no-op or env-gated placeholder POST, never blocks email delivery.
- Spam defense specifics (Turnstile widget mode, honeypot mechanics, rate-limit strategy): vendor locked in STACK.md, implementation details left to researcher/planner.
- Analytics vendor (GA4+GTM vs Plausible): still deferred; event taxonomy (this discussion) is provider-agnostic so it doesn't block build.
- Email delivery (Resend, SPF/DKIM/DMARC): vendor locked in STACK.md; needs user's domain + Resend account before going live — flagged as a pending human action.

## Deferred Ideas

None — discussion stayed within phase scope.
