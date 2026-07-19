# Phase 1: Foundation & CMS Decision - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a locale-aware, RTL-correct 4-language (en/ar/fr/ru) site skeleton and a chosen, spike-validated headless CMS where non-technical staff edit localized content.

**In scope:** locale routing (path-prefix), language switcher preserving page context, Arabic RTL correctness (logical properties, non-mirrored numerals), responsive layout shell, untranslated-page fallback rule, CMS selection + spike, per-locale content model with English fallback, media upload, no-rebuild content adds (ISR/webhook).

**Out of scope (later phases):** real marketing/trust pages (Phase 2), product catalog (Phase 3), forms/WhatsApp/analytics (Phase 4), SEO infra/blog (Phase 5), perf/RTL QA hardening (Phase 6), and full page-level visual design (belongs to `/gsd-ui-phase` / Phase 2).

Requirements: FOUND-01..06, CMS-01..04.
</domain>

<decisions>
## Implementation Decisions

### CMS
- **D-01:** Commit to **Payload CMS (self-hosted)** as the headless CMS. TS-native, installs into the Next.js app (single codebase/deploy), free + flat self-host cost, native field-level localization with English fallback.
- **D-02:** The Phase 1 spike MUST validate the **Arabic RTL admin-chrome limitation** is cosmetic-only (content editing/creation works fine in Arabic). If the spike finds the Arabic *editing* experience genuinely unusable (not just cosmetic chrome), fall back to Sanity (SaaS, document-level localization) — this is the only condition that overrides D-01.

### Hosting & Infrastructure
- **D-03:** Hosting is **Claude's discretion**, defaulting to **Vercel (Next.js) + managed Postgres + S3-compatible object storage** for media. Low-ops, scales automatically, pairs with self-hosted Payload (Payload runs within the Next app on Vercel with external Postgres + external file storage adapter).
- **D-04:** **Data residency = EU region** for the database and media/lead storage (GDPR-friendliness; EU buyers + inquiry PII collected later). Global CDN still serves all markets.

### Locale URL Structure
- **D-05:** **Path-prefix** locale routing: English at root (`/`), other locales prefixed (`/ar/`, `/fr/`, `/ru/`). Single domain (staragrevolution.com), best SEO consolidation, standard next-intl pattern.

### Untranslated-Page Fallback
- **D-06:** When a page is not yet translated in the active locale, render the **English content with a small visible notice** ("not yet available in [language]" / equivalent). Everything stays reachable; no blank/broken pages. (Note: this is looser than the ROADMAP success-criterion wording of "fall back per a defined rule" — the defined rule IS English-plus-notice.)

### Skeleton Scope
- **D-07:** Phase 1 ships a **bare shell**: global premium header/footer, language switcher, responsive layout (LTR + RTL), and ONE placeholder home page that proves the locale → RTL → CMS content pipeline end-to-end. Routed stubs for other pages are NOT in Phase 1 — real pages are Phase 2.

### Claude's Discretion
- Hosting provider/DB/storage specifics (D-03) within the Vercel + managed-Postgres + object-storage + EU-region envelope.
- Exact skeleton minimalism (D-07) — scope the minimum that proves the foundation end-to-end.
- Placeholder home content/design detail (premium bar applies; full visual design deferred to Phase 2 / ui-phase).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Phase
- `.planning/PROJECT.md` — project context, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — v1 requirements + traceability (Phase 1 = FOUND-01..06, CMS-01..04)
- `.planning/ROADMAP.md` §"Phase 1: Foundation & CMS Decision" — goal + 5 success criteria

### Research (drives this phase)
- `.planning/research/STACK.md` — Next.js 16 + next-intl + Tailwind v4 RTL + Payload recommendation, versions, Payload RTL admin-chrome GitHub issues
- `.planning/research/ARCHITECTURE.md` — rendering strategy (SSG+ISR), CMS content-model schema sketch, i18n routing, build order
- `.planning/research/PITFALLS.md` — RTL-as-CSS-flip, hreflang, locale content-modeling, placeholder-content pitfalls (Pitfalls 1 & 3 are Phase-1-critical)
- `.planning/research/SUMMARY.md` — reconciled open CMS decision + tradeoff table (now resolved to Payload per D-01/D-02)

No external ADRs/specs beyond the above — requirements fully captured in decisions + research.
</canonical_refs>

<code_context>
## Existing Code Insights

Greenfield — no existing code, no codebase maps. This phase creates the initial Next.js + Payload project scaffold. No reusable assets or integration points yet.
</code_context>

<specifics>
## Specific Ideas

- Inspiration/floor reference: `https://www.piyushfarms.com/` — premium bar to meet or exceed; it is WordPress, English-only, no i18n/RTL (low floor).
- Target domain: `https://staragrevolution.com/` — currently a parked page; only a future DNS cutover to consider, nothing to migrate.
- Brand name: "Star Agrevolution" (confirm exact legal/brand spelling with business).
- Arabic must use non-mirrored (Western/Latin) numerals per success criterion, and CSS logical properties throughout — RTL is architected from the first component, never retrofitted.
</specifics>

<deferred>
## Deferred Ideas

- Full premium page-level visual design / design system — Phase 2 or `/gsd-ui-phase`.
- CRM vendor selection — Phase 4 (email-now, CRM-ready stub).
- Real content population (certs, export stats, product specs, Halal status) — supplied by business, slotted via CMS across phases.
- Additional-locale content go-live (ar/fr/ru professional translations) — post-launch per FOUND-02.

None of the discussion introduced new capabilities — stayed within phase scope.
</deferred>

---

*Phase: 1-Foundation & CMS Decision*
*Context gathered: 2026-07-14*
