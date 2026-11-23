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
Build and deployment
Source: Deploy from a branch
Branch: main
Folder: /docs
```

点 **Save**。

仓库里的 `docs/` 已经包含构建好的静态站，不需要 Actions，也不需要构建服务。

## 3. 访问

```text
https://1055630875.github.io/asean-bridge/
```

根路径会自动跳到 `/zh/`。

## 4. 以后更新

```bash
cd web
npm ci
NEXT_PUBLIC_BASE_PATH=/asean-bridge npm run build

cd ..
rm -rf docs
cp -r web/out docs
touch docs/.nojekyll

git add docs
git commit -m "Update site"
git push
```

PowerShell 写法：

```powershell
cd web
$env:NEXT_PUBLIC_BASE_PATH='/asean-bridge'
npm run build

cd ..
Remove-Item docs -Recurse -Force
Copy-Item web\out docs -Recurse
New-Item docs\.nojekyll -ItemType File -Force
```

## 5. 说明

- 纯静态站，问答在浏览器里检索 `web/lib/ask-seed.json`，不需要 API Key。
- 不要在前端放模型 Key；线上不支持 LLM，本地 FastAPI 版可用。
- 仓库名必须是 `asean-bridge`，因为 `basePath` 和页面资源都按这个路径生成。改仓库名时，要同步改 `NEXT_PUBLIC_BASE_PATH`。
- 如果页面样式丢失，检查 `docs/` 是否在 `main` 分支根目录，以及 Pages 的 Folder 是否选了 `/docs`。
