"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RTL_LOCALES } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
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
const NAV_KEYS = ["products", "certifications", "manufacturing", "contact"] as const;

export function MobileNavPanel() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("nav");
  const tMobile = useTranslations("mobileNav");
  const tHero = useTranslations("hero");
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
          className="size-11 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="flex flex-col gap-lg p-lg">
        <SheetHeader className="p-0">
          <SheetTitle className="text-heading">
            <span dir="ltr">Star Agrevolution</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-md" aria-label="Primary">
          {NAV_KEYS.map((key) => (
            <a
              key={key}
              href="#"
              className="text-label text-neutral-900"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </a>
          ))}
        </nav>
        <LanguageSwitcher />
        <Button asChild className="hover:bg-primary-500 focus-visible:ring-accent-600">
          <a href="mailto:sales@staragrevolution.com">{tHero("cta")}</a>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
