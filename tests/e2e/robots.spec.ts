import { test, expect } from "@playwright/test";

// T-204: /api/media is where every uploaded image is actually served from
// (payload-fetch.ts's Media.url) — a blanket "Disallow: /api" silently
// blocked Google Image Search from indexing any site image. The fix carves
// out an explicit Allow for that one subpath while keeping the rest of
// /api (REST/GraphQL endpoints) and /admin out of the crawl index.
test("robots.txt allows /api/media, disallows /admin and the rest of /api", async ({ page }) => {
  const res = await page.goto("/robots.txt");
  const body = await res!.text();
  expect(body).toMatch(/Allow:\s*\/api\/media/);
  expect(body).toMatch(/Disallow:\s*\/admin/);
  expect(body).toMatch(/Disallow:\s*\/api\s*$/m);
  expect(body).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/);
});
