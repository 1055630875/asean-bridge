"""
Source ingestion and archiving.

  python ingest.py --all
  python ingest.py --source my_tourism
  python ingest.py --all --dry-run

For each registered source:
  1. check robots.txt
  2. fetch with a fixed UA, timeout and size cap
  3. store raw bytes under archive/<source_id>/
  4. record http status, sha256, size, title, excerpt and errors in archive.db

Failures are recorded as failures — nothing is marked "ok" unless it was fetched.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

BASE = Path(__file__).resolve().parent
SEED = BASE / "seed.json"
ARCHIVE_DB = BASE / "archive.db"
ARCHIVE_DIR = BASE / "archive"

UA = "ASEANBridgeBot/0.1 (+mailto:ops@example.org)"
TIMEOUT = 20
MAX_BYTES = 5 * 1024 * 1024
DELAY = 2.0  # seconds between requests


class _TextExtractor(HTMLParser):
    SKIP = {"script", "style", "noscript", "svg", "template"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self._skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag == "title":
            self._in_title = True
        if tag in self.SKIP:
            self._skip_depth += 1

    def handle_endtag(self, tag: str):
        if tag == "title":
            self._in_title = False
        if tag in self.SKIP and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str):
        if self._in_title:
            self.title += data
        elif self._skip_depth == 0:
            text = data.strip()
            if text:
                self.parts.append(text)


def extract(html_bytes: bytes, charset: str | None) -> tuple[str, str]:
    try:
        raw = html_bytes.decode(charset or "utf-8", errors="ignore")
    except LookupError:
        raw = html_bytes.decode("utf-8", errors="ignore")
    parser = _TextExtractor()
    try:
        parser.feed(raw)
    except Exception:
        pass
    title = html.unescape(re.sub(r"\s+", " ", parser.title)).strip()
    text = html.unescape(" ".join(parser.parts))
    text = re.sub(r"\s+", " ", text).strip()
    return title[:300], text


def init_db() -> None:
    conn = sqlite3.connect(ARCHIVE_DB)
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS snapshots(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_id TEXT NOT NULL,
          url TEXT NOT NULL,
          final_url TEXT,
          http_status INTEGER,
          content_type TEXT,
          bytes INTEGER,
          sha256 TEXT,
          fetched_at TEXT NOT NULL,
          title TEXT,
          excerpt TEXT,
          text_chars INTEGER,
          storage_path TEXT,
          status TEXT NOT NULL,
          error TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_snap_source ON snapshots(source_id, id DESC);
        CREATE TABLE IF NOT EXISTS source_health(
          source_id TEXT PRIMARY KEY,
          last_status TEXT NOT NULL,
          last_checked_at TEXT NOT NULL,
          last_http_status INTEGER,
          last_snapshot_id INTEGER,
          ok_count INTEGER DEFAULT 0,
          fail_count INTEGER DEFAULT 0
        );
        """
    )
    conn.commit()
    conn.close()


