---
quick_id: 260808-tcu
slug: insights-first-3-posts-t401
date: 2026-08-08
status: complete
---

T-401, at owner's explicit direction to research and complete this — write full publish-ready posts, not just a topic list.

## Task

1. Web-researched 3 topics before writing: import documentation requirements, Incoterms (FOB/CFR/CIF) for food buyers, IQF vs block-frozen mechanics.
2. Chose topics already pre-approved in SEO_PLAYBOOK §6, deliberately generic/industry-level — no VNP-specific facts invented.
3. Wrote full structured articles (H2 sections, bullet lists) — extended the lexical builder locally in a new seed script since the existing `richText()` helper only supports flat paragraphs.
4. 3 new placeholder SVG covers, same self-authored-placeholder convention as existing `scripts/seed-assets/`.
5. Checked every draft against CONTENT_PLAYBOOK §1's banned-word/pattern list — zero hits.
6. Seeded via new `scripts/seed-insights-t401.ts` (kept separate from the existing thin e2e-fixture seed file).
7. Logged as DECISION_LOG D-55, flipped T-401 to DONE.

## Acceptance

- `npx tsc --noEmit` clean.
- Seed script run successfully against local dev db, all 3 articles created.
- Verified real rendered HTML (H2s, lists) via curl, not flattened paragraphs.
- `insights.spec.ts` 4/4 pass (en+ar).
- `a11y-audit.spec.ts` 8/9 pass, zero WCAG violations on every real page (1 pre-existing unrelated flake).
