---
status: complete
phase: 06-design-system-elevation-premium-type-scale-display-tokens-rh
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md]
started: 2026-07-24T02:09:14Z
updated: 2026-07-24T02:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Tabular figures utility available
expected: Tailwind v4's built-in `tabular-nums` utility class is available in this project (no new custom token was needed — confirm this claim from 06-UI-SPEC.md is accurate, not something to eyeball on the live site).
result: pass
reported: "Confirmed via source check — tabular-nums present in node_modules/tailwindcss/dist/lib.js (Tailwind v4.3.2 core utility engine), no custom token needed."

### 2. Card visual convergence (live render)
expected: On https://star-agrevolution.vercel.app/en/products and /en/certifications, ProductCard/CertCard show a soft ~10px rounded corner and a subtle ambient shadow (not a harsh drop-shadow), with no layout breakage.
result: pass

### 3. Full homepage + trust-page visual regression sign-off
expected: On https://star-agrevolution.vercel.app/en (homepage) and /en/certifications (trust page): desktop section spacing looks visibly airier (96px rhythm at wide viewports) with no overlapping/broken sections; cards render correctly; mobile view is unaffected (still tight 48px spacing, no regression).
result: pass

### 4. globals.css @theme tokens exist (auto-verified)
expected: text-display-lg (52px/300/1.1), text-display-xl (56px/300/1.05), tracking-display (-0.025em) present in globals.css
result: pass
source: automated
coverage_id: D-01

### 5. Geist Latin display face locale-scoped (auto-verified)
expected: Geist wired via next/font/google, structurally never applied to ar locale
result: pass
source: automated
coverage_id: D-02

### 6. Color ramp and body-tier typography unchanged (auto-verified)
expected: Color ramp stays 11 --color-* tokens; --text-display: 40px / font-weight 600 untouched
result: pass
source: automated
coverage_id: D-03

### 7. Rhythm and card tokens added (auto-verified)
expected: spacing-4xl (96px), radius-card (10px), shadow-card / shadow-card-hover tokens added to globals.css
result: pass
source: automated
coverage_id: D-04

### 8. Phase-1 UI-SPEC amendment note present (auto-verified)
expected: Archived Phase-1 UI-SPEC carries a Phase 6 amendment note lifting the type-scale lock for display tiers only
result: pass
source: automated
coverage_id: D-06

### 9. 9 CMS block wrappers apply 96px desktop rhythm (auto-verified)
expected: All 9 block wrappers apply xl:py-4xl; HeroBlock and chrome untouched; confirmed present in live-rendered /en HTML
result: pass
source: automated
coverage_id: D-04

### 10. lint:rtl, build, and existing tests pass (auto-verified)
expected: npm run lint:rtl exits 0; npm run build succeeds (69/69 pages); npx vitest run passes (17 files / 70 tests)
result: pass
source: automated
coverage_id: D-04

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
