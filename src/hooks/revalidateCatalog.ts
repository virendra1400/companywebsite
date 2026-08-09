import type { CollectionAfterChangeHook } from "payload";
import { revalidateLocalizedPath } from "./revalidate-paths";

// CAT-03: a Category change affects the index; a Product change affects the
// index, its own detail page, and /resources (which aggregates
// Products.downloads spec sheets).
export const revalidateCategory: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateLocalizedPath("/products");
  return doc;
};

// T-105: `doc.category` in an afterChange hook is the raw relationship value
// (an id, not populated) — one extra findByID to get its slug for the nested
// path. Also revalidates the OLD flat path: that's now the 301 redirect shim,
// and it needs to stay fresh too (e.g. if a product's slug changes, the
// previous slug's redirect page should stop resolving).
export const revalidateProduct: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    revalidateLocalizedPath("/products");
    revalidateLocalizedPath(`/products/${doc.slug}`);
    revalidateLocalizedPath("/resources");

    const categoryId = typeof doc.category === "object" ? doc.category?.id : doc.category;
    if (categoryId) {
      const category = await req.payload.findByID({
        collection: "categories",
        id: categoryId,
        overrideAccess: true,
      });
      if (category?.slug) {
        revalidateLocalizedPath(`/products/${category.slug}/${doc.slug}`);
      }
    }
  }
  return doc;
};
