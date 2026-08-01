import type { Block } from "payload";

// UI-SPEC Block Library #8 (D-06) — static SVG world map, not a map library,
// not interactive/3D. Field-level localization NOT set here — cascades from
// Pages.layout, same convention as StatsBand/FeatureGrid/MediaGallery
// (see those files' comments; 02-02/02-04 established this pattern).
export const ExportMap: Block = {
  slug: "exportMap",
  labels: { singular: "Export Map", plural: "Export Maps" },
  fields: [
    { name: "sectionTitle", type: "text" },
    // T-104: capability-framing copy (logistics/Halal/labeling awareness),
    // same field shape as CertStrip.intro — never claims of past shipment
    // volume/history (D-01: new company, zero real customer history yet).
    { name: "intro", type: "textarea" },
    {
      name: "variant",
      type: "select",
      options: ["compact", "full"],
      defaultValue: "full",
      required: true,
    },
    // Plain ISO alpha-2 code strings — not a Media/relation, just data
    // driving which world-map-svg.ts tile gets the primary-500 fill.
    { name: "highlightedCountryCodes", type: "text", hasMany: true },
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
