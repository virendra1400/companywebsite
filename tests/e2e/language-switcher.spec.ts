import { test, expect } from "@playwright/test";

// FOUND-04: switching locale via the LanguageSwitcher preserves the current
// path — only the locale segment changes (D-05 path-prefix routing). Phase 1
// ships a single route (the home page), so "non-root path" here means a
// non-default-locale URL (/fr) rather than a deeper route — the meaningful
// assertion is that the locale-agnostic pathname is preserved across the swap.
test("switching locale on a non-root path preserves the path", async ({ page }) => {
  await page.goto("/fr");
  // GlobalHeader and GlobalFooter each render their own LanguageSwitcher
  // instance — scope to the header's (banner landmark) to disambiguate.
  const header = page.getByRole("banner");
  await header.getByTestId("language-switcher-trigger").click();
  await page.getByTestId("language-switcher-item-ar").click();
  await expect(page).toHaveURL(/\/ar\/?$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

// FOUND-04 + FOUND-06: switching to a target locale with no translated Home
// content still navigates (no dead-end) and shows the fallback notice.
test("switching to an untranslated target locale still navigates and shows the fallback notice", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await header.getByTestId("language-switcher-trigger").click();
  await page.getByTestId("language-switcher-item-fr").click();
  await expect(page).toHaveURL(/\/fr\/?$/);
  await expect(page.getByTestId("fallback-notice")).toBeVisible();
});
