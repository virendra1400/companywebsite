import { test, expect } from "@playwright/test";

// LEAD-02/D-02/D-03/D-04 — RFQ mode is derived client-side from the
// `?product=` query param. This spec covers the three rendering states:
// full RFQ (product + productName), the missing-productName backstop truth
// (banner falls back to the raw slug), and plain inquiry mode (no RFQ group
// at all). Submission/email-payload behavior is covered at the unit level
// (tests/unit/contact-action.spec.ts) — this spec is render-only, no
// Turnstile mock needed since none of these tests submit the form.

test("RFQ mode with productName: banner, Quote Details group, and RFQ submit label all render", async ({
  page,
}) => {
  await page.goto("/contact?product=basmati-rice&productName=Basmati%20Rice");

  await expect(page.getByText(/requesting a quote for/i)).toBeVisible();
  await expect(page.getByText("Basmati Rice")).toBeVisible();
  await expect(page.getByText("Quote Details")).toBeVisible();

  await expect(page.getByLabel("Quantity")).toBeVisible();
  await expect(page.getByLabel("Destination Country")).toBeVisible();
  await expect(page.getByLabel("Incoterm")).toBeVisible();

  await expect(page.getByRole("button", { name: /send quote request/i })).toBeVisible();
});

test("RFQ mode with NO productName: banner falls back to the raw slug (backstop)", async ({
  page,
}) => {
  await page.goto("/contact?product=basmati-rice");

  await expect(page.getByText(/requesting a quote for/i)).toBeVisible();
  await expect(page.getByText("basmati-rice")).toBeVisible();
  await expect(page.getByRole("button", { name: /send quote request/i })).toBeVisible();
});

test("no product param: plain inquiry mode, no RFQ group, default submit label", async ({
  page,
}) => {
  await page.goto("/contact");

  await expect(page.getByText(/requesting a quote for/i)).toHaveCount(0);
  await expect(page.getByText("Quote Details")).toHaveCount(0);
  await expect(page.getByLabel("Quantity")).toHaveCount(0);

  await expect(page.getByRole("button", { name: /send inquiry/i })).toBeVisible();
});
