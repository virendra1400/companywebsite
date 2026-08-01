import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

// Points at src/i18n/request.ts by default (src-dir layout).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // T-104/D-32: optimizer re-enabled for raster media now that real
    // photography has landed (D-27) — the global `unoptimized: true` here
    // was shipping full-resolution PNGs (2-2.3MB hero/logo) with zero
    // resize/format-conversion, which measured as a 29s mobile LCP on
    // production Lighthouse. SVG sources still skip the optimizer via the
    // per-instance `unoptimized={isSvgUrl(...)}` guard (src/lib/is-svg-url.ts)
    // on every <Image> consuming CMS/Payload media — the optimizer's known
    // remote-SVG failure mode (broken image, alt-text showing) is the reason
    // this was disabled globally in the first place.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withPayload(withNextIntl(nextConfig));
