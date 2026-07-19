# Star Agrevolution — Session Handoff

> Read this first on resume. Rich narrative context to complement `.planning/STATE.md` + `ROADMAP.md`.
> Last updated: 2026-07-16 · Git HEAD at handoff: `e1413f9` (branch `master`)

---

## 1. What this project is

Premium, multi-language **B2B corporate + lead-gen website** for **Star Agrevolution** — an India-based agricultural/food products manufacturer & exporter. NOT e-commerce. Goal: a first-time international buyer (GCC/Europe/NA/Africa/SEA/CIS) trusts the company enough to send an inquiry/RFQ. Full project brief in `.planning/PROJECT.md`.

- **Brand palette:** deep forest green (`primary-700 #1B5E45`, `primary-900 #0F2E22`) + gold accent (trim only, never CTA fill) on white. Font: IBM Plex Sans + IBM Plex Sans Arabic.
- **Locales:** en (root), ar (RTL), fr, ru — path-prefixed (`/ar/…`). English live; ar/fr/ru are locale-ready with EN+notice fallback (professional human translation is post-launch).
- **Inspiration floor:** piyushfarms.com. **Own domain (parked, to be replaced):** staragrevolution.com — user is buying a NEW domain.

## 2. Tech stack (all live, in `src/`)

- **Next.js 16** (App Router, RSC) + **React 19** + **TypeScript strict**
- **next-intl v4** — locale routing/middleware, EN fallback
- **Tailwind v4** (CSS-first `@theme` in `src/app/globals.css`) — logical-property RTL, `rtl:` variant
- **Payload CMS 3.x** embedded in the Next app (`/admin`), **@payloadcms/db-postgres**
- **shadcn** (new-york preset) — Button/Card/Badge/Input/Textarea/Label/Form/Sheet/DropdownMenu/AspectRatio
- **Vitest** (int, Payload Local API) + **Playwright** (e2e, en+ar matrix)
- Hosting: **Vercel** (region `fra1`/EU) + **Neon Postgres** (EU) + **Vercel Blob** (media, US `iad1`)

## 3. Build/deploy setup — READ THIS, it has non-obvious pieces

