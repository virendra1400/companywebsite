import { defineRouting } from "next-intl/routing";

// D-05: path-prefix routing — English at root (/), others prefixed (/ar, /fr, /ru).
export const routing = defineRouting({
  locales: ["en", "ar", "fr", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// FOUND-03: only Arabic is RTL. Consumed server-side by the locale layout.
export const RTL_LOCALES = new Set<string>(["ar"]);
