import type { Block } from "payload";

// UI-SPEC Company/Compliance row — a single CertCard-shaped document card
// (the company-profile PDF). Not a new card component: DocumentCardBlock.tsx
// feeds this block's data into the existing CertCard primitive (02-03).
// Field-level localization NOT set here — cascades from Pages.layout.
export const DocumentCard: Block = {
  slug: "documentCard",
  labels: { singular: "Document Card", plural: "Document Cards" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    // Optional on purpose — left absent for the company-profile PDF until
    // the real file is provided, driving CertCard's honest PDF-absent state.
    { name: "file", type: "upload", relationTo: "media" },
  ],
};
