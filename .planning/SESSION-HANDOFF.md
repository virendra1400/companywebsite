# Star Agrevolution — Session Handoff

> Read this first on resume. Rich narrative context to complement `.planning/STATE.md` + `.planning/ROADMAP.md`.
> Last updated: 2026-07-21 · Git HEAD at handoff: `b243bcf` (branch `main`)

---

## 0. TL;DR — what to do first

**Phase 4 (Lead Conversion) is code-complete and merged to `main`.** It is NOT deployed yet this session. Two things block it from actually working live:

1. **Deploy it.** This sandbox IS Vercel-authenticated (`vercel whoami` → `virendra1400-9123`) — CLI login carried over from the web session. Run `vercel deploy --prod` (background it, builds run 2-15min).
2. **Set 6 env vars in the Vercel dashboard** (Project → Settings → Environment Variables) — without these the form/WhatsApp-analytics ship but silently no-op:
   ```
   RESEND_API_KEY=
   RESEND_FROM_ADDRESS=        (verified sending subdomain, NOT root domain)
   SALES_INBOX_ADDRESS=
   TURNSTILE_SECRET_KEY=
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=   (Plausible was chosen over GA4+GTM this session — cookieless, no consent banner shipped)
   ```
   `.env.example` was NOT updated with these — this sandbox has a hard permission block on all `.env*` files (Read/Write/Edit/Bash all denied, confirmed repeatedly). **Someone with normal file access needs to add these 6 lines to `.env.example` by hand.**

---

## 1. What this project is

Premium, multi-language **B2B corporate + lead-gen website** for **Star Agrevolution** — an India-based agricultural/food products manufacturer & exporter. NOT e-commerce. Goal: a first-time international buyer (GCC/Europe/NA/Africa/SEA/CIS) trusts the company enough to send an inquiry/RFQ. Full project brief in `.planning/PROJECT.md`.

- **Brand palette:** deep forest green (`primary-700 #1B5E45`, `primary-900 #0F2E22`) + gold accent (trim only, never CTA fill) on white. Font: IBM Plex Sans + IBM Plex Sans Arabic.
- **Locales:** en (root), ar (RTL), fr, ru — path-prefixed (`/ar/…`). English live; ar/fr/ru are locale-ready with EN+notice fallback. **English-first priority confirmed by user this session** — build/test in English, i18n architecture stays live, real translations stay deferred.
- **Inspiration floor:** piyushfarms.com. **Own domain (parked, to be replaced):** staragrevolution.com — user is buying a NEW domain.

## 2. Tech stack (all live, in `src/`)

- **Next.js 16** (App Router, RSC) + **React 19** + **TypeScript strict**
- **next-intl v4** — locale routing/middleware, EN fallback
- **Tailwind v4** (CSS-first `@theme` in `src/app/globals.css`) — logical-property RTL, `rtl:` variant
- **Payload CMS 3.x** embedded in the Next app (`/admin`), **@payloadcms/db-postgres**
- **shadcn** (new-york preset) — Button/Card/Badge/Input/Textarea/Label/Form/Sheet/DropdownMenu/AspectRatio/Select
- **Vitest** (unit + int) + **Playwright** (e2e, en+ar matrix)
- **Resend + react-email** (transactional email, Phase 4), **@marsidev/react-turnstile** (spam defense, Phase 4), **Plausible** (analytics, Phase 4 — script tag only, no SDK dependency)
- Hosting: **Vercel** (region `fra1`/EU) + **Neon Postgres** (EU) + **Vercel Blob** (media, US `iad1`)

## 3. Build/deploy setup — READ THIS, it has non-obvious pieces

