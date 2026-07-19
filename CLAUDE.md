<!-- GSD:project-start source:PROJECT.md -->
## Project

**Agro Export Corporate Website** — premium, multi-language (en/ar-RTL/fr/ru) B2B **corporate + lead-generation** site for an India-based agricultural/food exporter. NOT e-commerce. Job: make a first-time international buyer trust the company enough to send a serious inquiry/RFQ. Everything serves trust→qualified-lead conversion.

### Constraints
- **Localization**: 4 locales incl. Arabic RTL — full layout mirroring; i18n architected in from day one.
- **Content model**: Headless CMS, per-locale fields; non-technical staff edit products/content/translations without a dev.
- **Scalability**: catalog/content grow (new products/categories/languages) without re-architecture.
- **Performance/SEO**: international audience, varied networks; fast Core Web Vitals + technical SEO are requirements.
- **Translation quality**: published non-English copy = professional human translation; English is source of truth.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

**Full rationale, alternatives, versions, sources → [.planning/STACK.md](.planning/STACK.md).** Summary below; open STACK.md only when a stack/tooling decision is in play.

- **Framework:** Next.js 16 App Router + React 19 + TypeScript strict.
- **i18n:** next-intl v4 — locale-prefixed routes (`/en /ar /fr /ru`), EN fallback, RSC-aware. Arabic is RTL.
- **Styling:** Tailwind v4 (`@theme` in globals.css), logical properties (`ms-*/me-*/ps-*/pe-*`) + `rtl:` variant — one mirrored layout, no parallel RTL sheet.
- **CMS:** Payload 3 embedded in the Next app; Postgres (Neon) + Vercel Blob storage. Localized fields, EN fallback, collections+relationships.
- **Forms (Phase 4):** react-hook-form + zod (shared client/server schema) → Server Action → Resend email + optional CRM webhook. Cloudflare Turnstile + honeypot for spam.
- **Contact CTA:** `wa.me` click-to-chat (no WhatsApp Business API at launch).
- **Hosting:** Vercel (region fra1). ISR + on-demand revalidate on CMS change.
- **Analytics:** GA4+GTM w/ consent banner, or Plausible (cookieless) — decide Phase 4.
- **SEO:** native `sitemap.ts`/`robots.ts`/`generateMetadata` hreflang + JSON-LD.
- **Do NOT use:** WordPress/WPML, next-i18next, reCAPTCHA-only, MT for published copy, Tailwind v3 physical `ml-*/mr-*`.

**Benchmark:** piyushfarms.com (WordPress, EN-only) = floor to clear. staragrevolution.com = parked Squarespace holding page, greenfield build (DNS cutover only at launch).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase. See `graphify-out/GRAPH_REPORT.md` for a generated code-graph overview.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
