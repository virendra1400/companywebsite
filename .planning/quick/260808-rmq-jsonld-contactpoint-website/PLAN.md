---
quick_id: 260808-rmq
slug: jsonld-contactpoint-website
date: 2026-08-08
status: complete
---

Continuing the SEO_PLAYBOOK §4 audit (same pass that found D-51): 2 more structured-data requirements from §4 were never implemented — `contactPoint` on Organization, and `WebSite` schema on home.

## Task

1. `organizationJsonLd()` takes optional `email`/`phone`, emits `ContactPoint` (contactType "sales", availableLanguage listing all 4 shipped locales) only when at least one is present.
2. New `websiteJsonLd()` builder, rendered only on the home page component (not site-wide).
3. Wired `email`/`phone` (already fetched via `getSiteBrand()`) through `layout.tsx`'s existing `organizationJsonLd` call.
4. Extended `seo-json-ld.spec.tsx` with 3 new tests.
5. Logged as DECISION_LOG D-52, TASK_BACKLOG T-204 third follow-up note.

## Acceptance

- `npx tsc --noEmit` clean.
- `seo-json-ld.spec.tsx`: 8/8 pass.
- `homepage.spec.ts` (en+ar): 8/8 pass.
- SEO_PLAYBOOK §4's structured-data checklist fully implemented.
