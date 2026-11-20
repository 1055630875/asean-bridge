import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/Ui";
import { DomainGlyph } from "@/components/DomainGlyph";
import { CountryGallery } from "@/components/CountryGallery";
import { CountryIndex } from "@/components/CountryIndex";
import { isLang, t } from "@/lib/i18n";
import {
  DOMAINS,
  computeVerdict,
  countryImage,
  getFact,
  verdictLabel,
  type Row,
} from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: t(lang, "brand.name"),
    description: t(lang, "home.sub"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const titleParts = t(lang, "home.title").split(lang === "zh" ? "，" : ",");
  const countriesTitleParts = t(lang, "home.countriesTitle").split(
    lang === "zh" ? "，" : ",",
  );

  const idDish = getFact("ID", "food", "signature");
  const thDish = getFact("TH", "food", "signature");
  const idSpice = getFact("ID", "food", "spice");
  const thSpice = getFact("TH", "food", "spice");

  const dishRow: Row = {
    key: "signature",
    label: { zh: "代表菜", en: "Signature dish", id: "Hidangan khas" },
    kind: "text",
  };
  const spiceRow: Row = {
    key: "spice",
    label: { zh: "辣度（编辑评分）", en: "Heat (editorial)", id: "Pedas (editorial)" },
    kind: "score",
    higherLabel: {
      a: { zh: "A 更辣", en: "A hotter", id: "A lebih pedas" },
      b: { zh: "B 更辣", en: "B hotter", id: "B lebih pedas" },
    },
  };

  return (
    <div>
      {/* Hero / Story banner ---------------------------------------- */}
      <section className="ed-banner border-b border-line">
        <Container>
          <div className="grid lg:grid-cols-[54px_minmax(0,1fr)_minmax(390px,44%)]">
            <div className="ed-banner__rail hidden border-r border-line py-12 lg:flex lg:flex-col lg:items-center lg:justify-between">
              <span className="ed-meta">ISSUE 01 / 2026</span>
              <span className="ed-meta text-muted/70">ASEAN BRIDGE</span>
            </div>

            <div className="py-10 pr-0 sm:py-14 lg:py-16 lg:pr-10">
              <p className="ed-kicker">{t(lang, "home.kicker")}</p>

              <h1 className="ed-display mt-4 max-w-[14ch] text-balance text-[40px] leading-[1.02] text-ink sm:text-[54px] lg:text-[62px]">
                {titleParts.map((part, index) => (
                  <span key={part} className="block">
                    {part}
                    {index < titleParts.length - 1
                      ? lang === "zh"
                        ? "，"
                        : ","
                      : ""}
                  </span>
                ))}
              </h1>

              <p className="ed-lede mt-5 max-w-[46ch] text-[15px]">
                {t(lang, "home.sub")}
              </p>

              <form
                action={`/${lang}/ask`}
                method="get"
                className="ed-search mt-8 flex max-w-xl items-end gap-3 pb-2"
              >
                <label htmlFor="hero-q" className="sr-only">
                  {t(lang, "home.askPlaceholder")}
                </label>
                <input
                  id="hero-q"
                  name="q"
                  type="text"
                  placeholder={t(lang, "home.askPlaceholder")}
                  className="ed-field min-w-0 flex-1 bg-transparent px-0 py-2 text-[14px]"
                />
                <button type="submit" className="ed-btn shrink-0">
                  {t(lang, "home.askButton")}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href={`/${lang}/compare`}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase hover:text-accent"
                >
                  {t(lang, "home.ctaCompare")}
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href={`/${lang}/countries`}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-soft uppercase hover:text-accent"
                >
                  {t(lang, "home.ctaCountries")}
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3">
                {[
                  { text: t(lang, "home.trust1"), href: `/${lang}/sources` },
                  { text: t(lang, "home.trust2"), href: `/${lang}/sources` },
                  { text: t(lang, "home.trust3"), href: `/${lang}/ask` },
                ].map((item, index) => (
                  <Link
                    key={item.text}
                    href={item.href}
                    className="ed-meta max-w-[30ch] leading-relaxed hover:text-accent"
                  >
                    <span className="ed-ref">[{index + 1}]</span> {item.text}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="border-t border-line lg:border-t-0 lg:border-l">
              <figure className="ed-banner__figure">
                <img
                  src={countryImage("TH")}
                  alt="Thailand"
                  className="aspect-[3/2] w-full object-cover object-bottom"
                />
                <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                  <span className="ed-caption">FIG. 01 — TH / THAILAND</span>
                  <span className="ed-caption text-muted/70">
                    LOCAL SVG POSTER
                  </span>
                </figcaption>
              </figure>

              <div className="px-4 py-5 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="ed-meta text-accent">
                    SAMPLE 01 — ID / TH
                  </span>
                  <Link
                    href={`/${lang}/compare?domain=food&a=ID&b=TH`}
                    className="ed-meta text-ink hover:text-accent"
                  >
                    OPEN ↗
                  </Link>
                </div>

                <div className="mt-3 border-t border-line">
                  {[
                    { a: idDish, b: thDish, row: dishRow },
                    { a: idSpice, b: thSpice, row: spiceRow },
                  ].map((item) => {
                    const verdict = computeVerdict(item.row, item.a, item.b);
                    const isScore = item.row.kind === "score";
                    return (
                      <div
                        key={item.row.key}
                        className="border-b border-line py-3"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="ed-meta">{item.row.label[lang]}</p>
                          <p className="ed-meta text-muted/80">
                            {verdictLabel(lang, item.row, verdict)}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          {[
                            { code: "ID", fact: item.a },
                            { code: "TH", fact: item.b },
                          ].map((side, index) => (
                            <div
                              key={side.code}
                              className={
                                index === 1 ? "border-l border-line pl-4" : ""
                              }
                            >
                              <p className="ed-meta text-muted/70">
                                {side.code}
                              </p>
                              <p
                                className={
                                  isScore
                                    ? "ed-score mt-1 text-[18px]"
                                    : "ed-fact mt-1 text-[13px]"
                                }
                              >
                                {side.fact?.value[lang] ?? "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="ed-meta text-muted/70">
                    {`2 ${t(lang, "compare.rows")} · 2 ${t(lang, "country.sourceCount")} · 2026-11-05`}
                  </span>
                  <Link
                    href={`/${lang}/compare?domain=food&a=ID&b=TH`}
                    className="ed-meta text-accent hover:underline"
                  >
                    {t(lang, "home.compareDemo")}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Themes / Items index --------------------------------------- */}
      <section className="border-y border-line bg-paper-2/40 py-14 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ed-kicker">{t(lang, "home.domainsKicker")}</p>
              <h2 className="ed-display mt-3 text-balance text-[28px] text-ink sm:text-[40px]">
                {t(lang, "home.domainsTitle")}
              </h2>
              <p className="ed-lede mt-2 max-w-xl text-[14px]">
                {t(lang, "home.domainsSub")}
              </p>
            </div>
            <Link
              href={`/${lang}/compare`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase hover:text-accent"
            >
              {t(lang, "home.ctaCompare")}
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-8 border-t border-line">
            {DOMAINS.map((domain, index) => (
              <Link
                key={domain.code}
                href={`/${lang}/compare?domain=${domain.code}`}
                className="group -mx-4 grid grid-cols-[2.2rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-line px-4 py-5 transition-colors hover:bg-paper/70 sm:grid-cols-[3.5rem_minmax(0,1.05fr)_minmax(0,1fr)_auto]"
              >
                <span className="ed-meta text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="shrink-0 text-moss-mid">
                    <DomainGlyph icon={domain.icon} />
                  </span>
                  <span className="ed-display text-[25px] leading-tight text-ink sm:text-[30px]">
                    {domain.name[lang]}
                  </span>
                </span>

                <span className="col-span-2 col-start-2 text-[12px] leading-relaxed text-muted sm:col-span-1 sm:col-start-auto sm:text-[13px]">
                  {domain.blurb[lang]}
                </span>

                <span className="col-start-3 row-start-1 justify-self-end font-mono text-[9px] tracking-[0.14em] text-muted uppercase transition-colors group-hover:text-accent sm:col-start-4 sm:row-start-auto">
                  OPEN ↗
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Countries / ten-market index ------------------------------- */}
      <section id="countries" className="border-b border-line py-14 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ed-kicker">{t(lang, "home.countriesKicker")}</p>
              <h2 className="ed-display mt-3 text-balance text-[28px] text-ink sm:text-[40px]">
                {countriesTitleParts.map((part, index) => (
                  <span key={part} className="block sm:inline">
                    {part}
                    {index < countriesTitleParts.length - 1
                      ? lang === "zh"
                        ? "，"
                        : ","
                      : ""}
                  </span>
                ))}
              </h2>
              <p className="ed-lede mt-2 max-w-2xl text-[14px]">
                {t(lang, "home.countriesSub")}
              </p>
            </div>
            <Link
              href={`/${lang}/countries`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-ink uppercase hover:text-accent"
            >
              {t(lang, "nav.countries")}
              <ArrowRight size={13} />
            </Link>
          </div>

          <CountryIndex lang={lang} />
        </Container>
      </section>

      <CountryGallery lang={lang} />

      {/* Method ----------------------------------------------------- */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="ed-kicker">{t(lang, "home.howKicker")}</p>
              <h2 className="ed-display mt-3 max-w-[13ch] text-balance text-[28px] text-ink sm:text-[40px]">
                {t(lang, "home.howTitle")}
              </h2>
              <p className="ed-meta mt-5">SOURCES / EDIT / LOCALISE</p>
              <Link
                href={`/${lang}/sources`}
                className="ed-meta mt-3 inline-flex items-center gap-1.5 text-ink hover:text-accent"
              >
                {t(lang, "nav.sources")}
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <ol className="border-t border-line">
              {[
                {
                  no: "01",
                  title: t(lang, "home.how1Title"),
                  body: t(lang, "home.how1Body"),
                },
                {
                  no: "02",
                  title: t(lang, "home.how2Title"),
                  body: t(lang, "home.how2Body"),
                },
                {
                  no: "03",
                  title: t(lang, "home.how3Title"),
                  body: t(lang, "home.how3Body"),
                },
              ].map((step, index) => (
                <li
                  key={step.no}
                  className="grid grid-cols-[2.8rem_minmax(0,1fr)] gap-4 border-b border-line py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]"
                >
                  <span className="ed-meta pt-1 text-accent">{step.no}</span>
                  <div>
                    <h3 className="ed-display text-[24px] leading-tight text-ink sm:text-[28px]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-soft">
                      {step.body}{" "}
                      <Link
                        href={`/${lang}/sources`}
                        className="ed-ref"
                        aria-label={t(lang, "nav.sources")}
                      >
                        [{index + 1}]
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* CTA -------------------------------------------------------- */}
      <div className="bg-moss-deep">
        <Container>
          <div className="flex flex-col gap-6 py-10 sm:py-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-paper/60 uppercase">
                NEXT / COMPARE
              </p>
              <h2 className="ed-display mt-3 text-[34px] text-paper sm:text-[44px]">
                {t(lang, "compare.title")}
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-paper/70">
                {t(lang, "compare.sub")}
              </p>
            </div>
            <Link
              href={`/${lang}/compare`}
              className="inline-flex shrink-0 items-center gap-2 border border-paper bg-paper px-5 py-3 font-mono text-[10px] font-medium tracking-[0.12em] text-moss-deep uppercase transition-colors hover:bg-transparent hover:text-paper"
            >
              {t(lang, "home.ctaCompare")}
              <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </div>

    </div>
  );
}