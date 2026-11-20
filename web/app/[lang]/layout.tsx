import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../globals.css";
import { Header } from "@/components/Header";
import { DemoBanner, Footer } from "@/components/Chrome";
import { isLang, LANGS } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "东盟桥 · ASEAN Bridge",
    template: "%s · 东盟桥",
  },
  description:
    "东盟十国美食、景点与人文指南：国家档案、风物对比、带出处的问答。中文 / English / Bahasa。",
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang}>
      <body className="flex min-h-screen flex-col">
        <DemoBanner lang={lang} />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
