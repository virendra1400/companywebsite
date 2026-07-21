"use client";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { trackEvent } from "@/lib/analytics";

// Single shared WhatsApp CTA — every site-chrome WhatsApp entry point (header
// icon button, mobile-nav sheet) renders through this one component so
// whatsapp_click (LEAD-07/D-06) fires from exactly one call site.
export function WhatsAppCta({
  href,
  label,
  ariaLabel,
  iconOnly = false,
  className,
  onNavigate,
}: {
  href: string;
  label?: string;
  ariaLabel: string;
  iconOnly?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      className={className}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={() => {
          trackEvent("whatsapp_click", { location: iconOnly ? "header" : "mobile-nav" });
          onNavigate?.();
        }}
      >
        <WhatsAppIcon className="size-4" />
        {iconOnly ? null : label}
      </a>
    </Button>
  );
}
