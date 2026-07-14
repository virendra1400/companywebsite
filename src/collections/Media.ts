import type { CollectionConfig } from "payload";

// ponytail: local-disk upload storage for dev (see LOCAL_DEV_DB_OVERRIDE deviation
// in 01-02-SUMMARY.md). Swap to @payloadcms/storage-s3's s3Storage() at deploy
// time (Wave 4) by adding it to payload.config.ts's `plugins` array — this
// collection definition does not change.
export const Media: CollectionConfig = {
  slug: "media",
  // T-01-08: management API is authenticated-admin-only; public site reads
  // media URLs via the Local API / rendered <img src>, not this collection's
  // read endpoint directly.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    // Local disk storage (dev default — no storage adapter needed). Prod
    // swaps to @payloadcms/storage-s3 (see payload.config.ts comment); this
    // staticDir is irrelevant once s3Storage is added (bytes go to the bucket).
    staticDir: "media",
    // T-01-06 mitigation: restrict to image + PDF only — nothing broader
    // (blocks executable-disguised-as-image tampering).
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        position: "centre",
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};
