// Brand mark for the chrome: renders the CMS logo image when SiteSettings.logo
// is set, otherwise the text wordmark (siteName). One component, reused by
// header / footer / mobile so brand rendering stays consistent.
// `variant` controls the text-wordmark color. The logo image itself keeps its
// uploaded colors on light backgrounds; on dark (footer) it's forced to a
// white silhouette via CSS filter (brightness-0 invert) so any single
// uploaded asset stays legible on both backgrounds without a second upload.

import Image from "next/image";
import { isSvgUrl } from "@/lib/is-svg-url";

type BrandMarkProps = {
  siteName: string;
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  variant?: "light" | "dark"; // light = dark text (header/mobile), dark = white text (footer)
};

export function BrandMark({ siteName, logoUrl, logoWidth, logoHeight, variant = "light" }: BrandMarkProps) {
  if (logoUrl && logoWidth && logoHeight) {
    // T-104/D-32: explicit width/height (Payload/sharp-populated) lets next/image
    // optimize + resize this instead of shipping the raw upload — arbitrary
    // aspect ratio preserved via h-* + w-auto, same as the old plain <img>.
    return (
      <Image
        src={logoUrl}
        alt={siteName}
        width={logoWidth}
        height={logoHeight}
        unoptimized={isSvgUrl(logoUrl)}
        // T-209/DESIGN_SYSTEM §7: subtle hover micro-transition, same
        // 150ms timing as every other interactive element site-wide.
        className={
          variant === "dark"
            ? "h-14 w-auto brightness-0 invert transition-transform duration-150 hover:scale-105 motion-reduce:hover:scale-100 lg:h-16"
            : "h-14 w-auto transition-transform duration-150 hover:scale-105 motion-reduce:hover:scale-100 lg:h-16"
        }
      />
    );
  }
  if (logoUrl) {
    // Width/height metadata missing (older upload predating this field, or a
    // non-image-derived value) — fall back to the plain <img> rather than
    // fail to render the logo at all.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt={siteName}
        className={
          variant === "dark"
            ? "h-14 w-auto brightness-0 invert transition-transform duration-150 hover:scale-105 motion-reduce:hover:scale-100 lg:h-16"
            : "h-14 w-auto transition-transform duration-150 hover:scale-105 motion-reduce:hover:scale-100 lg:h-16"
        }
      />
    );
  }
  return (
    <span
      dir="ltr"
      className={
        variant === "dark"
          ? "text-heading font-semibold text-white"
          : "text-heading font-semibold text-primary-700"
      }
    >
      {siteName}
    </span>
  );
}
