# Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics - Research

**Researched:** 2026-07-20
**Domain:** Server Action form handling, spam defense, transactional email deliverability, provider-agnostic analytics (Next.js 16 App Router)
**Confidence:** MEDIUM-HIGH (stack vendors are locked and well-documented; two genuinely deferred business decisions remain — see Assumptions Log)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `contactSchema` (`src/lib/contact-schema.ts`) gets an **optional** email field, plus a new **phone** field — visitor picks how to be reached (not forcing email).
- **D-02:** One shared form + one schema, not two routes. When `/contact?product=X` carries a product, RFQ-specific fields (`quantity`, `destinationCountry`, `incoterm`) render conditionally; without product context it's a plain general inquiry.
- **D-03:** Product identity in RFQ mode is a **read-only field auto-filled from the query param** (not a re-pickable dropdown) — trusts the catalog-linked CTA, no typo risk.
- **D-04:** `destinationCountry` is a **separate field** from the existing `country` field. `country` = visitor/company location, `destinationCountry` = RFQ shipping destination.
- **D-05:** Add a **persistent WhatsApp CTA to GlobalHeader** (desktop + mobile nav), using the existing `waHref` from `getSiteBrand()`. Rejected: floating action button, status-quo-only.
- **D-06:** Analytics stub uses **three distinct named events**: `rfq_submit`, `inquiry_submit`, `whatsapp_click` — snake_case, not a single generic event with a `type` property.

### Claude's Discretion
- **CRM webhook stub behavior:** no CRM vendor chosen (LEAD-05 is stub-only). Default: a single internal function that no-ops or POSTs to an env-gated placeholder URL if set; never blocks the actual email delivery path.
- **Spam defense specifics:** Cloudflare Turnstile + honeypot per STACK.md (locked). Widget mode, honeypot mechanics, and rate-limit strategy are implementation details resolved by this research (see Standard Stack, Common Pitfalls).
- **Analytics vendor (GA4+GTM vs Plausible):** still deferred per STACK.md ("decide Phase 4"). Event taxonomy (D-06) is provider-agnostic by design — build the event-firing layer behind a thin wrapper, wire the real provider script whenever the vendor is picked.
- **Email delivery:** Resend, per STACK.md (locked) — SPF/DKIM/DMARC on the sending domain is an LEAD-04 acceptance criterion, needs the user's domain + Resend account before this can go live.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEAD-01 | General inquiry form (name, company, country, message) | Shared `contactSchema` extension; Server Action pattern in Architecture Patterns; ContactForm.tsx already has all these fields client-side |
| LEAD-02 | Per-product RFQ form (product, quantity, destination country, incoterm, message) | D-02/D-03/D-04 field-mode design already locked in UI-SPEC; schema/server-action extension in Code Examples |
| LEAD-03 | Spam protection (honeypot + rate-limit + Turnstile) | Turnstile siteverify pattern, in-memory rate limiter pattern, honeypot server-side branch — all in Architecture Patterns + Code Examples |
| LEAD-04 | Transactional email via Resend, SPF/DKIM/DMARC configured | Resend Server Action integration + domain verification steps in Standard Stack / Common Pitfalls |
| LEAD-05 | CRM webhook stub, no rework later | Single internal `notifyCrm()` function pattern in Don't Hand-Roll / Code Examples |
| LEAD-06 | WhatsApp click-to-chat CTA prominent site-wide | D-05 already locked in UI-SPEC (header CTA); this research covers the shared analytics-wiring call site |
| LEAD-07 | RFQ/inquiry submissions + WhatsApp clicks as distinct named analytics events | Provider-agnostic `trackEvent()` wrapper pattern in Architecture Patterns / Code Examples |
| ANALY-01 | Web analytics installed tracking traffic + conversion events | Analytics vendor research in Standard Stack; flagged as a deferred business decision in Assumptions Log |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Stack is locked** — do not re-litigate Resend / Cloudflare Turnstile / `wa.me` / GA4-or-Plausible vendor choices (`.planning/STACK.md`).
- **No WordPress/WPML, no next-i18next, no reCAPTCHA-only spam defense, no MT for published copy, no Tailwind v3 physical-direction utilities.**
- **Do not make direct repo edits outside a GSD workflow** — this research feeds `/gsd-plan-phase`; execution happens via `/gsd-execute-phase`.
- **`contactSchema` and `ContactForm.tsx` are the single source of truth** for both client and server validation — the Server Action must import the SAME schema export, not fork it.
- **Contact-channel data (email/phone/whatsapp) always flows through `getSiteBrand()`** — never hardcode a number or address anywhere new.
- **RTL/logical-properties discipline applies to any new UI** (Turnstile widget container, consent banner, honeypot field) — already covered by 04-UI-SPEC.md, not re-derived here.

---

## Summary

This phase wires four pieces of already-scaffolded UI (`ContactForm.tsx`, `contactSchema`, product-page RFQ query param, `getSiteBrand()`) to a working backend: a Next.js Server Action that validates the shared Zod schema, runs three layers of spam defense (honeypot short-circuit, in-memory rate limit, Cloudflare Turnstile server-side `siteverify`), sends a transactional email via Resend (with `react-email` templates), fires an env-gated CRM webhook stub, and returns a typed result the client renders as success/error/rate-limit UI. A second, much smaller piece of work adds a persistent WhatsApp header CTA and a provider-agnostic `trackEvent()` wrapper that both the form's success path and the WhatsApp CTA call, so `rfq_submit` / `inquiry_submit` / `whatsapp_click` fire regardless of which analytics vendor eventually gets wired in.

Two things this research surfaces that materially change how the plan should be shaped: (1) **`@react-email/components` is deprecated as of April 2026** — the current React Email 6.x package consolidates everything into the single `react-email` package, so any plan or template code referencing `@react-email/components` is already stale; and (2) **Playwright cannot observe or intercept the server-side outbound calls this phase adds** (Resend, Turnstile `siteverify`, the CRM webhook) because they never touch the browser — e2e tests can only assert client-visible states (validation, honeypot silence, loading/success/error UI), while the actual spam-defense and delivery logic needs direct Vitest-level testing of the Server Action with mocked service clients (the same `vi.mock()` pattern already used in `tests/int/*.spec.ts`).

