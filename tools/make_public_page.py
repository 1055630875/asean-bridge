import qrcode
from qrcode.image.svg import SvgPathImage

url = "https://papaya-flan-b5d63a.netlify.app/zh"
img = qrcode.make(url, image_factory=SvgPathImage)
img.save(r"D:\娱乐\asean-bridge\share-public.svg")

html = f"""<!doctype html>
<html lang="zh"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>东盟桥 · 公网访问</title>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f4ee;font-family:'Segoe UI','Microsoft YaHei',sans-serif;color:#16211b;">
  <div style="width:min(92vw,440px);background:#fffdf8;border:1px solid #e3ded2;border-radius:20px;padding:28px;text-align:center;box-shadow:0 30px 70px -50px rgba(12,61,39,.6);">
    <div style="font-size:12px;letter-spacing:.18em;color:#2e7d55;font-weight:600;">ASEAN BRIDGE</div>
    <h1 style="font-size:22px;margin:10px 0 4px;">公网访问地址</h1>
    <p style="font-size:12px;color:#6b7770;line-height:1.7;margin:0 0 18px;">任何网络都能打开，不需要连同一个 Wi-Fi。<br>电脑需保持开机；隧道重启后地址会变。</p>
    <div style="width:220px;height:220px;margin:0 auto;background:#fff;padding:10px;border:1px solid #e3ded2;border-radius:12px;">
      {img.to_string(encoding="unicode")}
    </div>
    <p style="margin:18px 0 6px;font-size:11px;color:#6b7770;">或手动输入</p>
    <code style="display:block;font-size:12px;padding:10px 12px;background:#f6f4ee;border:1px solid #e3ded2;border-radius:10px;word-break:break-all;">{url}</code>
    <p style="font-size:10px;color:#8a948d;line-height:1.7;margin:18px 0 0;">这是临时隧道，不是独立云端部署。<br>要长期稳定，需要部署到云主机或 Vercel / Render。</p>
  </div>
</body></html>"""

with open(r"D:\娱乐\asean-bridge\公网访问.html", "w", encoding="utf-8") as f:
    f.write(html)
print("written")
