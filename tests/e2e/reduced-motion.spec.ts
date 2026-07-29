import { test, expect } from "@playwright/test";

// Phase 9 / 09-VALIDATION.md Wave 0 gap: proves the D-06/D-07/D-08/D-12
// reveal contracts end-to-end. Scoped to reveal/reduced-motion only —
// accordion + button :active assertions live in tests/e2e/contact.spec.ts
// (owned by plan 09-04) so this file and 09-04's edits never touch the same
// test file in the same wave.
//
// Critical: assert `getComputedStyle(el).translate`, never `.transform`.
// Tailwind v4 (4.3.2) compiles `translate-y-*` to the standalone `translate`
// CSS property, so `.transform` reads "none" on a correctly-implemented
// Reveal wrapper and would pass/fail vacuously.

test("reduced motion: below-the-fold content is visible immediately, no transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const lastReveal = page.locator('[data-motion="reveal"]').last();
  await expect(lastReveal).toHaveAttribute("data-revealed", "true");

  const style = await lastReveal.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { opacity: cs.opacity, transitionDuration: cs.transitionDuration };
  });
  expect(style.opacity).toBe("1");
  expect(style.transitionDuration).toBe("0s");
});

test("no preference: below-the-fold content is hidden until scrolled, then reveals", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const lastReveal = page.locator('[data-motion="reveal"]').last();
  await expect(lastReveal).not.toHaveAttribute("data-revealed", "true");
  expect(await lastReveal.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");

  // The reveal must transition the standalone `translate` CSS property, not
  // `transform` — Tailwind v4 compiles translate-y-* utilities to `translate`,
  // so naming `transform` here would leave the rise-in untransitioned (snap
  // instead of glide). Fails if Reveal's transition-[...] list regresses.
  const transitionedProperty = await lastReveal.evaluate(
    (el) => getComputedStyle(el).transitionProperty,
  );
  expect(transitionedProperty).toContain("translate");
  expect(transitionedProperty).not.toContain("transform");

  await lastReveal.scrollIntoViewIfNeeded();
  await expect(lastReveal).toHaveAttribute("data-revealed", "true");
  await expect
    .poll(async () => lastReveal.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
});

test("zero replay: a revealed section never returns to hidden after scrolling away and back", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const lastReveal = page.locator('[data-motion="reveal"]').last();
  await lastReveal.scrollIntoViewIfNeeded();
  await expect(lastReveal).toHaveAttribute("data-revealed", "true");

  await page.evaluate(() => window.scrollTo(0, 0));
  // Let the 600ms opacity/translate transition window pass so a (bugged)
  // re-hide would actually have time to visually take effect before we
  // scroll back and assert.
  await page.waitForTimeout(700);
  await lastReveal.scrollIntoViewIfNeeded();

  await expect(lastReveal).toHaveAttribute("data-revealed", "true");
  expect(await lastReveal.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("hero is never gated behind Reveal (LCP exception, D-07)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const hero = page.getByTestId("hero");
  await expect(hero).toBeVisible();

  const hasRevealAncestor = await hero.evaluate(
    (el) => el.closest('[data-motion="reveal"]') !== null,
  );
  expect(hasRevealAncestor).toBe(false);

  expect(await hero.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("tw-animate-css resolves real keyframes (unblocks D-08 mobile-nav polish)", async ({
  page,
}) => {
  await page.goto("/");

  const animationName = await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "animate-in fade-in-0";
    document.body.appendChild(el);
    const name = getComputedStyle(el).animationName;
    el.remove();
    return name;
  });

  expect(animationName).not.toBe("none");
});
