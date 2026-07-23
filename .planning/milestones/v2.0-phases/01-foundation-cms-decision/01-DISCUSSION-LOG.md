# Phase 1: Foundation & CMS Decision - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-14
**Phase:** 1-Foundation & CMS Decision
**Areas discussed:** CMS + hosting, Locale URL structure, Fallback behavior, Skeleton scope

---

## CMS

| Option | Description | Selected |
|--------|-------------|----------|
| Payload (self-host) | TS-native, in the Next app, free/flat cost, field-level i18n + EN fallback; RTL admin-chrome caveat | ✓ |
| Sanity (SaaS) | Hosted studio, zero infra, doc-level i18n; usage pricing, cloud residency | |
| Strapi (self-host) | Mature standalone CMS, heavier ops | |
| You decide via spike | Spike Payload first, fall back to Sanity | |

**User's choice:** Payload (self-host)
**Notes:** Spike must confirm Arabic RTL admin limitation is cosmetic-only; fall back to Sanity only if Arabic editing is genuinely unusable.

## Hosting

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel + managed DB | Vercel + managed Postgres + S3-compatible storage, low-ops | (Claude's discretion default) |
| Full self-host (VPS) | One VM runs app+DB+storage | |
| You decide | Standard low-ops hosting for chosen CMS | ✓ |

**User's choice:** You decide
**Notes:** Defaulting to Vercel + managed Postgres + object storage.

## Data region

| Option | Description | Selected |
|--------|-------------|----------|
| EU region | GDPR-friendly for EU buyers + inquiry PII | ✓ |
| India region | Closer to ops; needs GDPR handling for EU data | |
| No preference | Claude picks; CDN serves globally | |

**User's choice:** EU region

## Locale URL structure

| Option | Description | Selected |
|--------|-------------|----------|
| Path prefix /ar/ | EN at root, others prefixed; single domain, best SEO | ✓ |
| Subdomain ar.… | Per-locale subdomains; more setup, splits authority | |
| Country domains | ccTLDs; maximal signal, overkill | |

**User's choice:** Path prefix /ar/

## Fallback behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hide from that locale | Untranslated pages absent from locale nav/sitemap | |
| English + notice | Show English with "not yet available in [language]" note | ✓ |
| Silent English fallback | English rendered silently, no notice | |

**User's choice:** English + notice

## Skeleton scope

| Option | Description | Selected |
|--------|-------------|----------|
| Bare shell | Header/footer/switcher + responsive shell + one placeholder home proving pipeline | (Claude's discretion default) |
| Navigable skeleton | Also routed stubs for all main pages | |
| You decide | Minimum skeleton that proves the foundation | ✓ |

**User's choice:** You decide
**Notes:** Defaulting to bare shell — real pages are Phase 2.

## Claude's Discretion

- Hosting provider/DB/storage specifics (within Vercel + managed-Postgres + object-storage + EU envelope)
- Skeleton minimalism / placeholder home detail

## Deferred Ideas

- Full premium page-level visual design → Phase 2 / `/gsd-ui-phase`
- CRM vendor selection → Phase 4
- Real content population → business-supplied, across phases
- ar/fr/ru professional translation go-live → post-launch (FOUND-02)
