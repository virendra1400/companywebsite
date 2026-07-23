# Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics - Pattern Map

**Mapped:** 2026-07-20
**Files analyzed:** 13 (new + modified)
**Analogs found:** 11 / 13

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/contact-schema.ts` (MODIFIED) | model/validation | request-response | itself (existing file, extend in place) | exact |
| `src/lib/contact-action.ts` (NEW) | service (Server Action) | request-response | `src/hooks/revalidatePage.ts` (single-purpose server function composing steps) + RESEARCH Pattern 1 | role-match |
| `src/lib/rate-limit.ts` (NEW) | utility | transform | none in codebase (RESEARCH Pattern 2 is the source) | no analog |
| `src/lib/crm-webhook.ts` (NEW) | service | event-driven (fire-and-forget) | `src/hooks/revalidatePage.ts` (single internal function, env/context gated side-effect) | partial |
| `src/lib/analytics.ts` (NEW) | utility (client) | event-driven | none in codebase | no analog |
| `src/emails/LeadNotification.tsx` (NEW) | component (email template) | transform | `src/components/blocks/ContactBlockView.tsx` (server component composing labeled data rows) | partial |
| `src/components/blocks/ContactForm.tsx` (MODIFIED) | component (client form) | request-response | itself (existing file, wire onSubmit to Server Action) | exact |
| `src/components/chrome/GlobalHeader.tsx` (MODIFIED) | component | request-response | itself (existing file, add WhatsApp CTA) | exact |
| `src/components/chrome/MobileNavPanel.tsx` (MODIFIED) | component | request-response | itself (existing file, add WhatsApp CTA) | exact |
| `src/components/icons/WhatsAppIcon.tsx` (NEW, extracted) | component | transform | inline `WhatsAppIcon` in `src/components/blocks/ContactBlockView.tsx` (lines 13-19) | exact |
| `tests/unit/contact-action.spec.ts` (NEW) | test | request-response | `tests/int/pages-revalidate-hook.spec.ts` (vi.mock hoisted before dynamic import) | role-match |
| `tests/unit/rate-limit.spec.ts` (NEW) | test | transform | `tests/int/pages-revalidate-hook.spec.ts` (Vitest describe/it structure) | partial |
| `tests/e2e/contact.spec.ts` (MODIFIED) | test | request-response | itself (existing file — assertions must be updated, see Shared Patterns) | exact |

## Pattern Assignments

### `src/lib/contact-schema.ts` (model, request-response) — MODIFY IN PLACE

**Analog:** itself, current state

**Full current file** (`src/lib/contact-schema.ts` lines 1-25):
```typescript
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  company: z.string().trim().min(1, "Company is required."),
  country: z.string().trim().min(1, "Country is required."),
  message: z
    .string()
    .trim()
    .min(20, "Please tell us a bit more (at least 20 characters).")
    .max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
