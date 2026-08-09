import type { GlobalAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";
import { revalidateLocalizedLayout } from "./revalidate-paths";

// SiteSettings (siteName/logo/contact/address) renders in the shared
// (site)/[locale] layout chrome (header/footer) on EVERY page. A path
// revalidate isn't enough — bust the LAYOUT segment for each locale so all
// pages pick up the change.
export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateLocalizedLayout();
    // icon.tsx lives at the true app root, outside every locale layout above —
    // it's prerendered as a static route and only picks up a new CMS favicon
    // via this explicit bust.
    revalidatePath("/icon");
  }
  return doc;
};
