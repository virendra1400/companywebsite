import { notFound, permanentRedirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getProduct } from "@/lib/payload-fetch";
import { localePath } from "@/lib/seo/alternates";
import type { Locale } from "@/i18n/routing";
import type { Category } from "../../../../../../payload-types";

// T-105/MASTER_PLAN §5.2 (LOCKED — E-01): the flat /products/{slug} URL is
// permanently redirected to the new nested /products/{category}/{slug}
// shape — see ./[slug]/page.tsx for the real detail page. This route now
// exists ONLY as a 301 shim so old links (search results, bookmarks,
// anything shared before this migration) keep working. The redirect target
// is looked up live (not a hardcoded map) so it stays correct if a
// product's category ever changes.
//
// Folder is named [category] (not [slug]) despite receiving a PRODUCT slug
// here — Next.js requires the same dynamic segment name at a given path
// depth across the whole route tree, and this position is [category] in
// the sibling ./[slug]/page.tsx detail route (2-segment URL). The param is
// immediately re-read into a sanely-named local var below.
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
  });
  return result.docs.map((doc) => ({ category: doc.slug }));
}

export default async function ProductLegacyUrlRedirect({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: productSlug } = await params;
  const { product } = await getProduct(productSlug, locale as Locale);
  if (!product) notFound();

  const category = typeof product.category === "object" ? (product.category as Category) : null;
  if (!category) notFound();

  permanentRedirect(localePath(locale as Locale, `/products/${category.slug}/${productSlug}`));
}
