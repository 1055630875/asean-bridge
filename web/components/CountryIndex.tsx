import Link from "next/link";
import {
  COUNTRIES,
  countryImage,
  getFact,
  type Country,
} from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

function CountryFeature({
  lang,
  country,
  index,
  stacked,
}: {
  lang: Lang;
  country: Country;
  index: number;
  stacked?: boolean;
}) {
  const dish = getFact(country.code, "food", "signature");
  const landmark = getFact(country.code, "places", "landmark");

  return (
    <Link
      href={`/${lang}/countries/${country.code}`}
      className={`group flex flex-col ${
        stacked ? "border-t border-line md:border-t-0 md:border-l" : ""
      }`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-paper-2">
        <img
          src={countryImage(country.code)}
          alt={country.name[lang]}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="ed-meta text-accent">
            FEATURED {String(index + 1).padStart(2, "0")}
          </span>
          <span className="ed-meta">
            {country.code} · {country.currency}
          </span>
        </div>

        <h3 className="ed-display mt-3 text-[30px] leading-tight text-ink">
          {country.name[lang]}
        </h3>
        <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-muted">
          {country.blurb[lang]}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-3">
          <div>
            <dt className="ed-meta">{t(lang, "country.dish")}</dt>
            <dd className="ed-fact mt-1 text-[12px] leading-snug">
              {dish ? dish.value[lang] : "—"}
            </dd>
          </div>
          <div className="border-l border-line pl-4">
            <dt className="ed-meta">{t(lang, "country.landmark")}</dt>
            <dd className="ed-fact mt-1 text-[12px] leading-snug">
              {landmark ? landmark.value[lang] : "—"}
            </dd>
          </div>
        </dl>

        <span className="ed-meta mt-auto pt-4 text-ink transition-colors group-hover:text-accent">
          {t(lang, "home.openCountry")} ↗
        </span>
      </div>
    </Link>
  );
}

function CountryRow({ lang, country }: { lang: Lang; country: Country }) {
  const dish = getFact(country.code, "food", "signature");

  return (
    <Link
      href={`/${lang}/countries/${country.code}`}
      className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-3.5 transition-colors hover:bg-paper-2/50 sm:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.2fr)_auto] sm:gap-4"
    >
      <span className="ed-meta text-muted">{country.code}</span>
      <span className="ed-display text-[19px] leading-tight text-ink">
        {country.name[lang]}
      </span>
      <span className="hidden truncate text-[11px] text-muted sm:block">
        {dish ? dish.value[lang] : "—"}
      </span>
      <span className="ed-meta justify-self-end text-muted transition-colors group-hover:text-accent">
        ↗
      </span>
    </Link>
  );
}

export function CountryIndex({ lang }: { lang: Lang }) {
  const featured = COUNTRIES.slice(0, 2);
  const rest = COUNTRIES.slice(2);

  return (
    <div className="mt-8">
      <div className="grid border-y border-line md:grid-cols-[1.2fr_0.8fr]">
        <CountryFeature lang={lang} country={featured[0]} index={0} />
        <CountryFeature lang={lang} country={featured[1]} index={1} stacked />
      </div>

      <div className="grid md:grid-cols-2 md:gap-x-10">
        {rest.map((country) => (
          <CountryRow key={country.code} lang={lang} country={country} />
        ))}
      </div>
    </div>
  );
}