```

**Extension pattern (D-01/D-02/D-04 + honeypot/turnstile):** keep the same `z.object({...}).refine(...)` shape, single static export (comment at lines 3-9 explicitly says this file is shared verbatim by both the client stub and the future Phase 4 server action — do not fork it). Add `email` (optional, `.or(z.literal(""))`), `phone` (optional), `product`/`productName`/`quantity`/`destinationCountry`/`incoterm` (all optional — RFQ-mode presence driven by the `?product=` query param client-side, not schema-enforced), `companyWebsite` honeypot (`.max(0)`), `turnstileToken` (required). Add a top-level `.refine()` requiring `email` OR `phone`. See RESEARCH.md "Code Examples" for the exact extended schema — copy that verbatim, it already matches this file's existing style (trimmed strings, inline error copy matching UI-SPEC Copywriting Contract).

**Convention to preserve:** error message strings live inline in this file (not in next-intl catalogs) per the existing comment block — new field error strings must follow the same inline convention.

---

### `src/lib/contact-action.ts` (service/Server Action, request-response) — NEW

**Analog:** No direct in-repo analog for a `"use server"` Server Action; closest structural precedent is `src/hooks/revalidatePage.ts` (single exported function, comment-documented step ordering, environment/context-gated behavior) combined with RESEARCH.md Pattern 1 (full code already drafted there).

**Core pattern to copy** — RESEARCH.md "Architecture Patterns > Pattern 1" (lines 221-290 of 04-RESEARCH.md) has the complete, ready-to-use implementation: Zod re-validate → honeypot short-circuit (always return `{status:"success"}`, never reveal detection — mirrors this codebase's "never leak internal state" instinct seen in `getSiteBrand()`'s fallback defaults) → `await headers()` (async since Next 15, this project is on 16.2.x — Pitfall 5) → rate-limit check → Turnstile `siteverify` fetch → `resend.emails.send()` → fire-and-forget `notifyCrm()` → discriminated-union return.

**Codebase convention to match:**
- Top-of-file comment block explaining WHY the ordering is what it is (see `revalidatePage.ts` lines 4-7, `getSiteBrand()` lines 7-10 in `payload-fetch.ts`) — this repo consistently documents *why*, not just *what*.
- Never throw from a Payload hook or Server Action for a downstream-optional failure (CRM) — `revalidatePage.ts`'s `context.disableRevalidate` gate is the same "skip cleanly, don't blow up the caller" instinct as the fire-and-forget `notifyCrm()` call.

**Env var access:** `process.env.RESEND_API_KEY` etc. — no existing pattern in this codebase for server-only secrets (Payload's `payload.config.ts` handles its own secrets), so follow RESEARCH.md's graceful-failure guidance: return `{status:"error", message:"network"}` rather than throwing if unset.

---

### `src/lib/rate-limit.ts` (utility, transform) — NEW

**Analog:** none in codebase — greenfield per RESEARCH.md Pattern 2. Copy that pattern (module-scoped `Map<string,{count,resetAt}>`, `WINDOW_MS`/`MAX_PER_WINDOW` constants) verbatim; documented limitation (single-instance, best-effort) must be preserved as a code comment matching this repo's habit of flagging tradeoffs inline (see `getSiteBrand()`'s `contact.whatsapp || "910000000000"` fallback comment style).

---

### `src/lib/crm-webhook.ts` (service, event-driven) — NEW

**Analog:** `src/hooks/revalidatePage.ts` — both are "one internal function, env/context-gated, never throws to the caller" shapes.

**Core pattern:** RESEARCH.md Pattern 3 (lines 315-334) — `notifyCrm()` no-ops when `CRM_WEBHOOK_URL` unset, wraps the POST in try/catch that swallows errors, uses `AbortSignal.timeout(5000)`. Match `revalidatePage.ts`'s single-condition-gate style (`if (!context.disableRevalidate)` → here `if (!url) return;`).

---

### `src/lib/analytics.ts` (utility/client, event-driven) — NEW

**Analog:** none in codebase — greenfield, provider-agnostic wrapper per RESEARCH.md Pattern 4 (lines 336-359). Copy verbatim: `"use client"` directive, `EventName` union type (`"rfq_submit" | "inquiry_submit" | "whatsapp_click"` — exact strings from D-06), `typeof window === "undefined"` guard, `dataLayer`/`plausible` branch, safe no-op fallback (never throws).

---

### `src/emails/LeadNotification.tsx` (component, transform) — NEW

**Analog:** `src/components/blocks/ContactBlockView.tsx` — closest existing precedent for "server component composing labeled contact-data rows from a typed payload" (its info column renders address/whatsapp/email/phone as labeled rows, same shape as an email body listing lead fields).

**Core pattern to copy from `react-email` (NOT `@react-email/components`, deprecated — Pitfall 1):** RESEARCH.md "Code Examples" `LeadNotification.tsx` excerpt (lines 488-514) — `Html`/`Head`/`Body`/`Container`/`Heading`/`Text` from the single `react-email` package. Conditionally render the RFQ fields block only `if (data.product)`, mirroring `ContactBlockView.tsx`'s own conditional block pattern (`{block.intro ? <p>...</p> : null}` at line 36).

---

### `src/components/blocks/ContactForm.tsx` (component, request-response) — MODIFY

**Analog:** itself, current state (`src/components/blocks/ContactForm.tsx`, full file read — 112 lines)

**Imports pattern** (lines 1-18) — preserve exactly, add:
```typescript
import { submitContactForm } from "@/lib/contact-action";
import { trackEvent } from "@/lib/analytics";
import { useSearchParams } from "next/navigation";
```

**Existing form-field pattern to replicate for new fields** (lines 52-103) — every field is a `FormField` → `FormItem` → `FormLabel` + `FormControl` (`Input`/`Textarea`) → `FormMessage` block, using `next-intl`'s `t()` for labels via the `"contact"` namespace. New `email`, `phone`, and conditionally-rendered RFQ fields (`quantity`, `destinationCountry`, `incoterm` — use the not-yet-installed `shadcn` `select` for incoterm per RESEARCH.md) must follow this exact same four-level structure.

**Honeypot insertion point — already marked** (lines 104-105):
```typescript
{/* Spam-defense insertion point (Phase 4/LEAD-03): honeypot field
    goes here, before the submit button — not built yet (D-07). */}