def robots_allowed(url: str) -> tuple[bool, str]:
    parsed = urllib.parse.urlparse(url)
    robots = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    req = urllib.request.Request(robots, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read(200_000).decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            return False, f"robots.txt HTTP {e.code}"
        return True, f"robots.txt HTTP {e.code} (treated as allow)"
    except Exception as e:
        return True, f"robots.txt unavailable ({type(e).__name__})"

    from urllib.robotparser import RobotFileParser

    rp = RobotFileParser()
    rp.parse(body.splitlines())
    return rp.can_fetch(UA, url), "robots.txt parsed"


def fetch(source: dict) -> dict:
    url = source["url"]
    result: dict = {
        "source_id": source["id"],
        "url": url,
        "status": "error",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

    allowed, note = robots_allowed(url)
    if not allowed:
        result.update(status="robots_disallowed", error=note)
        return result

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5",
            "Accept-Language": "en;q=0.9,id;q=0.8,zh;q=0.7",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            content_type = (resp.headers.get("content-type") or "").lower()
            charset = resp.headers.get_content_charset()
            body = resp.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                result.update(
                    status="too_large",
                    http_status=resp.status,
                    content_type=content_type,
                    error=f"exceeds {MAX_BYTES} bytes",
                )
                return result

            sha = hashlib.sha256(body).hexdigest()
            ext = ".pdf" if "pdf" in content_type else ".html"
            day = result["fetched_at"][:10]
            folder = ARCHIVE_DIR / source["id"] / day
            folder.mkdir(parents=True, exist_ok=True)
            path = folder / f"{sha[:12]}{ext}"
            path.write_bytes(body)

            title = ""
            excerpt = ""
            text_chars = 0
            if ext == ".html":
                title, text = extract(body, charset)
                excerpt = text[:400]
                text_chars = len(text)

            result.update(
                status="ok",
                final_url=resp.geturl(),
                http_status=resp.status,
                content_type=content_type,
                bytes=len(body),
                sha256=sha,
                title=title,
                excerpt=excerpt,
                text_chars=text_chars,
                storage_path=str(path.relative_to(BASE)),
                robots_note=note,
            )
            return result

    except urllib.error.HTTPError as e:
        result.update(
            status="http_error",
            http_status=e.code,
            error=f"HTTP {e.code} {e.reason}",
        )
        return result
    except urllib.error.URLError as e:
        reason = str(e.reason)
        kind = "ssl_error" if "CERTIFICATE" in reason.upper() else "network_error"
        if "getaddrinfo" in reason or "Name or service" in reason:
            kind = "dns_error"
        result.update(status=kind, error=reason[:300])
        return result
    except Exception as e:  # pragma: no cover - defensive
        result.update(status="error", error=f"{type(e).__name__}: {str(e)[:200]}")
        return result


def persist(result: dict) -> int:
    conn = sqlite3.connect(ARCHIVE_DB)
    cur = conn.execute(
        """
        INSERT INTO snapshots(source_id,url,final_url,http_status,content_type,bytes,
          sha256,fetched_at,title,excerpt,text_chars,storage_path,status,error)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """,
        (
            result["source_id"],
            result["url"],
            result.get("final_url"),
            result.get("http_status"),
            result.get("content_type"),
            result.get("bytes"),
            result.get("sha256"),
            result["fetched_at"],
            result.get("title"),
            result.get("excerpt"),
            result.get("text_chars"),
            result.get("storage_path"),
            result["status"],
            result.get("error"),
        ),
    )
    snap_id = int(cur.lastrowid)
    ok = 1 if result["status"] == "ok" else 0
    conn.execute(
        """
        INSERT INTO source_health(source_id,last_status,last_checked_at,last_http_status,
          last_snapshot_id,ok_count,fail_count)
        VALUES(?,?,?,?,?,?,?)
        ON CONFLICT(source_id) DO UPDATE SET
          last_status=excluded.last_status,
          last_checked_at=excluded.last_checked_at,
          last_http_status=excluded.last_http_status,
          last_snapshot_id=excluded.last_snapshot_id,
          ok_count=source_health.ok_count + ?,
          fail_count=source_health.fail_count + ?
        """,
        (
            result["source_id"],
            result["status"],
            result["fetched_at"],
            result.get("http_status"),
            snap_id,
            ok,
            1 - ok,
            ok,
            1 - ok,
        ),
    )
    conn.commit()
    conn.close()
    return snap_id


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--source")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    seed = json.loads(SEED.read_text(encoding="utf-8"))
    sources = seed["sources"]
    if args.source:
        sources = [s for s in sources if s["id"] == args.source]
    if args.limit:
        sources = sources[: args.limit]
    if not sources:
        print("no matching sources")
        return

    init_db()
    print(f"{'source':22} {'status':18} {'http':4} {'bytes':>8}  detail")
    for i, source in enumerate(sources):
        if i:
            time.sleep(DELAY)
        if args.dry_run:
            print(f"{source['id']:22} {'dry-run':18} {'-':4} {'-':>8}  {source['url']}")
            continue
        result = fetch(source)
        snap_id = persist(result)
        size = result.get("bytes") or 0
        detail = result.get("error") or result.get("title") or ""
        print(
            f"{source['id']:22} {result['status']:18} "
            f"{str(result.get('http_status') or '-'):4} {size:8}  {detail[:70]}"
        )
        print(f"{'':22} snapshot #{snap_id}")


if __name__ == "__main__":
    main()
