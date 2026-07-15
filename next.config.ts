import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

// Points at src/i18n/request.ts by default (src-dir layout).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to load media from Vercel Blob (prod). Host is dynamic
    // per store, so allow the public blob domain. Local dev serves media
    // same-origin from disk (no pattern needed).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // Cert logos / uploads are often SVG; next/image blocks SVG by default.
    // CMS-uploaded by trusted staff; Next's sandbox CSP + attachment
    // disposition neutralize embedded script. Revisit if untrusted users ever
    // gain upload access.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withPayload(withNextIntl(nextConfig));
