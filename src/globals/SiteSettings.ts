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
    {
      type: "group",
      name: "contact",
      label: "Contact channels",
      admin: {
        description:
          "Single source for contact details used site-wide — header/hero CTAs, product pages, and the Contact page all read from here.",
      },
      fields: [
        {
          name: "email",
          type: "text",
          required: true,
          defaultValue: "sales@example.com",
          admin: { description: "Inquiry email (mailto: links across the site)." },
        },
        {
          name: "phone",
          type: "text",
          required: true,
          defaultValue: "+91 00000 00000",
          admin: { description: "Phone number (tel: link)." },
        },
        {
          name: "whatsapp",
          type: "text",
          required: true,
          defaultValue: "910000000000",
          admin: {
            description:
              "WhatsApp number in E.164 digits, no '+' (e.g. 919876543210). Powers every 'Chat on WhatsApp' link.",
          },
        },
      ],
    },
  ],
};
