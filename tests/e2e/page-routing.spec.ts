import { test, expect } from "@playwright/test";

// RESEARCH Pattern 6 — the 6 interior slugs are statically generated at
// build time (generateStaticParams) and resolve at /[locale]/[slug],
// rendering at least a compact Hero; an unknown slug 404s (not a catch-all).
const INTERIOR_SLUGS = [
  "about",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "contact",
];

for (const slug of INTERIOR_SLUGS) {
  test(`GET /${slug} (en) returns 200 and renders a hero`, async ({ page }) => {
    const res = await page.goto(`/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("hero")).toBeVisible();
  });

  test(`GET /ar/${slug} returns 200 and renders a hero`, async ({ page }) => {
    const res = await page.goto(`/ar/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("hero")).toBeVisible();
  });
}

test("an unknown slug returns 404", async ({ page }) => {
  const res = await page.goto("/not-a-real-page");
  expect(res?.status()).toBe(404);
});
