# VNP Global Website — Session Handoff

> Read this first on resume. Rich narrative context to complement `.planning/STATE.md` + `.planning/ROADMAP.md`.
> Last updated: 2026-07-28 · Git HEAD at handoff: `7febd85` (branch `main`, pushed, tree clean)

---

## 0. TL;DR — what to do first

Nothing broken, nothing mid-flight. Working tree is clean and fully pushed to `origin/main`. This is a clean stopping point between milestone work.

**Next action:** start Phase 8 — `/gsd-discuss-phase 8` (no CONTEXT.md exists yet, phase dir is empty).

---

## 1. What this project is

Premium, multi-language **B2B corporate + lead-gen website** for **VNP Global** (renamed from Star Agrevolution mid-project — domain/`.planning` history predating the rename were left as-is) — an India-based agricultural/food products manufacturer & exporter. NOT e-commerce. Goal: a first-time international buyer trusts the company enough to send an inquiry/RFQ. Full brief in `.planning/PROJECT.md`.

- **Locales:** en (root), ar (RTL), fr, ru — path-prefixed. English is source of truth; ar/fr/ru are locale-ready with EN fallback, real translation deferred (user's explicit priority — i18n architecture stays live, don't build English-only).
- Font/design system amended in v2.0 Phase A (Phase 6) — see `.planning/redesign-v2-decisions.md`-style context in STATE.md if it exists, or `.planning/phases/06-*/`.

## 2. Tech stack (all live, in `src/`)

- **Next.js 16** (App Router, RSC) + **React 19** + **TypeScript strict**
- **next-intl v4** — locale routing/middleware, EN fallback
- **Tailwind v4** (CSS-first `@theme` in `src/app/globals.css`) — logical-property RTL, `rtl:` variant. **Gotcha:** custom `--spacing-*` tokens collide with named `max-w-*` utilities — always use bracket values (`max-w-[42rem]`), never `max-w-sm/md/lg/xl/2xl`.
- **Payload CMS 3.x** embedded in the Next app (`/admin`), **@payloadcms/db-postgres** (prod), SQLite locally
- **shadcn** (new-york preset)
- **Vitest** (unit + int) + **Playwright** (e2e, en+ar matrix)
- **Resend + react-email**, **@marsidev/react-turnstile**, **Plausible** (analytics — cookieless, no consent banner needed)
- Hosting: **Vercel** (region `fra1`/EU) + **Neon Postgres** (EU) + **Vercel Blob** (media)

## 3. Build/deploy setup — non-obvious pieces

- Local dev DB = SQLite (`payload.db`), media on local disk. Prod = Postgres + Blob, selected by env in `src/payload.config.ts`.
- Local `.env` must contain ONLY `DATABASE_URI=file:./payload.db` + a `PAYLOAD_SECRET`. Do NOT put `BLOB_READ_WRITE_TOKEN` locally. `.env*` is gitignored.
- Migrations committed in `src/migrations/`. Prod build = `vercel.json` → `payload generate:importmap && payload migrate && next build`. Non-destructive, DB persists across deploys.
- Schema changes: `npx payload migrate:create <name>` locally, commit the migration file.
- `images.unoptimized: true` in `next.config.ts` still in effect.
- Media collection read = public, write = admin-only.
- Deploy: `vercel deploy --prod`. CLI is authed in this sandbox as `virendra1400-9123` (confirmed working at this handoff). Builds ~2-15min, dispatch in background.

## 4. Live URLs

- **Prod:** https://star-agrevolution.vercel.app (SSO/Deployment Protection still ON — see open items) · Admin: `/admin`
- New domain purchase status: unconfirmed as of this handoff — check with user before assuming it's live.

## 5. What's BUILT — milestone status

**v1.0 (Phases 1-5): shipped and deployed.** Locale/RTL foundation, marketing/trust pages, product catalog, lead conversion (RFQ/inquiry/WhatsApp/analytics via Resend+Turnstile+Plausible), SEO infrastructure + insights/blog (hreflang, sitemaps, per-locale metadata, JSON-LD).

**v2.0 "Premium Redesign" milestone — in progress:**
- [x] Phase 6 — Design System Elevation (type scale, display tokens, rhythm/spacing) — completed 2026-07-24
- [x] Phase 7 — Hero & Homepage Narrative (elevated hero + new CMS trust blocks: TrustBar/ExportProcess/Testimonials) — completed 2026-07-24
- [ ] **Phase 8 — Component Polish Pass** (apply amended design system across cards, buttons, forms, CTA bands) — **current, not started, no CONTEXT.md yet**
- [ ] Phase 9 — Motion & Micro-interactions (reveal/stagger/hover, reduced-motion safe) — not started
- [ ] Phase 10 — Hardening (CWV, a11y, SEO deltas, cross-locale RTL QA; absorbs former standalone Phase 6) — not started

