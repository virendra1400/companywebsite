import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// Certifications feed CertStripBlock on both /certifications and / (home) —
// revalidate every locale of both, same per-locale mechanics as
// revalidatePage.ts/revalidateCatalog.ts. Previously missing entirely: any
// admin edit to this collection needed a manual redeploy to go live.
function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(path === "/" ? "/ar" : `/ar${path}`);
  revalidatePath(path === "/" ? "/fr" : `/fr${path}`);
  revalidatePath(path === "/" ? "/ru" : `/ru${path}`);
}

export const revalidateCertifications: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/certifications");
    revalidateAllLocales("/");
    // /resources aggregates Certifications.certificatePdf (see
    // getResourceDocuments in payload-fetch.ts), so uploading a certificate
    // PDF changes that page too — without this it kept serving the "available
    // on request" state for up to an hour after the file went live.
    revalidateAllLocales("/resources");
  }
  return doc;
};
