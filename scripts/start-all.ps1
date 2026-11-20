param([switch]$NoOpen)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$python = Join-Path $root "server\.venv\Scripts\python.exe"
$webDir = Join-Path $root "web"
$logs = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Test-Port([int]$port) {
    try {
        return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop)
    } catch {
        return $false
    }
}

function Wait-Port([int]$port, [int]$seconds) {
    for ($i = 0; $i -lt ($seconds * 2); $i++) {
        if (Test-Port $port) { return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

Write-Host ""
Write-Host "  东盟桥 · 本地启动" -ForegroundColor Green
Write-Host "  ------------------------------" -ForegroundColor DarkGray

if (-not (Test-Port 8100)) {
    Write-Host "  启动内容 API ..." -ForegroundColor DarkGray
    Start-Process -FilePath $python `
        -ArgumentList "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8100" `
        -WorkingDirectory (Join-Path $root "server") `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logs "api.log") `
        -RedirectStandardError (Join-Path $logs "api.err.log") | Out-Null
}

if (-not (Test-Port 3100)) {
    Write-Host "  启动网页 ..." -ForegroundColor DarkGray
    Start-Process -FilePath "node.exe" `
        -ArgumentList "node_modules\next\dist\bin\next", "start", "-H", "0.0.0.0", "-p", "3100" `
        -WorkingDirectory $webDir `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logs "web.log") `
        -RedirectStandardError (Join-Path $logs "web.err.log") | Out-Null
}

if (-not (Wait-Port 8100 30)) {
    Write-Host "  API 启动失败，查看 logs\api.err.log" -ForegroundColor Red
    exit 1
}
if (-not (Wait-Port 3100 60)) {
    Write-Host "  网页启动失败，查看 logs\web.err.log" -ForegroundColor Red
    exit 1
}

$ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } |
    Select-Object -First 1).IPv4Address.IPAddress
if (-not $ip) { $ip = "127.0.0.1" }
$url = "http://${ip}:3100/zh"

try { Set-Clipboard -Value $url } catch {}

# QR code as inline SVG (no external service; scanned by phone camera)
$svgPath = Join-Path $root "share-qr.svg"
& $python -c "import qrcode,sys; from qrcode.image.svg import SvgPathImage; qrcode.make(sys.argv[1], image_factory=SvgPathImage).save(sys.argv[2])" $url $svgPath
$svg = Get-Content -Path $svgPath -Raw

$htmlPath = Join-Path $root "手机访问.html"
$html = @"
<!doctype html>
<html lang="zh">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>东盟桥 · 手机访问</title>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f4ee;font-family:'Segoe UI','Microsoft YaHei',sans-serif;color:#16211b;">
  <div style="width:min(92vw,420px);background:#fffdf8;border:1px solid #e3ded2;border-radius:20px;padding:28px;text-align:center;box-shadow:0 30px 70px -50px rgba(12,61,39,.6);">
    <div style="font-size:12px;letter-spacing:.18em;color:#2e7d55;font-weight:600;">ASEAN BRIDGE</div>
    <h1 style="font-size:22px;margin:10px 0 4px;">用手机打开东盟桥</h1>
    <p style="font-size:12px;color:#6b7770;line-height:1.7;margin:0 0 18px;">手机与电脑连同一个 Wi-Fi，扫码即可。<br>电脑保持开机，关掉窗口不会停服务。</p>
    <div style="width:220px;height:220px;margin:0 auto;background:#fff;padding:10px;border:1px solid #e3ded2;border-radius:12px;">
      $svg
    </div>
    <p style="margin:18px 0 6px;font-size:11px;color:#6b7770;">或手动输入</p>
    <code style="display:block;font-size:13px;padding:10px 12px;background:#f6f4ee;border:1px solid #e3ded2;border-radius:10px;word-break:break-all;">$url</code>
    <p style="font-size:10px;color:#8a948d;line-height:1.7;margin:18px 0 0;">打不开？多半是 Wi-Fi 开了“客户端隔离”或用了不同网段。<br>可以改用手机热点让电脑连接，或联系我配一条公网隧道。</p>
  </div>
</body>
</html>
"@
Set-Content -Path $htmlPath -Value $html -Encoding UTF8

Write-Host ""
Write-Host "  手机访问地址（已复制到剪贴板）：" -ForegroundColor DarkGray
Write-Host "  $url" -ForegroundColor Green
Write-Host ""
Write-Host "  二维码页面：$htmlPath" -ForegroundColor DarkGray
Write-Host "  同一 Wi-Fi 下扫码即可；电脑不要关机。" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoOpen) {
    Start-Process $htmlPath
    Start-Process $url
}
