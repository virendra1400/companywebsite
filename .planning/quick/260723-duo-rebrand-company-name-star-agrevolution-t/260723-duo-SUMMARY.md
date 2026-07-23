---
quick_id: 260723-duo
slug: rebrand-company-name-star-agrevolution-t
date: 2026-07-23
status: complete
---

# Quick Task 260723-duo Summary: Rebrand Star Agrevolution → VNP Global

## What changed

Brand string `Star Agrevolution` → `VNP Global` in 6 files:

| File | Change |
|------|--------|
| `src/globals/SiteSettings.ts` | `siteName` `defaultValue` |
| `src/lib/payload-fetch.ts` | `getSiteBrand` fallback |
| `src/app/(site)/[locale]/layout.tsx` | metadata title template, default, description |
| `src/lib/seed-content.ts` | About + compliance body copy (2×) |
| `tests/e2e/chrome-consistency.spec.ts` | header/footer wordmark assertion (2×) |
| `tests/int/pages-fallback.spec.ts` | fixture titles (5×) |

## Verification

- `tsc --noEmit` — clean (exit 0)
- `vitest run tests/int/pages-fallback.spec.ts` — 4/4 passed
- `grep -ri "star agrevolution" src/ tests/` — no live hits (only frozen `src/migrations/*` snapshots remain, intentionally)
- E2E `chrome-consistency` not run (needs live dev server + fresh DB); change is mechanically correct — wordmark sources `siteName`, whose default is now "VNP Global".

## Deliberately left

- **`src/migrations/*`** — frozen schema snapshots; editing breaks migration checksums and has no functional effect on existing DBs.
- **Domain `staragrevolution.com`** (`.env.example`, `.claude/settings.json`) — name rebrand ≠ domain change; not confirmed by user.
- **`.planning/**`, `HANDOFF.md`** — historical record.

## Follow-up (owner action, not code)

**Prod + local dev DB `SiteSettings.siteName` still holds "Star Agrevolution".**
Nothing seeds it; the code `defaultValue` only applies when the global row is
first created. Update it once in Payload `/admin` → Settings → Site Settings.
Fresh deployments with an empty DB get "VNP Global" automatically.
