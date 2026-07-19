# Project Handoff — pick up here

> Read first on a fresh machine/session. Self-contained resume context.
> Last updated: **2026-07-19** · Repo: `github.com/virendra1400/companywebsite` (branch `main`).
> Full project IS in the repo incl. `.planning/` (STATE.md, ROADMAP.md, phases/, STACK.md, SESSION-HANDOFF.md). Only secrets (`.env*`), `node_modules`, `.next`, and regenerable `graphify-out/` are excluded.

---

## 0. Fresh-machine setup (do this first)

```bash
git clone git@github.com:virendra1400/companywebsite.git
cd companywebsite
npm install
```
**Secrets are NOT in the repo.** Pick one:
- **Local dev only** (SQLite, no cloud) — create `.env`:
  ```
  DATABASE_URI=file:./payload.db
  PAYLOAD_SECRET=<any-long-random-string>
  ```
- **Full prod parity** — pull from Vercel (authenticated): `npm i -g vercel && vercel login && vercel link && vercel env pull .env`
  ⚠ then DELETE `BLOB_READ_WRITE_TOKEN` from local `.env` (else dev uploads hit the real prod Blob).

Then: `npm run dev` (localhost:3000, migrations auto-run) · `npm run db:seed` (optional placeholder content) · `npm run build` (verify).

**Optional per-machine tooling (not in repo):** Python 3 + `pip install graphifyy` + `graphify install` (graphify skill); Claude plugins via `claude plugin marketplace add …`. Add the new machine's SSH key to GitHub.

---

## 1. What this project is

Premium multi-language **B2B corporate + lead-gen website** for an India-based agricultural/food exporter. NOT e-commerce. Goal: a first-time international buyer trusts the company enough to send an RFQ/inquiry.

- **Brand rename in progress:** old name "Star Agrevolution" → new **"VNP Global Pvt Ltd"**. Name + logo are now **CMS-editable** (not hardcoded) — set in `/admin` → Site Settings. Repo/Vercel project still named `star-agrevolution` (cosmetic).
- **Palette:** forest green (`primary-700 #1B5E45`, `primary-900 #0F2E22`) + gold accent (trim only). Fonts: IBM Plex Sans + IBM Plex Sans Arabic.
- **Locales:** en (root), ar (RTL), fr, ru — path-prefixed. English live; ar/fr/ru locale-ready with EN+notice fallback (human translation post-launch).
- **Domain:** user buying a NEW domain (staragrevolution.com is a parked placeholder to be replaced).

## 2. Stack (all live in `src/`)

Next.js 16 (App Router, RSC) + React 19 + TS strict · next-intl v4 · Tailwind v4 (CSS-first `@theme`, logical-property RTL) · Payload CMS 3.x embedded (`/admin`) · shadcn (new-york) · Vitest + Playwright. Hosting: Vercel (`fra1`) + Neon Postgres + Vercel Blob. **Full rationale → [.planning/STACK.md](.planning/STACK.md)** and summary in [CLAUDE.md](CLAUDE.md).

## 3. Build/deploy — non-obvious pieces

- **Local DB = SQLite** (`payload.db`), media on disk. **Prod = Postgres + Blob**, env-selected in `src/payload.config.ts` (`DATABASE_URL`→Postgres; `BLOB_READ_WRITE_TOKEN`→Blob).
- **Migrations committed** in `src/migrations/`. Prod build (`vercel.json`) = `generate:importmap && payload migrate && next build` — **NON-DESTRUCTIVE** (DB persists, admin content safe).
- **Schema change:** `npx payload migrate:create <name>` locally (offline OK with dummy `DATABASE_URL=postgres://u:p@localhost:5432/none`), commit the migration.
- **importMap** must include the Blob admin component — build regenerates it with the live token. Regen locally with a dummy `BLOB_READ_WRITE_TOKEN` set, else `/admin` blanks in prod.
- **Images:** `next.config.ts` `images.unoptimized: true` — serve media straight from Blob (optimizer failed on remote SVGs).
- **Media read = PUBLIC** (`() => true`); write admin-only.
- **Deploy:** `vercel deploy --prod`; builds 2–15 min (background + poll `vercel ls star-agrevolution`). Vercel **SSO Deployment Protection is ON** — live URL needs the user's Vercel login; turn off before public launch.

## 4. Live URLs

Prod: https://star-agrevolution.vercel.app (SSO-gated) · Admin: `/admin`. Per-deploy URLs change; stable alias `star-agrevolution.vercel.app`.

## 5. What's BUILT (Phases 1–3, live)

