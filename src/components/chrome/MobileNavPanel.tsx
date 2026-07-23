"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RTL_LOCALES } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { BrandMark } from "@/components/chrome/BrandMark";
import { WhatsAppCta } from "@/components/chrome/WhatsAppCta";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// UI-SPEC — MobileNavPanel: hamburger (44px touch target) opens a slide-out
// panel from the logical inline-end edge — visually left in RTL, right in
// LTR (FOUND-05). The Sheet primitive's `side` prop only accepts literal
// left/right, so direction is derived here from the active locale rather
// than a hardcoded value, satisfying the logical-edge requirement at the
// call site. aria-label/aria-expanded reflect open state via chrome strings.
// D-08 nav set wired to real /<slug> routes; D-06: `products` now resolves
// to the real Phase 3 catalog route.
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

export function MobileNavPanel({
  siteName,
  logoUrl,
  waHref,
}: {
  siteName: string;
  logoUrl: string | null;
  waHref: string;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("nav");
  const tMobile = useTranslations("mobileNav");
  const tHero = useTranslations("hero");
  const tContact = useTranslations("contact");
  const side = RTL_LOCALES.has(locale) ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={open ? tMobile("closeMenu") : tMobile("openMenu")}
          aria-expanded={open}
          data-testid="mobile-nav-trigger"
          className="size-11 xl:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        data-testid="mobile-nav-panel"
        data-side={side}
        className="flex flex-col gap-lg p-lg"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-heading">
            <BrandMark siteName={siteName} logoUrl={logoUrl} variant="light" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-md" aria-label="Primary">
          {NAV_KEYS.map((key) => (
            <Link
              key={key}
              href={NAV_HREFS[key]}
              className="text-label text-neutral-900"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher />
        <WhatsAppCta
          href={waHref}
          label={tContact("whatsappLabel")}
          ariaLabel={tContact("whatsappAria")}
          onNavigate={() => setOpen(false)}
          className="w-full"
        />
        <Button asChild className="hover:bg-primary-500 focus-visible:ring-accent-600">
          <Link href="/contact">{tHero("cta")}</Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
