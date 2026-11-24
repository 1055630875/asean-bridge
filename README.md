# 东盟桥 · ASEAN Bridge

东盟十国的**美食、景点、人文与旅行实用信息**平台。当前版本包含三部分：

| 部分 | 状态 |
|---|---|
| [`web/`](web/) | Next.js 15 前端，三语、十国档案、对比、带引用问答 |
| [`server/`](server/) | FastAPI + SQLite 内容服务与 RAG（检索 → 生成 → 逐句校验） |
| [`screenshots/`](screenshots/) | 桌面与移动端截图 |
| [`SPEC.md`](SPEC.md) | 最初的产品规格（政策版），页面结构与契约仍被沿用 |

## 部署（GitHub Pages）

- 前端：Next.js 静态导出（`output: "export"`），带 `/asean-bridge` basePath，构建产物提交到 `docs/`
- 问答：**浏览器内检索**，`web/lib/ask-core.ts` + `web/lib/ask-seed.json` 随页面加载；不调用外部 API
- 引用：回答仍逐句校验，引用编号和来源侧栏保留
- 限制：纯静态托管不能安全保存模型 Key，所以线上**不接 LLM**；本地 FastAPI 仍可用模型
- 部署：仓库 Settings → Pages → Source 选 **Deploy from a branch**，分支 `main`，目录 `/docs`
- 线上地址：`https://1055630875.github.io/asean-bridge/`

## 源码与上传

- [`CODE_FILES.md`](CODE_FILES.md)：目录结构与关键文件说明
- [`GITHUB_DEPLOY.md`](GITHUB_DEPLOY.md)：上传 GitHub、开启 Pages 的步骤

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
- 线上版是静态导出（`web/out`），问答在浏览器内完成，不依赖 FastAPI 常驻进程
- 启动后关闭那个黑色窗口不会停服务；需要停止时用停止脚本。
- 换了 Wi-Fi 或 IP 变了，重新双击启动脚本即可生成新二维码。
- 如果手机打不开：多半是 Wi-Fi 开了「客户端隔离 / AP 隔离」或用了访客网络。可改用**手机热点**（让电脑连手机热点）或 USB 网络共享；也可以让我配一条 Cloudflare 临时隧道拿公网地址。
- 当前没有登录与鉴权，不要在不可信的公共 Wi-Fi 上开放。

## 问答说明

线上是纯静态站，问答由浏览器加载 `web/lib/ask-core.ts` 和 `web/lib/ask-seed.json` 后本地检索，因此：

- 不需要 API Key，也没有服务端费用
- 回答只基于站内 200 条事实，引用编号可点开
- 不调用 DeepSeek/OpenAI；需要模型时请在本地 FastAPI 版使用

## 更新网站

```bash
cd web
npm ci
NEXT_PUBLIC_BASE_PATH=/asean-bridge npm run build
# Windows PowerShell:
# $env:NEXT_PUBLIC_BASE_PATH='/asean-bridge'; npm run build

# 用构建产物替换 docs/
cd ..
rm -rf docs
cp -r web/out docs
touch docs/.nojekyll
```

然后 commit + push，GitHub Pages 会自动重新发布 `docs/`。

## 现在能做什么

- 十国档案全部收录（200 条内容，三语）；菲律宾、老挝、缅甸使用可打开的第三方资料（百度百科，tier 3），页面明确标注「第三方资料」
- 风物对比、带引用问答（检索 → 生成 → 逐句校验）、可点开的风味速查（介绍 + 图片 + 来源）
- 11 份来源：8 份官方/国际组织 + 3 份第三方；官方来源保留本地快照与 SHA-256 存档
- 十国各有一张 Pixabay 主图，另配 30 张美食 / 人文 / 旅行主题图供风味速查弹窗切换；来源见 [`IMAGE_CREDITS.md`](IMAGE_CREDITS.md)
- 未配置模型时走抽取式模板；线上纯静态，不接模型

## 数据流

```
web/lib/data.ts --npm run export:seed--> server/seed.json
        --启动重建--> server/content.db --FastAPI--> 本地 web

server/seed.json --copy--> web/lib/ask-seed.json --> 浏览器内检索
```

内容只在 `data.ts` 里改一处，导出后 API 与前端同时更新。

详见 [web/README.md](web/README.md) 与 [server/README.md](server/README.md)。
