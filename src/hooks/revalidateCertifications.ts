import type { CollectionAfterChangeHook } from "payload";
import { revalidateLocalizedPath } from "./revalidate-paths";

// Certifications feed CertStripBlock on both /certifications and / (home),
// and /resources aggregates Certifications.certificatePdf.
export const revalidateCertifications: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateLocalizedPath("/certifications");
    revalidateLocalizedPath("/");
    revalidateLocalizedPath("/resources");
  }
  return doc;
};
