import type { CollectionConfig } from "payload";

// RESEARCH D-04/D-05: dedicated collection so editors add/remove certs freely.
// `halal` drives CertCard's elevated/spanning treatment (TRUST-02) — the block
// component consuming this collection lands in a later plan; this task only
// ships the schema so it syncs alongside Pages in this plan's single
// [BLOCKING] schema-sync step.
export const Certifications: CollectionConfig = {
  slug: "certifications",
  admin: { useAsTitle: "name" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "issuingBody", type: "text", required: true, localized: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    // Optional — drives the PDF-present/PDF-absent CertCard states.
    { name: "certificatePdf", type: "upload", relationTo: "media" },
    { name: "validityNotes", type: "text", localized: true },
    { name: "halal", type: "checkbox", defaultValue: false },
    // Editor-controlled sort order, avoids hard-coding order in the query.
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
