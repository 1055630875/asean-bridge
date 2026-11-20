import seed from "./seed.json";

type Lang = "zh" | "en" | "id";
type L10n = Record<string, string>;

const LANGS: Lang[] = ["zh", "en", "id"];
const parseLang = (value: unknown): Lang =>
  LANGS.includes(value as Lang) ? (value as Lang) : "zh";

const COUNTRY_NAMES: Record<string, L10n> = {};
const COUNTRY_STATUS: Record<string, string> = {};
for (const c of seed.countries as any[]) {
  COUNTRY_NAMES[c.code] = c.name;
  COUNTRY_STATUS[c.code] = c.status ?? "ready";
}
const UNAVAILABLE = new Set(
  Object.entries(COUNTRY_STATUS)
    .filter(([, status]) => status === "unavailable")
    .map(([code]) => code),
);

const SOURCE: Record<string, any> = {};
for (const s of seed.sources as any[]) SOURCE[s.id] = s;

type Fact = {
  key: string;
  country: string;
  domain: string;
  field: string;
  value: L10n;
  n: number | null;
  asOf: string;
  sourceId: string;
};

const FACTS: Fact[] = Object.entries(seed.facts as Record<string, any>).map(
  ([key, f]) => {
    const [country, domain, field] = key.split(":");
    return {
      key,
      country,
      domain,
      field,
      value: f.value,
      n: f.n ?? null,
      asOf: f.asOf,
      sourceId: f.sourceId,
    };
  },
);

const DOMAIN_NAMES: Record<string, L10n> = {};
for (const d of seed.domains as any[]) DOMAIN_NAMES[d.code] = d.name;

const LABELS: Record<string, L10n> = {};
for (const rows of Object.values(seed.rows as Record<string, any[]>)) {
  for (const row of rows) LABELS[row.key] = row.label;
}

const ALIASES: Record<string, string> = {
  印尼: "ID",
  大马: "MY",
  狮城: "SG",
  吴哥: "KH",
  暹粒: "KH",
  金边: "KH",
  蒲甘: "MM",
  仰光: "MM",
  下龙湾: "VN",
  会安: "VN",
  河内: "VN",
  胡志明: "VN",
  巴厘: "ID",
  雅加达: "ID",
  日惹: "ID",
  琅勃拉邦: "LA",
  万象: "LA",
  双子塔: "MY",
  槟城: "MY",
  马六甲: "MY",
  大皇宫: "TH",
  清迈: "TH",
  曼谷: "TH",
  长滩岛: "PH",
  宿务: "PH",
  圣淘沙: "SG",
  斯里巴加湾: "BN",
};

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  food: ["美食", "吃", "菜", "街头", "辣", "food", "eat", "dish", "street", "kuliner", "makan", "pedas", "hidangan", "masakan", "khas"],
  places: ["景点", "玩", "城市", "遗产", "风景", "季节", "什么时候", "必去", "地方", "去哪", "place", "visit", "heritage", "season", "destinasi", "wisata", "kota", "tempat"],
  culture: ["文化", "人文", "习俗", "礼仪", "节日", "节庆", "节", "泼水节", "水灯节", "开斋节", "宗教", "culture", "custom", "festival", "etiquette", "songkran", "budaya", "adat", "agama"],
  travel: ["货币", "交通", "小费", "英语", "实用", "currency", "transport", "tipping", "english", "practical", "uang", "transportasi"],
};

const KEY_HINTS: Record<string, string[]> = {
  signature: ["代表菜", "招牌菜", "吃什么", "signature", "hidangan khas", "masakan khas"],
  spice: ["辣", "pedas", "spicy", "heat"],
  street: ["街头", "小吃", "street", "jajanan"],
  drink: ["喝", "饮品", "咖啡", "茶", "drink", "kopi", "minuman"],
  currency: ["货币", "钱", "currency", "uang", "mata uang"],
  english: ["英语", "english", "bahasa inggris"],
  transport: ["交通", "怎么去", "transport", "transportasi"],
  connect: ["网络", "插座", "sim", "wifi", "internet", "colokan"],
  tipping: ["小费", "tip"],
  landmark: ["景点", "地标", "必去", "landmark", "wajib"],
  season: ["季节", "什么时候", "最佳", "best time", "musim"],
  daytrip: ["一日游", "day trip", "sehari"],
  heritage: ["遗产", "heritage", "warisan"],
  festival: ["节", "泼水", "festival", "songkran"],
  greeting: ["问候", "打招呼", "greeting", "salam"],
  dress: ["穿", "着装", "禁忌", "dress", "busana"],
  etiquette: ["礼仪", "禁忌", "etiquette", "adat"],
};

