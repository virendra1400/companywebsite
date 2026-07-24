---
phase: 6
slug: design-system-elevation-premium-type-scale-display-tokens-rh
status: closed
threats_open: 0
asvs_level: 1
created: 2026-07-24
---

# Phase 6 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| build pipeline → rendered locale layout | next/font resolves and self-hosts Geist at build time; the only cross-boundary risk is which locale receives the Latin display face. | Font asset / CSS variable |
| CSS token → Arabic content | `--font-display` fallback chain decides whether Arabic text could ever render in a Latin face. | Rendered typography |
| design token → rendered CMS pages | Rhythm/card recipe changes alter padding and elevation on every CMS-driven page; risk is layout regression on editor-authored content, not untrusted input. | Layout/CSS only |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Information Disclosure | Latin display face leaking into `ar` locale (Arabic integrity) | medium | mitigate | `displayVar` is empty string on `ar` (`locale === "ar" ? "" : geistDisplay.variable`), so `--font-geist-display` is never set on `<html>` for Arabic; `--font-display` falls back to `--font-sans` (Plex Sans Arabic). Verified: grep of `layout.tsx` line 67 confirms the gate; live `/en` vs `/ar` `<html class>` diff (06-01-SUMMARY) confirms Arabic never carries the Geist class. | closed |
| T-06-02 | Denial (readability) | FOIT / invisible display headings if Geist fails to load | low | mitigate | `display: "swap"` set on all three font loaders (Plex, Plex Arabic, Geist) + `var(--font-geist-display, var(--font-sans))` nested fallback guarantees visible text if the font is slow or fails. Verified: grep confirms 3× `display: "swap"` in `layout.tsx`. | closed |
| T-06-SC | Tampering | package installs (npm/pip/cargo) | low | accept | No package installed in Plan 06-01 — Geist consumed via `next/font/google`'s built-in export (Next 16.2.10, already in node_modules), no `npm install`. | closed |
| T-06-03 | Tampering (layout integrity) | CMS-driven pages regressing from the rhythm/card recipe change | medium | mitigate | Recipe change is additive (one appended `xl:py-4xl`; card overrides via tailwind-merge). CONTEXT-mandated human visual-regression check performed and passed (06-UAT.md Tests 2 & 3, homepage + certifications + products, 2026-07-24); `npm run build` gate passed (69/69 pages). | closed |
| T-06-04 | Elevation of Privilege (scope creep) | applying display tokens or tabular-nums outside this phase's scope | low | mitigate | Prohibitions in must_haves forbid touching HeroBlock, the Card primitive, display-token application (Phase 7), and tabular-nums wiring (Phase 8). Verified: `git diff --stat` from pre-phase baseline to current HEAD shows zero changes to `src/components/ui/card.tsx` and `src/components/blocks/HeroBlock.tsx`. | closed |
| T-06-SC | Tampering | package installs (npm/pip/cargo) | low | accept | No package installed in Plan 06-02 — only existing components and existing Tailwind utilities touched. | closed |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-06-01 | T-06-SC (06-01) | No new dependency installed this phase; supply-chain gate does not apply. | orchestrator (grep-level verification, ASVS L1) | 2026-07-24 |
| R-06-02 | T-06-SC (06-02) | No new dependency installed this phase; supply-chain gate does not apply. | orchestrator (grep-level verification, ASVS L1) | 2026-07-24 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-24 | 5 (T-06-01, T-06-02, T-06-SC×2, T-06-03, T-06-04) | 5 | 0 | orchestrator — short-circuit path (threats_open:0, register plan-time-authored, ASVS L1 grep-depth verification; auditor spawn not required per gate rule) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
