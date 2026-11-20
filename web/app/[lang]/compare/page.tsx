"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/Ui";
import { CompareForm } from "@/components/CompareForm";
import { isLang, t, type Lang } from "@/lib/i18n";
import {
  DOMAIN_ROWS,
  computeVerdict,
  getCountry,
  getDomain,
  getFact,
  sourceById,
  verdictLabel,
} from "@/lib/data";

const KICKER: Record<Lang, string> = {
  zh: "并置阅读 / COMPARE",
  en: "CROSS-READING / COMPARE",
  id: "BACA BERDAMPING / COMPARE",
};

export default function ComparePage() {
  const routeParams = useParams<{ lang: string }>();
  const lang: Lang =
    routeParams?.lang && isLang(routeParams.lang) ? routeParams.lang : "zh";

  const [domainCode, setDomainCode] = useState("food");
  const [aCode, setACode] = useState("ID");
  const [bCode, setBCode] = useState("TH");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const domain = getDomain(search.get("domain") ?? "");
    const countryA = getCountry(search.get("a") ?? "");
    const countryB = getCountry(search.get("b") ?? "");
    if (domain) setDomainCode(domain.code);
    if (countryA) setACode(countryA.code);
    if (countryB && countryB.code !== (countryA?.code ?? "ID")) {
      setBCode(countryB.code);
    }
  }, []);

  const domain = getDomain(domainCode) ?? getDomain("food")!;
  const countryA = getCountry(aCode) ?? getCountry("ID")!;
  let countryB = getCountry(bCode) ?? getCountry("TH")!;
  if (countryB.code === countryA.code) {
    countryB = getCountry("VN") ?? countryB;
  }

  const rows = DOMAIN_ROWS[domain.code] ?? [];
  const items = rows.map((row) => ({
    row,
    a: getFact(countryA.code, domain.code, row.key),
    b: getFact(countryB.code, domain.code, row.key),
  }));
  const verdicts = items.map((item) => ({
    ...item,
    verdict: computeVerdict(item.row, item.a, item.b),
  }));

  const usedIds = Array.from(
    new Set(
      items
        .flatMap((item) => [item.a?.sourceId, item.b?.sourceId])
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const refNo = (id?: string) =>
    id ? usedIds.indexOf(id) + 1 : null;

  const differences = verdicts.filter(
    (item) => item.verdict !== "same" && item.verdict !== "unknown",
  );
  const coveredA = items.filter((item) => item.a).length;
  const coveredB = items.filter((item) => item.b).length;
  const sourcesA = new Set(
    items.map((item) => item.a?.sourceId).filter(Boolean),
  ).size;
  const sourcesB = new Set(
    items.map((item) => item.b?.sourceId).filter(Boolean),
  ).size;
  const unavailable = [countryA, countryB].filter(
    (country) => country.status === "unavailable",
  );
  const latestAsOf =
    items
      .flatMap((item) => [item.a?.asOf, item.b?.asOf])
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1) ?? "—";

  return (
    <Container>
      <div className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ed-kicker">{KICKER[lang]}</p>
            <h1 className="ed-display mt-3 text-[42px] text-ink sm:text-[54px]">
              {t(lang, "compare.title")}
            </h1>
            <p className="ed-lede mt-3 max-w-xl text-[14px]">
              {t(lang, "compare.sub")}
            </p>
          </div>
          <p className="ed-meta">TWO MARKETS / ONE TABLE</p>
        </div>

        <CompareForm
          key={`${domain.code}-${countryA.code}-${countryB.code}`}
          lang={lang}
          domain={domain.code}
          a={countryA.code}
          b={countryB.code}
          labels={{
            domain: t(lang, "compare.domain"),
            a: t(lang, "compare.countryA"),
            b: t(lang, "compare.countryB"),
            submit: t(lang, "compare.submit"),
          }}
        />

        {/* Two-country spread header */}
        <div className="mt-8 grid grid-cols-[1fr_1px_1fr] border-y border-line">
          <div className="py-5 pr-5">
            <p className="ed-meta text-accent">A · {countryA.code}</p>
            <p className="ed-display mt-1 text-[26px] text-ink">
              {countryA.name[lang]}
            </p>
            <p className="ed-meta mt-1">
              {countryA.capital[lang]} · {countryA.currency}
            </p>
          </div>
          <div className="bg-line" />
          <div className="py-5 pl-5">
            <p className="ed-meta text-accent">B · {countryB.code}</p>
            <p className="ed-display mt-1 text-[26px] text-ink">
              {countryB.name[lang]}
            </p>
            <p className="ed-meta mt-1">
              {countryB.capital[lang]} · {countryB.currency}
            </p>
          </div>
        </div>

        {unavailable.length > 0 ? (
          <p className="mt-5 border-l-2 border-amber pl-3 text-[11px] leading-relaxed text-amber">
            {unavailable
              .map((country) =>
                t(lang, "compare.unavailable").replace(
                  "{name}",
                  country.name[lang],
                ),
              )
              .join(" ")}
          </p>
        ) : null}

        {/* Findings */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
            <h2 className="ed-display text-[26px] text-ink">
              {t(lang, "compare.summary")}
            </h2>
            <span className="ed-meta">
              {t(lang, "country.asOf")} {latestAsOf}
            </span>
          </div>

          {differences.length === 0 ? (
            <p className="mt-4 text-[12px] leading-relaxed text-muted">
              {t(lang, "compare.unknown")} · {t(lang, "compare.missingNote")}
            </p>
          ) : (
            <div>
              {differences.slice(0, 3).map((item) => (
                <div
                  key={item.row.key}
                  className="grid gap-2 border-b border-line/70 py-3 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
                >
                  <span className="ed-meta">{item.row.label[lang]}</span>
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    <span className="ed-meta">A</span>{" "}
                    <span
                      className={
                        item.row.kind === "score"
                          ? "ed-score text-[16px]"
                          : "ed-fact"
                      }
                    >
                      {item.a?.value[lang] ?? "—"}
                    </span>
                    <span className="ed-meta mx-2">vs</span>
                    <span className="ed-meta">B</span>{" "}
                    <span
                      className={
                        item.row.kind === "score"
                          ? "ed-score text-[16px]"
                          : "ed-fact"
                      }
                    >
                      {item.b?.value[lang] ?? "—"}
                    </span>
                  </p>
                  <span className="ed-meta text-ink-soft">
                    {verdictLabel(lang, item.row, item.verdict)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="ed-meta">
              {t(lang, "compare.coverage")} · A {coveredA}/{rows.length} · B{" "}
              {coveredB}/{rows.length}
            </span>
            <span className="ed-meta">
              {t(lang, "compare.sources")} · A {sourcesA} · B {sourcesB}
            </span>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
            <h2 className="ed-display text-[26px] text-ink">
              {t(lang, "compare.table")}
            </h2>
            <span className="ed-meta">SCORE ITALIC / FACT UPRIGHT</span>
          </div>

          <div role="table" aria-label={t(lang, "compare.table")}>
            <div
              role="row"
              className="hidden border-b border-line py-3 md:grid md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)_7rem] md:gap-4"
            >
              <span role="columnheader" className="ed-meta">
                {t(lang, "compare.field")}
              </span>
              <span role="columnheader" className="ed-meta">
                A · {countryA.name[lang]}
              </span>
              <span role="columnheader" className="ed-meta">
                B · {countryB.name[lang]}
              </span>
              <span role="columnheader" className="ed-meta">
                {t(lang, "compare.verdict")}
              </span>
            </div>

            {verdicts.map((item) => (
              <div
                key={item.row.key}
                role="row"
                className="grid gap-2 border-b border-line/70 py-4 md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)_7rem] md:gap-4"
              >
                <div role="rowheader" className="ed-meta md:pt-1">
                  {item.row.label[lang]}
                </div>

                {[item.a, item.b].map((fact, index) => {
                  const country = index === 0 ? countryA : countryB;
                  const marker = refNo(fact?.sourceId);
                  return (
                    <div role="cell" key={country.code}>
                      <p className="ed-meta mb-1 md:hidden">
                        {index === 0 ? "A" : "B"} · {country.name[lang]}
                      </p>
                      {fact ? (
                        <>
                          <p
                            className={
                              item.row.kind === "score"
                                ? "ed-score text-[20px]"
                                : "ed-fact text-[14px]"
                            }
                          >
                            {fact.value[lang]}
                          </p>
                          <p className="ed-meta mt-1">
                            {t(lang, "country.asOf")} {fact.asOf}
                          </p>
                          <a
                            href={`#ref-${marker}`}
                            className="ed-ref mt-1 inline-block"
                          >
                            [{marker}]
                          </a>
                        </>
                      ) : (
                        <>
                          <p className="text-[12px] text-muted">
                            {t(lang, "compare.missingCell")}
                          </p>
                          <p className="ed-meta mt-1">
                            {t(lang, "compare.missingNote")}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}

                <div role="cell" className="ed-meta md:pt-1">
                  <span
                    className={
                      item.verdict === "unknown" ||
                      item.verdict === "not_comparable"
                        ? "text-amber"
                        : "text-ink-soft"
                    }
                  >
                    {verdictLabel(lang, item.row, item.verdict)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-[10px] leading-relaxed text-muted">
            {t(lang, "compare.footnote")}
          </p>
        </section>

        {/* References */}
        <section className="mt-10">
          <h2 className="ed-display border-b border-line pb-3 text-[26px] text-ink">
            {t(lang, "ask.citations")}
          </h2>
          <ol className="grid gap-x-10 md:grid-cols-2">
            {usedIds.map((id, index) => {
              const source = sourceById(id);
              if (!source) return null;
              return (
                <li
                  key={id}
                  id={`ref-${index + 1}`}
                  className="grid scroll-mt-24 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line py-3"
                >
                  <span className="ed-meta text-accent">[{index + 1}]</span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {source.issuer}
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] leading-relaxed text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-accent"
                    >
                      {source.title[lang]}
                      <ArrowUpRight size={10} />
                    </a>
                    <p className="ed-meta mt-1">
                      {t(lang, "sources.retrieved")} {source.retrieved}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="ed-meta max-w-lg leading-relaxed">
            {t(lang, "compare.sub")}
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
