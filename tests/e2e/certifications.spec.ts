import { test, expect } from "@playwright/test";

// TRUST-01/02: the Certifications collection is intentionally empty (no
// fabricated cert data — see seed-content.ts/seed-pages.ts) until real
// certifications are added via /admin. Both CertStripBlock variants (grid on
// /certifications, strip on the homepage) render the built-in "coming soon"
// empty state rather than a blank grid. The halal-badge/PDF-download/
// PDF-absent CertCard behavior (border-accent-600 elevation, safe download
// link, "available on request" copy) is real, implemented functionality —
// it just has no e2e coverage right now because there's no real cert data to
// exercise it against; re-add card-level assertions once /admin has real
// certifications seeded.
const PATHS = ["/certifications", "/ar/certifications"];

for (const path of PATHS) {
  test(`${path}: renders the "coming soon" empty state, not a blank grid`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Certifications coming soon.", { exact: true })).toBeVisible();
  });
}

test("homepage CertStrip renders the empty state, not broken logo links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Certifications coming soon.", { exact: true })).toBeVisible();
});
