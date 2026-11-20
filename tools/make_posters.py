"""Generate lightweight, country-specific travel-poster SVGs.

No external image hosts: the posters are vector art so they load anywhere,
including networks where Unsplash/Wikimedia are unreachable.
"""

from pathlib import Path

OUT = Path(r"D:\娱乐\asean-bridge\web\public\images")
OUT.mkdir(parents=True, exist_ok=True)

PALETTES = {
    "ID": ("#0f3d3e", "#e9a23b", "#f4d9a0", "#082c2c"),
    "MY": ("#13294b", "#e86a92", "#f6d6c2", "#0a1830"),
    "TH": ("#7a1f1f", "#f2b134", "#ffe6b3", "#3d0e0e"),
    "VN": ("#0b4f4a", "#f2c14e", "#ffe9c7", "#062e2b"),
    "SG": ("#123b5e", "#ef7c8e", "#d9ecf5", "#081f33"),
    "PH": ("#0e5a63", "#f28c5b", "#ffe3c2", "#07363c"),
    "BN": ("#0b3d2e", "#d4af37", "#f2e6c9", "#05271d"),
    "KH": ("#5a3a1a", "#e0a33e", "#f7e3bd", "#2f1d0b"),
    "LA": ("#1d4b32", "#e3b23c", "#f8e8bf", "#0d2a1b"),
    "MM": ("#4a1f3d", "#e07a3f", "#f8dcc0", "#2a0f21"),
}

NAMES = {
    "ID": ("INDONESIA", "NUSANTARA"),
    "MY": ("MALAYSIA", "TANAH MELAYU"),
    "TH": ("THAILAND", "SIAM"),
    "VN": ("VIETNAM", "VIET NAM"),
    "SG": ("SINGAPORE", "TEMASEK"),
    "PH": ("PHILIPPINES", "PEARL OF THE ORIENT"),
    "BN": ("BRUNEI", "ABODE OF PEACE"),
    "KH": ("CAMBODIA", "KAMPUCHEA"),
    "LA": ("LAOS", "LANE XANG"),
    "MM": ("MYANMAR", "GOLDEN LAND"),
}


def landmark(code: str) -> str:
    """Silhouette in a 300x300 box, standing on y=300."""
    s = []
    if code == "ID":  # Borobudur terraces + stupas
        s += [
            '<polygon points="30,300 270,300 240,250 60,250"/>',
            '<polygon points="65,250 235,250 210,205 90,205"/>',
            '<polygon points="95,205 205,205 185,165 115,165"/>',
            '<path d="M130 165 Q150 120 170 165 Z"/>',
        ]
        for x in (55, 110, 190, 245):
            s.append(f'<circle cx="{x}" cy="262" r="12"/>')
    elif code == "MY":  # Petronas twin towers
        s += [
            '<rect x="95" y="70" width="42" height="230"/>',
            '<rect x="163" y="70" width="42" height="230"/>',
            '<rect x="108" y="35" width="16" height="35"/>',
            '<rect x="176" y="35" width="16" height="35"/>',
            '<rect x="137" y="150" width="26" height="8"/>',
        ]
    elif code == "TH":  # Thai temple tiers
        s += [
            '<polygon points="150,40 210,130 90,130"/>',
            '<polygon points="150,95 235,190 65,190"/>',
            '<polygon points="150,155 260,255 40,255"/>',
            '<rect x="120" y="255" width="60" height="45"/>',
        ]
    elif code == "VN":  # Hoi An lanterns and bridge
        s += [
            '<path d="M20 240 Q150 190 280 240 L280 300 L20 300 Z"/>',
            '<path d="M40 235 Q150 150 260 235" fill="none" stroke="currentColor" stroke-width="10"/>',
        ]
        for x, y in ((70, 110), (130, 85), (190, 105), (245, 130)):
            s.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{y}" stroke="currentColor" stroke-width="4"/>')
            s.append(f'<ellipse cx="{x}" cy="{y+25}" rx="18" ry="26"/>')
    elif code == "SG":  # Marina Bay Sands + wheel
        s += [
            '<rect x="55" y="120" width="26" height="180"/>',
            '<rect x="110" y="120" width="26" height="180"/>',
            '<rect x="165" y="120" width="26" height="180"/>',
            '<path d="M30 120 Q123 85 216 120 L210 142 Q123 112 36 142 Z"/>',
            '<circle cx="250" cy="210" r="42" fill="none" stroke="currentColor" stroke-width="8"/>',
            '<line x1="250" y1="252" x2="250" y2="300" stroke="currentColor" stroke-width="8"/>',
        ]
    elif code == "PH":  # Mayon volcano + jeepney
        s += [
            '<path d="M20 300 Q150 40 280 300 Z"/>',
            '<rect x="90" y="270" width="120" height="30" rx="8"/>',
            '<rect x="108" y="252" width="84" height="20" rx="6"/>',
            '<circle cx="112" cy="300" r="10"/><circle cx="190" cy="300" r="10"/>',
        ]
    elif code == "BN":  # mosque dome + minarets
        s += [
            '<rect x="40" y="180" width="18" height="120"/>',
            '<rect x="242" y="180" width="18" height="120"/>',
            '<path d="M75 210 Q150 110 225 210 Z"/>',
            '<rect x="85" y="210" width="130" height="90"/>',
            '<line x1="150" y1="105" x2="150" y2="145" stroke="currentColor" stroke-width="6"/>',
        ]
    elif code == "KH":  # Angkor Wat towers
        s += [
            '<rect x="40" y="220" width="220" height="80"/>',
            '<polygon points="90,220 120,120 150,220"/>',
            '<polygon points="150,220 180,95 210,220"/>',
            '<polygon points="210,220 235,140 260,220"/>',
        ]
    elif code == "LA":  # That Luang stupa
        s += [
            '<polygon points="80,300 220,300 200,250 100,250"/>',
            '<path d="M110 250 Q150 190 190 250 Z"/>',
            '<polygon points="140,190 150,90 160,190"/>',
            '<circle cx="150" cy="195" r="22"/>',
        ]
    else:  # MM Bagan pagodas + balloon
        s += [
            '<polygon points="40,300 80,300 60,210"/>',
            '<polygon points="95,300 150,300 122,170"/>',
            '<polygon points="165,300 215,300 190,215"/>',
            '<polygon points="225,300 265,300 245,235"/>',
            '<circle cx="240" cy="80" r="26"/>',
            '<path d="M226 100 L240 125 L254 100 Z"/>',
        ]
    return "".join(s)


