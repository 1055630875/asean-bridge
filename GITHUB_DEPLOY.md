# 上传到 GitHub 并部署到 Cloudflare Pages

这个目录是清理后的源码，不含 `node_modules`、`.next`、`.venv`、SQLite 存档和本地二维码。

## 1. 上传 GitHub

```bash
git init
git add .
git commit -m "ASEAN Bridge: editorial food & culture archive"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

或者用 GitHub Desktop：**Add local repository** → 选择本目录 → **Publish repository**。

## 2. Cloudflare Pages 导入

**Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**，选择仓库。

构建配置：

```text
Framework preset:    None
Build command:       cd web && npm ci && npm run build
Build output:        web/out
Root directory:      /（留空）
Functions directory: functions（默认，无需改）
```

`functions/api/ask.ts` 会自动成为 `/api/ask`，`web/public/_redirects` 负责 `/` → `/zh`。

## 3. 环境变量（可选）

**Pages → Settings → Environment variables**：

```text
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-...
ASK_LLM_TIMEOUT_MS=8000
```

不配置就使用抽取式回答，不会报错。

## 4. 注意

- 仓库里不要再放 `server/model_config.json` 或任何 API Key。
- 本地验证：`cd web && npm ci && npm run build`，输出在 `web/out`。
- 问答适配层只有 `functions/api/ask.ts`；检索与引用校验都在 `web/lib/ask-core.ts`。
- `*.pages.dev` 在国内多数网络可访问；如果仍被拦截，可以在 Cloudflare Pages 里绑定自定义域名。