**Quick tasks completed since v2.0 started** (full list + commits in STATE.md "Quick Tasks Completed" table):
- Rebrand Star Agrevolution → VNP Global (code defaults, metadata, seed copy, tests)
- Simplified primary nav 9 → 5 items
- Fixed invisible/low-contrast shadcn dropdown/popover/dialog tokens sitewide
- Added persistent floating WhatsApp button
- Footer Instagram/LinkedIn icons from CMS `sameAs` field
- Contact form captcha UX (three-state messaging) + required-field indicators
- Logo sizing: two iterative CSS-only bumps (h-9→h-11/12/14, then h-12/h-14 + invert filter), **then a root-cause fix** (commit `f094040`, quick task 9): the uploaded logo SVG's viewBox was a full A4 export canvas with the actual mark occupying <20% of it — no CSS height could fix that. Recomputed a tight viewBox from the SVG's own path/text coordinates and replaced the same CMS Media doc in place via a one-time protected route (removed after use). `SiteSettings.logo` relationship unaffected, zero visual content changed, just a correctly-cropped asset.

## 6. Content model / data

Collections: Users(RBAC admin/editor), Media, Pages(blocks), Certifications, Categories, Products, Insights/blog. Global: Site Settings. Seed scripts idempotent, skip-by-slug. Build no longer reseeds — real content entered in `/admin` is safe.

## 7. Known issues / follow-up debt (not blocking, still real)

Carried from Phase 4 code review, never fully closed out:
- `contact-action.ts`: Turnstile `fetch` has no try/catch (breaks documented graceful-failure contract on network error).
- `contact-schema.ts`: no `.max()` bound on name/company/country/phone/destinationCountry/incoterm.
- `notifyCrm` fire-and-forget with no `after()`/`waitUntil` — risk of silent drops on Vercel serverless.
- `RESEND_FROM_ADDRESS`/`SALES_INBOX_ADDRESS` non-null-asserted without the same guard as `RESEND_API_KEY`.
- `notifyCrm` forwards `turnstileToken`/`companyWebsite` to the external CRM webhook unnecessarily.

**Placeholder still live:** WhatsApp CTA number (`910000000000`) is an intentional pre-launch placeholder in `src/lib/seed-content.ts` — needs the real number entered via CMS before launch. Flagged by user, not yet logged as a formal todo.

## 8. Testing / quality gates

`npm test` (Vitest), `npx playwright test` (e2e en+ar), `node scripts/check-physical-direction.mjs` (RTL logical-property gate).

## 9. OPEN ITEMS / next steps

1. **Start Phase 8** — `/gsd-discuss-phase 8` (Component Polish Pass: cards, buttons, forms, CTA bands against the amended v2.0 design system).
2. **Real WhatsApp number** — swap the `910000000000` placeholder before launch.
3. **New domain** — confirm purchase status; when live, add in Vercel project + point DNS.
4. **Vercel SSO** — turn off Deployment Protection before public/team access.
5. **`.env.example`** — verify the 6 Phase-4 env vars (`RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `SALES_INBOX_ADDRESS`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) are documented there — a past sandbox had a permission block on all `.env*` files that prevented this from ever being confirmed done.
6. **`.planning/HANDOFF.json`** is stale (still describes a Phase 05 gap-closure that's long since complete per ROADMAP/STATE) — safe to ignore or delete; superseded by this file + STATE.md.
7. Phases 9-10 not started.

## 10. How this was built (GSD workflow)

Pipeline per phase: `/gsd-discuss-phase N` → `/gsd-ui-phase N` (UI-SPEC) → `/gsd-plan-phase N` (research + planner + plan-checker) → `/gsd-execute-phase N` (wave-based executor in worktrees, atomic commits, build/test gate) → `/gsd-code-review N` → `gsd-verifier` → `phase.complete`. Quick fixes bypass this via `/gsd-quick`.

`commit_docs: true` in `.planning/config.json` — planning docs (CONTEXT/RESEARCH/PATTERNS/UI-SPEC/PLAN/SUMMARY/REVIEW/VERIFICATION) are committed to git, not gitignored.

**ponytail plugin active** (lazy-dev ladder) and **caveman plugin active** (terse responses) — both persist via plugin config across sessions, not session state.

## 11. Sandbox-specific gotchas learned in earlier sessions (may not apply to a fresh machine)

- `.env*` files were permission-blocked (Read/Write/Edit/Bash all denied) in at least one past sandbox — if you hit this again, note it as a follow-up rather than fighting it.
- `npm run build` stalling at "Creating an optimized production build..." has twice been a stale/corrupted `.next` Turbopack cache combined with memory pressure, not a code regression — `rm -rf .next` first.
- Vercel CLI device-flow auth under short foreground timeouts regenerates a new device code every retry. Run `nohup npx vercel login > logfile &` in the background with a long leash instead.
- A prior session also hit spurious SIGTERM(143) on build/test/tsc that turned out to be ~92 leaked `chroma-mcp` background processes eating sandbox memory — check `free -h` / `ps aux | grep chroma-mcp` before assuming a code defect.

## 12. Resume checklist

1. Read this file + `.planning/STATE.md` + `.planning/ROADMAP.md`.
2. `git log --oneline -10` — HEAD should be at or past `7febd85`; `git status` should be clean (it was at this handoff).
3. Check Vercel auth: `timeout 15 npx vercel whoami` (should return `virendra1400-9123`; if not, use the background-login pattern in §11).
4. Start Phase 8: `/gsd-discuss-phase 8`.
