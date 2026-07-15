import type { Block } from "payload";

// UI-SPEC §6 MediaGallery — facility-photo grid, no lightbox (deliberately
// out of scope this phase, see UI-SPEC's ponytail note). Field-level
// localization NOT set here — cascades from Pages.layout (RESEARCH Pattern 2).
export const MediaGallery: Block = {
  slug: "mediaGallery",
  labels: { singular: "Media Gallery", plural: "Media Galleries" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
        // Future embed hook only — no player built this phase (plan's own
        // action text: "do NOT build an embed player this phase").
        { name: "videoUrl", type: "text" },
      ],
    },
  ],
};
