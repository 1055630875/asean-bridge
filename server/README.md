# 内容与 RAG API（FastAPI + SQLite）

把 `web/lib/data.ts` 导出的内容落进 SQLite，并提供查询、对比与带引用的问答。

```
server/
├─ app.py            # FastAPI 应用：建库、读取、对比、检索、回答、引用校验
├─ ingest.py         # 抓取 + 存档 CLI（robots、限速、快照、失败记录）
├─ seed.json         # 由 web 导出（npm run export:seed），200 条事实 + 11 份来源
├─ content.db        # 启动时按 seed.json 重建
├─ archive.db        # 抓取快照元数据（不随 content.db 重建）
├─ archive/          # 原始 HTML/PDF 快照，按来源/日期存放
├─ requirements.txt
└─ test_ask.py       # 本地问答冒烟测试
```

## 启动

```bash
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8100
```

Windows 下首次建 venv 后，把 `.venv\Scripts` 加进 PATH 也可以直接 `uvicorn app:app --port 8100`。

## 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 事实/来源数量 |
| GET | `/v1/meta` | 主题、统计、seed 生成时间 |
| GET | `/v1/countries?lang=` | 十国列表（含代表菜、必去地标） |
| GET | `/v1/countries/{code}?lang=` | 国家详情 + 按主题分组的事实 |
| GET | `/v1/compare?domain=&a=&b=&lang=` | 两国对比，含 verdict |
| GET | `/v1/sources` | 来源库（含最近一次存档状态） |
| GET | `/v1/sources/{id}/snapshot` | 存档详情：状态、HTTP、大小、SHA-256、摘录 |
| GET | `/v1/archive/stats` | 快照总数、成功/失败、按状态分布 |
| POST | `/v1/ask` | 检索 + 生成 + 逐句引用校验 |
| GET | `/v1/model` | 当前模型配置（Key 掩码） |
| POST | `/v1/model/config` | 保存 OpenAI 兼容配置到 `model_config.json` |
| POST | `/v1/model/test` | 用 8 token 的 ping 测试连通性与延迟 |

`/v1/ask` 请求：

```json
{"question": "印尼和越南的街头美食有什么不同？", "lang": "zh", "top_k": 8}
```

响应关键字段：

```json
{
  "answer_md": "…… [S1] ……",
  "answer_status": "answered | partial | insufficient_evidence",
  "mode": "extractive | llm",
  "citations": [{"marker": "S1", "issuer": "Indonesia.travel", "quote": "沙爹、炸豆腐", "..." : "..."}],
  "verification": {"sentences": 3, "verified": 3, "removed": 0}
}
```

## 抓取与存档

```bash
.venv\Scripts\python ingest.py --all
.venv\Scripts\python ingest.py --source my_tourism
.venv\Scripts\python ingest.py --all --dry-run
```

规则：

- 先读 `robots.txt`，不允许就不抓（记录 `robots_disallowed`）
- 固定 UA `ASEANBridgeBot/0.1`，超时 20s，单文件上限 5MB，请求间隔 2s
- 原始文件按 `archive/{source_id}/{YYYY-MM-DD}/{sha256前12位}.html` 存放
- 元数据写 `archive.db`：HTTP 状态、内容类型、大小、SHA-256、标题、400 字摘录、错误
- **失败也落库**，不会被标成成功

首次抓取只有 4/11 可访问；逐国核对后，最终只保留**有官方/国际组织来源**的 8 个站点，全部抓取成功（2026-11-16，网络环境相关）。菲律宾、老挝、缅甸的官方站点不可达，按严格策略不展示条目、不参与对比。

| 国家 | 来源 | 层级 |
|---|---|---|
| 印尼 | Indonesia.travel（英文子站） | 官方 |
| 马来西亚 | Tourism Malaysia | 官方 |
| 泰国 | TAT Newsroom（泰国旅游局新闻室） | 官方 |
| 越南 | 文化体育与旅游部 | 官方 |
| 新加坡 | Singapore Tourism Board | 官方 |
| 文莱 | Brunei Tourism | 官方 |
| 柬埔寨 | 旅游部（JS 站点，快照仅 4 KB 壳） | 官方 |
| 区域 | UNESCO World Heritage Centre | 国际组织 |
| 菲律宾 / 老挝 / 缅甸 | **暂无可用官方来源，不展示条目** | — |

曾尝试用 Travelindex 运营的 Visit Philippines / Visit Laos 与 UNESCO 国别页补位，核对后发现前者是商业门户、后者与美食民俗内容范围不符，已全部撤下。严格策略下，这三个国家在 API 与页面中都明确返回「暂无可用官方来源」，而不是挂一个不对口的来源。

公开页只展示元数据与短摘录，原始快照仅本地保存用于核验。

## 检索与回答

1. 识别国家：中文/英文/印尼语国名 + 城市/地标别名（吴哥、蒲甘、下龙湾…）。
2. 识别主题：美食 / 景点 / 人文 / 实用 的关键词表。
3. 排序：主题命中 + 国家命中 + 字段意图（货币、辣度、季节…）+ 词面重叠。
4. 生成：
   - 未配置模型 → **抽取式模板**，每个事实一句并挂 `[S#]`；
   - 配置 OpenAI 兼容接口 → 调模型，仍使用同一组证据。
5. 校验：句子里的 `[S#]` 必须存在；句子中的数字必须是所引事实数字的子集，否则删除该句并计数。

> 没有国家/地标的问题会直接返回 `insufficient_evidence`，不会拿别国内容凑答案。

## 配置问答模型

两种方式，优先级：`model_config.json` > 环境变量。

1. **网页配置（推荐）**：打开 `http://127.0.0.1:3100/zh/admin/model`，选预设、填 Key、测试、保存。页面只允许本机/局域网访问，公网隧道访问返回 404。
2. **环境变量**：

```bash
set LLM_BASE_URL=https://api.deepseek.com/v1
set LLM_API_KEY=sk-...
set LLM_MODEL=deepseek-chat
```

任意 OpenAI 兼容 `/chat/completions` 均可。`/v1/ask` 会把检索到的事实编号为 `[S1]…` 交给模型，要求逐句标注引用；返回后再做「marker 存在 + 数字可追溯」校验。模型超时、401、限流等失败会自动回退抽取式回答，并在响应里带 `fallback_reason`。

Key 以明文保存在 `server/model_config.json`，仅本机可读；不要提交到仓库。

## 当前边界

- SQLite 单文件，适合本地/单机；生产按 SPEC 换 PostgreSQL + pgvector。
- 检索是关键词 + 规则排序，没有向量库；`seed.json` 里的事实量级（200 条）足够，上千条后应加 embedding。
- 来源链接指向官方旅游门户，但尚未做真实抓取、快照与存档。
- 没有鉴权与限流；上线前按 SPEC §8.1 补。