const PREFERRED = new Set([
  "signature", "spice", "street", "landmark", "season",
  "festival", "greeting", "transport",
]);

const ASEAN_WORDS = ["东盟", "东南亚", "asean", "southeast asia", "asia tenggara"];

const DISH_ALIASES: Record<string, string> = {
  阿斗波: "PH",
  adobo: "PH",
  烤乳猪: "PH",
  lechon: "PH",
  sinigang: "PH",
  河粉: "VN",
  pho: "VN",
  "banh mi": "VN",
  法棍: "VN",
  "nasi lemak": "MY",
  椰浆饭: "MY",
  "tom yum": "TH",
  冬阴功: "TH",
  rendang: "ID",
  仁当: "ID",
  沙爹: "ID",
  satay: "ID",
  mohinga: "MM",
  茶叶沙拉: "MM",
  laap: "LA",
  拉普: "LA",
  amok: "KH",
  阿莫克: "KH",
  ambuyat: "BN",
  安布雅: "BN",
  "chili crab": "SG",
  辣椒螃蟹: "SG",
};

function detectCountries(question: string): string[] {
  const ql = question.toLowerCase();
  if (ASEAN_WORDS.some((w) => ql.includes(w))) {
    return Object.keys(COUNTRY_NAMES);
  }
  const found: string[] = [];
  for (const [code, names] of Object.entries(COUNTRY_NAMES)) {
    if (Object.values(names).some((n) => ql.includes(String(n).toLowerCase()))) {
      found.push(code);
    }
  }
  for (const [alias, code] of Object.entries(ALIASES)) {
    if (question.includes(alias) && !found.includes(code)) found.push(code);
  }
  for (const [dish, code] of Object.entries(DISH_ALIASES)) {
    if (ql.includes(dish) && !found.includes(code)) found.push(code);
  }
  if (!found.length) {
    for (const code of Object.keys(COUNTRY_NAMES)) {
      if (new RegExp(`\\b${code}\\b`).test(question)) found.push(code);
    }
  }
  return [...new Set(found)].slice(0, 10);
}

function detectDomains(question: string): string[] {
  const ql = question.toLowerCase();
  const domains = Object.entries(DOMAIN_KEYWORDS)
    .filter(([, words]) => words.some((w) => ql.includes(w.toLowerCase())))
    .map(([domain]) => domain);
  if (domains.includes("culture") && domains.length > 1) {
    return ["culture"];
  }
  return domains;
}

type PublicFact = {
  country: string;
  domain: string;
  key: string;
  value: string;
  as_of: string;
  source: {
    id: string;
    issuer: string;
    title: string;
    url: string;
    retrieved: string;
    tier: number;
  };
};

function factPublic(f: Fact, lang: Lang): PublicFact {
  const source = SOURCE[f.sourceId] ?? {};
  return {
    country: f.country,
    domain: f.domain,
    key: f.field,
    value: f.value[lang] ?? f.value.en ?? "",
    as_of: f.asOf,
    source: {
      id: source.id ?? f.sourceId,
      issuer: source.issuer ?? f.sourceId,
      title: source.title?.[lang] ?? source.title?.en ?? "",
      url: source.url ?? "",
      retrieved: source.retrieved ?? "",
      tier: source.tier ?? 1,
    },
  };
}

