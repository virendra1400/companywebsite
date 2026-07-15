import { test, expect } from "@playwright/test";

// PAGE-01: the homepage renders its block sequence so far in the UI-SPEC
// order — Hero -> FeatureGrid (value props) -> CertStrip -> StatsBand
// (ExportMap lands in 02-06 — assertions here are order-tolerant to that
// still-missing block, asserting only the RELATIVE order of what already
// exists, per the plan's own instruction).
const PATHS = ["/", "/ar"];

for (const path of PATHS) {
  test(`${path}: renders Hero, then FeatureGrid, then CertStrip, then StatsBand, in order`, async ({
    page,
  }) => {
    await page.goto(path);

    const hero = page.getByTestId("hero");
    await expect(hero).toBeVisible();

    // "Quality" is one of the seeded homepage FeatureGrid value-prop titles.
    const featureGrid = page.getByText("Quality", { exact: true }).first();
    await expect(featureGrid).toBeVisible();

    // CertStrip logo-strip links to /certifications (locale-prefixed on
    // non-default locales, e.g. /ar/certifications — match by suffix).
    const certStripLink = page.locator('a[href$="/certifications"]').first();
    await expect(certStripLink).toBeVisible();

    // "Years Exporting" is one of the seeded homepage StatsBand labels.
    const statsBand = page.getByText("Years Exporting", { exact: true }).first();
    await expect(statsBand).toBeVisible();

    const [heroBox, featureGridBox, certStripBox, statsBandBox] = await Promise.all([
      hero.boundingBox(),
      featureGrid.boundingBox(),
      certStripLink.boundingBox(),
      statsBand.boundingBox(),
    ]);

    expect(heroBox!.y).toBeLessThan(featureGridBox!.y);
    expect(featureGridBox!.y).toBeLessThan(certStripBox!.y);
    expect(certStripBox!.y).toBeLessThan(statsBandBox!.y);
  });

  test(`${path}: FeatureGrid renders all 4 value props with no layout break`, async ({ page }) => {
    await page.goto(path);
    for (const label of ["Quality", "Reliability", "Compliance", "Global Reach"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });
}
