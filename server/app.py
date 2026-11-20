"""
ASEAN Bridge content + RAG API.

Run:
  .venv\\Scripts\\python -m uvicorn app:app --host 127.0.0.1 --port 8100

Data:
  seed.json is exported from web/lib/data.ts via `npm run export:seed`.
  On startup it is loaded into server/content.db (SQLite).

Optional LLM (OpenAI-compatible):
  LLM_BASE_URL=https://api.example.com/v1
  LLM_API_KEY=...
  LLM_MODEL=...
Without these, /v1/ask uses a grounded extractive answerer.
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
SEED_PATH = BASE_DIR / "seed.json"
DB_PATH = BASE_DIR / "content.db"
ARCHIVE_DB_PATH = BASE_DIR / "archive.db"
MODEL_CONFIG_PATH = BASE_DIR / "model_config.json"

LANGS = ("zh", "en", "id")

DOMAIN_KEYWORDS = {
    "food": ["美食", "吃", "菜", "街头", "辣", "food", "eat", "dish", "street", "kuliner", "makan", "pedas", "hidangan", "masakan", "khas"],
    "places": ["景点", "玩", "城市", "遗产", "风景", "季节", "什么时候", "place", "visit", "heritage", "season", "destinasi", "wisata", "kota"],
    "culture": ["文化", "人文", "习俗", "礼仪", "节日", "节庆", "泼水节", "水灯节", "开斋节", "宗教", "culture", "custom", "festival", "etiquette", "songkran", "budaya", "adat", "agama"],
    "travel": ["货币", "交通", "小费", "英语", "实用", "currency", "transport", "tipping", "english", "practical", "uang", "transportasi"],
}

KEY_HINTS = {
    "signature": ["代表菜", "招牌菜", "吃什么", "signature", "hidangan khas", "masakan khas"],
    "spice": ["辣", "pedas", "spicy", "heat"],
    "street": ["街头", "小吃", "street", "jajanan"],
    "drink": ["喝", "饮品", "咖啡", "茶", "drink", "kopi", "minuman"],
    "currency": ["货币", "钱", "currency", "uang", "mata uang"],
    "english": ["英语", "english", "bahasa inggris"],
    "transport": ["交通", "怎么去", "transport", "transportasi"],
    "connect": ["网络", "插座", "sim", "wifi", "internet", "colokan"],
    "tipping": ["小费", "tip"],
    "landmark": ["景点", "地标", "必去", "landmark", "wajib"],
    "season": ["季节", "什么时候", "最佳", "best time", "musim"],
    "daytrip": ["一日游", "day trip", "sehari"],
    "heritage": ["遗产", "heritage", "warisan"],
    "festival": ["节", "泼水", "festival", "songkran"],
    "greeting": ["问候", "打招呼", "greeting", "salam"],
    "dress": ["穿", "着装", "禁忌", "dress", "busana"],
    "etiquette": ["礼仪", "禁忌", "etiquette", "adat"],
}

COUNTRY_ALIASES = {
    "印尼": "ID",
    "大马": "MY",
    "狮城": "SG",
    "吴哥": "KH",
    "暹粒": "KH",
    "金边": "KH",
    "蒲甘": "MM",
    "仰光": "MM",
    "下龙湾": "VN",
    "会安": "VN",
    "河内": "VN",
    "胡志明": "VN",
    "巴厘": "ID",
    "雅加达": "ID",
    "日惹": "ID",
    "琅勃拉邦": "LA",
    "万象": "LA",
    "双子塔": "MY",
    "槟城": "MY",
    "马六甲": "MY",
    "大皇宫": "TH",
    "清迈": "TH",
    "曼谷": "TH",
    "长滩岛": "PH",
    "宿务": "PH",
    "圣淘沙": "SG",
    "斯里巴加湾": "BN",
}

# ---------------------------------------------------------------------------
# Data layer
# ---------------------------------------------------------------------------


def load_seed() -> dict[str, Any]:
    if not SEED_PATH.exists():
        raise RuntimeError(f"seed not found: {SEED_PATH}. Run `npm run export:seed` in web/.")
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def init_db(seed: dict[str, Any]) -> None:
    if DB_PATH.exists():
        DB_PATH.unlink()
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(
        """
        CREATE TABLE countries(
          code TEXT PRIMARY KEY, name TEXT, capital TEXT, currency TEXT,
          locale TEXT, blurb TEXT, official_url TEXT, status TEXT
        );
        CREATE TABLE domains(
          code TEXT PRIMARY KEY, name TEXT, blurb TEXT, icon TEXT, ord INTEGER
        );
        CREATE TABLE rows(
          domain TEXT, key TEXT, label TEXT, kind TEXT, higher_label TEXT,
          ord INTEGER, PRIMARY KEY(domain, key)
        );
        CREATE TABLE facts(
          country TEXT, domain TEXT, key TEXT, value TEXT, n REAL,
          as_of TEXT, source_id TEXT,
          PRIMARY KEY(country, domain, key)
        );
        CREATE TABLE sources(
          id TEXT PRIMARY KEY, issuer TEXT, title TEXT, url TEXT,
          retrieved TEXT, tier INTEGER, countries TEXT
        );
        CREATE INDEX idx_facts_country_domain ON facts(country, domain);
        """
    )
    for c in seed["countries"]:
        conn.execute(
            "INSERT INTO countries VALUES (?,?,?,?,?,?,?,?)",
            (
                c["code"],
                json.dumps(c["name"], ensure_ascii=False),
                json.dumps(c["capital"], ensure_ascii=False),
                c["currency"],
                c["locale"],
                json.dumps(c["blurb"], ensure_ascii=False),
                c["officialUrl"],
                c.get("status", "ready"),
            ),
        )
    for i, d in enumerate(seed["domains"]):
        conn.execute(
            "INSERT INTO domains VALUES (?,?,?,?,?)",
            (
                d["code"],
                json.dumps(d["name"], ensure_ascii=False),
                json.dumps(d["blurb"], ensure_ascii=False),
                d["icon"],
                i,
            ),
        )
    for domain, rows in seed["rows"].items():
        for i, row in enumerate(rows):
            conn.execute(
                "INSERT INTO rows VALUES (?,?,?,?,?,?)",
                (
                    domain,
                    row["key"],
                    json.dumps(row["label"], ensure_ascii=False),
                    row["kind"],
                    json.dumps(row.get("higherLabel"), ensure_ascii=False),
                    i,
                ),
            )
    for key, fact in seed["facts"].items():
        country, domain, field = key.split(":", 2)
        conn.execute(
            "INSERT INTO facts VALUES (?,?,?,?,?,?,?)",
            (
                country,
                domain,
                field,
                json.dumps(fact["value"], ensure_ascii=False),
                fact.get("n"),
                fact["asOf"],
                fact["sourceId"],
            ),
        )
    for s in seed["sources"]:
        conn.execute(
            "INSERT INTO sources VALUES (?,?,?,?,?,?,?)",
            (
                s["id"],
                s["issuer"],
                json.dumps(s["title"], ensure_ascii=False),
                s["url"],
                s["retrieved"],
                s["tier"],
                json.dumps(s["countries"]),
            ),
        )
    conn.commit()
    conn.close()


SEED = load_seed()
init_db(SEED)

COUNTRY_NAMES: dict[str, dict[str, str]] = {
    c["code"]: c["name"] for c in SEED["countries"]
}
COUNTRY_CAPITALS: dict[str, dict[str, str]] = {
    c["code"]: c["capital"] for c in SEED["countries"]
}
UNAVAILABLE_CODES = {
    c["code"] for c in SEED["countries"] if c.get("status") == "unavailable"
}

app = FastAPI(title="ASEAN Bridge API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3100", "http://localhost:3100"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def parse_lang(lang: str | None) -> str:
    return lang if lang in LANGS else "zh"


def jloads(value: str | None) -> Any:
    return json.loads(value) if value else None


# ---------------------------------------------------------------------------
# Public read endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> dict[str, Any]:
    conn = db()
    facts = conn.execute("SELECT COUNT(*) AS n FROM facts").fetchone()["n"]
    sources = conn.execute("SELECT COUNT(*) AS n FROM sources").fetchone()["n"]
    conn.close()
    return {"status": "ok", "facts": facts, "sources": sources}


@app.get("/v1/meta")
def meta() -> dict[str, Any]:
    conn = db()
    countries = conn.execute("SELECT COUNT(*) AS n FROM countries").fetchone()["n"]
    facts = conn.execute("SELECT COUNT(*) AS n FROM facts").fetchone()["n"]
    sources = conn.execute("SELECT COUNT(*) AS n FROM sources").fetchone()["n"]
    domains = [dict(r) for r in conn.execute("SELECT * FROM domains ORDER BY ord")]
    conn.close()
    return {
        "countries": countries,
        "facts": facts,
        "sources": sources,
        "domains": [
            {"code": d["code"], "name": jloads(d["name"]), "blurb": jloads(d["blurb"])}
            for d in domains
        ],
        "generated_at": SEED.get("generatedAt"),
    }


@app.get("/v1/countries")
def list_countries(lang: str | None = Query(default="zh")) -> dict[str, Any]:
    lang = parse_lang(lang)
    conn = db()
    rows = conn.execute("SELECT * FROM countries ORDER BY code").fetchall()
    out = []
    for r in rows:
        dish = conn.execute(
            "SELECT value, as_of FROM facts WHERE country=? AND domain='food' AND key='signature'",
            (r["code"],),
        ).fetchone()
        landmark = conn.execute(
            "SELECT value, as_of FROM facts WHERE country=? AND domain='places' AND key='landmark'",
            (r["code"],),
        ).fetchone()
        out.append(
            {
                "code": r["code"],
                "name": jloads(r["name"])[lang],
                "capital": jloads(r["capital"])[lang],
                "currency": r["currency"],
                "official_url": r["official_url"],
                "dish": jloads(dish["value"])[lang] if dish else None,
                "landmark": jloads(landmark["value"])[lang] if landmark else None,
            }
        )
    conn.close()
    return {"items": out}


@app.get("/v1/countries/{code}")
def country_detail(code: str, lang: str | None = Query(default="zh")) -> dict[str, Any]:
    lang = parse_lang(lang)
    code = code.upper()
    conn = db()
    c = conn.execute("SELECT * FROM countries WHERE code=?", (code,)).fetchone()
    if not c:
        conn.close()
        raise HTTPException(status_code=404, detail="country not found")
    facts = conn.execute(
        "SELECT * FROM facts WHERE country=? ORDER BY domain, key", (code,)
    ).fetchall()
    sources = conn.execute("SELECT * FROM sources").fetchall()
    src_map = {
        s["id"]: {
            "id": s["id"],
            "issuer": s["issuer"],
            "title": jloads(s["title"])[lang],
            "url": s["url"],
            "retrieved": s["retrieved"],
            "tier": s["tier"],
        }
        for s in sources
        if code in json.loads(s["countries"])
    }
    grouped: dict[str, list[dict[str, Any]]] = {}
    for f in facts:
        grouped.setdefault(f["domain"], []).append(
            {
                "key": f["key"],
                "value": jloads(f["value"])[lang],
                "n": f["n"],
                "as_of": f["as_of"],
                "source": src_map.get(f["source_id"]),
            }
        )
    conn.close()
    return {
        "code": code,
        "name": jloads(c["name"])[lang],
        "capital": jloads(c["capital"])[lang],
        "currency": c["currency"],
        "blurb": jloads(c["blurb"])[lang],
        "official_url": c["official_url"],
        "facts": grouped,
        "sources": list(src_map.values()),
    }


def archive_summary(source_id: str) -> dict[str, Any] | None:
    if not ARCHIVE_DB_PATH.exists():
        return None
    conn = sqlite3.connect(ARCHIVE_DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM snapshots WHERE source_id=? ORDER BY id DESC LIMIT 1",
        (source_id,),
    ).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "snapshot_id": row["id"],
        "status": row["status"],
        "http_status": row["http_status"],
        "checked_at": row["fetched_at"],
        "bytes": row["bytes"],
        "sha256": row["sha256"],
        "title": row["title"],
        "excerpt": row["excerpt"],
        "text_chars": row["text_chars"],
        "url": row["final_url"] or row["url"],
        "error": row["error"],
    }


@app.get("/v1/sources/{source_id}/snapshot")
def source_snapshot(source_id: str) -> dict[str, Any]:
    conn = db()
    source = conn.execute("SELECT * FROM sources WHERE id=?", (source_id,)).fetchone()
    conn.close()
    if not source:
        raise HTTPException(status_code=404, detail="source not found")
    snap = archive_summary(source_id)
    if not snap:
        raise HTTPException(status_code=404, detail="no snapshot for this source")
    return {
        "source_id": source_id,
        "issuer": source["issuer"],
        "registered_url": source["url"],
        "title": jloads(source["title"]),
        "tier": source["tier"],
        "snapshot": snap,
    }


@app.get("/v1/archive/stats")
def archive_stats() -> dict[str, Any]:
    if not ARCHIVE_DB_PATH.exists():
        return {"snapshots": 0, "ok": 0, "failed": 0, "bytes": 0, "by_status": {}}
    conn = sqlite3.connect(ARCHIVE_DB_PATH)
    conn.row_factory = sqlite3.Row
    by_status = {
        row["status"]: row["n"]
        for row in conn.execute(
            "SELECT status, COUNT(*) AS n FROM snapshots GROUP BY status"
        )
    }
    total = conn.execute("SELECT COUNT(*) AS n FROM snapshots").fetchone()["n"]
    recent = [
        dict(row)
        for row in conn.execute(
            "SELECT source_id,status,http_status,bytes,fetched_at FROM snapshots ORDER BY id DESC LIMIT 5"
        )
    ]
    conn.close()
    ok = sum(v for k, v in by_status.items() if k == "ok")
    return {
        "snapshots": total,
        "ok": ok,
        "failed": total - ok,
        "by_status": by_status,
        "recent": recent,
    }


@app.get("/v1/sources")
def list_sources() -> dict[str, Any]:
    conn = db()
    rows = conn.execute("SELECT * FROM sources ORDER BY tier, issuer").fetchall()
    conn.close()
    items = []
    for r in rows:
        snap = archive_summary(r["id"])
        items.append(
            {
                "id": r["id"],
                "issuer": r["issuer"],
                "title": jloads(r["title"]),
                "url": r["url"],
                "retrieved": r["retrieved"],
                "tier": r["tier"],
                "countries": json.loads(r["countries"]),
                "archive": (
                    None
                    if not snap
                    else {
                        "status": snap["status"],
                        "http_status": snap["http_status"],
                        "checked_at": snap["checked_at"],
                        "bytes": snap["bytes"],
                        "sha256": snap["sha256"],
                    }
                ),
            }
        )
    return {"items": items}


# ---------------------------------------------------------------------------
# Comparison
# ---------------------------------------------------------------------------


def verdict_for(kind: str, a: dict[str, Any] | None, b: dict[str, Any] | None) -> str:
    if not a or not b:
        return "unknown"
    if kind == "text":
        return "same" if a["value"].strip() == b["value"].strip() else "different"
    if a["n"] is None or b["n"] is None:
        return "not_comparable"
    if a["n"] == b["n"]:
        return "same"
    return "a_higher" if a["n"] > b["n"] else "b_higher"


@app.get("/v1/compare")
def compare(
    domain: str,
    a: str,
    b: str,
    lang: str | None = Query(default="zh"),
) -> dict[str, Any]:
    lang = parse_lang(lang)
    a, b = a.upper(), b.upper()
    conn = db()
    d = conn.execute("SELECT * FROM domains WHERE code=?", (domain,)).fetchone()
    if not d:
        conn.close()
        raise HTTPException(status_code=404, detail="domain not found")
    names = {}
    for code in (a, b):
        row = conn.execute("SELECT name FROM countries WHERE code=?", (code,)).fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail=f"country not found: {code}")
        names[code] = jloads(row["name"])[lang]

    row_defs = conn.execute(
        "SELECT * FROM rows WHERE domain=? ORDER BY ord", (domain,)
    ).fetchall()
    out_rows = []
    for rd in row_defs:
        cells = {}
        for code in (a, b):
            f = conn.execute(
                "SELECT * FROM facts WHERE country=? AND domain=? AND key=?",
                (code, domain, rd["key"]),
            ).fetchone()
            if f:
                src = conn.execute(
                    "SELECT * FROM sources WHERE id=?", (f["source_id"],)
                ).fetchone()
                cells[code] = {
                    "value": jloads(f["value"])[lang],
                    "n": f["n"],
                    "as_of": f["as_of"],
                    "source": {
                        "id": src["id"],
                        "issuer": src["issuer"],
                        "retrieved": src["retrieved"],
                        "title": jloads(src["title"])[lang],
                    },
                }
            else:
                cells[code] = None
        out_rows.append(
            {
                "field": rd["key"],
                "label": jloads(rd["label"])[lang],
                "kind": rd["kind"],
                "a": cells[a],
                "b": cells[b],
                "verdict": verdict_for(rd["kind"], cells[a], cells[b]),
            }
        )
    conn.close()
    return {
        "domain": domain,
        "domain_name": jloads(d["name"])[lang],
        "a": {"code": a, "name": names[a]},
        "b": {"code": b, "name": names[b]},
        "lang": lang,
        "rows": out_rows,
    }


# ---------------------------------------------------------------------------
# Retrieval + grounded answer
# ---------------------------------------------------------------------------


def detect_countries(question: str) -> list[str]:
    ql = question.lower()
    found: list[str] = []
    for code, names in COUNTRY_NAMES.items():
        if any(str(v).lower() in ql for v in names.values()):
            found.append(code)
    for alias, code in COUNTRY_ALIASES.items():
        if alias in question and code not in found:
            found.append(code)
    if not found:
        for code in COUNTRY_NAMES:
            if re.search(rf"\b{code}\b", question):
                found.append(code)
    return list(dict.fromkeys(found))[:2]


def detect_domains(question: str) -> list[str]:
    q = question.lower()
    found = []
    for domain, words in DOMAIN_KEYWORDS.items():
        if any(w.lower() in q for w in words):
            found.append(domain)
    return found


def retrieve(question: str, lang: str, top_k: int = 8) -> list[dict[str, Any]]:
    countries = detect_countries(question)
    domains = detect_domains(question)
    conn = db()
    sql = "SELECT * FROM facts"
    params: list[Any] = []
    if countries:
        sql += " WHERE country IN (%s)" % ",".join("?" * len(countries))
        params.extend(countries)
    rows = conn.execute(sql, params).fetchall()
    conn.close()

    if domains:
        narrowed = [f for f in rows if f["domain"] in domains]
        if len(narrowed) >= 3:
            rows = narrowed

    q = question.lower()

    def score(f: sqlite3.Row) -> float:
        s = 0.0
        if domains and f["domain"] in domains:
            s += 6
        if countries and f["country"] in countries:
            s += 4
        hints = KEY_HINTS.get(f["key"], [])
        if any(h.lower() in q for h in hints):
            s += 5
        text = f"{f['domain']} {f['key']} {jloads(f['value']).get(lang, '')}".lower()
        for token in set(re.findall(r"[a-z]{3,}|[\u4e00-\u9fff]{2,}", q)):
            if token in text:
                s += 2
        # Prefer facts that make a readable answer.
        if f["key"] in {"signature", "spice", "street", "landmark", "season", "festival", "greeting", "transport"}:
            s += 1
        return s

    ranked = sorted(rows, key=score, reverse=True)
    if not ranked or score(ranked[0]) <= 0:
        return []
    ranked = [f for f in ranked if score(f) > 0][: top_k * 2]

    # keep at most 3 per country+domain, ensure both countries appear
    out: list[dict[str, Any]] = []
    per: dict[tuple[str, str], int] = {}
    for f in ranked:
        k = (f["country"], f["domain"])
        if per.get(k, 0) >= 3:
            continue
        per[k] = per.get(k, 0) + 1
        out.append(dict(f))
        if len(out) >= top_k:
            break
    return out


def fact_public(f: dict[str, Any], lang: str) -> dict[str, Any]:
    conn = db()
    src = conn.execute("SELECT * FROM sources WHERE id=?", (f["source_id"],)).fetchone()
    conn.close()
    return {
        "country": f["country"],
        "domain": f["domain"],
        "key": f["key"],
        "value": jloads(f["value"])[lang],
        "as_of": f["as_of"],
        "source_id": f["source_id"],
        "source": {
            "id": src["id"],
            "issuer": src["issuer"],
            "title": jloads(src["title"])[lang],
            "url": src["url"],
            "retrieved": src["retrieved"],
            "tier": src["tier"],
        },
    }


def labels_for(keys: list[str], lang: str) -> dict[str, str]:
    conn = db()
    out = {}
    for k in keys:
        r = conn.execute(
            "SELECT label FROM rows WHERE key=? LIMIT 1", (k,)
        ).fetchone()
        out[k] = jloads(r["label"])[lang] if r else k
    conn.close()
    return out


def compose_extractive(
    facts: list[dict[str, Any]], lang: str, question: str
) -> tuple[str, list[dict[str, Any]], list[dict[str, Any]]]:
    citations: list[dict[str, Any]] = []
    marker_of: dict[str, str] = {}

    def cite(f: dict[str, Any]) -> str:
        key = f"{f['country']}:{f['domain']}:{f['key']}"
        if key in marker_of:
            return marker_of[key]
        marker = f"S{len(citations) + 1}"
        marker_of[key] = marker
        citations.append(
            {
                "marker": marker,
                "source_id": f["source_id"],
                "issuer": f["source"]["issuer"],
                "title": f["source"]["title"],
                "url": f["source"]["url"],
                "retrieved": f["source"]["retrieved"],
                "quote": f["value"],
                "country": f["country"],
                "domain": f["domain"],
            }
        )
        return marker

    countries: list[str] = []
    for f in facts:
        if f["country"] not in countries:
            countries.append(f["country"])
    names = {
        c: next((x["name"][lang] for x in SEED["countries"] if x["code"] == c), c)
        for c in countries
    }
    labels = labels_for(sorted({f["key"] for f in facts}), lang)

    lines: list[str] = []
    if lang == "zh":
        lines.append("以下依据站内已收录内容整理。")
        for c in countries:
            own = [f for f in facts if f["country"] == c][:3]
            parts = []
            for f in own:
                label = labels.get(f["key"], f["key"])
                parts.append(f"{label}是{f['value']} [{cite(f)}]")
            lines.append(f"{names[c]}：{'；'.join(parts)}。")
        if len(countries) == 2:
            a, b = countries
            same_key = [
                f["key"]
                for f in facts
                if f["country"] == a
                and any(g["country"] == b and g["key"] == f["key"] for g in facts)
            ]
            if same_key:
                k = same_key[0]
                fa = next(f for f in facts if f["country"] == a and f["key"] == k)
                fb = next(f for f in facts if f["country"] == b and f["key"] == k)
                lines.append(
                    f"就{labels.get(k, k)}而言，{names[a]}为{fa['value']}，"
                    f"{names[b]}为{fb['value']} [{cite(fa)}][{cite(fb)}]。"
                )
        lines.append("以上为编辑整理与示例评分，出行前请核对官方信息。")
    elif lang == "en":
        lines.append("Based on the entries in the library:")
        for c in countries:
            own = [f for f in facts if f["country"] == c][:3]
            parts = [
                f"{labels.get(f['key'], f['key'])}: {f['value']} [{cite(f)}]"
                for f in own
            ]
            lines.append(f"{names[c]} — {'; '.join(parts)}.")
        if len(countries) == 2:
            a, b = countries
            same_key = [
                f["key"]
                for f in facts
                if f["country"] == a
                and any(g["country"] == b and g["key"] == f["key"] for g in facts)
            ]
            if same_key:
                k = same_key[0]
                fa = next(f for f in facts if f["country"] == a and f["key"] == k)
                fb = next(f for f in facts if f["country"] == b and f["key"] == k)
                lines.append(
                    f"On {labels.get(k, k).lower()}, {names[a]} is {fa['value']}, "
                    f"while {names[b]} is {fb['value']} [{cite(fa)}][{cite(fb)}]."
                )
        lines.append("Editorial sample content — check official sources before you travel.")
    else:
        lines.append("Berdasarkan entri di pustaka:")
        for c in countries:
            own = [f for f in facts if f["country"] == c][:3]
            parts = [
                f"{labels.get(f['key'], f['key'])}: {f['value']} [{cite(f)}]"
                for f in own
            ]
            lines.append(f"{names[c]} — {'; '.join(parts)}.")
        if len(countries) == 2:
            a, b = countries
            same_key = [
                f["key"]
                for f in facts
                if f["country"] == a
                and any(g["country"] == b and g["key"] == f["key"] for g in facts)
            ]
            if same_key:
                k = same_key[0]
                fa = next(f for f in facts if f["country"] == a and f["key"] == k)
                fb = next(f for f in facts if f["country"] == b and f["key"] == k)
                lines.append(
                    f"Untuk {labels.get(k, k).lower()}, {names[a]} {fa['value']}, "
                    f"sedangkan {names[b]} {fb['value']} [{cite(fa)}][{cite(fb)}]."
                )
        lines.append("Konten contoh editorial — cek sumber resmi sebelum berangkat.")

    return "\n\n".join(lines), citations, facts


def verify_answer(
    answer_md: str, citations: list[dict[str, Any]], lang: str = "zh"
) -> tuple[str, dict[str, int]]:
    """Drop sentences whose markers do not exist or whose numbers are unsupported."""
    markers = {c["marker"]: c for c in citations}
    removed = 0
    verified = 0
    kept_paragraphs: list[str] = []
    joiner = "" if lang in ("zh", "id") else " "

    for paragraph in answer_md.split("\n\n"):
        if not paragraph.strip():
            continue
        kept_sentences: list[str] = []
        for s in re.split(r"(?<=[。！？.!?])\s*", paragraph):
            s = s.strip()
            if not s:
                continue
            used = re.findall(r"\[(S\d+)\]", s)
            if not used:
                kept_sentences.append(s)
                continue
            if any(m not in markers for m in used):
                removed += 1
                continue
            nums = set(
                re.findall(r"\d+(?:\.\d+)?", re.sub(r"\[S\d+\]", "", s))
            )
            allowed: set[str] = set()
            for m in used:
                allowed.update(
                    re.findall(r"\d+(?:\.\d+)?", markers[m]["quote"])
                )
            if nums and not nums.issubset(allowed):
                removed += 1
                continue
            verified += 1
            kept_sentences.append(s)
        if kept_sentences:
            kept_paragraphs.append(joiner.join(kept_sentences))

    text = "\n\n".join(kept_paragraphs)
    if removed:
        text += f"\n\n（已移除 {removed} 条无法核验的表述）"
    return text, {"sentences": verified + removed, "verified": verified, "removed": removed}


def mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "••••••"
    return f"{key[:4]}…{key[-2:]}"


def load_model_config() -> dict[str, Any] | None:
    if MODEL_CONFIG_PATH.exists():
        try:
            cfg = json.loads(MODEL_CONFIG_PATH.read_text(encoding="utf-8"))
            if cfg.get("base_url") and cfg.get("model"):
                cfg.setdefault("api_key", "")
                cfg.setdefault("temperature", 0.2)
                return cfg
        except (json.JSONDecodeError, OSError):
            pass
    base = os.environ.get("LLM_BASE_URL")
    model = os.environ.get("LLM_MODEL")
    if base and model:
        return {
            "base_url": base,
            "model": model,
            "api_key": os.environ.get("LLM_API_KEY", ""),
            "temperature": 0.2,
            "source": "env",
        }
    return None


def save_model_config(cfg: dict[str, Any]) -> None:
    payload = {
        "base_url": cfg["base_url"].rstrip("/"),
        "model": cfg["model"],
        "api_key": cfg.get("api_key", ""),
        "temperature": float(cfg.get("temperature", 0.2)),
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    MODEL_CONFIG_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def chat_completion(
    cfg: dict[str, Any],
    messages: list[dict[str, str]],
    max_tokens: int = 900,
    timeout: int = 45,
) -> tuple[str | None, str | None, dict[str, Any]]:
    url = cfg["base_url"].rstrip("/") + "/chat/completions"
    headers = {"Content-Type": "application/json"}
    if cfg.get("api_key"):
        headers["Authorization"] = f"Bearer {cfg['api_key']}"
    payload = {
        "model": cfg["model"],
        "temperature": float(cfg.get("temperature", 0.2)),
        "max_tokens": max_tokens,
        "messages": messages,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"], None, data.get("usage", {})
    except urllib.error.HTTPError as e:
        body = ""
        try:
            body = e.read().decode("utf-8", errors="ignore")[:300]
        except Exception:
            pass
        return None, f"HTTP {e.code}: {body or e.reason}", {}
    except Exception as e:
        return None, f"{type(e).__name__}: {str(e)[:200]}", {}


class ModelConfigRequest(BaseModel):
    base_url: str = Field(min_length=8, max_length=300)
    model: str = Field(min_length=1, max_length=120)
    api_key: str | None = None
    temperature: float = Field(default=0.2, ge=0, le=1)


class ModelTestRequest(BaseModel):
    base_url: str | None = None
    model: str | None = None
    api_key: str | None = None


@app.get("/v1/model")
def model_status() -> dict[str, Any]:
    cfg = load_model_config()
    if not cfg:
        return {"configured": False, "mode": "extractive"}
    return {
        "configured": True,
        "base_url": cfg["base_url"],
        "model": cfg["model"],
        "api_key_masked": mask_key(cfg.get("api_key", "")),
        "source": cfg.get("source", "file"),
        "updated_at": cfg.get("updated_at"),
    }


@app.post("/v1/model/config")
def model_config(req: ModelConfigRequest) -> dict[str, Any]:
    if not req.base_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=422, detail="base_url must start with http:// or https://")
    existing = load_model_config() or {}
    api_key = req.api_key if req.api_key is not None else existing.get("api_key", "")
    save_model_config(
        {
            "base_url": req.base_url,
            "model": req.model,
            "api_key": api_key,
            "temperature": req.temperature,
        }
    )
    return model_status()


@app.post("/v1/model/test")
def model_test(req: ModelTestRequest) -> dict[str, Any]:
    saved = load_model_config() or {}
    cfg = {
        "base_url": req.base_url or saved.get("base_url", ""),
        "model": req.model or saved.get("model", ""),
        "api_key": req.api_key if req.api_key is not None else saved.get("api_key", ""),
        "temperature": 0,
    }
    if not cfg["base_url"] or not cfg["model"]:
        raise HTTPException(status_code=422, detail="base_url and model are required")
    started = time.time()
    content, error, _ = chat_completion(
        cfg,
        [
            {"role": "system", "content": "Reply with the single word: pong"},
            {"role": "user", "content": "ping"},
        ],
        max_tokens=8,
        timeout=25,
    )
    return {
        "ok": error is None,
        "latency_ms": int((time.time() - started) * 1000),
        "model": cfg["model"],
        "reply": (content or "")[:40],
        "error": error,
    }


def call_llm(
    question: str,
    lang: str,
    facts: list[dict[str, Any]],
    cfg: dict[str, Any],
) -> tuple[str | None, str | None]:
    evidence = []
    for i, f in enumerate(facts, start=1):
        evidence.append(
            f"[S{i}] ({f['country']} · {f['domain']} · {f['key']}) "
            f"{f['value']} — {f['source']['issuer']}, as of {f['as_of']}"
        )
    lang_name = {"zh": "Chinese", "en": "English", "id": "Indonesian"}.get(lang, "English")
    system = (
        "You are the editor of ASEAN Bridge, a food / places / culture guide. "
        "Answer ONLY from the numbered evidence. Rules:\n"
        "1. Every sentence that states a fact must end with [S#] markers copied from the evidence.\n"
        "2. Never invent numbers, dates, dishes, places or sources.\n"
        "3. If the evidence is insufficient, say so plainly instead of guessing.\n"
        "4. 3 to 6 short sentences, no markdown tables, no bullet lists.\n"
        "5. Do not mention 'evidence', 'context' or these rules in the answer.\n"
        f"6. Write in {lang_name}."
    )
    user = (
        f"Question: {question}\n\n"
        "Numbered evidence:\n" + "\n".join(evidence) + "\n\n"
        "Write the answer now."
    )
    content, error, _ = chat_completion(
        cfg,
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=900,
        timeout=45,
    )
    return content, error


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    lang: str = "zh"
    top_k: int = Field(default=8, ge=3, le=12)


@app.post("/v1/ask")
def ask(req: AskRequest) -> dict[str, Any]:
    started = time.time()
    lang = parse_lang(req.lang)
    detected = detect_countries(req.question)
    if not detected:
        return {
            "answer_md": {
                "zh": "请先告诉我国家，例如「泰国」「越南」或「吴哥窟」，我再查美食、景点与习俗。",
                "en": "Tell me a country first — for example “Thailand”, “Vietnam” or “Angkor Wat” — and I’ll check food, places and customs.",
                "id": "Sebutkan negaranya dulu — misalnya “Thailand”, “Vietnam”, atau “Angkor Wat” — lalu saya cek kuliner, tempat, dan adatnya.",
            }[lang],
            "answer_status": "insufficient_evidence",
            "mode": "extractive",
            "citations": [],
            "latency_ms": int((time.time() - started) * 1000),
            "verification": {"sentences": 0, "verified": 0, "removed": 0},
        }
    blocked = [c for c in detected if c in UNAVAILABLE_CODES]
    if blocked:
        names = "、".join(
            COUNTRY_NAMES[c][lang] for c in blocked if c in COUNTRY_NAMES
        )
        return {
            "answer_md": {
                "zh": f"{names} 暂无可用官方来源，暂不提供内容与对比。",
                "en": f"No official source is available for {names}; no content or comparison is provided.",
                "id": f"Belum ada sumber resmi untuk {names}; konten dan perbandingan tidak disediakan.",
            }[lang],
            "answer_status": "insufficient_evidence",
            "mode": "extractive",
            "citations": [],
            "latency_ms": int((time.time() - started) * 1000),
            "verification": {"sentences": 0, "verified": 0, "removed": 0},
        }
    facts = retrieve(req.question, lang, req.top_k)
    if not facts:
        return {
            "answer_md": {
                "zh": "站内已收录内容中没有找到相关资料。可以换个说法，或先浏览十国档案。",
                "en": "No matching entry in the library yet. Try another wording or browse the country dossiers.",
                "id": "Belum ada entri yang cocok di pustaka. Coba kata lain atau buka profil negara.",
            }[lang],
            "answer_status": "insufficient_evidence",
            "mode": "extractive",
            "citations": [],
            "latency_ms": int((time.time() - started) * 1000),
            "verification": {"sentences": 0, "verified": 0, "removed": 0},
        }

    public_facts = [fact_public(f, lang) for f in facts]
    answer_md, citations, _ = compose_extractive(public_facts, lang, req.question)
    mode = "extractive"

    cfg = load_model_config()
    llm_error: str | None = None
    llm_answer: str | None = None
    if cfg:
        llm_answer, llm_error = call_llm(req.question, lang, public_facts, cfg)
    if llm_answer:
        # LLM citations are the same evidence set, in the same order.
        llm_citations = []
        for i, f in enumerate(public_facts, start=1):
            llm_citations.append(
                {
                    "marker": f"S{i}",
                    "source_id": f["source"]["id"],
                    "issuer": f["source"]["issuer"],
                    "title": f["source"]["title"],
                    "url": f["source"]["url"],
                    "retrieved": f["source"]["retrieved"],
                    "quote": f["value"],
                    "country": f["country"],
                    "domain": f["domain"],
                }
            )
        answer_md, citations = llm_answer, llm_citations
        mode = "llm"

    verified_text, stats = verify_answer(answer_md, citations, lang)
    status = "answered" if stats["verified"] > 0 else "partial"
    return {
        "answer_md": verified_text,
        "answer_status": status,
        "mode": mode,
        "model": {
            "name": cfg.get("model") if (cfg and mode == "llm") else None,
            "base_url": cfg.get("base_url") if (cfg and mode == "llm") else None,
        },
        "fallback_reason": (
            llm_error if (cfg and mode == "extractive" and llm_error) else None
        ),
        "citations": citations,
        "latency_ms": int((time.time() - started) * 1000),
        "verification": stats,
    }