- **Local dev DB = SQLite** (`payload.db`), media on local disk. **Prod = Postgres + Blob**, selected by env in `src/payload.config.ts` (`DATABASE_URL` set → Postgres; `BLOB_READ_WRITE_TOKEN` set → Blob).
- Local `.env` must contain ONLY `DATABASE_URI=file:./payload.db` + a `PAYLOAD_SECRET`. **Do NOT put `BLOB_READ_WRITE_TOKEN` locally** (it makes dev upload to the real prod Blob). `.env*` is gitignored. `vercel env pull` / `vercel link` may recreate `.env.local` with the prod Blob token — delete it if so.
- **Migrations are committed** in `src/migrations/` (init + site_settings). Prod build = `vercel.json` → `payload generate:importmap && payload migrate && next build`. **This is now NON-DESTRUCTIVE** — DB persists across deploys, admin content is safe. (Earlier it used `migrate:fresh` which wiped the DB every deploy — that "deploy ceiling" is RESOLVED.)
- **Schema changes going forward:** run `npx payload migrate:create <name>` LOCALLY (works offline — set a dummy `DATABASE_URL=postgres://u:p@localhost:5432/none` to select the pg dialect; it diffs the schema, doesn't connect), commit the new migration file. Build applies it.
- **importMap** (`src/app/(payload)/admin/importMap.js`) MUST include plugin admin components. The Vercel Blob upload component only registers when the Blob plugin is active — so the build regenerates the importMap with the live token (`generate:importmap` step). If you regen locally, set a dummy `BLOB_READ_WRITE_TOKEN` so the blob handler is included, else `/admin` goes blank in prod (`getFromImportMap` error).
- **Images:** `next.config.ts` sets `images.unoptimized: true` (serve media straight from Blob CDN) — the optimizer was failing on remote SVGs. Re-enable optimizer for RASTER media in Phase 6 (PERF) if wanted.
- **Media collection read = PUBLIC** (`() => true`) — public marketing assets; admin-only read caused 403/broken images. Write stays admin-only.
- **Deploy cmd:** `vercel deploy --prod` (CLI is authed as `virendra1400-9123`; web login carries to CLI). Builds take ~2–15 min; often exceed the 10-min tool timeout — dispatch in background and poll `vercel ls star-agrevolution`. Vercel **Deployment Protection (SSO)** is ON — the live URL requires the user's Vercel login; turn it off (Settings → Deployment Protection) for public/team access before launch.

## 4. Live URLs

- **Prod:** https://star-agrevolution.vercel.app (SSO-gated) · **Admin:** /admin
- Per-deploy URLs change; the stable alias is `star-agrevolution.vercel.app`.

## 5. What's BUILT (Phases 1–3 complete + live)

**Phase 1 — Foundation & CMS:** 4-locale routing, Arabic RTL (logical props, latn numerals, per-script fonts), language switcher (endonyms, preserves path), EN+notice fallback, Payload CMS + localized content model, Media collection. Chrome: GlobalHeader/GlobalFooter/LanguageSwitcher/MobileNavPanel/LocaleFallbackNotice/Hero.

**Phase 2 — Marketing + trust pages** (Payload **Blocks page-builder**): Pages collection + `RenderBlocks` + 9 blocks (Hero, RichText, FeatureGrid, StatsBand, CertStrip/CertCard, MediaGallery, CTABand, ExportMap, ContactBlock). Pages: Home (rich scroll), About, Contact (info + **non-submitting form stub** — react-hook-form+zod, real validation, NO submission yet), Certifications (dedicated **Certifications collection**, Halal-elevated card, PDF present/absent), Manufacturing, Export Track Record (**static self-authored SVG world map** + stats), Company/Compliance. Nav wired to all routes.

**Phase 3 — Product Catalog:** flat **Categories** + typed **Products** collections (localized; Product→Category, Product→Certifications, imageGallery, `specifications` as localized `{label,value}` array, packaging). Routes `/products` (grouped-by-category index) + `/products/[slug]` (detail: gallery w/ aria thumbnails, SpecTable as `<dl>`, cert badges, RFQ CTA → `/contact?product=`). `generateStaticParams` queries slugs, `dynamicParams` default → new products appear without rebuild (ISR).

**Post-Phase-3 fixes (all live):** deploy ceiling resolved (committed migrations, non-destructive build); Media public-read (images render); next/image unoptimized (Blob SVG logos render); importMap blob-component fix (blank `/admin` resolved).

**Shipped:** **CMS-editable brand** — `SiteSettings` global (`src/globals/SiteSettings.ts`) with `siteName` (text, default "Star Agrevolution") + `logo` (Media upload). Header/footer/mobile use `src/components/chrome/BrandMark.tsx` → logo image if uploaded, else text wordmark. Copyright uses siteName. Aria labels reworded to drop the hardcoded name. Edit in `/admin` → Settings → Site Settings; no redeploy.
- **Gotcha fixed:** siteName lives in the shared `(site)/[locale]/layout.tsx` chrome (static/SSG), so admin edits didn't reflect until a revalidate hook was added — `src/hooks/revalidateSiteSettings.ts` (GlobalAfterChangeHook) revalidates `revalidatePath(locale, "layout")` for all 4 locales. **Any future data that renders in the shared layout/chrome needs a `type: "layout"` revalidate, not a path revalidate.**
- **Centralized contact (HEAD `19b3cc7`):** email/phone/WhatsApp are now a single CMS source — `SiteSettings.contact` group (`src/globals/SiteSettings.ts`). `getSiteBrand()` (React-`cache()`d, `src/lib/payload-fetch.ts`) returns `{siteName, logoUrl, email, phone, whatsapp, waHref}`. Consumers: chrome "Request a Quote" → `/contact` (no more mailto); Hero WhatsApp CTA + product-page WhatsApp → `waHref`; ContactBlockView reads email/phone/whatsapp from settings (ContactBlock now only has intro+address). Set real values in `/admin` → Site Settings → Contact channels (defaults are placeholders). Adding a new contact-consuming component → call `getSiteBrand()`, don't hardcode.
- **ISR fix (HEAD `6c7aa89`):** content pages were fully static; on-demand `revalidatePath` from CMS hooks wasn't reliably busting them (edits only showed after a full redeploy). Added `export const revalidate = 60` to ALL content routes (`[locale]/page.tsx`, `[locale]/[slug]/page.tsx`, `products/page.tsx`, `products/[slug]/page.tsx`). Now every CMS edit (pages/products/certs/contact/site-settings) appears within ~60s with no redeploy; on-demand hooks remain for faster busting. **Any new content route should also set `export const revalidate = 60`.**

## 6. Content model / data (all CMS-editable in `/admin`, persists across deploys)

Collections: Users(RBAC admin/editor), Media, Pages(blocks), Certifications, Categories, Products. Global: Site Settings. Seed script `scripts/seed-pages.ts` (idempotent, skip-by-slug) creates placeholder content + self-authored non-trademark placeholder assets in `scripts/seed-assets/`. **Build no longer reseeds** — real content entered in `/admin` is safe.

## 7. Testing / quality gates

`npx vitest run` (int), `npx playwright test` (e2e en+ar), `node scripts/check-physical-direction.mjs` (RTL logical-property gate — NO `ml-/mr-/left-/right-/text-left/text-right`). **Known Tailwind-v4 gotcha:** the custom `--spacing-*` tokens (xs..3xl) collide with named `max-w-*` utilities → `max-w-2xl` etc. resolve tiny. **Always use bracket values** (`max-w-[42rem]`), never `max-w-sm/md/lg/xl/2xl`.

## 8. OPEN ITEMS / next steps

1. **Company name/logo change (in progress):** brand is now CMS-editable — user sets new name + uploads logo in `/admin`. STILL hardcoded in **CMS page body text** (About story, Company/compliance) at `src/lib/seed-content.ts:215,331` — but that's DB content now; edit in `/admin` → Pages → about/company, OR user gives the new name and we script a one-time content update.
2. **New domain:** user is buying one. When provided: add it in Vercel project + point DNS; display name is already domain-independent.
3. **Vercel SSO:** turn off Deployment Protection before public/team access.
4. **Phase 4 (leads) — NOT started, needs user decisions/secrets:** functional RFQ/inquiry form submission (wire the existing stub + shared `src/lib/contact-schema.ts`), spam (Cloudflare Turnstile keys?), email delivery (Resend account + verified domain?), CRM webhook (HubSpot/Zoho/Pipedrive/none?), WhatsApp click tracking + analytics (GA4+consent vs Plausible?). Contact form stub + per-product RFQ CTA are the wiring seams already in place.
5. **Phase 5 (SEO/blog):** hreflang, sitemaps, per-locale metadata, structured data (Organization/Product JSON-LD), insights/blog. Mostly autonomous.
6. **Phase 6 (perf/RTL QA):** Core Web Vitals, image optimization revisit (unoptimized→raster optimizer), full cross-locale RTL QA with real content.

## 9. How this was built (GSD workflow)

Used the **GSD (get-shit-done)** skill pipeline per phase: `/gsd-discuss-phase N` → `/gsd-ui-phase N` (UI-SPEC contract) → `/gsd-plan-phase N` (research + planner + plan-checker verify loop) → `/gsd-execute-phase N` (wave-based executor subagents in git worktrees, atomic commits, post-merge build/test gate). Artifacts per phase in `.planning/phases/0N-*/`: `0N-CONTEXT.md`, `0N-UI-SPEC.md`, `0N-RESEARCH.md`, `0N-VALIDATION.md`, `0N-*-PLAN.md`, `0N-*-SUMMARY.md`. `.planning/` is gitignored (commit_docs=false). Config: mode=yolo, granularity=standard, MVP mode, all workflow agents on, models balanced (planner=opus, others=sonnet).

**Executor operational notes learned this session:** executors run in isolated worktrees; on API-drop mid-run, resume via SendMessage (Task-1 commits land first, nothing lost). Never run system-wide `taskkill /IM node.exe` (kills sibling agents) — kill by specific port/PID. Merge worktree→master BEFORE deleting the branch. Don't `git checkout -- .` before committing your own uncommitted edits (it reverts them).

## 10. Resume checklist

1. Read this file + `.planning/STATE.md` + `.planning/ROADMAP.md`.
2. `git log --oneline -15` to see recent work; HEAD should be ≥ `e1413f9`.
3. Confirm live: `vercel ls star-agrevolution` (newest Production ● Ready).
4. Local sanity: `.env` = SQLite only; `npm install`; `npm run db:seed`; `npm run build`.
5. Continue: pick an open item from §8. Phase 4 needs the user's CRM/email/Turnstile/analytics decisions before planning.
