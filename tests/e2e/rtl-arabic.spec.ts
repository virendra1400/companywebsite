import { test, expect } from "@playwright/test";

// FOUND-03: Arabic is RTL server-side; every other locale is LTR; and Arabic
// renders Western (latn) numerals, never Arabic-Indic (٠-٩).

test("/ar renders <html dir=rtl lang=ar> set server-side", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("/ renders <html dir=ltr>", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});

test("/ar sample number uses Western (latn) digits", async ({ page }) => {
  await page.goto("/ar");
  const text = (await page.getByTestId("sample-count").innerText()).trim();
  expect(text).toMatch(/[0-9]/); // has a Western digit
  expect(text).not.toMatch(/[٠-٩]/); // no Arabic-Indic ٠-٩
});