- **Local dev DB = SQLite** (`payload.db`), media on local disk. **Prod = Postgres + Blob**, selected by env in `src/payload.config.ts` (`DATABASE_URL` set → Postgres; `BLOB_READ_WRITE_TOKEN` set → Blob).
- Local `.env` must contain ONLY `DATABASE_URI=file:./payload.db` + a `PAYLOAD_SECRET`. **Do NOT put `BLOB_READ_WRITE_TOKEN` locally** (it makes dev upload to the real prod Blob). `.env*` is gitignored. `vercel env pull` / `vercel link` may recreate `.env.local` with the prod Blob token — delete it if so.
- **This sandbox's `.env`** was recreated this session with dummy dev-only values (`DATABASE_URI=file:./payload.db`, placeholder `PAYLOAD_SECRET`) purely to get local `npm run build`/`npm test` working — not real secrets, gitignored, fine to leave or delete.
- **Migrations are committed** in `src/migrations/` (init + site_settings). Prod build = `vercel.json` → `payload generate:importmap && payload migrate && next build`. **Non-destructive** — DB persists across deploys.
- **Schema changes going forward:** run `npx payload migrate:create <name>` LOCALLY (works offline — set a dummy `DATABASE_URL=postgres://u:p@localhost:5432/none` to select the pg dialect), commit the new migration file.
- **importMap** (`src/app/(payload)/admin/importMap.js`) MUST include plugin admin components — build regenerates it (`generate:importmap` step).
- **Images:** `next.config.ts` sets `images.unoptimized: true`. Re-enable optimizer for RASTER media in Phase 6 if wanted.
- **Media collection read = PUBLIC**. Write stays admin-only.
- **Deploy cmd:** `vercel deploy --prod` (CLI authed as `virendra1400-9123` in THIS sandbox now — confirmed working via `vercel whoami` at handoff time; a fresh sandbox/session will need `vercel login` again, device-flow — see §11 below for the gotcha that burned a lot of time this session). Builds take ~2–15 min; dispatch in background, poll `vercel ls star-agrevolution`. Vercel **Deployment Protection (SSO)** is ON.

## 4. Live URLs

- **Prod:** https://star-agrevolution.vercel.app (SSO-gated) · **Admin:** /admin
- **NOT yet redeployed with Phase 4 changes as of this handoff** — last known-good prod deploy predates the lead-conversion work.

## 5. What's BUILT

**Phases 1-3 (complete, live in prod as of last deploy):** locale/RTL foundation, marketing/trust pages, product catalog. See prior handoff history in git log for details (`git log --oneline --grep="^feat\|^fix" -30`) — this section is trimmed to keep the handoff current; full narrative is in git history + `.planning/phases/01-*/`, `02-*/`, `03-*/` SUMMARY.md files.

**Phase 4 — Lead Conversion, RFQ, Inquiry, WhatsApp, Analytics (complete this session, NOT yet deployed):**

