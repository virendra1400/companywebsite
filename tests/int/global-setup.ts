import { existsSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Deletes any stale test SQLite DB before the run so each `vitest run` starts
// from a clean schema (db-sqlite's dev push in connect.js recreates it).
export default function globalSetup() {
  const dbPath = path.resolve(dirname, ".test.db");
  for (const suffix of ["", "-wal", "-shm"]) {
    const p = dbPath + suffix;
    if (existsSync(p)) rmSync(p);
  }
}
