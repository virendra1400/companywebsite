import type { Page } from "@playwright/test";

// Fakes the Cloudflare Turnstile script so `turnstileToken` populates
// without a live site key (none configured pending user_setup). Mirrors
// @marsidev/react-turnstile's own contract: define `window.turnstile.render()`,
// invoke the widget's `callback` with a token, then call the library's
// onload hook (read from the script URL's `?onload=` param) so its internal
// "script ready" promise resolves and it proceeds to call `render()`.
// Shared by tests/e2e/contact.spec.ts and contact-error-state.spec.ts — the
// submit button is gated on a non-empty turnstileToken (LEAD-03), so any
// test that clicks submit needs this regardless of what it's testing next.
const ONLOAD_FALLBACK = "onloadTurnstileCallback";

export async function mockTurnstileSuccess(page: Page) {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", async (route) => {
    const onload = new URL(route.request().url()).searchParams.get("onload") ?? ONLOAD_FALLBACK;
    await route.fulfill({
      contentType: "application/javascript",
      body: `
        window.turnstile = {
          render: (container, options) => {
            setTimeout(() => options && options.callback && options.callback("test-token"), 0);
            return "test-widget-id";
          },
          reset: () => {},
          remove: () => {},
          getResponse: () => "test-token",
        };
        if (window["${onload}"]) window["${onload}"]();
      `,
    });
  });
}
