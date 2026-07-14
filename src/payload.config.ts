import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Home } from "@/globals/Home";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Vendored (payload) route group generates the admin panel — this only
  // wires which User collection powers /admin auth.
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media],
  globals: [Home],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: {
    outputFile: path.resolve(dirname, "../payload-types.ts"),
  },
  // ponytail: SQLite for local dev — no Docker/local Postgres in this
  // environment (LOCAL_DEV_DB_OVERRIDE deviation, see 01-02-SUMMARY.md).
  // Prod swap (Wave 4): replace this whole `db` block with
  //   import { postgresAdapter } from "@payloadcms/db-postgres";
  //   db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })
  // per RESEARCH Pitfall 4 — use @payloadcms/db-postgres directly, never the
  // deprecated Vercel-specific Postgres wrapper package.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI ?? "file:./payload.db",
    },
  }),
  // CMS-02/FOUND-02/06: field-level localized:true per field (Home global),
  // English defaultLocale + fallback:true. `rtl` only affects admin-panel
  // input alignment, not the public site's dir attribute (RESEARCH Pitfall 1).
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "Arabic", code: "ar", rtl: true },
      { label: "Français", code: "fr" },
      { label: "Русский", code: "ru" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  // ponytail: media stored on local disk in dev (Payload's upload default —
  // no storage plugin needed). Prod swap (Wave 4): add
  //   import { s3Storage } from "@payloadcms/storage-s3";
  // to the `plugins` array below, backed by an EU bucket (D-04), and install
  // @payloadcms/storage-s3.
  sharp,
});
