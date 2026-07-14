import { getPayload } from "payload";
import config from "@payload-config";

// FOUND-06/D-06: detect whether the active locale has real (non-fallback)
// content so the page can show the English-plus-notice fallback rather than
// silently serving English with no signal. RESEARCH Pattern 3.
export async function getHomeContent(locale: string) {
  const payload = await getPayload({ config });

  // Display query: fallback ON — always returns usable content.
  const display = await payload.findGlobal({
    slug: "home",
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
  });

  // Existence check: fallback OFF — null/empty means this locale has no
  // translation yet (silent Payload fallback would otherwise hide this).
  const nativeCheck = await payload.findGlobal({
    slug: "home",
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });

  const isTranslated = locale === "en" || Boolean(nativeCheck?.heroHeadline);

  return { content: display, isTranslated };
}
