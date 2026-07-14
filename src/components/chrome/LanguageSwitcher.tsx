"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// UI-SPEC — LanguageSwitcher: trigger shows current locale as its own-script
// endonym (never a flag). Menu lists all 4. Switching preserves the current
// path (T-01-12: usePathname is locale-agnostic + the fixed 4-locale
// allowlist, no user-supplied redirect target). 44px touch target;
// icon-only trigger requires aria-label. Globe icon never mirrors in RTL
// (UI-SPEC RTL Iconography — fixed-orientation list).
const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  ru: "Русский",
};

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("switcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={t("ariaLabel", { current: LOCALE_LABELS[locale] })}
          className={cn(
            "h-11 min-w-11 gap-xs px-sm text-label sm:px-md",
            onDark
              ? "text-white hover:bg-white/10 hover:text-white"
              : "text-neutral-900"
          )}
        >
          <Globe className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => router.replace(pathname, { locale: code })}
            className={code === locale ? "font-semibold text-primary-700" : undefined}
          >
            {LOCALE_LABELS[code]}
            {code === locale ? (
              <span aria-hidden="true" className="ms-auto text-accent-600">
                •
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
