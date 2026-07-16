import type { GlobalConfig } from "payload";
import { revalidateSiteSettings } from "@/hooks/revalidateSiteSettings";

// Site-wide brand settings, editable in /admin (no code change / redeploy).
// siteName drives the header/footer/mobile wordmark + footer copyright.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  // Public read (rendered in chrome for anonymous visitors); write admin-only.
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: "Settings",
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "Star Agrevolution",
      admin: {
        description:
          "Company/brand name shown in the header, footer, and copyright across the whole site. Also used as the logo's alt text.",
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description:
          "Optional brand logo. When set, it replaces the text wordmark in the header, footer, and mobile menu. Leave empty to show the site name as text. Recommended: transparent PNG/SVG, ~40px tall.",
      },
    },
  ],
};
