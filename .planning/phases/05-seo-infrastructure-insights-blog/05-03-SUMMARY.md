---
phase: 05-seo-infrastructure-insights-blog
plan: 03
subsystem: seo
tags: [json-ld, schema.org, structured-data, payload, xss]

requires: []
provides:
  - "src/lib/seo/json-ld.tsx: JsonLd component + organizationJsonLd/productJsonLd/breadcrumbJsonLd builders"
  - "SiteSettings.address group + SiteSettings.sameAs array (Organization JSON-LD source data)"
affects: ["05-04-articles", "05-05-products-layout"]

tech-stack:
  added: []
  patterns:
    - "All application/ld+json output routes through the single <JsonLd> component, which applies .replace(/</g, \"\\\\u003c\") once (T-05-03) — never a second inline dangerouslySetInnerHTML for structured data."
    - "Optional JSON-LD fields (logo/address/sameAs/description/category/additionalProperty) are conditionally spread so absent inputs omit the key entirely rather than emitting null."

key-files:
  created:
    - src/lib/seo/json-ld.tsx
    - tests/unit/seo-json-ld.spec.tsx
  modified:
    - src/globals/SiteSettings.ts
    - vitest.config.ts

key-decisions:
  - "D-09/D-10/D-11 builder shapes implemented verbatim per RESEARCH Pattern 4 (hand-rolled, no schema-dts dependency)."
  - "productJsonLd deliberately omits offers/price/priceCurrency/availability/review/aggregateRating (D-10 — B2B RFQ site, not e-commerce), enforced by unit test not.toHaveProperty assertions."

patterns-established:
  - "Structured-data builders live in src/lib/seo/json-ld.tsx; page-level wiring (which page renders which builder) is deferred to 05-04/05-05."

requirements-completed: [SEO-04]

coverage:
  - id: D1
    description: "organizationJsonLd emits Organization with name/url and conditionally logo/address(PostalAddress)/sameAs, omitting absent fields entirely"
    requirement: "SEO-04"
    verification:
      - kind: unit
        ref: "tests/unit/seo-json-ld.spec.tsx#organizationJsonLd"
        status: pass
    human_judgment: false
  - id: D2
    description: "productJsonLd emits Product with name/image/description/category/additionalProperty and OMITS offers/price/availability/review/rating (D-10)"
    requirement: "SEO-04"
    verification:
      - kind: unit
        ref: "tests/unit/seo-json-ld.spec.tsx#productJsonLd"
        status: pass
    human_judgment: false
  - id: D3
    description: "breadcrumbJsonLd emits BreadcrumbList with 1-indexed ListItem positions"
    requirement: "SEO-04"
    verification:
      - kind: unit
        ref: "tests/unit/seo-json-ld.spec.tsx#breadcrumbJsonLd"
        status: pass
    human_judgment: false
  - id: D4
    description: "Shared <JsonLd> component escapes '<' to \\u003c before dangerouslySetInnerHTML, preventing script-context breakout from a CMS-authored string (T-05-03)"
    requirement: "SEO-04"
    verification:
      - kind: unit
        ref: "tests/unit/seo-json-ld.spec.tsx#JsonLd"
        status: pass
    human_judgment: false
  - id: D5
    description: "SiteSettings gains address (group) + sameAs (array) fields with unchanged public-read access and revalidateSiteSettings hook (D-09)"
    requirement: "SEO-04"
    verification:
      - kind: other
        ref: "grep src/globals/SiteSettings.ts for `address` group and `sameAs` array; tsc --noEmit passes"
        status: pass
    human_judgment: false
  - id: D6
    description: "Google Rich Results Test validates Organization/Product/BreadcrumbList once wired into pages by 05-04/05-05"
    verification: []
    human_judgment: true
    rationale: "Requires the builders to be wired into real pages (05-04/05-05) and a deployed URL — out of scope for this plan, which delivers only the builder module."

