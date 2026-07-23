---
phase: 3
slug: product-catalog
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-15
---

# Phase 3 — Validation Strategy

> Test toolchain installed since Phase 1 (Vitest + Playwright). Zero new deps this phase. Reuse.

## Test Infrastructure
| Property | Value |
|----------|-------|
| Framework | Vitest (int, Payload Local API) + Playwright (e2e, en+ar) |
| Quick run | `npx vitest run` |
| Full suite | `npx vitest run && npx playwright test` |
| RTL gate | `node scripts/check-physical-direction.mjs` |

## Sampling Rate
- After each task commit: `npx vitest run`
- After each wave: full suite
- Before verify: full suite green + build exit 0

## Per-Requirement Verification Map
| Req | Observable behavior | Test type | Command |
|-----|---------------------|-----------|---------|
| CAT-01 | `/products` index shows products grouped by category (section per category) | int + e2e | `vitest run tests/int/catalog.spec.ts` + `playwright test tests/e2e/catalog.spec.ts` |
| CAT-02 | `/products/[slug]` shows name, gallery, description, SpecTable, packaging, applicable-cert badges, RFQ CTA | e2e | `playwright test tests/e2e/product-detail.spec.ts` |
| CAT-03 | New product/category appears live w/o rebuild — generateStaticParams queries slugs, dynamicParams default true, revalidate hook on edit | int | `vitest run tests/int/catalog-revalidate.spec.ts` |
| CAT-04 | Pages render with placeholder specs; SpecTable resilient to empty/long rows; empty category state | int + e2e | `vitest run tests/int/catalog.spec.ts` (placeholder-resilience) |
| RTL | `/products` + `/products/[slug]` pass dir=rtl + physical-direction gate on /ar; gallery non-mirror | e2e + gate | `playwright test tests/e2e/*catalog* *product*` + gate |
| a11y | Gallery thumbnails are buttons w/ aria-label + aria-pressed; SpecTable `<dl>/<dt>/<dd>` | e2e | asserted in product-detail.spec.ts |
| PAGE-04 regress | `products` nav link resolves to /products (existing nav-links.spec auto-covers) | e2e | `playwright test tests/e2e/nav-links.spec.ts` |

## Wave 0 Requirements
- [x] Vitest + Playwright installed (Phase 1). No new infra/deps.
- One int test probing the localized top-level `specifications` array cascade (RESEARCH MEDIUM-confidence issue #8283 guard).

## Manual-Only Verifications
| Behavior | Why Manual |
|----------|------------|
| Editor adds a Product/Category in `/admin` → appears live without redeploy | Browser admin + live ISR observation (CAT-03) |
| Product imagery/premium feel once real photos added | Visual judgment |

## Validation Sign-Off
- [x] Every success criterion mapped to a check
- [x] Sampling continuity
- [x] Reuses installed infra; zero new deps
- [x] RTL + a11y gates enforced
- [x] `nyquist_compliant: true`

**Approval:** 2026-07-15
