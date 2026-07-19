
## DEPLOY CEILING (must fix before real content / launch)
- vercel.json build uses `payload migrate:fresh` = DROPS + recreates the prod Neon schema on EVERY deploy (data wiped, then build-seeded placeholder re-created). Fine while all content is placeholder. BEFORE editors enter real content or launch: replace with COMMITTED incremental Payload migrations (`payload migrate:create` locally against a Postgres, commit the files, buildCommand = `payload migrate`). Otherwise a redeploy wipes real CMS content.

## DEPLOY CEILING — RESOLVED (2026-07-16)
- Committed Payload migration `src/migrations/20260716_120723_init.ts`; build now runs non-destructive `payload migrate && next build` (was `migrate:fresh` which wiped the DB each deploy). Transition deploy applied+recorded the migration. Admin content now PERSISTS across deploys. Future schema changes: run `payload migrate:create <name>` locally (works offline), commit the new migration file.
