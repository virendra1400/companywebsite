import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { BrandMark } from "@/components/chrome/BrandMark";
import { resolveSocialLinks } from "@/components/chrome/social-links";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";

// UI-SPEC Component Inventory — GlobalFooter: primary-900 surface, white/
// neutral-100 text, gold hover-underline links. Wordmark repeat, D-08 nav
// wired to real /<slug> routes, switcher repeat, copyright. Single column
// mobile -> logical row desktop. D-06: `products` now wired to /products.
// Footer is the comprehensive discovery surface — it carries every page,
// including the secondary ones trimmed from the primary header nav (Insights,
// Manufacturing, Company) so nothing is orphaned on desktop.
const NAV_KEYS = [
  "home",
  "about",
  "products",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "insights",
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
  insights: "/insights",
  contact: "/contact",
};

export async function GlobalFooter({
  siteName,
  logoUrl,
  sameAs,
}: {
  siteName: string;
  logoUrl: string | null;
  sameAs: string[];
}) {
  const t = await getTranslations("nav");
  const year = new Date().getFullYear();
  const socials = resolveSocialLinks(sameAs);

  return (
    <footer className="bg-primary-900 px-md py-2xl text-neutral-100 md:px-lg xl:px-xl">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-lg lg:flex-row lg:items-start lg:justify-between">
        <Link href="/" className="shrink-0">
          <BrandMark siteName={siteName} logoUrl={logoUrl} variant="dark" />
        </Link>

        <nav
          className="flex flex-col gap-sm text-label sm:flex-row sm:flex-wrap sm:gap-lg"
          aria-label="Footer"
        >
          {NAV_KEYS.map((key) => (
            <Link
              key={key}
              href={NAV_HREFS[key]}
              className="text-neutral-100 underline-offset-4 hover:text-accent-600 hover:underline"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <LanguageSwitcher onDark />
      </div>

      {socials.length > 0 ? (
        <div className="mx-auto mt-lg flex w-full max-w-[1280px] gap-sm">
          {socials.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-neutral-100 hover:text-accent-600"
            >
              {s.platform === "instagram" ? (
                <InstagramIcon className="h-5 w-5" />
              ) : (
                <LinkedInIcon className="h-5 w-5" />
              )}
            </a>
          ))}
        </div>
      ) : null}

      <p className="mx-auto mt-xl w-full max-w-[1280px] text-label text-neutral-300">
        {`© ${year} ${siteName}. All rights reserved.`}
      </p>
    </footer>
  );
}
