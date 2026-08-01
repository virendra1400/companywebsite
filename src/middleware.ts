import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// T-003/D-17: the persistent Vercel staging aliases must never serve
// indexable duplicate content — redirect them to the real domain instead of
// relying solely on Vercel dashboard deployment-protection settings, which
// this repo has no CLI access to toggle. Scoped to the two KNOWN persistent
// aliases only (not the *.vercel.app pattern broadly), so ephemeral preview
// deployment URLs used for pre-merge verification are unaffected.
const STAGING_HOSTS = new Set([
  "star-agrevolution.vercel.app",
  "star-agrevolution-git-main-virendra1400.vercel.app",
]);

export default function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (host && STAGING_HOSTS.has(host)) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, "https://vnpglobal.in");
    return NextResponse.redirect(url, 301);
  }
  return intlMiddleware(request);
}

export const config = {
  // Exclude api, admin (Payload panel, Plan 02), Next internals, dotted
  // files, and the dynamic icon.tsx route (no extension in its URL, so it
  // isn't caught by the dot exclusion above) so the locale middleware never
  // rewrites those surfaces.
  matcher: "/((?!api|admin|_next|_vercel|icon|.*\\..*).*)",
};
