import { test, expect } from "@playwright/test";

// TRUST-05: /[locale]/company renders leadership (FeatureGrid photo tiles),
// the compliance RichText, and the Company Profile document card in its
// honest PDF-absent "available on request" state — reusing CertCard, so no
// download anchor exists and no fabricated IEC/registration number is
// visible anywhere on the page. Both en and /ar paths are exercised to
// confirm no layout break under dir=rtl (UI-SPEC RTL Extensions — grid-based
// blocks need no extra RTL rules).
const PATHS = ["/company", "/ar/company"];

for (const path of PATHS) {
  test(`${path}: renders the leadership FeatureGrid (photo tiles)`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Managing Director")).toBeVisible();
    await expect(page.getByText("Head of Quality & Compliance")).toBeVisible();
    await expect(page.getByText("Export Operations Manager")).toBeVisible();
  });

  // D-37: production briefly had a false "operates under a valid
  // Importer-Exporter Code (IEC) registration" claim (pre-rebrand copy,
  // fixed via fix-company-page-false-claims.ts) — this assertion checks for
  // the CORRECT honest "in progress" framing, not the spelled-out phrase
  // that only ever existed in the buggy text.
  test(`${path}: renders the compliance RichText narrative (honest "in progress" framing)`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByText(/IEC and APEDA registrations are in progress/i)).toBeVisible();
  });

  test(`${path}: Company Profile document card shows "available on request", no download link`, async ({
    page,
  }) => {
    await page.goto(path);
    const docCard = page.locator('[data-slot="card"]', { hasText: "Company Profile" }).first();
    await expect(docCard).toBeVisible();
    await expect(docCard.getByText("Certificate available on request")).toBeVisible();
    await expect(docCard.locator("a")).toHaveCount(0);
  });

  test(`${path}: no fabricated IEC/FSSAI/registration number is visible`, async ({ page }) => {
    await page.goto(path);
    const bodyText = await page.locator("body").innerText();
    // A fabricated registration/IEC number would look like a long digit
    // string or an alphanumeric code sitting next to "IEC"/"FSSAI" —
    // the seeded copy is generic prose with no such code anywhere.
    expect(bodyText).not.toMatch(/\b(IEC|FSSAI)[\s:-]*[0-9A-Z]{5,}\b/);
  });
}