duration: 15min
completed: 2026-07-22
status: complete
---

# Phase 05 Plan 03: JSON-LD Structured Data Summary

**Hand-rolled schema.org builders (Organization/Product/BreadcrumbList) plus one shared `<JsonLd>` script component that applies the mandatory `<` XSS escape in exactly one place; SiteSettings extended with address/sameAs source data.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-22T16:19:00Z
- **Completed:** 2026-07-22T16:23:17Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `src/lib/seo/json-ld.tsx`: `JsonLd` component + `organizationJsonLd`/`productJsonLd`/`breadcrumbJsonLd` builders, all hand-rolled (no schema-dts dependency), with optional fields conditionally spread so absent inputs omit keys entirely.
- `productJsonLd` verified to omit `offers`/`price`/`priceCurrency`/`availability`/`review`/`aggregateRating` (D-10 — this is a B2B RFQ site, not e-commerce).
- `SiteSettings.ts` extended with an `address` group (street/city/state/postalCode/country) and a `sameAs` array, access (`read: () => true`) and the `revalidateSiteSettings` hook left unchanged.
- Unit spec (`tests/unit/seo-json-ld.spec.tsx`) covers builder field presence/omission and the T-05-03 XSS-escape regression via `renderToStaticMarkup`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 — failing unit tests for the JSON-LD builders + escaping** - `ea854ea` (test)
2. **Task 2: json-ld.tsx builders + shared JsonLd component + SiteSettings address/sameAs** - `fe05059` (feat)

**Plan metadata:** committed after this SUMMARY (docs: complete plan)

_TDD: RED (`ea854ea`) → GREEN (`fe05059`)._

## Files Created/Modified
- `src/lib/seo/json-ld.tsx` - JsonLd component + organizationJsonLd/productJsonLd/breadcrumbJsonLd builders
- `src/globals/SiteSettings.ts` - added `address` group + `sameAs` array fields
- `tests/unit/seo-json-ld.spec.tsx` - builder + escaping unit spec
- `vitest.config.ts` - unit project `include` extended to `*.spec.tsx` (blocking fix, see Deviations)

## Decisions Made
- Followed RESEARCH Pattern 4 verbatim for builder shapes and the `.replace(/</g, "\\u003c")` escape — no deviation from the documented schema.org shapes.
- Typed builder params with local `interface` (not `any`) per plan instruction.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest `unit` project didn't pick up `.tsx` spec files**
- **Found during:** Task 1
- **Issue:** The plan requires `tests/unit/seo-json-ld.spec.tsx` (`.tsx` because it renders `<JsonLd>`), but `vitest.config.ts`'s `unit` project `include` was `["tests/unit/**/*.spec.ts"]` — a `.tsx` file would never be collected, silently producing "0 test files" instead of the required RED failure.
- **Fix:** Extended `include` to `["tests/unit/**/*.spec.ts", "tests/unit/**/*.spec.tsx"]`.
- **Files modified:** `vitest.config.ts`
- **Verification:** `npx vitest run --project=unit` (all 5 test files, 22 tests) still passes after the change; the new spec is collected and asserts real RED before Task 2, real GREEN after.
- **Committed in:** `ea854ea` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to make the plan's own required test file executable at all. No scope creep — no other config changed.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `organizationJsonLd`/`productJsonLd`/`breadcrumbJsonLd`/`JsonLd` are ready to be imported and wired into real pages by 05-04 (articles) and 05-05 (products/layout).
- `SiteSettings.address`/`sameAs` are empty by default in the CMS until an editor fills them in — Organization JSON-LD will simply omit `address`/`sameAs` until then (by design, not a bug).
- Rich Results Test validation is a phase-gate item, deferred until 05-04/05-05 wire the builders into a deployed page (tracked as coverage item D6, human_judgment: true).

---
*Phase: 05-seo-infrastructure-insights-blog*
*Completed: 2026-07-22*
