import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation. Plan 03 LanguageSwitcher consumes usePathname + useRouter
// to preserve the current path across locale switches (FOUND-04).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
