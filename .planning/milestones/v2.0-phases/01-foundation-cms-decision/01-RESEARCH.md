# Phase 1: Foundation & CMS Decision - Research

**Researched:** 2026-07-14
**Domain:** Next.js 16 App Router locale routing (next-intl v4) + Payload CMS 3.x self-hosted (Postgres + S3) on Vercel, EU region
**Confidence:** HIGH (routing, Payload core config, hosting topology — Context7/official docs + npm registry) / MEDIUM (Payload-on-Vercel-serverless Postgres driver churn, IBM Plex Sans Arabic weight-per-locale specifics) / LOW-flagged individually (GDPR/CLOUD Act framing — not legal advice)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Commit to **Payload CMS (self-hosted)** as the headless CMS. TS-native, installs into the Next.js app (single codebase/deploy), free + flat self-host cost, native field-level localization with English fallback.
- **D-02:** The Phase 1 spike MUST validate the **Arabic RTL admin-chrome limitation** is cosmetic-only (content editing/creation works fine in Arabic). If the spike finds the Arabic *editing* experience genuinely unusable (not just cosmetic chrome), fall back to Sanity (SaaS, document-level localization) — this is the only condition that overrides D-01.
- **D-03:** Hosting is **Claude's discretion**, defaulting to **Vercel (Next.js) + managed Postgres + S3-compatible object storage** for media.
- **D-04:** **Data residency = EU region** for the database and media/lead storage (GDPR-friendliness). Global CDN still serves all markets.
- **D-05:** **Path-prefix** locale routing: English at root (`/`), other locales prefixed (`/ar/`, `/fr/`, `/ru/`). Single domain, standard next-intl pattern.
- **D-06:** When a page is not yet translated in the active locale, render the **English content with a small visible notice**. Everything stays reachable; no blank/broken pages.
- **D-07:** Phase 1 ships a **bare shell**: global premium header/footer, language switcher, responsive layout (LTR + RTL), and ONE placeholder home page proving the locale → RTL → CMS pipeline end-to-end. No other routed page stubs.

### Claude's Discretion

- Hosting provider/DB/storage specifics (D-03) within the Vercel + managed-Postgres + object-storage + EU-region envelope.
- Exact skeleton minimalism (D-07) — scope the minimum that proves the foundation end-to-end.
- Placeholder home content/design detail (premium bar applies; full visual design deferred to Phase 2).

### Deferred Ideas (OUT OF SCOPE)

- Full premium page-level visual design / design system — Phase 2 or `/gsd-ui-phase`.
- CRM vendor selection — Phase 4.
- Real content population — supplied by business, slotted via CMS across phases.
- Additional-locale content go-live (ar/fr/ru professional translations) — post-launch per FOUND-02.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Locale-aware routing for 4 locales with correct per-locale URLs | next-intl `routing.ts` + middleware pattern (path-prefix, `localePrefix: 'always'` for non-default, see Standard Stack/Code Examples) |
| FOUND-02 | English live at launch; ar/fr/ru built-in, switchable per-page as translations arrive | Payload `fallback: true` (global) + per-locale content queries; next-intl locale array already includes all 4 from day one regardless of content completeness |
| FOUND-03 | Arabic RTL correct via logical properties, non-mirrored numerals | Tailwind v4 native logical properties/`rtl:` variant (verified, no plugin needed) + `numberingSystem:'latn'` pattern (verified limitation: only works on `useFormatter().number()`/`dateTime()`, NOT on ICU `#` plural tokens — see Common Pitfalls) |
| FOUND-04 | Language switcher preserves page context | next-intl `Link`/`usePathname`/`useRouter` from `createNavigation` (verified pattern, Code Examples) |
| FOUND-05 | Fully responsive incl. RTL on mobile | Tailwind v4 breakpoints (already specified in UI-SPEC) + logical properties handle RTL automatically at every breakpoint — no separate research needed beyond FOUND-03 |
| FOUND-06 | Untranslated pages fall back to English + notice, no blank pages | Payload `fallbackLocale: false` query pattern to *detect* missing translation (distinct from silent field-level fallback) + next-intl chrome-string notice (Code Examples, Architecture Patterns) |
| CMS-01 | Non-technical staff create/edit/publish via admin UI, no dev/redeploy | Payload admin panel at `/admin` (auto-generated), `auth: true` Users collection, role-based access (verified, Security Domain) |
| CMS-02 | Per-locale field values + English fallback | Payload native `localized: true` fields + `localization.fallback` — **supersedes ARCHITECTURE.md's document-level split sketch**, see State of the Art |
| CMS-03 | New product/category needs no code change or rebuild trigger | Payload `afterChange` hook → `revalidatePath`/`revalidateTag` (verified pattern, Code Examples) — ISR on-demand, no full rebuild |
| CMS-04 | Media (images, video, cert PDFs, company PDF) uploadable/managed via CMS | Payload upload-enabled `Media` collection + `@payloadcms/storage-s3` adapter (verified config, Code Examples) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- GSD workflow enforcement: all file-changing work must go through a GSD command (`/gsd-execute-phase` etc.) — not a research constraint on architecture, but the planner should route Phase 1 execution through the standard GSD plan/execute flow, not direct ad-hoc edits.
- No project-specific engineering conventions exist yet (greenfield; CONVENTIONS.md and ARCHITECTURE.md sections are placeholders) — this phase establishes the first real conventions.
- No `.claude/skills/`, `.agents/skills/` etc. project skills found — nothing to load beyond global GSD skills.

## Summary

Phase 1 builds a single Next.js 16 (App Router) + Payload CMS 3.86 codebase, deployed to Vercel, with `next-intl` v4 driving path-prefix locale routing (`/`, `/ar`, `/fr`, `/ru`) and Payload driving a field-level-localized content model with an English fallback. Both libraries' current stable releases (confirmed via npm registry, 2026-07-14: Next.js 16.2.10, next-intl 4.13.2, Tailwind CSS 4.3.2, Payload/`@payloadcms/db-postgres`/`@payloadcms/storage-s3` all 3.86.0) are compatible and this is the same combination the project's own `STACK.md` already recommended — Phase 1 research below deepens the *integration* mechanics, not the stack choice itself.

