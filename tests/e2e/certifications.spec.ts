import { test, expect } from "@playwright/test";

// T-106: the Certifications collection now carries the 7 real in-progress
// certifications from PROJECT_MEMORY.md §3 (APEDA/FSSAI/IEC/GST/ISO/HALAL/
// KOSHER — see scripts/populate-certifications-t106.ts), all status
// "in-certification", no numbers. Both CertStripBlock variants (grid on
// /certifications, strip on the homepage) render real cert cards instead of
// the "coming soon" empty state. The empty-state itself is still real,
// implemented behavior (CAT-04) — just not exercised here since there's
// real data seeded; a genuinely-empty Certifications collection is covered
// structurally by CertStripBlock.tsx's own `certs.length === 0` branch.
const PATHS = ["/certifications", "/ar/certifications"];

for (const path of PATHS) {
  test(`${path}: renders real certification cards, no "coming soon" empty state`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Certifications coming soon.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Halal Certification", { exact: true })).toBeVisible();
  });

  test(`${path}: every cert card shows "In Certification", never a fabricated "Registered" claim without a number`, async ({
    page,
  }) => {
    await page.goto(path);
    // 7 seeded certs, none have a number yet — every single one must show
    // the in-certification pill (CertCard's isRegistered guard: registered
    // requires BOTH status="registered" AND a real number).
    const inCertificationPills = page.getByText("In Certification", { exact: true });
    expect(await inCertificationPills.count()).toBeGreaterThanOrEqual(7);
    await expect(page.getByText("Registered", { exact: true })).toHaveCount(0);
  });

  test(`${path}: Halal card gets the elevated/spanning treatment`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Halal Certified", { exact: true })).toBeVisible();
  });

  test(`${path}: sample COA document card does not show a certification status pill`, async ({ page }) => {
    await page.goto(path);
    const coaCard = page.locator("section", { hasText: "Sample Certificate of Analysis" });
    await expect(coaCard.getByText("In Certification", { exact: true })).toHaveCount(0);
  });
}

test("homepage CertStrip shows real cert names (text fallback, no logos uploaded yet), not broken images", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Certifications coming soon.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Halal Certification" })).toBeVisible();
  const broken = await page.$$eval("img", (imgs) =>
    imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
  );
  expect(broken).toBe(0);
});
