"""Build the ABCThrift store into public/.

Usage: python3 scripts/build.py <items_dir> <assets_dir>
  items_dir   inventory JSON exported from the Landa Lister (one file per SKU)
  assets_dir  original photos named <asset id>.jpg

Photos get their background removed (rembg) and are placed on a soft solid
colour picked from the garment. Cut-outs are cached in cache/ by asset id, so
only new photos are processed on later runs.
"""
import colorsys, html, json, os, re, shutil, sys, urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "site.json").read_text())
OUT, CACHE = ROOT / "public", ROOT / "cache"
LIVE = ("Listed", "Reserved", "Sold")
NEG = re.compile(r"\b(defect\w*|damag\w*|stain\w*|holes?|tears?|torn|ripp\w*|broken|fad(?:e|ed|ing)|(?:light|slight|minor|some|visible|signs of|general)\s+wear|wear\s*(?:&|and)\s*tear|wear\s+on|shows?\s+(?:\w+\s+)?wear|worn|flaws?|scratch\w*|missing|faulty|issues?|dirty|marks?|dust\w*|pill\w*|grade\s+[abc]\b|as seen in the photos|daag|kharab|surakh|phat\w*|nishan)\b", re.I)
CONDLABEL = {"Excellent": "Like new", "Good": "Great condition", "Average": "Good pre-loved condition", "Defective": "Pre-loved, priced to sell"}
GRADELABEL = {"A": "Like new", "B": "Great condition", "C": "Good pre-loved condition"}
MAJOR = {"Zip issue": "zip", "Button missing": "button", "Stitching loose": "stitching", "Small hole / tear": "a small repair", "Stain / mark": "a quick clean"}
esc = lambda s: html.escape(str(s or ""), quote=True)
rs = lambda n: "Rs " + f"{round(float(n or 0)):,}"


def positive(text):
    out = []
    for line in str(text or "").split("\n"):
        keep = [s for s in re.split(r"(?<=[.!?])\s+", line) if s.strip() and not NEG.search(s)]
        if keep: out.append(" ".join(keep))
    return "\n".join(out).strip()


def cond_label(it):
    return CONDLABEL.get(it.get("cond")) or GRADELABEL.get(it.get("grade")) or "Great condition"


def fix_note(it):
    m = sorted({MAJOR[d] for d in (it.get("defects") or []) if d in MAJOR})
    return f"Priced lower for a small fix ({', '.join(m)})." if m and it.get("showFix") is not False else ""


def clean_name(title, brand, size, category):
    """Product name without the brand, size and filler words, so the brand can lead."""
    t = re.sub(re.escape(brand), "", title, flags=re.I) if brand else title
    t = re.sub(r"(?i)\b(size\s+[\w/-]+|pre-?loved|\d{1,2}(?:-\d{1,2})?\s?(?:y|yrs|m)\b(?:\s*/\s*\d+\s*cm)?)", "", t)
    if size: t = re.sub(r"(?i)(?<!\w)" + re.escape(size) + r"(?!\w)", "", t)
    t = re.sub(r"\s*[|,]\s*(?=[|,]|$)", "", re.sub(r"\s{2,}", " ", t)).strip(" ,|-–")
    return t or category


def highlights(d):
    ai = ((d.get("ai") or {}).get("identified") or {})
    src = ai.get("features") or ((d.get("copy") or {}).get("daraz") or {}).get("highlights") or []
    out = [h.strip().rstrip(".") for h in src if h and not NEG.search(h) and not re.search(r"(?i)condition|only 1|piece|size\b|delivery|cod\b", h)]
    return out[:5]


def deal_price(it):
    x = int(it["price"] * (1 - CFG.get("deal", {}).get("extraPct", 10) / 100))
    return (x + 1) // 50 * 50 - 1  # ends in 49 or 99, never above the promised discount


def wa_digits():
    d = re.sub(r"\D", "", CFG["whatsapp"])
    return "92" + d[1:] if d.startswith("0") else d


def order_link(it=None, price=None):
    msg = (f"Hi! I'd like to order: {it['brand']} {it['name']} ({it['sku']}), {rs(price or it['price'])}{' (Deal of the Day)' if price else ''}. Is it available?"
           if it else "Hi! I have a question about your store.")
    return f"https://wa.me/{wa_digits()}?text={urllib.parse.quote(msg)}"