Two updates materially change what `STACK.md`/`ARCHITECTURE.md` said and must reach the planner:

1. **The three Payload RTL admin-chrome GitHub issues cited in prior research (#9482, #10344, #11162) are all CLOSED and merged** into releases well before the current 3.86.0 — the specific cosmetic bugs (locale dropdown position, missing `dir="rtl"` on the localization example, tab/button RTL misalignment) are fixed today. This is good news for D-02 but does **not** fully retire the spike requirement: a newer, still-open issue (#14893, "Font Rendering Issues in Payload Admin Panel," needs-triage) reports non-Latin script glyph rendering problems (confirmed for Vietnamese, Arabic not explicitly named) caused by the admin panel's default system font lacking multilingual glyph coverage. The Phase 1 spike must specifically check **Arabic glyph rendering quality inside Payload's admin text inputs**, not just layout direction — this is the accurate, narrower "cosmetic-only" risk surface today.
2. **`ARCHITECTURE.md`'s CMS content-model sketch (locale-invariant "data" document + separate per-locale "translation" document) does not apply now that D-01 has locked Payload.** That sketch was written to fit Sanity/Strapi's document-level localization model, which Payload does not use. Payload's actual primitive is **field-level localization within a single document** (`localized: true` per field, one collection, locale switcher tab in the same admin screen) — simpler, and it naturally avoids the ARCHITECTURE.md/PITFALLS.md "locale as a copy of the page" anti-pattern without needing the extra reference-hop structure. The planner should design collections around this primitive directly, not retrofit the old sketch.

**Primary recommendation:** Scaffold Next.js 16 with the App Router, add `next-intl` v4 routing (`localePrefix: 'as-needed'` with `en` as `defaultLocale`) before installing Payload; then run `npx create-payload-app` to graft Payload into a `(payload)` route group alongside a `(marketing)`/`(site)` group holding the `[locale]` tree; wire `postgresAdapter` (not `db-vercel-postgres`, which depends on Vercel's now-deprecated `@vercel/postgres` package — see State of the Art) to an EU-region managed Postgres connection string, and `@payloadcms/storage-s3` to an S3-compatible EU bucket (Cloudflare R2 with EU jurisdictional restriction, or AWS S3 `eu-central-1`). Use `next/font/google` for both IBM Plex Sans and IBM Plex Sans Arabic (both are published Google Fonts — no manual local font files or hand-rolled `unicode-range` subsetting needed; `next/font/google`'s built-in `subsets` option already self-hosts and preloads only the needed script).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Locale routing / URL structure | Frontend Server (SSR/Middleware) | Browser (client nav) | `next-intl` middleware runs at the edge/server per-request to resolve/redirect locale prefixes before any page renders; client-side `Link`/`useRouter` from `createNavigation` handle in-app navigation without full reloads |
| `dir`/`lang` attribute + RTL layout | Frontend Server (SSR) | — | Set once in `app/[locale]/layout.tsx` server-side on `<html>`; Tailwind logical properties + `rtl:` variant do the rest at build/render time, no client JS toggle |
| Font loading (IBM Plex Sans / Arabic) | Frontend Server (SSR) / CDN | — | `next/font/google` self-hosts at build time and serves from the app's own static/CDN layer; locale-scoped so only the needed script's font is requested per page |
| CMS content storage + localization | Database / Storage | API/Backend (Payload) | Postgres is the source of truth for structured localized fields; Payload (running inside the Next.js server tier) is the only writer/reader — pages never talk to Postgres directly |
| CMS admin UI (editing) | API / Backend | Browser (admin panel React app) | Payload generates and serves the `/admin` React app from the same Next.js server process; it is a distinct surface from the public site but shares the deploy |
| Media storage (images/PDFs) | CDN / Static (object storage) | API/Backend (Payload upload handling) | Payload's upload collection handles validation/resizing metadata; actual bytes live in S3-compatible storage, served via CDN, never through the Next.js server for the final asset bytes |
| On-demand ISR revalidation | API / Backend (Payload hook) | Frontend Server (Next.js cache) | Payload `afterChange`/`afterDelete` hooks call `revalidatePath`/`revalidateTag` inside the same Next.js process — no external webhook hop needed since Payload is embedded, not a separate service |
| Locale-fallback notice (untranslated page) | Frontend Server (SSR, data check) | Browser (renders banner) | Detected server-side per request (Payload query with `fallbackLocale: false` to check real existence), decision baked into the SSR/ISR-cached HTML — never a client-side flicker |

## Standard Stack

### Core

| Library | Version (verified via npm, 2026-07-14) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.10 | App Router, SSR/SSG/ISR, middleware | Locked project stack (STACK.md); confirmed current on npm |
| react / react-dom | 19.x | Required peer of Next 16 | Peer requirement |
| next-intl | 4.13.2 | i18n routing, RSC-aware translations, number/date formatting | The App Router-native i18n standard; confirmed current on npm |
| tailwindcss | 4.3.2 | Styling, native logical properties + `rtl:`/`ltr:` variants | Confirmed current; v4's CSS-first `@theme` + built-in logical-property utilities mean **no `tailwindcss-logical` plugin is needed** (that plugin exists for v3) |
| payload | 3.86.0 | Headless CMS, embeds in the Next.js app | Locked (D-01); confirmed current |
| @payloadcms/db-postgres | 3.86.0 | Postgres adapter (Drizzle-based) | Use this, not `@payloadcms/db-vercel-postgres` — see State of the Art |
| @payloadcms/storage-s3 | 3.86.0 | S3-compatible media storage adapter | Works with any S3-compatible provider (AWS S3, Cloudflare R2, Supabase Storage) |
| @payloadcms/richtext-lexical | 3.86.0 | Rich text editor for CMS body fields | Payload's default/recommended editor |
| @payloadcms/next | (bundled with payload) | `withPayload` Next.js config wrapper, admin panel route group | Required glue package for embedding Payload in Next.js |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@neondatabase/serverless` or plain `pg` via `postgresAdapter({ pool: { connectionString } })` | current | Postgres driver for the chosen EU-region provider | Use whichever driver matches the DB provider chosen (Neon vs Supabase vs plain Postgres) — do not default to `db-vercel-postgres` (see below) |
| `sharp` | current (Payload peer) | Image resizing for Payload upload collections | Payload's upload/imageSizes feature requires `sharp` as an optional peer — install explicitly, don't assume it's bundled |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/font/google` for IBM Plex Sans + IBM Plex Sans Arabic | `next/font/local` with manually downloaded `.woff2` files + hand-written `unicode-range` | Only needed if a specific weight/variable-axis isn't published on Google Fonts, or if self-hosting from an internal asset pipeline is mandated; both IBM Plex families are on Google Fonts today, so local is unnecessary extra maintenance |
| `postgresAdapter` + explicit EU-region connection string | `vercelPostgresAdapter` (`@payloadcms/db-vercel-postgres`) | Only if the team standardizes on Vercel's own Postgres marketplace product; currently built on a deprecated Vercel driver (see State of the Art) — avoid for a new project |
| Cloudflare R2 (EU jurisdiction bucket) | AWS S3 `eu-central-1` | R2 has zero egress fees (cheaper at scale for media-heavy trust content); S3 has broader tooling familiarity. Both are S3-API-compatible with `@payloadcms/storage-s3` |

**Installation:**
```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install next-intl
npx create-payload-app@latest
npm install @payloadcms/db-postgres @payloadcms/storage-s3 @payloadcms/richtext-lexical sharp
```

**Version verification:** All versions above were confirmed via `npm view <package> version` against the live npm registry on 2026-07-14 — not training-data estimates.

## Architecture Patterns

### System Architecture Diagram

```
Visitor request (e.g. GET /ar)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  next-intl MIDDLEWARE (Next.js middleware, edge)            │
│  - matches path against routing config                      │
│  - resolves/redirects locale prefix (en=root, ar/fr/ru=/xx/) │
└───────────────────────────────────────────────────────────┘
        │ rewrites to app/[locale]/... segment
        ▼
┌───────────────────────────────────────────────────────────┐
│  app/[locale]/layout.tsx  (Server Component)                 │
│  - hasLocale() validates param → notFound() if invalid        │
│  - setRequestLocale(locale) → enables static rendering         │
│  - <html lang={locale} dir={locale==='ar' ? 'rtl':'ltr'}>       │
│  - next/font/google loads IBM Plex Sans (+ Arabic variant)      │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  app/[locale]/page.tsx  (Home — Server Component)             │
│  1. getPayload({config}) → payload.findGlobal/find(locale)     │
│  2. Query WITH fallback (display value)                        │
│  3. Query WITHOUT fallback (fallbackLocale:false) → detect      │
│     whether THIS locale actually has a translated value         │
│  4. If missing → render <LocaleFallbackNotice/> + English copy   │
│  5. Render Hero using CMS content + next-intl chrome strings     │
└───────────────────────────────────────────────────────────┘
        │                                   ▲
        ▼                                   │ afterChange hook fires on publish
┌────────────────────────┐        ┌─────────────────────────────┐
│  Payload Admin (/admin)  │───────▶  revalidatePath('/[locale]')  │
│  editor logs in, edits    │        │  (on-demand ISR, no rebuild) │
│  localized fields per doc │        └─────────────────────────────┘
└────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Postgres (EU region, e.g. Neon/Supabase eu-central-1)       │
│  S3-compatible object storage (EU bucket) for media/PDFs      │
└───────────────────────────────────────────────────────────┘
```

A reader can trace: request → middleware locale resolution → layout sets `dir`/`lang`/fonts → page fetches CMS content twice (display + existence-check) → conditionally shows fallback notice → editor publishes → hook revalidates → next visitor gets fresh HTML, all without a rebuild.

### Recommended Project Structure

```
src/
├── app/
│   ├── (payload)/                 # generated by create-payload-app — do not hand-edit
│   │   ├── admin/[[...segments]]/page.tsx
│   │   ├── api/[...slug]/route.ts
│   │   └── layout.tsx
│   ├── (site)/[locale]/           # locale-scoped public site
│   │   ├── layout.tsx             # dir/lang, fonts, next-intl provider, setRequestLocale
│   │   └── page.tsx               # bare-shell home page (Phase 1's ONE page)
│   └── globals.css                # Tailwind v4 @theme tokens (from UI-SPEC)
├── payload.config.ts               # localization, collections, storage, db adapters
├── payload-types.ts                # generated types (payload generate:types)
├── collections/
│   ├── Users.ts                    # auth:true, roles field
│   ├── Media.ts                    # upload-enabled, s3Storage-backed
│   └── Home.ts (or Globals/Home.ts)# single global for the bare-shell placeholder page
├── i18n/
│   ├── routing.ts                  # next-intl defineRouting: locales, defaultLocale, localePrefix
│   ├── navigation.ts               # createNavigation → Link/usePathname/useRouter
│   └── messages/{en,ar,fr,ru}.json # chrome strings (nav, switcher labels, fallback notice)
├── components/
│   ├── chrome/GlobalHeader.tsx
│   ├── chrome/GlobalFooter.tsx
│   ├── chrome/LanguageSwitcher.tsx
│   ├── chrome/MobileNavPanel.tsx
│   └── chrome/LocaleFallbackNotice.tsx
├── lib/
│   └── payload-fetch.ts            # getPayload() wrapper + fallback-detection helper
└── middleware.ts                   # createMiddleware(routing)
```

### Structure Rationale

- **`(payload)` route group is generated, not hand-authored** — Payload's installer copies static files into this group; treat it as vendored code. All custom app code lives in a sibling route group (`(site)`).
- **`i18n/messages/` holds ONLY chrome strings** (nav labels, switcher endonyms, fallback-notice copy) — never CMS page content. This matches the project's existing ARCHITECTURE.md convention and avoids the anti-pattern of mixing translation-file content with CMS content.
- **`lib/payload-fetch.ts` centralizes the fallback-detection double-query pattern** (see Code Examples) so every page/component uses one function instead of re-deriving the `fallbackLocale: false` check ad hoc.

### Pattern 1: Path-prefix locale routing with English at root

**What:** `next-intl`'s `localePrefix: 'as-needed'` mode omits the prefix for the default locale (`en` → `/`) while prefixing all others (`/ar/`, `/fr/`, `/ru/`).
**When to use:** Exactly D-05's locked requirement.
**Example:**
```ts
// Source: https://github.com/amannn/next-intl (Context7 /amannn/next-intl)
// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'fr', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});
```
```ts
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  // Note: added `admin` to the standard next-intl exclusion list so the
  // Payload admin panel route group is never intercepted by locale middleware.
};
```

### Pattern 2: Server-set `dir`/`lang`, never client-toggled

**What:** Resolve the incoming locale in the layout, validate it, call `setRequestLocale`, then set `<html lang dir>` directly — all server-side.
**When to use:** Every request; this is the FOUND-03 architecture requirement, not optional.
**Example:**
```tsx
// Source: Context7 /amannn/next-intl (routing/setup.mdx) + Payload rtl config combined
// src/app/(site)/[locale]/layout.tsx
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {IBM_Plex_Sans, IBM_Plex_Sans_Arabic} from 'next/font/google';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-plex-sans',
  weight: ['400', '600']
});
const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-plex-sans-arabic',
  weight: ['400', '600']
});

const RTL_LOCALES = new Set(['ar']);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? plexSansArabic.variable : plexSans.variable;

  return (
    <html lang={locale} dir={dir} className={fontClass}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```
**Note (verified limitation):** Payload's OWN `rtl: true` locale-config flag only affects the Payload *admin panel's* input text-alignment — it has no bearing on the public Next.js site's `dir` attribute. The public site's `dir` must be set independently, exactly as above, driven by the routing locale, not by Payload config.

### Pattern 3: Detecting "untranslated page" for the English + notice fallback (FOUND-06/D-06)

**What:** Payload's `fallbackLocale` is normally silent (a missing Arabic field value auto-fills with English with no signal to the caller). To render a *visible* notice, query once with fallback disabled to check real existence.
**When to use:** Any page/global whose content may not yet exist in the active locale — needed now for the Phase 1 home page, and again in every later content phase.
**Example:**
```ts
// Source: Context7 /payloadcms/payload (configuration/localization.mdx) — pattern composed for this project
// src/lib/payload-fetch.ts
import {getPayload} from 'payload';
import config from '@payload-config';

export async function getHomeContent(locale: string) {
  const payload = await getPayload({config});

  // Display query: fallback ON, always returns usable content
  const display = await payload.findGlobal({slug: 'home', locale, fallbackLocale: locale === 'en' ? undefined : 'en'});

  // Existence check: fallback OFF — null/empty means this locale has no real translation yet
  const nativeCheck = await payload.findGlobal({slug: 'home', locale, fallbackLocale: false});
  const isTranslated = locale === 'en' || Boolean(nativeCheck?.heroHeadline);

  return {content: display, isTranslated};
}
```
```tsx
// src/app/(site)/[locale]/page.tsx (excerpt)
const {content, isTranslated} = await getHomeContent(locale);
return (
  <>
    {!isTranslated && <LocaleFallbackNotice locale={locale} />}
    <Hero content={content} />
  </>
);
```

### Pattern 4: Non-mirrored Arabic numerals (`numberingSystem: 'latn'`)

**What:** `Intl`/`next-intl` defaults `ar` to Arabic-Indic digits (٠١٢٣) unless explicitly told otherwise.
**When to use:** Every `useFormatter().number()`/`.dateTime()` call rendered for the `ar` locale (FOUND-03).
**Verified limitation:** This option only works on explicit formatter calls (`format.number(x, {numberingSystem: 'latn'})`). It does **NOT** work on the `#` token inside ICU plural messages (`{count, plural, other {# items}}`) — that token always formats using ONLY the locale (no options), so it will still render Arabic-Indic digits for `ar` unless the locale itself carries a `-u-nu-latn` BCP-47 extension. Flag this for the Phase 1/2 team: any pluralized count copy in Arabic chrome/CMS strings needs either (a) avoid the `#` token and use an explicit `format.number()` call instead, or (b) register the `ar` locale internally as `ar-u-nu-latn`.
```ts
// Source: Context7 /amannn/next-intl (usage/configuration.mdx, usage/numbers.mdx)
// Global default so every number call in `ar` uses Western digits without repeating the option everywhere
// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  return {
    locale,
    formats: {
      number: {
        latn: {numberingSystem: 'latn'}
      }
    }
    // ... messages, etc.
  };
});
```

### Pattern 5: Payload localization config with per-locale `rtl` flag

```ts
// Source: Context7 /payloadcms/payload (docs/configuration/localization.mdx)
// payload.config.ts (excerpt)
export default buildConfig({
  localization: {
    locales: [
      {label: 'English', code: 'en'},
      {label: 'Arabic', code: 'ar', rtl: true}, // admin-panel input text-align only
      {label: 'Français', code: 'fr'},
      {label: 'Русский', code: 'ru'}
    ],
    defaultLocale: 'en',
    fallback: true // English auto-fills missing fields on read
  },
  // ...
});
```

### Pattern 6: On-demand ISR revalidation from Payload hooks (CMS-03)

```ts
// Source: Context7 /payloadcms/payload (HOOKS.md)
import type {GlobalAfterChangeHook} from 'payload';
import {revalidatePath} from 'next/cache';

export const revalidateHome: GlobalAfterChangeHook = ({doc, req: {context}}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/'); // en
    revalidatePath('/ar');
    revalidatePath('/fr');
    revalidatePath('/ru');
  }
  return doc;
};
```
For the future Product collection (Phase 3), the same pattern applies per-slug (`revalidatePath(\`/products/${doc.slug}\`)`); no rebuild is ever triggered.

### Pattern 7: S3-compatible media storage adapter

```ts
// Source: Context7 /payloadcms/payload (upload/storage-adapters.mdx)
import {s3Storage} from '@payloadcms/storage-s3';
import {Media} from './collections/Media';

export default buildConfig({
  collections: [Media],
  storage: [
    s3Storage({
      collections: {media: true},
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
        },
        region: process.env.S3_REGION!, // e.g. 'eeur' for Cloudflare R2 EU jurisdiction, or 'eu-central-1' for AWS
        endpoint: process.env.S3_ENDPOINT // required for R2/non-AWS S3-compatible providers
      }
    })
  ]
});
```
**Note:** In Payload's config, storage adapters moved to a top-level `storage` key (not inside `plugins`) as of a recent migration — verify this matches the 3.86.0 config shape at implementation time (the docs snippet above already reflects the current key).

### Anti-Patterns to Avoid

- **Client-side `dir` toggling (`useEffect` + `document.documentElement.dir = ...`):** causes a flash of wrong direction on load and fails SSR/ISR caching correctness — always server-set per Pattern 2.
- **Reusing `ARCHITECTURE.md`'s locale-invariant/translation-document split inside Payload:** Payload has no concept of a separate "translation document" — don't build one; use field-level `localized: true` directly on the single collection/global.
- **Relying on `db-vercel-postgres`/`@vercel/postgres` for a new project:** deprecated upstream dependency, unresolved transition plan as of this research (see State of the Art) — use `@payloadcms/db-postgres` with an explicit connection string instead.
- **Physical Tailwind classes (`ml-*`, `text-left`, etc.) anywhere:** already banned per UI-SPEC; Tailwind v4's logical utilities make this a zero-cost rule to follow from the first component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale-prefixed routing + redirect logic | Custom middleware parsing `Accept-Language`/path segments | `next-intl` `createMiddleware(routing)` | Handles default-locale redirect loops, cookie persistence, and locale negotiation edge cases already |
| RTL layout mirroring | Per-component `[dir=rtl]` CSS overrides | Tailwind v4 logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`) + `rtl:`/`ltr:` variants | Native to the framework already in the stack; zero extra dependency |
| CMS admin UI (login, forms, rich text editor) | Custom Next.js admin pages backed by raw Postgres queries | Payload's generated `/admin` panel | This is the entire reason Payload was chosen (D-01) — building a parallel admin defeats the CMS decision |
| Font subsetting per script | Manual `unicode-range` CSS + hand-downloaded `.woff2` files | `next/font/google` with `subsets: ['latin']` / `subsets: ['arabic']` | Both IBM Plex families are published, actively-maintained Google Fonts; `next/font/google` already self-hosts + preloads only the requested subset |
| On-demand cache invalidation | A custom webhook receiver + external queue | Payload `afterChange`/`afterDelete` hooks calling `revalidatePath`/`revalidateTag` directly | Payload runs inside the same Next.js process — no network hop needed, unlike a separate-service CMS (Sanity/Strapi) which would need a webhook |

**Key insight:** Because Payload is embedded in the same Next.js process (not a separate service), several integration problems that would otherwise need custom plumbing (webhook receivers, cross-service auth, CORS) simply don't exist — hooks call Next.js's own cache APIs directly. Don't build infrastructure for a distributed-CMS problem this architecture doesn't have.

## Common Pitfalls

### Pitfall 1: Assuming Payload's `rtl: true` locale flag fixes public-site RTL

**What goes wrong:** A developer sets `rtl: true` on the `ar` locale in `payload.config.ts` and assumes the public Next.js site now renders RTL correctly. It doesn't — that flag only affects text-alignment on Input fields *inside the Payload admin panel*.
**Why it happens:** The flag's name and its only documented effect ("opt-in to setting default text-alignment on Input fields") is easy to misread as a site-wide RTL switch.
**How to avoid:** Treat the admin-panel `rtl` flag and the public-site `dir` attribute (Pattern 2) as two completely independent settings that must both be configured.
**Warning signs:** Public site still LTR for Arabic despite `rtl: true` being set in `payload.config.ts`.

### Pitfall 2: `numberingSystem: 'latn'` silently not applying inside pluralized ICU messages

**What goes wrong:** A developer sets a global `numberingSystem: 'latn'` format and assumes all numbers in Arabic UI render as Western digits — but any count embedded via the ICU `#` plural token still renders Arabic-Indic digits.
**Why it happens:** `next-intl`'s plural `#` substitution calls `Intl.NumberFormat` with only the locale, bypassing the `formats`/options config entirely (verified in the library's own source, not just docs).
**How to avoid:** Audit every plural message string used in `ar` locale chrome/CMS copy; replace `#`-token pluralization with an explicit `format.number(count, 'latn')` call composed into the string, OR register the internal locale as `ar-u-nu-latn` if the full app should never see Arabic-Indic digits anywhere.
**Warning signs:** A "X products" or "X certifications" style count string shows Arabic-Indic digits in QA while a plain price/stat number elsewhere correctly shows Western digits.

