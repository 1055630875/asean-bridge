"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export function LangSwitcher({ lang }: { lang: Lang }) {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/");

  return (
    <div
      className="flex items-center gap-1.5"
      role="navigation"
      aria-label="Language"
    >
      {LANGS.map((item, index) => {
        const next = [...parts];
        next[1] = item;
        const href = next.join("/") || `/${item}`;
        const active = item === lang;
        return (
          <span key={item} className="flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden className="ed-meta text-[9px] text-line-strong">
                /
              </span>
            ) : null}
            <Link
              href={href}
              aria-current={active ? "true" : undefined}
              className="ed-lang-link"
            >
              {item.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
