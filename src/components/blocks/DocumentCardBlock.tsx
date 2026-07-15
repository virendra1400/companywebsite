import { getTranslations } from "next-intl/server";
import { CertCard } from "./CertCard";
import { sectionBg } from "./RenderBlocks";
import type { Page, Media } from "../../../payload-types";

type DocumentCardData = Extract<NonNullable<Page["layout"]>[number], { blockType: "documentCard" }>;

// UI-SPEC Company/Compliance — the company-profile document card reuses
// CertCard's generic prop shape (name/subtitle/logo/pdf/halal/t) VERBATIM —
// no forked card markup. logo is always null (a plain document, not a
// certification logo); halal is always false. With `file` left absent,
// CertCard renders its existing PDF-absent "available on request" state —
// exactly T-02-08's intended honest placeholder, no new component needed.
export async function DocumentCardBlock({
  block,
  index,
}: {
  block: DocumentCardData;
  index: number;
}) {
  const t = await getTranslations("certs");
  const file = block.file && typeof block.file === "object" ? (block.file as Media) : null;

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl`}>
      <div className="mx-auto max-w-sm">
        <CertCard
          name={block.title}
          subtitle={block.description ?? undefined}
          logo={null}
          pdf={file}
          halal={false}
          t={(key) => t(key)}
        />
      </div>
    </section>
  );
}