### Pitfall 3: Treating the Payload RTL admin GitHub issues as still-open blockers

**What goes wrong:** Re-deriving D-02's spike scope from `STACK.md`'s original (accurate-at-the-time) framing of #9482/#10344/#11162 as open risks re-litigating already-fixed bugs and missing the actually-relevant current risk (issue #14893, font glyph rendering).
**Why it happens:** Prior research was correct when written; GitHub issue status changes over a project's lifetime and needs re-verification at planning time, not just inherited.
**How to avoid:** Scope the Phase 1 spike narrowly: (a) confirm `dir="rtl"` and layout mirroring now work correctly in the admin for an Arabic-locale document (should already pass, given closed issues), (b) specifically inspect Arabic glyph rendering quality in a Lexical rich-text field and a plain text field inside the admin (the open, unresolved risk).
**Warning signs:** Spike report re-flags dropdown-position or missing-`dir` bugs that are already fixed upstream — sign the spike is testing against an outdated version or an old example repo, not the actual pinned 3.86.0 dependency.

### Pitfall 4: Deploying with `db-vercel-postgres` and hitting the unresolved `@vercel/postgres` deprecation

**What goes wrong:** Following older Payload+Vercel tutorials that default to `@payloadcms/db-vercel-postgres`, which depends on Vercel's own deprecated `@vercel/postgres` driver (Vercel shifted Postgres hosting to a Neon marketplace integration and stopped maintaining the wrapper package). A community-filed transition PR (#16168) exists but had no confirmed resolution as of this research.
**Why it happens:** The adapter name still suggests it's the "official Vercel way," but the underlying dependency chain is stale.
**How to avoid:** Use `@payloadcms/db-postgres` with `postgresAdapter({pool: {connectionString: process.env.DATABASE_URL}})` pointed at whichever EU-region managed Postgres is chosen (Neon or Supabase) — this bypasses the deprecated wrapper entirely and works identically on Vercel serverless.
**Warning signs:** Build/runtime warnings referencing `@vercel/postgres` deprecation; cold-start connection errors specific to the Vercel marketplace Neon integration path.

