---
phase: 2
slug: core-marketing-pages-trust-surfaces
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-14
---

# Phase 2 — Validation Strategy

> Test toolchain already installed (Vitest + Playwright from Phase 1). Reuse it.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (int, Payload Local API) + Playwright (e2e, en+ar matrix) — installed Phase 1 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` (exist) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~60–120s (grows with page/block e2e) |

---

## Sampling Rate

- **After every task commit:** `npx vitest run`
- **After every plan wave:** full suite
- **Before `/gsd-verify-work`:** full suite green
- **Max feedback latency:** 120s

---

## Per-Task Verification Map

> Planner refines with real task IDs. Every Phase 2 success criterion maps to ≥1 check.

| Req | Secure/observable behavior | Test type | Command |
|-----|-----------|-----------|---------|
| PAGE-01 | Homepage renders block sequence (hero→valueprops→certstrip→stats→export→CTA) from CMS | int + e2e | `vitest run tests/int/pages-render.spec.ts` + `playwright test tests/e2e/homepage.spec.ts` |
| PAGE-02 | About page renders from blocks | e2e | `playwright test tests/e2e/about.spec.ts` |
| PAGE-03 | Contact page shows address/WhatsApp(visible label)/email/phone + form stub with client-side validation (aria-invalid/describedby) | e2e | `playwright test tests/e2e/contact.spec.ts` |
| PAGE-04 | All pages render inside global chrome (header/footer/switcher) | e2e | `playwright test tests/e2e/chrome-consistency.spec.ts` |
| TRUST-01 | Certifications page lists certs w/ logos + PDF-download links (present + absent states) | int + e2e | `vitest run tests/int/certifications.spec.ts` + `playwright test tests/e2e/certifications.spec.ts` |
| TRUST-02 | Halal cert rendered prominently (elevated card/badge) when halal flag set | int + e2e | `playwright test tests/e2e/certifications.spec.ts` (halal case) |
| TRUST-03 | Manufacturing page renders media/stats blocks | e2e | `playwright test tests/e2e/manufacturing.spec.ts` |
| TRUST-04 | Export page renders static map (role=img + visible country list) + stat tiles | e2e | `playwright test tests/e2e/export.spec.ts` |
| TRUST-05 | Company/compliance page + company-profile PDF link | e2e | `playwright test tests/e2e/company.spec.ts` |
| TRUST-06 | Blocks render with placeholder content, no layout break on empty/long strings | int | `vitest run tests/int/blocks-placeholder.spec.ts` |
| RTL | Every new page passes dir=rtl + logical-property gate on /ar | e2e + gate | `playwright test tests/e2e/*-rtl` + `node scripts/check-physical-direction.mjs` |

*Status: ⬜ pending until executed*

---

## Wave 0 Requirements

- [x] Vitest + Playwright already installed (Phase 1). No new test infra.
- New: add `react-hook-form` + `zod` + `@hookform/resolvers` for the contact form-stub validation (verify versions + `tsc --noEmit` immediately per RESEARCH resolver/zod pitfall).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual |
|----------|-------------|------------|
| Editor composes a page from blocks in `/admin` and it renders | PAGE-01, CMS-01 spirit | Browser admin judgment; automated specs use Local API |
| Real photography/logo slots look premium once assets added | PAGE/TRUST | Visual/aesthetic judgment |
| Export-map SVG license clearance before ship | TRUST-04 | Legal-owner review (CC BY-SA share-alike) — NOT an engineering check |

---

## Validation Sign-Off

- [x] All success criteria mapped to a check
- [x] Sampling continuity (no 3 consecutive unverified tasks)
- [x] Reuses installed infra; new deps flagged with tsc gate
- [x] RTL + physical-direction gate enforced per page
- [x] `nyquist_compliant: true`

**Approval:** 2026-07-14
