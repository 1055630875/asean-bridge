# 上传到 GitHub 并部署

这个目录是清理后的源码，不含 `node_modules`、`.next`、`.venv`、SQLite 存档和本地二维码。

## 1. 上传

在解压后的目录里：

```bash
git init
git add .
git commit -m "ASEAN Bridge: editorial food & culture archive"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

## 2. Netlify 从 Git 部署

在 Netlify 里 **Add new project → Import an existing project → GitHub**，选择仓库。

构建配置：

```text
Base directory: web
Build command:  npm run build
Publish directory: out
Functions directory: netlify/functions
```

仓库根目录的 `netlify.toml` 已经写好这些值，通常会自动识别。`web/netlify/functions/ask.ts` 会被打包成 `/api/ask`。

环境变量（可选，接了模型才需要）：

```text
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
LLM_API_KEY=sk-...
```

不设置就使用抽取式回答，不会报错。

## 3. 注意

- Netlify 账户额度用尽时，构建会被拒绝：`Account credit usage exceeded - new deploys are blocked until credits are added`。这不是代码问题。
- 如果 Netlify 仍不可用，可以把 `web/out` 静态目录部署到 Cloudflare Pages / Vercel；但 `/api/ask` 需要把 `web/netlify/functions/ask.ts` 迁成对应平台的函数。
- 不要把 `server/model_config.json` 或任何 API Key 提交到仓库。