# ---------- photos ----------
_session = None
def inner_photo(src):
    """Tool photos sit on a flat studio colour with SKU/handle text in the bottom corners: crop to the photo itself."""
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(int); h, w, _ = a.shape
    diff = np.abs(a - a[5, w // 2]).sum(2) > 40
    diff[int(h * .93):, :int(w * .3)] = False; diff[int(h * .93):, int(w * .7):] = False
    ys, xs = np.where(diff)
    if len(xs) and (xs.max() - xs.min()) * (ys.max() - ys.min()) < .97 * w * h:
        im = im.crop((xs.min() + 4, ys.min() + 4, xs.max() - 4, ys.max() - 4))
    return im


def photo_issues(src, cut, n):
    """Plain-language problems with one photo, for the reshoot list in the tool. Cached next to the cut-out."""
    f = CACHE / (Path(src).stem + ".json")
    if f.exists(): out = json.loads(f.read_text())
    elif not Path(src).exists(): return []
    else: out = _issues(src); f.write_text(json.dumps(out))
    if n == 1 and cut.info.get("photo"): out = out + ["item poora frame mein nahi ya background bhara hua; saada deewar ya chadar ke samne lein"]
    return [f"Photo {n}: {x}" for x in out]


def _issues(src):
    im = inner_photo(src); g = np.asarray(im.convert("L"), dtype=float)
    lap = (g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]).var()
    out = []
    if lap < 60: out.append("blur hai (hila hua ya focus nahi)")
    if g.mean() < 70: out.append("andheri hai, roshni mein lein")
    elif g.mean() > 215: out.append("bohat zyada roshni, rang ud gaye")
    if min(im.size) < 350: out.append("bohat chhoti / zoom ki hui")
    return out


def original(src: Path, size=1200) -> Image.Image:
    """The photo exactly as edited in Landa Lister: own background, no crop, just resized for the web."""
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((size, size), Image.LANCZOS)
    return im


def cutout(src: Path) -> Image.Image:
    global _session
    cached = CACHE / (Path(src).stem + ".png")
    if cached.exists():
        c = Image.open(cached); c.info["photo"] = c.text.get("photo") == "1"; return c
    from rembg import remove, new_session
    _session = _session or new_session("isnet-general-use")
    im = inner_photo(src)
    cut = remove(im, session=_session, post_process_mask=True)
    al = np.asarray(cut.getchannel("A")); ys, xs = np.where(al > 30)
    if len(xs): cut = cut.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if not good_cut(cut, im):
        # Close-ups (tags, logos, fabric) and confusing scenes: keep the real photo instead of a broken cut-out.
        cut = im.convert("RGBA"); cut.info["photo"] = True
    CACHE.mkdir(exist_ok=True); cut.save(cached, pnginfo=_meta(cut.info.get("photo")))
    return cut


def _meta(photo):
    from PIL import PngImagePlugin
    m = PngImagePlugin.PngInfo(); m.add_text("photo", "1" if photo else "0"); return m


def good_cut(cut, src):
    from scipy import ndimage
    a = np.asarray(cut.getchannel("A")) > 128
    if not a.any(): return False
    lab, n = ndimage.label(a)
    largest = ndimage.sum(a, lab, range(1, n + 1)).max() / a.sum()
    area = cut.width * cut.height / (src.width * src.height)
    return a.mean() > .35 and largest > .85 and n <= 4 and area > .2


def backdrop(cut):
    """Soft solid colour opposite the garment's hue; neutral for black/white/grey garments."""
    px = np.asarray(cut.convert("RGBA")).reshape(-1, 4)
    px = px[px[:, 3] > 200][:, :3] / 255.0
    if not len(px): return (238, 236, 232)
    r, g, b = np.median(px, 0)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if s < .18 or l < .12 or l > .9:
        return (236, 233, 227) if l < .55 else (214, 222, 228)
    rr, gg, bb = colorsys.hls_to_rgb((h + .5) % 1, .9, .28)
    return tuple(int(v * 255) for v in (rr, gg, bb))


def studio(cut, bg, size=1200):
    canvas = Image.new("RGB", (size, size), bg)
    if cut.info.get("photo"):
        s = min(size * .9 / cut.width, size * .9 / cut.height)
        c = cut.convert("RGB").resize((int(cut.width * s), int(cut.height * s)), Image.LANCZOS)
        canvas.paste(c, ((size - c.width) // 2, (size - c.height) // 2)); return canvas
    s = min(size * .82 / cut.width, size * .82 / cut.height)
    c = cut.resize((max(1, int(cut.width * s)), max(1, int(cut.height * s))), Image.LANCZOS)
    x, y = (size - c.width) // 2, (size - c.height) // 2
    shadow = Image.new("L", (size, size), 0)
    shadow.paste(c.getchannel("A").point(lambda v: 70 if v > 40 else 0), (x + 10, y + 16))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.paste(Image.new("RGB", (size, size), tuple(int(v * .72) for v in bg)), (0, 0), shadow)
    canvas.paste(c, (x, y), c)
    return canvas


# ---------- data ----------
def load_items(items_dir):
    items = []
    for f in sorted(Path(items_dir).glob("*.json")):
        d = json.loads(f.read_text()); d = d.get("data", d)
        if d.get("status") not in LIVE: continue
        c = d.get("copy") or {}
        brand = (d.get("brand") or "").strip() or CFG["houseLabel"]
        if brand.islower(): brand = brand.title()
        specs = [s for s in (c.get("specs") or []) if s.get("value") and not re.match(r"(?i)^(sku|condition|grade|delivery|price)$", s.get("label", "")) and not NEG.search(str(s["value"]))]
        meas = {k: v for k, v in (d.get("meas") or {}).items() if v}
        retail = d.get("retailPkr") or 0
        items.append({
            "sku": d["sku"], "status": d["status"], "price": d.get("price") or 0, "retailPkr": retail if retail > (d.get("price") or 0) else 0,
            "retailUsd": d.get("retailUsd") or (round(retail / 280) if retail else 0), "title": c.get("title") or f"{brand} {d.get('category', '')}",
            "brand": brand, "name": clean_name(c.get("title") or "", brand, d.get("size") or "", d.get("category") or "Clothing"),
            "origin": ((d.get("ai") or {}).get("identified") or {}).get("brand_origin") or "", "hl": highlights(d), "category": d.get("category") or "Clothing", "gender": d.get("gender") or "", "size": d.get("size") or "",
            "color": d.get("color") or "", "cond": cond_label(d), "fix": fix_note(d), "desc": positive(c.get("description_en")),
            "specs": specs, "meas": meas, "images": d.get("images") or [], "created": d.get("createdAt") or "",
        })
    return sorted(items, key=lambda i: i["created"], reverse=True)


# ---------- pages ----------
CSS = (Path(__file__).parent / "store.css").read_text()
SITE_JS = "<script>" + (Path(__file__).parent / "site.js").read_text() + "</script>"
ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.9-2.8-1.2-4.5-4.1-4.7-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'
SVG = {
    "bag": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    "heart": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    "search": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    "menu": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    "home": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    "grid": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
}


def off(it):
    if DEAL.get("sku") == it["sku"]: return round((1 - DEAL["price"] / it["price"]) * 100)
    return round((1 - it["price"] / it["retailPkr"]) * 100) if it["retailPkr"] else 0


DEAL = {}
NAV = {}  # gender -> [categories with stock], filled in main()
GENDERS = ("Men", "Women", "Kids")
CONDS = ("Like new", "Great condition", "Good pre-loved condition", "Pre-loved, priced to sell")
INFO = [("how-to-order", "How to order"), ("shipping", "Delivery & COD"), ("returns", "Returns & exchange"), ("condition-guide", "Condition guide"),
        ("size-guide", "Size guide"), ("faq", "FAQs"), ("track", "Track your order"), ("about", "About us"), ("contact", "Contact us"), ("privacy", "Privacy policy"), ("terms", "Terms & conditions")]


def logo_text():
    n = esc(CFG["storeName"]); a = esc(CFG.get("logoAccent", ""))
    if a and n.endswith(a): return f"{n[:-len(a)]}<em>{a}</em>"
    i = n.rfind(".")
    return f"{n[:i]}<em>{n[i:]}</em>" if i > 0 else n


def in_gender(it, g):
    return it["gender"] == g or (g != "Kids" and it["gender"] == "Unisex")


def shop_link(up="", **q):
    return f"{up}index.html" + ("?" + urllib.parse.urlencode(q) if q else "") + "#shop"


def social_links():
    s = CFG.get("social") or {}
    return "".join(f'<a href="{esc(u)}" target="_blank" rel="noopener">{n}</a>' for n, u in (("Instagram", s.get("instagram")), ("Facebook", s.get("facebook")), ("TikTok", s.get("tiktok"))) if u)


def page(title, desc, body, depth=0, image=None, canonical="", wa=None, extra="", ld=None):
    up = "../" * depth; base = CFG["siteUrl"].rstrip("/")
    dl = CFG.get("delivery") or {}
    tp = {"root": up, "wa": wa_digits(), "store": CFG["storeName"], "deal": DEAL, "bundle": CFG.get("bundle", []), "voucher": CFG.get("voucher"),
          "fee": dl.get("fee", 0), "freeOver": dl.get("freeOver", 0), "api": CFG.get("apiUrl") or CFG.get("offersUrl") or ""}
    v = CFG.get("voucher")
    ann = list(CFG.get("announcements") or ["Cash on delivery all over Pakistan"])
    nav = "".join(f'<div class="nv"><a href="{shop_link(up, g=g)}">{g}</a>' + (f'<div class="nv-dd"><a href="{shop_link(up, g=g)}">All {g.lower()}</a>' + "".join(f'<a href="{esc(shop_link(up, g=g, cat=c))}">{esc(c)}</a>' for c in NAV.get(g, [])) + "</div>" if NAV.get(g) else "") + "</div>" for g in GENDERS)
    drawer = "".join(f'<details{" open" if not i else ""}><summary>{g}</summary><a href="{shop_link(up, g=g)}">All {g.lower()}</a>' + "".join(f'<a href="{esc(shop_link(up, g=g, cat=c))}">{esc(c)}</a>' for c in NAV.get(g, [])) + "</details>" for i, g in enumerate(GENDERS))
    help_links = "".join(f'<a href="{up}{s}.html">{esc(t)}</a>' for s, t in INFO)
    soc = social_links()
    phone = esc(CFG["whatsapp"].replace(" ", ""))
    ld_tags = "".join(f'<script type="application/ld+json">{json.dumps(x).replace("</", "<\\/")}</script>' for x in (ld or []))
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(desc[:160])}"><link rel="canonical" href="{esc(base + '/' + canonical)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="{esc(CFG['storeName'])}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc[:200])}">
<meta property="og:url" content="{esc(base + '/' + canonical)}">{f'<meta property="og:image" content="{esc(base + "/" + image)}"><meta name="twitter:card" content="summary_large_image">' if image else ''}<meta name="theme-color" content="#15201d">
<link rel="icon" href="{up}favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>{CSS}</style>{ld_tags}
<script>window.TP={json.dumps(tp).replace("</", "<\\/")};</script></head><body>
<div class="topbar"><div class="ann" id="ann">{''.join(f'<span{" class=on" if not i else ""}>{esc(a)}</span>' for i, a in enumerate(ann))}</div>{f'<button type="button" class="tb-v" data-voucher>Free {rs(v["amount"])} voucher</button>' if v else ''}</div>
<header class="hd"><button type="button" class="hd-ic hd-menu" data-menu-open aria-label="Open menu">{SVG['menu']}</button>
<a class="logo" href="{up}index.html"><span class="mark">{esc(CFG["storeName"][:1])}</span><span>{logo_text()}</span></a>
<nav class="mainnav" aria-label="Main">{nav}<a href="{up}index.html?sort=new#shop">New arrivals</a><a href="{up}index.html#deal" class="dl">Deal of the Day</a><a href="{shop_link(up, max=999)}">Under Rs 999</a></nav>
<div class="hd-act"><a class="hd-ic" href="{up}index.html?find=1#shop" aria-label="Search">{SVG['search']}</a><a class="hd-ic" href="{up}wishlist.html" aria-label="Wishlist">{SVG['heart']}<span class="bag-n" data-wish-n hidden>0</span></a>
<button type="button" class="hd-ic hd-bag" data-bag-open aria-label="Open bag">{SVG['bag']}<span class="bag-n" id="bag-n" hidden>0</span></button></div></header>
<aside class="menu" id="menu" hidden aria-label="Menu"><div class="menu-in"><div class="bag-hd"><b>Menu</b><button type="button" data-menu-close aria-label="Close">×</button></div>
<a class="menu-top" href="{up}index.html?sort=new#shop">New arrivals</a><a class="menu-top dl" href="{up}index.html#deal">Deal of the Day</a><a class="menu-top" href="{shop_link(up, max=999)}">Under Rs 999</a>
{drawer}<details><summary>Shop by condition</summary>{''.join(f'<a href="{esc(shop_link(up, cond=c))}">{esc(c)}</a>' for c in CONDS)}</details>
<details><summary>Help</summary>{help_links}</details>
<a class="buy" href="{esc(order_link())}" target="_blank" rel="noopener">{ICON}Chat on WhatsApp</a></div></aside>
<main>{body}</main>
<footer class="ft"><div class="ft-in"><div><strong>{logo_text()}</strong><p>{esc(CFG['tagline'])}</p><p class="ft-soc">{soc or (esc('Instagram, Facebook, TikTok: ' + CFG['handle']) if CFG.get('handle') else '')}</p></div>
<div><strong>Shop</strong><p class="ft-links">{''.join(f'<a href="{shop_link(up, g=g)}">{g}</a>' for g in GENDERS)}<a href="{up}index.html?sort=new#shop">New arrivals</a><a href="{shop_link(up, max=999)}">Under Rs 999</a><a href="{up}wishlist.html">Wishlist</a></p></div>
<div><strong>Help</strong><p class="ft-links">{help_links}</p></div>
<div><strong>Order &amp; support</strong><p>WhatsApp / Call <a href="tel:{phone}">{esc(CFG['whatsapp'])}</a>{f'<br><a href="mailto:{esc(CFG["email"])}">{esc(CFG["email"])}</a>' if CFG.get('email') else ''}<br>{esc(CFG.get('city', ''))}<br>Cash on delivery all over Pakistan</p>
<form class="news" id="news"><b>Get new drops first</b><div><input name="email" type="email" required placeholder="Email address" aria-label="Email"><button type="submit">Join</button></div><p class="o-msg" id="news-msg"></p></form></div></div>
<p class="copy">© {datetime.now().year} {esc(CFG['storeName'])} · {esc(CFG.get('domain', ''))}</p></footer>
<a class="fab" href="{esc(wa or order_link())}" target="_blank" rel="noopener" aria-label="Ask on WhatsApp">{ICON}<span>{'Ask' if wa else 'Chat'}</span></a>
<nav class="tabbar" aria-label="Quick links"><a href="{up}index.html">{SVG['home']}<span>Home</span></a><a href="{up}index.html?find=1#shop">{SVG['search']}<span>Search</span></a>
<button type="button" data-menu-open>{SVG['grid']}<span>Shop</span></button><a href="{up}wishlist.html">{SVG['heart']}<span>Wishlist</span><i class="bag-n" data-wish-n hidden>0</i></a>
<button type="button" data-bag-open>{SVG['bag']}<span>Bag</span><i class="bag-n" data-bag-n hidden>0</i></button></nav>
<aside class="bag" id="bag" hidden aria-label="Your bag"><div class="bag-in"><div class="bag-hd"><b id="bag-title">Your bag</b><button type="button" data-bag-close aria-label="Close">×</button></div>
<div id="bag-cart"><div class="bag-tip" id="bag-tip"></div><div class="bag-list" id="bag-list"></div><div class="bag-sum" id="bag-sum"></div>
<button type="button" class="buy" id="bag-go" hidden>Checkout · Cash on delivery</button><p class="bag-note">Pay when your parcel arrives (COD). No advance payment.</p></div>
<form class="co" id="co" hidden novalidate><button type="button" class="o-link" data-co-back>← Back to bag</button>
<label>Full name<input name="name" required maxlength="60" autocomplete="name"></label>
<label>Phone / WhatsApp<input name="phone" type="tel" inputmode="tel" required placeholder="03xx xxxxxxx" autocomplete="tel"></label>
<label>City<input name="city" required maxlength="40" autocomplete="address-level2"></label>
<label>Full address<textarea name="address" required rows="3" maxlength="300" autocomplete="street-address" placeholder="House, street, area, landmark"></textarea></label>
<label>Email (optional, for order updates)<input name="email" type="email" inputmode="email" maxlength="80" autocomplete="email" placeholder="you@example.com"></label>
<label>Note (optional)<input name="note" maxlength="140" placeholder="e.g. call before delivery"></label>
<div class="bag-sum" id="co-sum"></div><p class="o-msg err" id="co-err" role="alert"></p>
<button type="submit" class="buy" data-via="site">Place order · Cash on delivery</button><button type="submit" class="ask" data-via="wa">{ICON}Order on WhatsApp</button>
<label class="chk agree"><input type="checkbox" name="agree" checked> I agree to the <a href="{up}terms.html" target="_blank">terms</a> and <a href="{up}returns.html" target="_blank">7-day return policy</a>.</label>
<p class="bag-note">You get an order number right away. We confirm by WhatsApp or call and dispatch within 24 hours.</p></form>
<div class="co-done" id="co-done" hidden></div></div></aside>
<div class="pop" id="pop" hidden><div class="pop-in" role="dialog" aria-label="Free voucher"><button type="button" class="pop-x" data-pop-close aria-label="Close">×</button>
<p class="eyebrow">Welcome gift</p><h3 id="pop-h"></h3><p id="pop-p"></p><div class="pop-code" id="pop-code" hidden></div><button type="button" class="btn" id="pop-go">Claim free voucher</button></div></div>
{SITE_JS}{extra}</body></html>"""


def bag_data(it):
    return esc(json.dumps({"sku": it["sku"], "b": it["brand"], "n": it["name"], "p": it["price"], "s": it["size"], "i": f"img/{it['sku']}-1.jpg" if it["images"] else ""}))


def price_html(it, cls="cp"):
    reg = f'<span class="{cls}{" dl-reg" if DEAL.get("sku") == it["sku"] else ""}"><b>{rs(it["price"])}</b>{f"<s>{rs(it['retailPkr'])}</s>" if it["retailPkr"] else ""}</span>'
    if DEAL.get("sku") != it["sku"]: return reg
    return reg + f'<span class="{cls} dl"><b>{rs(DEAL["price"])}</b><s>{rs(it["price"])}</s></span>'


def card(it, up=""):
    img = f'{up}img/{it["sku"]}-1.jpg' if it["images"] else ""
    img2 = f'{up}img/{it["sku"]}-2.jpg' if it.get("n_imgs", 0) > 1 else ""
    sold = it["status"] == "Sold"
    badge = '<span class="b-sold">Sold out</span>' if sold else (f'<span class="b-off">-{off(it)}%</span>' if off(it) else '<span class="b-new">Just in</span>' if it.get("fresh") else '')
    return f"""<article class="card{' is-sold' if sold else ''}" data-sku="{esc(it['sku'])}" data-cat="{esc(it['category'])}" data-g="{esc(it['gender'])}" data-size="{esc(it['size'])}" data-brand="{esc(it['brand'])}" data-cond="{esc(it['cond'])}" data-price="{it['price']}" data-off="{off(it)}" data-new="{esc(it['created'])}" data-q="{esc((it['title'] + ' ' + it['brand'] + ' ' + it['category'] + ' ' + it['color'] + ' ' + it['sku']).lower())}">
<a class="cl" href="{up}p/{esc(it['sku'])}.html"><div class="ci">{f'<img src="{img}" alt="{esc(it["brand"] + " " + it["name"])}" loading="lazy" width="600" height="600">' if img else ''}{f'<img class="alt" src="{img2}" alt="" loading="lazy" width="600" height="600">' if img2 else ''}{badge}{'<span class="b-deal dl">Deal of the Day</span>' if DEAL.get('sku') == it['sku'] and not sold else ''}{f'<span class="b-size">{esc(it["size"])}</span>' if it['size'] else ''}</div>
<div class="cb"><span class="cbrand">{esc(it['brand'])} <small>({esc(it['sku'])})</small></span><span class="ct">{esc(it['name'])}</span>
<span class="cmeta"><span class="cond">{esc(it['cond'])}</span>{'' if sold else '<span>Only 1</span>'}</span>{price_html(it)}</div></a>
<button type="button" class="cwish" data-wish="{bag_data(it)}" aria-label="Save {esc(it['name'])} to wishlist">{SVG['heart']}</button>
{'' if sold else f'<button type="button" class="cadd" data-add="{bag_data(it)}" aria-label="Add {esc(it["name"])} to bag">+</button>'}</article>"""


def offer_box(it):
    mn = -(-int(it["price"] * .6) // 50) * 50
    if not (CFG.get("apiUrl") or CFG.get("offersUrl")):
        msg = urllib.parse.quote(f"Hi! My offer for {it['title']} ({it['sku']}): Rs ")
        return f'<a class="offer-btn" href="https://wa.me/{wa_digits()}?text={msg}" target="_blank" rel="noopener">Make an offer</a>'
    return f"""<section class="offer" id="offer" data-sku="{esc(it['sku'])}" data-price="{it['price']}" data-min="{mn}">
<div class="o-hd"><div><b>Make an offer</b><span class="o-sub" id="o-sub">Name your price. 48 hours after the first offer, the highest offer wins the item, unless someone buys it at full price first.</span></div><span class="o-timer" id="o-timer" hidden></span></div>
<div class="o-stats"><div><span>Highest offer</span><b id="o-top">-</b></div><div><span>Offers</span><b id="o-count">0</b></div><div><span>Min offer</span><b id="o-min">{rs(mn)}</b></div></div>
<form id="o-form" class="o-form"><label>Your offer (Rs)<input name="amount" type="number" inputmode="numeric" min="{mn}" max="{it['price'] - 1}" required placeholder="{mn}"></label>
<label>Name<input name="name" required maxlength="40" autocomplete="name"></label>
<label>WhatsApp number<input name="phone" type="tel" inputmode="tel" required placeholder="03xx xxxxxxx" autocomplete="tel"></label>
<button type="submit">Send offer</button></form>
<p class="o-msg" id="o-msg" role="status"></p>
<div class="o-mine" id="o-mine" hidden></div>
<button type="button" class="o-link" id="o-check">Check my offer status</button></section>"""


def delivery_line():
    d = CFG.get("delivery") or {}
    fee = f"Delivery {rs(d['fee'])}" if d.get("fee") else "Free delivery"
    free = f", free over {rs(d['freeOver'])}" if d.get("fee") and d.get("freeOver") else ""
    return f"{fee}{free}. {d.get('days', '')}".strip()


def product_ld(it, n_imgs):
    base = CFG["siteUrl"].rstrip("/")
    return {"@context": "https://schema.org", "@type": "Product", "name": f"{it['brand']} {it['name']}", "sku": it["sku"],
            "image": [f"{base}/img/{it['sku']}-{i}.jpg" for i in range(1, n_imgs + 1)], "description": it["desc"] or it["title"],
            "brand": {"@type": "Brand", "name": it["brand"]}, "itemCondition": "https://schema.org/UsedCondition",
            "offers": {"@type": "Offer", "price": it["price"], "priceCurrency": "PKR", "url": f"{base}/p/{it['sku']}.html",
                       "availability": "https://schema.org/SoldOut" if it["status"] == "Sold" else "https://schema.org/InStock"}}


def product_page(it, all_items, n_imgs):
    sku = it["sku"]; sold = it["status"] == "Sold"; deal = DEAL.get("sku") == sku and not sold
    imgs = [f"../img/{sku}-{i}.jpg" for i in range(1, n_imgs + 1)]
    meas = " · ".join(f"{k.title()} {v}\"" for k, v in it["meas"].items())
    related = [o for o in all_items if o["sku"] != sku and o["status"] != "Sold" and (o["category"] == it["category"] or o["gender"] == it["gender"])][:4]
    alt = it["brand"] + " " + it["name"]
    gallery = "".join(f'<img src="{s}" alt="{esc(alt)} photo {i + 1}" width="1200" height="1200"{" loading=lazy" if i else ""}>' for i, s in enumerate(imgs))
    thumbs = "".join(f'<button type="button" data-i="{i}" aria-label="Photo {i + 1}"{" aria-current=true" if not i else ""}><img src="{s}" alt=""></button>' for i, s in enumerate(imgs)) if len(imgs) > 1 else ""
    details = [("Brand", it["brand"]), ("Brand origin", it["origin"]), ("Category", it["category"]), ("For", it["gender"]), ("Size", it["size"]), ("Colour", it["color"])] + [(s["label"], s["value"]) for s in it["specs"] if s["label"].lower() not in ("brand", "size", "color", "colour", "gender", "category")]
    seen = set(); details = [(k, v) for k, v in details if v and not (k.lower() in seen or seen.add(k.lower()))]
    save = it["retailPkr"] - it["price"] if it["retailPkr"] else 0
    wa = order_link(it)
    deal_href = f' data-deal-href="{esc(order_link(it, DEAL["price"]))}"' if deal else ""
    ask = f'<a class="ask" href="{esc(wa)}"{deal_href} target="_blank" rel="noopener">{ICON}Ask or order on WhatsApp</a>'
    buy = f'<button type="button" class="buy" data-buy="{bag_data(it)}">Buy now · Cash on delivery</button>'
    hl = "".join(f"<li>{esc(h)}</li>" for h in it["hl"])
    g = it["gender"] if it["gender"] in GENDERS else ""
    crumbs = f'<a href="../index.html">Home</a> / ' + (f'<a href="{shop_link("../", g=g)}">{esc(g)}</a> / ' if g else "") + f'<a href="{esc(shop_link("../", **({"g": g} if g else {}), cat=it["category"]))}">{esc(it["category"])}</a> / <span>{esc(sku)}</span>'
    body = f"""<nav class="crumbs">{crumbs}</nav>
<section class="pd"><div class="gal"><div class="gal-main" id="gal">{gallery}</div>{f'<div class="gal-th">{thumbs}</div>' if thumbs else ''}</div>
<div class="info"><div class="ptop"><span class="pbrand">{esc(it['brand'])}</span>{f'<span class="porigin">Brand from {esc(it["origin"])}</span>' if it['origin'] else ''}<button type="button" class="pwish" data-wish="{bag_data(it)}" aria-label="Save to wishlist">{SVG['heart']}</button></div>
<h1 class="pname">{esc(it['name'])}</h1>
<div class="tags"><a class="tag ok" href="../condition-guide.html">✓ {esc(it['cond'])}</a>{f'<span class="tag">Size {esc(it["size"])}</span>' if it['size'] else ''}{f'<span class="tag">{esc(it["gender"])}</span>' if it['gender'] else ''}<span class="tag">{'Sold out' if sold else 'Only 1 piece'}</span></div>
{f'<div class="dealbar dl"><b>Deal of the Day</b><span>Extra {CFG["deal"]["extraPct"]}% off for today only · ends in <time data-countdown></time></span></div>' if deal else ''}
<div class="pp-wrap">{price_html(it, "pp")}{f'<span class="b-off">-{off(it)}%</span>' if off(it) else ''}</div>
{f'<p class="save">Retail abroad ~${it["retailUsd"]}. You save {rs(save)}.</p>' if save > 0 else ''}
{'<p class="soldmsg">This item has been sold. See similar items below or ask us on WhatsApp.</p>' if sold else f'<div class="cta">{buy}<button type="button" class="addbag" data-add="{bag_data(it)}">Add to bag</button></div>{ask}' + offer_box(it)}
<ul class="perks"><li><b>Cash on delivery</b><span>Pay when the parcel arrives</span></li><li><b>Delivery</b><span>{esc(delivery_line())}</span></li><li><b>Easy exchange</b><span><a href="../returns.html">{CFG.get('returns', {}).get('days', 3)}-day exchange</a> if it doesn't match</span></li><li><b>Bundle &amp; save</b><span>{esc(bundle_line())}</span></li></ul>
<section class="pdesc"><h2>About this piece</h2>{f'<p class="lead">{esc(it["desc"])}</p>' if it['desc'] else ''}{f'<h3>Highlights</h3><ul class="hl">{hl}</ul>' if hl else ''}{f'<p class="muted">{esc(it["fix"])}</p>' if it['fix'] else ''}</section>
{f'<details open><summary>Size &amp; fit</summary><p>Size {esc(it["size"])}{". Measurements: " + esc(meas) if meas else ""}. Compare with a garment you own. <a href="../size-guide.html">Size guide</a>. Questions about size? Ask on WhatsApp and we will measure it for you.</p></details>' if it['size'] else ''}
<details><summary>Details</summary><dl>{''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k, v in details)}<dt>Item code</dt><dd>{esc(sku)}</dd></dl></details>
<details><summary>Delivery &amp; payment</summary><p>{esc(delivery_line())} Cash on delivery: pay when the parcel arrives. <a href="../shipping.html">More</a></p></details>
<details><summary>How to order</summary><p>1. Tap "Buy now", or "Add to bag" for several items and check out together.<br>2. Enter your name, phone, city and address.<br>3. Place the order on the site or on WhatsApp; we confirm it.<br>4. Pay when the parcel arrives (COD).</p></details>
<button class="share" type="button" data-share>Share this item</button></div></section>
{f'<section class="rel"><h2>You may also like</h2><div class="grid">{"".join(card(o, "../") for o in related)}</div></section>' if related else ''}
{'' if sold else f'<div class="sticky"><div>{price_html(it, "sp")}<span>{esc(it["brand"])}{" · " + esc(it["size"]) if it["size"] else ""}</span></div><button type="button" class="buy" data-buy="{bag_data(it)}">Buy now</button></div>'}"""
    js = offer_js() + """<script>(function(){var g=document.getElementById('gal'),t=document.querySelectorAll('.gal-th button');t.forEach(function(b){b.onclick=function(){g.scrollTo({left:g.clientWidth*+b.dataset.i,behavior:'smooth'})}});
g&&g.addEventListener('scroll',function(){var i=Math.round(g.scrollLeft/g.clientWidth);t.forEach(function(b){b.setAttribute('aria-current',+b.dataset.i===i)})},{passive:true});
var s=document.querySelector('[data-share]');s&&(s.onclick=function(){var d={title:document.title,url:location.href};if(navigator.share)navigator.share(d).catch(function(){});else navigator.clipboard.writeText(location.href).then(function(){s.textContent='Link copied'})})})()</script>"""
    if not sold: js += "<script>TP.seen(%s)</script>" % json.dumps({"sku": sku, "b": it["brand"], "n": it["name"], "p": it["price"], "i": f"img/{sku}-1.jpg" if n_imgs else ""})
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": CFG["siteUrl"].rstrip("/") + "/"}, {"@type": "ListItem", "position": 2, "name": it["category"]}, {"@type": "ListItem", "position": 3, "name": f"{it['brand']} {it['name']}"}]}
    return page(f"{it['brand']} {it['name']}{' size ' + it['size'] if it['size'] else ''} | {CFG['storeName']}", it["desc"] or it["title"], body, 1, f"img/{sku}-1.jpg" if n_imgs else None, f"p/{sku}.html", None if sold else wa, js, [product_ld(it, n_imgs), crumbs_ld])


def bundle_line():
    parts = [f"{b['min']} items: {rs(b['off'])} off" if b.get("off") else f"{b['min']}+ items: {b['pct']}% off" for b in CFG.get("bundle", [])]
    return ", ".join(parts) or "Order more, save more"


def offer_js():
    url = (CFG.get("apiUrl") or CFG.get("offersUrl"))
    if not url: return ""
    return """<script>(function(){var U=%s,box=document.getElementById('offer');if(!box)return;var sku=box.dataset.sku,$=function(i){return document.getElementById(i)},st=null,tick=null;
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function get(q){return fetch(U+'?'+new URLSearchParams(q)).then(function(r){return r.json()})}
function post(b){return fetch(U,{method:'POST',body:JSON.stringify(b)}).then(function(r){return r.json()})}
function show(s){if(!s||s.error)return;st=s;$('o-top').textContent=s.highest?rs(s.highest):'None yet';$('o-count').textContent=s.count;var mn=s.highest?Math.max(s.minOffer,s.highest+s.step):s.minOffer;$('o-min').textContent=rs(mn);box.querySelector('[name=amount]').min=mn;box.querySelector('[name=amount]').placeholder=mn;
 if(s.state!=='open'){$('o-form').hidden=true;$('o-sub').textContent=s.state==='won'?'The deal on this item is final.':s.state==='sold'?'This item has been sold.':'Offers are closed for this item.'}
 clearInterval(tick);if(s.endsAt&&s.state==='open'){var t=$('o-timer');t.hidden=false;var f=function(){var d=s.endsAt-Date.now();if(d<=0){t.textContent='Closing...';return}var h=Math.floor(d/36e5),m=Math.floor(d%%36e5/6e4);t.textContent=h+'h '+m+'m left'};f();tick=setInterval(f,3e4)}}
function msg(t,ok){var m=$('o-msg');m.textContent=t;m.className='o-msg '+(ok?'ok':'err')}
function wa(t){return 'https://wa.me/%s?text='+encodeURIComponent(t)}
function mine(phone){get({a:'mine',sku:sku,phone:phone}).then(function(r){var el=$('o-mine');el.hidden=false;if(r.error){el.textContent=r.error;return}if(r.none){el.textContent='No offer found for this number.';return}
 var h='<p>Your offer: <b>'+rs(r.amount)+'</b> · '+({'new':'Pending','countered':'You have a counter offer','won':'Deal final!','lost':'This offer did not win'}[r.status]||r.status)+'</p>';
 if(r.status==='countered')h+='<p>Our counter offer: <b>'+rs(r.counter)+'</b></p><button type="button" id="o-acc">Accept '+rs(r.counter)+'</button>';
 if(r.status==='won')h+='<a class="buy" target="_blank" rel="noopener" href="'+wa('Hi! My deal on '+sku+' at '+rs(r.amount)+' is final. My address is: ')+'">Send address (WhatsApp)</a>';
 el.innerHTML=h;var a=$('o-acc');a&&(a.onclick=function(){a.disabled=true;post({a:'accept',sku:sku,phone:phone}).then(function(x){if(x.error){msg(x.error)}else{msg('Deal final! Send your address on WhatsApp.',1)}mine(phone);refresh()})})})}
function refresh(){get({a:'state',sku:sku}).then(show).catch(function(){})}
var saved='';try{saved=localStorage.getItem('st-phone')||'';var nm=localStorage.getItem('st-name')||'';box.querySelector('[name=phone]').value=saved;box.querySelector('[name=name]').value=nm}catch(e){}
$('o-form').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),b={a:'offer',sku:sku,name:f.get('name'),phone:f.get('phone'),amount:f.get('amount')},btn=e.target.querySelector('button');btn.disabled=true;msg('Sending...',1);
 try{localStorage.setItem('st-phone',b.phone);localStorage.setItem('st-name',b.name)}catch(x){}
 post(b).then(function(r){btn.disabled=false;if(r.error){msg(r.error);return}msg(r.message,1);show(r);mine(b.phone)}).catch(function(){btn.disabled=false;msg('Connection problem. Please try again.')})};
$('o-check').onclick=function(){var p=box.querySelector('[name=phone]').value||prompt('Your WhatsApp number');if(p)mine(p)};
refresh();if(saved)mine(saved)})()</script>""" % (json.dumps(url), wa_digits())


def index_badges_js():
    url = (CFG.get("apiUrl") or CFG.get("offersUrl"))
    if not url: return ""
    return """<script>fetch(%s+'?a=all').then(function(r){return r.json()}).then(function(m){document.querySelectorAll('.card').forEach(function(c){var s=m[c.dataset.sku];if(!s||!s.highest||c.classList.contains('is-sold'))return;var b=document.createElement('span');b.className='b-offer';b.textContent=s.state==='won'?'Deal done':'Offer Rs '+Math.round(s.highest).toLocaleString('en-PK')+' · '+s.count;c.querySelector('.ci').appendChild(b)})}).catch(function(){})</script>""" % json.dumps(url)



def hero_slides(live, v):
    def pic(f):
        return next((i for i in live if i["images"] and f(i)), None)
    out = []
    spec = [("Winter New Arrivals", "Hand-picked international brands, washed and checked. Only one of each.", "Shop new arrivals", "index.html?sort=new#shop", pic(lambda i: True), "s1"),
            ("Kids Winter Wear", "Branded jackets, hoodies and snowsuits at low prices.", "Shop kids", shop_link(g="Kids"), pic(lambda i: i["gender"] == "Kids"), "s2"),
            ("Women's Collection", "Sweaters, cardigans and jackets that fit your budget.", "Shop women", shop_link(g="Women"), pic(lambda i: in_gender(i, "Women")), "s3"),
            (f"Free {rs(v['amount'])} voucher" if v else "Cash on delivery", f"Use code {esc(v['code'])} on your first order. Cash on delivery all over Pakistan." if v else "Pay when the parcel arrives.", "Claim voucher" if v else "Shop now", "#shop", pic(lambda i: i["price"] < 1000) or pic(lambda i: True), "s4")]
    seen = set()
    for t, sub, btn, href, it, cls in spec:
        if it is None and cls != "s4": continue
        if it and it["sku"] in seen and cls in ("s2", "s3"): continue
        if it: seen.add(it["sku"])
        img = f'<img src="img/{it["sku"]}-1.jpg" alt="" width="600" height="600"{" loading=lazy" if out else ""}>' if it else ""
        act = f'<button type="button" class="btn" data-voucher>{btn}</button>' if cls == "s4" and v else f'<a class="btn" href="{esc(href)}">{btn}</a>'
        out.append(f'<div class="slide {cls}"><div class="sl-tx"><p class="eyebrow">{esc(CFG["storeName"])}</p><h2>{esc(t)}</h2><p>{sub}</p>{act}</div><div class="sl-img">{img}</div></div>')
    return "".join(out)


SLIDER_JS = """<script>(function(){var t=document.getElementById('sl-track'),d=document.getElementById('sl-dots');if(!t)return;var n=t.children.length,i=0,tm;
d.innerHTML=Array.prototype.map.call(t.children,function(_,k){return '<button type="button" aria-label="Slide '+(k+1)+'"></button>'}).join('');var b=d.children;
function mark(){for(var k=0;k<n;k++)b[k].setAttribute('aria-current',k===i)}function go(k){i=(k+n)%n;t.scrollTo({left:t.clientWidth*i,behavior:'smooth'});mark()}
Array.prototype.forEach.call(b,function(x,k){x.onclick=function(){go(k);rs()}});t.addEventListener('scroll',function(){var k=Math.round(t.scrollLeft/t.clientWidth);if(k!==i){i=k;mark()}},{passive:true});
function rs(){clearInterval(tm);tm=setInterval(function(){go(i+1)},5000)}mark();if(n>1)rs()})()</script>"""


def index_page(items):
    live = [i for i in items if i["status"] != "Sold"]
    cats = sorted({i["category"] for i in items}); sizes = [s for s in dict.fromkeys(i["size"] for i in live) if s]
    brands = sorted({i["brand"] for i in live}, key=lambda b: (-sum(i["brand"] == b for i in live), b))
    d = next((i for i in live if i["sku"] == DEAL.get("sku")), None)
    deal = f"""<section id="deal" class="deal dl"><a class="deal-img" href="p/{esc(d['sku'])}.html">{f'<img src="img/{d["sku"]}-1.jpg" alt="{esc(d["brand"] + " " + d["name"])}" width="600" height="600">' if d['images'] else ''}</a>
