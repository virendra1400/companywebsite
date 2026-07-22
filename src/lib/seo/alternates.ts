import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

// Pitfall 4: real prod base URL comes from Vercel env; localhost fallback is
// dev-only. NEVER let this default ship to a production canonical.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// D-05/localePrefix:"as-needed" — the default locale (en) is un-prefixed;
// every other locale gets a /<locale> prefix. "/" normalizes to the bare
// origin (no trailing slash / empty segment).
export function localeUrl(locale: Locale, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = path === "/" ? "" : path;
  return `${BASE}${prefix}${suffix}`;
}

// SEO-02/D-08: reciprocal, self-referencing hreflang map — every translated
// locale (including a self-key) points at its own URL, plus exactly one
// x-default at the un-prefixed English root. Iterates routing.locales (fixed
// order) so output is deterministic across builds (SEO-01 ordering case).
export function buildAlternates(
  translatedLocales: Locale[],
  path: string,
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
    canonical: localeUrl(routing.defaultLocale, path),
    languages,
  };
}
