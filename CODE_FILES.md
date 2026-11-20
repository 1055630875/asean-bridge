# 源码清单

## 顶层

```text
.
├─ web/                     Next.js 15 应用（Vercel Root Directory）
│  ├─ app/api/ask/          /api/ask Route Handler
│  ├─ lib/ask-core.ts       检索 + 抽取式/LLM + 引用校验
│  ├─ lib/ask-seed.json     函数打包用的内容快照
│  └─ ...                   页面、组件、三语数据
├─ server/                  FastAPI + SQLite 本地内容服务（可选）
├─ scripts/start-all.ps1    Windows 本地启动器
├─ tools/                   海报与分享页生成脚本
├─ screenshots/             最终界面截图
├─ README.md                项目说明
├─ SPEC.md                  最初的产品规格（历史）
└─ GITHUB_DEPLOY.md         上传 GitHub / 部署到 Vercel
```

## 前端关键文件

| 文件 | 作用 |
|---|---|
| `web/app/[lang]/page.tsx` | 首页：Banner、四主题索引、十国索引、影像带、方法论、CTA |
| `web/app/[lang]/countries/page.tsx` | 十国列表 |
| `web/app/[lang]/countries/[code]/page.tsx` | 国家档案：海报、统计、菜单式风味速查、编号来源 |
| `web/app/[lang]/compare/page.tsx` | 双国对开对比 |
| `web/app/[lang]/ask/page.tsx` | 问答页 |
| `web/app/[lang]/sources/page.tsx` | 参考书目 |
| `web/app/globals.css` | 颜色 token、字体、噪点、编辑类（`ed-*`） |
| `web/components/Header.tsx` | 报头与导航 |
| `web/components/CountryIndex.tsx` | 2 特写 + 8 索引 |
| `web/components/CountryGallery.tsx` | 影像带数据（服务端） |
| `web/components/GalleryStrip.tsx` | 拖拽 / 箭头 / snap（客户端） |
| `web/components/FlavorExplorer.tsx` | 风味速查菜单与档案纸弹窗 |
| `web/components/AskClient.tsx` | 问答、逐句引用、来源栏 |
| `web/components/CompareForm.tsx` | 对比表单 |
| `web/lib/data.ts` | 200 条事实、10 国、11 个来源 |
| `web/lib/i18n.ts` | 中 / 英 / 印尼三语字典 |
| `web/lib/ask-core.ts` | 检索 + 抽取式/LLM + 引用校验函数 |
| `web/lib/ask-seed.json` | 函数打包用的内容快照 |
| `web/app/api/ask/route.ts` | `/api/ask` Route Handler |

## 本地运行

```bash
# 前端
cd web
npm install
npm run dev        # http://127.0.0.1:3100/zh

# 可选：本地 FastAPI
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8100
```

## 内容更新流程

1. 改 `web/lib/data.ts` 或 `web/lib/i18n.ts`
2. `cd web && npm run export:seed`
3. 把 `server/seed.json` 复制到 `web/lib/ask-seed.json`
4. `cd web && npm run build`
5. 推送到 GitHub，Vercel 以 Root Directory `web` 自动部署

## 约束

- 无 `node_modules`、`.next`、`.venv`、SQLite、存档快照、API Key。
- 线上问答不要在前端保存 Key；模型凭据只放 Vercel 环境变量。
