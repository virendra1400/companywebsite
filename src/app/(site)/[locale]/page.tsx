import { setRequestLocale, getTranslations, getFormatter } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const format = await getFormatter();
  // FOUND-03: force Western (latn) digits — Intl defaults `ar` to Arabic-Indic.
  const buyers = format.number(60, "latn");

  return (
    <main>
      <section
        data-testid="hero"
        className="relative flex min-h-[70dvh] flex-col justify-center bg-primary-900 px-md py-3xl text-white md:px-lg xl:px-xl"
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-lg text-start">
          <h1 className="max-w-2xl text-display font-semibold text-white">
            {t("hero.headline")}
          </h1>
          <p className="max-w-xl text-body text-primary-100">
            {t("hero.subhead")}
          </p>
          <a
            href="mailto:sales@staragrevolution.com"
            className="inline-flex items-center rounded-md bg-primary-700 px-lg py-sm text-body font-semibold text-white transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            {t("hero.cta")}
          </a>
          <p
            data-testid="sample-count"
            className="text-label text-primary-100"
          >
            {t("sample.count", { count: buyers })}
          </p>
        </div>
      </section>
    </main>
  );
}
