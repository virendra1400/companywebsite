import { test, expect } from "@playwright/test";

// TRUST-04 / T-02-14 / UI-SPEC RTL Extensions: the ExportMap is a static SVG
// wrapped in role="img" + a non-empty aria-label summarizing the served
// country count, and the served-country NAMES are ALWAYS also rendered as a
// visible text chip list — the map never gatekeeps information a
// screen-reader user can't otherwise get. The map must also render
// identically in ltr/rtl (geography does not mirror).
const EXPORT_PATHS = ["/export", "/ar/export"];

for (const path of EXPORT_PATHS) {
  test(`${path}: ExportMap has role=img with a non-empty aria-label summarizing the count`, async ({
    page,
  }) => {
    await page.goto(path);
    const map = page.getByRole("img", { name: /countries/i }).first();
    await expect(map).toBeVisible();
    const label = await map.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label).toMatch(/\d+/); // summarizes a country count
  });

  test(`${path}: visible country-name chip list renders served countries (not just the SVG)`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByText("United Arab Emirates", { exact: true })).toBeVisible();
    await expect(page.getByText("Germany", { exact: true })).toBeVisible();
  });

  test(`${path}: StatsBand (years exporting / shipment volume / incoterms) renders`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByText("Years Exporting", { exact: true })).toBeVisible();
    await expect(page.getByText("Container Shipments", { exact: true })).toBeVisible();
    await expect(page.getByText("Incoterms Handled", { exact: true })).toBeVisible();
  });

  test(`${path}: map SVG carries no dir-based mirror transform`, async ({ page }) => {
    await page.goto(path);
    const map = page.getByRole("img", { name: /countries/i }).first();
    const mapTransform = await map.evaluate((el) => getComputedStyle(el).transform);
    expect(mapTransform).toBe("none");
    const svg = map.locator("svg").first();
    const svgTransform = await svg.evaluate((el) => getComputedStyle(el).transform);
    expect(svgTransform).toBe("none");
  });
}

test("homepage (/) renders the compact ExportMap variant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /countries/i }).first()).toBeVisible();
});

test("/ar homepage renders the compact ExportMap variant, not mirrored", async ({ page }) => {
  await page.goto("/ar");
  const map = page.getByRole("img", { name: /countries/i }).first();
  await expect(map).toBeVisible();
  const transform = await map.evaluate((el) => getComputedStyle(el).transform);
  expect(transform).toBe("none");
});