**Primary recommendation:** Build one Server Action (`submitContactForm`) that composes, in order: Zod validation → honeypot check (silent-success branch) → in-memory rate-limit check → Turnstile `siteverify` → `resend.emails.send()` → fire-and-forget `notifyCrm()` stub → return a discriminated-union result. Client fires `trackEvent("rfq_submit" | "inquiry_submit", ...)` only after a successful result. Ship the WhatsApp header CTA and its `trackEvent("whatsapp_click")` wiring as an independent, much smaller sub-plan since it has no server dependency.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Inquiry/RFQ form rendering, client-side Zod validation, honeypot field, Turnstile widget mount | Browser / Client | — | `ContactForm.tsx` is already a client component; Turnstile widget is inherently client-rendered script |
| Form submission handling (server-side Zod re-validation, honeypot branch, rate-limit, Turnstile `siteverify`) | API / Backend | Frontend Server (SSR) | A Next.js Server Action runs on the server tier even though it's colocated in the same Next.js app as SSR — never trust client-side validation alone |
| Transactional email delivery (Resend) | API / Backend | — | Must never be callable from the browser (API key secrecy); server-only |
| CRM webhook stub | API / Backend | — | Single internal function invoked from the Server Action, never client-exposed |
| Contact-channel source of truth (email/phone/whatsapp) | Database / Storage | API / Backend | Payload `SiteSettings` global (Postgres) → `getSiteBrand()` (server-side fetch, `cache()`d) → passed to Browser as props |
| WhatsApp click-to-chat CTA | Browser / Client | — | Plain `<a href="https://wa.me/...">`, zero backend involvement |
| Analytics event firing (`trackEvent` wrapper) | Browser / Client | — | GA4/GTM and Plausible are both client-side script/pixel integrations; the wrapper itself is a client module |
| Analytics vendor script mount (GTM container / Plausible script tag) | Browser / Client | Frontend Server (SSR, for `<script>` injection in root layout) | Script tag lives in the root layout (SSR-rendered), executes in the Browser |
| Rate-limit state | API / Backend | — | In-memory `Map` scoped to the Server Action's Node.js process (MVP choice, see Common Pitfalls for the scaling caveat) |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `resend` | 6.17.2 [VERIFIED: npm registry — `npm view resend version`] | Transactional email API client | Locked in STACK.md; official SDK, `resend.emails.send({ react: <Template/> })` is the documented Next.js pattern [CITED: resend.com/docs/send-with-nextjs] |
| `react-email` | 6.9.0 [VERIFIED: npm registry — `npm view react-email version`] | Email template components + `render()` | React Email 6.x consolidated `@react-email/components` and `@react-email/render` into this single package; `@react-email/components` is now marked `DEPRECATED ⚠️ - Package no longer supported` on the registry [VERIFIED: npm registry — `npm view @react-email/components deprecated`] |
| `@marsidev/react-turnstile` | 1.5.3 [VERIFIED: npm registry — `npm view @marsidev/react-turnstile version`] | React wrapper for the Cloudflare Turnstile widget | Locked in STACK.md as the recommended wrapper; exposes a `<Turnstile/>` component with ref methods (`reset()`, `getResponse()`, `execute()`) suited to react-hook-form integration [CITED: github.com/marsidev/react-turnstile] |
| `zod` | ^4.4.3 (already installed) | Shared client/server validation schema | Already the project's schema library (`contact-schema.ts`); this phase extends the existing schema, does not add a new one |
| `react-hook-form` + `@hookform/resolvers` | ^7.81.0 / ^5.4.0 (already installed) | Form state + Server Action submission | Already wired in `ContactForm.tsx`; this phase adds the `onSubmit` → Server Action call, no new dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `shadcn` `select` component | registry component, not versioned on npm | Incoterm dropdown (11-code closed enum) | Not yet installed in this project (`ls src/components/ui/` confirms only `form`, `input`, `textarea`, `label`, `button` exist) — run `npx shadcn@latest add select` |
| `@next/third-parties` (Google) | matches installed `next` version, 16.2.10 [VERIFIED: npm registry, first published 2023-10-17 — confirms an established official Next.js package despite a recent patch-version publish date] | `<GoogleTagManager/>` component + `sendGTMEvent()` | Only if GA4+GTM is the chosen analytics vendor (still deferred, see Assumptions Log) |
| `@upstash/ratelimit` + `@upstash/redis` | 2.0.8 / current [VERIFIED: npm registry, `@upstash/redis` first published pre-2023] | Shared/durable rate limiting | NOT needed for MVP launch traffic — documented here only as the upgrade path if in-memory rate limiting (see below) proves insufficient post-launch |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory `Map`-based rate limiter | Upstash Redis + `@upstash/ratelimit` via Vercel Marketplace "Upstash for Redis" integration | Durable/shared across serverless instances, but requires provisioning a Redis instance and env vars before this phase can ship — unjustified infra cost for a low-traffic B2B site at launch. **Note:** Vercel KV (the previously-recommended built-in option) was sunset and auto-migrated to Upstash in December 2024 — do not reference "Vercel KV" in new code, the current path is the Vercel Marketplace Upstash integration [CITED: vercel.com/changelog/upstash-joins-the-vercel-marketplace] |
| GA4 + GTM | Plausible | Cookieless, no consent banner needed, simpler; trades away GA4's segmentation depth and Google Ads attribution. Vendor choice is explicitly still deferred (STACK.md, CONTEXT.md) |
| `resend.emails.send({ react: <Template/> })` | `resend.emails.send({ html: render(<Template/>) })` using `render()` from `react-email` | The `react` prop path is documented as sometimes unreliable in certain bundler configurations; pre-rendering to an HTML string via `render()` is the documented fallback [CITED: aggregate WebSearch, multiple Resend/Next.js tutorials] |
| `@marsidev/react-turnstile` | Cloudflare's raw script snippet, no wrapper | Wrapper gives ref-based `reset()`/`getResponse()` for react-hook-form integration; raw snippet requires more manual DOM/script management for zero real benefit at this project's scale |

**Installation:**
```bash
npm install resend react-email @marsidev/react-turnstile
npx shadcn@latest add select
# Only if GA4+GTM is selected as the analytics vendor:
npm install @next/third-parties
```

**Version verification performed this session:**
```
npm view resend version                     -> 6.17.2   (first published 2017-02-25)
npm view react-email version                 -> 6.9.0    (React Email 6.x rewrite active since Aug 2022;
                                                             original 1.0.0 name registration from 2016 predates
                                                             the Resend-owned project — see Package Legitimacy Audit)
npm view @react-email/components deprecated   -> "Package no longer supported. Contact Support..."
npm view @marsidev/react-turnstile version    -> 1.5.3
npm view @upstash/ratelimit version           -> 2.0.8    (first published 2022-05-06)
npm view @next/third-parties version          -> 16.2.10  (first published 2023-10-17, tracks Next.js releases)
```

---

## Package Legitimacy Audit

