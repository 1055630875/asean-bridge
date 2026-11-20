import { COUNTRIES, countryImage, getFact } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { GalleryStrip, type GalleryCopy, type GalleryItem } from "./GalleryStrip";

const COPY: Record<Lang, GalleryCopy> = {
  zh: {
    kicker: "影像带 / IMAGE STRIP",
    title: "十国，一屏一帧",
    sub: "横向滑动，点开任一帧进入国家档案。",
    scroll: "SCROLL →",
    prev: "上一帧",
    next: "下一帧",
  },
  en: {
    kicker: "IMAGE STRIP",
    title: "Ten markets, one frame each",
    sub: "Scroll sideways; open any frame as a country dossier.",
    scroll: "SCROLL →",
    prev: "Previous frame",
    next: "Next frame",
  },
  id: {
    kicker: "PITA GAMBAR",
    title: "Sepuluh negara, satu bingkai",
    sub: "Geser menyamping; buka bingkai mana pun sebagai profil negara.",
    scroll: "SCROLL →",
    prev: "Bingkai sebelumnya",
    next: "Bingkai berikutnya",
  },
};

export function CountryGallery({ lang }: { lang: Lang }) {
  const items: GalleryItem[] = COUNTRIES.map((country) => {
    const dish = getFact(country.code, "food", "signature");
    return {
      code: country.code,
      name: country.name[lang],
      dish: dish ? dish.value[lang] : "—",
      href: `/${lang}/countries/${country.code}`,
      image: countryImage(country.code),
    };
  });

  return <GalleryStrip items={items} copy={COPY[lang]} />;
}
