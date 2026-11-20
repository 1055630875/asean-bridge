"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type GalleryItem = {
  code: string;
  name: string;
  dish: string;
  href: string;
  image: string;
};

export type GalleryCopy = {
  kicker: string;
  title: string;
  sub: string;
  scroll: string;
  prev: string;
  next: string;
};

const SIZES = [
  "w-[84vw] sm:w-[400px]",
  "w-[76vw] sm:w-[330px]",
  "w-[70vw] sm:w-[280px]",
] as const;

export function GalleryStrip({
  items,
  copy,
}: {
  items: GalleryItem[];
  copy: GalleryCopy;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const nudge = (direction: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(280, el.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const el = stripRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = stripRef.current;
    if (!el) return;
    const delta = event.clientX - drag.current.startX;
    if (Math.abs(delta) > 5) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - delta;
  };

  const snapToNearest = () => {
    const el = stripRef.current;
    if (!el) return;
    const stripLeft = el.getBoundingClientRect().left;
    const viewCenter = el.scrollLeft + el.clientWidth / 2;

    let nearest: HTMLElement | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const child of Array.from(el.children) as HTMLElement[]) {
      const left =
        child.getBoundingClientRect().left - stripLeft + el.scrollLeft;
      const center = left + child.offsetWidth / 2;
      const distance = Math.abs(center - viewCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = child;
      }
    }

    nearest?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  const endDrag = () => {
    const wasMoved = drag.current.moved;
    drag.current.active = false;
    if (!wasMoved) return;

    window.setTimeout(snapToNearest, 10);
    window.setTimeout(() => {
      drag.current.moved = false;
    }, 250);
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  return (
    <section className="ed-gallery border-b border-line py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ed-kicker">{copy.kicker}</p>
            <h2 className="ed-display mt-3 text-balance text-[28px] text-ink sm:text-[40px]">
              {copy.title}
            </h2>
            <p className="ed-lede mt-2 max-w-xl text-[14px]">{copy.sub}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="ed-meta mr-2 hidden sm:block">{copy.scroll}</span>
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={!canPrev}
              aria-label={copy.prev}
              className="hidden h-8 w-8 place-items-center border border-line-strong text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 sm:grid"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={!canNext}
              aria-label={copy.next}
              className="hidden h-8 w-8 place-items-center border border-line-strong text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 sm:grid"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div
          ref={stripRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          className="ed-gallery__strip mt-8 flex cursor-grab snap-x snap-mandatory items-start gap-4 overflow-x-auto px-5 pb-4 select-none active:cursor-grabbing sm:gap-8 sm:px-8"
        >
          {items.map((item, index) => (
            <Link
              key={item.code}
              href={item.href}
              className={`group shrink-0 snap-start ${SIZES[index % SIZES.length]}`}
            >
              <figure className="border border-line bg-paper-2 p-0">
                <img
                  src={item.image}
                  alt={item.name}
                  draggable={false}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="aspect-[3/2] w-full object-cover"
                />
              </figure>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <h3 className="ed-display text-[20px] leading-tight text-ink">
                  {item.name}
                </h3>
                <span className="ed-meta text-muted">
                  {item.code} · {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="ed-meta mt-1 truncate text-muted/80">{item.dish}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
