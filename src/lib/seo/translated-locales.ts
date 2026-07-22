import { getPayload } from "payload";
import type { CollectionSlug } from "payload";
import config from "@payload-config";
import { routing, type Locale } from "@/i18n/routing";

// SEO source collections. "insights" is registered by a sibling Wave-1 plan
// (BLOG-01/02) — cast to CollectionSlug below so this module type-checks
// standalone even before that collection lands in payload.config.ts.
export type SeoCollection = "pages" | "products" | "insights";

const TITLE_FIELD: Record<SeoCollection, string> = {
  pages: "title",
  products: "name",
  insights: "title",
};

// Collections with no published/draft flag — pages are always public once
// they exist (no draft workflow), unlike products/insights (T-03-01 precedent).
const UNGATED_COLLECTIONS = new Set<SeoCollection>(["pages"]);

// D-07: existence-check only (fallbackLocale:false) — mirrors payload-fetch.ts's
// nativeCheck query exactly, run across all 4 locales instead of just the
// active one. en is always treated as translated (source of truth locale).
// published:true is applied only for collections that have a published field
// (products, insights) — pages have no such field.
export async function getTranslatedLocales(
  collection: SeoCollection,
  slug: string,
): Promise<Locale[]> {
  const payload = await getPayload({ config });
  const titleField = TITLE_FIELD[collection];
  const gated = !UNGATED_COLLECTIONS.has(collection);

  const checks = await Promise.all(
    routing.locales.map(async (locale) => {
      if (locale === routing.defaultLocale) return locale;

      const result = await payload.find({
        collection: collection as CollectionSlug,
        where: gated
          ? { slug: { equals: slug }, published: { equals: true } }
          : { slug: { equals: slug } },
        limit: 1,
        locale,
        fallbackLocale: false,
        overrideAccess: true,
      });

      const doc = result.docs[0] as unknown as Record<string, unknown> | undefined;
      return doc?.[titleField] ? locale : null;
    }),
  );

  return checks.filter((l): l is Locale => l !== null);
}
