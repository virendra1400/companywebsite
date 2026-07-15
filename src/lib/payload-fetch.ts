import { getPayload } from "payload";
import config from "@payload-config";
import type { Locale } from "@/i18n/routing";
import type { Page } from "../../payload-types";

// FOUND-06/D-06: detect whether the active locale has real (non-fallback)
// content so the page can show the English-plus-notice fallback rather than
// silently serving English with no signal. RESEARCH Pattern 4 — generalizes
// the Phase 1 getHomeContent dual-query pattern to any Pages slug.
export async function getPageContent(
  slug: string,
  locale: Locale
): Promise<{ page: Page | null; isTranslated: boolean }> {
  const payload = await getPayload({ config });

  // Display query: fallback ON — always returns usable content.
  const display = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
  });

  // Existence check: fallback OFF — null/empty means this locale has no
  // translation yet (silent Payload fallback would otherwise hide this).
  const nativeCheck = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });

  const page = display.docs[0] ?? null;
  const isTranslated = locale === "en" || Boolean(nativeCheck.docs[0]?.title);

  return { page, isTranslated };
}
