// Brand mark for the chrome: renders the CMS logo image when SiteSettings.logo
// is set, otherwise the text wordmark (siteName). One component, reused by
// header / footer / mobile so brand rendering stays consistent.
// `variant` controls the text-wordmark color; the logo image is color-agnostic.

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
    return <img src={logoUrl} alt={siteName} className="h-11 w-auto sm:h-12 lg:h-14" />;
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
