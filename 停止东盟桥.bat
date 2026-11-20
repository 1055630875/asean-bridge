@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p = Get-NetTCPConnection -LocalPort 3100,8100 -State Listen -ErrorAction SilentlyContinue; if ($p) { $p | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host 'Stopped ASEAN Bridge.' } else { Write-Host 'Nothing was running.' }"
pause
