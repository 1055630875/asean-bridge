import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Ui";
import { CountryIndex } from "@/components/CountryIndex";
import { isLang, t, LANGS, type Lang } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/data";

const KICKER: Record<Lang, string> = {
  zh: "十国档案 / TEN MARKETS",
  en: "TEN MARKETS / DOSSIERS",
  id: "SEPULUH NEGARA / DOKUMEN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return { title: t(lang, "nav.countries") };
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function CountriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const titleParts = t(lang, "home.countriesTitle").split(
    lang === "zh" ? "，" : ",",
  );

  return (
    <Container>
      <div className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ed-kicker">{KICKER[lang]}</p>
            <h1 className="ed-display mt-3 max-w-3xl text-balance text-[32px] text-ink sm:text-[48px]">
              {titleParts.map((part, index) => (
                <span key={part} className="block sm:inline">
                  {part}
                  {index < titleParts.length - 1
                    ? lang === "zh"
                      ? "，"
                      : ","
                    : ""}
                </span>
              ))}
            </h1>
            <p className="ed-lede mt-3 max-w-2xl text-[14px]">
              {t(lang, "home.countriesSub")}
            </p>
          </div>
          <p className="ed-meta">
            {COUNTRIES.length} DOSSIERS · UPDATED 2026-11
          </p>
        </div>

        <CountryIndex lang={lang} />

        <p className="mt-8 max-w-2xl text-[10px] leading-relaxed text-muted">
          {t(lang, "demo.banner")}
        </p>
      </div>
    </Container>
  );
}
