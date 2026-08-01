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
      defaultValue: "VNP Global",
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
      name: "favicon",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description:
          "Browser tab icon. Leave empty to use the default VNP monogram. Recommended: square (e.g. 512x512) transparent PNG or SVG — any other aspect ratio gets letterboxed into a square automatically.",
      },
    },
    {
      name: "productsHeroImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description:
          "Hero background photo for the /products catalog page. That page isn't a CMS Page (it's the product catalog listing), so its hero image lives here instead of on a Pages layout block.",
      },
    },
    {
      name: "insightsHeroImage",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        description:
          "Hero background photo for the /insights listing page. Same reason as productsHeroImage: not a CMS Page.",
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
    {
      type: "group",
      name: "address",
      label: "Registered office address",
      admin: {
        description:
          "Legal/registered office address. Used for the Organization structured-data (JSON-LD) markup (D-09) and the footer's Registered Office line.",
      },
      fields: [
        { name: "street", type: "text" },
        { name: "city", type: "text" },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text" },
      ],
    },
    {
      type: "group",
      name: "factoryAddress",
      label: "Factory / manufacturing facility address",
      admin: {
        description:
          "Manufacturing facility address, shown separately from the registered office (e.g. on the Manufacturing/Company pages and footer).",
      },
      fields: [
        { name: "facilityName", type: "text", admin: { description: "e.g. the facility or partner name." } },
        { name: "street", type: "text" },
        { name: "city", type: "text" },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text" },
      ],
    },
    {
      type: "group",
      name: "legalIdentity",
      label: "Legal identity (footer strip)",
      admin: {
        description:
          "T-102/COMPONENT_LIBRARY C-03: shown as a small one-line strip in the footer, e.g. \"CIN U12345MH2026PTC000000 · GST 27ABCDE1234F1Z5\". Leave any field blank until the real number is issued — the footer only shows the ones that are actually filled in, never a placeholder dash.",
      },
      fields: [
        { name: "cin", type: "text", label: "CIN" },
        { name: "gst", type: "text", label: "GST" },
        { name: "iec", type: "text", label: "IEC" },
        { name: "fssai", type: "text", label: "FSSAI" },
      ],
    },
    {
      type: "group",
      name: "sla",
      label: "Service commitment",
      admin: {
        description: "T-103/MASTER_PLAN §7.3: shown near RFQ/contact CTAs, e.g. \"We respond within 24 hours.\" Leave blank to omit.",
      },
      fields: [{ name: "responseTime", type: "text", localized: true }],
    },
    {
      name: "sameAs",
      type: "array",
      label: "Social / profile links (sameAs)",
      admin: {
        description: "Official profile URLs (LinkedIn, etc.) included in the Organization structured-data markup.",
      },
      fields: [{ name: "url", type: "text", required: true }],
    },
  ],
};
