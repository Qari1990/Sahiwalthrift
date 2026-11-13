"""Fast one-page price list (public/catalogue.html) built from public/feed.xml.

Made for WhatsApp, Messenger and ads: opens quickly on a phone, shows every in-stock piece with
photo, brand, size and price, and has a one-tap "Order on WhatsApp" button per item.
Run after build.py (build.py calls it), or by hand: python3 scripts/catalogue.py [public_dir]
"""
import html, json, re, sys, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "site.json").read_text())
G = "{http://base.google.com/ns/1.0}"
SECTIONS = [("jackets", "Jackets & puffers"), ("sweats", "Hoodies & sweatshirts"), ("women", "Women"), ("kids", "Kids")]


def esc(s):
    return html.escape(str(s or ""), quote=True)


def rs(n):
    return f"Rs {n:,}"


def items_from_feed(feed):
    import xml.etree.ElementTree as ET
    out = []
    for it in ET.parse(feed).getroot().iter("item"):
        g = lambda k: (it.findtext(G + k) or "").strip()
        if g("availability") != "in_stock": continue
        sku = g("id"); pt = g("product_type"); dept, _, kind = pt.partition(" > ")
        size = g("size"); title = re.sub(r"\s+Size\s+\S+$", "", g("title")).strip()
        brand = g("brand")
        if brand and title.lower().startswith(brand.lower()): title = title[len(brand):].strip(" -·")
        out.append({"sku": sku, "brand": brand, "title": title, "size": size, "price": int(float(g("price").split()[0])),
                    "dept": dept, "kind": kind, "link": g("link")})
    return out


def section(i):
    if i["dept"] == "Kids": return "kids"
    if i["dept"] == "Women": return "women"
    return "jackets" if i["kind"] == "Jackets" else "sweats"


def wa_link(i):
    digits = re.sub(r"\D", "", CFG["whatsapp"]); digits = "92" + digits[1:] if digits.startswith("0") else digits
    msg = f"Hi ABCThrift! I want to order {i['sku']}: {i['brand']} {i['title']}, size {i['size']}, {rs(i['price'])}. Is it available?"
    return f"https://wa.me/{digits}?text={urllib.parse.quote(msg)}"


def pixel():
    pid = re.sub(r"\D", "", str(CFG.get("metaPixel") or ""))
    if not pid: return ""
    return ("<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};"
            "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];"
            "s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');"
            f"fbq('init','{pid}');fbq('track','PageView');fbq('track','ViewContent',{{content_type:'product_group',content_name:'Price list'}});"
            "document.addEventListener('click',function(e){var a=e.target.closest('a.wa');if(a)fbq('track','Contact',{content_ids:[a.dataset.sku],content_type:'product'})});</script>")


CSS = """*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f3ee;color:#15201d}
a{color:inherit}.top{background:#15201d;color:#fff;padding:18px 16px 14px}.top h1{margin:0;font-size:22px}.top h1 b{color:#e9c46a}
.top p{margin:6px 0 0;font-size:14px;line-height:1.45;color:#d6e0dc}.trust{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.trust span{background:rgba(233,196,106,.15);color:#f4ead2;border:1px solid rgba(233,196,106,.4);border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700}
.how{margin:12px 12px 0;background:#fff;border-radius:14px;padding:12px 14px;font-size:13.5px;line-height:1.5;border:1px solid #e6e0d4}.how b{color:#24413a}
nav{position:sticky;top:0;z-index:5;background:#f6f3ee;display:flex;gap:8px;overflow-x:auto;padding:10px 12px;border-bottom:1px solid #e6e0d4}
nav a{flex:none;text-decoration:none;background:#fff;border:1px solid #d9d2c4;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:700}
h2{margin:18px 12px 8px;font-size:18px}h2 small{color:#5b625f;font-weight:600;font-size:13px}
.list{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 12px}@media(min-width:720px){.list{grid-template-columns:repeat(4,1fr)}}
.it{background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e0d4;display:flex;flex-direction:column}
.it img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#eee}.bd{padding:8px 10px 10px;display:flex;flex-direction:column;gap:3px;flex:1}
.br{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.ti{font-size:12.5px;color:#5b625f;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.row{display:flex;justify-content:space-between;align-items:center;margin-top:2px}.pr{font-size:17px;font-weight:900}.sz{font-size:12px;font-weight:800;background:#efe9dd;border-radius:6px;padding:2px 7px}
.wa{margin-top:6px;display:block;text-align:center;text-decoration:none;background:#1f9d55;color:#fff;font-weight:800;font-size:13px;border-radius:10px;padding:9px 6px}
.ph{font-size:12px;text-align:center;color:#24413a;font-weight:700;margin-top:4px}
footer{margin:24px 12px 90px;font-size:13px;color:#5b625f;line-height:1.6;text-align:center}
.fab{position:fixed;right:14px;bottom:14px;background:#1f9d55;color:#fff;text-decoration:none;font-weight:800;border-radius:999px;padding:13px 18px;box-shadow:0 8px 24px rgba(0,0,0,.25)}"""


