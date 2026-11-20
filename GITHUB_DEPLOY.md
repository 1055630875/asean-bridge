# 上传到 GitHub 并部署到 GitHub Pages

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

## 2. 开启 Pages

GitHub 仓库 → **Settings → Pages**：

```text
Build and deployment → Source: GitHub Actions
```

仓库已经包含 `.github/workflows/pages.yml`，推送到 `main` 后会自动：

```text
cd web && npm ci && NEXT_PUBLIC_BASE_PATH=/asean-bridge npm run build
上传 web/out → 发布 GitHub Pages
```

仓库名必须是 `asean-bridge`，因为 workflow 和 `basePath` 都按这个路径配置。若改了仓库名，同步修改：

- `.github/workflows/pages.yml` 里的 `NEXT_PUBLIC_BASE_PATH`
- `web/next.config.ts` 不需要改，它读取环境变量

## 3. 访问

```text
https://<你的用户名>.github.io/asean-bridge/
```

本项目对应：

```text
https://1055630875.github.io/asean-bridge/
```

根路径会自动跳到 `/zh/`。

## 4. 说明

- 纯静态站，问答在浏览器里检索 `web/lib/ask-seed.json`，不需要 API Key。
- 不要在前端放模型 Key；线上不支持 LLM，本地 FastAPI 版可用。
- 每次 push 到 `main` 自动重新构建；在 Actions 页面可以看日志。
- 首次部署如果 Actions 报 `Get Pages site failed`，回到 Settings → Pages 确认 Source 已选 **GitHub Actions**。
