import { ImageResponse } from "next/og";
import { getSiteBrand } from "@/lib/payload-fetch";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// CMS-driven favicon (SiteSettings.favicon). Falls back to the default VNP
// monogram when no editor upload exists. Arbitrary uploaded aspect ratios are
// letterboxed into the square via objectFit: contain rather than stretched.
export default async function Icon() {
  const { faviconUrl } = await getSiteBrand();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const src = faviconUrl || `${siteUrl}/images/favicon-default.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          width={size.width}
          height={size.height}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