```
Insert the honeypot field (visually hidden, `tabIndex={-1}`, `autoComplete="off"`) and the Turnstile widget (`@marsidev/react-turnstile`'s `<Turnstile/>`) at this exact comment location.

**onSubmit replacement** (currently lines 36-39, local-state-only stub) — replace with RESEARCH.md's client wiring excerpt (lines 467-484): `async function onSubmit(values)`, `setStatus("loading")`, `await submitContactForm(values)`, branch on `result.status`/`result.message`, call `trackEvent(...)` only on success.

**RFQ-mode read-only field (D-03):** use `useSearchParams().get("product")` to read the query param; render a read-only field (not a re-pickable input) auto-filled from it, per D-03 — no existing analog for a read-only auto-filled field in this form, build per UI-SPEC.

**Success-state pattern to preserve** (lines 41-47): `role="status"` div with `t("successMessage")` — keep this shape, just move the transition trigger from local-only state to the Server Action result.

---

### `src/components/chrome/GlobalHeader.tsx` (component, request-response) — MODIFY

**Analog:** itself, current state (full file read — 80 lines)

**Existing CTA pattern to extend** (lines 66-76):
```typescript
<div className="flex items-center gap-sm">
  <LanguageSwitcher />
  <Button
    asChild
    size="sm"
    className="hidden hover:bg-primary-500 focus-visible:ring-accent-600 sm:inline-flex"
  >
    <Link href="/contact">{tHero("cta")}</Link>
  </Button>
  <MobileNavPanel siteName={siteName} logoUrl={logoUrl} />
</div>
```
D-05's WhatsApp CTA sits alongside this existing "Request a Quote" link inside the same `gap-sm` flex row (per CONTEXT.md "Specific Ideas"). `GlobalHeader` is an async server component (`export async function GlobalHeader`, line 36) already calling `getTranslations` — add a `getSiteBrand()` call (already React `cache()`d, zero extra query cost — same pattern `ContactBlockView.tsx` uses at line 27) to get `waHref`, pass `href={waHref}` to a new `<a>` styled to match the existing `Button` sizing. Must use `WhatsAppIcon` (extracted component, see below) + visible label + `aria-label`, matching `ContactBlockView.tsx`'s existing WhatsApp link accessibility pattern (lines 43-54).

---

### `src/components/chrome/MobileNavPanel.tsx` (component, request-response) — MODIFY

**Analog:** itself, current state (full file read — 109 lines)

**Existing CTA pattern to extend** (lines 102-104):
```typescript
<Button asChild className="hover:bg-primary-500 focus-visible:ring-accent-600">
  <Link href="/contact">{tHero("cta")}</Link>
