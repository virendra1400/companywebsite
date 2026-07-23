---
quick_id: 260723-duo
slug: rebrand-company-name-star-agrevolution-t
date: 2026-07-23
status: complete
---

# Quick Task 260723-duo: Rebrand Star Agrevolution → VNP Global

## Goal

Company renamed from **Star Agrevolution** to **VNP Global**. Replace the old
brand string across all live render paths so fresh instances and metadata show
the new name. Name change only — domain and historical planning docs untouched.

## Scope

**Edit (live render / code defaults):**
- `src/globals/SiteSettings.ts` — `siteName` field `defaultValue`
- `src/lib/payload-fetch.ts` — `getSiteBrand` fallback `siteName`
- `src/app/(site)/[locale]/layout.tsx` — root metadata title template + default + description
- `src/lib/seed-content.ts` — About + compliance body copy (2 occurrences)

**Edit (tests):**
- `tests/e2e/chrome-consistency.spec.ts` — header/footer wordmark assertion (real dependency: wordmark = `siteName`)
- `tests/int/pages-fallback.spec.ts` — fixture page title (cosmetic; swapped to purge old brand)

**Do NOT touch:**
- `.planning/**`, `HANDOFF.md` — historical record
- `staragrevolution.com` domain refs (`.env.example`, `.claude/settings.json`) — name change ≠ domain change, not confirmed
- `src/migrations/*` — frozen schema snapshots; editing breaks checksums, no functional effect (a `defaultValue` string change needs no new migration; existing DB rows are unaffected)

## Task

1. Replace brand string in the 4 source files + 2 test files above.
2. Verify: `tsc --noEmit` clean, `pages-fallback` int test green.

## Out of scope (flagged, not done)

- **Prod/dev DB `SiteSettings.siteName`**: the actual rendered value on an
  existing DB is the stored row, not the code `defaultValue`. Nothing seeds it,
  so it must be updated once via Payload `/admin` (a CMS content edit by staff —
  correctly not code). Fresh instances pick up the new `defaultValue` automatically.
