"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";
import { LangSwitcher } from "./LangSwitcher";

const NAV = [
  { href: "", key: "nav.home" },
  { href: "/countries", key: "nav.countries" },
  { href: "/compare", key: "nav.compare" },
  { href: "/ask", key: "nav.ask" },
  { href: "/sources", key: "nav.sources" },
] as const;

export function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname() || "";
  const isActive = (href: string) => {
    const base = `/${lang}${href}`;
    return href === ""
      ? pathname === base || pathname === `${base}/`
      : pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <header className="ed-masthead sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-3 sm:px-8">
        <Link href={`/${lang}`} className="group flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center border border-line-strong font-mono text-[10px] tracking-[0.06em] text-ink-soft"
          >
            AB
          </span>
          <span className="flex flex-col">
            <span className="ed-wordmark text-[19px] text-ink">
              {t(lang, "brand.name")}
            </span>
            <span className="ed-meta mt-1 hidden text-[8px] tracking-[0.16em] sm:block">
              FOOD · PLACES · CULTURE
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={`/${lang}${item.href}`}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="ed-nav-link"
            >
              {t(lang, item.key)}
            </Link>
          ))}
        </nav>

        <LangSwitcher lang={lang} />
      </div>

      <div className="border-t border-line/70 md:hidden">
        <nav
          className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-5 py-2 sm:px-8"
          aria-label="Main mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={`/${lang}${item.href}`}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="ed-nav-link shrink-0"
            >
              {t(lang, item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
