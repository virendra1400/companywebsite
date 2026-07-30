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

  test(`${path}: StatsBand (incoterms) renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Incoterms We Work With", { exact: true })).toBeVisible();
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

// ExportMap was removed from the homepage (unverified "countries served"
// claim for a company with no direct export history yet) — it now lives
// only on /export, covered by the EXPORT_PATHS suite above.
