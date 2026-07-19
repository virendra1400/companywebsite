# Phase 2: Core Marketing Pages & Trust Surfaces - Research

**Researched:** 2026-07-15
**Domain:** Payload CMS 3.86 Blocks page-builder on an existing Next.js 16 / next-intl / Tailwind v4 codebase
**Confidence:** HIGH (architecture, stack) / MEDIUM (map SVG source, license) / LOW (none — all LOW items flagged below)

## Summary

Phase 1 already proved the full pipeline (locale routing -> RTL -> Payload Local API -> CMS content -> rendered chrome) for exactly one content type: a `Home` **global** with two flat localized text fields. Phase 2 must generalize this into a real **Blocks page-builder** across 7 pages. The single highest-leverage architectural decision is **D-02**: introduce a `Pages` collection (slug + `layout: blocks` field) and **retire the `Home` global**, migrating its content into a `Pages` doc with `slug: "home"`. This is Payload's own blessed reference pattern (verified directly against `payloadcms/website`'s official template via Context7: `Pages` collection + `slug` field + `RenderBlocks` + a single `revalidatePage` hook), and it reuses more of Phase 1's code (one generic fetch helper, one generic revalidate hook) than either 7 parallel per-page Globals or a fully generic `[...slug]` catch-all would.

Every block field pattern needed (localized text/richText/group/array, `localized: true` on the top-level `blocks` field cascading to all nested fields) is already supported by the installed Payload 3.86 — confirmed via Context7 against the actual `payload` repo docs, not assumed. The riskiest concrete gaps found by reading the codebase (not assumed): (1) **`react-hook-form`/`zod`/`@hookform/resolvers` are not yet installed** despite CLAUDE.md listing them as approved stack — Phase 2 is where they land for the first time; (2) **`src/app/globals.css` only defines 4 shadcn CSS variables** (`--background`, `--foreground`, `--primary`, `--primary-foreground`) — every new shadcn primitive this phase needs (`Card`, `Badge`, `Input`, `Textarea`, `Label`, `Form`, `AspectRatio`, and Button's `outline`/`destructive` variants used by CTABand's secondary CTA and the Contact form) references CSS vars (`--destructive`, `--border`, `--input`, `--ring`, `--accent`, `--muted`, `--card`, `--secondary`, ...) that do not exist yet — this will silently render broken/transparent unless addressed as an explicit task, not discovered at review time.

**Primary recommendation:** Add a `Pages` collection (slug-routed, `layout: blocks`) that replaces the `Home` global; build 9 Payload `Block` configs matching the UI-SPEC library 1:1; render via one generic `RenderBlocks` block-type-to-component switch; add a `Certifications` collection; extend `src/app/globals.css`'s `:root` with the missing shadcn semantic variables (mapped to brand tokens, not shadcn defaults) *before* running `npx shadcn add card badge input textarea label form aspect-ratio`; install `react-hook-form`+`zod`+`@hookform/resolvers` for the Contact stub only.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page/block content storage & localization | Database / Storage (Payload + Postgres/SQLite) | — | Field-level `localized:true`, already the established Phase 1 pattern |
| Page composition (which blocks, in what order) | API / Backend (Payload admin, `Pages` collection) | — | Non-technical editors compose via admin UI, not code |
| Block-to-React rendering | Frontend Server (SSR/RSC) | — | `RenderBlocks` runs server-side in the `(site)/[locale]` route group, zero client JS for static content |
| Client-side form validation (Contact stub) | Browser / Client | Frontend Server (initial SSR shell) | `react-hook-form` + `zod` run client-side only per D-07 (no server action yet) |
| Media (logos, cert PDFs, gallery photos) | Database / Storage (Vercel Blob prod / disk dev) | CDN / Static (Vercel `next/image` optimization) | Reuses Phase 1's `Media` collection unchanged |
| Export-map SVG asset | CDN / Static (checked-in `public/` asset) | Browser / Client (inline highlight logic) | Explicitly NOT Media-collection-managed per D-06 — it's a code asset, not editor content |
| ISR/revalidation on publish | API / Backend (Payload `afterChange` hook) -> Frontend Server (`revalidatePath`) | — | Reuses Phase 1's `revalidateHome` pattern, generalized |
| RTL/logical-CSS layout | Browser / Client (CSS) | Frontend Server (server-set `dir` attribute) | Unchanged from Phase 1 — `dir` computed server-side in the locale layout |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Premium homepage, positioning + CTAs | Hero(`full`)+FeatureGrid+CertStrip+StatsBand+ExportMap+CTABand block sequence; homepage migrated from `Home` global to `Pages` collection (`slug:"home"`) |
| PAGE-02 | About/company story page | RichText + FeatureGrid(`photo`, optional) blocks on a `Pages` doc, `slug:"about"` |
| PAGE-03 | Contact page (form, WhatsApp, email, phone, address) | `ContactBlock` (react-hook-form+zod, non-submitting), static `wa.me` link pattern |
| PAGE-04 | Consistent global header/footer, nav, switcher, CTAs | Reuse Phase 1 `GlobalHeader`/`GlobalFooter` unchanged; wire real `href`s to the 6 new routes (D-08) |
| TRUST-01 | Certifications page: logos + downloadable PDFs | New `Certifications` collection + `CertCard`/`CertStrip` block, PDF-present/absent states |
| TRUST-02 | Halal featured prominently | `halal` boolean field on `Certifications` drives `CertCard`'s elevated/spanning treatment |
| TRUST-03 | Manufacturing page: photos/video, capacity, QC, cold-chain | RichText + `MediaGallery` + `StatsBand` blocks |
| TRUST-04 | Export track record: map, years, volume, incoterms | `ExportMap` block (static SVG) + `StatsBand`, full variant |
| TRUST-05 | Company/compliance: leadership, profile PDF, IEC, logistics | `FeatureGrid`(`photo`) + 2x `RichText` + `CertCard`-shaped company-profile document card |
| TRUST-06 | Safe placeholders, no layout breakage | D-03 realistic-shaped placeholder discipline; every block field long-string/real-aspect-ratio tested |
</phase_requirements>

