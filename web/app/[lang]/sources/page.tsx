import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Ui";
import { FACTS, SOURCES, type Source } from "@/lib/data";
import { isLang, t, type Lang } from "@/lib/i18n";

const POLICY: Record<Lang, string> = {
  zh: "每条记录保留层级、访问日期与被引用次数；原始快照与 SHA-256 存档保留在本地版本。",
  en: "Each entry records its tier, access date and citation count; raw snapshots and SHA-256 archives stay in the local edition.",
  id: "Setiap entri mencatat tingkat, tanggal akses, dan jumlah kutipan; snapshot dan arsip SHA-256 tersimpan di versi lokal.",
};

const THIRD_NOTE: Record<Lang, string> = {
  zh: "以下三条为第三方资料，仅用于官方来源不可达的国家；层级与访问日期均已标注。",
  en: "The three entries below are third-party references, used only where an official source is unreachable; tier and access date are shown.",
  id: "Tiga entri di bawah adalah rujukan pihak ketiga, hanya untuk negara yang sumber resminya tidak terjangkau; tingkat dan tanggal akses ditampilkan.",
};

const GROUP_LABEL: Record<Lang, { official: string; third: string }> = {
  zh: { official: "官方与多边", third: "第三方参考" },
  en: { official: "Official & multilateral", third: "Third-party reference" },
  id: { official: "Resmi & multilateral", third: "Rujukan pihak ketiga" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return { title: `${t(lang, "sources.title")} · ${t(lang, "brand.name")}` };
}

function tierLabel(lang: Lang, source: Source): string {
  return source.tier === 1
    ? t(lang, "sources.tier1")
    : source.tier === 2
      ? t(lang, "sources.tier2")
      : t(lang, "sources.tier3");
}

function SourceEntry({
  lang,
  source,
  number,
}: {
  lang: Lang;
  source: Source;
  number: number;
}) {
  const usedBy = Object.values(FACTS).filter(
    (fact) => fact.sourceId === source.id,
  ).length;

  return (
    <li className="grid gap-3 border-b border-line py-5 sm:grid-cols-[3rem_minmax(0,1fr)]">
      <span className="ed-meta text-accent">[{number}]</span>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-[14px] font-semibold text-ink">{source.issuer}</p>
          <span className="ed-meta">{tierLabel(lang, source)}</span>
        </div>

        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-start gap-1 font-mono text-[11px] leading-relaxed text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-accent"
        >
          {source.title[lang]}
          <ArrowUpRight size={11} className="mt-0.5 shrink-0" />
        </a>

        <p className="mt-1 break-all font-mono text-[9px] text-muted/70">
          {source.url}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="ed-meta">
            {t(lang, "sources.retrieved")} {source.retrieved}
          </span>
          <span className="ed-meta">
            {t(lang, "sources.usedBy")} · {usedBy}
          </span>
          <span className="flex flex-wrap gap-x-2">
            {source.countries.map((code) => (
              <Link
                key={code}
                href={`/${lang}/countries/${code}`}
                className="ed-meta text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-accent"
              >
                {code}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </li>
  );
}

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;

  const official = SOURCES.filter((source) => source.tier < 3);
  const thirdParty = SOURCES.filter((source) => source.tier === 3);
  const numberFor = (id: string) =>
    SOURCES.findIndex((source) => source.id === id) + 1;

  return (
    <Container>
      <div className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ed-kicker">参考书目 / SOURCES</p>
            <h1 className="ed-display mt-3 text-[42px] text-ink sm:text-[54px]">
              {t(lang, "sources.title")}
            </h1>
            <p className="ed-lede mt-3 max-w-2xl text-[14px]">
              {t(lang, "sources.sub")}
            </p>
          </div>
          <p className="ed-meta">
            {SOURCES.length} ENTRIES · UPDATED 2026-11
          </p>
        </div>

        {/* Counts as a ruled strip */}
        <dl className="mt-8 grid grid-cols-3 border-y border-line">
          {[
            { label: "SOURCES", value: SOURCES.length },
            { label: "OFFICIAL / MULTILATERAL", value: official.length },
            { label: "THIRD-PARTY", value: thirdParty.length },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`px-4 py-4 ${
                index > 0 ? "border-l border-line" : ""
              }`}
            >
              <dt className="ed-meta">{item.label}</dt>
              <dd className="ed-display mt-1 text-[28px] text-ink">
                {String(item.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.55fr_1.45fr]">
          <p className="ed-kicker">EDITORIAL POLICY</p>
          <p className="max-w-3xl text-[13px] leading-relaxed text-ink-soft">
            {POLICY[lang]}
          </p>
        </div>

        {/* Official & multilateral */}
        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 className="ed-display text-[26px] text-ink">
              {GROUP_LABEL[lang].official}
            </h2>
            <span className="ed-meta">{official.length} ENTRIES</span>
          </div>
          <ol>
            {official.map((source) => (
              <SourceEntry
                key={source.id}
                lang={lang}
                source={source}
                number={numberFor(source.id)}
              />
            ))}
          </ol>
        </section>

        {/* Third-party */}
        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 className="ed-display text-[26px] text-ink">
              {GROUP_LABEL[lang].third}
            </h2>
            <span className="ed-meta">{thirdParty.length} ENTRIES</span>
          </div>
          <p className="mt-3 max-w-2xl text-[11px] leading-relaxed text-muted">
            {THIRD_NOTE[lang]}
          </p>
          <ol>
            {thirdParty.map((source) => (
              <SourceEntry
                key={source.id}
                lang={lang}
                source={source}
                number={numberFor(source.id)}
              />
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="ed-meta max-w-lg leading-relaxed">
            {t(lang, "sources.demoTag")}
          </p>
          <Link href={`/${lang}/ask`} className="ed-btn">
            {t(lang, "nav.ask")}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </Container>
  );
}
