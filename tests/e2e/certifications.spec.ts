import { test, expect } from "@playwright/test";

// TRUST-01/02: the Certifications page renders every seeded cert as a card;
// the halal cert is visually elevated (accent-600 border + Halal Certified
// badge + 2-column span); a PDF-present cert exposes a safe (noopener)
// download link; a PDF-absent cert shows the muted "available on request"
// copy and renders NO dead link. Both en and /ar paths are exercised to
// confirm the grid auto-flows correctly under dir=rtl (UI-SPEC RTL
// Extensions — CertCard grid needs no extra RTL rules).
const PATHS = ["/certifications", "/ar/certifications"];

for (const path of PATHS) {
  test(`${path}: halal cert renders the Halal Certified badge with accent elevation`, async ({
    page,
  }) => {
    await page.goto(path);
    const halalCard = page.locator('[data-slot="card"]', { hasText: "Halal Certified" }).first();
    await expect(halalCard).toBeVisible();
    await expect(halalCard).toHaveClass(/border-accent-600/);
    await expect(halalCard).toHaveClass(/col-span-2/);
  });

  test(`${path}: a PDF-present cert shows a safe Download PDF link`, async ({ page }) => {
    await page.goto(path);
    const downloadLink = page.getByRole("link", { name: /download.*pdf/i }).first();
    await expect(downloadLink).toBeVisible();
    expect(await downloadLink.getAttribute("download")).not.toBeNull();
    expect(await downloadLink.getAttribute("target")).toBe("_blank");
    expect(await downloadLink.getAttribute("rel")).toContain("noopener");
  });

  test(`${path}: a PDF-absent cert shows "Certificate available on request" with no dead link`, async ({
    page,
  }) => {
    await page.goto(path);
    const noPdfCard = page.locator('[data-slot="card"]', { hasText: "ISO 22000" }).first();
    await expect(noPdfCard).toBeVisible();
    await expect(noPdfCard.getByText("Certificate available on request")).toBeVisible();
    await expect(noPdfCard.locator("a")).toHaveCount(0);
  });
}

test("homepage CertStrip renders logo links to /certifications", async ({ page }) => {
  await page.goto("/");
  const certLinks = page.locator('a[href="/certifications"]');
  await expect(certLinks.first()).toBeVisible();
});