def poster(code: str) -> str:
    top, accent, light, deep = PALETTES[code]
    name, subtitle = NAMES[code]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{deep}"/>
      <stop offset="62%" stop-color="{top}"/>
      <stop offset="100%" stop-color="{accent}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{deep}" stop-opacity="0"/>
      <stop offset="100%" stop-color="{deep}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="880" cy="210" r="120" fill="{light}" opacity="0.9"/>
  <circle cx="880" cy="210" r="160" fill="{light}" opacity="0.12"/>
  <path d="M0 560 Q220 470 440 545 T880 520 T1200 555 L1200 800 L0 800 Z" fill="{deep}" opacity="0.55"/>
  <path d="M0 640 Q300 560 620 630 T1200 615 L1200 800 L0 800 Z" fill="{deep}" opacity="0.8"/>
  <g color="{light}" fill="{light}" transform="translate(330 260) scale(1.55)" opacity="0.96">
    {landmark(code)}
  </g>
  <rect y="560" width="1200" height="240" fill="url(#fade)"/>
  <g font-family="Georgia, 'Times New Roman', serif" fill="{light}">
    <text x="64" y="112" font-size="22" letter-spacing="8" opacity="0.72">ASEAN BRIDGE</text>
    <text x="60" y="196" font-size="76" letter-spacing="2">{name}</text>
    <text x="64" y="238" font-size="20" letter-spacing="6" opacity="0.72">{subtitle}</text>
  </g>
  <g font-family="Georgia, serif" fill="{light}">
    <text x="64" y="704" font-size="20" letter-spacing="5" opacity="0.75">FOOD · PLACES · CULTURE</text>
    <text x="1070" y="704" font-size="26" letter-spacing="4" opacity="0.9">{code}</text>
  </g>
  <rect x="64" y="660" width="86" height="3" fill="{accent}"/>
</svg>
'''


def hero() -> str:
    groups = []
    for i, code in enumerate(PALETTES):
        x = 70 + i * 185
        groups.append(
            f'<g color="#f4e6c8" fill="#f4e6c8" transform="translate({x} 520) scale(0.82)" opacity="0.30">{landmark(code)}</g>'
        )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 900" width="1920" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#082c24"/>
      <stop offset="55%" stop-color="#0d4234"/>
      <stop offset="100%" stop-color="#17624a"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f2cf8b" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#f2cf8b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="900" fill="url(#bg)"/>
  <circle cx="1510" cy="220" r="300" fill="url(#sun)"/>
  <circle cx="1510" cy="220" r="86" fill="#f4dfae" opacity="0.75"/>
  <path d="M0 600 Q240 520 480 585 T960 560 T1440 585 T1920 555 L1920 900 L0 900 Z" fill="#05231c" opacity="0.55"/>
  <path d="M0 700 Q320 620 640 690 T1280 670 T1920 690 L1920 900 L0 900 Z" fill="#031a15" opacity="0.8"/>
  {''.join(groups)}
  <g stroke="#f4e6c8" stroke-opacity="0.10">
    <line x1="0" y1="820" x2="1920" y2="820"/>
    <line x1="0" y1="840" x2="1920" y2="840"/>
  </g>
</svg>
'''


for code in PALETTES:
    (OUT / f"{code}.svg").write_text(poster(code), encoding="utf-8")
(OUT / "hero.svg").write_text(hero(), encoding="utf-8")
print("written", len(PALETTES) + 1, "files to", OUT)
