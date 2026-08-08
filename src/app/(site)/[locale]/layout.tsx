import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Fraunces, Archivo, IBM_Plex_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import { routing, RTL_LOCALES, type Locale } from "@/i18n/routing";
import { GlobalHeader } from "@/components/chrome/GlobalHeader";
import { GlobalFooter } from "@/components/chrome/GlobalFooter";
import { WhatsAppFloatingButton } from "@/components/chrome/WhatsAppFloatingButton";
import { getSiteBrand } from "@/lib/payload-fetch";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import "../../globals.css";

// SEO-01/SEO-05: metadataBase cascades to every descendant generateMetadata's
// relative/absolute URL fields (openGraph.images, alternates). Pitfall 4:
// localhost fallback is dev-only — NEXT_PUBLIC_SITE_URL MUST be set in prod
// (user_setup) or every canonical/OG URL silently resolves to localhost.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { template: "%s · VNP Global", default: "VNP Global" },
  description:
    "VNP Global — a trusted India-based manufacturer and exporter of premium agricultural and food products, serving importers and distributors worldwide.",
};

// Per-script fonts — only the needed subset ships per locale (FOUND-03 / UI-SPEC).
// T-101: Latin body font moved from IBM Plex Sans to Archivo per
// DESIGN_SYSTEM §3 ("sturdy grotesque... distinct from Inter-default").
// Arabic keeps IBM Plex Sans Arabic — DESIGN_SYSTEM §3 explicitly pairs
// Fraunces/Archivo with Plex Arabic for the future Arabic build, not a
// second Latin-only swap.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-plex-sans-arabic",
  display: "swap",
});
// T-101: Latin-only display face, locale-scoped below so it never reaches
// Arabic content — was Geist (Phase 6 D-02), now Fraunces per DESIGN_SYSTEM
// §3 ("Display/headings: Fraunces... distances VNP from generic exporter
// sites"). Weight 500 matches the display-tier token weight (globals.css).
const frauncesDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-geist-display",
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
  const fontVar = locale === "ar" ? plexSansArabic.variable : archivo.variable;
  // Phase 6 (D-02): never set on ar — --font-display falls back to --font-sans.
  const displayVar = locale === "ar" ? "" : frauncesDisplay.variable;
  const {
    siteName,
    logoUrl,
    logoWidth,
    logoHeight,
    address,
    factoryAddress,
    legalIdentity,
    sameAs,
    email,
    phone,
  } = await getSiteBrand();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // ANALY-01: Plausible chosen (checkpoint decision, 04-05) — cookieless, no
  // consent banner needed. Guarded so dev/CI render without the env var.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang={locale} dir={dir} className={`${fontVar} ${displayVar}`.trim()}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        {/* SEO-04: Organization JSON-LD once per page (not per product) — the
            single shared <JsonLd> escaper applies the mandatory XSS escaping
            (T-05-03). */}
        <JsonLd
          data={organizationJsonLd({ siteName, url: siteUrl, logoUrl, address, sameAs, email, phone })}
        />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        <NextIntlClientProvider>
          <GlobalHeader
            siteName={siteName}
            logoUrl={logoUrl}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            locale={locale as Locale}
          />
          <div className="flex-1">{children}</div>
          <WhatsAppFloatingButton />
          <GlobalFooter
            siteName={siteName}
            logoUrl={logoUrl}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            sameAs={sameAs}
            email={email}
            phone={phone}
            address={address}
            factoryAddress={factoryAddress}
            legalIdentity={legalIdentity}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
