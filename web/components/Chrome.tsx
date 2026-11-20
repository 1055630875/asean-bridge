import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

export function DemoBanner({ lang }: { lang: Lang }) {
  return (
    <div className="border-b border-line bg-paper-2">
      <div className="mx-auto flex w-full max-w-6xl items-baseline gap-3 px-5 py-2 sm:px-8">
        <span className="ed-meta shrink-0 text-accent">[ DEMO ]</span>
        <p className="font-mono text-[10px] leading-relaxed text-muted">
          {t(lang, "demo.banner")}
        </p>
      </div>
    </div>
  );
}

export function Disclaimer({ lang }: { lang: Lang }) {
  return (
    <p className="max-w-md text-[11px] leading-relaxed text-muted">
      {t(lang, "disclaimer")}
    </p>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-20 border-t border-line bg-paper-2/70">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.5fr_0.7fr_1.2fr]">
        <div>
          <p className="ed-kicker">ASEAN BRIDGE / 2026</p>
          <p className="ed-wordmark mt-3 text-[28px] text-ink">
            {t(lang, "brand.name")}
          </p>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            {t(lang, "footer.tagline")}
          </p>
          <p className="ed-meta mt-5">TEN MARKETS · TRACEABLE SOURCES</p>
        </div>

        <nav aria-label={t(lang, "footer.product")}>
          <p className="ed-meta mb-4">{t(lang, "footer.product")}</p>
          <ul className="space-y-2.5">
            {(
              [
                { href: "/countries", key: "nav.countries" },
                { href: "/compare", key: "nav.compare" },
                { href: "/ask", key: "nav.ask" },
                { href: "/sources", key: "nav.sources" },
              ] as const
            ).map((item) => (
              <li key={item.key}>
                <Link
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft transition hover:text-accent"
                  href={`/${lang}${item.href}`}
                >
                  {t(lang, item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="ed-meta mb-4">{t(lang, "footer.about")}</p>
          <Disclaimer lang={lang} />
          <p className="mt-4 max-w-sm font-mono text-[10px] leading-relaxed text-muted/80">
            {t(lang, "footer.note")}
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-8">
          <span className="ed-meta">© 2026 ASEAN BRIDGE</span>
          <span className="ed-meta text-right">
            SET IN FRAUNCES &amp; IBM PLEX · NEXT.JS 15
          </span>
        </div>
      </div>
    </footer>
  );
}