</Button>
```
This component is `"use client"` and does NOT currently call `getSiteBrand()` (server-only) — `waHref` must be passed down as a prop from `GlobalHeader` (which already passes `siteName`/`logoUrl` as props at the `<MobileNavPanel siteName={siteName} logoUrl={logoUrl} />` call site, line 75 of GlobalHeader.tsx). Add `waHref: string` to the prop type (line 49-55) alongside `siteName`/`logoUrl`, render the WhatsApp CTA near the existing bottom `Button`, closing the sheet on click (`onClick={() => setOpen(false)}` — same pattern used by nav links at line 95).

---

### `src/components/icons/WhatsAppIcon.tsx` (component, transform) — NEW (extraction, not creation)

**Analog:** the CURRENT inline `WhatsAppIcon` function already living in `src/components/blocks/ContactBlockView.tsx` lines 13-19 — this is a pure extraction, not new design work.

**Exact code to move verbatim:**
```typescript
// UI-SPEC §9 — single small hand-authored monochrome WhatsApp glyph (no
// dedicated Lucide brand icon exists); one component, no new icon-library
// dependency, per UI-SPEC's explicit instruction.
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.09L2 22l5.06-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.94 7.94 0 0 1-4.06-1.11l-.29-.17-3 .78.8-2.93-.19-.3A7.95 7.95 0 1 1 12 20Zm4.36-5.96c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
```
**Required follow-up edits:** remove the local definition from `ContactBlockView.tsx` and import from `@/components/icons/WhatsAppIcon` instead; `GlobalHeader.tsx`/`MobileNavPanel.tsx`/`ContactBlockView.tsx` all import this ONE shared component per UI-SPEC Component Inventory §1 (already cited in CONTEXT.md's canonical structure, line 218 of RESEARCH.md's Recommended Project Structure).

---

### `tests/unit/contact-action.spec.ts` (test, request-response) — NEW

**Analog:** `tests/int/pages-revalidate-hook.spec.ts` — hoisted `vi.mock()` before dynamic import pattern.

**Pattern to copy** (lines 1-12 of `pages-revalidate-hook.spec.ts`):
```typescript
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { getTestPayload } = await import("./config");
```
For `contact-action.spec.ts`, apply the SAME hoisting discipline: `vi.mock("resend", ...)` and `vi.mock("next/headers", ...)` must be declared BEFORE the dynamic `await import("@/lib/contact-action")`, since `contact-action.ts` constructs `new Resend(...)` at module scope. Mirror the `describe`/`it` block structure and `expect(...).toHaveBeenCalledWith(...)` assertion style (lines 38-53). This is a NEW `tests/unit/` directory — `vitest.config.ts` currently only defines an `int` project scoped to `tests/int/**` (see Shared Patterns below); must add a `unit` project.

---

### `tests/e2e/contact.spec.ts` (test, request-response) — MODIFY, not new

**Analog:** itself, current state (full file read — 86 lines).

**Assertions that MUST be updated (RESEARCH.md Wave 0 Gaps, confirmed by direct read):**
1. Lines 68-71 assert **zero network requests** on empty submit (`expect(requests).toEqual([])`) — this becomes false once client-side Zod validation still blocks the submit BEFORE hitting the Server Action (empty-submit case should still show zero network calls, since validation still short-circuits client-side — verify this assertion actually still holds true, since RHF's `handleSubmit` won't call the Server Action if `zodResolver` rejects). Confirm behavior rather than assuming it breaks.
2. Line 26: `waLink` accessible-name regex `/message star agrevolution on whatsapp/i` and line 30 visible text regex `/message us on whatsapp/i` — CONTEXT.md/UI-SPEC's Copywriting Contract changes this string to "Chat on WhatsApp" (per RESEARCH.md Wave 0 Gaps) — update both the `t("whatsappAria")`/`t("whatsappLabel")` catalog strings AND this test's locators together.

---

## Shared Patterns

### Server-only secrets / env-gated behavior
**Source:** `src/hooks/revalidatePage.ts` (context-gate pattern), RESEARCH.md Pattern 3
**Apply to:** `contact-action.ts`, `crm-webhook.ts`
```typescript
if (!context.disableRevalidate) { /* ... */ }   // existing precedent
if (!url) return;                                // same gate shape, new file
```
Never let a missing credential throw uncaught — return a typed error/no-op result instead (matches this codebase's existing discipline of graceful `||` fallbacks in `getSiteBrand()`, e.g. `contact.whatsapp || "910000000000"`).

### Single React-`cache()`d data source, never hardcode contact channels
**Source:** `src/lib/payload-fetch.ts` lines 11-37 (`getSiteBrand()`)
**Apply to:** `GlobalHeader.tsx`, `MobileNavPanel.tsx`, `LeadNotification.tsx` (sales inbox target implied by `SALES_INBOX_ADDRESS` env var, not `getSiteBrand()` — but `waHref` for any WhatsApp-consuming UI MUST call `getSiteBrand()`)
```typescript
const { email, phone, whatsapp } = await getSiteBrand();
const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("...")}`;
```

