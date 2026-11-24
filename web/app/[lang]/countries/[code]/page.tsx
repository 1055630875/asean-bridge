import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Ui";
import {
  FlavorExplorer,
  type FlavorDomain,
} from "@/components/FlavorExplorer";
import { isLang, t, type Lang } from "@/lib/i18n";
import {
  COUNTRIES,
  DOMAINS,
  FACTS,
  countryImage,
  factsFor,
  getCountry,
  getFact,
  sourcesForCountry,
  sourceById,
} from "@/lib/data";

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: c.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}): Promise<Metadata> {
  const { lang, code } = await params;
  const country = getCountry(code);
  if (!isLang(lang) || !country) return {};
  return {
    title: country.name[lang],
    description: country.blurb[lang],
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}) {
  const { lang: rawLang, code } = await params;
  if (!isLang(rawLang)) notFound();
  const lang: Lang = rawLang;

  const country = getCountry(code);
  if (!country) notFound();

  const portalLabel = country.officialUrl.includes("baike.baidu.com")
    ? lang === "zh"
      ? "第三方资料"
      : lang === "id"
        ? "Sumber pihak ketiga"
        : "Third-party reference"
    : t(lang, "country.portal");

  const sources = sourcesForCountry(country.code);
  const covered = DOMAINS.map((domain) => ({
    domain,
    rows: factsFor(country.code, domain.code),
  })).filter((entry) => entry.rows.length > 0);
  const missing = DOMAINS.filter(
    (domain) => !covered.some((entry) => entry.domain.code === domain.code),
  );

  const dish = getFact(country.code, "food", "signature");
  const landmark = getFact(country.code, "places", "landmark");
  const allFacts = covered.flatMap((entry) =>
    entry.rows.map((row) => row.fact),
  );
  const lastAsOf = allFacts.map((fact) => fact.asOf).sort().at(-1) ?? "—";

  const compareTarget =
    COUNTRIES.find(
      (candidate) =>
        candidate.status === "ready" && candidate.code !== country.code,
    )?.code ?? "ID";

  const flavorDomains: FlavorDomain[] = covered.map(({ domain, rows }) => ({
    code: domain.code,
    name: domain.name[lang],
    blurb: domain.blurb[lang],
    icon: domain.icon,
    rows: rows.map(({ row, fact }) => {
      const source = sourceById(fact.sourceId);
      return {
        key: row.key,
        label: row.label[lang],
        value: fact.value[lang],
        kind: row.kind,
        asOf: fact.asOf,
        sourceIssuer: source?.issuer ?? "",
        sourceTitle: source ? source.title[lang] : "",
        sourceUrl: source?.url ?? "#",
      };
    }),
  }));

  const stats = [
    {
      label: t(lang, "country.capital"),
      value: country.capital[lang],
      sub: undefined,
    },
    {
      label: t(lang, "country.currency"),
      value: country.currency,
      sub: undefined,
    },
    {
      label: t(lang, "country.dish"),
      value: dish ? dish.value[lang] : "—",
      sub: dish ? `${t(lang, "country.asOf")} ${dish.asOf}` : undefined,
    },
    {
      label: t(lang, "country.landmark"),
      value: landmark ? landmark.value[lang] : "—",
      sub: landmark
        ? `${t(lang, "country.asOf")} ${landmark.asOf}`
        : undefined,
    },
  ];

  return (
    <div>
      <Container>
        <div className="pt-8 sm:pt-10">
          <Link
            href={`/${lang}/countries`}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-muted uppercase hover:text-accent"
          >
            <ArrowLeft size={12} />
            {t(lang, "country.back")}
          </Link>
        </div>

        {/* Banner / masthead */}
        <div className="mt-6 grid border-y border-line lg:grid-cols-[1.15fr_0.85fr]">
          <div className="py-8 lg:pr-10">
            <p className="ed-meta">
              {country.code} · {country.capital[lang]}
            </p>
            <h1 className="ed-display mt-3 text-[44px] leading-[0.98] text-ink sm:text-[58px]">
              {country.name[lang]}
            </h1>
            <p className="ed-lede mt-4 max-w-xl text-[15px]">
              {country.blurb[lang]}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
              <span className="ed-meta">
                {t(lang, "country.capital")} · {country.capital[lang]}
              </span>
              <span className="ed-meta">
                {t(lang, "country.currency")} · {country.currency}
              </span>
              <a
                href={country.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="ed-meta inline-flex items-center gap-1 text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
              >
                {portalLabel}
                <ArrowUpRight size={11} />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {country.status === "ready" || country.status === "partial" ? (
                <Link
                  href={`/${lang}/compare?domain=food&a=${country.code}&b=${compareTarget}`}
                  className="ed-btn"
                >
                  {t(lang, "country.compareCta")}
                  <ArrowRight size={13} />
                </Link>
              ) : null}
              <Link
                href="#sources"
                className="ed-meta text-muted hover:text-accent"
              >
                {t(lang, "country.sourcesTitle")} ↓
              </Link>
            </div>
          </div>

          <figure className="flex min-h-[300px] flex-col border-t border-line bg-paper-2 lg:border-t-0 lg:border-l">
            <div className="relative flex-1">
              <img
                src={countryImage(country.code)}
                alt={country.name[lang]}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-2">
              <span className="ed-caption">FIG. 01 — {country.code}</span>
              <span className="ed-caption text-muted/70">
                PHOTO · PIXABAY
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Stats as a ruled table */}
        <dl className="mt-8 grid grid-cols-2 border-y border-line sm:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={`px-4 py-4 ${
                index > 0 ? "border-l border-line" : ""
              } ${index === 2 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="ed-meta">{item.label}</dt>
              <dd className="ed-fact mt-1 text-[13px] leading-snug">
                {item.value}
              </dd>
              {item.sub ? (
                <dd className="ed-meta mt-1 text-muted/70">{item.sub}</dd>
              ) : null}
            </div>
          ))}
        </dl>

        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-3">
          {[
            { href: "#overview", label: t(lang, "country.tab.overview") },
            { href: "#policies", label: t(lang, "country.tab.policies") },
            { href: "#sources", label: t(lang, "country.tab.sources") },
          ].map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className="ed-meta text-ink-soft hover:text-accent"
            >
              {String(index + 1).padStart(2, "0")} / {item.label}
            </a>
          ))}
        </nav>
      </Container>

      {/* Overview */}
      <section id="overview" className="border-t border-line py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="ed-kicker">01 / {t(lang, "country.overviewTitle")}</p>
              <h2 className="ed-display mt-3 text-[30px] text-ink sm:text-[36px]">
                {country.name[lang]}
              </h2>
              <p className="ed-lede mt-3 max-w-2xl text-[14px]">
                {country.blurb[lang]}
              </p>
              <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-muted">
                {t(lang, "country.policySub")}
              </p>
            </div>

            <dl className="border-t border-line">
              {[
                {
                  label: t(lang, "country.domainCoverage"),
                  value: `${covered.length}/${DOMAINS.length}`,
                },
                {
                  label: t(lang, "country.sourcesTitle"),
                  value: String(sources.length),
                },
                {
                  label: t(lang, "country.asOf"),
                  value: lastAsOf,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
                >
                  <dt className="ed-meta">{item.label}</dt>
                  <dd className="ed-fact text-[13px]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {missing.length > 0 ? (
            <p className="mt-6 max-w-xl border-t border-line pt-3 text-[11px] leading-relaxed text-amber">
              {t(lang, "country.notCollected")} ·{" "}
              {missing.map((domain) => domain.name[lang]).join(" / ")}
            </p>
          ) : null}
        </Container>
      </section>

      {/* Flavour quick view */}
      <section id="policies" className="border-t border-line py-10">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="ed-kicker">02 / {t(lang, "country.tab.policies")}</p>
              <h2 className="ed-display mt-3 text-[30px] text-ink sm:text-[36px]">
                {t(lang, "country.policyTitle")}
              </h2>
            </div>
            <span className="ed-meta">CLICK ANY ROW</span>
          </div>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            {t(lang, "country.policySub")}
          </p>

          {country.status === "unavailable" ? (
            <div className="mt-6 border border-line bg-paper-2 p-5">
              <p className="text-[13px] font-semibold text-ink">
                {t(lang, "country.unavailableTitle")}
              </p>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted">
                {t(lang, "country.unavailableBody")}
              </p>
            </div>
          ) : country.status === "soon" ? (
            <div className="mt-6 border border-line bg-paper-2 p-5">
              <p className="text-[13px] font-semibold text-ink">
                {t(lang, "country.buildTitle")}
              </p>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted">
                {t(lang, "country.buildBody")}
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <FlavorExplorer
                lang={lang}
                countryName={country.name[lang]}
                intro={country.blurb[lang]}
                image={countryImage(country.code)}
                domains={flavorDomains}
              />
            </div>
          )}
        </Container>
      </section>

      {/* Sources */}
      <section id="sources" className="border-t border-line py-10">
        <Container>
          <p className="ed-kicker">03 / {t(lang, "country.sourcesTitle")}</p>
          <h2 className="ed-display mt-3 text-[30px] text-ink sm:text-[36px]">
            {t(lang, "country.sourcesTitle")}
          </h2>

          <ol className="mt-6 border-t border-line">
            {sources.map((source, index) => {
              const usedBy = Object.values(FACTS).filter(
                (fact) => fact.sourceId === source.id,
              ).length;
              return (
                <li
                  key={source.id}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-line py-4"
                >
                  <span className="ed-meta text-accent">[{index + 1}]</span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-[13px] font-semibold text-ink">
                        {source.issuer}
                      </span>
                      <span className="ed-meta">
                        {source.tier === 1
                          ? t(lang, "sources.tier1")
                          : source.tier === 2
                            ? t(lang, "sources.tier2")
                            : t(lang, "sources.tier3")}
                      </span>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block font-mono text-[10px] leading-relaxed text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-accent"
                    >
                      {source.title[lang]}
                    </a>
                    <p className="mt-1 break-all font-mono text-[9px] text-muted/70">
                      {source.url}
                    </p>
                    <p className="ed-meta mt-1">
                      {t(lang, "sources.retrieved")} {source.retrieved} ·{" "}
                      {t(lang, "sources.usedBy")} {usedBy}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 max-w-2xl text-[10px] leading-relaxed text-muted">
            {t(lang, "demo.banner")}
          </p>
        </Container>
      </section>
    </div>
  );
}
