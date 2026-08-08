---
quick_id: 260808-gvl
slug: isr-write-fix
date: 2026-08-08
status: complete
---

Fix Vercel ISR-write quota exhaustion (hit 200k/200k free tier, site risked auto-pause). Root cause: `export const revalidate = 60` on 6 route files, redundant with the already-built on-demand revalidate hooks, combined with ~40+ dev-cycle redeploys resetting the cache each time.

## Task

1. Bump `revalidate` from `60` to `3600` in all 6 route files (home, catch-all page, products index, product detail, insights index, insights detail).
2. Update the stale comment above each to explain the on-demand hooks are the real freshness mechanism, not this timer.
3. Log root cause + fix in DECISION_LOG D-48, cross-checked against Vercel's own Data Cache docs (linked in the warning email).
4. Note under T-206 (Performance pass, already IN PROGRESS) in TASK_BACKLOG.md.
5. Correct D-47's stale "not yet deployed" note while in the area (T-209 map deploy was independently verified live in an earlier quick task this session).

## Acceptance

- All 6 files use `revalidate = 3600`, comments accurate.
- DECISION_LOG + TASK_BACKLOG updated with evidence.
- Single atomic commit.
