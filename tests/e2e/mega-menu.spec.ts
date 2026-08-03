import { test, expect } from "@playwright/test";

// T-209: real user-reported bug — hovering "Products" open the mega-menu,
// but moving the mouse from the trigger down into the panel to click a
// product made the whole menu vanish before the click landed, so nothing
// navigated. Root cause: the panel was offset from the trigger with a CSS
// margin (a real gap with no element in it), so a mouse path crossing that
// gap briefly left every descendant of the hover root, firing onMouseLeave
// and unmounting the panel mid-transit. Fixed by closing the gap with
// padding instead of margin (panel's own hit-box now starts flush against
// the trigger). This test simulates the actual mouse PATH (not just a
// synthetic hover state) via page.mouse.move with intermediate steps, the
// only way to catch this class of bug — a plain .hover() + .click() call
// jumps straight to the target and would never have caught the original bug.
//
// The assertion is "the intended link is still at the click point after the
// transit" (via elementFromPoint), not "navigation completes" — completing
// a real client-side nav depends on next dev's Turbopack/Fast-Refresh, which
// independently swallows simulated clicks mid-flight (confirmed via a raw
// script against a fresh dev server, and confirmed NOT to happen against a
// production build). That's a dev-only artifact unrelated to this bug; this
// test would still catch the actual regression (menu unmounting mid-transit,
// which puts something else — or nothing — at the click point) without
// being defeated by it.
test.describe("Products mega-menu", () => {
  test("hovering the trigger then moving the mouse down into the panel keeps the product link under the cursor (does not close prematurely)", async ({
    page,
  }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: /products/i });
    await trigger.waitFor({ state: "visible" });
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).toBeTruthy();

    // Move onto the trigger first (real hover), matching how a user's mouse
    // actually arrives there — not a synthetic .hover() teleport.
    await page.mouse.move(
      triggerBox!.x + triggerBox!.width / 2,
      triggerBox!.y + triggerBox!.height / 2,
    );

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();

    const firstProduct = menu.getByRole("menuitem").first();
    const productBox = await firstProduct.boundingBox();
    expect(productBox).toBeTruthy();

    const targetX = productBox!.x + productBox!.width / 2;
    const targetY = productBox!.y + productBox!.height / 2;

    // Move from the trigger toward the product link in multiple steps,
    // crossing exactly the region where the old margin-based gap lived —
    // this is the actual reproduction of the reported bug.
    await page.mouse.move(targetX, targetY, { steps: 15 });

    // The menu must still be open/visible after transiting the gap.
    await expect(menu).toBeVisible();

    const href = await firstProduct.getAttribute("href");
    const hitElement = await page.evaluateHandle(
      ([x, y]) => document.elementFromPoint(x, y),
      [targetX, targetY],
    );
    const hitHref = await hitElement.evaluate((el) => (el as HTMLElement | null)?.closest("a")?.getAttribute("href"));

    // The old bug: the panel unmounted mid-transit, so the click landed on
    // whatever was behind it instead of the link — nothing navigated.
    expect(hitHref).toBe(href);
  });

  test("Escape closes the menu and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /products/i });
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});
