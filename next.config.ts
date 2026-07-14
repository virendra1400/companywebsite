import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points at src/i18n/request.ts by default (src-dir layout).
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
