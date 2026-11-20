# 上传到 GitHub 并部署到 Vercel

这个目录是清理后的源码，不含 `node_modules`、`.next`、`.venv`、SQLite 存档和本地二维码。

## 1. 上传 GitHub

在解压后的目录里：

```bash
git init
git add .
git commit -m "ASEAN Bridge: editorial food & culture archive"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

或者用 GitHub Desktop：**Add local repository** → 选择本目录 → **Publish repository**。

## 2. 导入 Vercel

**Vercel → Add New → Project → Import Git Repository**，选择仓库。

在配置页设置：

```text
Root Directory:  web
Framework:       Next.js（自动识别）
Build Command:   npm run build
Output Directory: .next（自动）
```

不需要 `vercel.json`。`web/app/api/ask/route.ts` 会自动成为 `/api/ask` 函数。

> 如果 Vercel 先把仓库识别成 `server` + `web` 的 Services，直接点 `web` 那一行的 **Import single project**，效果就是把 Root Directory 设为 `web`。

## 3. 环境变量（可选）

**Vercel → Project Settings → Environment Variables**：

```text
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-...
ASK_LLM_TIMEOUT_MS=8000
```

不配置就使用抽取式回答，不会报错。

Hobby 计划函数上限约 10 秒；如升级 Pro，可把 `web/app/api/ask/route.ts` 里的 `maxDuration` 调到 30，并同步提高超时。

## 4. 注意

- 仓库里不要再放 `server/model_config.json` 或任何 API Key。
- 本地验证：`cd web && npm ci && npm run build`，然后 `npx next start`。
- 问答适配层只有 `web/app/api/ask/route.ts`；检索与引用校验都在 `web/lib/ask-core.ts`，与平台无关。
