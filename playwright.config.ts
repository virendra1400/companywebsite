import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// Locale matrix: en + ar. Routing is path-based (en at root, /ar prefix),
// so specs navigate explicit paths; the browser `locale` context here just
// exercises both language environments.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "en", use: { ...devices["Desktop Chrome"], locale: "en-US" } },
    { name: "ar", use: { ...devices["Desktop Chrome"], locale: "ar" } },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
