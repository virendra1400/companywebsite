import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { MobileNavPanel } from "@/components/chrome/MobileNavPanel";
import { BrandMark } from "@/components/chrome/BrandMark";
import { WhatsAppCta } from "@/components/chrome/WhatsAppCta";
import { HeaderShell } from "@/components/chrome/HeaderShell";
import { ProductsMegaMenu } from "@/components/chrome/ProductsMegaMenu";
import { getSiteBrand, getProductsByCategory } from "@/lib/payload-fetch";
import type { Locale } from "@/i18n/routing";

// UI-SPEC Component Inventory — GlobalHeader: 72px desktop / 64px mobile,
// logical flex row (wordmark inline-start -> nav (>=lg) -> switcher -> CTA
// inline-end). Auto-reverses in RTL via dir + logical flex, no manual
// mirroring code.
// Primary nav = 4 curated items + the Products mega-menu (T-102/C-02: brief:
// Products, About, Global Markets, Certifications, Contact). The logo covers
// Home; the "Request a Quote" button covers the conversion path. Secondary
// pages (Manufacturing, Company, Insights) stay reachable via the footer +
// mobile drawer — no orphans.
const NAV_KEYS = ["about", "export", "certifications", "contact"] as const;

const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  about: "/about",
  export: "/export",
  certifications: "/certifications",
  contact: "/contact",
};

export async function GlobalHeader({
  siteName,
  logoUrl,
  logoWidth,
  logoHeight,
  locale,
}: {
  siteName: string;
  logoUrl: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  locale: Locale;
}) {
  const t = await getTranslations("nav");
  const tHero = await getTranslations("hero");
  const tContact = await getTranslations("contact");
  const tProducts = await getTranslations("products");
  const { waHref } = await getSiteBrand();
  const grouped = await getProductsByCategory(locale);
  const megaMenuCategories = grouped
    .filter(({ products }) => products.length > 0)
    .map(({ category, products }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      products: products.map((p) => ({ slug: p.slug, name: p.name })),
    }));

  return (
    <HeaderShell>
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-lg">
        <Link href="/" className="shrink-0">
          {/* Brand: CMS logo if set, else text wordmark. RTL contract — never mirrors. */}
          <BrandMark
            siteName={siteName}
            logoUrl={logoUrl}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            variant="light"
          />
        </Link>

        <nav className="hidden items-center gap-lg xl:flex" aria-label="Primary">
          {megaMenuCategories.length > 0 ? (
            <ProductsMegaMenu
              label={t("products")}
              categories={megaMenuCategories}
              allProductsLabel={tProducts("viewAll")}
            />
          ) : (
            <Link
              href="/products"
              className="text-label text-neutral-900 underline-offset-4 hover:text-primary-700 hover:underline decoration-accent-600"
            >
              {t("products")}
            </Link>
          )}
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
            className="hidden size-11 border-primary-700 text-primary-700 hover:bg-primary-100 sm:inline-flex"
          />
          {/* 08-UI-SPEC Contract §4: brand hover + accent ring now inherited from the Button primitive */}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/contact">{tHero("cta")}</Link>
          </Button>
          <MobileNavPanel
            siteName={siteName}
            logoUrl={logoUrl}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            waHref={waHref}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
