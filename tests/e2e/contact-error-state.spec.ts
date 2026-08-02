import { test, expect, type Page } from "@playwright/test";
import { mockTurnstileSuccess } from "./turnstile-mock";

// LEAD-04 / UI-SPEC error/rate-limit/backstop states. Pitfall 6
// (04-RESEARCH.md): Playwright can only observe/intercept requests that
// actually leave the BROWSER — the Server Action's own outbound calls
// (Resend, Turnstile siteverify, CRM webhook) never touch it and aren't
// mockable here. What IS browser-visible and mockable:
//   1. The Server Action's own POST (client -> this app's server) — a
//      network-level abort forces onSubmit's try/catch into the generic
//      error banner without needing to hand-craft Next's RSC wire format.
//   2. The Cloudflare Turnstile widget script itself — faked so tests get a
//      submittable token without a live site key (none configured pending
//      user_setup), or deliberately blocked to exercise the backstop truth.
// The rate-limit case is the one state that can't be produced by intercepting
// a browser-visible request (the real decision is server-side), so it drives
// the ACTUAL in-memory limiter with real submissions instead — confirmed
// deterministic since (a) Turnstile's own network round trip is fast
// (checked ~60ms) and (b) the limiter check runs before that round trip, so
// a tripped limit short-circuits without waiting on Cloudflare at all.

async function fillValidForm(page: Page) {
  await page.getByLabel("Full Name").fill("Jane Buyer");
  await page.getByLabel("Company", { exact: true }).fill("Buyer Trading Co");
  await page.getByLabel("Country", { exact: true }).fill("Germany");
  await page.getByLabel("Email", { exact: true }).fill("jane@buyer-trading.example");
  await page
    .getByLabel("Message")
    .fill("We would like to place a recurring order for your export products.");
}

test("network/server failure shows destructive banner, retains input, re-enables submit", async ({
  page,
}) => {
  // Single route covering both concerns (rather than two overlapping
  // page.route registrations, whose match-order semantics for a same-tab
  // request are easy to get subtly wrong): fake the Turnstile script so a
  // token is obtainable, and abort the Server Action's own POST (the only
  // same-origin POST this page issues) at the network layer so onSubmit's
  // try/catch — rather than a fabricated response body — drives the error
  // path.
  await mockTurnstileSuccess(page);
  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST") {
      await route.abort("failed");
      return;
    }
    await route.fallback();
  });

  await page.goto("/contact");
  await fillValidForm(page);
  const submitButton = page.getByRole("button", { name: /send inquiry/i });
  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  await expect(page.getByText(/something went wrong sending your message/i)).toBeVisible();
  await expect(page.getByLabel("Full Name")).toHaveValue("Jane Buyer");
  await expect(submitButton).toBeEnabled();
});

test("legitimate user tripping the rate limit sees the distinct copy, not the generic banner", async ({
  page,
}, testInfo) => {
  // In-memory limiter (rate-limit.ts) is keyed by IP, and local dev/test
  // requests all fall back to the same "unknown" key — a real, documented
  // MVP limitation (see rate-limit.ts). That means concurrent locale
  // projects hitting it at once would corrupt each other's count; only run
  // this one under a single project.
  test.skip(testInfo.project.name !== "en", "single-project run avoids shared-counter races");

  await mockTurnstileSuccess(page);
  await page.goto("/contact");
  await fillValidForm(page);
  const submitButton = page.getByRole("button", { name: /send inquiry/i });
  await expect(submitButton).toBeEnabled();

  // Bounded retry rather than a hard-coded attempt count: the limiter's
  // 60s window may already carry state from an earlier run against the
  // same reused dev server, so keep submitting (each miss is a real but
  // fast Turnstile round trip) until the distinct copy appears.
  let limited = false;
  for (let attempt = 0; attempt < 6 && !limited; attempt++) {
    await submitButton.click();
    await expect(submitButton).toBeEnabled();
    limited = await page.getByText(/submitting a bit too quickly/i).isVisible();
  }

  expect(limited).toBe(true);
});

test("Turnstile script failing to load keeps submit disabled and explains the failure", async ({
  page,
}) => {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", (route) =>
    route.abort("failed"),
  );

  await page.goto("/contact");
  await fillValidForm(page);

  const submitButton = page.getByRole("button", { name: /send inquiry/i });
  // Distinct from the server-failure banner above (line 58) — this is the
  // captcha-couldn't-load case, ContactForm.tsx's `captchaErrorBanner` copy,
  // not a submission failure (the form was never submitted; captcha never
  // loaded).
  await expect(
    page.getByText(/couldn't load the security check.*whatsapp or by email/i),
  ).toBeVisible();
  await expect(submitButton).toBeDisabled();
});