The automated `package-legitimacy check` seam flagged five of seven candidate packages `SUS` on a `"too-new"` signal. Manual `npm view <pkg> time.created` verification (Step 2 of the protocol) shows this is a **systematic false positive**: the checker appears to compare the *latest published version's* timestamp (which is recent for any actively-maintained package) rather than the package's first-publish date. All five are long-established, extremely high-download, officially-maintained packages with legitimate source repos. One package (`@react-email/components`) is correctly flagged, but for a different, real reason: it is genuinely deprecated.

| Package | Registry | Age (first publish) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|----------------------|-----------|--------------|---------|-------------|
| `resend` | npm | 9 yrs (2017-02-25) | 8.26M/wk | github.com/resend/resend-node | SUS (`too-new`, false positive) | **Approved** — overridden with `npm view time.created` evidence |
| `react-email` | npm | ~4 yrs of active development under Resend (name registered 2016, project relaunched Aug 2022 as the React Email framework — see note below) | 3.02M/wk | github.com/resend/react-email | SUS (`too-new`, false positive) | **Approved** — overridden; `bin: email`, description, deps (`@react-email/render`) all consistent with the genuine project |
| `@react-email/components` | npm | 3 yrs | 4.39M/wk | github.com/resend/react-email | SUS (`deprecated`) | **REMOVED from recommendations** — genuinely deprecated April 2026; use `react-email` instead |
| `@react-email/render` | npm | 4 yrs (2022-09-22) | 9.23M/wk | github.com/resend/react-email | SUS (`too-new`, false positive) | **Approved as fallback only** (documented `render()` escape hatch); primary path is the `react-email` package which re-exports it |
| `@marsidev/react-turnstile` | npm | — | 1.80M/wk | github.com/marsidev/react-turnstile | OK | Approved |
| `@upstash/ratelimit` | npm | 4 yrs (2022-05-06) | 1.80M/wk | none listed in registry metadata (real repo: github.com/upstash/ratelimit-js) | SUS (`no-repository`, registry metadata gap) | **Approved, upgrade-path only** — not installed for MVP; flagged here only in case the planner later needs it |
| `@next/third-parties` | npm | 3 yrs (2023-10-17) | 2.29M/wk | github.com/vercel/next.js | SUS (`too-new`, false positive) | **Approved, conditional on GA4+GTM being the chosen vendor** |

**Postinstall script check (Step 3):** `npm view <pkg> scripts.postinstall` returned empty for all seven packages — no suspicious install-time scripts detected.

**Packages removed due to `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]` requiring a planner checkpoint:** none remain after manual override — all overrides are backed by direct `npm view` registry evidence (first-publish date, download volume, matching source repo), not assumption. The planner does **not** need to insert `checkpoint:human-verify` gates for package installation itself; the checkpoints this phase genuinely needs are for missing **credentials** (Resend domain/API key, Turnstile keys, analytics vendor decision) — see Environment Availability and Assumptions Log.

---

## Architecture Patterns

### System Architecture Diagram

```
 BROWSER                                    NEXT.JS SERVER (Vercel, fra1)
┌─────────────────────────┐                ┌──────────────────────────────────────────┐
│ ContactForm.tsx          │                │  submitContactForm Server Action           │
│  - react-hook-form        │                │                                            │
│  - contactSchema (client) │  POST (RSC)    │  1. Re-validate with contactSchema (Zod)   │
│  - honeypot field (hidden)│ ───────────────▶  2. honeypot filled? ──▶ YES: return        │
│  - Turnstile widget       │                │       success (fake) WITHOUT sending email │
│    (renders cf-turnstile- │                │  3. rate-limit check (in-memory Map,       │
│     response token)       │                │       keyed by IP) ──▶ exceeded: return     │
│                            │                │       rate-limit error                     │
│  onSubmit ─────────────────┘                │  4. Turnstile siteverify (server→Cloudflare│
│                                              │       API call, secret key)                │
│  trackEvent("rfq_submit" |                  │  5. resend.emails.send({ react: <Template│
│    "inquiry_submit") on success ◀───────────┤       from react-email }) → sales inbox   │
│                                              │  6. notifyCrm(payload) — fire-and-forget,  │
│  Result banner (success/error/rate-limit)   │       env-gated, never blocks step 5's     │
│                                              │       success response                     │
└─────────────────────────┘                │  7. return discriminated-union result       │
                                              └──────────────────────────────────────────┘
                                                          │                    │
                                                          ▼                    ▼
                                              ┌────────────────────┐  ┌──────────────────┐
                                              │ Resend API          │  │ Cloudflare        │
                                              │ (SPF/DKIM/DMARC      │  │ siteverify API    │
                                              │  verified domain)    │  │                    │
                                              └────────────────────┘  └──────────────────┘

 BROWSER (independent, no server dependency)
┌─────────────────────────┐
│ GlobalHeader / MobileNav │
│  WhatsApp CTA (D-05)      │
│  href = waHref (getSiteBrand, SSR-fetched from Payload SiteSettings)
│  onClick → trackEvent("whatsapp_click") → navigates to wa.me
└─────────────────────────┘

 trackEvent() wrapper (Browser, provider-agnostic)
   if (window.gtag/dataLayer mounted) → sendGTMEvent(name, props)
   else if (window.plausible mounted) → window.plausible(name, {props})
   else → no-op (dev/no-vendor-yet state), never throws
```

### Recommended Project Structure
```
src/
├── lib/
│   ├── contact-schema.ts        # extended: email?, phone, honeypot field, RFQ fields, turnstileToken
│   ├── contact-action.ts        # NEW: "use server" submitContactForm Server Action
│   ├── rate-limit.ts            # NEW: in-memory Map-based limiter, IP-keyed
│   ├── crm-webhook.ts           # NEW: notifyCrm() single internal function (stub)
│   └── analytics.ts             # NEW: trackEvent() provider-agnostic wrapper
├── emails/
│   └── LeadNotification.tsx     # NEW: react-email template for the sales-inbox notification
├── components/
│   ├── blocks/
│   │   └── ContactForm.tsx      # MODIFIED: wire onSubmit to submitContactForm, add RFQ fields,
│   │                            #   honeypot, Turnstile widget, loading/error/success cycle
│   ├── chrome/
│   │   ├── GlobalHeader.tsx     # MODIFIED: add WhatsApp CTA (D-05)
│   │   └── MobileNavPanel.tsx   # MODIFIED: add WhatsApp CTA (D-05)
│   └── icons/
│       └── WhatsAppIcon.tsx     # NEW: extracted shared component (UI-SPEC Component Inventory §1)
```

