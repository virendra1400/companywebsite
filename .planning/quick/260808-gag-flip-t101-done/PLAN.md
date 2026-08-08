---
quick_id: 260808-gag
slug: flip-t101-done
date: 2026-08-08
status: complete
---

Flip T-101 (Design tokens & global styles) in playbook/TASK_BACKLOG.md from `TODO` to `DONE`. Tokens are already implemented in src/app/globals.css `@theme` block — colors (§2), type scale, spacing/radius/shadow (§4), motion durations (§6), all explicitly comment-tagged "(T-101)" in the source. Card was just never flipped after the work landed.

## Task

1. Edit `playbook/TASK_BACKLOG.md` line 53: change `` `TODO` `` to `` `DONE` `` on the T-101 heading line.
2. Add a "Done" note line directly under it, matching the style of neighboring entries (e.g. T-102/T-106): what was built, where (`src/app/globals.css` `@theme` block), and that it was done as part of earlier styling work rather than as its own dedicated pass — hence the stale card.
3. Commit with a message describing the backlog correction.

## Acceptance

- T-101 line reads `DONE` with a short evidence-linked note.
- No other backlog lines touched.
- Single atomic commit.
