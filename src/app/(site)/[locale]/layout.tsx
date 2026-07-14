import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { routing, RTL_LOCALES } from "@/i18n/routing";
import "../../globals.css";

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

  return (
    <html lang={locale} dir={dir} className={fontVar}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
