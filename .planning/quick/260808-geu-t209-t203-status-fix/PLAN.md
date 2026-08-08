---
quick_id: 260808-geu
slug: t209-t203-status-fix
date: 2026-08-08
status: complete
---

Two backlog corrections in playbook/TASK_BACKLOG.md, both stale-card fixes found by checking production/code directly (same pattern as T-101).

## Task

1. T-209 follow-up (real world map): `DONE (committed, not deployed)` -> `DONE (deployed, verified live)`. Verified via curl against production: WorldMapInteractive (real d3-geo/topojson geometry) live on vnpglobal.in/export and homepage, combined "Our Primary Focus" set (AE/SA/QA/KW/BH/OM/SG/VN/ID/MV) confirmed present with "Maldives" text on both pages.
2. T-203 Product FAQs: `TODO` -> infra done, content blocked. CMS `faq` field on Products, `ProductFaq.tsx`, FAQPage JSON-LD all wired and live in the product template. `scripts/seed-products.ts` has zero FAQ entries — content/data-entry gap, not a dev task. Same shape as T-103.

## Acceptance

- Both lines corrected with evidence-linked notes.
- No other backlog lines touched.
