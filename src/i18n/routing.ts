import { defineRouting } from "next-intl/routing";

// D-05: path-prefix routing — English at root (/), others prefixed (/ar, /fr, /ru).
// localeDetection off: the English root stays stable for every visitor and every
// crawler (SEO canonical), rather than 307-redirecting on Accept-Language. Locale
// changes are explicit via the LanguageSwitcher (FOUND-04).
export const routing = defineRouting({
  locales: ["en", "ar", "fr", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

// FOUND-03: only Arabic is RTL. Consumed server-side by the locale layout.
export const RTL_LOCALES = new Set<string>(["ar"]);
