import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { MobileNavPanel } from "@/components/chrome/MobileNavPanel";

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

export async function GlobalHeader() {
  const t = await getTranslations("nav");
  const tHero = await getTranslations("hero");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-neutral-300 bg-white px-md lg:h-[72px] lg:px-xl">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-lg">
        <Link href="/" className="shrink-0">
          {/* Brand wordmark: RTL contract — never mirrors/reorders, even in ar. */}
          <span dir="ltr" className="text-heading font-semibold text-primary-700">
            Star Agrevolution
          </span>
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
          <Button
            asChild
            size="sm"
            className="hidden hover:bg-primary-500 focus-visible:ring-accent-600 sm:inline-flex"
          >
            <a href="mailto:sales@staragrevolution.com">{tHero("cta")}</a>
          </Button>
          <MobileNavPanel />
        </div>
      </div>
    </header>
  );
}