<div class="deal-tx"><p class="eyebrow">Deal of the Day · extra {CFG['deal']['extraPct']}% off</p><span class="pbrand">{esc(d['brand'])}</span><h2>{esc(d['name'])}</h2>
<p class="deal-p"><b>{rs(DEAL['price'])}</b><s>{rs(d['price'])}</s></p><p class="deal-t">Ends in <time data-countdown>--:--:--</time></p>
<div class="cta"><a class="btn" href="p/{esc(d['sku'])}.html">View deal</a><button type="button" class="addbag" data-add="{bag_data(d)}">Add to bag</button></div></div></section>""" if d else ""
    v = CFG.get("voucher"); dl = CFG.get("delivery") or {}
    tiles = ""
    for g in GENDERS:
        gi = [i for i in live if in_gender(i, g)]
        pic = next((i for i in gi if i["images"]), None)
        if not gi: continue
        tiles += f'<a class="gtile" href="{shop_link(g=g)}">{f"<img src=img/{pic["sku"]}-1.jpg alt=\"\" loading=lazy width=600 height=600>" if pic else ""}<span><b>{g}</b><em>{len(gi)} pieces</em></span></a>'
    pills = "".join(f'<a href="{esc(shop_link(cat=c))}">{esc(c)} <em>{sum(i["category"] == c for i in live)}</em></a>' for c in sorted({i["category"] for i in live}))
    conds = "".join(f'<a href="{esc(shop_link(cond=c))}"><b>{esc(c)}</b><span>{esc(COND_NOTE[c])}</span></a>' for c in CONDS if any(i["cond"] == c for i in live))
    slides = hero_slides(live, v)
    body = f"""<section class="slider" id="slider" aria-label="Highlights"><div class="sl-track" id="sl-track">{slides}</div><div class="sl-dots" id="sl-dots"></div></section>
