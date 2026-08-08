---
quick_id: 260808-r1n
slug: page-metadata-audit-fix
date: 2026-08-08
status: complete
---

SEO technical audit (Phase B of the SEO work plan) found a real, previously-unflagged gap: 9 route types (home, 6 interior pages, /products, /insights) × 4 locales had zero page-specific metadata, silently inheriting the root layout's generic default. T-204 claimed "technical SEO pass DONE" but missed this.

## Task

1. Added `seo` group (title/description/ogImage, localized) to `Pages` collection, matching `Products.seo`.
2. Hand-wrote Postgres migration (`payload migrate:create` hit a pre-existing Drizzle-Kit snapshot version mismatch, unrelated to this change) mirroring T-103's exact column/constraint/index pattern for the new columns.
3. Regenerated `payload-types.ts`.
4. Added `generateMetadata` to home, `[slug]/page.tsx` (6 interior pages), `products/page.tsx`, `insights/page.tsx` — CMS override first, falling back to copy reused from each page's own already-approved hero content (no fabrication — repackaging existing approved copy into meta tags).
5. Logged in DECISION_LOG D-50, TASK_BACKLOG T-204 follow-up note.

## Acceptance

- `npx tsc --noEmit` clean.
- `npm run lint` — zero new errors.
- `homepage.spec.ts` + `nav-links.spec.ts` full regression (en+ar): 12/12 pass.
- All 9 route types now emit page-specific title/description/canonical/hreflang.
