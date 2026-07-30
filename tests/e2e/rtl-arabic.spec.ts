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

// 09-03 Task 3 — D-10 directional-slide mirroring. ExportProcessBlock is the
// phase's single direction="start" surface (RESEARCH Pitfall 6): the offset
// class pair must survive into rendered markup (Test A) and the sign must
// actually flip under dir="rtl" (Test B) — lint:rtl structurally cannot
// catch a translate-x-* sign mistake, since that utility isn't in its
// banned-utility list.
test("homepage's directional-slide step carries the base offset + rtl: mirror pair (en)", async ({
  page,
}) => {
  await page.goto("/");
  const step = page.locator('[data-motion="reveal-item"][data-direction="start"]').first();
  await expect(step).toBeAttached();
  const cls = (await step.getAttribute("class")) ?? "";
  expect(cls).toContain("-translate-x-4");
  expect(cls).toContain("rtl:translate-x-4");
});

test("homepage's directional-slide step carries the base offset + rtl: mirror pair (ar)", async ({
  page,
}) => {
  await page.goto("/ar");
  const step = page.locator('[data-motion="reveal-item"][data-direction="start"]').first();
  await expect(step).toBeAttached();
  const cls = (await step.getAttribute("class")) ?? "";
  expect(cls).toContain("-translate-x-4");
  expect(cls).toContain("rtl:translate-x-4");
});

// Class presence alone doesn't prove the CSS sign flips. Probe the live
// stylesheet directly with the same offset class pair RevealItem's
// direction="start" uses, under each page's own dir, rather than measuring a
// real (timing/layout-dependent) un-revealed step.
async function probeDirectionStartTranslateX(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "-translate-x-4 rtl:translate-x-4";
    document.body.appendChild(el);
    const translate = getComputedStyle(el).translate;
    el.remove();
    return translate;
  });
}

test("direction=start offset resolves negative (left) under LTR", async ({ page }) => {
  await page.goto("/");
  const translate = await probeDirectionStartTranslateX(page);
  const x = parseFloat(translate.split(/\s+/)[0]);
  expect(x).toBeLessThan(0);
});

test("direction=start offset resolves positive (right) under RTL", async ({ page }) => {
  await page.goto("/ar");
  const translate = await probeDirectionStartTranslateX(page);
  const x = parseFloat(translate.split(/\s+/)[0]);
  expect(x).toBeGreaterThan(0);
});
