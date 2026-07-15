import type { Block } from "payload";

// UI-SPEC Block Library #4 — lightweight capability-figures band, visually
// distinct from FeatureGrid/CertCard (no card border). Field-level
// localization NOT set here — cascades from Pages.layout (RESEARCH Pattern 2).
export const StatsBand: Block = {
  slug: "statsBand",
  labels: { singular: "Stats Band", plural: "Stats Bands" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
  ],
};
