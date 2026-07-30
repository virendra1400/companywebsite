# Deferred Items — Phase 09

Out-of-scope discoveries logged during execution, not fixed per the executor scope boundary rule (only auto-fix issues directly caused by the current task's changes).

| Plan | Discovered during | File | Issue | Status |
|------|-------------------|------|-------|--------|
| 09-03 | Task 2 verify (`npx playwright test tests/e2e/insights.spec.ts`) | `src/app/(site)/[locale]/insights/[slug]/page.tsx` | `en: /insights/<slug> returns 200...` intermittently exceeds Playwright's default 30s test timeout on `page.goto` ("waiting until load"). Reproduced with a real Vercel Blob-backed `payload.db` copied into the worktree for verification; passes reliably (31.3s) with `--timeout=60000`. Root cause is real-network image fetch latency to Vercel Blob in dev mode, not app logic — confirmed by isolating the run (single worker, warm server) and by the fact this route (`[slug]/page.tsx`) is not in 09-03's `files_modified` and received zero edits from this plan | Not fixed — out of scope for 09-03, which only touches the `insights` list grid (`insights/page.tsx`), not the detail route |