### Shared client/server Zod schema, single export
**Source:** `src/lib/contact-schema.ts` (existing comment block, lines 3-9)
**Apply to:** `ContactForm.tsx` (client `zodResolver`) AND `contact-action.ts` (server re-validation) — both import the exact same `contactSchema` export, never fork or duplicate.

### next-intl translation namespace for form/contact copy
**Source:** `ContactForm.tsx` line 28 (`useTranslations("contact")`), `ContactBlockView.tsx` line 26 (`getTranslations("contact")`)
**Apply to:** any new label/error copy for RFQ fields, WhatsApp CTA aria-labels — add keys to the existing `"contact"` (and `"nav"`/`"mobileNav"`/`"hero"` for header CTA copy) namespaces in `src/i18n/messages/*.json`, do not create a new namespace.

### Vitest hoisted `vi.mock()` before dynamic import
**Source:** `tests/int/pages-revalidate-hook.spec.ts` lines 9-12
**Apply to:** all new `tests/unit/*.spec.ts` files that need to intercept module-scope side effects (Resend client construction, `fetch` calls, `next/headers`).

### Test project config gap
**Source:** `vitest.config.ts` (current state, `int` project only, `include: ["tests/int/**/*.spec.ts"]`)
**Apply to:** must add a new `unit` project (or extend scope) covering `tests/unit/**/*.spec.ts` — this project should NOT require the SQLite test DB/`globalSetup` that `int` uses, since `contact-action.spec.ts`/`rate-limit.spec.ts`/`crm-webhook.spec.ts`/`analytics.spec.ts` are pure-function/mocked-fetch tests with no Payload DB dependency.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/rate-limit.ts` | utility | transform | No rate-limiting code exists anywhere in this codebase yet — use RESEARCH.md Pattern 2 verbatim as the source of truth |
| `src/lib/analytics.ts` | utility (client) | event-driven | No analytics/tracking wrapper exists yet — use RESEARCH.md Pattern 4 verbatim |

## Metadata

**Analog search scope:** `src/lib/`, `src/components/blocks/`, `src/components/chrome/`, `src/hooks/`, `tests/int/`, `tests/e2e/`
**Files scanned:** `contact-schema.ts`, `ContactForm.tsx`, `ContactBlockView.tsx`, `payload-fetch.ts`, `GlobalHeader.tsx`, `MobileNavPanel.tsx`, `revalidatePage.ts`, `pages-revalidate-hook.spec.ts`, `contact.spec.ts`, `vitest.config.ts`
**Pattern extraction date:** 2026-07-20
