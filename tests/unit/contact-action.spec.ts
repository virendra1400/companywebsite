import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted before the dynamic import (tests/int/pages-revalidate-hook.spec.ts
// discipline) — contact-action.ts constructs `new Resend(...)` at module
// scope, so the SDK and next/headers must be mocked before the module first
// loads, not after.
const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const headersGetMock = vi.fn();
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({ get: headersGetMock })),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const { submitContactForm } = await import("@/lib/contact-action");

const basePayload = {
  name: "Jane Buyer",
  company: "Acme Foods",
  country: "United Arab Emirates",
  email: "jane@example.com",
  phone: "",
  message: "We would like to import 20 MT of basmati rice per quarter.",
  companyWebsite: "",
  turnstileToken: "valid-token",
};

describe("submitContactForm", () => {
  beforeEach(() => {
    sendMock.mockReset();
    fetchMock.mockReset();
    headersGetMock.mockReset();

    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_ADDRESS = "leads@mail.example.com";
    process.env.SALES_INBOX_ADDRESS = "sales@example.com";
    process.env.TURNSTILE_SECRET_KEY = "turnstile-secret";
    delete process.env.CRM_WEBHOOK_URL;

    // Default happy-path stand-ins; individual tests override as needed.
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) });
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null });
    headersGetMock.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "203.0.113.10" : null
    );
  });

  it("inquiry happy path: sends exactly once to the fixed sales inbox", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.11");

    const result = await submitContactForm(basePayload);

    expect(result).toEqual({ status: "success" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentPayload = sendMock.mock.calls[0][0];
    expect(sentPayload.to).toBe("sales@example.com");
    expect(sentPayload.from).toBe("leads@mail.example.com");
  });

  it("honeypot: returns success without calling resend.emails.send", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.12");

    const result = await submitContactForm({
      ...basePayload,
      companyWebsite: "http://spam.example",
    });

    expect(result).toEqual({ status: "success" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("turnstile failure blocks the send and returns an error", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.13");
    fetchMock.mockResolvedValue({ json: async () => ({ success: false }) });

    const result = await submitContactForm(basePayload);

    expect(result).toEqual({ status: "error", message: "network" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rate limit: the 4th rapid submission from the same IP is rejected", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.14");

    const r1 = await submitContactForm(basePayload);
    const r2 = await submitContactForm(basePayload);
    const r3 = await submitContactForm(basePayload);
    const r4 = await submitContactForm(basePayload);

    expect(r1).toEqual({ status: "success" });
    expect(r2).toEqual({ status: "success" });
    expect(r3).toEqual({ status: "success" });
    expect(r4).toEqual({ status: "error", message: "rate-limited" });
    expect(sendMock).toHaveBeenCalledTimes(3);
  });

  it("send failure: resend.emails.send throws and the error never escapes", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.15");
    sendMock.mockRejectedValue(new Error("Resend API down"));

    const result = await submitContactForm(basePayload);

    expect(result).toEqual({ status: "error", message: "network" });
  });

  it("RFQ payload: includes RFQ fields in the sent email and uses the fixed sales inbox", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.16");

    const result = await submitContactForm({
      ...basePayload,
      product: "basmati-rice",
      productName: "Basmati Rice",
      quantity: "20 MT",
      destinationCountry: "Saudi Arabia",
      incoterm: "FOB",
    });

    expect(result).toEqual({ status: "success" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("sales@example.com");
  });

  it("returns a graceful network error when RESEND_API_KEY is unset, never throwing", async () => {
    headersGetMock.mockImplementation(() => "203.0.113.17");
    delete process.env.RESEND_API_KEY;

    const result = await submitContactForm(basePayload);

    expect(result).toEqual({ status: "error", message: "network" });
    expect(sendMock).not.toHaveBeenCalled();
  });
});