### Pattern 1: Server Action composing spam-defense layers in order
**What:** A single `"use server"` function that runs honeypot → rate-limit → Turnstile in that specific order, each a short-circuit.
**When to use:** Any public form that must reject spam cheaply before doing expensive work (Turnstile's network round-trip, sending an email).
**Why this order:** Honeypot is a free, synchronous check — reject fastest bots for $0 cost before touching the network. Rate-limit is a cheap in-memory lookup — reject before spending a Turnstile API call. Turnstile is the most expensive/slowest check (external API round-trip) — run it last, only for submissions that already passed the cheap filters.
```typescript
// src/lib/contact-action.ts
"use server";
import { headers } from "next/headers";
import { Resend } from "resend";
import { contactSchema } from "./contact-schema";
import { checkRateLimit } from "./rate-limit";
import { notifyCrm } from "./crm-webhook";
import { LeadNotification } from "@/emails/LeadNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SubmitResult =
  | { status: "success" }
  | { status: "error"; message: "network" | "rate-limited" };

export async function submitContactForm(
  raw: unknown
): Promise<SubmitResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: "network" };
  const data = parsed.data;

  // Honeypot: decoy field `companyWebsite` must stay empty for real users.
  // Never reveal detection — always return success to the caller.
  if (data.companyWebsite) return { status: "success" };

  // headers() is async since Next.js 15 — must be awaited.
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkRateLimit(ip)) {
    return { status: "error", message: "rate-limited" };
  }

  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: data.turnstileToken,
        remoteip: ip,
      }),
    }
  ).then((r) => r.json());
  if (!verify.success) return { status: "error", message: "network" };

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_ADDRESS!, // e.g. "leads@mail.staragrevolution.com"
      to: process.env.SALES_INBOX_ADDRESS!,
      subject: data.product ? `New RFQ: ${data.productName ?? data.product}` : "New inquiry",
      react: LeadNotification(data),
    });
  } catch {
    return { status: "error", message: "network" };
  }

  // Fire-and-forget: a CRM outage must never fail a delivered lead.
  void notifyCrm(data);

  return { status: "success" };
}
```

### Pattern 2: In-memory rate limiter (MVP-appropriate, documented limitation)
**What:** A module-scoped `Map<string, { count: number; resetAt: number }>` keyed by client IP.
**When to use:** Low-traffic single-region deployments where a best-effort throttle is acceptable as one of three spam-defense layers (not the only layer).
```typescript
// src/lib/rate-limit.ts
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}
```
**Documented limitation** [CITED: aggregate WebSearch on Next.js Server Action rate limiting]: this `Map` lives in the memory of a single serverless function instance. On Vercel, concurrent invocations may spin up multiple instances, each with its own empty `Map` — so this is a best-effort throttle, not a hard guarantee, at real scale. It is a deliberate MVP tradeoff (no Redis provisioned yet) layered under honeypot + Turnstile, not the sole spam defense. Document the upgrade path (Upstash Redis + `@upstash/ratelimit` via the Vercel Marketplace integration) as a follow-up, not an MVP blocker.

### Pattern 3: CRM webhook stub — one internal function, never blocks the real send
**What:** A single function all future CRM integration work replaces internals of, without touching the Server Action's call site.
```typescript
// src/lib/crm-webhook.ts
export async function notifyCrm(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return; // no-op until a real CRM is wired
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Swallow errors — a CRM outage must never surface as a lead-submission
    // failure to the visitor. Consider logging to an observability tool later.
  }
}
```

### Pattern 4: Provider-agnostic analytics wrapper
**What:** One `trackEvent()` function every call site imports; internals swap when the vendor decision lands.
```typescript
// src/lib/analytics.ts
"use client";

type EventName = "rfq_submit" | "inquiry_submit" | "whatsapp_click";

export function trackEvent(name: EventName, params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  // GA4 + GTM path (if chosen):
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({ event: name, ...params });
    return;
  }
  // Plausible path (if chosen):
  if (typeof window.plausible === "function") {
    window.plausible(name, { props: params });
    return;
  }
  // No vendor mounted yet (dev, or vendor decision still pending) — no-op.
}
```
Call sites (`ContactForm.tsx` on successful submit result, WhatsApp CTA `onClick`) import this same function — never call `gtag`/`dataLayer.push`/`window.plausible` directly, which would defeat the vendor-agnostic point of D-06.

### Anti-Patterns to Avoid
- **Trusting the Turnstile token without a server-side `siteverify` call:** the token's mere presence in the submitted form proves nothing — it must be POSTed to Cloudflare's `siteverify` endpoint from the server and its `success` field checked.
- **Revealing honeypot detection to the sender:** returning a distinct "spam detected" error trains bots to iterate; always return the same success response (per Copywriting Contract, already locked in UI-SPEC).
- **Awaiting the CRM webhook before returning success to the user:** couples lead-delivery UX to CRM uptime that doesn't exist yet; fire-and-forget with a timeout.
- **Calling `gtag`/`window.plausible` directly at call sites:** bypasses the whole point of the `trackEvent()` abstraction (LEAD-07/D-06's provider-agnostic requirement).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CAPTCHA / bot challenge | A custom puzzle/challenge widget | Cloudflare Turnstile (locked, `@marsidev/react-turnstile`) | Turnstile is free, privacy-friendly, and handles the hard problem (device fingerprinting, proof-of-work challenges) that a hand-rolled widget cannot replicate safely |
| Email template rendering to HTML | Manual string-concatenation HTML email templates | `react-email` (JSX components + `render()`) | Email HTML has decades of client-rendering quirks (Outlook, Gmail clipping, etc.); React Email's components already handle table-based layout fallbacks |
| SPF/DKIM/DMARC signing | Custom mail-server DNS/crypto setup | Resend's built-in domain verification flow (generates the exact DNS records to add) | Email authentication cryptography is a well-known hard-to-get-right domain; Resend generates correct DKIM key pairs automatically |
| Durable rate limiting at scale | A hand-rolled distributed counter over a database | `@upstash/ratelimit` + Upstash Redis (only if/when traffic justifies it) | Sliding-window/token-bucket algorithms with correct concurrency semantics are a solved problem; don't re-derive them for a launch-scale B2B site |

**Key insight:** every "don't hand-roll" item here has a locked or already-evaluated off-the-shelf answer — the actual engineering work this phase requires is *composition* (wiring these pieces together in the right order behind one Server Action), not building any of them from scratch.

---

## Common Pitfalls

### Pitfall 1: `@react-email/components` import path is dead
**What goes wrong:** Copying an older tutorial's `import { Button, Html } from "@react-email/components"` produces a deprecated-package warning and, per the registry's own deprecation notice, "no longer supported" — future security patches will not land there.
**Why it happens:** React Email consolidated its package structure in the 6.x line (April 2026); most tutorials predate this.
**How to avoid:** `import { Button, Html, render } from "react-email"` — the single current package.
**Warning signs:** `npm install` warns `deprecated @react-email/components@X.X.X: Package no longer supported`.

### Pitfall 2: Turnstile token trusted client-side only
**What goes wrong:** A bot bypasses the widget's UI entirely (headless browser, direct POST) and the form "succeeds" because no server-side check ever ran.
**Why it happens:** It's tempting to treat "the widget rendered a token" as sufficient — it is not; the token must be independently verified against Cloudflare's `siteverify` API using the *secret* key, server-side, per submission.
**How to avoid:** Server Action calls `https://challenges.cloudflare.com/turnstile/v0/siteverify` before proceeding to send email; reject if `success !== true`.
**Warning signs:** Spam volume in the sales inbox despite the widget being present in the UI.

### Pitfall 3: DMARC not configured even though SPF/DKIM pass
**What goes wrong:** LEAD-04's acceptance criterion explicitly names SPF **and** DKIM **and** DMARC, but Resend's domain-verification flow only auto-generates SPF and DKIM records — DMARC is a separate TXT record the domain owner must add independently.
**Why it happens:** Resend's own dashboard UX emphasizes the two records it auto-generates; DMARC is easy to skip because nothing in the Resend flow blocks on it.
**How to avoid:** After Resend domain verification succeeds, add a `_dmarc.<domain>` TXT record: `v=DMARC1; p=none; rua=mailto:<reports-address>` as a starting (monitor-only) policy — tightened to `quarantine`/`reject` later once confident no legitimate mail is being misclassified.
**Warning signs:** `dmarcian.com`/`mxtoolbox.com` DMARC lookup returns "no record found" even after SPF/DKIM show green.

### Pitfall 4: Sending from the root/primary company domain
**What goes wrong:** Using `sales@staragrevolution.com` directly as the Resend `from` address ties transactional-email sending reputation to the primary domain; a deliverability problem (spam-flagged bulk send) can start affecting the whole company's email reputation, including regular staff email if hosted elsewhere.
**Why it happens:** It's the intuitive first choice; the tradeoff isn't obvious until deliverability issues appear.
**How to avoid:** Send from a dedicated subdomain (e.g., `leads@mail.staragrevolution.com` or `updates.staragrevolution.com`) — isolates sending reputation, still authenticated via the same domain's SPF/DKIM/DMARC chain. [CITED: aggregate WebSearch, Resend deliverability guidance — this is common industry practice, verify against Resend's current onboarding flow when the account is created]
**Warning signs:** N/A pre-launch — a proactive choice, not a detectable bug.

### Pitfall 5: `headers()` called synchronously
**What goes wrong:** `headers()` (and `cookies()`, `draftMode()`, route `params`) became **asynchronous** starting Next.js 15 — calling `headers().get(...)` without `await` throws or silently returns a Promise depending on dev/prod mode. This project is on Next.js 16.2.x, well past this breaking change.
**Why it happens:** Copy-pasted pre-Next-15 code (`const ip = headers().get("x-forwarded-for")`) is extremely common in older tutorials and even in current search results.
**How to avoid:** `const headersList = await headers();` inside the Server Action before using it for the rate-limiter's IP key or Turnstile's `remoteip`.
**Warning signs:** Next.js dev-mode console warning: "sync-dynamic-apis" / runtime error about accessing Request information synchronously. [CITED: nextjs.org/docs/app/guides/upgrading/version-15]

### Pitfall 6: Playwright cannot test the server-side integration paths
**What goes wrong:** Attempting to write e2e Playwright tests that assert "the email was sent" or "Turnstile verification happened" — these are server-to-third-party HTTP calls invisible to the browser's network stack that Playwright instruments. `page.route()` only intercepts requests the *browser* makes; the Server Action's outbound `fetch()` to Resend/Cloudflare/the CRM webhook runs entirely in the Node.js process and is unobservable from the browser context.
**Why it happens:** Server Actions look like a normal form submit from the browser's perspective (one POST to the current route), hiding the fan-out of server-side calls that happens after.
**How to avoid:** Test the Server Action's logic directly with Vitest, mocking `resend`, the Turnstile `fetch` call, and `notifyCrm`'s `fetch` — exactly the `vi.mock()` pattern already used in `tests/int/pages-revalidate-hook.spec.ts`. Reserve Playwright for what the browser actually observes: client-side validation errors, honeypot's invisible-to-users behavior, loading/success/error banner rendering (using a mocked/stubbed Server Action response), and the RFQ-mode field rendering from the `?product=` query param.
**Warning signs:** An e2e test file trying to assert against a real inbox or a real Cloudflare response — a design smell that the test belongs in Vitest instead.

### Pitfall 7: Consent banner shipped conditionally but analytics vendor still undecided
**What goes wrong:** 04-UI-SPEC.md already specs the consent banner as conditional on "if GA4+GTM is chosen" — if the plan ships GA4+GTM without confirming this is genuinely the business's choice (STACK.md frames it as a default, not a final decision), the team may end up needing to retrofit Plausible later, discarding the consent-banner work.
**Why it happens:** STACK.md's "decide Phase 4" language and CONTEXT.md's "still deferred" framing mean this is a real open decision, not solely a technical one (it has legal/GDPR and reporting-stakeholder implications).
**How to avoid:** Surface this explicitly as a `checkpoint:human-verify` early in the plan, before building either the vendor script mount or the consent banner — the `trackEvent()` wrapper itself is vendor-agnostic and can be built either way, but the vendor-specific script/banner work should wait for confirmation.
**Warning signs:** N/A — a planning-stage decision point, not a detectable bug.

---

## Code Examples

### Extended `contactSchema` (D-01, D-02, D-04, honeypot, Turnstile token)
```typescript
// src/lib/contact-schema.ts
import { z } from "zod";

export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    company: z.string().trim().min(1, "Company is required."),
    country: z.string().trim().min(1, "Country is required."),
    email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(20, "Please tell us a bit more (at least 20 characters).")
      .max(2000),
    // RFQ-mode fields — optional at the schema level; presence is driven by
    // the `?product=` query param on the client, not by the schema itself.
    product: z.string().trim().optional(),
    productName: z.string().trim().optional(),
    quantity: z.string().trim().max(200).optional(),
    destinationCountry: z.string().trim().optional(),
    incoterm: z.string().trim().optional(),
    // Honeypot decoy — real users never see or fill this field.
    companyWebsite: z.string().trim().max(0, "").optional().or(z.literal("")),
    // Cloudflare Turnstile token — required for the server-side siteverify step.
    turnstileToken: z.string().min(1, "Verification failed. Please try again."),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Please provide an email or phone number so we can reach you.",
    path: ["phone"],
  });

export type ContactFormValues = z.infer<typeof contactSchema>;
```

### Client wiring (ContactForm.tsx onSubmit — replaces the D-07 stub)
```typescript
// src/components/blocks/ContactForm.tsx (excerpt)
async function onSubmit(values: ContactFormValues) {
  setStatus("loading");
  const result = await submitContactForm(values);
  if (result.status === "success") {
    setStatus("success");
    trackEvent(values.product ? "rfq_submit" : "inquiry_submit", {
      product: values.product ?? "",
    });
  } else if (result.message === "rate-limited") {
    setStatus("rate-limited");
  } else {
    setStatus("error");
  }
}
```

### Resend email send with `react-email` (current API, not the deprecated path)
```typescript
// src/emails/LeadNotification.tsx
import { Html, Head, Body, Container, Heading, Text } from "react-email";

export function LeadNotification(data: {
  name: string; company: string; country: string; message: string;
  product?: string; productName?: string; quantity?: string;
  destinationCountry?: string; incoterm?: string;
}) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>{data.product ? `New RFQ: ${data.productName}` : "New inquiry"}</Heading>
          <Text>From: {data.name} ({data.company}, {data.country})</Text>
          {data.product && (
            <Text>
              Quantity: {data.quantity} · Destination: {data.destinationCountry} · Incoterm: {data.incoterm}
            </Text>
          )}
          <Text>{data.message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `@react-email/components` as the primary import | Single `react-email` package (re-exports render + all components) | React Email 6.x, April 2026 | Any plan/code referencing the old package path needs the new import; `npm install` will show a deprecation warning otherwise |
| Vercel KV for serverless key-value/rate-limit state | Vercel Marketplace "Upstash for Redis" integration | Vercel KV sunset, auto-migrated December 2024 | Not relevant for this phase's MVP scope (in-memory limiter is the recommendation), but relevant if the upgrade path is ever taken — don't provision "Vercel KV," it no longer exists as a product |
| `headers()`/`cookies()` called synchronously | Both are `async` — must `await` | Next.js 15 (this project is on 16.2.x, well past the change) | Any IP-extraction or cookie-reading code in the new Server Action must `await headers()` |

**Deprecated/outdated:**
- `@react-email/components`: superseded by the unified `react-email` package (see above).
- "Vercel KV": product no longer exists under that name; use Upstash via the Vercel Marketplace if durable rate-limit storage is ever needed.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Analytics vendor defaults to GA4+GTM per STACK.md's "default expectation" framing, pending explicit business confirmation | Standard Stack, Common Pitfalls (Pitfall 7) | If the business actually wants Plausible, the consent-banner UI work (already speced conditionally in 04-UI-SPEC.md) would be unnecessary work, and the `@next/third-parties` install would be wrong — mitigated by treating this as an explicit `checkpoint:human-verify` gate before vendor-specific script/banner work begins |
| A2 | Recommended sending subdomain pattern (e.g., `mail.staragrevolution.com`) for Resend `from` address | Common Pitfalls (Pitfall 4) | Based on aggregate WebSearch/industry-common-practice, not a direct fetch of Resend's current onboarding-flow copy for this specific account — verify against Resend's dashboard guidance once the account/domain is actually being verified |
| A3 | DMARC starting policy recommendation (`p=none` with `rua` reporting, tightened later) | Common Pitfalls (Pitfall 3) | Standard, low-risk staged-rollout DMARC practice, but the business/IT contact who owns DNS should confirm before any `p=reject` tightening — a too-aggressive policy set incorrectly could bounce legitimate mail |
| A4 | Rate-limit thresholds (3 submissions / 60s window) in the Code Examples | Architecture Patterns Pattern 2 | Arbitrary starting values, not derived from real traffic data (site hasn't launched) — flag as tunable, not fixed, once real submission patterns are observed |

**If this table is empty:** N/A — see rows above. All other claims in this research (package versions, deprecation status, Next.js async-API change, Vercel KV sunset) were verified via `npm view`, the npm registry's own deprecation metadata, or Next.js's official upgrade-guide docs this session.

---

## Open Questions (RESOLVED)

1. **(RESOLVED) Which analytics vendor — GA4+GTM or Plausible?**
   - What we know: STACK.md frames GA4+GTM as the "default expectation" for a B2B team, with Plausible as the simplicity/no-consent-banner alternative; CONTEXT.md confirms this is still genuinely deferred to Phase 4.
   - What's unclear: Whether the business has a preference (e.g., an existing Google Ads account that would make GA4 valuable for attribution) not captured in any planning doc so far.
   - Recommendation: Insert a `checkpoint:human-verify` early in the plan asking this question directly; build the `trackEvent()` wrapper (vendor-agnostic) regardless of the answer so no work is wasted either way.
   - **Resolution:** Implemented as a blocking `checkpoint:decision` in 04-05-PLAN.md Task 1 — the vendor-agnostic `trackEvent()` wrapper ships regardless, real vendor script wires in once answered.

2. **(RESOLVED) Resend sending domain and DNS ownership**
   - What we know: LEAD-04 requires SPF/DKIM/DMARC configured; this needs a real domain the user controls DNS for (likely `staragrevolution.com`, currently a parked Squarespace holding page per STACK.md benchmark notes).
   - What's unclear: Whether the user has Resend account access and DNS access ready at plan-execution time, or whether this needs to be scheduled as a pre-launch task separate from code delivery.
   - Recommendation: Structure the plan so the Server Action code ships and is testable via Vitest mocks independent of live Resend credentials being present; gate the *live* domain-verification DNS work behind an explicit `checkpoint:human-verify` (already flagged in `.planning/SESSION-HANDOFF.md` §8 as a pending human action).
   - **Resolution:** Server Action ships mock-testable per plan; live DNS verification captured as a backstop truth (04-02-PLAN.md) plus a Manual-Only Verification row in 04-VALIDATION.md — not a blocker to code delivery.

3. **(RESOLVED) CRM vendor and webhook payload shape**
   - What we know: LEAD-05 only requires a stub; `.planning/STATE.md` blockers section confirms CRM vendor (HubSpot/Zoho/Pipedrive) is still TBD with the business.
   - What's unclear: The eventual payload shape a real CRM integration would need (field names, required vs optional).
   - Recommendation: Keep `notifyCrm()`'s payload as the raw validated form data (already a stable shape via `contactSchema`) — this is a reasonable default a future CRM adapter can reshape, not a decision that needs to block this phase.
   - **Resolution:** Stated as an explicit non-blocking default policy in 04-02-PLAN.md — `notifyCrm()` ships as a no-op when `CRM_WEBHOOK_URL` is unset, real vendor wiring is future work.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `RESEND_API_KEY` env var | LEAD-04 email delivery | ✗ (not inspectable this session — `.env*` files are outside this agent's read permissions; SESSION-HANDOFF §8 confirms "needs the user's domain + Resend account" is still pending) | — | Server Action must fail gracefully (return `{status:"error", message:"network"}`) rather than throw/crash if unset, so local dev/CI doesn't hard-block on a missing secret |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | LEAD-03 spam defense | ✗ (same reasoning as above) | — | Same graceful-failure requirement; consider a dev-mode bypass flag so local development isn't blocked waiting on real Cloudflare keys |
| `CRM_WEBHOOK_URL` env var | LEAD-05 stub | ✗ (expected — stub is explicitly env-gated and no-ops when unset) | — | Already the designed fallback — `notifyCrm()` no-ops when the var is absent, this is not a blocker |
| Resend domain DNS verification (SPF/DKIM/DMARC) | LEAD-04 acceptance criterion | ✗ (requires live DNS access to the target domain, outside this agent's tooling) | — | No code fallback — this is a manual, human-gated pre-launch task; code should not assume it's done |
| Analytics vendor script/keys (GTM container ID or Plausible domain) | ANALY-01 | ✗ (vendor itself still undecided, see Open Questions #1) | — | `trackEvent()` wrapper no-ops safely when no vendor script is mounted (dev/pre-decision state) |

**Missing dependencies with no fallback:**
- Live Resend domain DNS verification (SPF/DKIM/DMARC) — cannot be automated by this agent; requires human DNS access and is explicitly a pending item per `.planning/SESSION-HANDOFF.md`.

**Missing dependencies with fallback:**
- `RESEND_API_KEY`, Turnstile keys, `CRM_WEBHOOK_URL`, analytics vendor keys — all designed to fail gracefully / no-op when absent, so code can be built and unit-tested before the human-owned credential-provisioning steps complete.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 (unit/integration, `tests/int/**`) + Playwright 1.61.1 (e2e, `tests/e2e/**`) — both already configured |
| Config file | `vitest.config.ts` (int project, isolated SQLite test DB), `playwright.config.ts` |
| Quick run command | `npx vitest run tests/int/contact-action.spec.ts` |
| Full suite command | `npm run test && npm run test:e2e` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAD-01 | General inquiry submits successfully, email send called with correct payload | unit (Vitest, `vi.mock("resend")`) | `npx vitest run tests/unit/contact-action.spec.ts -t "inquiry"` | ❌ Wave 0 |
| LEAD-02 | RFQ-mode submission includes product/quantity/destinationCountry/incoterm in the sent email payload | unit (Vitest) | `npx vitest run tests/unit/contact-action.spec.ts -t "rfq"` | ❌ Wave 0 |
| LEAD-02 | `?product=`/`productName=` query params render the RFQ field group and read-only banner | e2e (Playwright) | `npx playwright test tests/e2e/contact-rfq-mode.spec.ts` | ❌ Wave 0 |
| LEAD-03 | Honeypot-filled submission returns success but Resend is NOT called | unit (Vitest, assert mock not called) | `npx vitest run tests/unit/contact-action.spec.ts -t "honeypot"` | ❌ Wave 0 |
| LEAD-03 | Rapid-fire submissions beyond the rate-limit threshold are rejected | unit (Vitest, call the action N+1 times) | `npx vitest run tests/unit/rate-limit.spec.ts` | ❌ Wave 0 |
| LEAD-03 | Turnstile `siteverify` failure blocks the send | unit (Vitest, mock `fetch` to return `success: false`) | `npx vitest run tests/unit/contact-action.spec.ts -t "turnstile"` | ❌ Wave 0 |
| LEAD-04 | Email send failure surfaces the destructive error banner, form retains values | e2e (Playwright, intercept the Server Action's browser-visible POST and force a 500-equivalent) | `npx playwright test tests/e2e/contact-error-state.spec.ts` | ❌ Wave 0 |
| LEAD-05 | CRM webhook is called with the validated payload when `CRM_WEBHOOK_URL` is set; is skipped (no-op, no throw) when unset | unit (Vitest, `vi.mock` global `fetch`) | `npx vitest run tests/unit/crm-webhook.spec.ts` | ❌ Wave 0 |
| LEAD-06 | Header WhatsApp CTA renders with correct `href`/`aria-label` on desktop and in the mobile sheet | e2e (Playwright) | `npx playwright test tests/e2e/whatsapp-header-cta.spec.ts` | ❌ Wave 0 |
| LEAD-07 | `rfq_submit`/`inquiry_submit`/`whatsapp_click` fire with the correct event name | unit (Vitest, mock `window.dataLayer`/`window.plausible`, call `trackEvent` directly) | `npx vitest run tests/unit/analytics.spec.ts` | ❌ Wave 0 |
| ANALY-01 | Analytics wrapper no-ops safely with no vendor mounted (doesn't throw) | unit (Vitest) | `npx vitest run tests/unit/analytics.spec.ts -t "no-op"` | ❌ Wave 0 |

**Note per Pitfall 6:** LEAD-04's actual Resend delivery success path and LEAD-03's actual Turnstile success path cannot be meaningfully e2e-tested via Playwright without real (or sandboxed) third-party credentials, since those calls never touch the browser. The unit-level Vitest coverage above (mocking `resend`, mocking the `siteverify` `fetch`) is the correct test boundary — Playwright coverage should be restricted to client-observable states only (see the e2e rows above, which test rendering/UI states, not third-party call success).

### Sampling Rate
- **Per task commit:** `npx vitest run tests/unit/<changed-file>.spec.ts` (fast, targeted)
- **Per wave merge:** `npm run test` (full Vitest suite, both `int` and any new `unit` project) + `npm run test:e2e` (full Playwright suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` needs a new `unit` test project (or extend `int`) covering `tests/unit/**/*.spec.ts` for the new Server-Action-adjacent modules that don't need the SQLite test DB (`contact-action.spec.ts`, `rate-limit.spec.ts`, `crm-webhook.spec.ts`, `analytics.spec.ts`) — currently `vitest.config.ts` only defines the `int` project scoped to `tests/int/**`.
- [ ] `tests/unit/` directory does not exist yet.
- [ ] `tests/e2e/contact.spec.ts` currently asserts "empty submit ... issues NO navigation/network" (D-07 stub behavior) — this assertion becomes **false** once the Server Action is wired; this existing test needs updating as part of this phase's Wave 0 or first wave, not left to silently pass on stale assumptions.
- [ ] `tests/e2e/contact.spec.ts` also asserts the WhatsApp link's accessible name via `t("whatsappAria")` = "Message us on WhatsApp" — this string changes to "Chat on WhatsApp" per the UI-SPEC Copywriting Contract; the test's locator needs updating alongside the message-catalog change.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No user accounts in this phase (PROJECT.md: no buyer login in v1) |
| V3 Session Management | No | Stateless public form, no session created |
| V4 Access Control | No | Public form, no authorization boundary |
| V5 Input Validation | Yes | Zod schema (`contactSchema`) re-validated server-side inside the Server Action — never trust client-only validation, per Anti-Patterns above |
| V6 Cryptography | Partial | Resend/Cloudflare handle TLS and DKIM signing internally; this phase does not hand-roll any cryptographic primitive — correctly deferred to the vendor SDKs |
| V11 (Business Logic — spam/abuse) | Yes | Three-layer defense: honeypot (bot heuristic) + in-memory rate limit (abuse throttle) + Turnstile `siteverify` (proof-of-work/device-trust challenge, verified server-side) |
| V12 (File/Resource) | No | No file upload in this phase's scope |
| V13 (API/Server Action security) | Yes | Server Action must never trust a Turnstile token's mere presence (server-side `siteverify` mandatory); secret keys (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CRM_WEBHOOK_URL`) must stay server-only env vars, never `NEXT_PUBLIC_`-prefixed |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Automated spam/bot form flooding | Denial of Service / Repudiation (fake leads pollute the sales pipeline) | Honeypot + rate-limit + Turnstile `siteverify`, composed in that order (Architecture Patterns Pattern 1) |
| Turnstile token replay | Spoofing | Turnstile tokens are single-use and expire after ~300 seconds [CITED: aggregate WebSearch on Turnstile token lifecycle]; Cloudflare's `siteverify` endpoint invalidates a token after first successful verification |
| Email header injection via unsanitized form fields (`from`/`subject`/`to` built from user input) | Tampering | Never interpolate user-controlled `name`/`company`/`message` values into the `from` or `to` fields of `resend.emails.send()` — only the `subject` line safely includes user data (Resend's SDK handles header encoding, but the `from`/`to` addresses must always be fixed, server-controlled constants, never derived from form input) |
| Secret key exposure via client bundle | Information Disclosure | `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `CRM_WEBHOOK_URL` must never carry the `NEXT_PUBLIC_` prefix; only the Turnstile *site* key (public by design) uses that prefix |
| CRM webhook SSRF-adjacent risk (env-controlled outbound URL) | Tampering / Elevation of Privilege | `CRM_WEBHOOK_URL` is a deploy-time env var set by the project owner, not user-controlled input — low risk in this phase's stub form, but worth noting for whoever wires a real CRM later: never let the webhook target URL be influenced by request data |

---

## Sources

### Primary (HIGH confidence)
- npm registry direct queries this session (`npm view resend|react-email|@react-email/components|@marsidev/react-turnstile|@upstash/ratelimit|@upstash/redis|@next/third-parties version|time.created|deprecated|scripts.postinstall`) — package versions, first-publish dates, deprecation status — [VERIFIED: npm registry]
- `gsd-tools query package-legitimacy check` output, cross-checked against direct `npm view` evidence — [VERIFIED]
- nextjs.org/docs/app/guides/upgrading/version-15 — `headers()`/`cookies()`/`params` async breaking change — [CITED]
- Direct codebase reads: `src/lib/contact-schema.ts`, `src/components/blocks/ContactForm.tsx`, `src/components/blocks/ContactBlockView.tsx`, `src/lib/payload-fetch.ts`, `src/components/chrome/GlobalHeader.tsx`, `tests/e2e/contact.spec.ts`, `tests/int/pages-revalidate-hook.spec.ts`, `vitest.config.ts`, `components.json`, `package.json`, `src/i18n/messages/en.json` — [VERIFIED: direct file reads this session]

### Secondary (MEDIUM confidence)
- WebSearch aggregate: Resend + Next.js Server Action integration pattern (resend.com/nextjs, resend.com/docs/send-with-nextjs, multiple 2026 tutorials) — [CITED, WebSearch aggregate]
- WebSearch aggregate: Resend domain verification / SPF / DKIM / DMARC setup (dmarcdkim.com, resend.com/docs/knowledge-base, dmarc.wiki/resend) — [CITED, WebSearch aggregate]
- WebSearch aggregate: React Email 6.x consolidation / `@react-email/components` deprecation (resend.com/blog/react-email-6, react.email/docs/changelog) — [CITED, WebSearch aggregate; corroborated directly by `npm view @react-email/components deprecated`]
- WebSearch aggregate: Cloudflare Turnstile React/Next.js integration + server-side `siteverify` requirement (developers.cloudflare.com/turnstile, multiple integration tutorials) — [CITED, WebSearch aggregate]
- WebSearch aggregate: in-memory Next.js Server Action rate limiting, single-instance limitation — [CITED, WebSearch aggregate]
- WebSearch aggregate: Vercel KV sunset / Upstash Marketplace migration (vercel.com/changelog/upstash-joins-the-vercel-marketplace, Vercel community threads) — [CITED, WebSearch aggregate]
- WebSearch aggregate: GA4+GTM (`@next/third-parties`, `sendGTMEvent`) vs Plausible event-tracking patterns — [CITED, WebSearch aggregate]

### Tertiary (LOW confidence)
- Resend sending-subdomain deliverability recommendation (Pitfall 4, Assumption A2) — general industry practice inferred from aggregate search, not a direct fetch of Resend's current account-onboarding copy — flagged in Assumptions Log, verify at account-setup time.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions and deprecation statuses directly verified via `npm view` this session, not training-data recall
- Architecture: MEDIUM-HIGH — Server Action composition pattern is standard Next.js practice, cross-checked against multiple current tutorials; the specific ordering (honeypot → rate-limit → Turnstile) is this research's own reasoned recommendation, not a single authoritative source
- Pitfalls: HIGH — Pitfall 1 (deprecation) and Pitfall 5 (async headers) are directly verified against registry metadata and official Next.js docs; Pitfall 6 (Playwright/server-boundary) is derived from direct inspection of this project's own test files and general Playwright architecture, not a vendor claim that could be stale

**Research date:** 2026-07-20
**Valid until:** 2026-08-19 (30 days — email/spam-defense vendor APIs are relatively stable, but the React Email 6.x deprecation timing and Vercel Marketplace product structure are fast-moving enough to warrant re-verification if planning is delayed)
