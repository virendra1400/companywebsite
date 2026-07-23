import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import { routing, RTL_LOCALES } from "@/i18n/routing";
import { GlobalHeader } from "@/components/chrome/GlobalHeader";
import { GlobalFooter } from "@/components/chrome/GlobalFooter";
import { getSiteBrand } from "@/lib/payload-fetch";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import "../../globals.css";

// SEO-01/SEO-05: metadataBase cascades to every descendant generateMetadata's
// relative/absolute URL fields (openGraph.images, alternates). Pitfall 4:
// localhost fallback is dev-only — NEXT_PUBLIC_SITE_URL MUST be set in prod
// (user_setup) or every canonical/OG URL silently resolves to localhost.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { template: "%s · Star Agrevolution", default: "Star Agrevolution" },
  description:
    "Star Agrevolution — a trusted India-based manufacturer and exporter of premium agricultural and food products, serving importers and distributors worldwide.",
};

// Per-script fonts — only the needed subset ships per locale (FOUND-03 / UI-SPEC).
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-plex-sans-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // T-01-01: reject any locale outside the 4-locale allowlist before rendering.
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  const fontVar = locale === "ar" ? plexSansArabic.variable : plexSans.variable;
  const { siteName, logoUrl, address, sameAs } = await getSiteBrand();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // ANALY-01: Plausible chosen (checkpoint decision, 04-05) — cookieless, no
  // consent banner needed. Guarded so dev/CI render without the env var.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang={locale} dir={dir} className={fontVar}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        {/* SEO-04: Organization JSON-LD once per page (not per product) — the
            single shared <JsonLd> escaper applies the mandatory XSS escaping
            (T-05-03). */}
        <JsonLd data={organizationJsonLd({ siteName, url: siteUrl, logoUrl, address, sameAs })} />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        <NextIntlClientProvider>
          <GlobalHeader siteName={siteName} logoUrl={logoUrl} />
          <div className="flex-1">{children}</div>
          <GlobalFooter siteName={siteName} logoUrl={logoUrl} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
