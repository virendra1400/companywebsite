import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Node-environment harness. The `int` project holds Payload Local API
// integration tests added in Plan 02 (tests/int/**). Playwright owns e2e
// (tests/e2e/**) and is intentionally excluded here.
export default defineConfig({
  resolve: {
    // Vite doesn't read tsconfig `paths` automatically (unlike tsc/Next.js) —
    // mirror the same two aliases here so tests can import "@/..." and the
    // Payload config the same way app code does.
    alias: {
      "@payload-config": path.resolve(dirname, "./src/payload.config.ts"),
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: {
            "@payload-config": path.resolve(dirname, "./src/payload.config.ts"),
            "@": path.resolve(dirname, "./src"),
          },
        },
        test: {
          name: "int",
          environment: "node",
          include: ["tests/int/**/*.spec.ts"],
          // Isolated file-based test DB — never touches the dev payload.db
          // file. PAYLOAD_MIGRATING unset so db-sqlite's dev push
          // (connect.js) creates the schema automatically on first connect.
          // globalSetup deletes any stale file before the run starts.
          env: {
            DATABASE_URI: "file:./tests/int/.test.db",
            PAYLOAD_SECRET: "test-secret-not-for-prod",
          },
          globalSetup: ["./tests/int/global-setup.ts"],
          testTimeout: 20000,
          // All int spec files share one physical SQLite file DB — run them
          // sequentially in a single process, not parallel workers, to avoid
          // concurrent schema-push/SQLITE_BUSY races.
          fileParallelism: false,
        },
      },
      {
        resolve: {
          alias: {
            "@payload-config": path.resolve(dirname, "./src/payload.config.ts"),
            "@": path.resolve(dirname, "./src"),
          },
        },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.spec.ts"],
          // Pure-function / mocked-dependency tests — no Payload DB, no
          // globalSetup, no SQLite file needed.
        },
      },
    ],
  },
});
