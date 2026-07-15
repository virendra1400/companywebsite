import { test, expect } from "@playwright/test";

// PAGE-01: the homepage renders its FULL UI-SPEC block sequence in order —
// Hero -> FeatureGrid (value props) -> CertStrip -> StatsBand -> ExportMap
// -> CTABand. ExportMap landed in 02-06, so the earlier ExportMap-tolerant
// partial assertion is now replaced by the complete 6-block order check.
const PATHS = ["/", "/ar"];

for (const path of PATHS) {
  test(`${path}: renders the full block sequence Hero -> FeatureGrid -> CertStrip -> StatsBand -> ExportMap -> CTABand, in order`, async ({
    page,
  }) => {
    await page.goto(path);

    const hero = page.getByTestId("hero");
    await expect(hero).toBeVisible();

    // "Quality" is one of the seeded homepage FeatureGrid value-prop titles.
    const featureGrid = page.getByText("Quality", { exact: true }).first();
    await expect(featureGrid).toBeVisible();

    // CertStrip logo-strip links to /certifications. Scope to <main> — the
    // header nav now also links to /certifications (outside <main>).
    const certStripLink = page.locator('main a[href$="/certifications"]').first();
    await expect(certStripLink).toBeVisible();

    // "Years Exporting" is one of the seeded homepage StatsBand labels.
    const statsBand = page.getByText("Years Exporting", { exact: true }).first();
    await expect(statsBand).toBeVisible();

    // ExportMap (compact variant on the homepage) — a role=img SVG whose
    // aria-label summarizes the served-country count.
    const exportMap = page.getByRole("img", { name: /countries/i }).first();
    await expect(exportMap).toBeVisible();

    // CTABand closing action band — seeded homepage heading.
    const ctaBand = page.getByRole("heading", {
      name: "Ready to Source With Confidence?",
    });
    await expect(ctaBand).toBeVisible();

    const [heroBox, featureGridBox, certStripBox, statsBandBox, exportMapBox, ctaBandBox] =
      await Promise.all([
        hero.boundingBox(),
        featureGrid.boundingBox(),
        certStripLink.boundingBox(),
        statsBand.boundingBox(),
        exportMap.boundingBox(),
        ctaBand.boundingBox(),
      ]);

    expect(heroBox!.y).toBeLessThan(featureGridBox!.y);
    expect(featureGridBox!.y).toBeLessThan(certStripBox!.y);
    expect(certStripBox!.y).toBeLessThan(statsBandBox!.y);
    expect(statsBandBox!.y).toBeLessThan(exportMapBox!.y);
    expect(exportMapBox!.y).toBeLessThan(ctaBandBox!.y);
  });

  test(`${path}: FeatureGrid renders all 4 value props with no layout break`, async ({ page }) => {
    await page.goto(path);
    for (const label of ["Quality", "Reliability", "Compliance", "Global Reach"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });
}
