import type { Block } from "payload";

// UI-SPEC Block Library #7 — full-width closing action band. Ignores the
// sectionBg alternation and always renders dark (bg-primary-900) per the
// UI-SPEC's documented deliberate exception (RenderBlocks Pattern 3).
export const CTABand: Block = {
  slug: "ctaBand",
  labels: { singular: "CTA Band", plural: "CTA Bands" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
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
