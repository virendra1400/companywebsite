import type { MetadataRoute } from "next";

// Pitfall 4: real prod base URL comes from Vercel env; localhost fallback is
// dev-only. NEVER let this default ship to a production sitemap pointer.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// T-05-05: keep Payload's admin UI and auto-generated REST/GraphQL endpoints
// out of the crawl index — without this they are crawlable by default.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
