"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackEvent } from "@/lib/analytics";

// Thin client boundary so plain WhatsApp <a href={waHref}> links inside server
// components (Hero/CTABand/ContactBlock) can fire whatsapp_click (LEAD-07)
// without turning each block into a client component. Only fires when the
// resolved href is actually a wa.me link — CTABandBlock's CTA slots are
// generic Payload-authored links, not always WhatsApp.
export function WhatsAppTrackedLink({
  href,
  location,
  ...props
}: ComponentPropsWithoutRef<"a"> & { href: string; location: string }) {
  return (
    <a
      href={href}
      onClick={() => {
        if (href.startsWith("https://wa.me/")) trackEvent("whatsapp_click", { location });
      }}
      {...props}
    />
  );
}
