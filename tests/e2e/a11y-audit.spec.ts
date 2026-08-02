import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// T-205: automated WCAG 2.0/2.1 A+AA audit via axe-core across every public
// page type, both locales (en LTR, ar RTL). Zero violations found on first
// run (2026-08-02) — this test locks that baseline in as a regression
// guard, not a placeholder for known issues to fix later.
const PATHS = [
  "/",
  "/about",
  "/company",
  "/manufacturing",
  "/export",
  "/certifications",
  "/products",
  "/contact",
  "/ar",
];

for (const path of PATHS) {
  test(`${path}: no WCAG 2.0/2.1 A/AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`).join("\n"),
    ).toEqual([]);
  });
}

// One real product detail page — structured spec tables, gallery, cert
// cards are a distinct enough DOM shape from the generic Pages route above
// to warrant its own check. Discovers a real product URL from /products
// rather than hardcoding a slug — local dev's seed catalog and production's
// real catalog use different slugs (tracked gap, see DECISION_LOG D-27).
test("product detail page: no WCAG 2.0/2.1 A/AA violations", async ({ page }) => {
  await page.goto("/products");
  const href = await page.locator('a[href*="/products/"]').first().getAttribute("href");
  await page.goto(href!);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`).join("\n"),
  ).toEqual([]);
});
