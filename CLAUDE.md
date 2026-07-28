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

- **Payload blocks:** schema definitions in `src/blocks/*.ts` (no "Block" suffix) paired 1:1 with React renderers in `src/components/blocks/*Block.tsx`, composed via `RenderBlocks.tsx`.
- **Collections:** `src/collections/*.ts` export a typed `CollectionConfig`, PascalCase name matching the filename, access-gated via `Boolean(user)` checks.
- **RTL:** never use physical-direction Tailwind utilities (`ml-*/mr-*/text-left/text-right/left-*/right-*`) — logical properties + `rtl:` variant only. Enforced by `npm run lint:rtl` (`scripts/check-physical-direction.mjs`).
- **Design tokens:** centralized in `globals.css` `@theme` block (Tailwind v4) — color ramp, 4px-multiple spacing scale, locked typography tiers, sourced from UI-SPEC docs.
- **Source comments** cite the originating research/phase decision inline (e.g. `// RESEARCH D-02/D-04 / Pattern 2: ...`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

- **Routing:** Next.js App Router, two route groups — `(site)/[locale]/` for public locale-prefixed pages (dynamic `[slug]` for CMS Pages, plus `products/` and `insights/` sections) and `(payload)/admin` + `(payload)/api` for the embedded Payload CMS.
- **CMS config:** `src/payload.config.ts`; collections in `src/collections/`.
- **Locale routing:** `src/middleware.ts` handles locale negotiation; `src/i18n/{routing,navigation,request}.ts` + `src/i18n/messages/{en,ar,fr,ru}.json` (next-intl v4).
- **Cross-cutting utilities:** `src/lib/` (`seo/`, contact form action + schema + CRM webhook + rate-limit, analytics).
- **Payload hooks:** `src/hooks/` (e.g. `revalidateCatalog`).
- **UI primitives:** `src/components/ui/` (shadcn/radix-ui).
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
