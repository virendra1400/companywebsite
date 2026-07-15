import { test, expect } from "@playwright/test";

// Success criterion 4 / PAGE-04: the global chrome (GlobalHeader wordmark,
// GlobalFooter, LanguageSwitcher) renders identically on all 7 pages, in both
// LTR (en, root) and RTL (ar, /ar prefix) — the site is one coherent whole,
// not a set of orphan pages.
const SLUGS = [
  "", // home
  "about",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "contact",
];

const LOCALES = [
  { name: "en", base: "" },
  { name: "ar", base: "/ar" },
];

for (const { name, base } of LOCALES) {
  for (const slug of SLUGS) {
    const path = `${base}${slug ? `/${slug}` : ""}` || "/";
    test(`${name}: ${path} renders header wordmark, footer, and language switcher`, async ({
      page,
    }) => {
      await page.goto(path);

      // GlobalHeader brand wordmark.
      await expect(
        page.locator("header").getByText("Star Agrevolution", { exact: true }),
      ).toBeVisible();

      // GlobalFooter present (and its wordmark repeat).
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
      await expect(footer.getByText("Star Agrevolution", { exact: true })).toBeVisible();

      // LanguageSwitcher present (header instance).
      await expect(
        page.getByTestId("language-switcher-trigger").first(),
      ).toBeVisible();
    });
  }
}

// Sampled RTL check: the Arabic pages set <html dir=rtl> server-side, so the
// chrome mirrors via logical properties without per-component RTL code.
test("/ar/contact sets <html dir=rtl> for the shared chrome", async ({ page }) => {
  await page.goto("/ar/contact");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("/contact renders <html dir=ltr> for the shared chrome", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
