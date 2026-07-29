import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/motion/RevealItem";
import { sectionBg } from "./RenderBlocks";
import type { Page } from "../../../payload-types";

type ExportProcessData = Extract<NonNullable<Page["layout"]>[number], { blockType: "exportProcess" }>;

// Step count drives column count (same "count -> column class" lookup
// technique as FeatureGridBlock's lgColsClass), extended to a cap of 5.
function colsClass(count: number) {
  if (count >= 5) return "md:grid-cols-5";
  if (count === 4) return "md:grid-cols-4";
  if (count === 3) return "md:grid-cols-3";
  if (count === 2) return "md:grid-cols-2";
  return "md:grid-cols-1";
}

// UI-SPEC §2b ExportProcess — semantic <ol> inquiry-to-delivery sequence.
// Badges are literal "01".."05" strings (never Intl.NumberFormat) so they
// cannot leak Arabic-Indic digits on ar, by construction (D-05).
export async function ExportProcessBlock({
  block,
  index,
}: {
  block: ExportProcessData;
  index: number;
}) {
  const t = await getTranslations("blocks");
  const steps = block.steps ?? [];

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-center text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {steps.length === 0 ? (
          <p className="text-center text-body text-neutral-600">{t("emptyState")}</p>
        ) : (
          <ol className={`grid grid-cols-1 gap-lg sm:grid-cols-2 ${colsClass(steps.length)}`}>
            {steps.map((step, i) => (
              <li key={i}>
                {/* D-10: the one directional-slide surface this phase allows —
                    steps arrive from the inline-start edge, mirroring under
                    dir="rtl" via RevealItem's rtl: variant. lint:rtl cannot
                    catch a sign mistake here (translate-x-* isn't banned);
                    tests/e2e/rtl-arabic.spec.ts is the real gate. */}
                <RevealItem index={i} direction="start">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-700 text-body font-semibold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-md text-body font-semibold">{step.title}</p>
                  <p className="mt-xs text-label text-neutral-600">{step.body}</p>
                </RevealItem>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