<section class="gtiles" style="--n:{tiles.count('class="gtile"')}" aria-label="Shop by">{tiles}</section>
{f'<nav class="pills" aria-label="Categories">{pills}</nav>' if pills else ''}
{deal}
<section class="trust"><div><b>Cash on delivery</b><span>Pay when the parcel arrives</span></div><div><b>{'Free delivery over ' + rs(dl['freeOver']) if dl.get('freeOver') else 'Nationwide delivery'}</b><span>{esc(dl.get('days', 'All over Pakistan'))}</span></div><div><b>Hand-checked</b><span>Washed, pressed, photographed for real</span></div><div><b>{CFG.get('returns', {}).get('days', 3)}-day exchange</b><span>If it doesn't match the page</span></div></section>
<section class="offers3"><div><b>Bundle &amp; save</b><span>{esc(bundle_line())}</span></div>{f'<div><b>Welcome voucher</b><span>{rs(v["amount"])} off your first order over {rs(v["minOrder"])}</span></div>' if v else ''}<div><b>Only 1 of each</b><span>Every piece is one-off, so don't wait if you like it.</span></div></section>
<section class="rv" id="rv" hidden><h2>Recently viewed</h2><div class="rv-row"></div></section>
<section id="shop" class="shop"><div class="shop-hd"><h2 id="shop-h">Latest Arrivals <span class="muted" id="count">{len(live)} items</span></h2>
<input id="q" type="search" placeholder="Search brand, item, colour, code" aria-label="Search"></div>
<div class="brands" aria-label="Shop by brand">{''.join(f'<button type="button" data-brand="{esc(b)}">{esc(b)}</button>' for b in brands)}</div>
<div class="filters"><div class="chips" id="g">{''.join(f'<button type="button" data-v="{g}">{g}</button>' for g in ['All', *GENDERS])}</div>
<select id="cat" aria-label="Category"><option value="">All categories</option>{''.join(f'<option>{esc(c)}</option>' for c in cats)}</select>
<select id="size" aria-label="Size"><option value="">All sizes</option>{''.join(f'<option>{esc(s)}</option>' for s in sizes)}</select>
<select id="cond" aria-label="Condition"><option value="">Any condition</option>{''.join(f'<option>{esc(c)}</option>' for c in CONDS)}</select>
<select id="max" aria-label="Price"><option value="">Any price</option><option value="999">Under Rs 1,000</option><option value="1499">Under Rs 1,500</option><option value="1999">Under Rs 2,000</option><option value="2999">Under Rs 3,000</option></select>
<select id="sort" aria-label="Sort"><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="off">Biggest saving</option></select>
<label class="chk"><input type="checkbox" id="sold"> Show sold</label><button type="button" class="o-link" id="clear" hidden>Clear filters</button></div>
<div class="grid" id="grid">{''.join(card(i) for i in items)}</div><p class="empty" id="empty" hidden>Nothing here yet. Try another filter, or ask on WhatsApp and we'll look for it.</p></section>
{f'<section class="conds"><h2>Shop by condition</h2><div>{conds}</div><a class="o-link" href="condition-guide.html">How we grade condition</a></section>' if conds else ''}
<section id="how" class="how"><h2>How to order</h2><ol><li><b>Pick your items</b><span>Check the photos and size. Add several items to your bag.</span></li><li><b>Check out</b><span>Enter your name, phone and address, and place the order on the site or on WhatsApp.</span></li><li><b>Pay at your door</b><span>We confirm and dispatch. Pay cash when the parcel arrives.</span></li></ol></section>
<section class="faqs"><h2>Common questions</h2>{''.join(f'<details><summary>{esc(q)}</summary><p>{a}</p></details>' for q, a in FAQ[:4])}<a class="o-link" href="faq.html">All FAQs</a></section>"""
    js = """<script>(function(){var g='All',$=function(i){return document.getElementById(i)},q=$('q'),cat=$('cat'),size=$('size'),cond=$('cond'),sort=$('sort'),sold=$('sold'),mx=$('max'),grid=$('grid'),cards=[].slice.call(grid.children),brand='';
function setG(v){g=v;document.querySelectorAll('#g button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===v)})}
function run(){var v=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(!mx.value||+c.dataset.price<=+mx.value)&&(g==='All'||c.dataset.g===g||(g!=='Kids'&&c.dataset.g==='Unisex'))&&(!cat.value||c.dataset.cat===cat.value)&&(!size.value||c.dataset.size===size.value)&&(!cond.value||c.dataset.cond===cond.value)&&(!brand||c.dataset.brand===brand)&&(!v||c.dataset.q.indexOf(v)>-1)&&(sold.checked||!c.classList.contains('is-sold'));c.hidden=!ok;if(ok)n++});
 var s=sort.value;cards.slice().sort(function(a,b){return s==='low'?a.dataset.price-b.dataset.price:s==='high'?b.dataset.price-a.dataset.price:s==='off'?b.dataset.off-a.dataset.off:(a.dataset['new']<b.dataset['new']?1:-1)}).forEach(function(c){grid.appendChild(c)});
 var f=g!=='All'||cat.value||size.value||cond.value||mx.value||brand||v;$('clear').hidden=!f;
 $('shop-h').firstChild.textContent=(f?[g!=='All'?g:'',cat.value,cond.value,brand].filter(Boolean).join(' · ')||'Results':'Latest Arrivals')+' ';
 $('count').textContent=n+' items';$('empty').hidden=n>0}
document.querySelectorAll('#g button').forEach(function(b){b.onclick=function(){setG(b.dataset.v);run()}});
[q,cat,size,cond,sort,sold,mx].forEach(function(e){e.addEventListener('input',run)});
document.querySelectorAll('.brands button').forEach(function(b){b.onclick=function(){brand=b.getAttribute('aria-pressed')==='true'?'':b.dataset.brand;document.querySelectorAll('.brands button').forEach(function(x){x.setAttribute('aria-pressed',!!brand&&x===b)});run()}});
$('clear').onclick=function(){setG('All');q.value=cat.value=size.value=cond.value=mx.value='';brand='';document.querySelectorAll('.brands button').forEach(function(x){x.setAttribute('aria-pressed',false)});history.replaceState(null,'',location.pathname+'#shop');run()};
function fromUrl(){var p=new URLSearchParams(location.search);setG(['Men','Women','Kids'].indexOf(p.get('g'))>-1?p.get('g'):'All');
 function pick(el,v){el.value=v||'';if(v&&el.value!==v){var o=document.createElement('option');o.textContent=v;el.appendChild(o);el.value=v}}
 pick(cat,p.get('cat'));pick(size,p.get('size'));pick(cond,p.get('cond'));mx.value=p.get('max')||'';sort.value=p.get('sort')||'new';q.value=p.get('q')||'';brand=p.get('brand')||'';
 document.querySelectorAll('.brands button').forEach(function(x){x.setAttribute('aria-pressed',!!brand&&x.dataset.brand===brand)});run();if(p.get('find'))setTimeout(function(){q.focus()},300)}
fromUrl();window.addEventListener('popstate',fromUrl);
document.addEventListener('click',function(e){var a=e.target.closest('a[href*="#shop"]');if(!a||a.pathname!==location.pathname)return;e.preventDefault();history.pushState(null,'',a.href);fromUrl();var m=$('menu');if(m&&!m.hidden){m.hidden=true;document.body.classList.remove('noscroll')}$('shop').scrollIntoView({behavior:'smooth'})})})()</script>"""
    org = {"@context": "https://schema.org", "@type": "ClothingStore", "name": CFG["storeName"], "url": CFG["siteUrl"].rstrip("/") + "/", "telephone": "+" + wa_digits(),
           "address": {"@type": "PostalAddress", "addressLocality": "Sahiwal", "addressRegion": "Punjab", "addressCountry": "PK"}, "paymentAccepted": "Cash on delivery", "currenciesAccepted": "PKR"}
    return page(f"{CFG['storeName']} | Pre-loved international brands in Pakistan, cash on delivery", CFG["tagline"], body, 0, f"img/{live[0]['sku']}-1.jpg" if live and live[0]["images"] else None, "", None, js + SLIDER_JS + index_badges_js(), [org])


# ---------- info pages ----------
COND_NOTE = {
    "Like new": "Barely worn. Looks and feels new.",
    "Great condition": "Gently worn, clean and fresh.",
    "Good pre-loved condition": "Worn and loved, still lots of life.",
    "Pre-loved, priced to sell": "Lowest prices. Any small fix is written on the page.",
}


def _faq():
    d = CFG.get("delivery") or {}; r = CFG.get("returns", {}).get("days", 3); v = CFG.get("voucher")
    return [
        ("Are these clothes new?", "No. They are pre-loved (used) international brand clothes that we pick, wash, press and check ourselves. Every item has real photos and its condition written on the page."),
        ("How do I pay?", "Cash on delivery. Pay the rider when the parcel arrives. No advance payment."),
        ("How long does delivery take and what does it cost?", esc(delivery_line()) + " Parcels are dispatched within 24 hours of confirmation."),
        ("What if the size doesn't fit?", f"Tell us on WhatsApp within {r} days. If the item is unworn and unwashed, you can exchange or return it. <a href=\"returns.html\">Returns &amp; exchange</a>."),
        ("How many pieces of each item are there?", "Only one. The first person to order gets it, so don't wait if you like something."),
        ("How do I order?", "Tap \"Buy now\" or \"Add to bag\", then enter your name, phone and address at checkout. Place the order on the site or on WhatsApp and we confirm it."),
        ("Any discounts or vouchers?", esc(bundle_line()) + "." + (f" {rs(v['amount'])} off your first order of {rs(v['minOrder'])}+ with code {esc(v['code'])}." if v else "")),
        ("Can you send more photos or a video?", "Yes. Send the item code on WhatsApp and we'll send more photos, a video or measurements."),
        ("How do I track my order?", "Enter your order number on <a href=\"track.html\">Track your order</a>, or send it to us on WhatsApp. We also send a tracking number after dispatch."),
    ]


def info_pages():
    d = CFG.get("delivery") or {}; r = CFG.get("returns", {}).get("days", 3); wa = esc(order_link()); ph = esc(CFG["whatsapp"])
    fee = rs(d.get("fee", 0)); free = rs(d.get("freeOver", 0))
    P = {}
    P["how-to-order"] = ("How to order", "Ordering is easy. No account or advance payment needed.", f"""
