import { test, expect } from "@playwright/test";

// TRUST-03: /[locale]/manufacturing renders a process-overview RichText, a
// MediaGallery of facility photos (>=4 fixed aspect-ratio cells, captions
// BELOW each image, never overlaid, no lightbox), and a StatsBand of
// capacity/QC/cold-chain figures. Both en and /ar paths are exercised to
// confirm no layout break under dir=rtl (UI-SPEC RTL Extensions — grid-based
// blocks need no extra RTL rules).
const PATHS = ["/manufacturing", "/ar/manufacturing"];

for (const path of PATHS) {
  test(`${path}: renders the process-overview RichText`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText(/chain-of-custody visibility/i)).toBeVisible();
  });

  test(`${path}: MediaGallery renders >=4 aspect-ratio cells with captions below, not overlaid`, async ({
    page,
  }) => {
    await page.goto(path);

    const cells = page.locator('[data-slot="aspect-ratio"]');
    await expect(cells).toHaveCount(4);

    for (const caption of [
      "Processing Floor",
      "Quality Control Lab",
      "Cold Storage",
      "Packing & Dispatch",
    ]) {
      await expect(page.getByText(caption, { exact: true })).toBeVisible();
    }

    // Caption sits structurally BELOW its image cell (a separate <p>
    // sibling, never an absolutely-positioned overlay on top of the photo).
    const firstCell = cells.first();
    const firstCaption = page.getByText("Processing Floor", { exact: true });
    const [cellBox, captionBox] = await Promise.all([
      firstCell.boundingBox(),
      firstCaption.boundingBox(),
    ]);
    expect(captionBox!.y).toBeGreaterThanOrEqual(cellBox!.y + cellBox!.height - 1);
  });

  test(`${path}: no lightbox/modal — clicking a gallery image does not open one`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.locator('[data-slot="aspect-ratio"]').first().click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test(`${path}: StatsBand renders capacity/QC/cold-chain figures`, async ({ page }) => {
    await page.goto(path);
    for (const label of [
      "Metric Tons Monthly Capacity",
      "In-House QC Checkpoints",
      "Cold-Chain Monitoring",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });
}