### Pitfall 5: EU-region hosting satisfies "data residency" but not full CLOUD Act exposure — a compliance nuance, not an engineering fix

**What goes wrong:** Choosing an EU region (Neon/Supabase `eu-central-1`, Cloudflare R2 EU-jurisdiction bucket) is necessary but framed by multiple vendor/compliance sources as insufficient on its own: Neon, Supabase, Cloudflare, and Vercel itself are all US-incorporated entities, so US CLOUD Act jurisdiction can still apply to data physically stored in the EU, regardless of region selection.
**Why it happens:** "EU region" and "GDPR-compliant" get conflated; region selection solves physical data-residency and (with a signed DPA + SCCs) the contractual transfer mechanism, but does not eliminate the vendor's US-parent legal exposure.
**How to avoid:** This is a legal/compliance question, not an engineering one — **flag for the business/legal owner to confirm the EU-region + DPA/SCC combination meets their actual GDPR risk tolerance** before or during Phase 1 implementation; do not treat "we picked an EU region" as a completed compliance checkbox in the plan. This does not block Phase 1 engineering work (the region selection itself is still the correct default engineering choice within D-04's envelope).
**Warning signs:** A stakeholder assumes "EU region = fully GDPR safe" without a DPA on file for the chosen DB/storage vendor.

## Runtime State Inventory

Not applicable — this is a greenfield phase (no existing code, no rename/refactor/migration). Skipped per template guidance.

## Code Examples

See inline examples under Architecture Patterns 1–7 above (routing config, middleware, layout with `dir`/`lang`/fonts, fallback-detection query, numberingSystem formats config, Payload localization config, revalidation hook, S3 storage adapter) — all sourced from Context7 (`/amannn/next-intl`, `/payloadcms/payload`) or composed directly from those verified primitives for this project's specific needs.

### LanguageSwitcher preserving path (FOUND-04)

```tsx
// Source: Context7 /amannn/next-intl (routing/navigation.mdx), composed for the UI-SPEC's LanguageSwitcher spec
'use client';
import {usePathname, useRouter} from '@/i18n/navigation';
import {useParams} from 'next/navigation';
import {useLocale} from 'next-intl';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English', ar: 'العربية', fr: 'Français', ru: 'Русский'
};

export function LanguageSwitcher() {
  const pathname = usePathname(); // locale-agnostic, e.g. "/" for home in any locale
  const router = useRouter();
  const currentLocale = useLocale();

  return (
    <select
      aria-label={`Change language (current: ${LOCALE_LABELS[currentLocale]})`}
      value={currentLocale}
      onChange={(e) => router.replace(pathname, {locale: e.target.value})}
    >
      {Object.entries(LOCALE_LABELS).map(([code, label]) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}
```
Note: production implementation should use shadcn's `DropdownMenu` per UI-SPEC, not a raw `<select>` — this snippet demonstrates the routing mechanics only (the `usePathname`/`router.replace(pathname, {locale})` pair is the load-bearing part).

## State of the Art

| Old Approach / Old Info | Current Approach / Current Info | When Changed | Impact |
|--------------------------|----------------------------------|---------------|--------|
| STACK.md: Payload admin-chrome RTL issues #9482/#10344/#11162 flagged as open (as of 2025) | All three closed and merged (PRs #9494, #10345, #11282) well before current 3.86.0 | Between original STACK.md research and this Phase 1 research pass (2026-07-14) | D-02 spike should target the actually-current risk (issue #14893, font glyph rendering) rather than re-testing already-fixed layout bugs |
| ARCHITECTURE.md: CMS content model as locale-invariant "data" doc + separate per-locale "translation" doc | Payload's native field-level `localized: true` on a single collection/global (no document split) | N/A — ARCHITECTURE.md was written before D-01 locked Payload; this was always Payload's actual model, just not yet reconciled in that doc | Planner must design Phase 1 (and later CAT-01..04) collections around field-level localization, not the document-split sketch |
| `@payloadcms/db-vercel-postgres` as the default Vercel+Payload Postgres adapter | Vercel deprecated `@vercel/postgres` (the driver `db-vercel-postgres` wraps); no confirmed Payload-side migration as of this research (open PR #16168, filed Apr 2026) | Ongoing, unresolved | Use `@payloadcms/db-postgres` directly with an explicit connection string instead of the Vercel-specific wrapper |
| Tailwind v3 needed the `tailwindcss-logical` plugin for logical CSS properties | Tailwind v4 ships logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`) and `rtl:`/`ltr:` variants natively | Tailwind v4 release | No extra dependency needed; already correctly reflected in STACK.md, reconfirmed here |

**Deprecated/outdated:**
- `@payloadcms/db-vercel-postgres` for new projects — unresolved upstream dependency risk, avoid.
- `tailwindcss-logical` npm plugin — superseded by Tailwind v4 built-ins, do not add it.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | IBM Plex Sans Arabic on Google Fonts covers the specific weights (400/600) the UI-SPEC's typography contract requires, with acceptable variable-font behavior via `next/font/google` | Standard Stack, Pattern 2 | If a required weight is missing, fall back to `next/font/local` with the specific static `.woff2` from the IBM/plex GitHub repo for that weight only — minor rework, not a blocker |
| A2 | Cloudflare R2 (EU jurisdiction) or AWS S3 `eu-central-1` are both acceptable "S3-compatible object storage, EU region" choices under D-03/D-04's envelope | Standard Stack, Pitfall 5 | Business/legal may prefer one specific vendor for existing contractual reasons — confirm before locking in Phase 1 plan |
| A3 | EU-region managed Postgres (Neon or Supabase, both US-parent companies) is an acceptable interpretation of D-04's "EU region for GDPR-friendliness," pending a DPA/SCC on file | Pitfall 5 | If the business requires an EU-only-parent processor (no CLOUD Act exposure at all), this changes the vendor shortlist to EU-native providers (e.g., Scaleway, a self-hosted EU VPS Postgres) — larger scope change, should be confirmed with legal before Phase 1 infra is provisioned |
| A4 | Issue #14893 (font glyph rendering) is a real but currently-unconfirmed-for-Arabic risk to the Payload admin, warranting inclusion in the spike's test scope | Summary, Pitfall 3 | If Arabic glyphs actually render fine in 3.86.0's admin (issue only reproduces for other scripts), the spike simply confirms this quickly and moves on — low downside either way |

**If this table is empty:** N/A — see rows above; all other claims in this document are Context7/npm-registry-verified or drawn from GitHub issue pages fetched directly in this session.

## Open Questions (RESOLVED)

1. RESOLVED: **Which specific EU-region managed Postgres provider (Neon vs Supabase vs other)?**
   - What we know: Both offer `eu-central-1`/Frankfurt regions, both are S3-driver-compatible with Payload via `@payloadcms/db-postgres`, both are US-parent companies with CLOUD Act exposure regardless of region.
   - What's unclear: Whether the business has an existing vendor relationship, budget ceiling, or a hard requirement for an EU-only-parent processor (which would rule out both).
   - Recommendation: Default to Neon (marginally stronger Vercel/Next.js ecosystem integration per current docs) unless the business's legal review of A3 above rules it out; this is a Claude's-discretion item per D-03 and doesn't block starting Phase 1 scaffolding (the adapter code is provider-agnostic).

2. RESOLVED: **Does the Phase 1 spike's Arabic-admin check need a native Arabic speaker, or is a scripted/visual check sufficient for this narrow phase?**
   - What we know: PITFALLS.md's broader project guidance says RTL should ultimately be verified by a native Arabic reader (that full QA pass is explicitly Phase 6's job per the roadmap).
   - What's unclear: Whether Phase 1's spike (specifically the admin-chrome cosmetic-vs-broken judgment call in D-02) needs that same rigor now, or whether a developer can reasonably judge "glyphs render, text is editable, direction is correct" without native fluency.
   - Recommendation: A developer-level check is sufficient for the Phase 1 spike's narrow go/no-go (Payload vs Sanity) decision — the deeper native-speaker RTL correctness audit remains correctly scoped to Phase 6 for the public-facing site, not the CMS admin panel judged here.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js/Payload runtime, tooling | ✓ | v24.15.0 | — |
| npm | Package installation | ✓ | 11.17.0 | — |
| git | Version control | ✓ | 2.43.0.windows.1 | — |
| Docker | Not required (managed cloud Postgres/storage per D-03) | — | — | N/A — architecture avoids local container dependency by design |
| Local Postgres | Not required (EU managed Postgres is the target, not local dev DB) | — | — | Developer may optionally run a local Postgres for dev-loop speed; not a Phase 1 blocker either way |
| Playwright | e2e RTL/locale checks (Validation Architecture) | ✗ (not yet installed — greenfield) | — | Install as a Wave 0 dev-dependency step; no viable fallback for real-browser `dir`/layout verification |
| Vitest | Unit/integration tests incl. Payload Local API tests | ✗ (not yet installed) | — | Install as a Wave 0 dev-dependency step |

**Missing dependencies with no fallback:**
- None blocking — Playwright/Vitest are standard `npm install -D` additions the plan should include as an early task, not an external environment gap.

**Missing dependencies with fallback:**
- Local Postgres/Docker: optional developer convenience only; the actual target (EU managed Postgres) requires no local install.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (unit + Payload Local API integration tests) + Playwright (e2e browser/RTL checks) — neither installed yet, both are standard, well-supported choices for this exact stack (Payload's own test suite and official examples use this pairing) |
| Config file | none yet — see Wave 0 |
| Quick run command | `npx vitest run --project int` (once configured) |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | `/`, `/ar`, `/fr`, `/ru` all resolve to the home page with a 200 | e2e | `npx playwright test tests/e2e/locale-routing.spec.ts` | ❌ Wave 0 |
| FOUND-02 | English content renders at launch for all 4 locale URLs (via fallback where untranslated) | integration | `npx vitest run tests/int/payload-fallback.spec.ts` | ❌ Wave 0 |
| FOUND-03 | `<html dir="rtl">` on `/ar`, logical-property classes present, `numberingSystem:'latn'` applied to a sample formatted number | e2e | `npx playwright test tests/e2e/rtl-arabic.spec.ts` | ❌ Wave 0 |
| FOUND-04 | Switching locale from a non-home path preserves the path (only locale segment changes) | e2e | `npx playwright test tests/e2e/language-switcher.spec.ts` | ❌ Wave 0 |
| FOUND-05 | Header/footer/hero render correctly at `sm`/`md`/`lg`/`xl` breakpoints in both `ltr` and `rtl` | e2e (viewport matrix) | `npx playwright test tests/e2e/responsive-rtl.spec.ts` | ❌ Wave 0 |
| FOUND-06 | An intentionally-untranslated locale (e.g. seed `fr` with no home content) shows `LocaleFallbackNotice` + English copy, not a blank/404 page | integration + e2e | `npx vitest run tests/int/payload-fallback.spec.ts` (existence-check logic) + `npx playwright test tests/e2e/fallback-notice.spec.ts` (visible banner) | ❌ Wave 0 |
| CMS-01 | A seeded editor user can log into `/admin` and publish an edit to the Home global without a redeploy | e2e (manual-assisted or scripted admin login) | `npx playwright test tests/e2e/admin-publish.spec.ts` | ❌ Wave 0 |
| CMS-02 | Home global has at least one `localized: true` field; querying `ar` with `fallbackLocale:false` returns null when untranslated, and the display query with fallback returns English | integration | `npx vitest run tests/int/payload-localization.spec.ts` | ❌ Wave 0 |
| CMS-03 | Publishing an edit to the Home global triggers `revalidatePath` and the next request serves updated HTML without a rebuild | integration | `npx vitest run tests/int/payload-revalidate-hook.spec.ts` (assert hook invocation) | ❌ Wave 0 |
| CMS-04 | Uploading an image via `/admin` Media collection stores it in the S3-compatible bucket and it's servable via URL | integration (mockable S3 or a real EU dev bucket) | `npx vitest run tests/int/payload-media-upload.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** relevant single Vitest/Playwright file for the feature just built.
- **Per wave merge:** `npx vitest run && npx playwright test` (full suite).
- **Phase gate:** Full suite green before `/gsd-verify-work`, plus the manual D-02 spike sign-off (Arabic admin-chrome check) recorded as a plan artifact since it's a judgment call, not purely automatable.

### Wave 0 Gaps
- [ ] `vitest.config.ts` + `playwright.config.ts` — neither exists yet (greenfield)
- [ ] `tests/int/config.ts` — Payload test config per Payload's own testing convention (`test/config.ts` pattern)
- [ ] `tests/e2e/` directory + a seeded dev database/admin user fixture for Playwright admin-login tests
- [ ] Framework install: `npm install -D vitest @playwright/test` + `npx playwright install`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | Yes | Payload's built-in `auth: true` on the `Users` collection — cookie-based JWT sessions, configurable `maxLoginAttempts`/`lockTime` (verified config options), `tokenExpiration` |
| V3 Session Management | Yes | Payload-managed HTTP-only auth cookie; no custom session code to write |
| V4 Access Control | Yes | Payload `access` functions per collection/field (verified RBAC pattern: `roles` field with `saveToJWT: true` + `access.update`/`access.delete` checks) — apply least-privilege so a content editor role cannot alter Users/roles |
| V5 Input Validation | Yes | Payload field-level validation (`required`, custom `validate` functions) on all CMS fields; Zod is already the project's chosen validation library for the Phase 4 forms, not needed in Phase 1 (no public forms yet) |
| V6 Cryptography | Yes (delegated) | Never hand-roll password hashing — Payload's built-in `auth` handles this internally; do not add a custom auth collection bypassing it |
| V8 Data Protection | Yes | S3 bucket/DB connection secrets via env vars only (`process.env.S3_ACCESS_KEY_ID` etc.), never committed; use Vercel's encrypted env var storage |
| V9 Communications | Yes | Vercel + managed Postgres/S3 connections are TLS by default for the chosen providers — verify the connection string enforces `sslmode=require` (or provider default) at implementation time |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Weak/default admin credentials on first Payload deploy | Spoofing | Require a strong password at first-user creation (Payload's own onboarding flow); do not seed a known default password in any script |
| Editor role able to escalate to admin via the `roles` field | Elevation of Privilege | Lock `roles` field's `access.update` to admin-only, exactly as shown in the verified Payload RBAC snippet (Code Examples/Don't Hand-Roll) |
| Media upload collection accepting arbitrary file types (e.g., executable disguised as image) | Tampering | Payload's `mimeTypes: ['image/*']` restriction on the Media collection upload config (already the documented pattern); extend explicitly to include `application/pdf` for certificate/company-profile PDFs, nothing broader |
| Public-facing Payload REST/GraphQL API left world-writable | Tampering / Information Disclosure | Default Payload `access.read`/`create`/`update`/`delete` to authenticated-admin-only for all collections in Phase 1 (there is no public-write use case yet — RFQ forms come in Phase 4 via a separate Route Handler, not direct CMS write access) |

## Sources

### Primary (HIGH confidence)
- Context7 `/amannn/next-intl` — routing configuration, middleware setup, navigation (`Link`/`usePathname`/`useRouter`), static rendering (`setRequestLocale`/`generateStaticParams`), number formatting/`numberingSystem` behavior including the verified `#`-token limitation (source-code-level snippet, not just docs)
- Context7 `/payloadcms/payload` — localization config (`rtl` flag, `fallback`, per-locale query with `fallbackLocale: false`), Next.js installation (`withPayload`, route group structure), Postgres adapter config, S3 storage adapter config, revalidation hooks, auth/RBAC access-control patterns, testing conventions (Vitest/Playwright)
- npm registry, live query 2026-07-14 — confirmed current versions: `next@16.2.10`, `next-intl@4.13.2`, `tailwindcss@4.3.2`, `payload@3.86.0`, `@payloadcms/storage-s3@3.86.0`, `@payloadcms/db-postgres@3.86.0`
- GitHub issue pages fetched directly (WebFetch) — `payloadcms/payload#9482`, `#10344`, `#11162` (all confirmed CLOSED with merge PRs), `#14893` (confirmed OPEN, needs-triage, non-Latin glyph rendering)
- Next.js official docs (`nextjs.org/docs/app/api-reference/components/font`, fetched 2026-07-14) — `next/font/google` and `next/font/local` API reference, subsetting/preloading behavior

### Secondary (MEDIUM confidence)
- Brave Search (via `gsd-sdk query websearch`) + WebSearch — Payload RTL GitHub issue discovery, cross-verified against direct GitHub fetches above
- WebSearch — IBM Plex Sans Arabic Google Fonts availability, IBM Plex Cyrillic coverage history (v6.0+), Tailwind v4 logical-property/`rtl:` variant confirmation (cross-referenced against Tailwind's own v4 blog post, already cited in STACK.md)
- WebSearch/WebFetch — GitHub Discussion `payloadcms/payload#13404` (Vercel Postgres driver deprecation/transition status, unresolved as of an April 2026 PR reference found in the discussion)
- WebSearch — Neon/Supabase EU-region + CLOUD Act framing (multiple 2026-dated vendor-comparison and compliance-focused blog sources; consistent across sources but not a primary legal citation — flagged accordingly in Pitfall 5/Assumption A3)

### Tertiary (LOW confidence)
- None retained without cross-verification — all findings above were checked against at least one HIGH or cross-corroborated MEDIUM source before inclusion.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified live against npm registry, not training-data recall.
- Architecture (routing/RTL/CMS integration patterns): HIGH — Context7 official docs/source snippets for the load-bearing mechanics (middleware, `setRequestLocale`, localization config, hooks, storage adapter).
- Pitfalls: HIGH for the Payload RTL issue status and `numberingSystem`/`#`-token limitation (directly verified via source code and GitHub); MEDIUM for the GDPR/CLOUD Act framing (legal nuance, explicitly flagged as needing business/legal confirmation, not asserted as settled fact).

**Research date:** 2026-07-14
**Valid until:** ~30 days for library versions/GitHub issue status (fast-moving: Payload ships frequently); the RTL/localization architectural patterns themselves are stable and not time-sensitive.