<ol class="steps"><li><b>Pick an item</b><span>Check the photos, size and condition. There is only one of each item.</span></li>
<li><b>Add to bag</b><span>Tap "Buy now" or "Add to bag". Bundle discounts apply automatically on 2 or more items.</span></li>
<li><b>Check out</b><span>Enter your name, phone, city and full address, then tap "Place order" or "Order on WhatsApp". You get an order number right away.</span></li>
<li><b>Confirmation</b><span>We confirm on WhatsApp and dispatch within 24 hours.</span></li>
<li><b>Cash on delivery</b><span>Pay the rider when the parcel arrives.</span></li></ol>
<p>No WhatsApp? Call us: <a href="tel:{esc(CFG['whatsapp'].replace(' ', ''))}">{ph}</a>.</p>""")
    P["shipping"] = ("Delivery & cash on delivery", "Delivery all over Pakistan, pay when the parcel arrives.", f"""
<h2>Delivery charges</h2><p>{'Delivery ' + fee + ' per order. ' if d.get('fee') else ''}{('Orders over ' + free + ' get free delivery.') if d.get('freeOver') else ''}</p>
<h2>Delivery time</h2><p>{esc(d.get('days', ''))}. Dispatched within 24 hours of confirmation. We send the tracking number on WhatsApp after dispatch.</p>
<h2>Cash on delivery (COD)</h2><p>No advance payment. Pay the rider in cash when the parcel arrives. For large orders we may call to confirm.</p>
<h2>Order confirm</h2><p>Every order is confirmed by WhatsApp or call. If we can't confirm it, the order is cancelled and the item goes back on sale.</p>""")
    P["returns"] = ("Returns & exchange", f"Easy {r}-day returns and exchanges.", f"""
<h2>{r}-day returns and exchanges</h2><p>You can return or exchange an item within {r} days of receiving your parcel if:</p>
<ul><li>It differs from the description, condition or photos on its page.</li><li>It doesn't match the measurements given on its page.</li><li>You received the wrong item, or an item is missing from the parcel.</li><li>You changed your mind (the conditions below apply).</li></ul>
<h2>Conditions</h2><ul><li>The item is unworn, unwashed and in the same state we sent it, with the {esc(CFG['storeName'])} tag attached.</li>
<li>Send an unboxing video or photos (especially for a wrong or damaged item).</li>
<li>Light signs of wear are normal for pre-loved items and match the condition grade on the page; they are not a reason for return.</li>
<li>Undergarments, socks, swimwear and items marked "Final sale" cannot be returned.</li>
<li>Deal of the Day and accepted-offer items can be exchanged; cash refunds only if the mistake is ours.</li>
<li>Each item is one of a kind, so an exchange is for a different item of equal value.</li></ul>
<h2>How</h2><p>Send your order number, item code and photos on WhatsApp <a href="{wa}" target="_blank" rel="noopener">{ph}</a>. We reply within 24 hours with return instructions.</p>
<h2>Delivery charges</h2><p>If the mistake is ours (wrong item, not as described), we pay delivery both ways. For change of mind or size returns, the customer pays return delivery and the original delivery charge is not refunded.</p>
<h2>Refund</h2><p>Once we receive and check the item, we refund within 3 working days by JazzCash, EasyPaisa or bank transfer, or as store credit if you prefer.</p>""")
    P["terms"] = ("Terms & conditions", f"Terms for shopping at {CFG['storeName']}.", f"""
<h2>Items</h2><p>All our items are pre-loved (used). Each item's condition follows our <a href="condition-guide.html">condition guide</a> and the photos show the actual item. Colours may look slightly different on your screen.</p>
<h2>Orders</h2><p>After you order, we confirm by WhatsApp or call. If we can't confirm within 24 hours, the order may be cancelled. Each item is one of a kind; if two orders arrive together, the first one confirmed gets it.</p>
<h2>Prices and payment</h2><p>All prices are in Pakistani Rupees. Payment is cash on delivery. {esc(delivery_line())}</p>
<h2>Offers and vouchers</h2><p>The voucher can be used once, on a customer's first order. Bundle discounts apply automatically in the bag. A winning offer must be confirmed within 24 hours.</p>
<h2>Receiving your parcel</h2><p>Please check the parcel from outside when you receive it. If a parcel is refused without reason, we may ask for delivery charges in advance on your next order.</p>
<h2>Returns</h2><p>See <a href="returns.html">Returns &amp; exchange</a> ({r} days).</p>
<h2>Contact</h2><p>WhatsApp / Call {ph}</p>""")
    P["condition-guide"] = ("Condition guide", "We check every item ourselves and give it one of these grades.", "".join(f'<div class="cg"><b>{esc(c)}</b><p>{esc(COND_NOTE[c])}</p></div>' for c in CONDS) + """
<p>Every item is washed, pressed and checked by hand. Photos show the actual item. For more photos or a video, send the item code on WhatsApp.</p>""")
    P["size-guide"] = ("Size guide", "International brands size differently, so please compare measurements.", """
<h2>How to measure</h2><p>Lay a shirt or jacket that fits you well flat on the floor. <b>Chest</b>: straight across from armpit to armpit. <b>Length</b>: from the highest point of the shoulder to the bottom hem. Compare these with the measurements on the item page.</p>
<h2>Adults (approx.)</h2><table><thead><tr><th>Size</th><th>Chest (pit to pit)</th><th>Pakistani size</th></tr></thead><tbody>
<tr><td>XS</td><td>17-18"</td><td>Small</td></tr><tr><td>S</td><td>19-20"</td><td>Small / Medium</td></tr><tr><td>M</td><td>20-21"</td><td>Medium</td></tr><tr><td>L</td><td>22-23"</td><td>Large</td></tr><tr><td>XL</td><td>24-25"</td><td>XL</td></tr><tr><td>XXL</td><td>26"+</td><td>XXL</td></tr></tbody></table>
<h2>Kids (approx.)</h2><table><thead><tr><th>Age</th><th>Height</th></tr></thead><tbody><tr><td>1-2Y</td><td>80-92 cm</td></tr><tr><td>3-4Y</td><td>98-104 cm</td></tr><tr><td>5-6Y</td><td>110-116 cm</td></tr><tr><td>7-8Y</td><td>122-128 cm</td></tr><tr><td>9-10Y</td><td>134-140 cm</td></tr><tr><td>11-12Y</td><td>146-152 cm</td></tr></tbody></table>
<p class="muted">These are approximate. Check each item's measurements on its page or ask on WhatsApp.</p>""")
    P["faq"] = ("FAQs", "Frequently asked questions.", "".join(f'<details><summary>{esc(q)}</summary><p>{a}</p></details>' for q, a in FAQ))
    P["track"] = ("Track your order", "Enter your order number and phone number.", f"""
<form class="co track" id="trk"><label>Order number<input name="o" required placeholder="AT-..." autocapitalize="characters"></label><label>Phone number<input name="p" type="tel" inputmode="tel" placeholder="03xx xxxxxxx"></label><button type="submit" class="buy">Track order</button></form>
<div id="my-orders"></div>""")
    P["about"] = ("About us", f"{CFG['storeName']}: pre-loved international brands, hand-picked in Sahiwal.", f"""
<p>{esc(CFG['storeName'])} is a small Pakistani store selling pre-loved (used) international brand clothing in good condition at fair prices. We hand-pick every piece ourselves from the markets of Sahiwal.</p>
<p>Every item is washed, pressed and checked by hand, then listed with real photos and an honest condition grade. There is only one of each item.</p>
<p>Wearing pre-loved clothes saves money and is better for the environment.</p>
{f'<p>Follow: {esc(CFG["handle"])}</p>' if CFG.get('handle') else ''}""")
    P["contact"] = ("Contact us", "Questions about an order or size? We reply quickly on WhatsApp.", f"""
<p><a class="buy" href="{wa}" target="_blank" rel="noopener">{ICON}WhatsApp {ph}</a></p>
<p>Call: <a href="tel:{esc(CFG['whatsapp'].replace(' ', ''))}">{ph}</a>{f'<br>Email: <a href="mailto:{esc(CFG["email"])}">{esc(CFG["email"])}</a>' if CFG.get('email') else ''}<br>{esc(CFG.get('city', ''))}{'<br>Social: ' + esc(CFG['handle']) if CFG.get('handle') else ''}</p>
<p class="muted">Hours: every day, 11 am to 10 pm.</p>""")
    P["privacy"] = ("Privacy policy", "We only use your details to complete your order.", """
<p>The name, phone, email and address you give at checkout are used only to deliver your order and contact you, and are shared with the courier company. We never sell your details.</p>
<p>Your bag, wishlist and recently viewed items are saved only in your own browser.</p>
<p>To have your details deleted, message us on WhatsApp.</p>""")
    return P


