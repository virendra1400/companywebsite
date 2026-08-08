import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "@/lib/analytics";

describe("trackEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns without throwing when no window exists", () => {
    vi.stubGlobal("window", undefined);

    expect(() => trackEvent("whatsapp_click", { location: "header" })).not.toThrow();
  });

  it("pushes an object with event=name and the params onto window.dataLayer", () => {
    const push = vi.fn();
    vi.stubGlobal("window", { dataLayer: { push } });

    trackEvent("whatsapp_click", { product: "x" });

    expect(push).toHaveBeenCalledWith({ event: "whatsapp_click", product: "x" });
  });

  it("calls window.plausible with the event name and props when dataLayer is absent", () => {
    const plausible = vi.fn();
    vi.stubGlobal("window", { plausible });

    trackEvent("rfq_submit", { product: "y" });

    expect(plausible).toHaveBeenCalledWith("rfq_submit", { props: { product: "y" } });
  });

  it("only forwards the given non-PII params, never arbitrary extra data", () => {
    const push = vi.fn();
    vi.stubGlobal("window", { dataLayer: { push } });

    trackEvent("inquiry_submit", { location: "mobile-nav" });

    expect(push).toHaveBeenCalledWith({ event: "inquiry_submit", location: "mobile-nav" });
    expect(push).toHaveBeenCalledTimes(1);
  });

  // T-202: spec_download added for the /resources hub's document rows.
  it("dispatches the spec_download event same as any other EventName", () => {
    const plausible = vi.fn();
    vi.stubGlobal("window", { plausible });

    trackEvent("spec_download", { title: "Company Profile" });

    expect(plausible).toHaveBeenCalledWith("spec_download", { props: { title: "Company Profile" } });
  });
});
