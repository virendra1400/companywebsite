# Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics - Context

**Gathered:** 2026-07-20
**Status:** Ready for planning

<domain>
## Phase Boundary

A visitor converts into a qualified lead via a general inquiry form, a per-product RFQ form, or WhatsApp — every conversion tracked as a named analytics event, protected against spam, delivered by authenticated transactional email, with a CRM webhook stub so a real CRM can be wired later without form rework. Builds on Phase 1 (SiteSettings contact channels), Phase 3 (product catalog RFQ entry point).

</domain>

<decisions>
## Implementation Decisions

### Form fields & RFQ path
- **D-01:** `contactSchema` (`src/lib/contact-schema.ts`) gets an **optional** email field, plus a new **phone** field — visitor picks how to be reached (not forcing email).
- **D-02:** One shared form + one schema, not two routes. When `/contact?product=X` carries a product, RFQ-specific fields (`quantity`, `destinationCountry`, `incoterm`) render conditionally; without product context it's a plain general inquiry.
- **D-03:** Product identity in RFQ mode is a **read-only field auto-filled from the query param** (not a re-pickable dropdown) — trusts the catalog-linked CTA, no typo risk.
- **D-04:** `destinationCountry` is a **separate field** from the existing `country` field. `country` = visitor/company location, `destinationCountry` = RFQ shipping destination — these differ often enough in exports (e.g., buyer in UAE, ship to Saudi) to matter.

### WhatsApp reach & analytics event taxonomy
- **D-05:** Add a **persistent WhatsApp CTA to GlobalHeader** (desktop + mobile nav), using the existing `waHref` from `getSiteBrand()` — on top of the existing Hero and product-page placements. Rejected: floating action button (feels intrusive on a trust/corporate site) and status-quo-only (doesn't satisfy LEAD-07 "prominently across the site").
- **D-06:** Analytics stub uses **three distinct named events**: `rfq_submit`, `inquiry_submit`, `whatsapp_click` — snake_case (GA4 convention; Plausible accepts any string), not a single generic event with a `type` property. Matches ROADMAP LEAD-07 wording exactly ("distinct, named conversion events").

### Claude's Discretion
These were surfaced during area-selection but the user deferred to defaults already set at project level (STACK.md) or declined to discuss further — planner/researcher should treat as settled, not reopen:
- **CRM webhook stub behavior:** no CRM vendor chosen (LEAD-05 is stub-only). Default: a single internal function (already the pattern per SESSION-HANDOFF §8 "keeps this behind one internal function") that no-ops or POSTs to an env-gated placeholder URL if set; never blocks the actual email delivery path.
- **Spam defense specifics:** Cloudflare Turnstile + honeypot per STACK.md (locked). Widget mode (managed vs invisible), honeypot field mechanics, and rate-limit strategy are implementation details for the planner/researcher to resolve against Cloudflare's current docs — not user-facing decisions.
- **Analytics vendor (GA4+GTM vs Plausible):** still deferred per STACK.md ("decide Phase 4"). Event taxonomy (D-06) is provider-agnostic by design so this choice doesn't block implementation — build the event-firing layer behind a thin wrapper, wire the real provider script whenever the vendor is picked.
- **Email delivery:** Resend, per STACK.md (locked) — SPF/DKIM/DMARC on the sending domain is an LEAD-04 acceptance criterion, needs the user's domain + Resend account before this can go live (flagged in SESSION-HANDOFF §8 as a pending human action).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing form/contact plumbing (Phase 2 stub → Phase 4 wires it live)
- `src/lib/contact-schema.ts` — shared zod schema, client stub AND future server action read from this SAME export (do not fork it)
- `src/components/blocks/ContactForm.tsx` — client-side-only stub (`onSubmit` sets local state, no network call); has an explicit spam-defense insertion-point comment before the submit button
- `src/blocks/ContactBlock.ts` / `src/components/blocks/ContactBlockView.tsx` — Payload block + view wrapping ContactForm

### Contact-channel single source of truth (Phase 1/post-Phase-3)
- `src/globals/SiteSettings.ts` — `contact` group (email/phone/whatsapp), edited in `/admin`
- `src/lib/payload-fetch.ts` — `getSiteBrand()` (React `cache()`d) returns `{siteName, logoUrl, email, phone, whatsapp, waHref}`; any new WhatsApp-consuming component (D-05 header CTA) MUST call this, never hardcode a number

### Stack-locked vendor decisions (do not re-litigate)
- `.planning/STACK.md` — Resend (email), Cloudflare Turnstile + honeypot (spam), `wa.me` click-to-chat (no WhatsApp Business API at launch), GA4+GTM-or-Plausible (analytics, vendor choice deferred to this phase)
- `.planning/ROADMAP.md` §Phase 4 — LEAD-01…07, ANALY-01 requirement text and success criteria (verbatim source for acceptance criteria)

### Product catalog RFQ entry point
- Product detail page RFQ CTA already links to `/contact?product=` (per SESSION-HANDOFF §5 Phase 3 summary) — this phase is what makes that query param actually do something (D-02/D-03)

No other external specs/ADRs — requirements fully captured in ROADMAP.md + decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `contactSchema` (zod) — extend in place with `email?`, `phone`, `quantity?`, `destinationCountry?`, `incoterm?` (RFQ fields optional/conditional); both the existing client stub and the new server action consume the same export
- `getSiteBrand()` — already returns `waHref`; header WhatsApp CTA (D-05) is a straight consumer, no new data-fetching needed
- `ContactForm.tsx` — has an explicit honeypot insertion-point comment already written in; conditional RFQ-field rendering can key off `useSearchParams()` reading `product`

### Established Patterns
- Single CMS-sourced contact data via `SiteSettings` global + `getSiteBrand()` — any new contact-adjacent feature reads from here, never hardcodes
- `export const revalidate = 60` on all content routes (ISR) — any new route this phase adds (if a dedicated success/thank-you page is needed) should follow this
- Shared client/server zod schema pattern (contact-schema.ts) — the form-validation architecture this phase completes, not replaces

### Integration Points
- Product detail page (`/products/[slug]`) already emits the `?product=` query param on its RFQ CTA — Phase 4 is the consumer side
- `SiteSettings.contact` (email/phone/whatsapp) is the destination data for both the email-delivery target (sales inbox) and the WhatsApp `wa.me` links

</code_context>

<specifics>
## Specific Ideas

- Header WhatsApp CTA (D-05) should sit alongside the existing "Request a Quote" header link (per SESSION-HANDOFF §5: chrome "Request a Quote" → `/contact`) — planner should decide exact visual arrangement (UI-SPEC territory), not this document.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics*
*Context gathered: 2026-07-20*
