import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";

// UI-SPEC Component Inventory — GlobalFooter: primary-900 surface, white/
// neutral-100 text, gold hover-underline links. Phase 1 content: wordmark
// repeat, placeholder link stubs (anchor #, real pages ship Phase 2),
// switcher repeat, copyright. Single column mobile -> logical row desktop.
const NAV_KEYS = ["products", "certifications", "manufacturing", "contact"] as const;

export async function GlobalFooter() {
  const t = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 px-md py-2xl text-neutral-100 md:px-lg xl:px-xl">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-lg lg:flex-row lg:items-start lg:justify-between">
        <Link href="/" className="shrink-0">
          <span dir="ltr" className="text-heading font-semibold text-white">
            Star Agrevolution
          </span>
        </Link>

        <nav
          className="flex flex-col gap-sm text-label sm:flex-row sm:gap-lg"
          aria-label="Footer"
        >
          {NAV_KEYS.map((key) => (
            <a
              key={key}
              href="#"
              className="text-neutral-100 underline-offset-4 hover:text-accent-600 hover:underline"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <LanguageSwitcher onDark />
      </div>

      <p className="mx-auto mt-xl w-full max-w-[1280px] text-label text-neutral-300">
        {`© ${year} Star Agrevolution. All rights reserved.`}
      </p>
    </footer>
  );
}
