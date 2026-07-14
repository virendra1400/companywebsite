import { defineConfig } from "vitest/config";

// Node-environment harness. The `int` project holds Payload Local API
// integration tests added in Plan 02 (tests/int/**). Playwright owns e2e
// (tests/e2e/**) and is intentionally excluded here.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "int",
          environment: "node",
          include: ["tests/int/**/*.spec.ts"],
        },
      },
    ],
  },
});
