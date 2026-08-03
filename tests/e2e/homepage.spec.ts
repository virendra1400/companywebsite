import { test, expect } from "@playwright/test";

// PAGE-01/T-104: the homepage renders its FULL 9-section block sequence per
// CONTENT_PLAYBOOK.md §4 Home, in order — Hero -> TrustBar (proof strip) ->
// FeatureGrid (product categories) -> FeatureGrid (de-risk tiles) ->
// MediaGallery -> CertStrip -> ExportProcess -> ExportMap (Gulf-first
// markets) -> CTABand. ExportMap was previously removed over unverified
// export-history claims (16 highlighted countries + shipment stats); T-104
// reintroduces it in a corrected, honest form — Gulf-only highlighted set,
// zero stats, capability-framed copy ("built to serve", not "we export to")
// — see DECISION_LOG D-31.
const PATHS = ["/", "/ar"];

for (const path of PATHS) {
  test(`${path}: renders the full 9-block sequence in order`, async ({ page }) => {
    await page.goto(path);

    const hero = page.getByTestId("hero");
    await expect(hero).toBeVisible();

    const proofStrip = page.getByRole("heading", {
      name: "Why Buyers Can Trust This Supply Chain",
    });
    await expect(proofStrip).toBeVisible();

    const productCategories = page.getByRole("heading", { name: "What We Export" });
    await expect(productCategories).toBeVisible();

    const deRiskTiles = page.getByRole("heading", { name: "How We De-Risk Your First Order" });
    await expect(deRiskTiles).toBeVisible();

    const mediaGallery = page.getByRole("heading", { name: "Manufacturing Excellence" });
    await expect(mediaGallery).toBeVisible();

    // T-106: CertStrip now shows real in-progress certs (see
    // certifications.spec.ts) — the section heading is the stable anchor
    // regardless of how many certs are seeded.
    const certStrip = page.getByRole("heading", { name: "Product Accreditation & Certification" });
    await expect(certStrip).toBeVisible();

    const exportProcess = page.getByRole("heading", {
      name: "How an Order Moves From Inquiry to Delivery",
    });
    await expect(exportProcess).toBeVisible();

    const markets = page.getByRole("heading", { name: "Markets We're Built to Serve" });
    await expect(markets).toBeVisible();

    // CTABand closing action band — seeded homepage heading.
    const ctaBand = page.getByRole("heading", {
      name: "Source With Confidence",
    });
    await expect(ctaBand).toBeVisible();

    const [
      heroBox,
      proofStripBox,
      productCategoriesBox,
      deRiskTilesBox,
      mediaGalleryBox,
      certStripBox,
      exportProcessBox,
      marketsBox,
      ctaBandBox,
    ] = await Promise.all([
      hero.boundingBox(),
      proofStrip.boundingBox(),
      productCategories.boundingBox(),
      deRiskTiles.boundingBox(),
      mediaGallery.boundingBox(),
      certStrip.boundingBox(),
      exportProcess.boundingBox(),
      markets.boundingBox(),
      ctaBand.boundingBox(),
    ]);

    expect(heroBox!.y).toBeLessThan(proofStripBox!.y);
    expect(proofStripBox!.y).toBeLessThan(productCategoriesBox!.y);
    expect(productCategoriesBox!.y).toBeLessThan(deRiskTilesBox!.y);
    expect(deRiskTilesBox!.y).toBeLessThan(mediaGalleryBox!.y);
    expect(mediaGalleryBox!.y).toBeLessThan(certStripBox!.y);
    expect(certStripBox!.y).toBeLessThan(exportProcessBox!.y);
    expect(exportProcessBox!.y).toBeLessThan(marketsBox!.y);
    expect(marketsBox!.y).toBeLessThan(ctaBandBox!.y);
  });

  test(`${path}: product-category FeatureGrid renders all 3 categories with no layout break`, async ({
    page,
  }) => {
    await page.goto(path);
    for (const label of ["Frozen Vegetables", "Fruit Pulp & Purees", "Value-Added & Specialty"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test(`${path}: de-risk FeatureGrid renders all 4 tiles with no layout break`, async ({ page }) => {
    await page.goto(path);
    for (const label of ["Open Specifications", "Sample Program", "Inspection Welcome", "24-Hour Response"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  // T-209/D-46: matches /export's combined "Our Primary Focus" set (Gulf +
  // Southeast Asia + Maldives, every code owner-confirmed as served) — was
  // Gulf-only until homepage and /export drifted into contradicting claims.
  test(`${path}: Markets section highlights the real served-country set, no fabricated stats`, async ({ page }) => {
    await page.goto(path);
    const chips = page.getByTestId("export-map-chips");
    await expect(chips).toBeVisible();
    for (const country of [
      "United Arab Emirates",
      "Saudi Arabia",
      "Qatar",
      "Kuwait",
      "Bahrain",
      "Oman",
      "Singapore",
      "Vietnam",
      "Indonesia",
      "Maldives",
    ]) {
      await expect(chips.getByText(country, { exact: true })).toBeVisible();
    }
    // Explicitly NOT a "we export to N countries" claim — no stat tiles.
    await expect(page.getByText(/\d+\+?\s*(countries|years|shipments)/i)).toHaveCount(0);
  });
}
