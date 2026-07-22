import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

export interface BuildMetadataInput {
  title: string;
  description: string;
  imageUrl?: string | null;
  translatedLocales: Locale[];
  path: string;
}

// SEO-01: pure, synchronous composer — callers resolve title/description/
// imageUrl/translatedLocales first (via getPageContent/getProduct +
// getTranslatedLocales), this just assembles the Next.js Metadata shape and
// delegates hreflang/canonical to buildAlternates (single source of truth,
// same output feeds sitemap.ts entries — SEO-02 consistency requirement).
export function buildMetadata({
  title,
  description,
  imageUrl,
  translatedLocales,
  path,
}: BuildMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: buildAlternates(translatedLocales, path),
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}