TRACK_JS = """<script>(function(){var f=document.getElementById('trk');if(!f)return;var L=function(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}},o=L('orders',[]),box=document.getElementById('my-orders'),q=new URLSearchParams(location.search).get('o');
var res=document.createElement('div');res.className='cg';res.hidden=true;f.after(res);
if(o.length){f.o.value=o[0].no;f.p.value=o[0].phone||'';box.innerHTML='<h2>Your recent orders</h2>'+o.map(function(x){return '<div class="cg"><b>'+x.no+'</b><p>'+x.date+' · '+x.items+' item(s) · Rs '+Math.round(x.total).toLocaleString('en-PK')+'</p></div>'}).join('')}
if(q)f.o.value=q;
var ST={'new':'Order received, awaiting confirmation','confirmed':'Confirmed, being packed','dispatched':'On its way','delivered':'Delivered','cancelled':'Cancelled'};
function wa(){var t='Hi! Could you tell me the status of my order '+f.o.value.trim().toUpperCase()+(f.p.value?' (phone '+f.p.value+')':'')+'?';window.open('https://wa.me/'+TP.wa+'?text='+encodeURIComponent(t),'_blank')}
f.onsubmit=function(e){e.preventDefault();if(!TP.api)return wa();res.hidden=false;res.textContent='Checking...';
 fetch(TP.api+'?'+new URLSearchParams({a:'track',no:f.o.value.trim(),phone:f.p.value})).then(function(r){return r.json()}).then(function(r){if(r.error){res.innerHTML='<p>'+r.error+'</p>';return}
 res.innerHTML='<b>'+r.no+' · '+r.status+'</b><p>'+(ST[String(r.status).toLowerCase()]||'')+(r.tracking?'<br>Tracking: <b>'+r.tracking+'</b>':'')+'<br>'+r.items+' item(s) · Rs '+Math.round(r.total).toLocaleString('en-PK')+'</p>'}).catch(function(){res.textContent='Could not reach the server. Opening WhatsApp instead.';wa()})};
if(q&&TP.api)f.requestSubmit()})()</script>"""

