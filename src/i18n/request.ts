import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Loads chrome-string messages for the active locale and declares the `latn`
// number format. FOUND-03: Intl defaults `ar` to Arabic-Indic digits, so every
// number rendered for Arabic must use format.number(n, "latn") to stay Western.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    formats: {
      number: {
        latn: { numberingSystem: "latn" },
      },
    },
  };
});
