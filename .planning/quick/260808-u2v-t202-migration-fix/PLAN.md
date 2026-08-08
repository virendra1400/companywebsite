---
quick_id: 260808-u2v
slug: t202-migration-fix
date: 2026-08-08
status: complete
---

T-401's production deploy (piggybacking scripts/seed-insights-t401.ts) failed. Root cause was a real bug in an earlier commit (T-202's SiteSettings.resourceDocuments migration), not T-401 itself.

## Task

1. Diagnosed via `vercel inspect --logs`: build failed prerendering `/contact` with `relation "site_settings_resource_documents_locales" does not exist`.
2. Root cause: the original migration put title/description/_locale directly on the array-row table (wrong pattern, copied from products_specs_* where every sub-field is locale-specific). resourceDocuments mixes localized (title/description) and non-localized (file) sub-fields — needs a separate `_locales` child table, same shape as `Products.downloads`/`products_downloads_locales`.
3. Wrote a corrective migration (couldn't edit the already-applied one), verified schema against the correct existing analog before writing.
4. Also fixed a real 11-minute hang in the same failed build: `payload.destroy()` alone didn't let the seed script's process exit. Added `process.exit(0)`.
5. Redeployed, verified live via curl against vnpglobal.in.
6. Logged as DECISION_LOG D-56.

## Acceptance

- Deploy succeeded (Vercel status: Ready).
- Live production verified via curl: /contact, /resources, /insights, all 3 T-401 articles — all 200.
- vercel.json buildCommand reverted to normal.
