import type { CollectionAfterChangeHook } from "payload";
import { revalidateLocalizedPath } from "./revalidate-paths";

// CMS-03: publishing a Pages doc triggers on-demand ISR revalidation for
// every locale path — no rebuild. Slug "home" maps to the root path, every
// other slug to `/${slug}`; revalidateLocalizedPath handles the locale
// prefixes, including the `/en` form that middleware rewrites to and that
// this hook previously missed entirely (see revalidate-paths.ts).
export const revalidatePage: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateLocalizedPath(doc.slug === "home" ? "/" : `/${doc.slug}`);
  }
  return doc;
};
