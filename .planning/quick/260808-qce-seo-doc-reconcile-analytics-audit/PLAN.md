---
quick_id: 260808-qce
slug: seo-doc-reconcile-analytics-audit
date: 2026-08-08
status: complete
---

Reconcile the external SEO/AEO consultant doc into SEO_PLAYBOOK.md, correct a stale "analytics still open" note, and fix .env.example's missing vars.

## Task

1. Merged genuinely new parts of the external doc into SEO_PLAYBOOK.md as §10 (Keyword Research Framework) and §11 (Off-Page/Entity Consistency). Rejected 4 direct conflicts (per-country market pages vs D-47, split quality/manufacturing vs T-107, flat URLs vs locked E-01, multilingual-as-low-priority vs CLAUDE.md).
2. Discovered while reviewing: SEO_PLAYBOOK §9 still framed analytics vendor as an open GA4-vs-Plausible decision. It's not — Plausible was decided and fully implemented in Phase 4 (ANALY-01, checkpoint 04-05), code is launch-ready. Corrected §9.
3. Real gap found: `.env.example` was missing 6+ vars actually used in code (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `RESEND_*`, `TURNSTILE_*`, `SALES_INBOX_ADDRESS`, `BLOB_READ_WRITE_TOKEN`, `CRM_WEBHOOK_URL`) — a documented sandbox permission block had prevented this in an earlier phase (04-05-SUMMARY.md). No such block this session; fixed.
4. Logged all of this as DECISION_LOG D-49.

## Acceptance

- SEO_PLAYBOOK.md has accurate §9 + new §10/§11.
- .env.example documents every env var actually referenced in src/ and scripts/.
- DECISION_LOG D-49 records what was kept/rejected and why.
