import { test, expect } from "@playwright/test";

// PAGE-01: the homepage renders its FULL block sequence in order — Hero ->
// TrustBar -> FeatureGrid (value props) -> MediaGallery -> CertStrip ->
// ExportProcess -> CTABand. StatsBand (years/countries/shipments) and
// ExportMap were removed from the homepage — unverified export-history
// claims for a company with no direct export history yet.
const PATHS = ["/", "/ar"];

for (const path of PATHS) {
  test(`${path}: renders the full block sequence Hero -> TrustBar -> FeatureGrid -> MediaGallery -> CertStrip -> ExportProcess -> CTABand, in order`, async ({
    page,
  }) => {
    await page.goto(path);

    const hero = page.getByTestId("hero");
    await expect(hero).toBeVisible();

    const trustBar = page.getByRole("heading", {
      name: "Built to Serve Importers Across the Globe",
    });
    await expect(trustBar).toBeVisible();

    // "Quality" is one of the seeded homepage FeatureGrid value-prop titles.
    const featureGrid = page.getByText("Quality", { exact: true }).first();
    await expect(featureGrid).toBeVisible();

    const mediaGallery = page.getByRole("heading", { name: "Manufacturing Excellence" });
    await expect(mediaGallery).toBeVisible();

    // CertStrip renders the honest "coming soon" empty state — the
    // Certifications collection is intentionally empty (no fabricated cert
    // data, see certifications.spec.ts) until real certs exist.
    const certStrip = page.getByText("Certifications coming soon.", { exact: true });
    await expect(certStrip).toBeVisible();

    const exportProcess = page.getByRole("heading", {
      name: "How an Order Moves From Inquiry to Delivery",
    });
    await expect(exportProcess).toBeVisible();

    // CTABand closing action band — seeded homepage heading.
    const ctaBand = page.getByRole("heading", {
      name: "Ready to Source With Confidence?",
    });
    await expect(ctaBand).toBeVisible();

    const [heroBox, trustBarBox, featureGridBox, mediaGalleryBox, certStripBox, exportProcessBox, ctaBandBox] =
      await Promise.all([
        hero.boundingBox(),
        trustBar.boundingBox(),
        featureGrid.boundingBox(),
        mediaGallery.boundingBox(),
        certStrip.boundingBox(),
        exportProcess.boundingBox(),
        ctaBand.boundingBox(),
      ]);

    expect(heroBox!.y).toBeLessThan(trustBarBox!.y);
    expect(trustBarBox!.y).toBeLessThan(featureGridBox!.y);
    expect(featureGridBox!.y).toBeLessThan(mediaGalleryBox!.y);
    expect(mediaGalleryBox!.y).toBeLessThan(certStripBox!.y);
    expect(certStripBox!.y).toBeLessThan(exportProcessBox!.y);
    expect(exportProcessBox!.y).toBeLessThan(ctaBandBox!.y);
  });

  test(`${path}: FeatureGrid renders all 4 value props with no layout break`, async ({ page }) => {
    await page.goto(path);
    for (const label of ["Quality", "Reliability", "Compliance", "Global Reach"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });
}
