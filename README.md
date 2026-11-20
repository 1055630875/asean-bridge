# 东盟桥 · ASEAN Bridge

东盟十国的**美食、景点、人文与旅行实用信息**平台。当前版本包含三部分：

| 部分 | 状态 |
|---|---|
| [`web/`](web/) | Next.js 15 前端，三语、十国档案、对比、带引用问答 |
| [`server/`](server/) | FastAPI + SQLite 内容服务与 RAG（检索 → 生成 → 逐句校验） |
| [`screenshots/`](screenshots/) | 桌面与移动端截图 |
| [`SPEC.md`](SPEC.md) | 最初的产品规格（政策版），页面结构与契约仍被沿用 |

## 线上地址（Netlify）

**https://papaya-flan-b5d63a.netlify.app**

- 前端：Next.js 静态导出（`output: "export"` → `web/out`），三语页面、十国档案、对比表
- 问答：Netlify Function `web/netlify/functions/ask.ts`，对外路径 `/api/ask`（检索 + 抽取式回答 + 逐句引用校验）
- 数据：`web/netlify/functions/seed.json` 随函数打包；内容更新后需重新复制
- 模型：在 Netlify 站点环境变量里设置 `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`，函数会自动改用模型；不设置则为抽取式
- 线上版不含：FastAPI 常驻服务、SQLite 快照存档、模型配置页；这些只在本地版提供
- 重新部署：`set NETLIFY_AUTH_TOKEN=...` 后运行 `netlify deploy --prod`（站点已 link）

## 源码与上传

- [`CODE_FILES.md`](CODE_FILES.md)：目录结构与关键文件说明
- [`GITHUB_DEPLOY.md`](GITHUB_DEPLOY.md)：上传 GitHub、Netlify 构建配置

## 快速开始

```bash
# API
cd server
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 8100

# Web（另一个终端）
cd web
npm install
npm run dev     # http://127.0.0.1:3100/zh
```

## 不碰终端：手机 / 平板打开

1. 双击 **`启动东盟桥.bat`**
   - 自动在后台启动 API 与网页（窗口最小化，日志在 `logs/`）
   - 自动识别本机局域网 IP，生成二维码页面 `手机访问.html` 并打开
   - 地址同时复制到剪贴板
2. 手机与电脑连**同一个 Wi-Fi**，扫码即可打开（例如 `http://10.99.60.26:3100/zh`）
3. 停止：双击 **`停止东盟桥.bat`**

说明：

- 网页端口 `3100` 对局域网开放；API 单独监听 `127.0.0.1:8100`，供本地脚本/开发使用
- 线上版是静态导出（`web/out`）+ Netlify Function，不依赖 FastAPI 常驻进程
- 启动后关闭那个黑色窗口不会停服务；需要停止时用停止脚本。
- 换了 Wi-Fi 或 IP 变了，重新双击启动脚本即可生成新二维码。
- 如果手机打不开：多半是 Wi-Fi 开了「客户端隔离 / AP 隔离」或用了访客网络。可改用**手机热点**（让电脑连手机热点）或 USB 网络共享；也可以让我配一条 Cloudflare 临时隧道拿公网地址。
- 当前没有登录与鉴权，不要在不可信的公共 Wi-Fi 上开放。

## 配置问答模型（可选）

线上在 **Netlify → Site configuration → Environment variables** 添加：

```text
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-...
```

函数会在下一次请求时自动改用模型；不配置则使用抽取式回答。本地 FastAPI 也读取同名环境变量。

## 重新部署

Netlify 的 production 部署被 **deploy lock** 锁住时，`netlify deploy --prod` 会返回 403；如果 API 返回 `Account credit usage exceeded - new deploys are blocked until credits are added`，说明账户额度已用尽，需要先在 Netlify Billing 里补充额度/升级，代码与 token 都没有问题。

额度正常时可用 draft + restore：

```powershell
# 1. 先做 draft 部署
npx netlify-cli deploy --site 3f0a021f-fc7d-4eb4-bc47-ae1e945413b5

# 2. 把 draft 发布到 production（替换 <deploy-id>）
curl -X POST -H "Authorization: Bearer <token>" ^
  https://api.netlify.com/api/v1/sites/3f0a021f-fc7d-4eb4-bc47-ae1e945413b5/deploys/<deploy-id>/restore
```

## 现在能做什么

- 十国档案全部收录（200 条内容，三语）；菲律宾、老挝、缅甸使用可打开的第三方资料（百度百科，tier 3），页面明确标注「第三方资料」
- 风物对比、带引用问答（检索 → 生成 → 逐句校验）、可点开的风味速查（介绍 + 图片 + 来源）
- 11 份来源：8 份官方/国际组织 + 3 份第三方；官方来源保留本地快照与 SHA-256 存档
- 十国各有一张本地 SVG 旅行海报，首页使用同一套素材做背景
- 未配置模型时走抽取式模板；线上配置 Netlify 环境变量 `LLM_*` 后自动改用模型

## 数据流

```
web/lib/data.ts --npm run export:seed--> server/seed.json
        --启动重建--> server/content.db --FastAPI--> 本地 web

server/seed.json --copy--> web/netlify/functions/seed.json --> Netlify Function /api/ask
```

内容只在 `data.ts` 里改一处，导出后 API 与前端同时更新。

详见 [web/README.md](web/README.md) 与 [server/README.md](server/README.md)。
