# 东盟桥 · 美食 / 景点 / 人文

Next.js 15 前端 + FastAPI/SQLite 内容与 RAG 服务。当前版本：

- 七国 × 4 主题 × 5 项 = **140 条**编辑内容，三语（zh / en / id）；菲律宾、老挝、缅甸因官方来源不可达暂不收录
- 对比页由确定性规则判断差异
- 问答页调用本地 API：检索 → 生成 → 逐句引用校验
- 未配置模型时使用抽取式模板；配置 OpenAI 兼容接口后自动切换为 LLM 生成

## 本地运行（两个进程）

```bash
# 1) API
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8100

# 2) Web
cd web
npm install
npm run dev        # http://127.0.0.1:3100/zh
```

生产构建：`npm run build`，静态产物在 `out/`；问答由 `AskClient` 动态加载 `lib/ask-core.ts` 在浏览器内完成。

## 内容更新流程

```bash
cd web
# 1. 改 lib/data.ts（国家、主题、事实、来源）
npm run export:seed     # 2. 导出 server/seed.json
# 3. 重启 API（启动时按 seed 重建 content.db）
```

`npm run export:seed` 依赖 `tsx`，已加入 devDependencies。

## 目录

```
web/
├─ app/[lang]/                 # zh / en / id
│  ├─ page.tsx                 # 首页（Banner / 主题索引 / 十国 / 影像带 / 方法论）
│  ├─ countries/               # 十国列表 + [code] 风物页
│  ├─ compare/                 # 对比工作台（GET 参数，可分享）
│  ├─ ask/                     # 问答页
│  └─ sources/                 # 参考书目
├─ components/                 # Header / CountryIndex / CountryGallery / FlavorExplorer / AskClient
├─ lib/
│  ├─ ask-core.ts              # 检索 + 抽取式/LLM + 引用校验
│  ├─ ask-seed.json            # 函数打包内容快照
│  ├─ i18n.ts                  # 三语字典
│  └─ data.ts                  # 编辑内容源（导 seed 用）
└─ scripts/export-seed.ts
```

GitHub Pages 构建时：`NEXT_PUBLIC_BASE_PATH=/asean-bridge npm run build`，静态产物 `out/` 由 `.github/workflows/pages.yml` 发布。

## 问答链路

```
问题 → API 识别国家/主题 → 规则排序取事实 → 抽取式模板或 LLM
     → 句子级校验（marker 存在 + 数字可追溯）→ 返回 answer_md + citations
```

前端把 `[S1]` 渲染成按钮，右侧按来源聚合展示原文摘录、访问日期与链接；未命中资料时返回 `insufficient_evidence`，前端直接显示。

## 已知边界

- 内容为编辑样例，评分是主观判断；页头有演示横幅。
- 检索是关键词 + 规则，没有向量检索；事实超过千条后应上 embedding。
- 11 份来源：8 份官方/国际组织 + 3 份第三方（菲律宾、老挝、缅甸）；第三方层级在页面标注。官方来源快照仅本地保存。
- 无鉴权、限流、审核后台；admin 页在静态化时已移除，线上问答为浏览器内检索，不接模型。
