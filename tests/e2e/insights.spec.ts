import { test, expect } from "@playwright/test";

// BLOG-01: /insights browse-list + read-article + 404 + ar-rtl/latn-byline
// coverage. Uses ONLY seeded fixture data from scripts/seed-insights.ts.
const CATEGORIZED = {
  slug: "export-compliance-guide-2026",
  title: "A Buyer's Guide to Export Compliance in 2026",
};

test("en: /insights returns 200, shows the Insights hero heading and a link to the categorized article", async ({
  page,
}) => {
  const res = await page.goto("/insights");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Insights", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: new RegExp(CATEGORIZED.title) })).toBeVisible();
});

test("en: /insights/<slug> returns 200, has an h1 with the article title, a breadcrumb region, and a CTABand heading", async ({
  page,
}) => {
  const res = await page.goto(`/insights/${CATEGORIZED.slug}`);
  expect(res?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: CATEGORIZED.title, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ready to Source With Confidence?" }),
  ).toBeVisible();
});

test("an unknown insight slug 404s", async ({ page }) => {
  const res = await page.goto("/insights/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("ar: /ar/insights/<slug> returns 200 with dir=rtl, and the byline date renders Western (latn) digits", async ({
  page,
}) => {
  const res = await page.goto(`/ar/insights/${CATEGORIZED.slug}`);
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  // UI-SPEC backstop: byline must render ASCII digits, never Arabic-Indic
  // (U+0660-U+0669), for the article's publishedDate.
  const byline = page.getByText(/^By /);
  await expect(byline).toBeVisible();
  const text = await byline.textContent();
  expect(text).toMatch(/\d/);
  expect(text).not.toMatch(/[٠-٩]/);
});
