"use client";

// Provider-agnostic analytics wrapper (LEAD-07/D-06/ANALY-01). Every
// WhatsApp/RFQ/inquiry call site imports trackEvent — never gtag/dataLayer/
// window.plausible directly — so the vendor decision (GA4+GTM vs Plausible,
// still deferred) can land later without touching call sites.
export type EventName = "rfq_submit" | "inquiry_submit" | "whatsapp_click";

declare global {
  interface Window {
    dataLayer?: { push: (event: Record<string, unknown>) => void };
    plausible?: (name: string, options?: { props: Record<string, string> }) => void;
  }
}

export function trackEvent(name: EventName, params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({ event: name, ...params });
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(name, { props: params });
    return;
  }

  // No vendor mounted yet (dev, or vendor decision still pending) — no-op.
}
