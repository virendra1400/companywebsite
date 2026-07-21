import { test, expect } from "@playwright/test";

// LEAD-06/D-05 — a persistent WhatsApp CTA is reachable from every page via
// GlobalHeader (desktop, icon-only) and MobileNavPanel (sheet, labelled).
// href always sourced from getSiteBrand().waHref (never hardcoded).
test("desktop header exposes an icon-only WhatsApp CTA with a wa.me href", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const waLink = page.getByRole("banner").getByRole("link", { name: /chat on whatsapp/i });
  await expect(waLink).toBeVisible();

  const href = await waLink.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\//);

  await expect(waLink).toHaveAttribute("target", "_blank");
  await expect(waLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("mobile nav sheet shows a labelled Chat on WhatsApp CTA that closes the sheet on click", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");

  await page.getByTestId("mobile-nav-trigger").click();
  const panel = page.getByTestId("mobile-nav-panel");
  await expect(panel).toBeVisible();

  const waLink = panel.getByRole("link", { name: /chat on whatsapp/i });
  await expect(waLink).toBeVisible();
  await expect(waLink.getByText(/chat on whatsapp/i)).toBeVisible();

  const href = await waLink.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\//);

  // target=_blank opens a new tab — catch and close it, then assert the
  // sheet closed via onNavigate.
  const [popup] = await Promise.all([context.waitForEvent("page"), waLink.click()]);
  await popup.close();
  await expect(panel).toBeHidden();
});
