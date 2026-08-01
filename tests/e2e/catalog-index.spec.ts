import { test, expect } from "@playwright/test";

// CAT-01/CAT-04: the CatalogIndex (/products) renders every seeded category
// as its own section (Grains/Spices/Pulses/Oilseeds, seeded by
// scripts/seed-products.ts) with a ProductCard per published product, each
// card linking to /products/<slug>. Oilseeds' only product is
// published:false, so that section must show the generic empty-state copy
// instead of an empty grid. Uses ONLY seeded fixture data — no
// test-created content.
const SEEDED_CATEGORIES = ["Grains", "Spices", "Pulses", "Oilseeds"];
const EMPTY_STATE_COPY = "This section is being updated. Check back shortly.";

test("en: /products returns 200 and renders the hero heading region", async ({ page }) => {
  const res = await page.goto("/products");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("hero")).toBeVisible();
});

test("en: a section exists per seeded category", async ({ page }) => {
  await page.goto("/products");
  for (const name of SEEDED_CATEGORIES) {
    await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
  }
});

test("en: product cards link to /products/<slug>", async ({ page }) => {
  await page.goto("/products");
  const productLinks = page.locator('a[href^="/products/"]');
  expect(await productLinks.count()).toBeGreaterThan(0);
});

test("en: the empty Oilseeds category shows the generic empty-state copy, no product cards", async ({
  page,
}) => {
  await page.goto("/products");
  const oilseedsHeading = page.getByRole("heading", { name: "Oilseeds", level: 2 });
  await expect(oilseedsHeading).toBeVisible();

  // Scope to the section containing the Oilseeds heading — the empty-state
  // copy must render there, and that section must contain no product-card
  // links (the seeded "Draft Sesame Seeds" is published:false).
  const oilseedsSection = page.locator("section", { has: oilseedsHeading });
  await expect(oilseedsSection.getByText(EMPTY_STATE_COPY)).toBeVisible();
  await expect(oilseedsSection.locator('a[href^="/products/"]')).toHaveCount(0);
});

test("ar: /products has dir=rtl on the html element", async ({ page }) => {
  await page.goto("/ar/products");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByTestId("hero")).toBeVisible();
});
