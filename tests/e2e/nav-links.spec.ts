import { test, expect } from "@playwright/test";

// PAGE-04: every header and footer nav link resolves to a real /[locale]/<slug>
// route — no href="#" placeholders, no 404s. Checked for both the English root
// (/) and the Arabic prefix (/ar); on /ar next-intl locale-prefixes each link.
const CASES = [
  { name: "en", home: "/", prefix: "" },
  { name: "ar", home: "/ar", prefix: "/ar" },
];

// nav[aria-label] regions rendered by GlobalHeader ("Primary") and
// GlobalFooter ("Footer"). Header nav is desktop-only (lg:flex) — the default
// Playwright desktop viewport (1280px) is >= lg, so it is visible.
const REGIONS = ["Primary", "Footer"] as const;

for (const { name, home, prefix } of CASES) {
  for (const region of REGIONS) {
    test(`${name}: all ${region} nav links resolve to a real 200 route (no # / no 404)`, async ({
      page,
    }) => {
      await page.goto(home);

      const nav = page.locator(`nav[aria-label="${region}"]`);
      const links = nav.locator("a");
      const count = await links.count();
      expect(count).toBeGreaterThan(0);

      // Collect + assert every href is a real internal route, not a "#" stub.
      const hrefs: string[] = [];
      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute("href");
        expect(href, `link ${i} has an href`).toBeTruthy();
        expect(href, `link ${i} is not a "#" stub`).not.toBe("#");
        expect(href!, `link ${i} is an internal route`).toMatch(/^\//);
        // On /ar every link must carry the locale prefix.
        if (prefix) {
          expect(href!, `link ${i} is locale-prefixed on /ar`).toMatch(/^\/ar(\/|$)/);
        }
        hrefs.push(href!);
      }

      // Navigate each unique href and confirm it lands on a rendered page
      // (200 + a hero), never a 404.
      for (const href of [...new Set(hrefs)]) {
        const res = await page.goto(href);
        expect(res?.status(), `${href} returns 200`).toBe(200);
        await expect(page.getByTestId("hero"), `${href} renders main content`).toBeVisible();
      }
    });
  }
}
