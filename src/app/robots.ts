import type { MetadataRoute } from "next";

// Pitfall 4: real prod base URL comes from Vercel env; localhost fallback is
// dev-only. NEVER let this default ship to a production sitemap pointer.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// T-05-05: keep Payload's admin UI and auto-generated REST/GraphQL endpoints
// out of the crawl index — without this they are crawlable by default.
// T-204: `/api/media/*` is carved back out — it's where every uploaded
// image (product photos, hero, logo, cert logos) is actually served from
// (see payload-fetch.ts's Media.url), so blanket-disallowing `/api` was
// silently blocking Google Image Search from indexing any site image.
// Crawlers match the longest/most-specific rule, so an `/api/media` allow
// wins over the broader `/api` disallow for that one subpath.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/media"],
      disallow: ["/admin", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
