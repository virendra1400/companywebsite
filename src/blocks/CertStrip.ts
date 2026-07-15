import type { Block } from "payload";

// UI-SPEC Block Library #5 — no cert data lives on the block itself; it
// references the Certifications collection at render time (CertStripBlock
// calls getCertifications(locale)). `variant` picks the compact homepage
// logo strip vs. the full Certifications-page card grid.
export const CertStrip: Block = {
  slug: "certStrip",
  labels: { singular: "Cert Strip", plural: "Cert Strips" },
  fields: [
    {
      name: "variant",
      type: "select",
      options: ["strip", "grid"],
      defaultValue: "grid",
      required: true,
    },
    { name: "sectionTitle", type: "text" },
    { name: "intro", type: "textarea" },
  ],
};
