import type { CollectionAfterChangeHook } from "payload";
import { revalidateLocalizedPath } from "./revalidate-paths";

// BLOG-02: an article change affects BOTH the index ('/insights') AND its own
// detail path ('/insights/<slug>').
export const revalidateInsight: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateLocalizedPath("/insights");
    revalidateLocalizedPath(`/insights/${doc.slug}`);
  }
  return doc;
};
