import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

// Points at src/i18n/request.ts by default (src-dir layout).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // ponytail: bypass the Next image optimizer — serve media originals
    // directly from Vercel Blob's CDN. The optimizer failed on remote SVG
    // cert/product/avatar logos (broken <img>, alt-text showing) even with
    // dangerouslyAllowSVG; unoptimized sidesteps the SVG-optimizer failure and
    // any remote-host allowlist mismatch. Media is small placeholder art + CMS
    // uploads; Blob is CDN-backed. Phase 6 (PERF): re-enable optimizer for
    // RASTER media once real photography lands, keep SVG logos unoptimized.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withPayload(withNextIntl(nextConfig));
