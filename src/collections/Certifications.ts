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
    // T-106: optional, not required — an in-certification entry legitimately
    // has no logo yet, and displaying a certification body's official logo
    // before the certification is actually granted overclaims regardless of
    // any status text next to it (D-01). CertCard renders a text-only status
    // pill when this is empty.
    { name: "logo", type: "upload", relationTo: "media" },
    // Optional — drives the PDF-present/PDF-absent CertCard states.
    { name: "certificatePdf", type: "upload", relationTo: "media" },
    { name: "validityNotes", type: "text", localized: true },
    { name: "halal", type: "checkbox", defaultValue: false },
    // T-103/MASTER_PLAN §7.3: status board fields. `status` intentionally has
    // no defaultValue — existing certs stay unset (null) until an editor
    // confirms which bucket they belong in, rather than assuming every
    // pre-existing row is "registered".
    {
      name: "status",
      type: "select",
      options: [
        { label: "Registered", value: "registered" },
        { label: "In certification", value: "in-certification" },
      ],
      admin: { description: "Drives the certifications status board (T-106)." },
    },
    { name: "number", type: "text", label: "Certificate number" },
    { name: "validFrom", type: "date" },
    { name: "validTo", type: "date" },
    { name: "scope", type: "text", localized: true, admin: { description: "e.g. \"Frozen vegetables, IQF processing\"." } },
    {
      name: "targetDate",
      type: "date",
      label: "Target certification date",
      admin: { description: "For in-certification items — expected completion date, shown on the status board." },
    },
    // Editor-controlled sort order, avoids hard-coding order in the query.
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
