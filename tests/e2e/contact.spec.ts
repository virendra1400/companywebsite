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
