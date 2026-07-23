# Phase 5: SEO Infrastructure & Insights/Blog - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-22
**Phase:** 5-SEO Infrastructure & Insights/Blog
**Areas discussed:** Blog/Insights content model, Blog URL/nav placement, hreflang scope for untranslated locales, Structured data scope & Organization data gaps

---

## Blog/Insights content model

| Option | Description | Selected |
|--------|-------------|----------|
| Simple fixed fields | title/slug/excerpt/cover image/richText body — matches Products' typed pattern | ✓ |
| Freeform blocks | Reuse Pages' block system for max layout flexibility | |

**User's choice:** Simple fixed fields
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Single category field | One relationship field, matches Products.category pattern | ✓ |
| No taxonomy | Flat list, newest-first only | |

**User's choice:** Single category field

| Option | Description | Selected |
|--------|-------------|----------|
| Author name only | Plain text field, minor E-E-A-T SEO signal | ✓ |
| No author byline | Skip entirely | |

**User's choice:** Author name only

| Option | Description | Selected |
|--------|-------------|----------|
| Localized fields, EN-only content for now | Same architecture as Pages/Products, isTranslated detection | ✓ |
| English-only collection | Skip localization on this collection entirely | |

**User's choice:** Localized fields, EN-only content for now

---

## Blog URL/nav placement

| Option | Description | Selected |
|--------|-------------|----------|
| /insights, top-level nav item | New persistent nav link, matches PROJECT.md wording | ✓ |
| /blog, top-level nav item | Same nav treatment, more common URL convention | |
| Footer-only link | No header nav slot | |

**User's choice:** /insights, top-level nav item

| Option | Description | Selected |
|--------|-------------|----------|
| Flat: /insights/[slug] | Simpler routing, matches /products/[slug] pattern | ✓ |
| Nested: /insights/[category]/[slug] | Category in URL for topical SEO clustering | |

**User's choice:** Flat: /insights/[slug]

---

## hreflang scope for untranslated locales

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, gate by isTranslated | Reuses existing per-page/product fallback-detection pattern | ✓ |
| No, always emit all 4 locales | Simpler, but risks near-duplicate-content hreflang | |

**User's choice:** Yes, gate by isTranslated

| Option | Description | Selected |
|--------|-------------|----------|
| English root URL | Matches next-intl defaultLocale with no path prefix | ✓ |
| Separate locale-picker page | More setup, not present in this codebase today | |

**User's choice:** English root URL (no locale prefix)

---

## Structured data scope & Organization data gaps

| Option | Description | Selected |
|--------|-------------|----------|
| Add address + sameAs fields to SiteSettings | Unlocks complete Organization JSON-LD | ✓ |
| Ship minimal Organization schema now | No new CMS fields this phase | |

**User's choice:** Add address + sameAs fields to SiteSettings

| Option | Description | Selected |
|--------|-------------|----------|
| name, image, description, category + certifications as additionalProperty | Uses only existing Product fields, no price/offers (B2B RFQ site) | ✓ |
| Also request user reviews/ratings markup | Requires new reviews data model, out of scope | |

**User's choice:** name, image, description, category + certifications as additionalProperty

| Option | Description | Selected |
|--------|-------------|----------|
| Product detail + blog article pages | Both have a natural parent (category/insights list) | ✓ |
| Every page site-wide | More consistent but low value on flat marketing pages | |

**User's choice:** Product detail + blog article pages

---

## Claude's Discretion

- Exact sitemap generation mechanism (native `sitemap.ts`, single file vs. index) — left to researcher/planner.
- Exact JSON-LD injection mechanism (`generateMetadata` + shared script helper) — left to researcher/planner.
- Open Graph image strategy (dedicated field vs. deriving from existing cover/hero images) — not discussed, left to researcher/planner.

## Deferred Ideas

None — discussion stayed within phase scope.
