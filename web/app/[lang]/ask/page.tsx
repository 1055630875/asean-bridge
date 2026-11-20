"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container } from "@/components/Ui";
import { AskClient } from "@/components/AskClient";
import { isLang, type Lang } from "@/lib/i18n";

export default function AskPage() {
  const params = useParams<{ lang: string }>();
  const lang: Lang = params?.lang && isLang(params.lang) ? params.lang : "zh";
  const [question, setQuestion] = useState<string | undefined>(undefined);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setQuestion(query);
  }, []);

  return (
    <Container>
      <div className="py-10 sm:py-14">
        <p className="ed-kicker">
          {lang === "zh" ? "问答 / ASK" : lang === "id" ? "TANYA / ASK" : "ASK"}
        </p>
        <h1 className="ed-display mt-3 max-w-2xl text-balance text-[30px] text-ink sm:text-[46px]">
          {lang === "zh"
            ? "问一句，聊聊东盟的风土"
            : lang === "id"
              ? "Tanya soal kuliner, tempat, dan adat"
              : "Ask about food, places and customs"}
        </h1>
        <p className="ed-lede mt-3 max-w-2xl text-[14px]">
          {lang === "zh"
            ? "回答只基于站内资料；每一句都能点开来源。"
            : lang === "id"
              ? "Jawaban hanya dari pustaka situs; setiap kalimat membuka sumbernya."
              : "Answers use the on-site library only; every sentence opens its source."}
        </p>
        <div className="mt-8">
          <AskClient lang={lang} initialQuestion={question} />
        </div>
      </div>
    </Container>
  );
}
