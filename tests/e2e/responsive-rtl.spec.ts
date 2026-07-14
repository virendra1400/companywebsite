import { test, expect } from "@playwright/test";

// FOUND-05: header/footer/hero render without overflow/broken layout at every
// declared breakpoint (UI-SPEC Spacing Scale), in both ltr (/) and rtl (/ar).
const BREAKPOINTS = [
  { name: "sm", width: 640, height: 900 },
  { name: "md", width: 768, height: 900 },
  { name: "lg", width: 1024, height: 900 },
  { name: "xl", width: 1280, height: 900 },
];

const DIRECTIONS = [
  { dir: "ltr" as const, path: "/" },
  { dir: "rtl" as const, path: "/ar" },
];

for (const { dir, path } of DIRECTIONS) {
  for (const bp of BREAKPOINTS) {
    test(`${bp.name} (${dir}) — header/footer/hero render without overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(path);

      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByTestId("hero")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }
}

// FOUND-05: the mobile nav panel opens from the logical inline-end edge —
// visually left in RTL, right in LTR — not a hardcoded side.
for (const { dir, path } of DIRECTIONS) {
  test(`mobile nav panel opens from the logical inline-end edge (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);

    const trigger = page.getByTestId("mobile-nav-trigger");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    const panel = page.getByTestId("mobile-nav-panel");
    await expect(panel).toBeVisible();
    const expectedSide = dir === "rtl" ? "left" : "right";
    await expect(panel).toHaveAttribute("data-side", expectedSide);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
}