## Standard Stack

### Core (already installed — Phase 1)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| payload | 3.86.0 [VERIFIED: package.json] | CMS, `blocks` field type | Already the chosen CMS; `blocks` is Payload's native page-builder primitive |
| @payloadcms/db-postgres / @payloadcms/db-sqlite | 3.86.0 [VERIFIED: package.json] | Env-driven DB adapter | Already wired in `payload.config.ts` — no change needed, blocks/arrays are fully supported by both adapters |
| @payloadcms/richtext-lexical | 3.86.0 [VERIFIED: package.json] | RichText block content | Already installed, used for the RichText block |
| next-intl | 4.13.2 [VERIFIED: package.json] | Chrome/UI strings only (not CMS content) | Unchanged pattern from Phase 1 |

### New this phase
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| react-hook-form | 7.81.0 [VERIFIED: npm view react-hook-form version] | Contact form stub state | Matches CLAUDE.md-approved stack; not yet in package.json — first real install this phase |
| zod | 4.4.3 [VERIFIED: npm view zod version] | Contact form validation schema | Same schema shape will be reused unchanged in Phase 4 when the server action lands (D-07) |
| @hookform/resolvers | 5.4.0 [VERIFIED: npm view @hookform/resolvers version] | `zodResolver` glue | **Pitfall:** resolvers 5.2.0-5.2.2 shipped a TS *type*-level overload mismatch against zod v4.3.x (runtime validation unaffected, `tsc` fails) — [CITED: github.com/react-hook-form/resolvers issues #842/#799/#813]. 5.4.0 is newer than the affected range but re-verify with `npx tsc --noEmit` immediately after wiring, not at the end of the plan. |

### shadcn components to add (official registry — Registry Safety already PASS in UI-SPEC)
| Component | Used by |
|-----------|---------|
| `Card` | FeatureGrid tiles, CertCard |
| `Badge` | Halal badge chip |
| `Input`, `Textarea`, `Label` | Contact form fields |
| `Form` (react-hook-form wrapper: `FormField`/`FormMessage`/`FormControl`) | Contact form a11y wiring (`aria-invalid`/`aria-describedby`) |
| `AspectRatio` | CertCard logo box (`aspect-[3/2]`), MediaGallery cells (`aspect-[4/3]`) |

Install command (run once, then reconcile CSS vars — see Pitfall 1 below):
```bash
npx shadcn add card badge input textarea label form aspect-ratio
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Pages` collection (slug-routed) | 6 more per-page Globals (mirroring `Home`) | Simpler 1:1 copy of an existing pattern, but duplicates the fetch-helper/revalidate-hook/admin-sidebar-entry 7x instead of once; no native slug/list-view UX for editors; rejected — see Architecture Pattern 1 |
| `Pages` collection (slug-routed) | Fully generic `[...slug]` catch-all + arbitrary page creation | Over-engineers for a fixed 7-page nav (D-08); REQUIREMENTS.md explicitly lists "overbuilt generic drag-and-drop page-builder" as an anti-feature — rejected |
| Static pre-rendered world SVG | `react-simple-maps` / `d3-geo` / `topojson` runtime libs | D-06 explicitly rules out a heavy map lib; a runtime geo-projection library adds real bundle weight + SSR complexity for a map that never needs interactivity/zoom — rejected |
| shadcn `Form` + manual ARIA wiring | Hand-rolled label/error association | shadcn's `Form` primitives already wire `aria-invalid`/`aria-describedby` correctly (UI-SPEC mandates this exact behavior) — don't hand-roll |

**Version verification performed:** `npm view react-hook-form version` -> 7.81.0; `npm view zod version` -> 4.4.3; `npm view @hookform/resolvers version` -> 5.4.0. All checked live against the npm registry during this research session, not assumed from training data.

## Architecture Patterns

### System Architecture Diagram

```
Editor (Payload /admin)
  |
  v
Pages collection doc (slug="about", layout: [HeroBlock, RichTextBlock, ...])
  |  Certifications collection docs (referenced by CertStrip/CertCard blocks)
  |  Media collection docs (referenced by upload fields inside blocks)
  v
afterChange hook: revalidatePage(doc) --> Next.js revalidatePath(`/${locale}/${slug}`)
  |
  v
Next.js RSC request: src/app/(site)/[locale]/[slug]/page.tsx  (or root page.tsx for "home")
  |
  v
getPageContent(slug, locale)  <-- generalized payload-fetch.ts helper (display + fallback-detection dual query, same shape as getHomeContent)
  |
  v
<LocaleFallbackNotice> (if !isTranslated)  +  <RenderBlocks blocks={page.layout} />
  |
  v
RenderBlocks: for each block, index -> blockType switch -> React block component
  ["hero"->Hero, "richText"->RichText, "featureGrid"->FeatureGrid, "statsBand"->StatsBand,
   "certStrip"->CertStrip, "mediaGallery"->MediaGallery, "ctaBand"->CTABand,
   "exportMap"->ExportMap, "contactBlock"->ContactBlock]
  each block computes its own alternating bg from `index` (except CTABand, which hardcodes dark)
  |
  v
Rendered inside existing GlobalHeader/GlobalFooter chrome (unchanged, [locale]/layout.tsx)
```

### Recommended Project Structure
```
src/
├── collections/
│   ├── Pages.ts              # NEW: slug + layout(blocks) field, revalidatePage hook
│   ├── Certifications.ts     # NEW: name/issuingBody/logo/certificatePdf/halal
│   ├── Media.ts              # unchanged (Phase 1)
│   └── Users.ts              # unchanged (Phase 1)
├── blocks/                   # NEW: one Payload Block config per UI-SPEC block
│   ├── Hero.ts
│   ├── RichText.ts
│   ├── FeatureGrid.ts
│   ├── StatsBand.ts
│   ├── CertStrip.ts
│   ├── MediaGallery.ts
│   ├── CTABand.ts
│   ├── ExportMap.ts
│   └── ContactBlock.ts
├── components/
│   ├── blocks/                # NEW: React render components, 1:1 with src/blocks/*.ts
│   │   ├── RenderBlocks.tsx   # blockType switch/map, index-based bg alternation
│   │   ├── HeroBlock.tsx      # generalizes existing src/components/Hero.tsx
│   │   ├── RichTextBlock.tsx
│   │   ├── FeatureGridBlock.tsx
│   │   ├── StatsBandBlock.tsx
│   │   ├── CertCard.tsx       # shared primitive: CertStrip + full grid + company-profile card all use this
│   │   ├── CertStripBlock.tsx
│   │   ├── MediaGalleryBlock.tsx
│   │   ├── CTABandBlock.tsx
│   │   ├── ExportMapBlock.tsx # renders public/maps/world.svg, applies highlight fills
│   │   └── ContactBlockClient.tsx  # "use client" — react-hook-form lives here only
│   ├── chrome/                # unchanged, only nav hrefs updated
│   └── ui/                    # + card/badge/input/textarea/label/form/aspect-ratio (shadcn add)
├── lib/
│   └── payload-fetch.ts      # getHomeContent -> generalize to getPageContent(slug, locale)
├── hooks/
│   └── revalidatePage.ts     # replaces revalidateHome.ts (generic, slug-aware)
├── globals/
│   └── (Home.ts DELETED — content migrated into Pages doc slug="home")
└── app/(site)/[locale]/
    ├── layout.tsx             # unchanged
    ├── page.tsx               # home: getPageContent("home", locale) instead of getHomeContent
    └── [slug]/
        └── page.tsx           # NEW: about/contact/certifications/manufacturing/export/company
public/
└── maps/world.svg             # NEW: static, license-cleared, checked-in map asset
```

### Pattern 1: `Pages` collection replaces `Home` global (D-02 resolution)

**What:** One `Pages` collection with `slug` (native `type:'slug'` field, `useAsSlug:'title'` or a manually-authored slug — since the 6 interior pages have fixed, hardcoded names per D-08, a plain required+unique `text` slug field is simpler than deriving from a `title` field) and a `layout` field of `type:'blocks'`, `localized:true` (cascades localization to every nested field automatically — confirmed below).

**When to use:** Every one of the 7 Phase 2 pages, including the homepage. The existing `Home` global's `heroHeadline`/`heroSubhead`/`heroImage` fields are superseded by the generalized `Hero` block's `headline`/`subhead`/`heroImage` fields — migrate this content into a `Pages` doc (`slug:"home"`) as part of the seed/migration step, then delete `src/globals/Home.ts`, remove it from `payload.config.ts`'s `globals` array, delete `revalidateHome.ts`, and delete `getHomeContent` in favor of a generalized `getPageContent`.

**Why not 7 Globals (rejected alternative):** Globals have no native `slug`/list-view; the admin sidebar would show 7 separate top-level entries instead of one discoverable "Pages" list. A collection is also Payload's own documented pattern for this exact scenario.

**Example (verified against Payload's official website template via Context7):**
```ts
// Source: Context7 /payloadcms/payload — docs/fields/blocks.mdx, docs/fields/slug.mdx
import type { CollectionConfig } from 'payload'
import { revalidatePage } from '@/hooks/revalidatePage'
import { Hero, RichTextBlock, FeatureGrid, StatsBand, CertStrip,
         MediaGallery, CTABand, ExportMap, ContactBlock } from '@/blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  access: {
    read: ({ req: { user } }) => Boolean(user), // Local API reads use overrideAccess:true, same as Phase 1
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true }, // admin-facing only
    { name: 'slug', type: 'text', required: true, unique: true, index: true }, // NOT localized — one canonical URL slug per page (fixed nav, D-08)
    {
      name: 'layout',
      type: 'blocks',
      localized: true, // cascades to every field inside every block (see Pattern 2)
      minRows: 1,
      blocks: [Hero, RichTextBlock, FeatureGrid, StatsBand, CertStrip,
               MediaGallery, CTABand, ExportMap, ContactBlock],
    },
  ],
  hooks: { afterChange: [revalidatePage] },
}
```

### Pattern 2: `localized:true` on the top-level `blocks` field cascades automatically

**What:** [VERIFIED: Context7 /payloadcms/payload docs/configuration/localization.mdx] "Enabling localization on field types that support nested fields, such as blocks, automatically localizes all fields contained within them." Same behavior confirmed for `group` and `array` field types. This means individual fields *inside* each Block config (e.g. `Hero`'s `headline`) do **not** need their own `localized:true` — it would in fact be flagged by Payload's own migration-guide note that redundant nested `localized:true` is auto-stripped (a real, current gotcha, not hypothetical).

**When to use:** Set `localized:true` once, on `Pages.layout`. Do not repeat it on block-internal text/richText/group fields.

**Anti-pattern to avoid:** Setting `localized:true` on both the `blocks` field AND its nested text fields — Payload auto-removes the redundant nested flag but this wastes admin-UI clarity and is flagged in the v3 migration guide as churn to avoid.

### Pattern 3: `RenderBlocks` — block-type-to-component switch + alternating background

**What:** A single generic component maps `blockType` (Payload's discriminant on each array item) to a React component, passing `index` for the alternation rule (UI-SPEC "two consecutive blocks never share the same background").

```tsx
// src/components/blocks/RenderBlocks.tsx
import type { Page } from '../../../payload-types' // generated union type: Page['layout'][number]
import { HeroBlock } from './HeroBlock'
import { RichTextBlock } from './RichTextBlock'
// ...remaining block imports

const BLOCK_MAP = {
  hero: HeroBlock,
  richText: RichTextBlock,
  featureGrid: FeatureGridBlock,
  statsBand: StatsBandBlock,
  certStrip: CertStripBlock,
  mediaGallery: MediaGalleryBlock,
  ctaBand: CTABandBlock,
  exportMap: ExportMapBlock,
  contactBlock: ContactBlockServer,
} as const

export function sectionBg(index: number) {
  return index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'
}

export function RenderBlocks({ blocks }: { blocks: Page['layout'] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.blockType as keyof typeof BLOCK_MAP]
        if (!Component) return null // unknown blockType: fail soft, not a blank crash
        return <Component key={block.id ?? index} block={block} index={index} />
      })}
    </>
  )
}
```
Each block component consumes `index` via `sectionBg(index)` for its own `<section className={...}>` wrapper — **except** `CTABandBlock`, which hardcodes `bg-primary-900` and ignores the alternation (this is the UI-SPEC's explicitly documented deliberate exception, not a bug).

### Pattern 4: Generalizing the Phase 1 fallback-detection helper

**What:** `getHomeContent(locale)`'s dual-query pattern (display query with fallback on + existence query with `fallbackLocale:false`) generalizes cleanly to any slug:

```ts
// src/lib/payload-fetch.ts — generalized from the existing getHomeContent
export async function getPageContent(slug: string, locale: Locale) {
  const payload = await getPayload({ config })
  const display = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1,
    locale, fallbackLocale: locale === 'en' ? undefined : 'en', overrideAccess: true,
  })
  const nativeCheck = await payload.find({
    collection: 'pages', where: { slug: { equals: slug } }, limit: 1,
    locale, fallbackLocale: false, overrideAccess: true,
  })
  const page = display.docs[0] ?? null
  const isTranslated = locale === 'en' || Boolean(nativeCheck.docs[0]?.title)
  return { page, isTranslated }
}
```
This is a direct, mechanical generalization of code that already exists and is already tested in `tests/int/payload-fallback.spec.ts` — reuse the same test pattern for the new helper (swap `Home` fixtures for a `Pages` fixture).

### Pattern 5: Generalizing the revalidate hook (verified against Payload's own docs, not just Phase 1's version)

[CITED: Context7 /payloadcms/payload — tools/claude-plugin/skills/payload/reference/HOOKS.md] Payload's own reference hook for exactly this scenario:
```ts
export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc, previousDoc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc
  const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
  // NOTE: this project is 4-locale path-prefixed (en at root, /ar /fr /ru prefixed) —
  // extend the official single-path example to all 4 locale paths, mirroring
  // revalidateHome.ts's existing per-locale revalidatePath loop.
  for (const locale of ['', '/ar', '/fr', '/ru']) {
    revalidatePath(locale === '' ? path : `${locale}${path === '/' ? '' : path}`)
  }
  return doc
}
```

### Pattern 6: Explicit `[slug]` route, not a catch-all

**What:** `src/app/(site)/[locale]/[slug]/page.tsx` (single dynamic segment) handles the 6 interior pages; the existing root `page.tsx` continues to own the homepage (now reading `getPageContent("home", locale)` instead of `getHomeContent`). `generateStaticParams` on `[slug]/page.tsx` returns the 6 known slugs so all pages are statically generated at build time, matching Phase 1's SSG-first approach; on-demand ISR via `revalidatePage` handles publish-time freshness (CMS-03 spirit) without a rebuild.

**When to use:** This fixed, small (6+1) page set — do not build a general `[...slug]` catch-all, which would falsely imply arbitrary editor-created pages are supported (explicitly an anti-feature per REQUIREMENTS.md "Out of Scope").

### Anti-Patterns to Avoid
- **Draft/versions workflow (`versions: { drafts: true }`):** Not requested by any Phase 2 requirement or CONTEXT decision; CMS-01 only needs create/edit/publish, which Payload's default (no-drafts) collection behavior already satisfies. Adding drafts now is scope creep — skip until a real preview-before-publish need appears.
- **Preview/draftMode route (`/preview`):** Same reasoning — the official website-template pattern includes a preview route, but nothing in this phase's CONTEXT/UI-SPEC asks for editor content previews before publish. Skip.
- **A heavy interactive map library for ExportMap:** Explicitly an anti-feature (D-06, REQUIREMENTS.md "Interactive 3D globe... heavy gimmicks").
- **Re-localizing nested block fields individually:** redundant given Pattern 2 — wastes admin-UI clarity, gets silently stripped by Payload anyway.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field <-> error message ARIA association | Manual `aria-describedby`/`aria-invalid` wiring | shadcn `Form`/`FormField`/`FormMessage` (react-hook-form context wrapper) | Already solves this exact requirement (UI-SPEC mandates it); hand-rolling risks a11y regressions |
| Client + server validation drift | Two separate validation implementations (client JS + future Phase 4 server action) | One `zod` schema, imported by both the client form (via `zodResolver`) and, later, the Phase 4 server action | D-07 explicitly designs the seam this way — build the schema once now |
| World map rendering | Hand-drawn/traced country paths, or a canvas-based custom renderer | A pre-made, ISO-coded SVG (see Pitfall/Open Question 3) with CSS-class-driven fills | Correctly-projected, complete country path data is a solved problem; hand-tracing 190+ country borders is not a good use of a launch-stage marketing site's budget |
| Slug-based content routing + revalidation | A custom slug-resolver / custom cache-tag system | Payload's native `slug` field type + `revalidatePath` in `afterChange` (Pattern 5) | This is Payload's own documented reference architecture, verified via Context7 — not a hypothesis |

**Key insight:** Every "don't hand-roll" item above already has a proven, in-repo precedent from Phase 1 (revalidate hooks, fallback-detection queries, shadcn Form primitives are the same shape as Button/DropdownMenu/Sheet) — Phase 2's job is disciplined generalization of what's there, not new invention.

## Common Pitfalls

### Pitfall 1: Missing shadcn CSS variables will silently break new components (HIGH confidence — verified by direct code inspection)
**What goes wrong:** `npx shadcn add card badge input textarea label form aspect-ratio` generates components that reference `--destructive`, `--border`, `--input`, `--ring`, `--accent`/`--accent-foreground`, `--muted`/`--muted-foreground`, `--card`/`--card-foreground`, `--secondary`/`--secondary-foreground`, `--popover`/`--popover-foreground`. `src/app/globals.css` currently defines **only** `--background`, `--foreground`, `--primary`, `--primary-foreground` [VERIFIED: read `src/app/globals.css` directly — lines 57-62]. `src/components/ui/button.tsx`'s `outline`/`destructive`/`secondary`/`ghost` variants already silently reference these undefined vars today (only the `default` variant, which Phase 1 exclusively uses, happens to work).
**Why it happens:** Phase 1 hand-picked a minimal token subset sufficient for one Button variant + one Hero. Phase 2 is the first phase to actually exercise `Button variant="outline"` (Hero/CTABand secondary CTA), `text-destructive`/`border-destructive` (Contact validation), and Card/Input/Badge's own slots.
**How to avoid:** Before wiring any new block, add the missing `:root` variables to `globals.css`, mapped to brand tokens from `01-UI-SPEC.md`'s Color table (not shadcn's generic defaults) — concretely: `--destructive: #B91C1C` (UI-SPEC-specified value, "activated this phase"), `--border`/`--input`: `var(--color-neutral-300)`, `--ring`: `var(--color-accent-600)` (matches the existing `focus-visible:ring-accent-600` override pattern already used on `PrimaryButton`), `--muted`: `var(--color-neutral-100)`, `--muted-foreground`: `var(--color-neutral-600)`, `--card`/`--popover`: `#ffffff`, `--card-foreground`/`--popover-foreground`: `var(--color-neutral-900)`, `--secondary`: `var(--color-neutral-100)`, `--secondary-foreground`: `var(--color-neutral-900)`. **Do not map shadcn's generic `--accent`/`--accent-foreground` slot to the brand gold `accent-600`/`accent-800` tokens** — UI-SPEC's own rule is "accent is reserved for trim/badges/dividers, never floods," but shadcn's generic `--accent` is used as a *hover background* on `outline`/`ghost` buttons and menu items, which would flood gold on every hover. Map shadcn's generic `--accent` to `var(--color-neutral-100)` instead, keeping the brand gold exclusively on the explicitly-designed Halal badge/PDF-icon/divider uses.
**Warning signs:** Any new component renders with invisible/transparent borders, invisible focus rings, or a hover state that looks identical to the default state.

### Pitfall 2: `@hookform/resolvers` <-> `zod` v4 type-overload breakage (MEDIUM confidence — cited, version-specific)
**What goes wrong:** [CITED: github.com/react-hook-form/resolvers issues #799, #813, #842] `zodResolver()`'s TypeScript overloads have broken against specific zod v4.3.x + resolvers v5.2.0-5.2.2 combinations — runtime validation still works, but `tsc --noEmit` fails.
**Why it happens:** Zod v4 changed its internal branding/type structure; resolver packages have had to chase this with point releases.
**How to avoid:** Pin exact verified versions at install time (`react-hook-form@7.81.0 zod@4.4.3 @hookform/resolvers@5.4.0` — all verified against the registry in this research session) and run `npx tsc --noEmit` **immediately** after wiring the Contact form's `zodResolver`, not at the end of the task. If it breaks, the documented workaround is a manual `resolver` function bypassing the broken overload, or pinning to a resolvers version confirmed compatible with the exact zod minor in use.
**Warning signs:** `tsc` error mentioning `Resolver<input<T>, any, output<T>>` vs `Resolver<output<T>, any, output<T>>`.

### Pitfall 3: `heroImage`-style upload-relation fields inside blocks need the same populate/typeof-check pattern as the existing `Hero.tsx` (HIGH confidence — direct code precedent)
**What goes wrong:** Payload upload/relationship fields are typed as `number | Media | null` (unpopulated ID vs. populated object) depending on query `depth`. The existing `src/components/Hero.tsx` already handles this correctly (`typeof content.heroImage === "object"` guard, line 18-20) — every new block component with a `Media` upload field (Hero's own `heroImage`, `CertCard`'s `logo`/`certificatePdf`, `MediaGallery`'s `items[].image`) must repeat this exact guard, and the `Pages`/`Certifications` `find`/`findGlobal` calls must use a `depth` sufficient to populate them (Phase 1 used the default depth, which populated one level deep — keep `depth` unset/default rather than tuning it, since one-level relations here don't nest further).
**Warning signs:** `image.url` reads as `undefined` on a rendered page even though the admin UI shows the logo/photo attached — almost always a `depth`/populate mismatch, not a missing upload.

### Pitfall 4: SQLite (dev) vs Postgres (prod) parity for `blocks`/`array` fields (MEDIUM confidence)
**What goes wrong:** Both adapters store `blocks` and `array` field data in separate join tables keyed by parent ID + `_order` — this is standard, well-supported Payload behavior on both adapters, so no divergence is expected. The one real local/prod difference this phase must respect (per the objective's explicit constraint) is: **do not add any Postgres-only assumption** (e.g., a raw SQL migration file authored against Postgres syntax) — the existing `push:true` (Postgres) / dev-auto-push (SQLite) schema-sync mechanism from `payload.config.ts` already handles new collections/fields on both adapters with zero extra code, exactly as it did for `Media`/`Users`/`Home` in Phase 1.
**How to avoid:** Add `Pages`/`Certifications` as plain Payload collection configs (no custom SQL, no adapter-specific hooks) — verified this is sufficient by inspecting `payload.config.ts`'s existing `db` block, which requires no per-collection adapter branching today.

### Pitfall 5: Certificate/PDF trust content — legal caution (already flagged in CONTEXT/UI-SPEC, reconfirmed here)
**What goes wrong:** Fabricating specific certification numbers, registration numbers, or client-logo-style content in "placeholder" copy creates real legal/trust risk if it ships to production accidentally.
**How to avoid:** UI-SPEC's own PDF-absent state ("Certificate available on request") and empty-state copy already solve this correctly — this phase's task should verify no seed/placeholder content invents a specific IEC number, FSSAI license number, or named client, per Pitfall 9 in `.planning/research/PITFALLS.md` (referenced, not re-derived here).

## Code Examples

### CertCard shared primitive (drives both CertStrip and the full grid, per UI-SPEC "single reusable primitive")
```tsx
// src/components/blocks/CertCard.tsx
import Image from "next/image"
import { Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Certification, Media } from "../../../payload-types"

export function CertCard({ cert, t }: { cert: Certification; t: (key: string) => string }) {
  const logo = cert.logo && typeof cert.logo === "object" ? (cert.logo as Media) : null
  const pdf = cert.certificatePdf && typeof cert.certificatePdf === "object" ? (cert.certificatePdf as Media) : null

  return (
    <Card
      className={cert.halal
        ? "col-span-2 border-2 border-accent-600 bg-white p-lg md:col-span-2"
        : "border border-neutral-300 bg-white p-lg"}
    >
      {cert.halal ? (
        <Badge className="mb-sm bg-accent-100 text-accent-800">{t("halalBadge")}</Badge>
      ) : null}
      <div className="relative aspect-[3/2] w-full bg-white">
        {logo?.url ? (
          <Image src={logo.url} alt={logo.alt} fill className="object-contain" />
        ) : null}
      </div>
      <p className="mt-md text-body font-semibold">{cert.name}</p>
      <p className="text-label text-neutral-600">{cert.issuingBody}</p>
      {pdf?.url ? (
        <a
          href={pdf.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${cert.name} certificate (PDF)`}
          className="mt-sm inline-flex items-center gap-xs text-label text-neutral-900 hover:text-accent-800"
        >
          <Download aria-hidden="true" className="size-4" />
          {t("downloadPdf")}
        </a>
      ) : (
        <p className="mt-sm text-label text-neutral-600">{t("pdfUnavailable")}</p>
      )}
    </Card>
  )
}
```

### Certifications collection
```ts
// src/collections/Certifications.ts
import type { CollectionConfig } from "payload"

export const Certifications: CollectionConfig = {
  slug: "certifications",
  admin: { useAsTitle: "name" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "issuingBody", type: "text", required: true, localized: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    { name: "certificatePdf", type: "upload", relationTo: "media" }, // optional — drives PDF-absent state
    { name: "validityNotes", type: "text", localized: true },
    { name: "halal", type: "checkbox", defaultValue: false }, // D-04/D-05
    { name: "displayOrder", type: "number", defaultValue: 0 }, // editor-controlled sort, avoids hard-coding order in query
  ],
}
```

## State of the Art

| Old Approach (Phase 1) | Current Approach (Phase 2) | When Changed | Impact |
|--------------------------|------------------------------|---------------|--------|
| `Home` global, 2 flat localized text fields | `Pages` collection, `blocks` field, 9 block types | This phase | Every future marketing page (Phase 5 blog excluded — that's its own collection) reuses this, not the global pattern |
| `getHomeContent(locale)` single-purpose helper | `getPageContent(slug, locale)` generic helper | This phase | One helper serves all 7 pages instead of one per page |
| `revalidateHome` hook, hardcoded path | `revalidatePage` hook, slug-derived path | This phase | Matches Payload's own documented reference hook (Context7-verified) |

**Deprecated/outdated:** `src/globals/Home.ts` and `src/hooks/revalidateHome.ts` are deleted this phase, superseded by the collection-based pattern above.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `flekschas/simple-world-map` (CC BY-SA 3.0) is an acceptable license for this commercial site's map asset | ExportMap / Pitfall (Open Questions) | Share-alike clauses on a derivative asset could create an unintended obligation to license the modified SVG under the same terms; needs legal-owner review before shipping, per org instructions — do not treat this citation as pre-cleared |
| A2 | SimpleMaps.com's "free for commercial use, attribution appreciated" world SVG is a lower-risk permissive alternative | ExportMap / Open Questions | Exact license terms were not fetched/verified in this session (WebSearch summary only) — must be confirmed directly on simplemaps.com before use |
| A3 | A plain required+unique `text` slug field (not Payload's native `type:'slug'` auto-generator) is sufficient since the 6 interior page slugs are fixed/hardcoded per D-08 | Pattern 1 | If the client later wants editors to freely rename URL slugs, the native `slug` field type (auto-derived from `title`, still editable) would be a smaller retrofit than expected — low risk, easily added later |
| A4 | No draft/versions workflow is needed for `Pages`/`Certifications` in Phase 2 | Anti-Patterns | If a stakeholder review process later requires "review before publish," retrofitting `versions:{drafts:true}` on an existing collection is a schema-additive, non-breaking change — low risk |

**If this table is empty:** N/A — see rows above; all other claims in this document were verified via Context7, npm registry, or direct codebase inspection during this session.

## Open Questions (RESOLVED)

1. **World map SVG source license clearance** — RESOLVED: 02-06 sidesteps the CC BY-SA asset by shipping a self-authored/license-safe simplified SVG (or marks the asset step autonomous:false for legal clearance); no share-alike asset ships blind.
   - What we know: `flekschas/simple-world-map` is CC BY-SA 3.0 with ISO alpha-2 path IDs, ~24KB gzipped, verified directly on its GitHub page. SimpleMaps.com and IP2Location also surfaced as candidates with different license terms (CC BY-SA 4.0 for IP2Location; "free for commercial use" claimed but unverified for SimpleMaps).
   - What's unclear: Whether share-alike terms are acceptable for this commercial client site, and whether SimpleMaps' exact license text (not independently fetched this session) is actually as permissive as its marketing copy suggests.
   - Recommendation: Flag for the project's legal-review step before the ExportMap task ships; in the plan, make "confirm map SVG license" an explicit task/checklist item, not an assumption baked into the code comment.

2. **`Pages.slug` vs Payload's native `type:'slug'` field** — RESOLVED: ship the plain `text` slug field now (Pattern 1 / 02-02); nav is hardcoded per D-08, upgrade to auto-slug later only if editors need path renaming.
   - What we know: Both work; the native type auto-derives from a `title` field with editor override.
   - What's unclear: Whether the client will ever want editors renaming URL paths independent of nav (currently fixed/hardcoded per D-08).
   - Recommendation: Ship the simpler plain `text` field now (per Pattern 1); this is a low-cost, additive change to upgrade later if needed.

## Environment Availability

Skipped — this phase has no new external tool/service dependency beyond what Phase 1 already established (Payload, Postgres/SQLite, Vercel Blob, all already verified live in production per `01-04` commits). `npm view` calls above confirm registry availability of the 3 new npm packages (react-hook-form, zod, @hookform/resolvers) at the verified versions.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 (int project, Payload Local API) + Playwright 1.61.1 (e2e, en+ar projects) [VERIFIED: package.json] |
| Config file | `vitest.config.ts` (int project) / `playwright.config.ts` |
| Quick run command | `npx vitest run tests/int/<new-spec>.spec.ts` |
| Full suite command | `npm run test && npm run test:e2e` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-01 | Homepage renders Hero->FeatureGrid->CertStrip->StatsBand->ExportMap->CTABand in order | e2e | `npx playwright test tests/e2e/homepage-blocks.spec.ts` | ❌ Wave 0 |
| PAGE-02/03/05 (TRUST-05) | About/Contact/Company pages render at `/[locale]/<slug>` with correct block sequence | e2e | `npx playwright test tests/e2e/page-routing.spec.ts` | ❌ Wave 0 |
| PAGE-03 | Contact form: client validation shows/clears errors per field, submit shows inline confirmation, no network call fires | e2e | `npx playwright test tests/e2e/contact-form-stub.spec.ts` | ❌ Wave 0 |
| PAGE-04 | Header/footer nav links resolve to real routes (no more `href="#"`) across all 7 pages | e2e | `npx playwright test tests/e2e/nav-links.spec.ts` | ❌ Wave 0 |
| TRUST-01/02 | Certifications page lists certs; halal cert renders elevated (2-col span + badge); PDF-present vs PDF-absent states both render correctly | int (Local API) + e2e | `npx vitest run tests/int/certifications.spec.ts` | ❌ Wave 0 |
| TRUST-04 | ExportMap renders `role="img"` + `aria-label`, visible country-name chip list always present (not gatekept by the map) | e2e (a11y assertion) | `npx playwright test tests/e2e/export-map-a11y.spec.ts` | ❌ Wave 0 |
| TRUST-06 | `Pages`/`Certifications` fallback-detection (`isTranslated`) mirrors the proven `Home` global behavior | int (Local API) | `npx vitest run tests/int/pages-fallback.spec.ts` | ❌ Wave 0 |
| (cross-cutting) | RTL guard passes on all new components | static check | `npm run lint:rtl` | ✅ exists (`scripts/check-physical-direction.mjs`) |
| (cross-cutting) | `tsc`/build clean after `zodResolver` wiring (Pitfall 2) | static check | `npx tsc --noEmit` | ✅ exists |

### Sampling Rate
- **Per task commit:** relevant `npx vitest run tests/int/<file>` + `npx tsc --noEmit` + `npm run lint:rtl`
- **Per wave merge:** `npm run test && npm run test:e2e` (full suite, both en+ar Playwright projects)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/int/pages-fallback.spec.ts` — mirrors existing `tests/int/payload-fallback.spec.ts` pattern for the new `Pages` collection
- [ ] `tests/int/certifications.spec.ts` — halal elevation + PDF-present/absent
- [ ] `tests/e2e/homepage-blocks.spec.ts`, `page-routing.spec.ts`, `contact-form-stub.spec.ts`, `nav-links.spec.ts`, `export-map-a11y.spec.ts` — new e2e specs, en+ar matrix (existing Playwright projects already cover both)
- [ ] No new framework/config install needed — Vitest int project and Playwright config already generalize to new collections/routes with zero config changes

## Security Domain

### Applicable ASVS Categories (Level 1)
| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | yes (admin only) | Payload's built-in `auth:true` on `Users` — unchanged from Phase 1, no new auth surface this phase |
| V3 Session Management | yes (admin only) | Payload's built-in session/JWT handling — unchanged |
| V4 Access Control | yes | `Pages`/`Certifications` access functions locked to `Boolean(user)` for all operations, matching the existing `Home`/`Media` pattern exactly — public site reads go through the server-side Local API with explicit `overrideAccess:true`, never the public REST/GraphQL surface (same as Phase 1) |
| V5 Input Validation | yes | Contact form: `zod` schema (client-side only this phase, per D-07) validates all 4 fields before the inline-confirmation UI state change; server-side validation of the same schema is Phase 4 scope when the real submission lands |
| V6 Cryptography | no | No new crypto surface this phase |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Unrestricted file upload disguised as image/PDF | Tampering | Already mitigated — `Media.ts`'s `mimeTypes: ["image/*", "application/pdf"]` restriction is unchanged and covers all new upload fields (cert logos/PDFs, gallery photos) since they all relate to the same `Media` collection |
| Public exposure of unpublished/draft Pages content | Information Disclosure | N/A this phase — no drafts feature is introduced (see Anti-Patterns); all `Pages`/`Certifications` docs are effectively "always published" once created, matching `Home`'s current behavior |
| XSS via RichText/Lexical output rendered unsanitized | Tampering | Payload's Lexical editor + its own React JSX converters (already installed, `@payloadcms/richtext-lexical`) handle safe serialization — do not hand-roll a `dangerouslySetInnerHTML` path for RichText content |
| Reflected content in `aria-label`/`alt` from CMS fields | Tampering (minor) | React's default JSX escaping already neutralizes this; no additional sanitization needed for text interpolated into `alt`/`aria-label` |

## Sources

### Primary (HIGH confidence)
- Context7 `/payloadcms/payload` — `docs/fields/blocks.mdx`, `docs/fields/slug.mdx`, `docs/configuration/localization.mdx`, `docs/fields/array.mdx`, `docs/fields/group.mdx`, `docs/migration-guide/v3.mdx`, `tools/claude-plugin/skills/payload/reference/HOOKS.md`, `tools/claude-plugin/skills/payload/reference/FIELDS.md` — blocks field definition, field-level localization cascade behavior, revalidate-hook reference pattern
- Context7 `/payloadcms/website` — official Next.js website-template preview/draft/Pages-collection reference pattern (`public/llms-full.txt`)
- Direct codebase reads: `src/payload.config.ts`, `src/globals/Home.ts`, `src/collections/{Media,Users}.ts`, `src/lib/payload-fetch.ts`, `src/components/{Hero.tsx,chrome/*}`, `src/app/(site)/[locale]/{layout,page}.tsx`, `src/app/globals.css`, `src/components/ui/button.tsx`, `package.json`, `vitest.config.ts`, `playwright.config.ts`, `scripts/check-physical-direction.mjs`, `components.json`, `.planning/phases/01-foundation-cms-decision/01-0{2,3}-SUMMARY.md`
- `npm view react-hook-form version` -> 7.81.0; `npm view zod version` -> 4.4.3; `npm view @hookform/resolvers version` -> 5.4.0 (live registry checks, this session)
- GitHub direct fetch: `flekschas/simple-world-map` license/README (CC BY-SA 3.0, ISO alpha-2 IDs, file sizes)

### Secondary (MEDIUM confidence)
- WebSearch: `@hookform/resolvers` <-> zod v4 compatibility issues (github.com/react-hook-form/resolvers #799, #813, #842) — cross-referenced against the actual issue titles/summaries, not just search snippets
- WebSearch: free/open-license SVG world map options (simplemaps.com, IP2Location, react-svg-worldmap, world-map-country-shapes) — license claims for SimpleMaps/IP2Location not independently fetched this session

### Tertiary (LOW confidence)
- None retained — every finding above was either Context7/npm-registry-verified or explicitly flagged in the Assumptions Log / Open Questions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified live against the npm registry this session
- Architecture (Pages collection, RenderBlocks, revalidate/fetch generalization): HIGH — verified against Payload's own official docs/website-template via Context7 and against this project's actual Phase 1 code
- Pitfalls (CSS variable gap, resolver/zod compatibility): HIGH for the CSS gap (directly inspected `globals.css`/`button.tsx`), MEDIUM for the resolver/zod issue (cited GitHub issues, version-range-specific)
- Map SVG source/license: MEDIUM — candidates identified and one license directly fetched/confirmed, but final legal clearance is an open item, not resolved here

**Research date:** 2026-07-15
**Valid until:** 30 days (stable stack; re-verify `@hookform/resolvers` version if the plan/build is executed materially later, given its active-issue history)
