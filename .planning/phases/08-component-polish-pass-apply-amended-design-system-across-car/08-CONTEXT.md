# Phase 8: Component Polish Pass - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Task Boundary

Component Polish Pass — apply amended design system across cards, buttons, forms, CTA bands. Every reusable component (ProductCard, StatsBand, CertCard, buttons, forms, CTA bands, FAQ) consistently applies the amended design system with no residual v1 inconsistencies.

</domain>

<decisions>
## Implementation Decisions

### FAQ scope
- Build it this phase. No FAQ collection/block/component exists anywhere in the codebase today (verified by full-repo grep during UI research) despite being named in ROADMAP.md/PROJECT.md/REDESIGN-PLAN.md as in-scope for Phase 8.
- Follow 08-UI-SPEC.md Contract §6 exactly: official shadcn `accordion` (no vetting gate — official registry), same 12-block registration pattern (`src/blocks/Faq.ts`, `src/components/blocks/FaqBlock.tsx`, registered in `src/blocks/index.ts` / `Pages.ts` / `RenderBlocks.tsx` BLOCK_MAP under `faq`).

### Claude's Discretion
All 9 audit-fix items (Contract §1-§5) — apply verbatim as specified in 08-UI-SPEC.md, no open questions on those.

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond 08-UI-SPEC.md's Component Contracts — that document is the source of truth for exact class strings and file:line targets.

</specifics>

<canonical_refs>
## Canonical References

- `.planning/phases/08-component-polish-pass-apply-amended-design-system-across-car/08-UI-SPEC.md` (design contract, approved)
- `.planning/ROADMAP.md` Phase 8 section (goal statement)

</canonical_refs>
