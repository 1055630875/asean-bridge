"use client";

import { DOMAINS, COUNTRIES } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

export function CompareForm({
  lang,
  domain,
  a,
  b,
  labels,
}: {
  lang: Lang;
  domain: string;
  a: string;
  b: string;
  labels: { domain: string; a: string; b: string; submit: string };
}) {
  return (
    <form
      action={`/${lang}/compare`}
      method="get"
      className="mt-6 grid gap-4 border-y border-line py-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
    >
      <label className="block">
        <span className="ed-meta mb-1.5 block">{labels.domain}</span>
        <select
          name="domain"
          defaultValue={domain}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="w-full appearance-none rounded-none border border-line bg-paper px-3 py-2.5 font-mono text-[11px] text-ink outline-none focus:border-ink"
        >
          {DOMAINS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name[lang]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="ed-meta mb-1.5 block">{labels.a}</span>
        <select
          name="a"
          defaultValue={a}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="w-full appearance-none rounded-none border border-line bg-paper px-3 py-2.5 font-mono text-[11px] text-ink outline-none focus:border-ink"
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name[lang]} ({item.code})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="ed-meta mb-1.5 block">{labels.b}</span>
        <select
          name="b"
          defaultValue={b}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="w-full appearance-none rounded-none border border-line bg-paper px-3 py-2.5 font-mono text-[11px] text-ink outline-none focus:border-ink"
        >
          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name[lang]} ({item.code})
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="ed-btn h-[42px]">
        {labels.submit}
      </button>
    </form>
  );
}