- **P1 Foundation & CMS:** 4-locale routing, Arabic RTL, language switcher, EN+notice fallback, Payload CMS + localized content model, Media. Chrome: GlobalHeader/Footer/LanguageSwitcher/MobileNavPanel/LocaleFallbackNotice/Hero.
- **P2 Marketing/trust pages** (Payload Blocks page-builder): Pages + `RenderBlocks` + 9 blocks. Pages: Home, About, Contact (form **stub — validates, does NOT submit yet**), Certifications (own collection, Halal-elevated), Manufacturing, Export Track Record (self-authored SVG world map), Company/Compliance.
- **P3 Product Catalog:** Categories + Products collections (localized, relationships, imageGallery, specifications, packaging). `/products` (grouped index) + `/products/[slug]` (gallery, SpecTable, cert badges, RFQ CTA → `/contact?product=`). ISR — new products appear without rebuild.
- **CMS-editable brand:** `SiteSettings` global (`src/globals/SiteSettings.ts`) — `siteName`, `logo`, `contact{email,phone,whatsapp}`. `getSiteBrand()` (`src/lib/payload-fetch.ts`, React-cached) → `{siteName,logoUrl,email,phone,whatsapp,waHref}`. Chrome/Hero/product/contact all route through it. Adding a contact-consuming component → call `getSiteBrand()`, never hardcode.
- **Revalidation gotchas:** siteName renders in shared layout chrome → needs `type:"layout"` revalidate (`src/hooks/revalidateSiteSettings.ts`). All content routes set `export const revalidate = 60` so CMS edits show in ~60s. **Any new content route must set `revalidate = 60`; any new shared-chrome data needs a layout revalidate.**

## 6. Today's work (2026-07-19)

- **Logo/media upload fix (deployed):** removed `imageSizes` from `src/collections/Media.ts` (+ migration `20260716_143757_media_no_sizes`). Root cause: `imageSizes` triggered a runtime `sharp` resize in Vercel's serverless function that failed on admin PNG upload ("error while uploading files"). Site serves originals anyway. **⚠ NOT yet retested by user — confirm PNG upload succeeds at `/admin` → Media → Create.**
- **Git:** repo pushed to `github.com/virendra1400/companywebsite` (private), branch `main`, 94 commits. Commit email = personal `virendra1400@gmail.com` (repo-local). SSH auth via `id_ed25519`.
- **Token-cost trims:** CLAUDE.md shrunk (168→55 lines), full stack moved to `.planning/STACK.md`; `.brain-skip` marker silences the global brain SessionStart hooks in this repo only (DCIM repos unaffected); ui-ux-pro-max plugin disabled (re-enable when doing UI work).
- **Tooling installed (per-machine, not in repo):** Python 3.12, graphify engine 0.9.17 (+skill), ui-ux-pro-max plugin. `graphify` ran on the repo → `graphify-out/` (gitignored) has `GRAPH_REPORT.md` + `graph.json` (542 nodes, 41 communities; `getSiteBrand`/`cn()` are god nodes).

## 7. Content model

Collections: Users(RBAC), Media, Pages(blocks), Certifications, Categories, Products. Global: Site Settings. Seed `scripts/seed-pages.ts` + `scripts/seed-products.ts` (idempotent). Build does NOT reseed — `/admin` content is safe.

## 8. Testing / gotchas

`npx vitest run` (int) · `npx playwright test` (e2e en+ar) · `node scripts/check-physical-direction.mjs` (RTL gate — no physical `ml-/mr-/left-/right-`). **Tailwind v4 gotcha:** custom `--spacing-*` tokens collide with named `max-w-*` → use bracket values (`max-w-[42rem]`), never `max-w-2xl`.

## 9. OPEN ITEMS / next steps

1. **Retest logo upload** (§6) — user action in `/admin`. Then set real `siteName` (VNP Global Pvt Ltd), logo, contact email/phone/whatsapp in Site Settings.
2. **Company name in CMS page bodies** — About/Company still say "Star Agrevolution" (DB content; edit in `/admin` → Pages, or script a one-time update once new name confirmed).
3. **New domain** — when bought: add in Vercel + DNS. Display name already domain-independent.
4. **Vercel SSO** — turn off Deployment Protection before public access.
5. **Phase 4 (leads) — NOT started, needs user decisions:** wire the contact form stub + per-product RFQ (`src/lib/contact-schema.ts` seam) → Resend email (verified domain?), Cloudflare Turnstile (keys?), CRM webhook (which/none?), analytics (GA4+consent vs Plausible?).
6. **Phase 5 (SEO/blog):** hreflang, sitemaps, per-locale metadata, JSON-LD. Mostly autonomous.
7. **Phase 6 (perf/RTL QA):** Core Web Vitals, revisit image optimizer, full cross-locale RTL QA.

## 10. Resume checklist

1. Read this file + [CLAUDE.md](CLAUDE.md).
2. `git log --oneline -15` (HEAD should be ≥ `6a4db48`).
3. `vercel ls star-agrevolution` (newest Production ● Ready) — if Vercel authed.
4. Local sanity: `.env` = SQLite only; `npm install`; `npm run build`.
5. Pick an open item from §9. Phase 4 needs the user's CRM/email/Turnstile/analytics decisions before planning.
