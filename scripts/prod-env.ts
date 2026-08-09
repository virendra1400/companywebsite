// Shared bootstrap for scripts that must talk to the PRODUCTION Neon DB.
//
// Why this exists: `.env.local` has no DATABASE_URL, so payload.config.ts
// falls back to SQLite (`file:./payload.db`). Any script that just calls
// loadEnvConfig() therefore reads/writes a LOCAL SQLITE FILE while appearing
// to work — silent, and it cost a whole session of false "the DB says X"
// conclusions on 2026-08-09 (see DECISION_LOG D-62). Import this FIRST, before
// anything imports payload.config, so DATABASE_URL is set at config-build time.
//
// Also forces NODE_ENV=production: @payloadcms/db-postgres only skips drizzle's
// schema push when NODE_ENV === "production". Running a script against the prod
// DB without it can mutate the live schema.
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.vercel");

let raw: string;
try {
  raw = readFileSync(envPath, "utf8");
} catch {
  console.error(
    "\n.env.vercel not found. Run:\n  vercel env pull .env.vercel --environment=production --yes\n",
  );
  process.exit(1);
}

for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (!m) continue;
  const [, key, value] = m;
  if (!process.env[key]) process.env[key] = value;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing from .env.vercel — aborting.");
  process.exit(1);
}

// Never let drizzle push schema at the production DB. @payloadcms/db-postgres
// only skips its schema push when NODE_ENV === "production". Cast because
// @types/node declares NODE_ENV readonly, but setting it here (before
// payload.config is imported) is the whole point.
(process.env as Record<string, string>).NODE_ENV = "production";

const host = new URL(process.env.DATABASE_URL).hostname;
console.log(`[prod-env] PRODUCTION Postgres: ${host}`);
