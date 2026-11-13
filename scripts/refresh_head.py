"""Apply site.js, store.css and the Meta Pixel to the pages already in public/, without a full rebuild.

Usage: python3 scripts/refresh_head.py

Use after changing scripts/site.js, scripts/store.css or "metaPixel" in site.json when the Landa Lister
inventory is not at hand. It writes the new hashed site.<hash>.js, points every page at it,
and puts the Pixel base code (or nothing, if metaPixel is empty) just before </head>.
A full build.py run produces the same result.
"""
import re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build  # noqa: E402

OUT = build.OUT
PIXEL_RX = re.compile(r"<script>!function\(f,b,e,v,n,t,s\).*?</noscript>", re.S)

(OUT / "assets").mkdir(exist_ok=True)
for old in (OUT / "assets").glob("site.*.js"):
    if old.name != build.JS_FILE: old.unlink()
(OUT / "assets" / build.JS_FILE).write_text(build.JS)
for old in (OUT / "assets").glob("store.*.css"):
    if old.name != build.CSS_FILE: old.unlink()
(OUT / "assets" / build.CSS_FILE).write_text(build.CSS)

px, n = build.meta_pixel(), 0
for f in OUT.rglob("*.html"):
    t = f.read_text()
    new = re.sub(r"assets/site\.[0-9a-f]{10}\.js", "assets/" + build.JS_FILE, t)
    new = re.sub(r"assets/store\.[0-9a-f]{10}\.css", "assets/" + build.CSS_FILE, new)
    new = PIXEL_RX.sub("", new)
    new = new.replace("</head>", px + "</head>", 1)
    if new != t: f.write_text(new); n += 1
print(f"{n} pages updated · {build.JS_FILE} · pixel {'ON ' + str(build.CFG.get('metaPixel')) if px else 'off (metaPixel empty)'}")