def build(pub):
    pub = Path(pub); items = items_from_feed(pub / "feed.xml")
    base = CFG["siteUrl"].rstrip("/"); dl = CFG.get("delivery") or {}
    lo = min((i["price"] for i in items), default=0)
    parts = []
    for key, name in SECTIONS:
        its = sorted([i for i in items if section(i) == key], key=lambda i: i["price"])
        if not its: continue
        cards = "".join(
            f'<article class="it"><img loading="lazy" src="img/t/{esc(i["sku"])}-1.jpg" alt="{esc(i["brand"] + " " + i["title"])}">'
            f'<div class="bd"><div class="br">{esc(i["brand"])}</div><div class="ti">{esc(i["title"])}</div>'
            f'<div class="row"><span class="pr">{rs(i["price"])}</span><span class="sz">{esc(i["size"])}</span></div>'
            f'<a class="wa" data-sku="{esc(i["sku"])}" href="{esc(wa_link(i))}">Order on WhatsApp</a><a class="ph" href="p/{esc(i["sku"])}.html">More photos &amp; size &rarr;</a></div></article>'
            for i in its)
        parts.append(f'<h2 id="{key}">{name} <small>{len(its)} pieces · {rs(its[0]["price"])} - {rs(its[-1]["price"])}</small></h2><div class="list">{cards}</div>')
    nav = "".join(f'<a href="#{k}">{n}</a>' for k, n in SECTIONS if any(section(i) == k for i in items))
    free = dl.get("freeOver"); fee = dl.get("fee", 0)
    title = f"Price list: {len(items)} pre-loved branded pieces from {rs(lo)} | {CFG['storeName']}"
    desc = f"Every piece with photo, size and price. Original international brands, 1 of each, cash on delivery all over Pakistan."
    wa = re.sub(r"\D", "", CFG["whatsapp"]); wa = "92" + wa[1:] if wa.startswith("0") else wa
    doc = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{base}/catalogue.html">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:image" content="{base}/og-image.png"><meta property="og:url" content="{base}/catalogue.html"><meta property="og:type" content="website">
<link rel="icon" href="favicon.svg"><style>{CSS}</style>{pixel()}</head><body>
<header class="top"><h1>ABC<b>Thrift</b> price list</h1><p>Pre-loved <b>original international brands</b>, hand-picked in Sahiwal. Every piece is 1 of 1, the price is written on it, and you pay cash when it arrives.</p>
<div class="trust"><span>✓ Cash on Delivery</span><span>✓ 7-day returns</span><span>✓ Free delivery {rs(free) + '+' if free else ''}</span><span>✓ Tag photo on request</span></div></header>
<div class="how"><b>How to order:</b> tap <b>Order on WhatsApp</b> under any piece, we confirm it is available, you send name, city and address. Delivery {rs(fee)} ({'free on ' + rs(free) + '+' if free else ''}), 1-2 days in Sahiwal, 3-5 days all over Pakistan.</div>
<nav>{nav}<a href="index.html">Full website</a></nav>
{''.join(parts)}
<footer>{len(items)} pieces in stock · updated with every website update<br><a href="index.html">abcthrift.store</a> · WhatsApp {esc(CFG['whatsapp'])} · <a href="https://www.facebook.com/abcthrift.store">Facebook</a></footer>
<a class="fab" href="https://wa.me/{wa}?text={urllib.parse.quote('Hi ABCThrift! I saw your price list.')}">WhatsApp us</a>
</body></html>"""
    (pub / "catalogue.html").write_text(doc)
    return len(items)


if __name__ == "__main__":
    print(build(sys.argv[1] if len(sys.argv) > 1 else ROOT / "public"), "items -> catalogue.html")
