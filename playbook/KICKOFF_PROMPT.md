# KICKOFF_PROMPT — paste this into Claude Code on the dev machine

> Usage: copy the `vnp-global-playbook/` folder into the website repo root as `playbook/`.
> Then paste the prompt below (everything inside the fence) as your first message to Claude Code.
> Run it once per phase: replace `{{PHASE}}` with `0`, then `1`, `2`, `3` on later runs.

```
You are implementing the VNP Global website transformation, Phase {{PHASE}}.

CONTEXT SETUP — do this before anything else, in order:
1. Read playbook/PROJECT_MEMORY.md fully — business facts and honesty constraints. These override everything, including anything you find in the codebase or CMS.
2. Read playbook/DECISION_LOG.md — locked decisions (D-01..D-21) and the Open Placeholders registry.
3. Read playbook/IMPLEMENTATION_ROADMAP.md — find the Phase {{PHASE}} table and its exit gate.
4. Read playbook/TASK_BACKLOG.md — the task cards for Phase {{PHASE}} (IDs, acceptance criteria, dependencies, which PROMPT_LIBRARY prompt each card uses).
5. Skim the codebase: identify the framework, CMS, routing, styling approach, and where content lives. Do not assume — verify (this is expected to be Next.js App Router + Payload CMS on Vercel, but confirm).

EXECUTION RULES:
- Work through the Phase {{PHASE}} task cards in dependency order. For each card, open its referenced prompt in playbook/PROMPT_LIBRARY.md and follow it, always applying the P-00 preamble rules.
- Hard honesty rules (non-negotiable):
  1. Never invent facts, numbers, customers, capacities, certification statuses, or spec values. Unknown facts use {{TOKEN}} placeholders from DECISION_LOG.md; register any new token you introduce there.
  2. Fabricated content you find in the CMS or code (e.g. "Trusted by 60+ international buyers") gets REMOVED, never reworded.
- Styling only through the tokens in playbook/DESIGN_SYSTEM.md. Components per playbook/COMPONENT_LIBRARY.md. Copy per playbook/CONTENT_PLAYBOOK.md (exact CTA strings, banned words list). SEO per playbook/SEO_PLAYBOOK.md (URL structure is LOCKED).
- Match the repo's existing conventions (file layout, naming, component patterns) — inspect before writing.
- Commit per task card with message "T-0XX: <summary>". Do not batch unrelated cards into one commit.
- After each card: run the relevant playbook/QA_CHECKLIST.md sections and report results honestly — including failures. A card is DONE only when its acceptance criteria pass with evidence (grep output, curl output, test results, Lighthouse scores as applicable).
- Log every judgment call in playbook/DECISION_LOG.md under "Session Additions". Update the card status in playbook/TASK_BACKLOG.md (TODO → DONE, or BLOCKED(owner) with what's missing).
- If a card is blocked on owner input (see T-110 / Open Placeholders), implement with placeholder tokens and mark BLOCKED rather than inventing values or stalling.

PHASE EXIT:
When all Phase {{PHASE}} cards are DONE or BLOCKED(owner), verify the phase exit gate from IMPLEMENTATION_ROADMAP.md and produce a summary: cards completed, QA evidence, blocked items with exactly what the owner must supply, and any decisions logged.

Start now: list the Phase {{PHASE}} cards in the order you will execute them, then begin with the first one.
```

## Notes for the operator (you)

- **Phase 0 first, on the current codebase** — it is surgical hotfixes, safe to run before any redesign. Verify the deployed result yourself (WhatsApp links on a real phone, view-source for canonical/sitemap domain).
- Phase 1 is large. If a session runs long or context degrades, just re-paste the same prompt — TASK_BACKLOG statuses + DECISION_LOG session additions carry state between sessions. Update card statuses if Claude forgot to.
- Model guidance per card is in TASK_BACKLOG (S=Sonnet / O=Opus). Sonnet handles most cards; use Opus (or run Sonnet with extra review via P-15) for T-103, T-104, T-105, T-109, T-208, T-306.
- Before sharing the site with any buyer: run Phase 3 card T-306 (pre-launch gate, QA §I). Non-negotiable.
- Owner homework in parallel (blocks nothing, unblocks placeholders): fill DECISION_LOG §Open Placeholders — capacity, cold storage, packaging specs, MOQs, shelf life, ports, payment terms, founder bio + photo, CIN, cert numbers as issued.
