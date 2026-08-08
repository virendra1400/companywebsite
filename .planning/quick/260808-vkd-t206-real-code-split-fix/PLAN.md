---
quick_id: 260808-vkd
slug: t206-real-code-split-fix
date: 2026-08-08
status: complete
---

T-206 reopened. D-40's fix (dynamic-import ContactBlockView in RenderBlocks.tsx) never actually worked — root cause was that next/dynamic() doesn't code-split when called from a Server Component (documented Next.js limitation), not a bundler issue.

## Task

1. Tested webpack forcing — failed first (missing `graphql` peer dep), then succeeded but showed the same bundle overlap. Ruled out "wrong bundler."
2. Found the real cause via vercel/next.js#54935: dynamic() needs a Client Component call site.
3. Fixed: new `ContactFormLazy.tsx` ("use client") wraps just `ContactForm` in dynamic(). `ContactBlockView` (must stay server, uses next-intl/server) imports it statically. `RenderBlocks.tsx` back to plain static import of `ContactBlockView`.
4. Added a loading skeleton (real network fetch now happens where none did before).
5. Verified via direct chunk inspection (not just script-tag counting): 367KB react-hook-form chunk confirmed present only on /contact, absent from /, under both webpack and Turbopack.
6. Reverted graphql dependency, staying on Turbopack (default).
7. Investigated 2 intermittently-failing contact-error-state.spec.ts tests — confirmed pre-existing via 3x clean-HEAD stash comparison, not caused by this fix.
8. Investigated 8 e2e failures in a broad regression run — traced to ~15 accumulated stray processes from hours of session testing; killed them, re-ran clean: 17/18 pass.
9. Logged as DECISION_LOG D-57, TASK_BACKLOG T-206 updated (still IN PROGRESS pending Lighthouse re-measurement post-deploy).

## Acceptance

- npx tsc --noEmit clean, lint:rtl clean.
- Unit suite 94/97 (unchanged baseline).
- e2e 17/18 clean (1 remaining is an already-verified unrelated flake).
- Direct chunk-content verification confirms the split is real, not just a script-tag count.
