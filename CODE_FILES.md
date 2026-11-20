# 源码清单

## 顶层

```text
.
├─ web/                     Next.js 15 前端（静态导出）+ Netlify Function
├─ server/                  FastAPI + SQLite 本地内容服务（可选）
├─ scripts/start-all.ps1    Windows 本地启动器
├─ tools/                   海报与分享页生成脚本
├─ screenshots/             最终界面截图
├─ netlify.toml             Netlify 构建与 /api/ask 路由
├─ README.md                项目说明
├─ SPEC.md                  最初的产品规格（历史）
└─ GITHUB_DEPLOY.md         上传 GitHub / 部署步骤
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
| `web/netlify/functions/ask.ts` | 检索 + 抽取式/LLM + 引用校验函数 |
| `web/netlify/functions/seed.json` | 函数打包用的内容快照 |

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
3. 把 `server/seed.json` 复制到 `web/netlify/functions/seed.json`
4. `cd web && npm run build`
5. 部署 `web/out` + `web/netlify/functions`

## 约束

- 无 `node_modules`、`.next`、`.venv`、SQLite、存档快照、API Key。
- 线上问答不要在前端保存 Key；模型凭据只放 Netlify 环境变量。
