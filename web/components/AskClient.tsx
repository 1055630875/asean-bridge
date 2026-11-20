"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { DEMO_ANSWER, sourceById } from "@/lib/data";

type Citation = {
  marker: string;
  source_id?: string;
  issuer: string;
  title: string;
  url: string;
  retrieved: string;
  quote?: string;
  country?: string;
  domain?: string;
};

type Msg = {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  streaming?: boolean;
  mode?: "extractive" | "llm" | "local";
  modelName?: string;
  fallback?: string;
  verified?: number;
  sentences?: number;
};

type AskResponse = {
  answer_md: string;
  answer_status: "answered" | "partial" | "insufficient_evidence";
  mode: "extractive" | "llm";
  citations: Citation[];
  latency_ms: number;
  model?: { name?: string | null };
  fallback_reason?: string | null;
  verification: { sentences: number; verified: number; removed: number };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function localFallback(lang: Lang): { answer: string; citations: Citation[] } {
  const demo = DEMO_ANSWER[lang];
  const citations: Citation[] = [];
  demo.citations.forEach((id, index) => {
    const source = sourceById(id);
    if (!source) return;
    citations.push({
      marker: `S${index + 1}`,
      source_id: id,
      issuer: source.issuer,
      title: source.title[lang],
      url: source.url,
      retrieved: source.retrieved,
      quote: "",
    });
  });
  return { answer: demo.answer, citations };
}

function groupCitations(citations?: Citation[]) {
  const groups: (Citation & { key: string; items: Citation[] })[] = [];
  const seen = new Map<string, Citation & { key: string; items: Citation[] }>();
  (citations ?? []).forEach((citation) => {
    const key = citation.source_id || `${citation.issuer}|${citation.title}`;
    let group = seen.get(key);
    if (!group) {
      group = { ...citation, key, items: [] };
      seen.set(key, group);
      groups.push(group);
    }
    group.items.push(citation);
  });
  return groups;
}

export function AskClient({
  lang,
  initialQuestion,
}: {
  lang: Lang;
  initialQuestion?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 1,
      role: "assistant",
      text: t(lang, "ask.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const ask = async (raw: string) => {
    const question = raw.trim();
    if (!question || busy) return;
    setBusy(true);
    setActiveMarker(null);

    const userId = Date.now();
    const assistantId = userId + 1;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text: question },
      { id: assistantId, role: "assistant", text: "", streaming: true },
    ]);

    let answer = "";
    let citations: Citation[] = [];
    let mode: Msg["mode"] = "extractive";
    let modelName: string | undefined;
    let fallback: string | undefined;
    let verified = 0;
    let sentences = 0;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`api ${res.status}`);
      const data = (await res.json()) as AskResponse;
      answer = data.answer_md;
      citations = data.citations ?? [];
      mode = data.mode;
      modelName = data.model?.name ?? undefined;
      fallback = data.fallback_reason ?? undefined;
      verified = data.verification?.verified ?? 0;
      sentences = data.verification?.sentences ?? 0;
    } catch {
      const local = localFallback(lang);
      answer = `${t(lang, "ask.error")}\n\n${local.answer}`;
      citations = local.citations;
      mode = "local";
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.id === assistantId ? { ...msg, mode } : msg)),
    );

    for (let index = 0; index <= answer.length; index += 2) {
      if (cancelled.current) return;
      const slice = answer.slice(0, index);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, text: slice } : msg,
        ),
      );
      await sleep(10);
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantId
          ? {
              ...msg,
              text: answer,
              streaming: false,
              citations,
              mode,
              modelName,
              fallback,
              verified,
              sentences,
            }
          : msg,
      ),
    );
    setBusy(false);
  };

  useEffect(() => {
    if (started.current || !initialQuestion) return;
    started.current = true;
    void ask(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const latestCitations = [...messages]
    .reverse()
    .find((msg) => msg.role === "assistant" && msg.citations?.length)
    ?.citations;
  const citationGroups = groupCitations(latestCitations);

  const numberFor = (marker?: string) => {
    if (!marker) return 0;
    const index = latestCitations?.findIndex(
      (citation) => citation.marker === marker,
    );
    return index !== undefined && index >= 0
      ? index + 1
      : Number(marker.replace(/\D/g, ""));
  };

  const suggestions = [
    t(lang, "ask.suggest1"),
    t(lang, "ask.suggest2"),
    t(lang, "ask.suggest3"),
  ];

  const renderText = (msg: Msg) => {
    const paragraphs = msg.text.split("\n\n");
    return paragraphs.map((paragraph, paragraphIndex) => {
      const parts = paragraph.split(/(\[S\d+\])/g);
      return (
        <p
          key={paragraphIndex}
          className={paragraphIndex === 0 ? "text-ink" : undefined}
        >
          {parts.map((part, partIndex) => {
            const match = part.match(/^\[(S\d+)\]$/);
            if (match) {
              const index = Number(match[1].slice(1)) - 1;
              const citation = msg.citations?.[index];
              return (
                <button
                  key={partIndex}
                  type="button"
                  onClick={() => setActiveMarker(match[1])}
                  title={
                    citation
                      ? `${citation.issuer} · ${citation.title}`
                      : match[1]
                  }
                  className={`mx-0.5 align-super font-mono text-[9px] transition ${
                    activeMarker === match[1]
                      ? "text-accent"
                      : "text-muted hover:text-accent"
                  }`}
                >
                  [{index + 1}]
                </button>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <p className="ed-meta">{t(lang, "ask.assistant")}</p>
          <p className="ed-meta">LIBRARY ONLY / NO WEB</p>
        </div>

        <div className="mt-6">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                className="mt-8 border-l-2 border-accent pl-4"
              >
                <p className="ed-meta text-accent">QUESTION</p>
                <p className="ed-display mt-2 text-[22px] leading-tight text-ink sm:text-[26px]">
                  {msg.text}
                </p>
              </div>
            ) : (
              <article
                key={msg.id}
                className="mt-5 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3"
              >
                <span className="ed-meta pt-1">AB</span>
                <div className="min-w-0">
                  <div className="answer text-[13px] leading-relaxed text-ink-soft">
                    {msg.text ? (
                      renderText(msg)
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss-mid" />
                        {t(lang, "ask.thinking")}
                      </span>
                    )}
                    {msg.streaming && msg.text ? (
                      <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-moss-mid align-middle" />
                    ) : null}
                  </div>

                  {!msg.streaming && msg.mode ? (
                    <p className="ed-meta mt-3">
                      {msg.mode === "llm"
                        ? `LLM / ${msg.modelName ?? "MODEL"}`
                        : msg.mode === "local"
                          ? "LOCAL FALLBACK"
                          : "EXTRACTIVE"}
                      {" · "}
                      {msg.verified ?? 0}/{msg.sentences ?? 0} VERIFIED
                      {msg.fallback ? (
                        <span className="text-accent"> · FALLBACK</span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </article>
            ),
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-8 border-t border-line pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={busy}
                onClick={() => {
                  void ask(suggestion);
                  setInput("");
                }}
                className="font-mono text-[10px] leading-relaxed text-muted underline decoration-line-strong underline-offset-4 transition hover:text-accent disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(input);
              setInput("");
            }}
            className="mt-4 flex items-end gap-3 border-b border-line-strong pb-2"
          >
            <label htmlFor="ask-input" className="sr-only">
              {t(lang, "ask.placeholder")}
            </label>
            <textarea
              id="ask-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void ask(input);
                  setInput("");
                }
              }}
              rows={1}
              placeholder={t(lang, "ask.placeholder")}
              className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-0 py-2 text-[13px] outline-none placeholder:text-muted/80"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center border border-ink bg-ink text-paper transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t(lang, "ask.send")}
            >
              <Send size={14} />
            </button>
          </form>
          <p className="ed-meta mt-2">{t(lang, "ask.enterHint")}</p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 className="ed-display text-[24px] text-ink">
            {t(lang, "ask.citations")}
          </h2>
          <span className="ed-meta">{latestCitations?.length ?? 0}</span>
        </div>

        <div className="mt-2">
          {!latestCitations || latestCitations.length === 0 ? (
            <p className="py-4 text-[11px] leading-relaxed text-muted">
              {t(lang, "ask.emptyPanel")}
            </p>
          ) : (
            citationGroups.map((group) => {
              const active = group.items.some(
                (item) => item.marker === activeMarker,
              );
              return (
                <div
                  key={group.key}
                  className={`border-b border-line py-4 ${
                    active ? "bg-paper-2/60" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="flex gap-1">
                      {group.items.map((item) => (
                        <button
                          key={item.marker}
                          type="button"
                          onClick={() => setActiveMarker(item.marker)}
                          className={`font-mono text-[9px] transition ${
                            activeMarker === item.marker
                              ? "text-accent"
                              : "text-muted hover:text-accent"
                          }`}
                        >
                          [{numberFor(item.marker)}]
                        </button>
                      ))}
                    </span>
                    <p className="text-[12px] font-semibold text-ink">
                      {group.issuer}
                    </p>
                  </div>

                  <a
                    href={group.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block font-mono text-[10px] leading-relaxed text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-accent"
                  >
                    {group.title}
                    <ArrowUpRight size={10} className="ml-1 inline" />
                  </a>

                  <div className="mt-2 space-y-1">
                    {group.items
                      .filter((item) => item.quote)
                      .slice(0, 3)
                      .map((item) => (
                        <p
                          key={item.marker}
                          className="border-l border-line-strong pl-2 text-[10px] leading-relaxed text-muted"
                        >
                          “{item.quote}”
                        </p>
                      ))}
                  </div>

                  <p className="ed-meta mt-2">
                    {t(lang, "sources.retrieved")} {group.retrieved}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-4 border-t border-line pt-3 text-[9px] leading-relaxed text-muted">
          {t(lang, "ask.demoNote")}
        </p>
      </aside>
    </div>
  );
}
