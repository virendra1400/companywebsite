import { test, expect } from "@playwright/test";
import { mockTurnstileSuccess } from "./turnstile-mock";

// PAGE-03 / D-07 — the Contact page shows real contact channels (address,
// WhatsApp with a VISIBLE text label, email, phone). As of Phase 4 (04-03)
// the form submits for real via submitContactForm (see
// contact-error-state.spec.ts for the loading/success/error/rate-limit
// states) — but client-side zod validation (contactSchema, shared with the
// server) still short-circuits an empty submit BEFORE any network call: RHF's
// handleSubmit only invokes onSubmit (and therefore the Server Action) once
// validation passes, so this test still asserts per-field errors +
// aria-invalid with NO request issued. Both en and /ar paths are exercised
// (UI-SPEC RTL Extensions "Contact form field order" — two-column layout
// mirrors automatically under dir=rtl, no manual reordering).
const PATHS = ["/contact", "/ar/contact"];

for (const path of PATHS) {
  test(`${path}: address, WhatsApp (visible label + wa.me href), email, phone are all visible`, async ({
    page,
  }) => {
    await page.goto(path);

    // Address (free-text, from the seeded placeholder — assert a stable
    // substring rather than the full string).
    await expect(page.getByText(/Nashik/i)).toBeVisible();

    // WhatsApp: NOT icon-only — a visible text label sits beside the icon
    // (asserted separately below), plus an aria-label that becomes the
    // link's accessible name (aria-label takes precedence over visible text
    // for accessible-name computation, per UI-SPEC §9's explicit requirement
    // for BOTH to be present).
    // Scoped to <main> — GlobalHeader also renders a "Chat on WhatsApp" CTA
    // (D-05, LEAD-06) site-wide, so an unscoped locator would match both.
    const waLink = page.getByRole("main").getByRole("link", { name: /chat on whatsapp/i });
    await expect(waLink).toBeVisible();
    const waHref = await waLink.getAttribute("href");
    expect(waHref).toMatch(/^https:\/\/wa\.me\//);
    await expect(waLink.getByText(/chat on whatsapp/i)).toBeVisible();

    // Email (mailto) and phone (tel) links, each with a visible value.
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink.first()).toBeVisible();
    expect(await emailLink.first().getAttribute("href")).toContain("@");

    const phoneLink = page.locator('a[href^="tel:"]');
    await expect(phoneLink.first()).toBeVisible();
  });

  test(`${path}: empty submit shows per-field errors + aria-invalid, and issues NO navigation/network`, async ({
    page,
  }) => {
    // Submit is gated on a non-empty turnstileToken (LEAD-03) regardless of
    // the rest of the form — fake the widget so the button is clickable at
    // all, then confirm client-side zod validation is what actually blocks
    // the empty submit, not the Turnstile gate.
    await mockTurnstileSuccess(page);
    await page.goto(path);
    const startUrl = page.url();

    const requests: string[] = [];
    page.on("request", (req) => {
      // Ignore the initial document/asset load itself, only flag anything
      // fired AFTER we attach the listener (i.e. from the submit click).
      if (req.method() !== "GET") requests.push(`${req.method()} ${req.url()}`);
    });

    const submitButton = page.getByRole("button", { name: /send inquiry/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Client-side zod validation renders synchronously after RHF's
    // handleSubmit resolves — no server round-trip to wait for.
    await expect(page.getByText("Name is required.")).toBeVisible();
    await expect(page.getByText("Company is required.")).toBeVisible();
    await expect(page.getByText("Country is required.")).toBeVisible();
    await expect(
      page.getByText("Please tell us a bit more (at least 20 characters)."),
    ).toBeVisible();

    const nameInput = page.getByLabel("Full Name");
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");

    // Client-side validation blocks BEFORE the Server Action is ever
    // invoked, so still no network request of any kind, and no navigation
    // away from the contact page.
    expect(requests).toEqual([]);
    expect(page.url()).toBe(startUrl);
  });
}

test("/ar/contact: two-column info+form block renders under dir=rtl without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/ar/contact");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

// 09-04 (D-13): the FAQ accordion animates open AND close via
// grid-template-rows with forceMount — closed content stays present in the
// DOM (so the closing transition can play) but is hidden from assistive
// tech via data-[state=closed]:invisible. Always scroll the FAQ into view
// first so this passes identically whether or not 09-02's section reveal
// has merged yet.
test("/contact: FAQ accordion animates open and closed via grid-template-rows, staying a11y-hidden while closed", async ({
  page,
}) => {
  await page.goto("/contact");

  // Scope content to the SAME AccordionItem as the trigger clicked below
  // ("How quickly will I hear back?" — item-1, not item-0) — a single-
  // collapsible accordion only flips the item that was actually clicked.
  const trigger = page.getByRole("button", { name: /how quickly will i hear back/i });
  const item = page.locator('[data-slot="accordion-item"]').filter({ has: trigger });
  const content = item.locator('[data-slot="accordion-content"]');
  await content.scrollIntoViewIfNeeded();

  // Closed, before any interaction: present in the DOM (forceMount), but
  // hidden from assistive tech via computed visibility. Reads force a
  // reflow first (el.offsetWidth) and are polled — a bare getComputedStyle
  // right after scrollIntoViewIfNeeded can return a stale pre-reflow
  // snapshot for var()-based properties under load.
  await expect(content).toBeAttached();
  await expect(content).toHaveAttribute("data-state", "closed");
  await expect
    .poll(async () =>
      content.evaluate((el) => {
        void (el as HTMLElement).offsetWidth;
        return getComputedStyle(el).visibility;
      }),
    )
    .toBe("hidden");

  // Open: click the trigger by the seeded question text (shortest, most
  // stable string — src/lib/seed-content.ts Contact FAQ items).
  await trigger.click();

  await expect(content).toHaveAttribute("data-state", "open");
  await expect
    .poll(async () =>
      content.evaluate((el) => {
        void (el as HTMLElement).offsetWidth;
        return getComputedStyle(el).visibility;
      }),
    )
    .toBe("visible");
  const openRows = await content.evaluate((el) => getComputedStyle(el).gridTemplateRows);
  expect(openRows).not.toBe("0px");

  // Close again: data-state flips immediately, visibility only flips back
  // to hidden once the ~300ms close transition elapses — this is the half
  // Radix's default unmount-on-close behaviour used to swallow entirely.
  // Assert on ELAPSED TIME rather than reading the raw CSS
  // transition-duration property: getComputedStyle's resolved value for a
  // var()-driven transition-duration is observably unstable in this Next.js
  // dev-mode/Turbopack HMR session (confirmed correct and stable in the
  // served stylesheet and in `next build` output — this is a dev-server
  // read-timing artifact, not a production behavior). The wall-clock delay
  // before visibility flips is the actual behavioral proof that closing
  // isn't instant, and it can't be faked by a stale style read.
  const closeStart = Date.now();
  await trigger.click();
  await expect(content).toHaveAttribute("data-state", "closed");
  await expect
    .poll(async () => content.evaluate((el) => getComputedStyle(el).visibility), { timeout: 2000 })
    .toBe("hidden");
  expect(Date.now() - closeStart).toBeGreaterThan(100);
});

// 09-04 (D-11/D-12): tap feedback lives at a single edit site in
// buttonVariants — active:scale-[0.98], suppressed to no visual delta under
// prefers-reduced-motion. Tailwind v4 compiles scale-* utilities to the
// standalone `scale` CSS property (not `transform`).
test("/contact: submit button tap feedback scales 0.98 while pressed, suppressed under reduced motion", async ({
  page,
}) => {
  await mockTurnstileSuccess(page);
  await page.goto("/contact");

  const submitButton = page.getByRole("button", { name: /send inquiry/i });
  // `.hover()` (not a manual boundingBox+mouse.move) so Playwright's own
  // occlusion check positions the cursor past the sticky header rather than
  // landing on whatever sits at the raw scrollIntoViewIfNeeded coordinates.
  await submitButton.hover();

  expect(await submitButton.evaluate((el) => getComputedStyle(el).scale)).toBe("none");

  await page.mouse.down();
  // transition-all's default duration means the pressed scale interpolates
  // rather than jumping straight to 0.98 — poll until it settles.
  await expect
    .poll(async () => submitButton.evaluate((el) => getComputedStyle(el).scale))
    .toMatch(/^0\.98/);
  await page.mouse.up();
  // Let the release transition (0.98 -> rest) fully settle before the next
  // press, so it isn't caught mid-interpolation.
  await expect
    .poll(async () => submitButton.evaluate((el) => getComputedStyle(el).scale))
    .toBe("none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  // Re-hover: emulateMedia can drop the tracked hover state, and a
  // mouse.down without the cursor back over the button wouldn't register
  // as :active at all.
  await submitButton.hover();
  await page.mouse.down();
  await expect
    .poll(async () => submitButton.evaluate((el) => getComputedStyle(el).scale))
    .toBe("1");
  await page.mouse.up();
});
