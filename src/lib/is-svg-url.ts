// next.config.ts's image optimizer has a known failure mode on some remote
// SVGs (broken <img>, alt-text showing, even with dangerouslyAllowSVG) —
// this guards individual <Image> instances so SVG sources skip the
// optimizer while raster (PNG/JPG/WebP) media gets resized/converted
// normally. See T-104/DECISION_LOG D-32.
export function isSvgUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.split("?")[0].toLowerCase().endsWith(".svg");
}
