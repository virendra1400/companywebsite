import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { MobileNavPanel } from "@/components/chrome/MobileNavPanel";

// UI-SPEC Component Inventory — GlobalHeader: 72px desktop / 64px mobile,
// logical flex row (wordmark inline-start -> nav placeholders (>=lg) ->
// switcher -> CTA inline-end). Auto-reverses in RTL via dir + logical flex,
// no manual mirroring code.
const NAV_KEYS = ["products", "certifications", "manufacturing", "contact"] as const;

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

        <nav className="hidden items-center gap-lg lg:flex" aria-label="Primary">
          {NAV_KEYS.map((key) => (
            <a
              key={key}
              href="#"
              className="text-label text-neutral-900 underline-offset-4 hover:text-primary-700 hover:underline decoration-accent-600"
            >
              {t(key)}
            </a>
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
