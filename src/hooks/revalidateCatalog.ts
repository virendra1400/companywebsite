import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// CAT-03: adapts revalidatePage.ts's exact per-locale revalidatePath mechanics
// to the new Categories/Products collections. A Category change only affects
// the catalog INDEX (D-05: flat grouping, no per-category landing page) —
// revalidate '/products' only. A Product change affects BOTH the index (a
// card may appear/disappear from a section) AND its own detail path.
function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(`/ar${path}`);
  revalidatePath(`/fr${path}`);
  revalidatePath(`/ru${path}`);
}

export const revalidateCategory: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateAllLocales("/products");
  return doc;
};

// T-105: `doc.category` in an afterChange hook is the raw relationship
// value (an id, not populated) — one extra findByID to get its slug for the
// new nested path. Also revalidates the OLD flat path: that's now the 301
// redirect shim, and it needs to stay fresh too (e.g. if a product's slug
// changes, the previous slug's redirect page should stop resolving).
export const revalidateProduct: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    revalidateAllLocales("/products");
    revalidateAllLocales(`/products/${doc.slug}`);
    // /resources aggregates Products.downloads (spec sheets) alongside cert
    // PDFs and SiteSettings docs — see getResourceDocuments in
    // payload-fetch.ts. Uploading a spec sheet has to refresh that page too.
    revalidateAllLocales("/resources");

    const categoryId = typeof doc.category === "object" ? doc.category?.id : doc.category;
    if (categoryId) {
      const category = await req.payload.findByID({
        collection: "categories",
        id: categoryId,
        overrideAccess: true,
      });
      if (category?.slug) {
        revalidateAllLocales(`/products/${category.slug}/${doc.slug}`);
      }
    }
  }
  return doc;
};
