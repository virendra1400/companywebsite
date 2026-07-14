import { test, expect } from "@playwright/test";

// FOUND-01: locale-prefixed URLs resolve (en at root, /ar //fr //ru prefixed),
// each returning 200 and rendering the home hero.
const ROUTES = ["/", "/ar", "/fr", "/ru"];

for (const route of ROUTES) {
  test(`GET ${route} returns 200 and renders the hero`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.getByTestId("hero")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
