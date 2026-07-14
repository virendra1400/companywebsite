import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude api, admin (Payload panel, Plan 02), Next internals, and dotted
  // files so the locale middleware never rewrites those surfaces.
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
