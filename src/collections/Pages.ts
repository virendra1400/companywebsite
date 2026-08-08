import type { CollectionConfig } from "payload";
import { revalidatePage } from "@/hooks/revalidatePage";
import {
  Hero,
  RichText,
  CTABand,
  CertStrip,
  FeatureGrid,
  StatsBand,
  DocumentCard,
  MediaGallery,
  ExportMap,
  ContactBlock,
  TrustBar,
  ExportProcess,
  Testimonials,
  Faq,
} from "@/blocks";

// RESEARCH D-02 resolution / Pattern 1: replaces the Phase 1 Home global.
// One collection, slug-routed, hosts every marketing page (home + 6 interior
// pages) instead of 7 separate globals — a single discoverable admin list,
// one fetch helper, one revalidate hook.
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: { useAsTitle: "title" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Admin-facing only — not rendered on the public site.
    { name: "title", type: "text", required: true, localized: true },
    // NOT localized — one canonical URL slug per page (fixed nav, D-08).
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "layout",
      type: "blocks",
      // Cascades localization to every nested block field automatically
      // (RESEARCH Pattern 2) — do NOT re-set localized inside block fields.
      localized: true,
      minRows: 1,
      blocks: [
        Hero,
        RichText,
        CTABand,
        CertStrip,
        FeatureGrid,
        StatsBand,
        DocumentCard,
        MediaGallery,
        ExportMap,
        ContactBlock,
        TrustBar,
        ExportProcess,
        Testimonials,
        Faq,
      ],
    },
    // T-204 follow-up (D-50): same shape as Products.seo — home + the 6
    // interior pages had zero per-page metadata, silently inheriting the
    // root layout's generic title/description on every page. Optional
    // overrides; buildMetadata's callers fall back to page.title / a
    // derived summary when blank.
    {
      type: "group",
      name: "seo",
      label: "SEO overrides",
      admin: {
        description: "Optional per-page overrides. Leave blank to fall back to title / a derived summary (buildMetadata's existing default).",
      },
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
  hooks: { afterChange: [revalidatePage] },
};
