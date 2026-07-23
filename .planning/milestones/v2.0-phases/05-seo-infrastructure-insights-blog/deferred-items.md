# Deferred Items — Phase 05

Out-of-scope discoveries logged during plan execution. Not fixed (per executor scope boundary — only auto-fix issues directly caused by the current task's changes).

## 05-01

- **Pre-existing broken migration file:** `src/migrations/20260716_120723_init.ts` throws `TypeError: db.execute is not a function` when run via `CI=true PAYLOAD_MIGRATING=true npx payload migrate`. This predates 05-01 (not touched by this plan) and is unrelated to the Insights collection — local dev uses SQLite auto-sync-on-connect (no migration needed), so this did not block Task 3's verification (the two integration specs ran green against the live `insights` table via the normal test-DB connect path). Surfaced here for whoever owns the committed-migrations path later (see payload.config.ts's `push: true` comment re: eventual migration-file adoption).
