import { test, expect } from "@playwright/test";
import { HOME_EN_SEED } from "../../src/lib/seed-content";

// FOUND-06/D-06: an untranslated locale (fr/ar/ru have no seeded Home content
// — see scripts/seed-home.ts) renders the English content plus a visible
// LocaleFallbackNotice, never a blank/404 page.
test("untranslated locale (fr) shows fallback notice + English hero copy, not a blank/404 page", async ({
  page,
}) => {
  const res = await page.goto("/fr");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("fallback-notice")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    HOME_EN_SEED.heroHeadline
  );
});

test("translated locale (en) does not show the fallback notice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("fallback-notice")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    HOME_EN_SEED.heroHeadline
  );
});
