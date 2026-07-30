// Brand mark for the chrome: renders the CMS logo image when SiteSettings.logo
// is set, otherwise the text wordmark (siteName). One component, reused by
// header / footer / mobile so brand rendering stays consistent.
// `variant` controls the text-wordmark color. The logo image itself keeps its
// uploaded colors on light backgrounds; on dark (footer) it's forced to a
// white silhouette via CSS filter (brightness-0 invert) so any single
// uploaded asset stays legible on both backgrounds without a second upload.

type BrandMarkProps = {
  siteName: string;
  logoUrl: string | null;
  variant?: "light" | "dark"; // light = dark text (header/mobile), dark = white text (footer)
};

export function BrandMark({ siteName, logoUrl, variant = "light" }: BrandMarkProps) {
  if (logoUrl) {
    // Logo served from Blob CDN (unoptimized per next.config); plain <img> keeps
    // arbitrary aspect ratios simple. Height-constrained, width auto.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt={siteName}
        className={
          variant === "dark"
            ? "h-14 w-auto brightness-0 invert lg:h-16"
            : "h-14 w-auto lg:h-16"
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
