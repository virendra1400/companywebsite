---
phase: 5
slug: seo-infrastructure-insights-blog
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 (unit + int projects) + Playwright (e2e) — both already configured |
| **Config file** | `vitest.config.ts` (projects: `int` w/ SQLite test DB + `unit`), `playwright.config.ts` (testDir `tests/e2e`) |
| **Quick run command** | `npm run test -- --project=unit` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~90 seconds (unit+int) + ~3-5 min (e2e) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --project=unit` (fast, no DB)
- **After every plan wave:** Run `npm run test && npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite green + 3 manual checkpoints (view-source, Screaming Frog, Rich Results Test)
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SEO-01 | — | `generateMetadata`/OG fields build correct shape for a given product/article | unit | `npx vitest run --project=unit tests/unit/seo-metadata.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-02 | T-05-01 | `getTranslatedLocales` returns only real-translation locales + `buildAlternates` produces reciprocal self-referencing map | unit + int | `npx vitest run --project=unit tests/unit/seo-alternates.spec.ts` / `npx vitest run --project=int tests/int/insights-fallback.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-03 | T-05-02 | `sitemap.ts` default export returns entries for every locale/published item, no drafts, no dupes | int | `npx vitest run --project=int tests/int/sitemap.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-04 | T-05-03 | `organizationJsonLd`/`productJsonLd`/`breadcrumbJsonLd` builders emit required fields, omit price/offers/review | unit | `npx vitest run --project=unit tests/unit/seo-json-ld.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-04 | T-05-03 | JSON-LD escaping (`<` → `<`) applied by shared `<JsonLd>` component | unit | `npx vitest run --project=unit tests/unit/seo-json-ld.spec.ts` | ❌ W0 (same file) | ⬜ pending |
| TBD | TBD | TBD | SEO-05 | — | Canonical URL for English root has no locale prefix | unit | same `seo-alternates.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | BLOG-01 | — | Visitor can browse `/insights` list and read `/insights/[slug]` article | e2e | `npx playwright test tests/e2e/insights.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | BLOG-02 | T-05-04 | `Insights` collection localized fields cascade + `revalidateInsight` hook fires correct paths | int | `npx vitest run --project=int tests/int/insights-revalidate-hook.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task ID / Plan / Wave columns are filled in by the planner once PLAN.md files exist.*

---

## Wave 0 Requirements

- [ ] `tests/unit/seo-metadata.spec.ts` — covers SEO-01
- [ ] `tests/unit/seo-alternates.spec.ts` — covers SEO-02, SEO-05
- [ ] `tests/unit/seo-json-ld.spec.ts` — covers SEO-04
- [ ] `tests/int/sitemap.spec.ts` — covers SEO-03 (mirrors `tests/int/products-revalidate-hook.spec.ts`'s `getTestPayload()` fixture pattern)
- [ ] `tests/int/insights-fallback.spec.ts` — covers BLOG-02/SEO-02, mirrors `tests/int/pages-fallback.spec.ts` exactly, retargeted at the new `insights` collection
- [ ] `tests/int/insights-revalidate-hook.spec.ts` — covers BLOG-02, mirrors `tests/int/products-revalidate-hook.spec.ts`
- [ ] `tests/e2e/insights.spec.ts` — covers BLOG-01, mirrors `tests/e2e/product-detail.spec.ts` structure

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| View-source shows correct title/description/OG/hreflang | SEO-01, SEO-02 | Requires rendered HTML inspection on a live/preview deploy, not just unit-tested builder output | Deploy preview, view-source on home/product/article in each locale, confirm `<title>`, `<meta description>`, OG tags, and `<link rel="alternate" hreflang>` tags |
| Screaming Frog crawl reports zero hreflang conflicts | SEO-02 | Crawl-audit tooling, not part of the app's test suite | Run Screaming Frog against the deployed site, confirm reciprocal hreflang with zero conflicts against canonical |
| Google Rich Results Test validates structured data | SEO-04 | External Google validation tool, requires a public/deployed URL | Submit product page, article page, and homepage URLs to https://search.google.com/test/rich-results, confirm Organization/Product/BreadcrumbList validate with no errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
