import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted per the codebase's vi.mock-before-dynamic-import discipline
// (tests/int/pages-revalidate-hook.spec.ts) — stub global fetch before
// notifyCrm is imported so no real network call ever fires.
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const { notifyCrm } = await import("@/lib/crm-webhook");

describe("notifyCrm", () => {
  const originalUrl = process.env.CRM_WEBHOOK_URL;

  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.CRM_WEBHOOK_URL;
    } else {
      process.env.CRM_WEBHOOK_URL = originalUrl;
    }
  });

  it("does not call fetch and does not throw when CRM_WEBHOOK_URL is unset", async () => {
    delete process.env.CRM_WEBHOOK_URL;

    await expect(notifyCrm({ name: "Jane" })).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("POSTs the payload as JSON to CRM_WEBHOOK_URL when set", async () => {
    process.env.CRM_WEBHOOK_URL = "https://crm.example.com/hook";
    fetchMock.mockResolvedValueOnce({ ok: true });

    const payload = { name: "Jane", message: "Interested in bulk rice." };
    await notifyCrm(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/hook");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual(payload);
  });

  it("swallows a fetch rejection and never throws", async () => {
    process.env.CRM_WEBHOOK_URL = "https://crm.example.com/hook";
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(notifyCrm({ name: "Jane" })).resolves.toBeUndefined();
  });
});
