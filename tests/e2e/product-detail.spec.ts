import { test, expect } from "@playwright/test";

// CAT-02/CAT-04: /products/<slug> renders PageHeader (breadcrumb + name +
// category tag), a thumbnail-swap gallery, description, a SpecTable (<dl>,
// incl. packaging row), applicable-certification badges, and an RFQ CTA.
// Uses ONLY seeded fixture data from scripts/seed-products.ts.
const BASMATI = {
  slug: "premium-long-grain-basmati-rice",
  name: "Premium Long-Grain Basmati Rice",
  category: "Grains",
};
const CUMIN_SLUG = "whole-cumin-seeds";
const RED_LENTILS_SLUG = "red-lentils";

test("en: Basmati Rice detail page returns 200, h1 has the product name, a breadcrumb region is present", async ({
  page,
}) => {
  const res = await page.goto(`/products/${BASMATI.slug}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: BASMATI.name, level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toBeVisible();
});

test("en: Basmati Rice SpecTable renders as a <dl> with >=5 rows plus a Packaging row", async ({
  page,
}) => {
  await page.goto(`/products/${BASMATI.slug}`);
  const dl = page.locator("dl");
  await expect(dl).toBeVisible();
  const rowCount = await dl.locator("dt").count();
  expect(rowCount).toBeGreaterThanOrEqual(6); // 5 specs + Packaging row
  await expect(dl.getByText("Packaging", { exact: true })).toBeVisible();
});

test("en: Basmati Rice applicable-certification cards are present (Halal + FSSC)", async ({ page }) => {
  await page.goto(`/products/${BASMATI.slug}`);
  await expect(page.getByText("Halal Certification for Food Processing & Export")).toBeVisible();
  await expect(page.getByText("Food Safety System Certification (FSSC) 22000")).toBeVisible();
});

test("en: Basmati Rice RFQ CTA anchor href carries the product slug + encoded name", async ({ page }) => {
  await page.goto(`/products/${BASMATI.slug}`);
  const cta = page.getByRole("link", { name: "Request a Quote for This Product" });
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).toContain(`/contact?product=${BASMATI.slug}&productName=`);
});

test("en: Basmati Rice gallery thumbnails are buttons; clicking the 2nd sets aria-pressed", async ({ page }) => {
  await page.goto(`/products/${BASMATI.slug}`);
  const thumbs = page.getByRole("button", { name: /View image/ });
  expect(await thumbs.count()).toBeGreaterThanOrEqual(2);

  const first = thumbs.nth(0);
  const second = thumbs.nth(1);
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(second).toHaveAttribute("aria-pressed", "false");

  await second.click();
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(first).toHaveAttribute("aria-pressed", "false");
});

test("en: Whole Cumin Seeds (0 specs) omits the SpecTable region entirely", async ({ page }) => {
  await page.goto(`/products/${CUMIN_SLUG}`);
  await expect(page.locator("dl")).toHaveCount(0);
});

test("en: Red Lentils (empty gallery) shows the ImageOff placeholder, no broken image", async ({ page }) => {
  await page.goto(`/products/${RED_LENTILS_SLUG}`);
  await expect(page.getByTestId("gallery-placeholder")).toBeVisible();
  expect(await page.locator("[data-testid='gallery-placeholder'] img").count()).toBe(0);
});

test("an unknown product slug 404s", async ({ page }) => {
  const res = await page.goto("/products/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("ar: Basmati Rice detail page has dir=rtl and the gallery thumbnail order is source order (not reversed)", async ({
  page,
}) => {
  const res = await page.goto(`/ar/products/${BASMATI.slug}`);
  expect(res?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  const thumbs = page.getByRole("button", { name: /View image/ });
  await expect(thumbs.nth(0)).toHaveAttribute("aria-label", /1 of/);
  await expect(thumbs.nth(1)).toHaveAttribute("aria-label", /2 of/);
});
