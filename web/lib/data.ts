import type { Lang } from "./i18n";

export type L10n = Record<Lang, string>;

export const L = (zh: string, en: string, id: string): L10n => ({ zh, en, id });

/* ------------------------------------------------------------------ */
/* Countries                                                           */
/* ------------------------------------------------------------------ */

export type CountryStatus = "ready" | "partial" | "soon" | "unavailable";

/**
 * Countries with no usable source at all. Empty: the three countries that
 * previously lacked an official portal now use a third-party, browser-usable
 * reference (Baidu Baike) and are marked ready with tier-3 sources.
 */
export const UNAVAILABLE_COUNTRIES = new Set<string>();

export type Country = {
  code: string;
  name: L10n;
  capital: L10n;
  currency: string;
  locale: string;
  status: CountryStatus;
  blurb: L10n;
  officialUrl: string;
};

export const COUNTRIES: Country[] = [
  {
    code: "ID",
    name: L("印度尼西亚", "Indonesia", "Indonesia"),
    capital: L("雅加达", "Jakarta", "Jakarta"),
    currency: "IDR",
    locale: "id",
    status: "ready",
    blurb: L(
      "一万七千座岛，香料路线从这里出发。炒饭、沙爹、仁当只是入口，真正的线索是椰浆、花生酱和参巴辣酱。",
      "Seventeen thousand islands and the old spice route. Fried rice, satay and rendang are only the entry point; coconut milk, peanut sauce and sambal are the real thread.",
      "Tujuh belas ribu pulau dan jalur rempah. Nasi goreng, sate, dan rendang hanyalah pintu masuk; santan, saus kacang, dan sambal adalah benang merahnya.",
    ),
    officialUrl: "https://www.indonesia.travel",
  },
  {
    code: "MY",
    name: L("马来西亚", "Malaysia", "Malaysia"),
    capital: L("吉隆坡", "Kuala Lumpur", "Kuala Lumpur"),
    currency: "MYR",
    locale: "ms",
    status: "ready",
    blurb: L(
      "马来、华人与印度厨房在同一张桌上。椰浆饭是全民早餐，槟城与马六甲则把老城和街头小吃一起端上来。",
      "Malay, Chinese and Indian kitchens share one table. Nasi lemak is the national breakfast; Penang and Melaka serve old towns with street food.",
      "Dapur Melayu, Tionghoa, dan India berbagi satu meja. Nasi lemak jadi sarapan nasional; Penang dan Melaka menyajikan kota tua plus kuliner jalanan.",
    ),
    officialUrl: "https://www.malaysia.travel",
  },
  {
    code: "TH",
    name: L("泰国", "Thailand", "Thailand"),
    capital: L("曼谷", "Bangkok", "Bangkok"),
    currency: "THB",
    locale: "th",
    status: "ready",
    blurb: L(
      "酸、辣、甜、咸在一口里打架。曼谷的夜市从傍晚开到深夜，北部清迈的节奏则慢半拍。",
      "Sour, hot, sweet and salty in one bite. Bangkok's night markets run late; Chiang Mai in the north moves half a beat slower.",
      "Asam, pedas, manis, dan asin dalam satu suapan. Pasar malam Bangkok buka larut; Chiang Mai di utara bergerak lebih pelan.",
    ),
    officialUrl: "https://www.tourismthailand.org",
  },
  {
    code: "VN",
    name: L("越南", "Vietnam", "Vietnam"),
    capital: L("河内", "Hanoi", "Hanoi"),
    currency: "VND",
    locale: "vi",
    status: "ready",
    blurb: L(
      "从河内到胡志明市，一路往南口味越甜。河粉、法棍、烤肉米线是街头三件套，鱼露和青柠负责提味。",
      "From Hanoi to Ho Chi Minh City, the food gets sweeter as you go south. Pho, banh mi and bun cha are the street trio; fish sauce and lime do the lifting.",
      "Dari Hanoi ke Ho Chi Minh City, rasa makin manis ke selatan. Pho, banh mi, dan bun cha adalah trio jalanan; kecap ikan dan jeruk nipis mengangkat rasanya.",
    ),
    officialUrl: "https://vietnam.travel",
  },
  {
    code: "SG",
    name: L("新加坡", "Singapore", "Singapura"),
    capital: L("新加坡", "Singapore", "Singapura"),
    currency: "SGD",
    locale: "en",
    status: "ready",
    blurb: L(
      "小岛把东南亚的厨房压缩进熟食中心。海南鸡饭、辣椒螃蟹、叻沙各有拥趸，点一杯 kopi 就能坐一下午。",
      "A small island that compressed Southeast Asia's kitchens into hawker centres. Chicken rice, chili crab and laksa all have their camps; order a kopi and stay a while.",
      "Pulau kecil yang memadatkan dapur Asia Tenggara ke pusat jajanan. Nasi ayam Hainan, kepiting cabai, dan laksa punya penggemarnya; pesan kopi dan duduklah.",
    ),
    officialUrl: "https://www.visitsingapore.com",
  },
  {
    code: "PH",
    name: L("菲律宾", "Philippines", "Filipina"),
    capital: L("马尼拉", "Manila", "Manila"),
    currency: "PHP",
    locale: "fil",
    status: "ready",
    blurb: L(
      "七千多座岛，酸、咸、甜在同一个盘子里。阿斗波、烤乳猪和 halo-halo 是入门，真正的主角是米饭和街头炭火。",
      "Seven thousand islands where sour, salty and sweet share one plate. Adobo, lechon and halo-halo are the entry point; rice and charcoal grills are the real leads.",
      "Tujuh ribu pulau dengan rasa asam, asin, dan manis di satu piring. Adobo, lechon, dan halo-halo adalah pintu masuk; nasi dan arang jalanan adalah pemeran utamanya.",
    ),
    officialUrl: "https://baike.baidu.com/item/菲律宾",
  },
  {
    code: "BN",
    name: L("文莱", "Brunei", "Brunei"),
    capital: L("斯里巴加湾市", "Bandar Seri Begawan", "Bandar Seri Begawan"),
    currency: "BND",
    locale: "ms",
    status: "ready",
    blurb: L(
      "婆罗洲北岸的小国，饮食清淡偏甜。安布雅是西米做的蘸食，水村甘榜亚逸还保留着河上的日常。",
      "A small state on Borneo's north coast with a mild, sweet-leaning palate. Ambuyat is sago dipped in sauce; Kampong Ayer still keeps life on the river.",
      "Negara kecil di pantai utara Borneo dengan rasa ringan dan manis. Ambuyat adalah sagu yang dicocol; Kampong Ayer masih menjaga hidup di sungai.",
    ),
    officialUrl: "https://www.bruneitourism.com",
  },
  {
    code: "KH",
    name: L("柬埔寨", "Cambodia", "Kamboja"),
    capital: L("金边", "Phnom Penh", "Phnom Penh"),
    currency: "KHR",
    locale: "km",
    status: "ready",
    blurb: L(
      "高棉厨房不靠辣椒取胜，靠的是柠檬草、姜黄和椰浆。吴哥之外，洞里萨湖的水上村庄同样值得留一天。",
      "Khmer cooking wins with lemongrass, turmeric and coconut rather than chili. Beyond Angkor, the floating villages on Tonle Sap deserve a day.",
      "Masakan Khmer menang lewat serai, kunyit, dan santan, bukan cabai. Selain Angkor, desa terapung di Tonle Sap layak satu hari.",
    ),
    officialUrl: "https://www.tourismcambodia.com",
  },
  {
    code: "LA",
    name: L("老挝", "Laos", "Laos"),
    capital: L("万象", "Vientiane", "Vientiane"),
    currency: "LAK",
    locale: "lo",
    status: "ready",
    blurb: L(
      "糯米、拉普和一条慢下来的湄公河。清晨的布施、光西瀑布和琅勃拉邦的寺庙，把节奏压得很低。",
      "Sticky rice, laap and a slower Mekong. Morning alms, Kuang Si falls and Luang Prabang's temples keep the pace low.",
      "Nasi ketan, laap, dan Mekong yang lebih pelan. Sedekah pagi, Air Terjun Kuang Si, dan kuil Luang Prabang menjaga ritme tetap tenang.",
    ),
    officialUrl: "https://baike.baidu.com/item/老挝",
  },
  {
    code: "MM",
    name: L("缅甸", "Myanmar", "Myanmar"),
    capital: L("内比都", "Naypyidaw", "Naypyidaw"),
    currency: "MMK",
    locale: "my",
    status: "ready",
    blurb: L(
      "佛塔、湖上和茶叶沙拉。蒲甘的日出、茵莱湖的水上菜园、仰光的环线火车，构成了最日常的缅甸。",
      "Pagodas, lake life and tea-leaf salad. Bagan at sunrise, Inle Lake's floating gardens and Yangon's circle line make up everyday Myanmar.",
      "Pagoda, kehidupan danau, dan salad daun teh. Matahari terbit Bagan, kebun terapung Inle, dan kereta lingkar Yangon adalah Myanmar sehari-hari.",
    ),
    officialUrl: "https://baike.baidu.com/item/缅甸",
  },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function countryImage(code: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}/images/${code.toUpperCase()}.jpg`;
}

export function countryDomainImage(code: string, domain: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const suffix = domain === "places" ? "" : `-${domain}`;
  return `${basePath}/images/${code.toUpperCase()}${suffix}.jpg`;
}

/* ------------------------------------------------------------------ */
/* Themes and comparable rows                                          */
/* ------------------------------------------------------------------ */

export type DomainIcon = "food" | "places" | "culture" | "travel";

export type Domain = {
  code: string;
  name: L10n;
  blurb: L10n;
  icon: DomainIcon;
};

export const DOMAINS: Domain[] = [
  {
    code: "food",
    name: L("美食与味觉", "Food & flavours", "Kuliner"),
    blurb: L(
      "代表菜、辣度、主食",
      "Signature dishes, heat, staples",
      "Hidangan khas, pedas, makanan pokok",
    ),
    icon: "food",
  },
  {
    code: "places",
    name: L("景点与风景", "Places & scenery", "Tempat & lanskap"),
    blurb: L(
      "必去地标、世界遗产、季节",
      "Must-sees, heritage, seasons",
      "Wajib kunjung, warisan, musim",
    ),
    icon: "places",
  },
  {
    code: "culture",
    name: L("人文与习俗", "Culture & customs", "Budaya & adat"),
    blurb: L(
      "信仰、礼仪、节庆",
      "Faith, etiquette, festivals",
      "Kepercayaan, etiket, festival",
    ),
    icon: "culture",
  },
  {
    code: "travel",
    name: L("旅行实用", "Travel essentials", "Praktis"),
    blurb: L(
      "货币、语言、小费",
      "Currency, language, tipping",
      "Mata uang, bahasa, tip",
    ),
    icon: "travel",
  },
];

export function getDomain(code: string): Domain | undefined {
  return DOMAINS.find((d) => d.code === code);
}

export type RowKind = "text" | "score";

export type Row = {
  key: string;
  label: L10n;
  kind: RowKind;
  higherLabel?: { a: L10n; b: L10n };
};

export const DOMAIN_ROWS: Record<string, Row[]> = {
  food: [
    {
      key: "signature",
      label: L("代表菜", "Signature dish", "Hidangan khas"),
      kind: "text",
    },
    {
      key: "spice",
      label: L("辣度（编辑评分）", "Heat (editorial)", "Pedas (editorial)"),
      kind: "score",
      higherLabel: {
        a: L("A 更辣", "A hotter", "A lebih pedas"),
        b: L("B 更辣", "B hotter", "B lebih pedas"),
      },
    },
    {
      key: "staple",
      label: L("主食", "Staple", "Makanan pokok"),
      kind: "text",
    },
    {
      key: "street",
      label: L("街头必吃", "Street must-try", "Jajanan wajib"),
      kind: "text",
    },
    {
      key: "drink",
      label: L("国民饮品", "Signature drink", "Minuman khas"),
      kind: "text",
    },
  ],
  places: [
    {
      key: "landmark",
      label: L("必去地标", "Must-see", "Wajib kunjung"),
      kind: "text",
    },
    {
      key: "heritage",
      label: L("世界遗产", "World heritage", "Warisan dunia"),
      kind: "text",
    },
    {
      key: "season",
      label: L("最佳季节", "Best season", "Musim terbaik"),
      kind: "text",
    },
    {
      key: "city",
      label: L("推荐落脚城市", "Where to base", "Kota pangkalan"),
      kind: "text",
    },
    {
      key: "daytrip",
      label: L("一日游", "Day trip", "Sehari"),
      kind: "text",
    },
  ],
  culture: [
    {
      key: "religion",
      label: L("主要信仰", "Main faith", "Kepercayaan utama"),
      kind: "text",
    },
    {
      key: "etiquette",
      label: L("社交礼仪", "Etiquette", "Etiket sosial"),
      kind: "text",
    },
    {
      key: "festival",
      label: L("代表性节庆", "Signature festival", "Festival ikonik"),
      kind: "text",
    },
    {
      key: "greeting",
      label: L("问候语", "Greeting", "Salam"),
      kind: "text",
    },
    {
      key: "dress",
      label: L("着装与禁忌", "Dress & taboos", "Busana & pantangan"),
      kind: "text",
    },
  ],
  travel: [
    {
      key: "currency",
      label: L("货币", "Currency", "Mata uang"),
      kind: "text",
    },
    {
      key: "english",
      label: L("英语普及（编辑评分）", "English (editorial)", "Bahasa Inggris (editorial)"),
      kind: "score",
      higherLabel: {
        a: L("A 更普及", "A more widespread", "A lebih luas"),
        b: L("B 更普及", "B more widespread", "B lebih luas"),
      },
    },
    {
      key: "tipping",
      label: L("小费习惯", "Tipping", "Kebiasaan tip"),
      kind: "text",
    },
    {
      key: "transport",
      label: L("当地交通", "Getting around", "Transportasi"),
      kind: "text",
    },
    {
      key: "connect",
      label: L("网络与插座", "SIM & plugs", "SIM & colokan"),
      kind: "text",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export type Source = {
  id: string;
  issuer: string;
  title: L10n;
  url: string;
  retrieved: string;
  tier: 1 | 2 | 3;
  countries: string[];
};

export const SOURCES: Source[] = [
  {
    id: "id_tourism",
    issuer: "Indonesia.travel",
    title: L("印尼官方旅游门户 · 目的地与美食（示例条目）", "Indonesia.travel · destinations and food (sample)", "Indonesia.travel · destinasi dan kuliner (contoh)"),
    url: "https://www.indonesia.travel/gb/en/home",
    retrieved: "2026-11-16",
    tier: 1,
    countries: ["ID"],
  },
  {
    id: "my_tourism",
    issuer: "Tourism Malaysia",
    title: L("马来西亚旅游局 · 美食与目的地（示例条目）", "Tourism Malaysia · food and destinations (sample)", "Tourism Malaysia · kuliner dan destinasi (contoh)"),
    url: "https://www.malaysia.travel",
    retrieved: "2026-11-03",
    tier: 1,
    countries: ["MY"],
  },
  {
    id: "th_tourism",
    issuer: "TAT Newsroom",
    title: L("泰国旅游局新闻室 · 美食、节庆与目的地（示例条目）", "TAT Newsroom · food, festivals and destinations (sample)", "TAT Newsroom · kuliner, festival, dan destinasi (contoh)"),
    url: "https://www.tatnews.org",
    retrieved: "2026-11-16",
    tier: 1,
    countries: ["TH"],
  },
  {
    id: "vn_tourism",
    issuer: "Ministry of Culture, Sports and Tourism",
    title: L("越南文化体育与旅游部 · 美食与目的地（示例条目）", "Vietnam Ministry of Culture, Sports and Tourism · food and destinations (sample)", "Kementerian Kebudayaan, Olahraga dan Pariwisata Vietnam · kuliner dan destinasi (contoh)"),
    url: "https://bvhttdl.gov.vn",
    retrieved: "2026-11-16",
    tier: 1,
    countries: ["VN"],
  },
  {
    id: "sg_tourism",
    issuer: "Singapore Tourism Board",
    title: L("新加坡旅游局 · 熟食中心与景点（示例条目）", "STB · hawker centres and attractions (sample)", "STB · pusat jajanan dan atraksi (contoh)"),
    url: "https://www.visitsingapore.com",
    retrieved: "2026-10-30",
    tier: 1,
    countries: ["SG"],
  },
  {
    id: "bn_tourism",
    issuer: "Brunei Tourism",
    title: L("文莱旅游局 · 水村与美食（示例条目）", "Brunei Tourism · water village and food (sample)", "Brunei Tourism · kampung air dan kuliner (contoh)"),
    url: "https://www.bruneitourism.com",
    retrieved: "2026-10-28",
    tier: 1,
    countries: ["BN"],
  },
  {
    id: "kh_tourism",
    issuer: "Ministry of Tourism Cambodia",
    title: L("柬埔寨旅游部 · 吴哥与高棉饮食（示例条目）", "Cambodia Ministry of Tourism · Angkor and Khmer food (sample)", "Kementerian Pariwisata Kamboja · Angkor dan kuliner Khmer (contoh)"),
    url: "https://mot.gov.kh",
    retrieved: "2026-11-16",
    tier: 1,
    countries: ["KH"],
  },
  {
    id: "unesco",
    issuer: "UNESCO World Heritage Centre",
    title: L("世界遗产名录 · 东南亚（示例条目）", "World Heritage List · Southeast Asia (sample)", "Daftar Warisan Dunia · Asia Tenggara (contoh)"),
    url: "https://whc.unesco.org",
    retrieved: "2026-10-30",
    tier: 2,
    countries: ["ID", "MY", "TH", "VN", "SG", "KH", "PH", "LA", "MM"],
  },
  {
    id: "ph_tourism",
    issuer: "百度百科（第三方）",
    title: L("菲律宾 · 国家概况（第三方来源）", "Philippines · country overview (third-party)", "Filipina · ikhtisar negara (pihak ketiga)"),
    url: "https://baike.baidu.com/item/菲律宾",
    retrieved: "2026-11-19",
    tier: 3,
    countries: ["PH"],
  },
  {
    id: "la_tourism",
    issuer: "百度百科（第三方）",
    title: L("老挝 · 国家概况（第三方来源）", "Laos · country overview (third-party)", "Laos · ikhtisar negara (pihak ketiga)"),
    url: "https://baike.baidu.com/item/老挝",
    retrieved: "2026-11-19",
    tier: 3,
    countries: ["LA"],
  },
  {
    id: "mm_tourism",
    issuer: "百度百科（第三方）",
    title: L("缅甸 · 国家概况（第三方来源）", "Myanmar · country overview (third-party)", "Myanmar · ikhtisar negara (pihak ketiga)"),
    url: "https://baike.baidu.com/item/缅甸",
    retrieved: "2026-11-19",
    tier: 3,
    countries: ["MM"],
  },
];

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

export function sourcesForCountry(code: string): Source[] {
  return SOURCES.filter((s) => s.countries.includes(code));
}

/* ------------------------------------------------------------------ */
/* Facts (sample editorial data)                                       */
/* ------------------------------------------------------------------ */

export type Fact = {
  value: L10n;
  n?: number;
  asOf: string;
  sourceId: string;
};

const f = (
  zh: string,
  en: string,
  id: string,
  n: number | undefined,
  asOf: string,
  sourceId: string,
): Fact => ({ value: { zh, en, id }, n, asOf, sourceId });

export const FACTS: Record<string, Fact> = {
  /* Indonesia */
  "ID:food:signature": f("炒饭、仁当牛肉", "Nasi goreng, rendang", "Nasi goreng, rendang", undefined, "2026-11-05", "id_tourism"),
  "ID:food:spice": f("4 / 5", "4 / 5", "4 / 5", 4, "2026-11-05", "id_tourism"),
  "ID:food:staple": f("米饭", "Rice", "Nasi", undefined, "2026-11-05", "id_tourism"),
  "ID:places:landmark": f("婆罗浮屠、普兰巴南", "Borobudur, Prambanan", "Borobudur, Prambanan", undefined, "2026-11-05", "id_tourism"),
  "ID:places:heritage": f("婆罗浮屠、普兰巴南、科莫多", "Borobudur, Prambanan, Komodo", "Borobudur, Prambanan, Komodo", undefined, "2026-10-30", "unesco"),
  "ID:places:season": f("5–9 月旱季", "May–Sep, dry season", "Mei–Sep, musim kering", undefined, "2026-11-05", "id_tourism"),
  "ID:culture:religion": f("伊斯兰教为主", "Predominantly Muslim", "Mayoritas Islam", undefined, "2026-11-05", "id_tourism"),
  "ID:culture:etiquette": f("右手递接；进庙脱鞋围纱笼", "Right hand; shoes off and sarong in temples", "Tangan kanan; lepas alas kaki dan pakai sarung di pura", undefined, "2026-11-05", "id_tourism"),
  "ID:culture:festival": f("开斋节（3–4 月）、静居日（3 月）", "Eid al-Fitr (Mar–Apr), Nyepi (Mar)", "Idulfitri (Mar–Apr), Nyepi (Mar)", undefined, "2026-11-05", "id_tourism"),
  "ID:travel:currency": f("印尼盾 IDR", "Indonesian rupiah (IDR)", "Rupiah (IDR)", undefined, "2026-11-05", "id_tourism"),
  "ID:travel:english": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-11-05", "id_tourism"),
  "ID:travel:tipping": f("不强制，服务费常见", "Not required; service charge common", "Tidak wajib; biaya layanan umum", undefined, "2026-11-05", "id_tourism"),
  "ID:food:street": f("沙爹、炸豆腐", "Satay, fried tofu", "Sate, tahu goreng", undefined, "2026-11-05", "id_tourism"),
  "ID:places:city": f("雅加达、日惹、巴厘岛", "Jakarta, Yogyakarta, Bali", "Jakarta, Yogyakarta, Bali", undefined, "2026-11-05", "id_tourism"),
  "ID:culture:greeting": f("Selamat pagi（早上好）", "Selamat pagi (good morning)", "Selamat pagi", undefined, "2026-11-05", "id_tourism"),
  "ID:travel:transport": f("Grab/Gojek 叫车，雅加达有 MRT", "Grab/Gojek; Jakarta has an MRT", "Grab/Gojek; Jakarta punya MRT", undefined, "2026-11-05", "id_tourism"),
  "ID:food:drink": f("冰茶（es teh）、Kopi tubruk", "Iced tea, kopi tubruk", "Es teh, kopi tubruk", undefined, "2026-11-05", "id_tourism"),
  "ID:places:daytrip": f("日惹—婆罗浮屠一日", "Yogyakarta–Borobudur day trip", "Yogyakarta–Borobudur sehari", undefined, "2026-11-05", "id_tourism"),
  "ID:culture:dress": f("进庙围纱笼、遮肩", "Sarong and covered shoulders in temples", "Sarung dan bahu tertutup di pura", undefined, "2026-11-05", "id_tourism"),
  "ID:travel:connect": f("插头 C/F，4G 普及", "Plugs C/F; 4G widely available", "Colokan C/F; 4G luas", undefined, "2026-11-05", "id_tourism"),

  /* Malaysia */
  "MY:food:signature": f("椰浆饭、叻沙", "Nasi lemak, laksa", "Nasi lemak, laksa", undefined, "2026-11-03", "my_tourism"),
  "MY:food:spice": f("4 / 5", "4 / 5", "4 / 5", 4, "2026-11-03", "my_tourism"),
  "MY:food:staple": f("米饭", "Rice", "Nasi", undefined, "2026-11-03", "my_tourism"),
  "MY:places:landmark": f("双子塔、乔治市老城", "Petronas Towers, George Town", "Menara Petronas, George Town", undefined, "2026-11-03", "my_tourism"),
  "MY:places:heritage": f("乔治市、马六甲", "George Town, Melaka", "George Town, Melaka", undefined, "2026-10-30", "unesco"),
  "MY:places:season": f("3–10 月，避开东北季风", "Mar–Oct, outside the northeast monsoon", "Mar–Okt, di luar monsun timur laut", undefined, "2026-11-03", "my_tourism"),
  "MY:culture:religion": f("伊斯兰教为主，多宗教并存", "Predominantly Muslim, multi-faith", "Mayoritas Islam, multi-agama", undefined, "2026-11-03", "my_tourism"),
  "MY:culture:etiquette": f("右手进食与递物；进庙脱鞋", "Right hand for food; shoes off in temples", "Tangan kanan; lepas alas kaki di kuil", undefined, "2026-11-03", "my_tourism"),
  "MY:culture:festival": f("开斋节（3–4 月）、屠妖节（10–11 月）、农历新年（1–2 月）", "Hari Raya (Mar–Apr), Deepavali (Oct–Nov), CNY (Jan–Feb)", "Hari Raya (Mar–Apr), Deepavali (Okt–Nov), Imlek (Jan–Feb)", undefined, "2026-11-03", "my_tourism"),
  "MY:travel:currency": f("林吉特 MYR", "Malaysian ringgit (MYR)", "Ringgit (MYR)", undefined, "2026-11-03", "my_tourism"),
  "MY:travel:english": f("4 / 5", "4 / 5", "4 / 5", 4, "2026-11-03", "my_tourism"),
  "MY:travel:tipping": f("不普遍", "Not expected", "Tidak lazim", undefined, "2026-11-03", "my_tourism"),
  "MY:food:street": f("槟城炒粿条、椰浆饭档", "Char kway teow, nasi lemak stalls", "Char kway teow, warung nasi lemak", undefined, "2026-11-03", "my_tourism"),
  "MY:places:city": f("吉隆坡、槟城、马六甲", "Kuala Lumpur, Penang, Melaka", "Kuala Lumpur, Penang, Melaka", undefined, "2026-11-03", "my_tourism"),
  "MY:culture:greeting": f("Selamat datang（欢迎）/ Apa khabar（你好吗）", "Selamat datang (welcome) / Apa khabar (how are you)", "Selamat datang / Apa khabar", undefined, "2026-11-03", "my_tourism"),
  "MY:travel:transport": f("Grab、LRT/MRT", "Grab, LRT/MRT", "Grab, LRT/MRT", undefined, "2026-11-03", "my_tourism"),
  "MY:food:drink": f("拉茶（teh tarik）、白咖啡", "Teh tarik, white coffee", "Teh tarik, kopi putih", undefined, "2026-11-03", "my_tourism"),
  "MY:places:daytrip": f("槟城乔治市一日", "George Town day trip", "George Town sehari", undefined, "2026-11-03", "my_tourism"),
  "MY:culture:dress": f("进清真寺遮盖手臂与腿", "Cover arms and legs in mosques", "Tutup lengan dan kaki di masjid", undefined, "2026-11-03", "my_tourism"),
  "MY:travel:connect": f("插头 G，网络稳定", "Plug G; reliable mobile data", "Colokan G; data stabil", undefined, "2026-11-03", "my_tourism"),

  /* Thailand */
  "TH:food:signature": f("泰式炒河粉、冬阴功", "Pad thai, tom yum", "Pad thai, tom yum", undefined, "2026-11-02", "th_tourism"),
  "TH:food:spice": f("5 / 5", "5 / 5", "5 / 5", 5, "2026-11-02", "th_tourism"),
  "TH:food:staple": f("香米", "Jasmine rice", "Beras melati", undefined, "2026-11-02", "th_tourism"),
  "TH:places:landmark": f("大皇宫、大城遗址", "Grand Palace, Ayutthaya", "Grand Palace, Ayutthaya", undefined, "2026-11-02", "th_tourism"),
  "TH:places:heritage": f("大城、素可泰", "Ayutthaya, Sukhothai", "Ayutthaya, Sukhothai", undefined, "2026-10-30", "unesco"),
  "TH:places:season": f("11–2 月凉季", "Nov–Feb, cool season", "Nov–Feb, musim dingin", undefined, "2026-11-02", "th_tourism"),
  "TH:culture:religion": f("上座部佛教", "Theravada Buddhism", "Buddhisme Theravada", undefined, "2026-11-02", "th_tourism"),
  "TH:culture:etiquette": f("合十礼；不摸头、不指人", "Wai greeting; don't touch heads or point", "Salam wai; jangan sentuh kepala atau menunjuk", undefined, "2026-11-02", "th_tourism"),
  "TH:culture:festival": f("泼水节（4 月）、水灯节（11 月）", "Songkran (Apr), Loy Krathong (Nov)", "Songkran (Apr), Loy Krathong (Nov)", undefined, "2026-11-02", "th_tourism"),
  "TH:travel:currency": f("泰铢 THB", "Thai baht (THB)", "Baht (THB)", undefined, "2026-11-02", "th_tourism"),
  "TH:travel:english": f("3 / 5", "3 / 5", "3 / 5", 3, "2026-11-02", "th_tourism"),
  "TH:travel:tipping": f("常见但非强制", "Common, not mandatory", "Umum, tidak wajib", undefined, "2026-11-02", "th_tourism"),
  "TH:food:street": f("芒果糯米饭、烤肉串", "Mango sticky rice, moo ping", "Ketan mangga, moo ping", undefined, "2026-11-02", "th_tourism"),
  "TH:places:city": f("曼谷、清迈、大城", "Bangkok, Chiang Mai, Ayutthaya", "Bangkok, Chiang Mai, Ayutthaya", undefined, "2026-11-02", "th_tourism"),
  "TH:culture:greeting": f("Sawadee khrap / kha（合十问候）", "Sawadee khrap / kha (with a wai)", "Sawadee khrap / kha (dengan wai)", undefined, "2026-11-02", "th_tourism"),
  "TH:travel:transport": f("BTS/MRT + 嘟嘟车", "BTS/MRT plus tuk-tuk", "BTS/MRT plus tuk-tuk", undefined, "2026-11-02", "th_tourism"),
  "TH:food:drink": f("泰式冰茶、椰子水", "Thai iced tea, coconut water", "Teh es Thailand, air kelapa", undefined, "2026-11-02", "th_tourism"),
  "TH:places:daytrip": f("大城遗址一日", "Ayutthaya day trip", "Ayutthaya sehari", undefined, "2026-11-02", "th_tourism"),
  "TH:culture:dress": f("进庙遮肩过膝", "Cover shoulders and knees in temples", "Tutup bahu dan lutut di kuil", undefined, "2026-11-02", "th_tourism"),
  "TH:travel:connect": f("插头 A/B/C，游客 SIM 便宜", "Plugs A/B/C; cheap tourist SIMs", "Colokan A/B/C; SIM turis murah", undefined, "2026-11-02", "th_tourism"),

  /* Vietnam */
  "VN:food:signature": f("河粉、法棍三明治", "Pho, banh mi", "Pho, banh mi", undefined, "2026-11-02", "vn_tourism"),
  "VN:food:spice": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-11-02", "vn_tourism"),
  "VN:food:staple": f("米饭与米粉", "Rice and rice noodles", "Nasi dan mi beras", undefined, "2026-11-02", "vn_tourism"),
  "VN:places:landmark": f("下龙湾、会安古城", "Ha Long Bay, Hoi An", "Ha Long Bay, Hoi An", undefined, "2026-11-02", "vn_tourism"),
  "VN:places:heritage": f("下龙湾、会安、顺化", "Ha Long Bay, Hoi An, Hue", "Ha Long Bay, Hoi An, Hue", undefined, "2026-10-30", "unesco"),
  "VN:places:season": f("10–4 月，南北差异大", "Oct–Apr; north and south differ", "Okt–Apr; utara dan selatan berbeda", undefined, "2026-11-02", "vn_tourism"),
  "VN:culture:religion": f("佛教与民间信仰", "Buddhism and folk belief", "Buddhisme dan kepercayaan rakyat", undefined, "2026-11-02", "vn_tourism"),
  "VN:culture:etiquette": f("双手递物；进庙脱鞋", "Two hands; shoes off in temples", "Dua tangan; lepas alas kaki di kuil", undefined, "2026-11-02", "vn_tourism"),
  "VN:culture:festival": f("春节（Tet，1–2 月）", "Tet (Lunar New Year, Jan–Feb)", "Tet (Tahun Baru Imlek, Jan–Feb)", undefined, "2026-11-02", "vn_tourism"),
  "VN:travel:currency": f("越南盾 VND", "Vietnamese dong (VND)", "Dong (VND)", undefined, "2026-11-02", "vn_tourism"),
  "VN:travel:english": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-11-02", "vn_tourism"),
  "VN:travel:tipping": f("逐渐普遍", "Increasingly common", "Makin umum", undefined, "2026-11-02", "vn_tourism"),
  "VN:food:street": f("烤肉米线、越南法棍", "Bun cha, banh mi", "Bun cha, banh mi", undefined, "2026-11-02", "vn_tourism"),
  "VN:places:city": f("河内、会安、胡志明市", "Hanoi, Hoi An, Ho Chi Minh City", "Hanoi, Hoi An, Ho Chi Minh City", undefined, "2026-11-02", "vn_tourism"),
  "VN:culture:greeting": f("Xin chào（你好）", "Xin chao (hello)", "Xin chao", undefined, "2026-11-02", "vn_tourism"),
  "VN:travel:transport": f("Grab 摩托、出租车", "Grab bikes, taxis", "Grab motor, taksi", undefined, "2026-11-02", "vn_tourism"),
  "VN:food:drink": f("滴漏咖啡（cà phê sữa đá）", "Vietnamese drip coffee", "Kopi tetes Vietnam", undefined, "2026-11-02", "vn_tourism"),
  "VN:places:daytrip": f("下龙湾一日", "Ha Long Bay day trip", "Ha Long Bay sehari", undefined, "2026-11-02", "vn_tourism"),
  "VN:culture:dress": f("进庙遮肩，着装整洁", "Cover shoulders in temples", "Tutup bahu di kuil", undefined, "2026-11-02", "vn_tourism"),
  "VN:travel:connect": f("插头 A/C，SIM 便宜", "Plugs A/C; cheap SIMs", "Colokan A/C; SIM murah", undefined, "2026-11-02", "vn_tourism"),

  /* Singapore */
  "SG:food:signature": f("海南鸡饭、辣椒螃蟹", "Chicken rice, chili crab", "Nasi ayam Hainan, kepiting cabai", undefined, "2026-10-30", "sg_tourism"),
  "SG:food:spice": f("3 / 5", "3 / 5", "3 / 5", 3, "2026-10-30", "sg_tourism"),
  "SG:food:staple": f("米饭与面", "Rice and noodles", "Nasi dan mi", undefined, "2026-10-30", "sg_tourism"),
  "SG:places:landmark": f("滨海湾、植物园", "Marina Bay, Botanic Gardens", "Marina Bay, Kebun Raya", undefined, "2026-10-30", "sg_tourism"),
  "SG:places:heritage": f("新加坡植物园", "Singapore Botanic Gardens", "Kebun Raya Singapura", undefined, "2026-10-30", "unesco"),
  "SG:places:season": f("全年皆宜", "Year-round", "Sepanjang tahun", undefined, "2026-10-30", "sg_tourism"),
  "SG:culture:religion": f("多元信仰并存", "Multi-faith", "Multi-agama", undefined, "2026-10-30", "sg_tourism"),
  "SG:culture:etiquette": f("排队；地铁内禁饮食", "Queue; no eating on the MRT", "Antre; dilarang makan di MRT", undefined, "2026-10-30", "sg_tourism"),
  "SG:culture:festival": f("农历新年（1–2 月）、开斋节（3–4 月）、屠妖节（10–11 月）", "CNY (Jan–Feb), Hari Raya (Mar–Apr), Deepavali (Oct–Nov)", "Imlek (Jan–Feb), Hari Raya (Mar–Apr), Deepavali (Okt–Nov)", undefined, "2026-10-30", "sg_tourism"),
  "SG:travel:currency": f("新加坡元 SGD", "Singapore dollar (SGD)", "Dolar Singapura (SGD)", undefined, "2026-10-30", "sg_tourism"),
  "SG:travel:english": f("5 / 5", "5 / 5", "5 / 5", 5, "2026-10-30", "sg_tourism"),
  "SG:travel:tipping": f("不期望", "Not expected", "Tidak diharapkan", undefined, "2026-10-30", "sg_tourism"),
  "SG:food:street": f("麦士威熟食中心、老巴刹", "Maxwell Food Centre, Lau Pa Sat", "Maxwell Food Centre, Lau Pa Sat", undefined, "2026-10-30", "sg_tourism"),
  "SG:places:city": f("市区、圣淘沙", "City centre, Sentosa", "Pusat kota, Sentosa", undefined, "2026-10-30", "sg_tourism"),
  "SG:culture:greeting": f("Hello / 你好 / Vanakkam", "Hello / Ni hao / Vanakkam", "Hello / Ni hao / Vanakkam", undefined, "2026-10-30", "sg_tourism"),
  "SG:travel:transport": f("地铁 MRT 覆盖全岛", "MRT across the island", "MRT menjangkau seluruh pulau", undefined, "2026-10-30", "sg_tourism"),
  "SG:food:drink": f("Kopi、甘蔗汁", "Kopi, sugarcane juice", "Kopi, jus tebu", undefined, "2026-10-30", "sg_tourism"),
  "SG:places:daytrip": f("圣淘沙一日", "Sentosa day trip", "Sentosa sehari", undefined, "2026-10-30", "sg_tourism"),
  "SG:culture:dress": f("日常休闲即可", "Casual is fine", "Kasual saja", undefined, "2026-10-30", "sg_tourism"),
  "SG:travel:connect": f("插头 G，SIM 需护照登记", "Plug G; SIM needs passport", "Colokan G; SIM perlu paspor", undefined, "2026-10-30", "sg_tourism"),

  /* Philippines */
  "PH:food:signature": f("阿斗波、烤乳猪", "Adobo, lechon", "Adobo, lechon", undefined, "2026-10-29", "ph_tourism"),
  "PH:food:spice": f("1 / 5", "1 / 5", "1 / 5", 1, "2026-10-29", "ph_tourism"),
  "PH:food:staple": f("米饭", "Rice", "Nasi", undefined, "2026-10-29", "ph_tourism"),
  "PH:places:landmark": f("长滩岛、巧克力山", "Boracay, Chocolate Hills", "Boracay, Chocolate Hills", undefined, "2026-10-29", "ph_tourism"),
  "PH:places:heritage": f("巴纳韦梯田、维甘老城", "Banaue terraces, Vigan", "Terasering Banaue, Vigan", undefined, "2026-10-30", "unesco"),
  "PH:places:season": f("12–5 月旱季", "Dec–May, dry season", "Des–Mei, musim kering", undefined, "2026-10-29", "ph_tourism"),
  "PH:culture:religion": f("天主教为主", "Predominantly Catholic", "Mayoritas Katolik", undefined, "2026-10-29", "ph_tourism"),
  "PH:culture:etiquette": f("尊重长辈，用 po / opo", "Respect elders; use po / opo", "Hormati orang tua; pakai po / opo", undefined, "2026-10-29", "ph_tourism"),
  "PH:culture:festival": f("圣婴节（1 月）、阿提阿提汉节（1 月）", "Sinulog (Jan), Ati-Atihan (Jan)", "Sinulog (Jan), Ati-Atihan (Jan)", undefined, "2026-10-29", "ph_tourism"),
  "PH:travel:currency": f("菲律宾比索 PHP", "Philippine peso (PHP)", "Peso (PHP)", undefined, "2026-10-29", "ph_tourism"),
  "PH:travel:english": f("4 / 5", "4 / 5", "4 / 5", 4, "2026-10-29", "ph_tourism"),
  "PH:travel:tipping": f("常见", "Common", "Umum", undefined, "2026-10-29", "ph_tourism"),
  "PH:food:street": f("鱼丸串、halo-halo", "Fishball skewers, halo-halo", "Sate bakso ikan, halo-halo", undefined, "2026-10-29", "ph_tourism"),
  "PH:places:city": f("马尼拉、宿务、长滩岛", "Manila, Cebu, Boracay", "Manila, Cebu, Boracay", undefined, "2026-10-29", "ph_tourism"),
  "PH:culture:greeting": f("Kumusta（你好）/ Magandang umaga（早安）", "Kumusta (hello) / Magandang umaga (good morning)", "Kumusta / Magandang umaga", undefined, "2026-10-29", "ph_tourism"),
  "PH:travel:transport": f("Grab、吉普尼", "Grab, jeepney", "Grab, jeepney", undefined, "2026-10-29", "ph_tourism"),
  "PH:food:drink": f("芒果冰沙、halo-halo", "Mango shake, halo-halo", "Es mangga, halo-halo", undefined, "2026-10-29", "ph_tourism"),
  "PH:places:daytrip": f("大雅台火山湖一日", "Tagaytay day trip", "Tagaytay sehari", undefined, "2026-10-29", "ph_tourism"),
  "PH:culture:dress": f("进教堂遮肩", "Cover shoulders in churches", "Tutup bahu di gereja", undefined, "2026-10-29", "ph_tourism"),
  "PH:travel:connect": f("插头 A/B，SIM 需注册", "Plugs A/B; SIM registration required", "Colokan A/B; SIM wajib registrasi", undefined, "2026-10-29", "ph_tourism"),

  /* Brunei */
  "BN:food:signature": f("安布雅、椰浆饭", "Ambuyat, nasi katok", "Ambuyat, nasi katok", undefined, "2026-10-28", "bn_tourism"),
  "BN:food:spice": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-10-28", "bn_tourism"),
  "BN:food:staple": f("米饭与西米", "Rice and sago", "Nasi dan sagu", undefined, "2026-10-28", "bn_tourism"),
  "BN:places:landmark": f("奥马尔·阿里·赛义夫丁清真寺", "Omar Ali Saifuddien Mosque", "Masjid Omar Ali Saifuddien", undefined, "2026-10-28", "bn_tourism"),
  "BN:places:heritage": f("甘榜亚逸水村", "Kampong Ayer", "Kampong Ayer", undefined, "2026-10-30", "unesco"),
  "BN:places:season": f("全年，避开雨季", "Year-round; avoid the wet season", "Sepanjang tahun; hindari musim hujan", undefined, "2026-10-28", "bn_tourism"),
  "BN:culture:religion": f("伊斯兰教（国教）", "Islam (state religion)", "Islam (agama resmi)", undefined, "2026-10-28", "bn_tourism"),
  "BN:culture:etiquette": f("着装保守；公共场合不饮酒", "Modest dress; no alcohol in public", "Berpakaian sopan; tanpa alkohol di tempat umum", undefined, "2026-10-28", "bn_tourism"),
  "BN:culture:festival": f("开斋节（3–4 月）", "Hari Raya (Mar–Apr)", "Hari Raya (Mar–Apr)", undefined, "2026-10-28", "bn_tourism"),
  "BN:travel:currency": f("文莱元 BND", "Brunei dollar (BND)", "Dolar Brunei (BND)", undefined, "2026-10-28", "bn_tourism"),
  "BN:travel:english": f("3 / 5", "3 / 5", "3 / 5", 3, "2026-10-28", "bn_tourism"),
  "BN:travel:tipping": f("不期望", "Not expected", "Tidak diharapkan", undefined, "2026-10-28", "bn_tourism"),
  "BN:food:street": f("椰浆饭包（nasi katok）", "Nasi katok", "Nasi katok", undefined, "2026-10-28", "bn_tourism"),
  "BN:places:city": f("斯里巴加湾市", "Bandar Seri Begawan", "Bandar Seri Begawan", undefined, "2026-10-28", "bn_tourism"),
  "BN:culture:greeting": f("Assalamualaikum / Selamat datang", "Assalamualaikum / Selamat datang", "Assalamualaikum / Selamat datang", undefined, "2026-10-28", "bn_tourism"),
  "BN:travel:transport": f("出租车与网约车，公交较少", "Taxis and ride-hailing; limited buses", "Taksi dan ride-hailing; bus terbatas", undefined, "2026-10-28", "bn_tourism"),
  "BN:food:drink": f("拉茶、椰子水", "Teh tarik, coconut water", "Teh tarik, air kelapa", undefined, "2026-10-28", "bn_tourism"),
  "BN:places:daytrip": f("甘榜亚逸水村半日", "Kampong Ayer half-day", "Kampong Ayer setengah hari", undefined, "2026-10-28", "bn_tourism"),
  "BN:culture:dress": f("着装保守；公共场合不饮酒", "Modest dress; no alcohol in public", "Berpakaian sopan; tanpa alkohol", undefined, "2026-10-28", "bn_tourism"),
  "BN:travel:connect": f("插头 G，网络好", "Plug G; good coverage", "Colokan G; jaringan baik", undefined, "2026-10-28", "bn_tourism"),

  /* Cambodia */
  "KH:food:signature": f("阿莫克鱼、高棉红咖喱", "Fish amok, Khmer red curry", "Ikan amok, kari merah Khmer", undefined, "2026-10-27", "kh_tourism"),
  "KH:food:spice": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-10-27", "kh_tourism"),
  "KH:food:staple": f("米饭", "Rice", "Nasi", undefined, "2026-10-27", "kh_tourism"),
  "KH:places:landmark": f("吴哥窟、洞里萨湖", "Angkor Wat, Tonle Sap", "Angkor Wat, Tonle Sap", undefined, "2026-10-27", "kh_tourism"),
  "KH:places:heritage": f("吴哥窟、柏威夏寺", "Angkor, Preah Vihear", "Angkor, Preah Vihear", undefined, "2026-10-30", "unesco"),
  "KH:places:season": f("11–3 月旱季", "Nov–Mar, dry season", "Nov–Mar, musim kering", undefined, "2026-10-27", "kh_tourism"),
  "KH:culture:religion": f("上座部佛教", "Theravada Buddhism", "Buddhisme Theravada", undefined, "2026-10-27", "kh_tourism"),
  "KH:culture:etiquette": f("合十礼；不摸头", "Sampeah greeting; don't touch heads", "Salam sampeah; jangan sentuh kepala", undefined, "2026-10-27", "kh_tourism"),
  "KH:culture:festival": f("高棉新年（4 月）、送水节（11 月）", "Khmer New Year (Apr), Water Festival (Nov)", "Tahun Baru Khmer (Apr), Festival Air (Nov)", undefined, "2026-10-27", "kh_tourism"),
  "KH:travel:currency": f("瑞尔 KHR，美元通用", "Riel (KHR); USD widely used", "Riel (KHR); USD umum", undefined, "2026-10-27", "kh_tourism"),
  "KH:travel:english": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-10-27", "kh_tourism"),
  "KH:travel:tipping": f("小额小费常见", "Small tips common", "Tip kecil umum", undefined, "2026-10-27", "kh_tourism"),
  "KH:food:street": f("炸蜘蛛、高棉红咖喱", "Fried spiders, Khmer red curry", "Laba-laba goreng, kari merah Khmer", undefined, "2026-10-27", "kh_tourism"),
  "KH:places:city": f("暹粒、金边", "Siem Reap, Phnom Penh", "Siem Reap, Phnom Penh", undefined, "2026-10-27", "kh_tourism"),
  "KH:culture:greeting": f("Chum reap suor（合十问候）", "Chum reap suor (with a sampeah)", "Chum reap suor (dengan sampeah)", undefined, "2026-10-27", "kh_tourism"),
  "KH:travel:transport": f("嘟嘟车、Grab", "Tuk-tuk, Grab", "Tuk-tuk, Grab", undefined, "2026-10-27", "kh_tourism"),
  "KH:food:drink": f("冰咖啡、棕榈糖饮品", "Iced coffee, palm sugar drinks", "Kopi es, minuman gula palem", undefined, "2026-10-27", "kh_tourism"),
  "KH:places:daytrip": f("吴哥小圈一日", "Angkor small circuit", "Rute kecil Angkor", undefined, "2026-10-27", "kh_tourism"),
  "KH:culture:dress": f("进寺遮肩过膝", "Cover shoulders and knees at temples", "Tutup bahu dan lutut di kuil", undefined, "2026-10-27", "kh_tourism"),
  "KH:travel:connect": f("插头 A/C，SIM 便宜", "Plugs A/C; cheap SIMs", "Colokan A/C; SIM murah", undefined, "2026-10-27", "kh_tourism"),

  /* Laos */
  "LA:food:signature": f("拉普、糯米饭", "Laap, sticky rice", "Laap, nasi ketan", undefined, "2026-10-27", "la_tourism"),
  "LA:food:spice": f("3 / 5", "3 / 5", "3 / 5", 3, "2026-10-27", "la_tourism"),
  "LA:food:staple": f("糯米", "Sticky rice", "Nasi ketan", undefined, "2026-10-27", "la_tourism"),
  "LA:places:landmark": f("琅勃拉邦、石缸平原", "Luang Prabang, Plain of Jars", "Luang Prabang, Dataran Guci", undefined, "2026-10-27", "la_tourism"),
  "LA:places:heritage": f("琅勃拉邦、瓦普寺", "Luang Prabang, Wat Phou", "Luang Prabang, Wat Phou", undefined, "2026-10-30", "unesco"),
  "LA:places:season": f("11–3 月凉季", "Nov–Mar, cool season", "Nov–Mar, musim dingin", undefined, "2026-10-27", "la_tourism"),
  "LA:culture:religion": f("上座部佛教", "Theravada Buddhism", "Buddhisme Theravada", undefined, "2026-10-27", "la_tourism"),
  "LA:culture:etiquette": f("双手合十；脚不指人", "Nop greeting; feet never point at people", "Salam nop; kaki tidak menunjuk orang", undefined, "2026-10-27", "la_tourism"),
  "LA:culture:festival": f("泼水节（Pi Mai，4 月）、出夏节（10 月）", "Pi Mai (Apr), Ok Phansa (Oct)", "Pi Mai (Apr), Ok Phansa (Okt)", undefined, "2026-10-27", "la_tourism"),
  "LA:travel:currency": f("基普 LAK", "Lao kip (LAK)", "Kip (LAK)", undefined, "2026-10-27", "la_tourism"),
  "LA:travel:english": f("1 / 5", "1 / 5", "1 / 5", 1, "2026-10-27", "la_tourism"),
  "LA:travel:tipping": f("不普遍", "Not expected", "Tidak lazim", undefined, "2026-10-27", "la_tourism"),
  "LA:food:street": f("烤鸡、木瓜沙拉", "Ping gai, tam mak hoong", "Ping gai, tam mak hoong", undefined, "2026-10-27", "la_tourism"),
  "LA:places:city": f("琅勃拉邦、万象", "Luang Prabang, Vientiane", "Luang Prabang, Vientiane", undefined, "2026-10-27", "la_tourism"),
  "LA:culture:greeting": f("Sabaidee（你好）", "Sabaidee (hello)", "Sabaidee", undefined, "2026-10-27", "la_tourism"),
  "LA:travel:transport": f("嘟嘟车、双条车", "Tuk-tuk, songthaew", "Tuk-tuk, songthaew", undefined, "2026-10-27", "la_tourism"),
  "LA:food:drink": f("老挝咖啡、Beerlao", "Lao coffee, Beerlao", "Kopi Laos, Beerlao", undefined, "2026-10-27", "la_tourism"),
  "LA:places:daytrip": f("光西瀑布一日", "Kuang Si Falls day trip", "Air Terjun Kuang Si sehari", undefined, "2026-10-27", "la_tourism"),
  "LA:culture:dress": f("进寺遮肩", "Cover shoulders at temples", "Tutup bahu di kuil", undefined, "2026-10-27", "la_tourism"),
  "LA:travel:connect": f("插头 A/C，网络一般", "Plugs A/C; patchy coverage", "Colokan A/C; jaringan terbatas", undefined, "2026-10-27", "la_tourism"),

  /* Myanmar */
  "MM:food:signature": f("鱼汤米线、茶叶沙拉", "Mohinga, tea leaf salad", "Mohinga, salad daun teh", undefined, "2026-10-26", "mm_tourism"),
  "MM:food:spice": f("3 / 5", "3 / 5", "3 / 5", 3, "2026-10-26", "mm_tourism"),
  "MM:food:staple": f("米饭与米线", "Rice and rice noodles", "Nasi dan mi beras", undefined, "2026-10-26", "mm_tourism"),
  "MM:places:landmark": f("蒲甘、大金塔", "Bagan, Shwedagon", "Bagan, Shwedagon", undefined, "2026-10-26", "mm_tourism"),
  "MM:places:heritage": f("蒲甘、骠国古城", "Bagan, Pyu ancient cities", "Bagan, kota kuno Pyu", undefined, "2026-10-30", "unesco"),
  "MM:places:season": f("11–2 月凉季", "Nov–Feb, cool season", "Nov–Feb, musim dingin", undefined, "2026-10-26", "mm_tourism"),
  "MM:culture:religion": f("上座部佛教", "Theravada Buddhism", "Buddhisme Theravada", undefined, "2026-10-26", "mm_tourism"),
  "MM:culture:etiquette": f("进塔脱鞋；着装过膝", "Shoes off at pagodas; cover knees", "Lepas alas kaki di pagoda; pakaian menutup lutut", undefined, "2026-10-26", "mm_tourism"),
  "MM:culture:festival": f("泼水节（Thingyan，4 月）、点灯节（10–11 月）", "Thingyan (Apr), Tazaungdaing (Oct–Nov)", "Thingyan (Apr), Tazaungdaing (Okt–Nov)", undefined, "2026-10-26", "mm_tourism"),
  "MM:travel:currency": f("缅元 MMK", "Kyat (MMK)", "Kyat (MMK)", undefined, "2026-10-26", "mm_tourism"),
  "MM:travel:english": f("2 / 5", "2 / 5", "2 / 5", 2, "2026-10-26", "mm_tourism"),
  "MM:travel:tipping": f("小额小费常见", "Small tips common", "Tip kecil umum", undefined, "2026-10-26", "mm_tourism"),
  "MM:food:street": f("茶叶沙拉、炸豆饼", "Tea leaf salad, fried bean cakes", "Salad daun teh, kue kacang goreng", undefined, "2026-10-26", "mm_tourism"),
  "MM:places:city": f("仰光、蒲甘、曼德勒", "Yangon, Bagan, Mandalay", "Yangon, Bagan, Mandalay", undefined, "2026-10-26", "mm_tourism"),
  "MM:culture:greeting": f("Mingalaba（你好）", "Mingalaba (hello)", "Mingalaba", undefined, "2026-10-26", "mm_tourism"),
  "MM:travel:transport": f("出租车、网约车有限", "Taxis; ride-hailing is limited", "Taksi; ride-hailing terbatas", undefined, "2026-10-26", "mm_tourism"),
  "MM:food:drink": f("缅甸奶茶", "Myanmar milk tea", "Teh susu Myanmar", undefined, "2026-10-26", "mm_tourism"),
  "MM:places:daytrip": f("蒲甘日出半日", "Bagan sunrise half-day", "Sunrise Bagan setengah hari", undefined, "2026-10-26", "mm_tourism"),
  "MM:culture:dress": f("进塔脱鞋、过膝", "Shoes off at pagodas; cover knees", "Lepas alas kaki; tutup lutut", undefined, "2026-10-26", "mm_tourism"),
  "MM:travel:connect": f("插头 A/C/D，网络受限", "Plugs A/C/D; limited connectivity", "Colokan A/C/D; jaringan terbatas", undefined, "2026-10-26", "mm_tourism"),
};

export function getFact(
  country: string,
  domain: string,
  key: string,
): Fact | undefined {
  if (UNAVAILABLE_COUNTRIES.has(country.toUpperCase())) return undefined;
  return FACTS[`${country}:${domain}:${key}`];
}

export function factsFor(
  country: string,
  domain: string,
): { row: Row; fact: Fact }[] {
  const rows = DOMAIN_ROWS[domain] ?? [];
  return rows
    .map((row) => ({ row, fact: getFact(country, domain, row.key) }))
    .filter((x): x is { row: Row; fact: Fact } => Boolean(x.fact));
}

/* ------------------------------------------------------------------ */
/* Verdict engine (demo)                                               */
/* ------------------------------------------------------------------ */

export type Verdict =
  | "same"
  | "different"
  | "a_higher"
  | "b_higher"
  | "unknown"
  | "not_comparable";

export function computeVerdict(row: Row, a?: Fact, b?: Fact): Verdict {
  if (!a || !b) return "unknown";
  if (row.kind === "text") {
    return a.value.zh.trim() === b.value.zh.trim() ? "same" : "different";
  }
  if (a.n === undefined || b.n === undefined) return "not_comparable";
  if (a.n === b.n) return "same";
  return a.n > b.n ? "a_higher" : "b_higher";
}

export function verdictLabel(lang: Lang, row: Row, verdict: Verdict): string {
  if ((verdict === "a_higher" || verdict === "b_higher") && row.higherLabel) {
    return verdict === "a_higher"
      ? row.higherLabel.a[lang]
      : row.higherLabel.b[lang];
  }
  const labels = {
    same: { zh: "相近", en: "Similar", id: "Mirip" },
    different: { zh: "各有特色", en: "Distinct", id: "Berbeda khas" },
    a_higher: { zh: "A 更高", en: "A higher", id: "A lebih tinggi" },
    b_higher: { zh: "B 更高", en: "B higher", id: "B lebih tinggi" },
    unknown: { zh: "资料不足", en: "Insufficient data", id: "Data kurang" },
    not_comparable: { zh: "难以比较", en: "Not comparable", id: "Tidak sebanding" },
  } as const;
  return labels[verdict][lang];
}

/* ------------------------------------------------------------------ */
/* Demo answer                                                         */
/* ------------------------------------------------------------------ */

export const DEMO_ANSWER: Record<
  Lang,
  { question: string; answer: string; citations: string[] }
> = {
  zh: {
    question: "印尼和越南的街头美食有什么不同？",
    answer:
      "结论：印尼街头美食重在「酱与香料」，越南更偏「清爽与鲜酸」，两者都适合从路边摊入门。\n\n印尼的炒饭、沙爹和仁当牛肉常以椰浆、花生酱和甜酱油打底，味道厚、层次多 [S1]。越南则以鱼露、青柠和新鲜香草提味，河粉、法棍三明治和烤肉米线是街头三件套 [S2]。\n\n如果怕辣，印尼的参巴辣酱通常单独给，可以先少放；越南整体辣度更温和 [S1][S2]。",
    citations: ["id_tourism", "vn_tourism"],
  },
  en: {
    question: "How does Indonesian street food differ from Vietnamese?",
    answer:
      "Bottom line: Indonesian street food is built on sambal and spice pastes, while Vietnamese food leans bright, herby and sour. Both are best started at a roadside stall.\n\nIn Indonesia, nasi goreng, satay and rendang rely on coconut milk, peanut sauce and sweet soy for a deep, layered taste [S1]. Vietnam lifts dishes with fish sauce, lime and fresh herbs; pho, banh mi and bun cha are the street trio [S2].\n\nIf you are heat-sensitive, sambal is usually served on the side in Indonesia, while Vietnamese food is generally milder [S1][S2].",
    citations: ["id_tourism", "vn_tourism"],
  },
  id: {
    question: "Apa bedanya kuliner jalanan Indonesia dan Vietnam?",
    answer:
      "Intinya: kuliner jalanan Indonesia bertumpu pada sambal dan bumbu, sementara Vietnam lebih segar, herbal, dan asam. Keduanya paling pas dimulai dari warung pinggir jalan.\n\nDi Indonesia, nasi goreng, sate, dan rendang memakai santan, saus kacang, dan kecap manis [S1]. Vietnam memakai kecap ikan, jeruk nipis, dan daun segar; pho, banh mi, dan bun cha adalah trio jalanannya [S2].\n\nJika tidak tahan pedas, sambal biasanya terpisah di Indonesia, sedangkan masakan Vietnam umumnya lebih ringan pedasnya [S1][S2].",
    citations: ["id_tourism", "vn_tourism"],
  },
};
