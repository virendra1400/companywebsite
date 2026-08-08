---
quick_id: 260808-sp4
slug: stale-test-fixes
date: 2026-08-08
status: complete
---

Investigated the 5 "pre-existing" test failures flagged across D-51/D-52/D-53 rather than leaving them as permanent noise. 2 of 5 were genuinely fixable stale tests, not flakes.

## Task

1. `contact-action.spec.ts`: RFQ subject assertion was stale — real `buildSubject()` builds a richer format than the old test expected. Fixed assertion, not code.
2. `products-revalidate-hook.spec.ts`: expected 8 revalidatePath calls, real code (correctly) makes 12 since T-105's redirect-shim path. Fixed assertion.
3. `sitemap.spec.ts` (3 failures): investigated further via standalone reproduction script calling the real `sitemap()` export against a fresh isolated db — proved the shipped code is correct. Confirmed environment/harness flake, not a bug. Not fixed (root cause not fully isolated), but verified rather than assumed.
4. Logged as DECISION_LOG D-54.

## Acceptance

- Unit+int suite: 92/97 → 94/97.
- Both fixed tests pass in isolation and in the full suite.
- sitemap.spec.ts's 3 remaining failures confirmed via direct reproduction to not indicate a real bug in shipped code.
