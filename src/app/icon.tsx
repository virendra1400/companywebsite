import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { getSiteBrand } from "@/lib/payload-fetch";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// CMS-driven favicon (SiteSettings.favicon). Falls back to the default VNP
// monogram — read from disk as a data URI rather than self-fetched over HTTP,
// since a server-side fetch back to the app's own origin during rendering is
// unreliable (deadlocks/fails silently in some runtimes). Arbitrary uploaded
// aspect ratios are letterboxed into the square via objectFit: contain.
export default async function Icon() {
  const { faviconUrl } = await getSiteBrand();
  let src = faviconUrl;
  if (!src) {
    const defaultIcon = await readFile(
      path.join(process.cwd(), "public/images/favicon-default.png")
    );
    src = `data:image/png;base64,${defaultIcon.toString("base64")}`;
  }

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
