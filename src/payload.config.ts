import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Pages } from "@/collections/Pages";
import { Certifications } from "@/collections/Certifications";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Env-driven adapter selection (Wave 4 deploy-ready):
// - DATABASE_URL set  -> Postgres (prod, EU region per D-04)
// - else              -> SQLite file (local dev, no infra)
// Uses @payloadcms/db-postgres directly, never the deprecated Vercel wrapper
// (RESEARCH Pitfall 4). Postgres wins when both env vars exist.
const usePostgres = Boolean(process.env.DATABASE_URL);
const db = usePostgres
  ? postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL as string },
      // ponytail: force schema auto-sync on connect (Payload disables push in
      // production by default). Acceptable for this small single-writer CMS —
      // first deploy creates tables with no migration ceremony. If the catalog
      // schema grows / multiple instances write concurrently, switch to
      // committed `payload migrate` files + a `migrate && next build` step.
      push: true,
    })
  : sqliteAdapter({
      client: { url: process.env.DATABASE_URI ?? "file:./payload.db" },
    });

// - BLOB_READ_WRITE_TOKEN set -> Vercel Blob (prod media, serverless-safe)
// - else                      -> Payload local-disk upload default (dev)
// Vercel's filesystem is ephemeral, so prod media MUST go to Blob, not disk.
const storagePlugins = process.env.BLOB_READ_WRITE_TOKEN
  ? [
      vercelBlobStorage({
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN as string,
        // ponytail: unique suffix per upload so the build-seed's re-upload
        // (migrate:fresh wipes the DB each deploy but Blob persists) never hits
        // "blob already exists". Placeholder-era pairing with migrate:fresh;
        // both go away once committed migrations + a persistent DB replace the
        // wipe-and-reseed bring-up (see phase deferred-items DEPLOY CEILING).
        addRandomSuffix: true,
      }),
    ]
  : [];

export default buildConfig({
  // Vendored (payload) route group generates the admin panel — this only
  // wires which User collection powers /admin auth.
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Pages, Certifications],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: {
    outputFile: path.resolve(dirname, "../payload-types.ts"),
  },
  db,
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
  // Vercel Blob in prod (BLOB_READ_WRITE_TOKEN set), local disk in dev.
  plugins: storagePlugins,
  sharp,
});