WISH_BODY = """<section class="infop"><h1>Wishlist</h1><p class="muted">Save the items you like here. There is only one of each, so order soon.</p><div class="grid" id="wl"></div><p class="empty" id="wl-e" hidden>Your wishlist is empty. Tap ♡ on an item to save it.</p><p><a class="btn" href="index.html#shop">Start shopping</a></p></section>"""
WISH_JS = """<script>(function(){var w;try{w=JSON.parse(localStorage.getItem('tp-wish')||'[]')}catch(e){w=[]}var g=document.getElementById('wl');document.getElementById('wl-e').hidden=w.length>0;
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
g.innerHTML=w.map(function(it){return '<article class="card"><a class="cl" href="p/'+e(it.sku)+'.html"><div class="ci">'+(it.i?'<img src="'+e(it.i)+'" alt="" loading="lazy">':'')+'</div><div class="cb"><span class="cbrand">'+e(it.b)+'</span><span class="ct">'+e(it.n)+'</span><span class="cp"><b>Rs '+Math.round(it.p).toLocaleString('en-PK')+'</b></span></div></a><button type="button" class="cwish on" data-wish="'+e(JSON.stringify(it))+'" aria-label="Remove from wishlist">"""


FAQ = []


def main(items_dir, assets_dir):
    items = load_items(items_dir)
    tmp = ROOT / "public.new"; shutil.rmtree(tmp, ignore_errors=True); (tmp / "img").mkdir(parents=True); (tmp / "p").mkdir()
    counts, report = {}, {}
    for it in items:
        n = 0; issues = []
        for aid in it["images"]:
            src = Path(assets_dir) / f"{aid}.jpg"
            if not src.exists() and not (CACHE / f"{aid}.png").exists(): continue
            try: cut = original(src)
            except Exception as e: print("photo failed", aid, e); continue
            n += 1; cut.save(tmp / "img" / f"{it['sku']}-{n}.jpg", quality=86, optimize=True, progressive=True)
            issues += photo_issues(src, cut, n)
        if n < 3: issues.append(f"Sirf {n} photo. Kam az kam 4 lein: front, back, brand/size tag, aur close-up (fabric ya logo)")
        counts[it["sku"]] = n; it["n_imgs"] = n
        if issues and it["status"] != "Sold": report[it["sku"]] = issues
        if not n: it["images"] = []
    day = datetime.now(timezone.utc) + timedelta(hours=5)
    for it in items:
        try: it["fresh"] = (day - datetime.fromisoformat(str(it["created"]).replace("Z", "+00:00"))).days < 7
        except ValueError: it["fresh"] = False
    live = [i for i in items if i["status"] != "Sold"]
    NAV.clear(); NAV.update({g: sorted({i["category"] for i in live if in_gender(i, g)}) for g in GENDERS})
    FAQ[:] = _faq()
    pick = sorted((i for i in items if i["status"] == "Listed" and counts[i["sku"]]), key=lambda i: i["sku"])
    DEAL.clear()
    if pick and CFG.get("deal"):
        d = pick[day.toordinal() % len(pick)]; DEAL.update(sku=d["sku"], price=deal_price(d), day=day.strftime("%Y-%m-%d"))
    for it in items: (tmp / "p" / f"{it['sku']}.html").write_text(product_page(it, items, counts[it["sku"]]))
    (tmp / "index.html").write_text(index_page(items))
    for slug, (title, lead, html_) in info_pages().items():
        extra = TRACK_JS if slug == "track" else ""
        faq_ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in FAQ]}] if slug == "faq" else None
        (tmp / f"{slug}.html").write_text(page(f"{title} | {CFG['storeName']}", lead, f'<section class="infop"><nav class="crumbs"><a href="index.html">Home</a> / <span>{esc(title)}</span></nav><h1>{esc(title)}</h1><p class="lead">{esc(lead)}</p>{html_}</section>', 0, None, f"{slug}.html", None, extra, faq_ld))
    (tmp / "wishlist.html").write_text(page(f"Wishlist | {CFG['storeName']}", "Your saved items.", WISH_BODY, 0, None, "wishlist.html", None,
        WISH_JS + SVG["heart"].replace("'", "\\'") + """</button></article>'}).join('')})()</script>"""))
    (tmp / "photo-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    (tmp / "items.json").write_text(json.dumps([{"sku": i["sku"], "title": i["title"], "price": i["price"], "status": i["status"]} for i in items]))
    shutil.copy(Path(__file__).parent / "favicon.svg", tmp / "favicon.svg")
    (tmp / "404.html").write_text(page(f"Not found | {CFG['storeName']}", CFG["tagline"], '<section class="nf"><h1>This page or item is no longer available</h1><p>Take a look at our other items.</p><a class="btn" href="' + esc(CFG['siteUrl']) + '/">Visit the store</a></section>'))
    base = CFG["siteUrl"].rstrip("/")
    pages = [""] + [f"{s}.html" for s, _ in INFO] + [f"p/{i['sku']}.html" for i in items]
    (tmp / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f"<url><loc>{base}/{p}</loc></url>" for p in pages) + "</urlset>")
    (tmp / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    if CFG.get("domain"): (tmp / "CNAME").write_text(CFG["domain"] + "\n")
    (tmp / ".nojekyll").write_text("")
    shutil.rmtree(OUT, ignore_errors=True); tmp.rename(OUT)
    print(f"{len(items)} items, {sum(counts.values())} photos -> {OUT}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
