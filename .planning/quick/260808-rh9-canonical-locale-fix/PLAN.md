---
quick_id: 260808-rh9
slug: canonical-locale-fix
date: 2026-08-08
status: complete
---

While fixing D-50 (missing page metadata), found a more severe bug: `buildAlternates()`'s `canonical` was hardcoded to the English URL for every call, regardless of rendering locale — every non-English page's own canonical pointed at its English counterpart, telling Google it's not the authoritative version of itself.

## Task

1. Added required `currentLocale`/`locale` param to `buildAlternates`/`buildMetadata` — canonical now self-references the current locale, `languages`/`x-default` unaffected.
2. Threaded through all 6 production call sites + sitemap.ts's own call.
3. Updated 2 existing unit test files that had encoded the bug as expected behavior; added 2 new regression tests.
4. Ran full unit + e2e suites; found 5 pre-existing failures, confirmed unrelated via `git stash` + re-run against clean HEAD for all 5.
5. Logged as DECISION_LOG D-51, TASK_BACKLOG T-204 second follow-up note.

## Acceptance

- `npx tsc --noEmit` clean.
- `seo-alternates.spec.ts` + `seo-metadata.spec.ts`: 11/11 pass including 2 new regression tests.
- Full e2e regression: 26/31 pass, 5 pre-existing failures confirmed unrelated.
