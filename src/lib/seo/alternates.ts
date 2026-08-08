import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

// Pitfall 4: real prod base URL comes from Vercel env; localhost fallback is
// dev-only. NEVER let this default ship to a production canonical.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// D-05/localePrefix:"as-needed" — the default locale (en) is un-prefixed;
// every other locale gets a /<locale> prefix. "/" normalizes to the bare
// origin (no trailing slash / empty segment).
export function localeUrl(locale: Locale, path: string): string {
  return `${BASE}${localePath(locale, path)}`;
}

// Same prefixing rule as localeUrl, minus the domain — for internal
// redirect() / permanentRedirect() targets, which must stay relative. Using
// localeUrl's BASE-prefixed absolute URL there would jump a preview/staging
// deployment to whatever NEXT_PUBLIC_SITE_URL points at (production), not
// stay on the current deployment.
export function localePath(locale: Locale, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = path === "/" ? "" : path;
  return `${prefix}${suffix}`;
}

// SEO-02/D-08: reciprocal, self-referencing hreflang map — every translated
// locale (including a self-key) points at its own URL, plus exactly one
// x-default at the un-prefixed English root. Iterates routing.locales (fixed
// order) so output is deterministic across builds (SEO-01 ordering case).
//
// D-50 fix: `canonical` used to be hardcoded to the English URL for every
// call, regardless of which locale's page was rendering — so /ar/about's
// own <link rel="canonical"> pointed at /about, telling Google the Arabic
// page isn't the authoritative version of itself. That's a real duplicate-
// content signal that suppresses the localized page from ranking at all,
// not a cosmetic issue — and contradicts SEO_PLAYBOOK §5's own rule
// ("Canonical on every page (self)"). Canonical must self-reference the
// CURRENT locale; only the hreflang `languages` map is meant to list every
// variant. `currentLocale` is required so every caller must supply it
// (compile error otherwise), rather than silently defaulting wrong again.
export function buildAlternates(
  translatedLocales: Locale[],
  path: string,
  currentLocale: Locale,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {
    "x-default": localeUrl(routing.defaultLocale, path),
  };

  for (const locale of routing.locales) {
    if (translatedLocales.includes(locale)) {
      languages[locale] = localeUrl(locale, path);
    }
  }

  return {
    canonical: localeUrl(currentLocale, path),
    languages,
  };
}
