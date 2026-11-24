"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { DomainGlyph } from "@/components/DomainGlyph";
import type { DomainIcon } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

export type FlavorRow = {
  key: string;
  label: string;
  value: string;
  kind: "text" | "score";
  asOf: string;
  sourceIssuer: string;
  sourceTitle: string;
  sourceUrl: string;
};

export type FlavorDomain = {
  code: string;
  name: string;
  blurb: string;
  icon: DomainIcon;
  rows: FlavorRow[];
};

type Active = FlavorRow & { domain: string; domainCode: string };

const COPY = {
  zh: {
    hint: "点开任意一行，查看介绍、图片与来源。",
    close: "关闭",
    source: "来源",
    asOf: "更新于",
    open: "OPEN ↗",
    desc: {
      food: (v: string, c: string, intro: string) =>
        `${v} 是 ${c} 餐桌上最直接的味觉入口。${intro}`,
      places: (v: string, c: string, intro: string) =>
        `${v} 值得单独留出半天到一天。${intro}`,
      culture: (v: string, c: string, intro: string) =>
        `理解 ${c} 的日常，可以从 ${v} 开始。${intro}`,
      travel: (v: string, c: string, intro: string) =>
        `落地后最先会用到的信息：${v}。${intro}`,
    } as Record<string, (v: string, c: string, intro: string) => string>,
  },
  en: {
    hint: "Open any row for an introduction, image and source.",
    close: "Close",
    source: "Source",
    asOf: "Updated",
    open: "OPEN ↗",
    desc: {
      food: (v: string, c: string, intro: string) =>
        `${v} is one of the most direct ways into ${c} on a plate. ${intro}`,
      places: (v: string, c: string, intro: string) =>
        `${v} deserves a half day to a full day. ${intro}`,
      culture: (v: string, c: string, intro: string) =>
        `To read everyday ${c}, start with ${v}. ${intro}`,
      travel: (v: string, c: string, intro: string) =>
        `The first practical thing you will use on the ground: ${v}. ${intro}`,
    } as Record<string, (v: string, c: string, intro: string) => string>,
  },
  id: {
    hint: "Buka baris mana pun untuk melihat penjelasan, gambar, dan sumber.",
    close: "Tutup",
    source: "Sumber",
    asOf: "Diperbarui",
    open: "OPEN ↗",
    desc: {
      food: (v: string, c: string, intro: string) =>
        `${v} adalah salah satu pintu rasa paling langsung ke ${c}. ${intro}`,
      places: (v: string, c: string, intro: string) =>
        `${v} layak setengah hari sampai sehari. ${intro}`,
      culture: (v: string, c: string, intro: string) =>
        `Untuk memahami keseharian ${c}, mulai dari ${v}. ${intro}`,
      travel: (v: string, c: string, intro: string) =>
        `Informasi praktis pertama yang akan dipakai: ${v}. ${intro}`,
    } as Record<string, (v: string, c: string, intro: string) => string>,
  },
};

export function FlavorExplorer({
  lang,
  countryName,
  intro,
  image,
  domainImages,
  domains,
}: {
  lang: Lang;
  countryName: string;
  intro: string;
  image: string;
  domainImages: Record<string, string>;
  domains: FlavorDomain[];
}) {
  const [active, setActive] = useState<Active | null>(null);
  const c = COPY[lang];

  return (
    <>
      <p className="mt-2 text-[10px] leading-relaxed text-muted">{c.hint}</p>

      <div className="mt-4 border-t border-line">
        {domains.map((domain) => (
          <section
            key={domain.code}
            className="grid gap-4 border-b border-line py-5 md:grid-cols-[210px_minmax(0,1fr)]"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-moss-mid">
                <DomainGlyph icon={domain.icon} />
              </span>
              <div>
                <h3 className="ed-display text-[20px] leading-tight text-ink">
                  {domain.name}
                </h3>
                <p className="ed-meta mt-1">{domain.blurb}</p>
              </div>
            </div>

            <div>
              {domain.rows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={() =>
                    setActive({
                      ...row,
                      domain: domain.name,
                      domainCode: domain.code,
                    })
                  }
                  className="group flex w-full items-baseline gap-3 border-b border-line/60 py-2.5 text-left last:border-0"
                >
                  <span className="ed-meta w-[8.5rem] shrink-0">
                    {row.label}
                  </span>
                  <span
                    className={
                      row.kind === "score"
                        ? "ed-score text-[18px]"
                        : "ed-fact text-[13px]"
                    }
                  >
                    {row.value}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[9px] tracking-[0.12em] text-muted uppercase transition-colors group-hover:text-accent">
                    {c.open}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-6"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-line bg-paper"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label={c.close}
              className="absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center border border-line-strong bg-paper text-ink hover:bg-paper-2"
            >
              <X size={15} />
            </button>

            <img
              src={domainImages[active.domainCode] ?? image}
              alt={`${countryName} · ${active.domain}`}
              className="aspect-[3/2] w-full border-b border-line object-cover"
            />

            <div className="p-6">
              <p className="ed-meta text-accent">
                {countryName} / {active.domain}
              </p>
              <h3 className="ed-display mt-2 text-[28px] text-ink">
                {active.label}
              </h3>
              <p
                className={
                  active.kind === "score"
                    ? "ed-score mt-1 text-[26px]"
                    : "ed-fact mt-1 text-[18px]"
                }
              >
                {active.value}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                {c.desc[active.domainCode]?.(
                  active.value,
                  countryName,
                  intro,
                ) ?? intro}
              </p>

              <div className="mt-5 border-t border-line pt-3">
                <p className="ed-meta">
                  {c.source} / {c.asOf} {active.asOf}
                </p>
                <a
                  href={active.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] leading-relaxed text-ink underline decoration-line-strong underline-offset-4 hover:text-accent"
                >
                  {active.sourceIssuer} · {active.sourceTitle}
                  <ArrowUpRight size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
