import type { Block } from "payload";

// UI-SPEC Block Library #1 — generalizes the Phase 1 Home global's flat
// heroHeadline/heroSubhead/heroImage fields into a reusable block. `variant`
// drives full (homepage) vs compact (interior pages) sizing in HeroBlock.tsx.
// Field-level localization is NOT set here — Pages.layout's top-level
// localized:true cascades to every nested field (RESEARCH Pattern 2).
export const Hero: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    {
      name: "variant",
      type: "select",
      options: ["full", "compact"],
      defaultValue: "compact",
      required: true,
    },
    { name: "eyebrow", type: "text" },
    { name: "headline", type: "text", required: true },
    { name: "subhead", type: "textarea" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "primaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};