function retrieve(question: string, lang: Lang, topK = 8): PublicFact[] {
  const countries = detectCountries(question);
  const domains = detectDomains(question);
  let rows = FACTS;
  if (countries.length) rows = rows.filter((f) => countries.includes(f.country));
  if (domains.length) {
    const narrowed = rows.filter((f) => domains.includes(f.domain));
    if (narrowed.length >= 3) rows = narrowed;
  }

  const q = question.toLowerCase();
  const tokens = new Set(q.match(/[a-z]{3,}|[\u4e00-\u9fff]{2,}/g) ?? []);
  const score = (f: Fact): number => {
    let s = 0;
    if (domains.includes(f.domain)) s += 6;
    if (countries.includes(f.country)) s += 4;
    const hints = KEY_HINTS[f.field] ?? [];
    if (hints.some((h) => q.includes(h.toLowerCase()))) s += 5;
    const text = `${f.domain} ${f.field} ${(f.value[lang] ?? "").toLowerCase()}`;
    for (const token of tokens) if (text.includes(token)) s += 2;
    if (PREFERRED.has(f.field)) s += 1;
    return s;
  };

  const ranked = rows
    .map((f) => ({ f, s: score(f) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.f);

  const out: Fact[] = [];
  const per = new Map<string, number>();
  for (const f of ranked) {
    const key = `${f.country}:${f.domain}`;
    if ((per.get(key) ?? 0) >= 3) continue;
    per.set(key, (per.get(key) ?? 0) + 1);
    out.push(f);
    if (out.length >= topK) break;
  }
  return out.map((f) => factPublic(f, lang));
}

function countryName(code: string, lang: Lang): string {
  return COUNTRY_NAMES[code]?.[lang] ?? code;
}

function labelFor(key: string, lang: Lang): string {
  return LABELS[key]?.[lang] ?? key;
}

type Citation = {
  marker: string;
  source_id: string;
  issuer: string;
  title: string;
  url: string;
  retrieved: string;
  quote: string;
  country: string;
  domain: string;
};

function composeExtractive(
  facts: PublicFact[],
  lang: Lang,
): { answer: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const markerOf = new Map<string, string>();

  const cite = (f: PublicFact): string => {
    const key = `${f.country}:${f.domain}:${f.key}`;
    const existing = markerOf.get(key);
    if (existing) return existing;
    const marker = `S${citations.length + 1}`;
    markerOf.set(key, marker);
    citations.push({
      marker,
      source_id: f.source.id,
      issuer: f.source.issuer,
      title: f.source.title,
      url: f.source.url,
      retrieved: f.source.retrieved,
      quote: f.value,
      country: f.country,
      domain: f.domain,
    });
    return marker;
  };

  const countries: string[] = [];
  for (const f of facts) if (!countries.includes(f.country)) countries.push(f.country);

  const lines: string[] = [];
  if (lang === "zh") {
    lines.push("以下依据站内已收录内容整理。");
    for (const c of countries) {
      const own = facts.filter((f) => f.country === c).slice(0, 3);
      const parts = own.map(
        (f) => `${labelFor(f.key, lang)}是${f.value} [${cite(f)}]`,
      );
      lines.push(`${countryName(c, lang)}：${parts.join("；")}。`);
    }
    if (countries.length === 2) {
      const [a, b] = countries;
      const shared = facts.find(
        (f) =>
          f.country === a &&
          facts.some((g) => g.country === b && g.key === f.key),
      );
      if (shared) {
        const other = facts.find(
          (g) => g.country === b && g.key === shared.key,
        )!;
        lines.push(
          `就${labelFor(shared.key, lang)}而言，${countryName(a, lang)}为${shared.value}，` +
            `${countryName(b, lang)}为${other.value} [${cite(shared)}][${cite(other)}]。`,
        );
      }
    }
    lines.push("以上为编辑整理与示例评分，出行前请核对官方信息。");
  } else if (lang === "en") {
    lines.push("Based on the entries in the library:");
    for (const c of countries) {
      const own = facts.filter((f) => f.country === c).slice(0, 3);
      const parts = own.map(
        (f) => `${labelFor(f.key, lang)}: ${f.value} [${cite(f)}]`,
      );
      lines.push(`${countryName(c, lang)} — ${parts.join("; ")}.`);
    }
    if (countries.length === 2) {
      const [a, b] = countries;
      const shared = facts.find(
        (f) =>
          f.country === a &&
          facts.some((g) => g.country === b && g.key === f.key),
      );
      if (shared) {
        const other = facts.find(
          (g) => g.country === b && g.key === shared.key,
        )!;
        lines.push(
          `On ${labelFor(shared.key, lang).toLowerCase()}, ${countryName(a, lang)} is ${shared.value}, ` +
            `while ${countryName(b, lang)} is ${other.value} [${cite(shared)}][${cite(other)}].`,
        );
      }
    }
    lines.push("Editorial sample content — check official sources before you travel.");
  } else {
    lines.push("Berdasarkan entri di pustaka:");
    for (const c of countries) {
      const own = facts.filter((f) => f.country === c).slice(0, 3);
      const parts = own.map(
        (f) => `${labelFor(f.key, lang)}: ${f.value} [${cite(f)}]`,
      );
      lines.push(`${countryName(c, lang)} — ${parts.join("; ")}.`);
    }
    if (countries.length === 2) {
      const [a, b] = countries;
      const shared = facts.find(
        (f) =>
          f.country === a &&
          facts.some((g) => g.country === b && g.key === f.key),
      );
      if (shared) {
        const other = facts.find(
          (g) => g.country === b && g.key === shared.key,
        )!;
        lines.push(
          `Untuk ${labelFor(shared.key, lang).toLowerCase()}, ${countryName(a, lang)} ${shared.value}, ` +
            `sedangkan ${countryName(b, lang)} ${other.value} [${cite(shared)}][${cite(other)}].`,
        );
      }
    }
    lines.push("Konten contoh editorial — cek sumber resmi sebelum berangkat.");
  }

  return { answer: lines.join("\n\n"), citations };
}

function verifyAnswer(
  answer: string,
  citations: Citation[],
  lang: Lang,
): { text: string; stats: { sentences: number; verified: number; removed: number } } {
  const byMarker = new Map(citations.map((c) => [c.marker, c]));
  let verified = 0;
  let removed = 0;
  const keptParagraphs: string[] = [];
  const joiner = lang === "en" ? " " : "";

  for (const paragraph of answer.split("\n\n")) {
    if (!paragraph.trim()) continue;
    const kept: string[] = [];
    for (const raw of paragraph.split(/(?<=[。！？.!?])\s*/)) {
      const sentence = raw.trim();
      if (!sentence) continue;
      const markers = [...sentence.matchAll(/\[(S\d+)\]/g)].map((m) => m[1]);
      if (!markers.length) {
        kept.push(sentence);
        continue;
      }
      if (markers.some((m) => !byMarker.has(m))) {
        removed += 1;
        continue;
      }
      const clean = sentence.replace(/\[S\d+\]/g, "");
      const nums = new Set(clean.match(/\d+(?:\.\d+)?/g) ?? []);
      const allowed = new Set<string>();
      for (const marker of markers) {
        for (const n of byMarker.get(marker)?.quote.match(/\d+(?:\.\d+)?/g) ?? []) {
          allowed.add(n);
        }
      }
      if (nums.size && [...nums].some((n) => !allowed.has(n))) {
        removed += 1;
        continue;
      }
      verified += 1;
      kept.push(sentence);
    }
    if (kept.length) keptParagraphs.push(kept.join(joiner));
  }

  let text = keptParagraphs.join("\n\n");
  if (removed) text += `\n\n（已移除 ${removed} 条无法核验的表述）`;
  return { text, stats: { sentences: verified + removed, verified, removed } };
}

async function callLLM(
  question: string,
  lang: Lang,
  facts: PublicFact[],
): Promise<{ content: string | null; error: string | null }> {
  const base = process.env.LLM_BASE_URL;
  const key = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!base || !model) return { content: null, error: null };

  const evidence = facts
    .map(
      (f, i) =>
        `[S${i + 1}] (${f.country} · ${f.domain}) ${f.value} — ${f.source.issuer}, as of ${f.as_of}`,
    )
    .join("\n");
  const langName = { zh: "Chinese", en: "English", id: "Indonesian" }[lang];
  const messages = [
    {
      role: "system",
      content:
        "You are the editor of ASEAN Bridge, a food / places / culture guide. " +
        "Answer ONLY from the numbered evidence. Every factual sentence must end with [S#] markers copied from the evidence. " +
        "Never invent numbers, dates, dishes, places or sources. If evidence is insufficient, say so. " +
        `3 to 6 short sentences, no markdown tables or lists. Write in ${langName}.`,
    },
    {
      role: "user",
      content: `Question: ${question}\n\nNumbered evidence:\n${evidence}\n\nWrite the answer now.`,
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      return { content: null, error: `HTTP ${res.status}: ${body}` };
    }
    const data: any = await res.json();
    return { content: data.choices?.[0]?.message?.content ?? null, error: null };
  } catch (error) {
    return {
      content: null,
      error: error instanceof Error ? error.message : "llm request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: any) => {
  const started = Date.now();
  if (event.httpMethod !== "POST") {
    return json(405, { error: "method not allowed" });
  }

  let payload: any;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return json(400, { error: "invalid json" });
  }

  const question = String(payload.question ?? "").trim().slice(0, 500);
  const lang = parseLang(payload.lang);
  if (!question) return json(422, { error: "question is required" });

  const detected = detectCountries(question);
  const insufficient = (message: string) =>
    json(200, {
      answer_md: message,
      answer_status: "insufficient_evidence",
      mode: "extractive",
      model: { name: null, base_url: null },
      fallback_reason: null,
      citations: [],
      latency_ms: Date.now() - started,
      verification: { sentences: 0, verified: 0, removed: 0 },
    });

  if (!detected.length) {
    return insufficient({
      zh: "请先告诉我国家，例如「泰国」「越南」或「吴哥窟」，我再查美食、景点与习俗。",
      en: "Tell me a country first — for example “Thailand”, “Vietnam” or “Angkor Wat” — and I’ll check food, places and customs.",
      id: "Sebutkan negaranya dulu — misalnya “Thailand”, “Vietnam”, atau “Angkor Wat” — lalu saya cek kuliner, tempat, dan adatnya.",
    }[lang]);
  }

  const blocked = detected.filter((c) => UNAVAILABLE.has(c));
  if (blocked.length) {
    const names = blocked.map((c) => countryName(c, lang)).join("、");
    return insufficient({
      zh: `${names} 暂无可用官方来源，暂不提供内容与对比。`,
      en: `No official source is available for ${names}; no content or comparison is provided.`,
      id: `Belum ada sumber resmi untuk ${names}; konten dan perbandingan tidak disediakan.`,
    }[lang]);
  }

  const facts = retrieve(question, lang, detected.length > 2 ? 12 : 8);
  if (!facts.length) {
    return insufficient({
      zh: "站内已收录内容中没有找到相关资料。可以换个说法，或先浏览十国档案。",
      en: "No matching entry in the library yet. Try another wording or browse the country dossiers.",
      id: "Belum ada entri yang cocok di pustaka. Coba kata lain atau buka profil negara.",
    }[lang]);
  }

  const extracted = composeExtractive(facts, lang);
  let answer = extracted.answer;
  let citations = extracted.citations;
  let mode: "extractive" | "llm" = "extractive";
  let fallbackReason: string | null = null;

  const llm = await callLLM(question, lang, facts);
  if (llm.content) {
    answer = llm.content;
    citations = facts.map((f, i) => ({
      marker: `S${i + 1}`,
      source_id: f.source.id,
      issuer: f.source.issuer,
      title: f.source.title,
      url: f.source.url,
      retrieved: f.source.retrieved,
      quote: f.value,
      country: f.country,
      domain: f.domain,
    }));
    mode = "llm";
  } else if (llm.error) {
    fallbackReason = llm.error;
  }

  let verified = verifyAnswer(answer, citations, lang);
  if (mode === "llm" && verified.stats.verified === 0) {
    answer = extracted.answer;
    citations = extracted.citations;
    mode = "extractive";
    fallbackReason = "llm answer failed citation verification";
    verified = verifyAnswer(answer, citations, lang);
  }

  return json(200, {
    answer_md: verified.text,
    answer_status: verified.stats.verified > 0 ? "answered" : "partial",
    mode,
    model: {
      name: mode === "llm" ? process.env.LLM_MODEL ?? null : null,
      base_url: mode === "llm" ? process.env.LLM_BASE_URL ?? null : null,
    },
    fallback_reason: fallbackReason,
    citations,
    latency_ms: Date.now() - started,
    verification: verified.stats,
  });
};
