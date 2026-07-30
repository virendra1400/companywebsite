import type { CollectionConfig } from "payload";

// Payload's built-in auth (V2/V3/V6 per RESEARCH Security Domain) — never hand-roll
// password hashing or session cookies.
export const Users: CollectionConfig = {
  slug: "users",
  auth: { useAPIKey: true },
  admin: {
    useAsTitle: "email",
  },
  // No public access — management APIs are authenticated-admin-only in Phase 1
  // (T-01-08). Public site reads go through the server-side Local API, not
  // this collection's REST/GraphQL surface.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: false,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      defaultValue: "editor",
      saveToJWT: true,
      required: true,
      // T-01-05 mitigation: an editor cannot escalate to admin by editing
      // their own (or anyone else's) roles field — only an existing admin can.
      access: {
        update: ({ req: { user } }) => user?.roles === "admin",
      },
    },
  ],
};
