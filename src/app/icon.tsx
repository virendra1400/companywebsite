import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { getSiteBrand } from "@/lib/payload-fetch";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

async function defaultIconDataUri(): Promise<string> {
  const bytes = await readFile(path.join(process.cwd(), "public/images/favicon-default.png"));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

// CMS-driven favicon (SiteSettings.favicon). Falls back to the default VNP
// monogram, read from disk as a data URI rather than self-fetched over HTTP
// (a server-side fetch back to the app's own origin during rendering is
// unreliable — deadlocks/fails silently in some runtimes).
//
// The CMS-uploaded image is a different story: Payload serves media through
// its own relative `/api/media/file/...` proxy route (see collections/Media.ts),
// which next/og's ImageResponse can't resolve on its own — it needs an
// absolute URL. Fetched here explicitly (with a real error boundary) rather
// than handed to Satori's `<img src>` loader, so a transient fetch failure
// falls back to the default instead of crashing the entire production build
// (this exact class of bug took prod down for several deploys already —
// Satori's fetch failure surfaced as a hard prerender error, not a soft one).
export default async function Icon() {
  const { faviconUrl } = await getSiteBrand();
  let src: string | null = null;

  if (faviconUrl) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const absoluteUrl = faviconUrl.startsWith("http") ? faviconUrl : `${siteUrl}${faviconUrl}`;
      const res = await fetch(absoluteUrl);
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "image/png";
        const bytes = Buffer.from(await res.arrayBuffer());
        src = `data:${contentType};base64,${bytes.toString("base64")}`;
      }
    } catch {
      // fall through to default below
    }
  }

  if (!src) src = await defaultIconDataUri();

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
