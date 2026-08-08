"use client";

// Provider-agnostic analytics wrapper (LEAD-07/D-06/ANALY-01). Every
// WhatsApp/RFQ/inquiry/download call site imports trackEvent — never
// gtag/dataLayer/window.plausible directly. Plausible was chosen (D-49,
// checkpoint 04-05) and is mounted in [locale]/layout.tsx guarded by
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN — this wrapper stays provider-agnostic
// anyway so a future vendor swap still wouldn't touch call sites.
export type EventName = "rfq_submit" | "inquiry_submit" | "whatsapp_click" | "spec_download";

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
