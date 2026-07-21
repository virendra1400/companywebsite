import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { MobileNavPanel } from "@/components/chrome/MobileNavPanel";
import { BrandMark } from "@/components/chrome/BrandMark";
import { WhatsAppCta } from "@/components/chrome/WhatsAppCta";
import { getSiteBrand } from "@/lib/payload-fetch";

// UI-SPEC Component Inventory — GlobalHeader: 72px desktop / 64px mobile,
// logical flex row (wordmark inline-start -> nav (>=lg) -> switcher -> CTA
// inline-end). Auto-reverses in RTL via dir + logical flex, no manual
// mirroring code.
// D-08: full nav set, wired to real /<slug> routes (home is "/"). D-06:
// `products` now resolves to the real Phase 3 catalog route.
const NAV_KEYS = [
  "home",
  "about",
  "products",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "contact",
] as const;

const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  home: "/",
  about: "/about",
  products: "/products",
  certifications: "/certifications",
  manufacturing: "/manufacturing",
  export: "/export",
  company: "/company",
  contact: "/contact",
};

export async function GlobalHeader({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl: string | null;
}) {
  const t = await getTranslations("nav");
  const tHero = await getTranslations("hero");
  const tContact = await getTranslations("contact");
  const { waHref } = await getSiteBrand();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-neutral-300 bg-white px-md lg:h-[72px] lg:px-xl">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-lg">
        <Link href="/" className="shrink-0">
          {/* Brand: CMS logo if set, else text wordmark. RTL contract — never mirrors. */}
          <BrandMark siteName={siteName} logoUrl={logoUrl} variant="light" />
        </Link>

        <nav className="hidden items-center gap-lg xl:flex" aria-label="Primary">
          {NAV_KEYS.map((key) => (
            <Link
              key={key}
              href={NAV_HREFS[key]}
              className="text-label text-neutral-900 underline-offset-4 hover:text-primary-700 hover:underline decoration-accent-600"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-sm">
          <LanguageSwitcher />
          <WhatsAppCta
            iconOnly
            href={waHref}
            ariaLabel={tContact("whatsappAria")}
            className="hidden size-11 border-primary-700 text-primary-700 hover:bg-primary-100 focus-visible:ring-accent-600 sm:inline-flex"
          />
          <Button
            asChild
            size="sm"
            className="hidden hover:bg-primary-500 focus-visible:ring-accent-600 sm:inline-flex"
          >
            <Link href="/contact">{tHero("cta")}</Link>
          </Button>
          <MobileNavPanel siteName={siteName} logoUrl={logoUrl} waHref={waHref} />
        </div>
      </div>
    </header>
  );
}