- `src/lib/contact-action.ts` — `submitContactForm` Server Action: honeypot (silent fake-success) → rate-limit (in-memory, 3/60s, keyed on the LAST `X-Forwarded-For` entry — see §7 CR-01) → Turnstile `siteverify` → `resend.emails.send` → fire-and-forget CRM webhook stub (`src/lib/crm-webhook.ts`, no-ops when `CRM_WEBHOOK_URL` unset).
- `src/lib/contact-schema.ts` — extended with email/phone (at-least-one-required), RFQ fields (quantity/destinationCountry/incoterm), honeypot (`companyWebsite`), `turnstileToken`.
- `src/components/blocks/ContactForm.tsx` — real submission, full idle/loading/success/error/rate-limited state machine, RFQ mode driven by `?product=` query param (single shared form, not two routes).
- `src/components/ui/select.tsx` — new shadcn component, used for the Incoterm field (11 Incoterms 2020 codes).
- `src/lib/analytics.ts` — provider-agnostic `trackEvent()` wrapper (dispatches to `window.dataLayer` or `window.plausible`, whichever is mounted; no-ops if neither). Fires `rfq_submit` / `inquiry_submit` / `whatsapp_click`.
- `src/components/chrome/WhatsAppCta.tsx` — shared header/mobile-nav WhatsApp button, wired to `getSiteBrand().waHref`.
- `src/components/chrome/WhatsAppTrackedLink.tsx` — thin client wrapper added late this session to fix a real gap: 3 other WhatsApp links (Hero secondary CTA, Contact page's own link, CTA-band block reused across ~8 pages) weren't firing `trackEvent` at all. Now they all do.
- **Analytics vendor: Plausible** (user's choice this session over GA4+GTM) — cookieless, script mounted in `src/app/(site)/[locale]/layout.tsx` guarded on `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. No consent banner shipped (correctly — GA4 path would have needed one, Plausible doesn't).
- Test coverage: 11 unit test files (Vitest, mocked Resend/fetch/Turnstile — these are server-to-third-party calls Playwright cannot observe), 5 e2e spec files (Playwright, client-observable states only). 45/45 unit tests pass, full e2e suite passed inside executor worktrees during the session (this sandbox's OWN `npm run dev` has intermittent `ERR_CONNECTION_REFUSED` issues for Playwright — see §11).

## 6. Content model / data (all CMS-editable in `/admin`, persists across deploys)

Collections: Users(RBAC admin/editor), Media, Pages(blocks), Certifications, Categories, Products. Global: Site Settings. Seed script `scripts/seed-pages.ts` + `scripts/seed-products.ts` (idempotent, skip-by-slug). **Build no longer reseeds** — real content entered in `/admin` is safe.

## 7. Known issues / follow-up debt (not blocking, but real)

From code review (`.planning/phases/04-lead-conversion-rfq-inquiry-whatsapp-analytics/04-REVIEW.md`), one Critical was found and **fixed this session** (commit `555ae3b`): the rate limiter keyed on the first `X-Forwarded-For` entry, which is client-spoofable — a bot could rotate a fake IP per request and bypass the limit entirely. Fixed to use the last entry (the one Vercel's own edge appends).

**5 Warnings intentionally left unfixed** (user chose speed over full remediation this session — real but non-launch-blocking):
- `contact-action.ts`: Turnstile `fetch` has no try/catch (breaks the module's own documented graceful-failure contract on network error).
- `contact-schema.ts`: no `.max()` bound on name/company/country/phone/destinationCountry/incoterm — unbounded strings can enter the email/CRM payload.
- `void notifyCrm(data)` is unawaited fire-and-forget with no `after()`/`waitUntil` — risk of silent drops on Vercel's serverless runtime.
- `RESEND_FROM_ADDRESS`/`SALES_INBOX_ADDRESS` are non-null-asserted without the same guard as `RESEND_API_KEY` — partial misconfig masquerades as a generic network error.
- `notifyCrm` forwards `turnstileToken`/`companyWebsite` to the external CRM webhook — unnecessary internal-field exposure.

Also flagged by phase-goal verification, **not yet independently confirmed**: whether `trackEvent` payloads genuinely never include PII across all 5 plans' call sites (code inspection says yes; no automated negative-assertion test exists — this is a judgment-tier item, see `04-VERIFICATION.md` human_verification_recommended).

## 8. Testing / quality gates

`npm test` (Vitest, unit — 45/45 passing at handoff), `npx playwright test` (e2e en+ar — passes inside isolated worktrees; **this sandbox's own dev server has been unreliable for local e2e runs**, see §11), `node scripts/check-physical-direction.mjs` (RTL logical-property gate). **Known Tailwind-v4 gotcha:** custom `--spacing-*` tokens collide with named `max-w-*` utilities — always use bracket values (`max-w-[42rem]`), never `max-w-sm/md/lg/xl/2xl`.

## 9. OPEN ITEMS / next steps

1. **Deploy Phase 4** — see §0. This is the immediate next action.
2. **Set the 6 analytics/email/spam env vars** in Vercel dashboard (§0) — form is non-functional live without them (fails gracefully, doesn't crash, just silently no-ops).
3. **Add the same 6 vars to `.env.example`** by hand (sandbox permission block prevented this all session).
4. **New domain:** user is buying one. When provided: add it in Vercel project + point DNS.
5. **Vercel SSO:** turn off Deployment Protection before public/team access.
6. **Company name/logo:** still hardcoded in CMS page body text (About/Company pages) — edit in `/admin` or script a one-time content update once the real name is confirmed.
7. **Phase 5 (SEO/blog):** not started. hreflang, sitemaps, per-locale metadata, structured data (Organization/Product JSON-LD), insights/blog. STATE.md already shows `current_phase: 5`, no CONTEXT.md yet — start with `/gsd-discuss-phase 5`.
8. **Phase 6 (perf/RTL QA):** not started.

## 10. How this was built (GSD workflow)

**GSD core was freshly installed this session** (`npx @opengsd/gsd-core@latest --claude --local`) — `.claude/agents/`, `.claude/commands/`, `.claude/gsd-core/` are all new this session and now committed to git (previously this was a fresh clone/environment without them).

Pipeline per phase: `/gsd-discuss-phase N` → `/gsd-ui-phase N` (UI-SPEC contract) → `/gsd-plan-phase N` (research + planner + plan-checker verify loop) → `/gsd-execute-phase N` (wave-based executor subagents in git worktrees, atomic commits, post-merge build/test gate) → `/gsd-code-review N` → phase-goal verification (`gsd-verifier`) → `phase.complete`.

**Important config change this session:** `commit_docs` flipped from `false` to `true` in `.planning/config.json` — `.gitignore` already documented planning docs as intentionally committed for this personal repo (a prior, separate decision), but the config flag hadn't been updated to match, causing merge blocks (worktree cleanup refuses to merge into a dirty main). Planning docs (CONTEXT/RESEARCH/PATTERNS/UI-SPEC/VALIDATION/PLAN/SUMMARY/REVIEW/VERIFICATION, all of it) are now committed going forward.

**ponytail plugin also installed and active this session** (`ponytail@ponytail`, currently at `ultra` intensity) — lazy-dev ladder enforced on all code written: skip if unneeded, reuse existing code, stdlib/native before deps, shortest working diff, `ponytail:` comments mark deliberate simplifications with their ceiling/upgrade path. Persists across sessions via the plugin, not session state — should still be active on resume unless explicitly turned off.

## 11. Sandbox-specific gotchas learned this session (may not apply to your environment)

- **`.env*` files are permission-blocked** for Read/Write/Edit/Bash in this sandbox specifically — every attempt to touch `.env.example` failed with "directory is denied by your permission settings." `.env` itself could be Written (create) but not Read or grepped. This blocked 3 different executor agents from documenting new env vars in `.env.example` — always ended up as a manual follow-up note instead.
- **Background agents (executors, planner) got interrupted mid-task repeatedly** — notifications came back as "stopped... may have been running when the previous Claude Code process exited," not a code error. Resuming via `SendMessage` to the same agent ID always recovered cleanly with no lost work (git commits already made were intact) — just cost real wall-clock time. If you see this, check the agent's worktree via `git log`/`git status` before assuming anything broke.
- **`npm run build` stalled 3x in a row** at "Creating an optimized production build..." (SIGTERM after 300-400s) after a heavy session — turned out to be a stale/corrupted `.next` Turbopack cache combined with memory pressure (7.8Gi total, only ~700Mi free at the time). `rm -rf .next` fixed it immediately (72s clean build after). If build hangs at that exact step again, clear `.next` first before assuming a code regression.
- **Vercel CLI auth via device-flow is finicky under repeated tool timeouts** — `npx vercel whoami`/`login` on a short (25-30s) foreground timeout generates a NEW device code every retry (previous code dies with the process), so the user never gets a stable code+URL to actually approve in time. Fix: run `nohup npx vercel login > logfile &` in the background with a long leash, read the ONE code from the log, and don't kill/retry the process — let it sit and poll until the user approves. Confirmed working this way (`vercel whoami` → `virendra1400-9123`).
- **`npx vercel` in this sandbox has never had stored credentials by default** — every fresh check starts a login flow from zero. If a new session shows the same "No existing credentials found," that's expected, not a regression — just redo the background-login pattern above.

## 12. Resume checklist

1. Read this file + `.planning/STATE.md` + `.planning/ROADMAP.md`.
2. `git log --oneline -20` to see recent work; HEAD should be ≥ `b243bcf`.
3. Check Vercel auth: `timeout 15 npx vercel whoami`. If not authed, use the background-login pattern in §11.
4. **Deploy Phase 4** (§0) if not already done — check `vercel ls star-agrevolution` for the newest deployment timestamp vs. this handoff's date.
5. Local sanity if needed: `.env` = SQLite only (recreate if missing: `DATABASE_URI=file:./payload.db` + any `PAYLOAD_SECRET`); `npm install`; `npm run db:seed`; `npm run build` (clear `.next` first if it stalls, §11).
6. Once deployed + env vars set: manually smoke-test the live `/contact` form (general inquiry + one RFQ via a product page) and confirm an email actually arrives.
7. Then move to Phase 5 — `/gsd-discuss-phase 5` (no CONTEXT.md exists yet).
