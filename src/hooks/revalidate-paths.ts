import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

// Single place that knows how a public path maps to ISR cache entries.
//
// The subtlety that caused a real, long-lived bug: routing uses
// `localePrefix: "as-needed"`, so the default locale is served unprefixed —
// /about returns 200 and /en/about 307s back to it. But the underlying route
// is `[locale]/[slug]`, and middleware REWRITES /about to /en/about
// internally, so the cache entry Next stores is keyed on the rewritten path.
// Every hook here previously revalidated "/about", "/ar/about", "/fr/about",
// "/ru/about" and never "/en/about" — the non-default locales worked, English
// never did. Symptom: an editor saves in the admin, the write lands correctly,
// the hook runs without error, and the English page keeps serving stale HTML
// until either the 3600s TTL expires or a redeploy rebuilds it. Diagnosed
// 2026-08-09 after `age` on /about climbed past 900s with no regeneration
// following a confirmed save.
//
// Revalidating a path with no cache entry is a harmless no-op, so emitting
// both the prefixed and unprefixed form is safe.
export function revalidateLocalizedPath(path: string) {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  for (const locale of routing.locales) {
    const prefixed = `/${locale}${clean}`;
    revalidatePath(prefixed);
    // The default locale is also reachable unprefixed — purge that entry too.
    if (locale === routing.defaultLocale) revalidatePath(clean === "" ? "/" : clean);
  }
}

// Layout-level bust, for changes rendered in shared chrome (header/footer) on
// every page rather than on one route.
export function revalidateLocalizedLayout() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
    if (locale === routing.defaultLocale) revalidatePath("/", "layout");
  }
}
