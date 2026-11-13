"""Build the ABCThrift store into public/.

Usage: python3 scripts/build.py <items_dir> <assets_dir>
  items_dir   inventory JSON exported from the Landa Lister (one file per SKU)
  assets_dir  original photos named <asset id>.jpg

Photos get their background removed (rembg) and are placed on a soft solid
colour picked from the garment. Cut-outs are cached in cache/ by asset id, so
only new photos are processed on later runs.
"""
import colorsys, hashlib, html, json, os, re, shutil, sys, urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

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


def _ms(iso): return int(datetime.fromisoformat(iso).timestamp() * 1000)


def camp_cfg():
    """Sitewide sale from site.json "campaign" (e.g. 11.11 Deals). Shown and priced in the browser only between start and end."""
    c = CFG.get("campaign") or {}
    if not (c.get("pct") and c.get("start") and c.get("end")) or _ms(c["end"]) <= datetime.now(timezone.utc).timestamp() * 1000: return None
    return {"name": c.get("name", "Sale"), "pct": int(c["pct"]), "start": _ms(c["start"]), "end": _ms(c["end"]),
            "endTxt": datetime.fromisoformat(c["end"]).strftime("%-d %b, %-I:%M %p")}


CAMP = camp_cfg()


def camp_price(p):
    return p * (100 - CAMP["pct"]) // 100 if CAMP else p  # same formula as cp() in site.js


def wa_digits():
    d = re.sub(r"\D", "", CFG["whatsapp"])
    return "92" + d[1:] if d.startswith("0") else d


def order_link(it=None, price=None, label="Deal of the Day"):
    msg = (f"Hi! I'd like to order: {it['brand']} {it['name']} ({it['sku']}), {rs(price or it['price'])}{f' ({label})' if price else ''}. Is it available?"
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
MEAS_KEYS = ("chest", "length", "shoulder", "sleeve", "waist", "inseam")
MEAS_LABEL = {"chest": "Chest (armpit to armpit)", "length": "Length (shoulder to hem)", "shoulder": "Shoulder (seam to seam)",
              "sleeve": "Sleeve (shoulder to cuff)", "waist": "Waist (flat, side to side)", "inseam": "Inseam"}
ADULT = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]


def size_rank(s):
    """Sort sizes the way shoppers expect: XS..3XL, then numbers, then kids ages."""
    u = str(s).upper().replace("2XL", "XXL").replace("XXXL", "3XL")
    if u in ADULT: return (0, ADULT.index(u), 0)
    m = re.match(r"(\d+)", u)
    if m and "Y" in u: return (2, int(m.group(1)), 0)
    if m: return (1, int(m.group(1)), 0)
    return (3, 0, u)


# Brand size charts: BODY chest in inches per tag size (same data as the Landa Lister tool, checked online 13 Nov 2026).
BRAND_CHARTS = [
    (r"\bobey\b", "OBEY", {"S": (35, 37), "M": (38, 40), "L": (41, 43), "XL": (44, 46), "XXL": (47, 49)}),
    (r"american eagle|^ae$", "American Eagle", {"XS": (35, 36), "S": (37, 39), "M": (40, 42), "L": (43, 45), "XL": (46, 48), "XXL": (49, 51), "3XL": (52, 54)}),
    (r"bershka", "Bershka", {"XS": (33, 35.5), "S": (35.5, 37.8), "M": (37.8, 40.2), "L": (40.2, 42.5), "XL": (42.5, 44.9)}),
    (r"h\s*&\s*m|^hm$", "H&M", {"XS": (30.7, 33.9), "S": (33.9, 37), "M": (37, 40.2), "L": (40.2, 43.3), "XL": (43.3, 46.5), "XXL": (46.5, 49.6), "3XL": (49.6, 52.8)}),
    (r"quechua|decathlon", "Decathlon", {"XS": (33.1, 34.3), "S": (34.6, 35.8), "M": (36.2, 37.4), "L": (37.8, 40.6), "XL": (40.9, 44.5), "XXL": (44.9, 48.4), "3XL": (48.8, 53.1)}),
]
STD_CHART = {"XS": (33, 36), "S": (36, 38.5), "M": (38.5, 41), "L": (41, 44), "XL": (44, 47), "XXL": (47, 50), "3XL": (50, 53)}
KIDS_HEIGHT = {2: (92, 98), 3: (98, 104), 4: (104, 110), 5: (110, 116), 6: (116, 122), 7: (122, 128), 8: (128, 134), 9: (134, 140), 10: (140, 146), 11: (146, 152), 12: (152, 158), 13: (158, 164)}


def norm_size(z):
    u = str(z or "").upper().replace(" ", "").replace("2XL", "XXL").replace("XXXL", "3XL")
    return u if u in ADULT else ""


def brand_chart(brand):
    for rx, name, ch in BRAND_CHARTS:
        if re.search(rx, str(brand or "").strip(), re.I): return name, ch
    return "", None


def ease(it): return 6 if re.search(r"puffer|coat|jacket|leather|denim|parka|vest", it.get("category") or "", re.I) and not re.search(r"hood", it.get("category") or "", re.I) else 4


def fit_from_chest(pit, it=None):
    """Same rule as the Landa Lister tool: body chest = garment pit-to-pit x 2 minus ease, matched to the brand chart (else a standard chart)."""
    if not pit: return ""
    it = it or {}; body = pit * 2 - ease(it); ch = brand_chart(it.get("brand"))[1] or STD_CHART
    return min(ch, key=lambda k: 0 if ch[k][0] <= body <= ch[k][1] else min(abs(body - ch[k][0]), abs(body - ch[k][1])))


def fits_like(it):
    """'Fits like' size for adults: the seller's own call if given, else from the measured chest. One step away from the tag shows a range."""
    if it.get("fits"): return it["fits"]
    if it["gender"] == "Kids" or not it["meas"].get("chest"): return ""
    f = fit_from_chest(it["meas"]["chest"], it); t = str(it["size"]).upper().replace("2XL", "XXL")
    if t in ADULT and f in ADULT and abs(ADULT.index(t) - ADULT.index(f)) == 1:
        a, b = sorted((t, f), key=ADULT.index); return f"{a}-{b}"
    return f


def inch(v): return f"{v:g}\""


MEASURE_SVG = """<svg class="msvg" viewBox="0 0 600 560" role="img" aria-label="How we measure: chest, length, shoulder and sleeve"><defs><marker id="ma" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b8860b"/></marker></defs>
<path d="M250,48 Q300,98 350,48 L425,68 L565,328 L508,358 L412,200 L408,522 L192,522 L188,200 L92,358 L35,328 L175,68 Z" fill="#f6f3ec" stroke="#1d2b26" stroke-width="3" stroke-linejoin="round"/>
<g stroke="#b8860b" stroke-width="4" marker-start="url(#ma)" marker-end="url(#ma)"><line x1="180" y1="82" x2="420" y2="82"/><line x1="194" y1="215" x2="406" y2="215"/><line x1="232" y1="64" x2="232" y2="516"/><line x1="440" y1="78" x2="548" y2="320"/></g>
<g font-family="Inter,system-ui,sans-serif" font-size="25" font-weight="800" fill="#1d2b26" text-anchor="middle"><text x="310" y="122">{shoulder}</text><text x="310" y="255">{chest}</text><text transform="translate(272,400) rotate(-90)">{length}</text><text transform="translate(532,170) rotate(66)">{sleeve}</text></g></svg>"""


def measure_svg(m=None):
    m = m or {}
    lab = lambda k, n: f"{n} {inch(m[k])}" if m.get(k) else n
    return MEASURE_SVG.format(shoulder=lab("shoulder", "Shoulder"), chest=lab("chest", "Chest"), length=lab("length", "Length"), sleeve=lab("sleeve", "Sleeve"))


def chart_note(it):
    """No tape measurements yet: tell the shopper what the tag size normally fits, from the brand's chart or a standard chart."""
    t = norm_size(it["size"])
    if it["gender"] == "Kids" or not t:
        m = re.match(r"(\d+)", str(it["size"])); h = KIDS_HEIGHT.get(int(m.group(1))) if m and "Y" in str(it["size"]).upper() else None
        return f'<p class="chartnote">Kids size {esc(it["size"])} usually fits a child about {h[0]}–{h[1]} cm tall (standard EU kids sizing).</p>' if h else ""
    name, ch = brand_chart(it["brand"]); lo, hi = (ch or STD_CHART).get(t, (0, 0))
    if not lo: return ""
    cm = f"{round(lo * 2.54)}–{round(hi * 2.54)} cm"
    src = f"{esc(name)} size chart" if ch else "Standard size chart"
    return f'<p class="chartnote"><b>{src}:</b> size {t} fits a body chest of about {lo:g}–{hi:g}″ ({cm}).</p>'


FONT_DIR = Path("/usr/share/fonts/opentype/inter")
def _f(w, px):
    for name in (f"Inter-{w}.otf", "Inter-Bold.otf"):
        try: return ImageFont.truetype(str(FONT_DIR / name), px)
        except OSError: pass
    return ImageFont.load_default()


# Approximate flat garment measurements (inches) by size, used only when the item has no tape measurements.
GARMENT_MEN = {"XS": (26, 16.5, 24), "S": (27, 17.5, 24.5), "M": (28, 18.5, 25), "L": (29, 19.5, 25.5), "XL": (30, 20.5, 26), "XXL": (31, 21.5, 26.5), "3XL": (32, 22.5, 27)}
GARMENT_WOMEN = {"XS": (23, 14.5, 22.5), "S": (24, 15, 23), "M": (25, 15.5, 23.5), "L": (26, 16.5, 24), "XL": (27, 17, 24.5), "XXL": (28, 18, 25), "3XL": (29, 19, 25.5)}
KIDS_CHEST_CM = {2: 53, 3: 55, 4: 57, 5: 59, 6: 62, 7: 65, 8: 68, 9: 71, 10: 74, 11: 77, 12: 80, 13: 83}
KIDS_LETTER = {"XS": 4, "S": 5, "M": 7, "L": 9, "XL": 11, "XXL": 13}
EU_WOMEN = {"34": "XS", "36": "S", "38": "M", "40": "L", "42": "XL", "44": "XXL", "46": "3XL"}
HALF = lambda v: round(v * 2) / 2


def kids_age(it):
    s = str(it["size"]).upper(); m = re.match(r"(\d+)", s)
    if m and "Y" in s: return int(m.group(1))
    return KIDS_LETTER.get(norm_size(s))


def card_data(it):
    """What the size card shows: (measurements, exact?, big box label, big box value, source line, note line)."""
    m = {k: it["meas"][k] for k in ("chest", "length", "shoulder", "sleeve") if it["meas"].get(k)}
    if m:
        f = fits_like(it) or it["size"]; full = m.get("chest", 0) * 2
        return m, True, "FITS LIKE", f, "Source: Original measurement", \
            f"Measured flat in inches. Chest is armpit to armpit, so double it for the full round ({full:g}\")." if full else "Measured flat in inches."
    kid = it["gender"] == "Kids" or (re.search(r"\d+\s*-?\s*\d*\s*Y", str(it["size"]), re.I) is not None)
    if kid:
        a = kids_age(it) or 8; a = min(max(a, 2), 13)
        pit = HALF((KIDS_CHEST_CM[a] / 2.54 + 4) / 2)
        m = {"chest": pit, "length": HALF(14.5 + 0.85 * (a - 2)), "shoulder": HALF(10 + 0.55 * (a - 2)), "sleeve": HALF(11 + 1.0 * (a - 2))}
        h = KIDS_HEIGHT[a]
        return m, False, "FITS CHILD HEIGHT", f"{h[0]}-{h[1]} cm", "Source: International size chart (kids)", \
            f"≈ Approximate flat size for a usual {it['size']} piece. Exact size of this piece on WhatsApp."
    t = norm_size(it["size"]) or EU_WOMEN.get(str(it["size"]).strip(), "") or "L"
    name, ch = brand_chart(it["brand"]); src = ch if ch and t in ch else STD_CHART
    lo, hi = src[t]; body = (lo + hi) / 2
    ln, sh, sl = (GARMENT_WOMEN if it["gender"] == "Women" else GARMENT_MEN)[t]
    if ease(it) == 6: ln += 1  # jackets and coats run a little longer
    m = {"chest": HALF((body + ease(it)) / 2), "length": ln, "shoulder": sh, "sleeve": sl}
    source = f"Source: Brand measurement ({name} size chart)" if src is not STD_CHART else "Source: International size chart"
    return m, False, "FITS BODY CHEST", f'{lo:g}-{hi:g}"', source, \
        f"≈ Approximate flat size for a usual size {t}. Exact size of this piece on WhatsApp."


ANTON = Path(__file__).parent / "fonts" / "Anton-Regular.ttf"
LOGO_W = Path(__file__).parent / "logo-white.png"
def _a(px):
    try: return ImageFont.truetype(str(ANTON), px)
    except OSError: return _f("ExtraBold", px)


def size_image(it, out, photo=None):
    """Size card for every product (WAQAR, 13 Nov): photo, garment diagram, 4 measurement boxes, fit, tag size, and a
    small source line (measured from the item / brand size chart / standard sizes). No tape data -> approximate (≈) values."""
    W, H = 1080, 1350; G, BG, CR, MUT = (233, 196, 106), (18, 32, 27), (244, 234, 210), (201, 214, 209)
    m, exact, flab, fval, source, note = card_data(it)
    pre = "" if exact else "≈"
    im = Image.new("RGB", (W, H), BG)
    glow = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(glow); gd.ellipse((-500, -650, 820, 520), fill=55); gd.ellipse((700, 950, 1500, 1750), fill=28)
    glow = glow.filter(ImageFilter.GaussianBlur(160)); im.paste(Image.new("RGB", (W, H), G), (0, 0), glow)
    d = ImageDraw.Draw(im)
    try:
        lg = Image.open(LOGO_W).convert("RGBA"); lg.thumbnail((240, 80)); im.paste(lg, (60, 48), lg)
    except OSError: d.text((60, 60), CFG.get("storeName", ""), font=_f("ExtraBold", 36), fill="#ffffff")
    badge = "SIZE & MEASUREMENTS"; bf = _f("Black", 22) if (FONT_DIR / "Inter-Black.otf").exists() else _f("ExtraBold", 22)
    bw = d.textlength(badge, font=bf) + len(badge) * 3 + 40
    d.rounded_rectangle((W - 60 - bw, 52, W - 60, 100), 24, outline=G, width=2)
    x = W - 60 - bw + 20
    for ch_ in badge: d.text((x, 76), ch_, font=bf, fill=G, anchor="lm"); x += d.textlength(ch_, font=bf) + 3
    # title: brand in white, product name in gold, shrunk to fit one line
    b, n = it["brand"].upper(), it["name"].upper()
    if n.startswith(b): n = n[len(b):].strip()
    px = 74
    while px > 58 and d.textlength(f"{b} {n}", font=_a(px)) > 960: px -= 2
    while n and d.textlength(f"{b} {n}", font=_a(px)) > 960: n = " ".join(n.split()[:-1])
    while n.split() and n.split()[-1] in ("WITH", "AND", "&", "-", "IN", "OF", "FAUX"): n = " ".join(n.split()[:-1])
    tf = _a(px); d.text((60, 175), b, font=tf, fill="#ffffff", anchor="lm")
    d.text((60 + d.textlength(b + " ", font=tf), 175), n, font=tf, fill=G, anchor="lm")
    # product photo
    d.rounded_rectangle((60, 250, 460, 750), 22, fill="#ffffff")
    if photo and Path(photo).exists():
        p = Image.open(photo).convert("RGB"); p = ImageOps.contain(p, (400, 500), Image.LANCZOS)
        mask = Image.new("L", (400, 500), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, 399, 499), 22, fill=255)
        tile = Image.new("RGB", (400, 500), "#ffffff"); tile.paste(p, ((400 - p.width) // 2, (500 - p.height) // 2)); im.paste(tile, (60, 250), mask)
    # garment diagram (same outline as the website's how-we-measure picture), viewBox 600x560 at (480,240) scale 0.933
    s, ox, oy = 560 / 600, 480, 240
    P = lambda x, y: (ox + x * s, oy + y * s)
    neck = [P(250 + 100 * t, 48 + 100 * t * (1 - t)) for t in [i / 12 for i in range(13)]]
    pts = neck + [P(*q) for q in ((425, 68), (565, 328), (508, 358), (412, 200), (408, 522), (192, 522), (188, 200), (92, 358), (35, 328), (175, 68))]
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov); od.polygon(pts, fill=(255, 255, 255, 16)); im.paste(ov, (0, 0), ov)
    d.line(pts + [pts[0]], fill=CR, width=3, joint="curve")
    d.line([P(188, 200), P(192, 522)], fill=(80, 92, 86), width=2); d.line([P(412, 200), P(408, 522)], fill=(80, 92, 86), width=2)
    import math
    def arrow(a, b_):
        (x1, y1), (x2, y2) = P(*a), P(*b_); d.line((x1, y1, x2, y2), fill=G, width=4)
        ang = math.atan2(y2 - y1, x2 - x1)
        for (x, y, k) in ((x1, y1, ang + math.pi), (x2, y2, ang)):
            d.polygon([(x + 4 * math.cos(k), y + 4 * math.sin(k)), (x - 14 * math.cos(k) + 8 * math.sin(k), y - 14 * math.sin(k) - 8 * math.cos(k)), (x - 14 * math.cos(k) - 8 * math.sin(k), y - 14 * math.sin(k) + 8 * math.cos(k))], fill=G)
    def pill(c, txt, rot=0):
        pf = _f("ExtraBold", 26); tw = int(max(116, d.textlength(txt, font=pf) + 36))
        pl = Image.new("RGBA", (tw, 44), (0, 0, 0, 0)); pd = ImageDraw.Draw(pl); pd.rounded_rectangle((0, 0, tw - 1, 43), 22, fill=G)
        pd.text((tw / 2, 22), txt, font=pf, fill=BG, anchor="mm"); pl = pl.rotate(-rot, expand=True, resample=Image.BICUBIC)
        x, y = P(*c); im.paste(pl, (int(x - pl.width / 2), int(y - pl.height / 2)), pl)
    v = lambda k: f'{pre}{m[k]:g}"'
    if m.get("shoulder"): arrow((180, 80), (420, 80)); pill((300, 118), v("shoulder"))
    if m.get("chest"): arrow((194, 215), (406, 215)); pill((300, 252), v("chest"))
    if m.get("length"): arrow((232, 64), (232, 516)); pill((232, 400), v("length"), -90)
    if m.get("sleeve"): arrow((440, 78), (548, 320)); pill((494, 199), v("sleeve"), 66)
    # measurement tiles
    tiles = [(lab, m[k]) for k, lab in (("chest", "CHEST"), ("length", "LENGTH"), ("shoulder", "SHOULDER"), ("sleeve", "SLEEVE")) if m.get(k)]
    gap = 16; tw = (960 - gap * (len(tiles) - 1)) / max(1, len(tiles))
    for i, (lab, val) in enumerate(tiles):
        x0 = 60 + i * (tw + gap); d.rounded_rectangle((x0, 800, x0 + tw, 970), 20, fill=(38, 51, 46), outline=(130, 118, 76), width=2)
        d.text((x0 + tw / 2, 834), lab, font=_f("ExtraBold", 22), fill=G, anchor="mm")
        d.text((x0 + tw / 2, 888), f'{pre}{val:g}"', font=_a(68), fill="#ffffff", anchor="mm")
        d.text((x0 + tw / 2, 940), f"{pre}{round(val * 2.54)} cm", font=_f("SemiBold", 22), fill=MUT, anchor="mm")
    # fit + tag size
    d.rounded_rectangle((60, 1010, 585, 1135), 20, fill=G)
    d.text((86, 1040), flab, font=_f("ExtraBold", 22), fill=BG, anchor="lm")
    fv = str(fval); fpx = 58
    while fpx > 30 and d.textlength(fv, font=_a(fpx)) > 480: fpx -= 2
    d.text((86, 1090), fv, font=_a(fpx), fill=BG, anchor="lm")
    d.rounded_rectangle((601, 1010, 1020, 1135), 20, outline=(150, 160, 155), width=2)
    d.text((628, 1040), "TAG SIZE", font=_f("ExtraBold", 22), fill=G, anchor="lm")
    d.text((628, 1090), str(it["size"] or "-"), font=_a(58), fill="#ffffff", anchor="lm")
    # note + small source line
    nf = _f("Medium", 23); words, lines = note.split(), [""]
    for w_ in words:
        t_ = (lines[-1] + " " + w_).strip()
        if d.textlength(t_, font=nf) <= 960: lines[-1] = t_
        else: lines.append(w_)
    for i, l in enumerate(lines[:2]): d.text((60, 1168 + i * 30), l, font=nf, fill=MUT, anchor="lm")
    d.text((60, 1170 + len(lines[:2]) * 30), f"{source}  ·  {it['sku']}", font=_f("SemiBold", 19), fill=(150, 165, 158), anchor="lm")
    d.rectangle((0, 1250, W, H), fill=G)
    d.text((60, 1300), CFG.get("domain", "abcthrift.store"), font=_f("ExtraBold", 38), fill=BG, anchor="lm")
    wa = CFG.get("whatsapp", ""); wa = f"{wa[:4]} {wa[4:]}" if wa.isdigit() and len(wa) == 11 else wa
    d.text((W - 60, 1300), f"WhatsApp {wa}", font=_f("ExtraBold", 30), fill=BG, anchor="rm")
    im.save(out, quality=88, optimize=True)


def size_block(it):
    m = it["meas"]; f = fits_like(it)
    rows = "".join(f'<tr><th>{esc(MEAS_LABEL[k])}</th><td><b>{inch(v)}</b> <span class="muted">{round(v * 2.54)} cm</span></td></tr>' for k, v in m.items())
    top = f'<div class="szrow"><div><small>Tag size</small><b>{esc(it["size"] or "-")}</b></div>{f"<div class=fit><small>Fits like</small><b>{esc(f)}</b></div>" if f else ""}</div>'
    if not m:
        return f'{top}{chart_note(it)}<p>This piece has not been hand-measured yet. Send the item code {esc(it["sku"])} on WhatsApp and we will measure it for you. <a href="../size-guide.html">Size guide</a></p>'
    full = f' Chest all round is about {inch(round(m["chest"] * 2))}.' if m.get("chest") else ""
    show = {k: m[k] for k in ("chest", "length", "shoulder", "sleeve") if m.get(k)}
    pic = f'<figure class="mfig">{measure_svg(show)}<figcaption>How we measure: the piece is laid flat and measured in inches.</figcaption></figure>' if show else ""
    return f"""{top}<table class="mtab">{rows}</table>
<p>Measured by hand, laid flat.{full} Lay a top that fits you well flat and compare. <a href="../size-guide.html">Size guide</a>. Still unsure? Ask on WhatsApp.</p>{pic}"""


OVERRIDES = json.loads((Path(__file__).parent / "size_overrides.json").read_text()) if (Path(__file__).parent / "size_overrides.json").exists() else {}


def swap_size(v, old, new):
    """Replace 'Size L' style mentions in listing text when the size is corrected (mirror of the tool's swapSize)."""
    if isinstance(v, str): return re.sub(rf"(\bsize:?\s*\*?){re.escape(old)}(?![\w-])", rf"\g<1>{new}", v, flags=re.I)
    if isinstance(v, list): return [({**x, "value": new if x.get("value") == old else swap_size(x.get("value"), old, new)} if isinstance(x, dict) and re.match(r"(?i)^size", x.get("label", "")) else swap_size(x, old, new)) for x in v]
    if isinstance(v, dict): return {k: swap_size(x, old, new) for k, x in v.items()}
    return v


def load_items(items_dir):
    items = []
    for f in sorted(Path(items_dir).glob("*.json")):
        d = json.loads(f.read_text()); d = d.get("data", d)
        if d.get("status") not in LIVE: continue
        o = OVERRIDES.get(d.get("sku"), {})
        if o:
            if o.get("size") and o["size"] != d.get("size"): d = {**d, "copy": swap_size(d.get("copy") or {}, d.get("size") or "", o["size"])}
            d = {**d, **{k: v for k, v in o.items() if k in ("size", "fitsLike")}, "meas": {**(d.get("meas") or {}), **o.get("meas", {})}}
        c = d.get("copy") or {}
        brand = (d.get("brand") or "").strip() or CFG["houseLabel"]
        if brand.islower(): brand = brand.title()
        specs = [s for s in (c.get("specs") or []) if s.get("value") and not re.match(r"(?i)^(sku|condition|grade|delivery|price)$", s.get("label", "")) and not NEG.search(str(s["value"]))]
        raw = d.get("meas") or {}
        meas = {k: raw[k] for k in MEAS_KEYS if raw.get(k)}
        retail = d.get("retailPkr") or 0
        items.append({
            "sku": d["sku"], "status": d["status"], "price": d.get("price") or 0, "retailPkr": retail if retail > (d.get("price") or 0) else 0,
            "retailUsd": d.get("retailUsd") or (round(retail / 280) if retail else 0), "title": c.get("title") or f"{brand} {d.get('category', '')}",
            "brand": brand, "name": clean_name(c.get("title") or "", brand, d.get("size") or "", d.get("category") or "Clothing"),
            "origin": ((d.get("ai") or {}).get("identified") or {}).get("brand_origin") or "", "hl": highlights(d), "category": d.get("category") or "Clothing", "gender": d.get("gender") or "", "size": d.get("size") or "",
            "color": d.get("color") or "", "cond": cond_label(d), "fix": fix_note(d), "desc": positive(c.get("description_en")),
            "specs": specs, "meas": meas, "fits": (d.get("fitsLike") or "").strip(), "images": d.get("images") or [], "kinds": d.get("photoKind") or {}, "created": d.get("createdAt") or "", "updated": d.get("updatedAt") or d.get("createdAt") or "",
            "material": next((s["value"] for s in specs if re.match(r"(?i)^(material|shell|fabric)$", s.get("label", ""))), ""),
        })
    return sorted(items, key=lambda i: i["created"], reverse=True)


# ---------- pages ----------
CSS = (Path(__file__).parent / "store.css").read_text()
JS = (Path(__file__).parent / "site.js").read_text()
# Shared CSS / JS are separate files named by content hash: the browser downloads them once and reuses them on
# every page (they used to be inlined, ~45 KB extra on every page view), and a new build always loads fresh copies.
_h = lambda t: hashlib.sha1(t.encode()).hexdigest()[:10]
CSS_FILE = f"store.{_h(CSS)}.css"; JS_FILE = f"site.{_h(JS)}.js"
ZOOM_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
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
    return round((1 - DEAL["price"] / it["price"]) * 100) if DEAL.get("sku") == it["sku"] else 0


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


# ---------- SEO: product types, collection (landing) pages ----------
JACKET_RX = re.compile(r"(?i)jacket|puffer|parka|coat|vest|gilet|bomber|softshell|windbreaker|anorak")
PUFFER_RX = re.compile(r"(?i)puffer|quilted|padded|parka")
KIND_ONE = {"Jackets": "jacket", "Hoodies": "hoodie", "Sweatshirts": "sweatshirt"}


def kind(it):
    """What the item really is, from its title (the tool's category is sometimes off, e.g. a hoodie saved as Puffer Jacket)."""
    t = f"{it['title']} {it['name']}"
    if re.search(r"(?i)hoodie", t): return "Hoodies"
    if JACKET_RX.search(t) or it["category"] in ("Coat", "Puffer Jacket", "Denim Jacket", "Leather Jacket", "Jacket"):
        return "Sweatshirts" if re.search(r"(?i)sweatshirt|pullover|crew ?neck", t) and not JACKET_RX.search(t) else "Jackets"
    if re.search(r"(?i)sweatshirt|pullover|crew ?neck|half-zip|quarter-zip|sweater|cardigan|polo", t) or it["category"] in ("Sweatshirt", "Polo", "Sweater"): return "Sweatshirts"
    return it["category"]


def full_name(it):
    n = f"{it['brand']} {it['name']}" if it["brand"].lower() not in it["name"].lower() else it["name"]
    if len(n) > 55 and "," in n: n = n.split(",")[0]  # some tool titles are long, cut-off feature lists
    return clip(n, 70).rstrip("…")


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("&", "").replace("à", "a").replace("ï", "i")).strip("-")


# slug, h1, <title>, meta description, intro, filter. Pages with no live items are not built.
COLLECTIONS = [
    ("thrift-jackets-pakistan", "Thrift jackets in Pakistan", "Thrift Jackets in Pakistan | Pre-loved Branded Jackets",
     "Shop pre-loved branded jackets, puffers, coats and vests online in Pakistan. Hand-picked in Sahiwal, real photos, cash on delivery and 7-day returns.",
     "Branded winter jackets for a fraction of the new price. Every jacket here is a one-off pre-loved piece: puffers, parkas, coats, softshells, bombers and gilets from international labels, hand-picked in Sahiwal, washed, checked and photographed for real. Order online and pay cash on delivery anywhere in Pakistan.",
     lambda i: kind(i) == "Jackets"),
    ("puffer-jackets", "Pre-loved puffer jackets", "Puffer Jackets in Pakistan | Pre-loved Branded Puffers",
     "Warm pre-loved puffer, quilted and padded jackets from international brands. Men, women and kids. Cash on delivery all over Pakistan.",
     "Quilted, padded and puffer jackets for Pakistani winters, from brands like {brands}. Each one is a single pre-loved piece in checked condition, so the size and colour you see is the one you get.",
     lambda i: kind(i) == "Jackets" and PUFFER_RX.search(i["title"] + " " + i["name"])),
    ("used-branded-hoodies", "Used branded hoodies", "Used Branded Hoodies in Pakistan | Pre-loved Hoodies",
     "Pre-loved branded hoodies. Zip-up and pullover hoodies for men, women and kids, with cash on delivery in Pakistan.",
     "Pullover and zip-up hoodies from international brands, pre-loved and checked by hand. Brands in stock: {brands}. Warm, comfortable and priced well below new, with cash on delivery all over Pakistan.",
     lambda i: kind(i) == "Hoodies"),
    ("branded-sweatshirts", "Branded sweatshirts", "Branded Sweatshirts in Pakistan | Pre-loved Sweatshirts",
     "Pre-loved branded sweatshirts, half-zips and crewnecks for men, women and kids. Cash on delivery all over Pakistan.",
     "Crewnecks, half-zips and quarter-zips from international labels like {brands}. Every sweatshirt is a one-off pre-loved piece, washed and checked, with real photos and an honest condition grade.",
     lambda i: kind(i) == "Sweatshirts"),
    ("mens-thrift-clothes", "Men's thrift clothes", "Men's Thrift Clothes in Pakistan | Pre-loved Branded Menswear",
     "Pre-loved branded jackets, hoodies and sweatshirts for men. Hand-picked in Sahiwal, cash on delivery all over Pakistan, 7-day returns.",
     "Branded menswear at thrift prices: puffer jackets, coats, hoodies and sweatshirts in sizes {sizes}, from {brands}. One piece of each, so check the size and measurements and order before someone else does.",
     lambda i: in_gender(i, "Men")),
    ("womens-thrift-clothes", "Women's thrift clothes", "Women's Thrift Clothes in Pakistan | Pre-loved Branded Womenswear",
     "Pre-loved branded coats, puffer jackets and sweatshirts for women. Real photos, cash on delivery all over Pakistan, 7-day returns.",
     "Warm coats, parkas, puffers and sweatshirts for women from international brands like {brands}, pre-loved and hand-checked. Cash on delivery anywhere in Pakistan.",
     lambda i: in_gender(i, "Women")),
    ("kids-winter-clothes", "Kids winter clothes", "Kids Winter Clothes in Pakistan | Pre-loved Branded Kidswear",
     "Pre-loved branded kids jackets, hoodies and sweatshirts from ages 2 to 14. Low prices, cash on delivery all over Pakistan.",
     "Branded winter wear for kids, from toddler sizes to 14 years: jackets, hoodies and sweatshirts from labels like {brands}. Kids grow fast, so pre-loved makes sense.",
     lambda i: i["gender"] == "Kids"),
    ("under-1000", "Branded clothes under Rs 1,000", "Branded Clothes Under Rs 1,000 | Thrift Store Pakistan",
     "Pre-loved branded hoodies, sweatshirts and jackets under Rs 1,000. Cash on delivery all over Pakistan.",
     "Original-label pre-loved clothes for under a thousand rupees. Add two or more items to your bag for a bundle discount.",
     lambda i: i["price"] < 1000),
]
COLL = []    # [(slug, h1, n_live)] of built collection pages, filled in main()
BRANDS = {}  # brand slug -> brand name, for brands with 2+ items on the site


def coll_url(up, slug):
    return f"{up}{slug}.html" if any(c[0] == slug for c in COLL) else ""


def gender_page(g):
    return {"Men": "mens-thrift-clothes", "Women": "womens-thrift-clothes", "Kids": "kids-winter-clothes"}[g]


def kind_page(k):
    return {"Jackets": "thrift-jackets-pakistan", "Hoodies": "used-branded-hoodies", "Sweatshirts": "branded-sweatshirts"}.get(k, "")


def g_link(up, g, **q):
    """Static landing page for a gender when it exists (crawlable), else the filtered shop."""
    return (coll_url(up, gender_page(g)) if not q else "") or shop_link(up, g=g, **q)


def social_links():
    s = CFG.get("social") or {}
    return "".join(f'<a href="{esc(u)}" target="_blank" rel="noopener">{n}</a>' for n, u in (("Instagram", s.get("instagram")), ("Facebook", s.get("facebook")), ("TikTok", s.get("tiktok"))) if u)


FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"


def clip(text, n):
    t = re.sub(r"\s+", " ", str(text or "")).strip()
    return t if len(t) <= n else t[:n - 1].rsplit(" ", 1)[0].rstrip(",;:-") + "…"


def meta_pixel():
    # Meta (Facebook / Instagram) Pixel base code, on every page when site.json has "metaPixel" (the 15-16 digit dataset ID from Events Manager).
    # The events (ViewContent, AddToCart, InitiateCheckout, Purchase, Search, Lead, Contact) are sent by site.js.
    pid = re.sub(r"\D", "", str(CFG.get("metaPixel") or ""))
    if not pid: return ""
    return ("<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};"
            "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];"
            "s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');"
            f"fbq('init','{pid}');fbq('track','PageView');</script>"
            f'<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id={pid}&amp;ev=PageView&amp;noscript=1"></noscript>')


def page(title, desc, body, depth=0, image=None, canonical="", wa=None, extra="", ld=None, noindex=False, root=None, og_type="website", meta=None, img_alt=""):
    # root="/" for pages GitHub Pages can serve at any path (404.html), so links work from /p/<missing>.html too
    up = root if root is not None else "../" * depth; base = CFG["siteUrl"].rstrip("/")
    dl = CFG.get("delivery") or {}
    tp = {"root": up, "wa": wa_digits(), "store": CFG["storeName"], "deal": DEAL, "bundle": CFG.get("bundle", []), "voucher": CFG.get("voucher"),
          "fee": dl.get("fee", 0), "freeOver": dl.get("freeOver", 0), "api": CFG.get("apiUrl") or CFG.get("offersUrl") or "", "camp": CAMP}
    v = CFG.get("voucher")
    ann = list(CFG.get("announcements") or ["Cash on delivery all over Pakistan"])
    nav = "".join(f'<div class="nv"><a href="{g_link(up, g)}">{g}</a>' + (f'<div class="nv-dd"><a href="{g_link(up, g)}">All {g.lower()}</a>' + "".join(f'<a href="{esc(shop_link(up, g=g, cat=c))}">{esc(c)}</a>' for c in NAV.get(g, [])) + "</div>" if NAV.get(g) else "") + "</div>" for g in GENDERS)
    drawer = "".join(f'<details{" open" if not i else ""}><summary>{g}</summary><a href="{g_link(up, g)}">All {g.lower()}</a>' + "".join(f'<a href="{esc(shop_link(up, g=g, cat=c))}">{esc(c)}</a>' for c in NAV.get(g, [])) + "</details>" for i, g in enumerate(GENDERS))
    help_links = "".join(f'<a href="{up}{s}.html">{esc(t)}</a>' for s, t in INFO)
    soc = social_links()
    pop = "".join(f'<a href="{up}{c}.html">{esc(h)}</a>' for c, h, _ in COLL) + (f'<a href="{up}brands.html">All brands</a>' if BRANDS else "")
    base_url = base + "/" + canonical
    m = meta or {}
    robots = '<meta name="robots" content="noindex, follow">' if noindex else f'<link rel="canonical" href="{esc(base_url)}"><meta name="robots" content="index, follow, max-image-preview:large">'
    og_img = base + "/" + (image or "og-image.png")
    extra_meta = "".join(f'<meta property="{esc(k)}" content="{esc(v)}">' for k, v in m.items() if v not in (None, ""))
    phone = esc(CFG["whatsapp"].replace(" ", ""))
    ld_tags = "".join(f'<script type="application/ld+json">{json.dumps(x).replace("</", "<\\/")}</script>' for x in (ld or []))
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(clip(desc, 158))}">{robots}
<meta property="og:type" content="{og_type}"><meta property="og:site_name" content="{esc(CFG['storeName'])}"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(clip(desc, 200))}">
<meta property="og:url" content="{esc(base_url)}"><meta property="og:locale" content="en_PK"><meta property="og:image" content="{esc(og_img)}"><meta property="og:image:alt" content="{esc(img_alt or title)}">{extra_meta}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(clip(desc, 200))}"><meta name="twitter:image" content="{esc(og_img)}"><meta name="theme-color" content="#15201d">{f'<meta name="google-site-verification" content="{esc(CFG["googleVerification"])}">' if CFG.get("googleVerification") else ''}
<link rel="icon" href="{up}favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{FONTS}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="{FONTS}"></noscript><link rel="stylesheet" href="{up}assets/{CSS_FILE}">{ld_tags}
<script>window.TP={json.dumps(tp).replace("</", "<\\/")};</script>{meta_pixel()}</head><body>
{f'<a class="campbar camp" href="{up}deals.html"><b>{esc(CAMP["name"])}</b><span>{CAMP["pct"]}% off everything</span><span class="cb-t">Ends in <time data-camp-left>--</time></span><i>Shop now →</i></a>' if CAMP else ''}<div class="topbar"><div class="ann" id="ann">{''.join(f'<span{" class=on" if not i else ""}>{esc(a)}</span>' for i, a in enumerate(ann))}</div>{f'<button type="button" class="tb-v" data-voucher>Free {rs(v["amount"])} voucher</button>' if v else ''}</div>
<header class="hd"><button type="button" class="hd-ic hd-menu" data-menu-open aria-label="Open menu">{SVG['menu']}</button>
<a class="logo" href="{up}index.html"><span class="mark">{esc(CFG["storeName"][:1])}</span><span>{logo_text()}</span></a>
<nav class="mainnav" aria-label="Main">{nav}<a href="{up}deals.html" class="nav-deals">{esc(CAMP["name"]) if CAMP else "Deals"}</a><a href="{up}index.html?sort=new#shop">New arrivals</a><a href="{up}index.html#deal" class="dl">Deal of the Day</a><a href="{coll_url(up, 'under-1000') or shop_link(up, max=999)}">Under Rs 1,000</a></nav>
<div class="hd-act"><a class="hd-ic" href="{up}index.html?find=1#shop" aria-label="Search">{SVG['search']}</a><a class="hd-ic" href="{up}wishlist.html" aria-label="Wishlist">{SVG['heart']}<span class="bag-n" data-wish-n hidden>0</span></a>
<button type="button" class="hd-ic hd-bag" data-bag-open aria-label="Open bag">{SVG['bag']}<span class="bag-n" id="bag-n" hidden>0</span></button></div></header>
<aside class="menu" id="menu" hidden aria-label="Menu"><div class="menu-in"><div class="bag-hd"><b>Menu</b><button type="button" data-menu-close aria-label="Close">×</button></div>
<a class="menu-top nav-deals" href="{up}deals.html">{esc(CAMP["name"]) if CAMP else "Deals & offers"}</a><a class="menu-top" href="{up}index.html?sort=new#shop">New arrivals</a><a class="menu-top dl" href="{up}index.html#deal">Deal of the Day</a><a class="menu-top" href="{coll_url(up, 'under-1000') or shop_link(up, max=999)}">Under Rs 1,000</a>
{drawer}{f'<details><summary>Popular</summary>{pop}</details>' if pop else ''}<details><summary>Shop by condition</summary>{''.join(f'<a href="{esc(shop_link(up, cond=c))}">{esc(c)}</a>' for c in CONDS)}</details>
<details><summary>Help</summary>{help_links}</details>
<a class="buy" href="{esc(order_link())}" target="_blank" rel="noopener">{ICON}Chat on WhatsApp</a></div></aside>
<main>{body}</main>
<footer class="ft"><div class="ft-in"><div><strong>{logo_text()}</strong><p>{esc(CFG['tagline'])}</p><p class="ft-soc">{soc or (esc('Instagram, Facebook, TikTok: ' + CFG['handle']) if CFG.get('handle') else '')}</p></div>
<div><strong>Shop</strong><p class="ft-links">{''.join(f'<a href="{g_link(up, g)}">{g}</a>' for g in GENDERS)}<a href="{up}index.html?sort=new#shop">New arrivals</a>{pop}<a href="{up}wishlist.html">Wishlist</a></p></div>
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
<script src="{up}assets/{JS_FILE}"></script>{extra}</body></html>"""


def bag_data(it):
    return esc(json.dumps({"sku": it["sku"], "b": it["brand"], "n": it["name"], "p": it["price"], "s": it["size"], "i": f"img/{it['sku']}-1.jpg" if it["images"] else ""}))


def price_html(it, cls="cp"):
    # The regular price is the only "was" price we ever strike through (the AI retail estimate is not an original price).
    d = DEAL.get("sku") == it["sku"]
    out = f'<span class="{cls}{" dl-reg" if d else ""}{" camp-reg" if CAMP else ""}"><b>{rs(it["price"])}</b></span>'
    if CAMP: out += f'<span class="{cls} camp{" dl-reg" if d else ""}"><b>{rs(camp_price(it["price"]))}</b><s>{rs(it["price"])}</s><em>-{CAMP["pct"]}%</em></span>'
    if d: out += f'<span class="{cls} dl"><b>{rs(DEAL["price"])}</b><s>{rs(it["price"])}</s></span>'
    return out


AI_KINDS = ("studio", "street")


def alt_text(it, n=0):
    bits = [full_name(it), it["color"].lower() if it["color"] and it["color"].lower() not in it["name"].lower() else "", f"size {it['size']}" if it["size"] else "", f"for {it['gender'].lower()}" if it["gender"] in GENDERS else ""]
    return ", ".join(b for b in bits if b) + (f" (photo {n})" if n > 1 else "")
AI_BADGE = '<span class="b-ai" title="AI-made preview of this exact item. See the real photos on the product page.">AI preview</span>'

def card(it, up=""):
    img = f'{up}img/t/{it["sku"]}-1.jpg' if it["images"] else ""
    img2 = f'{up}img/t/{it["sku"]}-2.jpg' if it.get("n_imgs", 0) > 1 else ""
    sold = it["status"] == "Sold"
    badge = '<span class="b-sold">Sold out</span>' if sold else ('<span class="b-new">Just in</span>' if it.get("fresh") else '')
    if CAMP and not sold: badge += f'<span class="b-camp camp">{esc(CAMP["name"].split()[0])} · -{CAMP["pct"]}%</span>'
    return f"""<article class="card{' is-sold' if sold else ''}" data-sku="{esc(it['sku'])}" data-cat="{esc(it['category'])}" data-g="{esc(it['gender'])}" data-size="{esc(it['size'])}" data-brand="{esc(it['brand'])}" data-cond="{esc(it['cond'])}" data-price="{it['price']}" data-new="{esc(it['created'])}" data-q="{esc((it['title'] + ' ' + it['brand'] + ' ' + it['category'] + ' ' + it['color'] + ' ' + it['sku']).lower())}">
<a class="cl" href="{up}p/{esc(it['sku'])}.html"><div class="ci">{f'<img src="{img}" alt="{esc(alt_text(it))}" loading="lazy" decoding="async" width="600" height="600">' if img else ''}{f'<img class="alt" src="{img2}" alt="" loading="lazy" decoding="async" width="600" height="600">' if img2 else ''}{badge}{AI_BADGE if 1 in it.get("ai_idx", ()) else ''}{'<span class="b-deal dl">Deal of the Day</span>' if DEAL.get('sku') == it['sku'] and not sold else ''}{f'<span class="b-size">{esc(it["size"])}</span>' if it['size'] else ''}</div>
<div class="cb"><span class="cbrand">{esc(it['brand'])} <small>({esc(it['sku'])})</small></span><span class="ct">{esc(it['name'])}</span>
<span class="cmeta"><span class="cond">{esc(it['cond'])}</span>{'' if sold else '<span>Only 1</span>'}</span>{price_html(it)}</div></a>
<button type="button" class="cwish" data-wish="{bag_data(it)}" aria-label="Save {esc(it['name'])} to wishlist">{SVG['heart']}</button>
{'' if sold else f'<button type="button" class="cadd" data-add="{bag_data(it)}" aria-label="Add {esc(it["name"])} to bag">+</button>'}</article>"""


OFFER_H = (CFG.get("offers") or {}).get("hours", 24); HOLD_H = (CFG.get("offers") or {}).get("holdHours", 24)  # must match WINDOW_H / HOLD_H in offers/Code.gs


def offer_box(it):
    mn = -(-int(it["price"] * .6) // 50) * 50
    if not (CFG.get("apiUrl") or CFG.get("offersUrl")):
        msg = urllib.parse.quote(f"Hi! My offer for {it['title']} ({it['sku']}): Rs ")
        return f'<a class="offer-btn" href="https://wa.me/{wa_digits()}?text={msg}" target="_blank" rel="noopener">Make an offer</a>'
    return f"""<section class="offer" id="offer" data-sku="{esc(it['sku'])}" data-price="{it['price']}" data-min="{mn}">
<div class="o-hd"><div><b>Make an offer</b><span class="o-sub" id="o-sub">Name your price. {OFFER_H} hours after the first offer, the highest offer wins the item, unless someone buys it at full price first. The winner has {HOLD_H} hours to complete the order, otherwise the item goes back to its normal price.</span></div><span class="o-timer" id="o-timer" hidden></span></div>
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
    free = f", free on orders of {rs(d['freeOver'])}+" if d.get("fee") and d.get("freeOver") else ""
    return f"{fee}{free}. {d.get('days', '')}".strip()


def product_ld(it, n_imgs):
    base = CFG["siteUrl"].rstrip("/"); url = f"{base}/p/{it['sku']}.html"
    ld = {"@context": "https://schema.org", "@type": "Product", "@id": url + "#product", "name": full_name(it), "sku": it["sku"], "mpn": it["sku"], "url": url,
          "image": [f"{base}/img/{it['sku']}-{i}.jpg" for i in range(1, n_imgs + 1)], "description": " ".join(x for x in (it["desc"] or it["title"], seo_blurb(it)) if x),
          "brand": {"@type": "Brand", "name": it["brand"]}, "itemCondition": "https://schema.org/UsedCondition", "category": f"Apparel & Accessories > Clothing > {kind(it)}",
          "offers": {"@type": "Offer", "price": it["price"], "priceCurrency": "PKR", "url": url, "priceValidUntil": (datetime.now(timezone.utc) + timedelta(days=60)).strftime("%Y-%m-%d"),
                     "availability": "https://schema.org/SoldOut" if it["status"] == "Sold" else "https://schema.org/InStock",
                     "itemCondition": "https://schema.org/UsedCondition", "seller": {"@type": "Organization", "@id": base + "/#store", "name": CFG["storeName"]},
                     "shippingDetails": shipping_ld(it["price"]), "hasMerchantReturnPolicy": return_ld()}}
    if it["color"]: ld["color"] = it["color"]
    if it["size"]: ld["size"] = it["size"]
    if it["material"]: ld["material"] = it["material"]
    sg = {"Men": "male", "Women": "female", "Unisex": "unisex"}.get(it["gender"])
    if sg: ld["audience"] = {"@type": "PeopleAudience", "suggestedGender": sg, "suggestedMinAge": 13}
    elif it["gender"] == "Kids": ld["audience"] = {"@type": "PeopleAudience", "suggestedGender": "unisex", "suggestedMaxAge": 13}
    return ld


def shipping_ld(price):
    d = CFG.get("delivery") or {}
    fee = 0 if d.get("freeOver") and price >= d["freeOver"] else d.get("fee", 0)
    return {"@type": "OfferShippingDetails", "shippingRate": {"@type": "MonetaryAmount", "value": fee, "currency": "PKR"},
            "shippingDestination": {"@type": "DefinedRegion", "addressCountry": "PK"},
            "deliveryTime": {"@type": "ShippingDeliveryTime", "handlingTime": {"@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY"},
                             "transitTime": {"@type": "QuantitativeValue", "minValue": 1, "maxValue": 5, "unitCode": "DAY"}}}


def return_ld():
    return {"@type": "MerchantReturnPolicy", "applicableCountry": "PK", "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": CFG.get("returns", {}).get("days", 7), "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/ReturnShippingFees", "merchantReturnLink": CFG["siteUrl"].rstrip("/") + "/returns.html"}


def product_page(it, all_items, n_imgs):
    sku = it["sku"]; sold = it["status"] == "Sold"; deal = DEAL.get("sku") == sku and not sold
    imgs = [f"../img/{sku}-{i}.jpg" for i in range(1, n_imgs + 1)] + [f"../img/sz/{sku}.jpg"]
    related = [o for o in all_items if o["sku"] != sku and o["status"] != "Sold" and (o["category"] == it["category"] or o["gender"] == it["gender"])][:4]
    alt = it["brand"] + " " + it["name"]
    ai = it.get("ai_idx", set())
    gimg = lambda i, s: f'<img src="{s}" alt="{esc(f"{it['name']} size and measurements card" if "/sz/" in s else alt_text(it, i + 1))}{" (AI preview)" if i + 1 in ai else ""}" {'width="1080" height="1350"' if "/sz/" in s else 'width="1200" height="1200"'}{" loading=lazy decoding=async" if i else " fetchpriority=high"}>'
    gallery = "".join(f'<figure class="gi{" gai" if i + 1 in ai else ""}" data-i="{i}">{gimg(i, s)}{AI_BADGE if i + 1 in ai else ""}</figure>' for i, s in enumerate(imgs))
    thumbs = "".join(f'<button type="button" data-i="{i}" aria-label="Photo {i + 1}"{" aria-current=true" if not i else ""}><img src="{s.replace("/img/", "/img/t/")}" alt="" loading="lazy" width="80" height="80"></button>' for i, s in enumerate(imgs)) if len(imgs) > 1 else ""
    details = [("Brand", it["brand"]), ("Brand origin", it["origin"]), ("Category", it["category"]), ("For", it["gender"]), ("Size", it["size"]), ("Colour", it["color"])] + [(s["label"], s["value"]) for s in it["specs"] if s["label"].lower() not in ("brand", "size", "color", "colour", "gender", "category")]
    seen = set(); details = [(k, v) for k, v in details if v and not (k.lower() in seen or seen.add(k.lower()))]
    save = it["retailPkr"] - it["price"] if it["retailPkr"] else 0
    wa = order_link(it)
    deal_href = (f' data-deal-href="{esc(order_link(it, DEAL["price"]))}"' if deal else "") + (f' data-camp-href="{esc(order_link(it, camp_price(it["price"]), CAMP["name"]))}"' if CAMP else "")
    ask = f'<a class="ask" href="{esc(wa)}"{deal_href} target="_blank" rel="noopener">{ICON}Ask or order on WhatsApp</a>'
    buy = f'<button type="button" class="buy" data-buy="{bag_data(it)}">Buy now · Cash on delivery</button>'
    hl = "".join(f"<li>{esc(h)}</li>" for h in it["hl"])
    g = it["gender"] if it["gender"] in GENDERS else ""
    k = kind(it); kp = coll_url("../", kind_page(k)); bp = brand_url("../", it["brand"])
    crumb_list = [("Home", "index.html")] + ([(g, g_link("", g))] if g else []) + [(k, kind_page(k) + ".html" if kp else shop_link(**({"g": g} if g else {}), cat=it["category"]))]
    crumbs = " / ".join(f'<a href="../{esc(u)}">{esc(n)}</a>' for n, u in crumb_list) + f' / <span>{esc(sku)}</span>'
    more = [f'<a href="{kp}">More {esc(k.lower())}</a>' if kp else "", f'<a href="{bp}">More from {esc(it["brand"])}</a>' if bp else "", f'<a href="{g_link("../", g)}">All {esc(g.lower())}</a>' if g else ""]
    more = "".join(m for m in more if m)
    body = f"""<nav class="crumbs">{crumbs}</nav>
<section class="pd"><div class="gal"><div class="gal-wrap"><div class="gal-main" id="gal">{gallery}</div>{f'<button type="button" class="zoom-btn" data-zoom aria-label="View photos full screen">{ZOOM_ICON}<span class="zh-d">Hover to zoom · click for full screen</span><span class="zh-m">Tap to zoom</span></button>' if imgs else ''}</div>{f'<div class="gal-th">{thumbs}</div>' if thumbs else ''}</div>
<div class="info"><div class="ptop"><span class="pbrand">{esc(it['brand'])}</span>{f'<span class="porigin">Brand from {esc(it["origin"])}</span>' if it['origin'] else ''}<button type="button" class="pwish" data-wish="{bag_data(it)}" aria-label="Save to wishlist">{SVG['heart']}</button></div>
<h1 class="pname">{esc(it['name'])}</h1>
<div class="tags"><a class="tag ok" href="../condition-guide.html">✓ {esc(it['cond'])}</a>{f'<span class="tag">Size {esc(it["size"])}{" · Chest " + inch(it["meas"]["chest"]) if it["meas"].get("chest") else ""}</span>' if it['size'] else ''}{f'<span class="tag">{esc(it["gender"])}</span>' if it['gender'] else ''}<span class="tag">{'Sold out' if sold else 'Only 1 piece'}</span></div>
{f'<div class="dealbar dl"><b>Deal of the Day</b><span>Extra {CFG["deal"]["extraPct"]}% off for today only · ends in <time data-countdown></time></span></div>' if deal else ''}
{f'<a class="dealbar campdeal camp{" dl-reg" if deal else ""}" href="../deals.html"><b>{esc(CAMP["name"])}: {CAMP["pct"]}% off this piece</b><span>Sale ends in <time data-camp-left></time> · plus bundle savings</span></a>' if CAMP and not sold else ''}
<div class="pp-wrap">{price_html(it, "pp")}</div>
{f'<p class="save">Retail abroad ~${it["retailUsd"]}. You save {rs(save)}.</p>' if save > 0 else ''}
{'<p class="soldmsg">This item has been sold. See similar items below or ask us on WhatsApp.</p>' if sold else f'<div class="cta">{buy}<button type="button" class="addbag" data-add="{bag_data(it)}">Add to bag</button></div>{ask}' + offer_box(it)}
<ul class="perks"><li><b>Cash on delivery</b><span>Pay when the parcel arrives</span></li><li><b>Delivery</b><span>{esc(delivery_line())}</span></li><li><b>Easy exchange</b><span><a href="../returns.html">{CFG.get('returns', {}).get('days', 3)}-day exchange</a> if it doesn't match</span></li><li><b>Bundle &amp; save</b><span>{esc(bundle_line())}</span></li></ul>
<section class="pdesc"><h2>About this piece</h2>{f'<p class="lead">{esc(it["desc"])}</p>' if it['desc'] else ''}<p class="muted">{esc(seo_blurb(it))}</p>{f'<h3>Highlights</h3><ul class="hl">{hl}</ul>' if hl else ''}{f'<p class="muted">{esc(it["fix"])}</p>' if it['fix'] else ''}</section>
<p class="szline">Size {esc(it["size"] or "-")}{f' · fits like {esc(fits_like(it))}' if fits_like(it) and fits_like(it) != it["size"] else ""} · <a href="#gal" data-szimg>see the size guide photo</a></p>
<details><summary>Details</summary><dl>{''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k, v in details)}<dt>Item code</dt><dd>{esc(sku)}</dd></dl></details>
<details><summary>Delivery &amp; payment</summary><p>{esc(delivery_line())} Cash on delivery: pay when the parcel arrives. <a href="../shipping.html">More</a></p></details>
<details><summary>How to order</summary><p>1. Tap "Buy now", or "Add to bag" for several items and check out together.<br>2. Enter your name, phone, city and address.<br>3. Place the order on the site or on WhatsApp; we confirm it.<br>4. Pay when the parcel arrives (COD).</p></details>
<button class="share" type="button" data-share>Share this item</button>{f'<nav class="pills more" aria-label="More like this">{more}</nav>' if more else ''}</div></section>
{f'<section class="rel"><h2>You may also like</h2><div class="grid">{"".join(card(o, "../") for o in related)}</div></section>' if related else ''}
{'' if sold else f'<div class="sticky"><div>{price_html(it, "sp")}<span>{esc(it["brand"])}{" · " + esc(it["size"]) if it["size"] else ""}</span></div><button type="button" class="buy" data-buy="{bag_data(it)}">Buy now</button></div>'}"""
    js = offer_js() + """<script>(function(){var z=document.querySelector('[data-szimg]'),gg=document.getElementById('gal');if(z&&gg)z.onclick=function(e){e.preventDefault();gg.scrollIntoView({behavior:'smooth',block:'center'});gg.scrollTo({left:gg.scrollWidth,behavior:'smooth'})}})()</script><script>(function(){var g=document.getElementById('gal'),t=document.querySelectorAll('.gal-th button');t.forEach(function(b){b.onclick=function(){g.scrollTo({left:g.clientWidth*+b.dataset.i,behavior:'smooth'})}});
g&&g.addEventListener('scroll',function(){var i=Math.round(g.scrollLeft/g.clientWidth);t.forEach(function(b){b.setAttribute('aria-current',+b.dataset.i===i)})},{passive:true});
var s=document.querySelector('[data-share]');s&&(s.onclick=function(){var d={title:document.title,url:location.href};if(navigator.share)navigator.share(d).catch(function(){});else navigator.clipboard.writeText(location.href).then(function(){s.textContent='Link copied'})})})()</script>"""
    if not sold: js += "<script>TP.seen(%s)</script>" % json.dumps({"sku": sku, "b": it["brand"], "n": it["name"], "p": it["price"], "i": f"img/{sku}-1.jpg" if n_imgs else ""})
    base = CFG["siteUrl"].rstrip("/")
    crumbs_ld = breadcrumb_ld([(n, base + "/" + (u if u != "index.html" else "")) for n, u in crumb_list] + [(full_name(it), f"{base}/p/{sku}.html")])
    meta = {"product:brand": it["brand"], "product:availability": "out of stock" if sold else "in stock", "product:condition": "used",
            "product:price:amount": it["price"], "product:price:currency": "PKR", "product:retailer_item_id": sku}
    return page(product_title(it), product_desc(it), body, 1, f"img/{sku}-1.jpg" if n_imgs else None, f"p/{sku}.html", None if sold else wa, js, [product_ld(it, n_imgs), crumbs_ld], og_type="product", meta=meta, img_alt=alt_text(it))


def product_title(it):
    sz = f" Size {it['size']}" if it["size"] else ""
    one = KIND_ONE.get(kind(it), "")
    tail = " – Sold" if it["status"] == "Sold" else f" – {rs(it['price'])}"
    t = f"{full_name(it)}{sz}{tail} | Pre-loved{' ' + one if one else ''}, Pakistan"
    return t if len(t) <= 70 else f"{full_name(it)}{sz}{tail} | {CFG['storeName']}"


def product_desc(it):
    who = {"Men": "for men", "Women": "for women", "Kids": "for kids", "Unisex": "unisex"}.get(it["gender"], "")
    head = " ".join(x for x in [f"Pre-loved {full_name(it)}", who, f"in {it['color'].lower()}" if it["color"] else "", f"size {it['size']}" if it["size"] else ""] if x)
    if it["status"] == "Sold":
        return f"{head}. This piece has sold. See similar pre-loved branded {kind(it).lower()} at {CFG['storeName']}, with cash on delivery all over Pakistan."
    return f"{head}, {it['cond'].lower()}. {rs(it['price'])}, only 1 piece. Cash on delivery all over Pakistan, {CFG.get('returns', {}).get('days', 7)}-day returns."


def seo_blurb(it):
    k = KIND_ONE.get(kind(it), it["category"].lower())
    brand = "an unbranded piece from our ABCThrift Select pick" if it["brand"] == CFG["houseLabel"] else f"by {it['brand']}" + (f", a brand from {it['origin'].split(' (')[0]}" if it["origin"] else "")
    return (f"This pre-loved {k} is {brand}. It was hand-picked in Sahiwal, washed and checked, and the photos show the actual item. "
            f"We deliver all over Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and Multan, and you pay cash on delivery.")


def breadcrumb_ld(pairs):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": n, "name": name, "item": url} for n, (name, url) in enumerate(pairs, 1)]}


def brand_url(up, brand):
    s = slugify(brand)
    return f"{up}brands/{s}.html" if s in BRANDS else ""


def bundle_line():
    parts = [f"{b['min']} items: {rs(b['off'])} off" if b.get("off") else f"{b['min']}+ items: {b['pct']}% off" for b in CFG.get("bundle", [])]
    return ", ".join(parts) or "Order more, save more"


def offer_js():
    url = (CFG.get("apiUrl") or CFG.get("offersUrl"))
    if not url: return ""
    return """<script>(function(){var U=%s,box=document.getElementById('offer');if(!box)return;var sku=box.dataset.sku,$=function(i){return document.getElementById(i)},st=null,tick=null;
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function get(q){return fetch(U+'?'+new URLSearchParams(q)).then(function(r){return r.json()})}
function post(b){var g=function(){return get({p:JSON.stringify(b)})};return fetch(U,{method:'POST',body:JSON.stringify(b)}).then(function(r){return r.json()}).then(function(r){return r&&r.error==='unknown action'?g():r},g)}
function down(){$('o-sub').innerHTML='Live offers are not loading right now. You can still send your offer on WhatsApp and we will reply.';$('o-form').querySelector('button').textContent='Send offer on WhatsApp';box.dataset.down=1}
function show(s){if(!s||s.error)return;st=s;$('o-top').textContent=s.highest?rs(s.highest):'None yet';$('o-count').textContent=s.count;var mn=s.highest?Math.max(s.minOffer,s.highest+s.step):s.minOffer;$('o-min').textContent=rs(mn);box.querySelector('[name=amount]').min=mn;box.querySelector('[name=amount]').placeholder=mn;
 if(s.state!=='open'){$('o-form').hidden=true;$('o-sub').textContent=s.state==='won'?'An offer on this item has won. The winner has '+(s.holdH||24)+' hours to complete the order; if they do not, the item goes back on sale at its normal price.':s.state==='sold'?'This item has been sold.':'Offers are closed for this item.'}
 clearInterval(tick);var t=$('o-timer');t.hidden=true;if(s.endsAt&&(s.state==='open'||s.state==='won')){t.hidden=false;var f=function(){var d=s.endsAt-Date.now();if(d<=0){t.textContent=s.state==='won'?'Hold ending...':'Closing...';return}var h=Math.floor(d/36e5),m=Math.floor(d%%36e5/6e4);t.textContent=(s.state==='won'?'On hold · ':'')+h+'h '+m+'m left'};f();tick=setInterval(f,3e4)}}
function msg(t,ok){var m=$('o-msg');m.textContent=t;m.className='o-msg '+(ok?'ok':'err')}
function wa(t){return 'https://wa.me/%s?text='+encodeURIComponent(t)}
function mine(phone){get({a:'mine',sku:sku,phone:phone}).catch(function(){return {error:'Could not check right now. Please ask us on WhatsApp.'}}).then(function(r){var el=$('o-mine');el.hidden=false;if(r.error){el.textContent=r.error;return}if(r.none){el.textContent='No offer found for this number.';return}
 var h='<p>Your offer: <b>'+rs(r.amount)+'</b> · '+({'new':'Pending','countered':'You have a counter offer','won':'Deal final! Please complete your order within %s hours.','lost':'This offer did not win','expired':'This offer has expired. The item is back at its normal price.'}[r.status]||r.status)+'</p>';
 if(r.status==='countered')h+='<p>Our counter offer: <b>'+rs(r.counter)+'</b></p><button type="button" id="o-acc">Accept '+rs(r.counter)+'</button>';
 if(r.status==='won')h+='<a class="buy" target="_blank" rel="noopener" href="'+wa('Hi! My deal on '+sku+' at '+rs(r.amount)+' is final. My address is: ')+'">Send address (WhatsApp)</a>';
 el.innerHTML=h;var a=$('o-acc');a&&(a.onclick=function(){a.disabled=true;post({a:'accept',sku:sku,phone:phone}).then(function(x){if(x.error){msg(x.error)}else{msg('Deal final! Send your address on WhatsApp.',1)}mine(phone);refresh()})})})}
function refresh(){get({a:'state',sku:sku}).then(function(s){if(s&&s.error&&!s.sku)return down();show(s)}).catch(down)}
function viaWa(b){var u=wa('Hi! My offer for '+sku+': Rs '+b.amount+'. Name: '+b.name+', WhatsApp: '+b.phone);if(!window.open(u,'_blank'))location.href=u;msg('Your offer has opened in WhatsApp. Please tap Send there.',1)}
var saved='';try{saved=localStorage.getItem('st-phone')||'';var nm=localStorage.getItem('st-name')||'';box.querySelector('[name=phone]').value=saved;box.querySelector('[name=name]').value=nm}catch(e){}
$('o-form').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),b={a:'offer',sku:sku,name:String(f.get('name')||'').trim(),phone:String(f.get('phone')||'').trim(),amount:f.get('amount')},btn=e.target.querySelector('button');
 if(!/^(\\+?92|0)?3\\d{9}$/.test(b.phone.replace(/[\\s-]/g,''))){msg('Please enter a valid WhatsApp number (03xx xxxxxxx).');return}
 try{localStorage.setItem('st-phone',b.phone);localStorage.setItem('st-name',b.name)}catch(x){}
 if(box.dataset.down)return viaWa(b);btn.disabled=true;msg('Sending...',1);
 post(b).then(function(r){btn.disabled=false;if(r.error){msg(r.error);return}msg(r.message,1);show(r);mine(b.phone)}).catch(function(){btn.disabled=false;down();viaWa(b)})};
$('o-check').onclick=function(){var p=box.querySelector('[name=phone]').value||prompt('Your WhatsApp number');if(p)mine(p)};
refresh();if(saved)mine(saved)})()</script>""" % (json.dumps(url), wa_digits(), HOLD_H)


def index_badges_js():
    url = (CFG.get("apiUrl") or CFG.get("offersUrl"))
    if not url: return ""
    return """<script>fetch(%s+'?a=all').then(function(r){return r.json()}).then(function(m){document.querySelectorAll('.card').forEach(function(c){var s=m[c.dataset.sku];if(!s||!s.highest||c.classList.contains('is-sold'))return;var b=document.createElement('span');b.className='b-offer';b.textContent=s.state==='won'?'On hold':'Offer Rs '+Math.round(s.highest).toLocaleString('en-PK')+' · '+s.count;c.querySelector('.ci').appendChild(b)})}).catch(function(){})</script>""" % json.dumps(url)



def hero_slides(live, v):
    def pic(f):
        return next((i for i in live if i["images"] and f(i)), None)
    out = []
    spec = [("Winter New Arrivals", "Hand-picked international brands, washed and checked. Only one of each.", "Shop new arrivals", "index.html?sort=new#shop", pic(lambda i: True), "s1"),
            ("Kids Winter Wear", "Branded jackets, hoodies and snowsuits at low prices.", "Shop kids", g_link("", "Kids"), pic(lambda i: i["gender"] == "Kids"), "s2"),
            ("Women's Collection", "Sweaters, cardigans and jackets that fit your budget.", "Shop women", g_link("", "Women"), pic(lambda i: in_gender(i, "Women")), "s3"),
            (f"Free {rs(v['amount'])} voucher" if v else "Cash on delivery", f"Use code {esc(v['code'])} on your first order. Cash on delivery all over Pakistan." if v else "Pay when the parcel arrives.", "Claim voucher" if v else "Shop now", "#shop", pic(lambda i: i["price"] < 1000) or pic(lambda i: True), "s4")]
    seen = set()
    for t, sub, btn, href, it, cls in spec:
        if it is None and cls != "s4": continue
        if it and it["sku"] in seen and cls in ("s2", "s3"): continue
        if it: seen.add(it["sku"])
        img = f'<img src="img/t/{it["sku"]}-1.jpg" alt="{esc(alt_text(it))}" width="600" height="600"{" loading=lazy decoding=async" if out else " fetchpriority=high"}>' if it else ""
        act = f'<button type="button" class="btn" data-voucher>{btn}</button>' if cls == "s4" and v else f'<a class="btn" href="{esc(href)}">{btn}</a>'
        out.append(f'<div class="slide {cls}"><div class="sl-tx"><p class="eyebrow">{esc(CFG["storeName"])}</p><h2>{esc(t)}</h2><p>{sub}</p>{act}</div><div class="sl-img">{img}</div></div>')
    return "".join(out)


SLIDER_JS = """<script>(function(){var t=document.getElementById('sl-track'),d=document.getElementById('sl-dots');if(!t)return;var n=t.children.length,i=0,tm;
d.innerHTML=Array.prototype.map.call(t.children,function(_,k){return '<button type="button" aria-label="Slide '+(k+1)+'"></button>'}).join('');var b=d.children;
function mark(){for(var k=0;k<n;k++)b[k].setAttribute('aria-current',k===i)}function go(k){i=(k+n)%n;t.scrollTo({left:t.clientWidth*i,behavior:'smooth'});mark()}
Array.prototype.forEach.call(b,function(x,k){x.onclick=function(){go(k);rs()}});t.addEventListener('scroll',function(){var k=Math.round(t.scrollLeft/t.clientWidth);if(k!==i){i=k;mark()}},{passive:true});
function rs(){clearInterval(tm);tm=setInterval(function(){go(i+1)},5000)}mark();if(n>1)rs()})()</script>"""


# ---------- deals, campaign hero, homepage blocks ----------
def offer_cards(up=""):
    """Every offer that is running, as (css class, kicker, big text, line, link, button). Shared by the homepage strip and deals.html."""
    dl = CFG.get("delivery") or {}; v = CFG.get("voucher"); out = []
    if CAMP: out.append(("o-camp camp", CAMP["name"], f"{CAMP['pct']}% off", f"Every piece in the store, until {CAMP['endTxt']}.", f"{up}index.html#shop", "Shop the sale"))
    if DEAL: out.append(("o-deal dl", "Deal of the Day", f"Extra {CFG['deal']['extraPct']}% off", "One hand-picked piece, a new one every day.", f"{up}index.html#deal", "See today's deal"))
    if dl.get("freeOver"): out.append(("o-free", "Free delivery", f"{rs(dl['freeOver'])}+", f"Every {rs(dl['freeOver'])} jacket ships free. Below that, delivery is {rs(dl.get('fee', 0))}.", f"{up}index.html?max={dl['freeOver']}#shop", "Shop now"))
    for b in CFG.get("bundle", []):
        out.append(("o-bundle", f"Buy {b['min']}{'' if b.get('off') else '+'}", rs(b["off"]) + " off" if b.get("off") else f"{b['pct']}% off", f"Add {b['min']}{' or more' if not b.get('off') else ''} items to your bag. Applied automatically at checkout.", f"{up}index.html#shop", "Build a bundle"))
    if v: out.append(("o-voucher", "Welcome gift", rs(v["amount"]) + " off", f"Code {v['code']} on your first order over {rs(v['minOrder'])}.", "", "Claim voucher"))
    if any(i for i in COLL if i[0] == "under-1000"): out.append(("o-steal", "Steals", "Under Rs 1,000", "Branded pieces at pocket-money prices.", coll_url(up, "under-1000"), "Shop steals"))
    return out


def offer_strip(up="", big=False):
    cards = "".join(f'<{"a" if href else "div"} class="ocard {cls}"{f" href=\"{esc(href)}\"" if href else ""}><span class="ok">{esc(k)}</span><b>{esc(t)}</b><span>{esc(line)}</span>'
                    + (f'<i>{esc(btn)} →</i>' if href else f'<button type="button" data-voucher>{esc(btn)}</button>') + f'</{"a" if href else "div"}>' for cls, k, t, line, href, btn in offer_cards(up))
    return f'<div class="ostrip{" big" if big else ""}">{cards}</div>'


def camp_hero(live, up=""):
    if not CAMP: return ""
    picks = sorted((i for i in live if i["images"]), key=lambda i: (-i["price"], i["sku"]))[:3]
    dl = (CFG.get("delivery") or {}).get("freeOver")
    stack = "".join(f'<a class="ch-p ch-p{n}" href="{up}p/{esc(i["sku"])}.html"><img src="{up}img/t/{i["sku"]}-1.jpg" alt="{esc(alt_text(i))}" width="600" height="600"{" fetchpriority=high" if not n else " loading=lazy decoding=async"}><span><b>{rs(camp_price(i["price"]))}</b><s>{rs(i["price"])}</s></span></a>' for n, i in enumerate(picks))
    perks = [f"Buy {b['min']}: {rs(b['off'])} off" if b.get("off") else f"Buy {b['min']}+: extra {b['pct']}% off" for b in CFG.get("bundle", [])] + ([f"Free delivery {rs(dl)}+"] if dl else [])
    name = CAMP["name"].split(" ", 1)
    return f"""<section class="camphero camp" aria-label="{esc(CAMP['name'])}"><div class="ch-tx"><p class="ch-kick">Limited time · {esc(CFG['storeName'])}</p>
<h2 class="ch-h"><span>{esc(name[0])}</span>{f'<em>{esc(name[1])}</em>' if len(name) > 1 else ''}</h2>
<p class="ch-big">{CAMP['pct']}<small>%<br>OFF</small></p><ul class="ch-perks">{''.join(f'<li>{esc(p)}</li>' for p in perks)}</ul>
<div class="ch-clock" data-camp-clock aria-label="Time left"><span><b data-u="d">0</b>days</span><span><b data-u="h">00</b>hrs</span><span><b data-u="m">00</b>min</span><span><b data-u="s">00</b>sec</span></div>
<div class="cta"><a class="btn hot" href="{up}index.html#shop">Shop the sale</a><a class="btn ghost" href="{up}deals.html">All offers</a></div></div>
<div class="ch-stack">{stack}</div></section>"""


def budget_tiles(live):
    tiers = [(999, "Under Rs 1,000", "Pocket-friendly steals"), (1499, "Under Rs 1,500", "Everyday favourites"), (1999, "Up to Rs 1,999", "Ships free")]
    out = "".join(f'<a class="btile t{n}" href="{esc(shop_link(max=mx, sort="high"))}"><span>{esc(sub)}</span><b>{esc(lbl)}</b><em>{c} pieces</em></a>'
                  for n, (mx, lbl, sub) in enumerate(tiers) if (c := sum(i["price"] <= mx for i in live)))
    return f'<section class="budget"><div class="sec-hd"><p class="eyebrow">Shop by budget</p><h2>What\'s your budget?</h2></div><div class="btiles">{out}</div></section>' if out else ""


def brand_marquee(up=""):
    if not BRANDS: return ""
    row = "".join(f'<a href="{up}brands/{b}.html">{esc(n)}</a>' for b, n in sorted(BRANDS.items(), key=lambda x: x[1].lower()))
    return f'<section class="marq" aria-label="Brands we stock"><div class="marq-in">{row}<span aria-hidden="true" class="marq-dup">{row}</span></div></section>'


def deals_page(items):
    live = [i for i in items if i["status"] != "Sold"]
    h1 = CAMP["name"] if CAMP else "Deals & offers"
    dl = CFG.get("delivery") or {}
    rules = [f"{CAMP['pct']}% off is taken off every item's price automatically, until {CAMP['endTxt']} (Pakistan time). After that, prices go back to normal." if CAMP else "",
             "Bundle savings are added on top: " + bundle_line() + "." if CFG.get("bundle") else "",
             f"Free delivery on orders of {rs(dl['freeOver'])}+. During a sale, items count at their regular price, so a {rs(dl['freeOver'])} jacket still ships free." if dl.get("freeOver") else "",
             f"The {rs(CFG['voucher']['amount'])} welcome voucher ({CFG['voucher']['code']}) works on your first order over {rs(CFG['voucher']['minOrder'])}." if CFG.get("voucher") else "",
             "Every piece is one-off. Deals cannot hold an item, so add it to your bag and check out before someone else does.",
             "Cash on delivery all over Pakistan. You see the final total before you place the order."]
    steals = sorted(live, key=lambda i: (i["price"], i["sku"]))
    body = f"""{camp_hero(live)}<section class="dealsp"><nav class="crumbs"><a href="index.html">Home</a> / <span>{esc(h1)}</span></nav>
<h1>{esc(h1)}</h1><p class="lead">All of our current offers in one place. Discounts are applied automatically in your bag, no code needed (except the welcome voucher).</p>
{offer_strip("", big=True)}<div class="drules"><h2>How the offers work</h2><ol>{''.join(f'<li>{esc(r)}</li>' for r in rules if r)}</ol></div></section>
<section class="shop coll"><h2>{'Everything on sale' if CAMP else 'Shop all pieces'} <span class="muted">{len(live)} pieces, lowest price first</span></h2><div class="grid">{''.join(card(i) for i in steals)}</div></section>"""
    return page(f"{h1} | {CFG['storeName']}", f"Current deals at {CFG['storeName']}: " + "; ".join(f"{k} {t}" for _, k, t, *_ in offer_cards()) + ". Pre-loved branded clothes, cash on delivery in Pakistan.",
                body, 0, None, "deals.html", None, index_badges_js())


def index_page(items):
    live = [i for i in items if i["status"] != "Sold"]
    cats = sorted({i["category"] for i in items}); sizes = sorted({i["size"] for i in live if i["size"]}, key=size_rank)
    brands = sorted({i["brand"] for i in live}, key=lambda b: (-sum(i["brand"] == b for i in live), b))
    d = next((i for i in live if i["sku"] == DEAL.get("sku")), None)
    deal = f"""<section id="deal" class="deal dl"><a class="deal-img" href="p/{esc(d['sku'])}.html">{f'<img src="img/t/{d["sku"]}-1.jpg" alt="{esc(alt_text(d))}" loading="lazy" decoding="async" width="600" height="600">' if d['images'] else ''}</a>
<div class="deal-tx"><p class="eyebrow">Deal of the Day · extra {CFG['deal']['extraPct']}% off</p><span class="pbrand">{esc(d['brand'])}</span><h2>{esc(d['name'])}</h2>
<p class="deal-p"><b>{rs(DEAL['price'])}</b><s>{rs(d['price'])}</s></p><p class="deal-t">Ends in <time data-countdown>--:--:--</time></p>
<div class="cta"><a class="btn" href="p/{esc(d['sku'])}.html">View deal</a><button type="button" class="addbag" data-add="{bag_data(d)}">Add to bag</button></div></div></section>""" if d else ""
    v = CFG.get("voucher"); dl = CFG.get("delivery") or {}
    tiles = ""
    for g in GENDERS:
        gi = [i for i in live if in_gender(i, g)]
        pic = next((i for i in gi if i["images"]), None)
        if not gi: continue
        tiles += f'<a class="gtile" href="{g_link("", g)}">{f"<img src=img/t/{pic["sku"]}-1.jpg alt=\"{esc(g)} thrift clothes\" loading=lazy decoding=async width=600 height=600>" if pic else ""}<span><b>{g}</b><em>{len(gi)} pieces</em></span></a>'
    pills = "".join(f'<a href="{esc(shop_link(cat=c))}">{esc(c)} <em>{sum(i["category"] == c for i in live)}</em></a>' for c in sorted({i["category"] for i in live}))
    conds = "".join(f'<a href="{esc(shop_link(cond=c))}"><b>{esc(c)}</b><span>{esc(COND_NOTE[c])}</span></a>' for c in CONDS if any(i["cond"] == c for i in live))
    slides = hero_slides(live, v)
    body = f"""{camp_hero(live)}<section class="slider{' camp-reg' if CAMP else ''}" id="slider" aria-label="Highlights"><div class="sl-track" id="sl-track">{slides}</div><div class="sl-dots" id="sl-dots"></div></section>
<section class="deals-home"><div class="sec-hd"><p class="eyebrow">Deals for you</p><h2>Ways to save today</h2><a class="o-link" href="deals.html">All offers →</a></div>{offer_strip()}</section>
<section class="gtiles" style="--n:{tiles.count('class="gtile"')}" aria-label="Shop by">{tiles}</section>
{budget_tiles(live)}
{f'<nav class="pills" aria-label="Categories">{pills}</nav>' if pills else ''}
{deal}
{brand_marquee()}
<section class="trust"><div><b>Cash on delivery</b><span>Pay when the parcel arrives</span></div><div><b>{'Free delivery from ' + rs(dl['freeOver']) if dl.get('freeOver') else 'Nationwide delivery'}</b><span>{esc(dl.get('days', 'All over Pakistan'))}</span></div><div><b>Hand-checked</b><span>Washed, pressed, photographed for real</span></div><div><b>{CFG.get('returns', {}).get('days', 3)}-day exchange</b><span>If it doesn't match the page</span></div></section>
<section class="rv" id="rv" hidden><h2>Recently viewed</h2><div class="rv-row"></div></section>
<section id="shop" class="shop"><div class="shop-hd"><h2 id="shop-h">Latest Arrivals <span class="muted" id="count">{len(live)} items</span></h2>
<input id="q" type="search" placeholder="Search brand, item, colour, code" aria-label="Search"></div>
<div class="brands" aria-label="Shop by brand">{''.join(f'<button type="button" data-brand="{esc(b)}">{esc(b)}</button>' for b in brands)}</div>
<div class="filters"><div class="chips" id="g">{''.join(f'<button type="button" data-v="{g}">{g}</button>' for g in ['All', *GENDERS])}</div>
<select id="cat" aria-label="Category"><option value="">All categories</option>{''.join(f'<option>{esc(c)}</option>' for c in cats)}</select>
<select id="size" aria-label="Size"><option value="">All sizes</option>{''.join(f'<option>{esc(s)}</option>' for s in sizes)}</select>
<select id="cond" aria-label="Condition"><option value="">Any condition</option>{''.join(f'<option>{esc(c)}</option>' for c in CONDS)}</select>
<select id="max" aria-label="Price"><option value="">Any price</option><option value="999">Under Rs 1,000</option><option value="1499">Under Rs 1,500</option><option value="1999">Under Rs 2,000</option><option value="2999">Under Rs 3,000</option></select>
<select id="sort" aria-label="Sort"><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
<label class="chk"><input type="checkbox" id="sold"> Show sold</label><button type="button" class="o-link" id="clear" hidden>Clear filters</button></div>
<div class="grid" id="grid">{''.join(card(i) for i in items)}</div><p class="empty" id="empty" hidden>Nothing here yet. Try another filter, or ask on WhatsApp and we'll look for it.</p></section>
{f'<section class="conds"><h2>Shop by condition</h2><div>{conds}</div><a class="o-link" href="condition-guide.html">How we grade condition</a></section>' if conds else ''}
<section id="how" class="how"><h2>How to order</h2><ol><li><b>Pick your items</b><span>Check the photos and size. Add several items to your bag.</span></li><li><b>Check out</b><span>Enter your name, phone and address, and place the order on the site or on WhatsApp.</span></li><li><b>Pay at your door</b><span>We confirm and dispatch. Pay cash when the parcel arrives.</span></li></ol></section>
<section class="faqs"><h2>Common questions</h2>{''.join(f'<details><summary>{esc(q)}</summary><p>{a}</p></details>' for q, a in FAQ[:4])}<a class="o-link" href="faq.html">All FAQs</a></section>
{popular_block("")}
<section class="seo-about"><h2>Online thrift store in Pakistan</h2><p>{esc(CFG['storeName'])} sells pre-loved (used) clothes from international brands at thrift prices. We hand-pick every piece in Sahiwal, Punjab, wash and check it, and list it with real photos, the size and an honest condition grade. You will find branded winter jackets, puffer jackets, coats, hoodies and sweatshirts for men, women and kids, with only one piece of each.</p>
<p>Order online or on WhatsApp and pay cash on delivery anywhere in Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan and Sahiwal. {esc(delivery_line().rstrip('.'))}. Easy returns within {CFG.get('returns', {}).get('days', 7)} days.</p></section>"""
    js = """<script>(function(){var g='All',$=function(i){return document.getElementById(i)},q=$('q'),cat=$('cat'),size=$('size'),cond=$('cond'),sort=$('sort'),sold=$('sold'),mx=$('max'),grid=$('grid'),cards=[].slice.call(grid.children),brand='';
function setG(v){g=v;document.querySelectorAll('#g button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===v)})}
function run(){var v=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(!mx.value||+c.dataset.price<=+mx.value)&&(g==='All'||c.dataset.g===g||(g!=='Kids'&&c.dataset.g==='Unisex'))&&(!cat.value||c.dataset.cat===cat.value)&&(!size.value||c.dataset.size===size.value)&&(!cond.value||c.dataset.cond===cond.value)&&(!brand||c.dataset.brand===brand)&&(!v||c.dataset.q.indexOf(v)>-1)&&(sold.checked||!c.classList.contains('is-sold'));c.hidden=!ok;if(ok)n++});
 var s=sort.value;cards.slice().sort(function(a,b){return s==='low'?a.dataset.price-b.dataset.price:s==='high'?b.dataset.price-a.dataset.price:(a.dataset['new']<b.dataset['new']?1:-1)}).forEach(function(c){grid.appendChild(c)});
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
    org = {"@context": "https://schema.org", "@type": "ClothingStore", "@id": CFG["siteUrl"].rstrip("/") + "/#store", "name": CFG["storeName"], "url": CFG["siteUrl"].rstrip("/") + "/", "telephone": "+" + wa_digits(),
           "description": "Online thrift store for pre-loved international brand clothing, hand-picked in Sahiwal, with cash on delivery all over Pakistan.",
           "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "11:00", "closes": "22:00"}],
           "address": {"@type": "PostalAddress", "addressLocality": "Sahiwal", "addressRegion": "Punjab", "addressCountry": "PK"}, "paymentAccepted": "Cash on delivery", "currenciesAccepted": "PKR",
           "logo": CFG["siteUrl"].rstrip("/") + "/logo.png", "image": CFG["siteUrl"].rstrip("/") + "/og-image.png", "priceRange": f"{rs(min(i['price'] for i in live))} - {rs(max(i['price'] for i in live))}" if live else "Rs 400 - Rs 3,000",
           "areaServed": {"@type": "Country", "name": "Pakistan"}}
    sm = [u for u in (CFG.get("social") or {}).values() if u]
    if sm: org["sameAs"] = sm
    site = {"@context": "https://schema.org", "@type": "WebSite", "@id": CFG["siteUrl"].rstrip("/") + "/#website", "name": CFG["storeName"], "url": CFG["siteUrl"].rstrip("/") + "/", "publisher": {"@id": CFG["siteUrl"].rstrip("/") + "/#store"}, "inLanguage": "en-PK",
            "potentialAction": {"@type": "SearchAction", "target": CFG["siteUrl"].rstrip("/") + "/index.html?q={search_term_string}#shop", "query-input": "required name=search_term_string"}}
    return page(f"{CFG['storeName']} | Thrift Store in Pakistan for Pre-loved Branded Clothes", "Shop pre-loved international brand jackets, puffers, hoodies and sweatshirts online in Pakistan. Hand-picked in Sahiwal, real photos, cash on delivery, " + f"{CFG.get('returns', {}).get('days', 7)}-day returns.", body, 0, f"img/{live[0]['sku']}-1.jpg" if live and live[0]["images"] else None, "", None, js + SLIDER_JS + index_badges_js(), [org, site])


# ---------- SEO landing pages ----------
def popular_block(up, skip=""):
    links = "".join(f'<a href="{up}{c}.html">{esc(h)} <em>{n}</em></a>' for c, h, n in COLL if c != skip)
    brands = "".join(f'<a href="{up}brands/{b}.html">{esc(n)}</a>' for b, n in sorted(BRANDS.items(), key=lambda x: x[1].lower()))
    if not links and not brands: return ""
    return (f'<section class="popular"><h2>Popular in our store</h2><nav class="pills" aria-label="Popular searches">{links}</nav>'
            + (f'<h3>Shop by brand</h3><nav class="pills" aria-label="Brands">{brands}<a href="{up}brands.html">All brands</a></nav>' if brands else "") + "</section>")


def top_brands(items, n=5):
    names = [i["brand"] for i in items if i["brand"] != CFG["houseLabel"]]
    seen = sorted(dict.fromkeys(names), key=lambda b: -names.count(b))
    return ", ".join(seen[:n]) or "international labels"


def size_chips(sizes):
    """Quick size filter on landing pages (category, brand, gender): tap a size to show only those pieces."""
    if len(sizes) < 2: return ""
    return '<div class="chips szchips" role="group" aria-label="Filter by size"><span>Size:</span>' + "".join(f'<button type="button" data-sz="{esc(s)}">{esc(s)}</button>' for s in ["All", *sizes]) + "</div>"


SIZE_CHIP_JS = """<script>(function(){var b=document.querySelectorAll('[data-sz]');b.forEach(function(x){x.onclick=function(){var v=x.dataset.sz;b.forEach(function(y){y.setAttribute('aria-pressed',y===x)});
document.querySelectorAll('.coll > .grid .card').forEach(function(c){c.hidden=v!=='All'&&c.dataset.size!==v})}});b[0]&&b[0].setAttribute('aria-pressed','true')})()</script>"""


def list_page(slug, h1, title, desc, intro, its, depth, crumbs_extra=(), filter_q=None, skip=""):
    """A crawlable landing page: unique heading and intro, the matching items, links to related pages, CollectionPage + ItemList schema."""
    up = "../" * depth; base = CFG["siteUrl"].rstrip("/")
    live = [i for i in its if i["status"] != "Sold"]; sold = [i for i in its if i["status"] == "Sold"][:8]
    sizes = sorted({i["size"] for i in live if i["size"]}, key=size_rank)
    intro = intro.format(brands=top_brands(live), sizes=", ".join(sizes[:8]) or "all sizes")
    prices = [i["price"] for i in live]
    facts = f"{len(live)} piece{'s' if len(live) != 1 else ''} in stock" + (f", from {rs(min(prices))} to {rs(max(prices))}" if prices else "") + ". Cash on delivery all over Pakistan."
    url = base + "/" + slug
    crumbs = [("Home", base + "/")] + list(crumbs_extra) + [(h1, url)]
    crumb_html = " / ".join(f'<a href="{up}{esc(u[len(base) + 1:]) or "index.html"}">{esc(n)}</a>' for n, u in crumbs[:-1]) + f" / <span>{esc(h1)}</span>"
    filt = f'<p><a class="o-link" href="{esc(shop_link(up, **filter_q))}">Filter by size, price and condition</a></p>' if filter_q else ""
    body = f"""<section class="shop coll"><nav class="crumbs">{crumb_html}</nav><h1>{esc(h1)}</h1><p class="lead">{esc(intro)}</p><p class="muted">{esc(facts)}</p>{filt}
{size_chips(sizes)}<div class="grid">{''.join(card(i, up) for i in live)}</div>
{f'<h2>Recently sold</h2><p class="muted">These have found a new home. New stock is added every week.</p><div class="grid">{"".join(card(i, up) for i in sold)}</div>' if sold else ''}</section>
{popular_block(up, skip)}"""
    ld = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": h1, "url": url, "description": desc, "isPartOf": {"@id": base + "/#website"},
           "mainEntity": {"@type": "ItemList", "numberOfItems": len(live), "itemListElement": [{"@type": "ListItem", "position": n, "url": f"{base}/p/{i['sku']}.html", "name": full_name(i)} for n, i in enumerate(live, 1)]}},
          breadcrumb_ld(crumbs)]
    img = next((f"img/{i['sku']}-1.jpg" for i in live if i["images"]), None)
    return page(f"{title} | {CFG['storeName']}", desc, body, depth, img, slug, None, index_badges_js() + (SIZE_CHIP_JS if len(sizes) > 1 else ""), ld, img_alt=h1)


def brand_pages(items):
    out = {}
    for b, name in BRANDS.items():
        its = [i for i in items if slugify(i["brand"]) == b]
        desc = f"Shop pre-loved {name} clothes online in Pakistan: {', '.join(sorted({KIND_ONE.get(kind(i), i['category'].lower()) + 's' for i in its}))}. Real photos, cash on delivery, {CFG.get('returns', {}).get('days', 7)}-day returns."
        intro = (f"Pre-loved {name} pieces, hand-picked in Sahiwal and checked by hand. Each item carries its own {name} label, and we can send a photo of the label on WhatsApp. "
                 "There is only one of each, so order before someone else does.")
        out[b] = list_page(f"brands/{b}.html", f"{name} in Pakistan", f"{name} Pakistan | Pre-loved {name} Clothes", desc, intro, its, 1,
                           [("All brands", CFG["siteUrl"].rstrip("/") + "/brands.html")], {"brand": name})
    return out


def brands_index(items):
    live = [i for i in items if i["status"] != "Sold"]
    groups = {}
    for i in live:
        if i["brand"] != CFG["houseLabel"]: groups.setdefault(slugify(i["brand"]), []).append(i)
    rows = ""
    for sl, its in sorted(groups.items(), key=lambda x: (BRANDS.get(x[0]) or x[1][0]["brand"]).lower()):
        n = BRANDS.get(sl) or next((i["brand"] for i in its if not i["brand"].isupper()), its[0]["brand"])
        rows += f'<a href="{f"brands/{sl}.html" if sl in BRANDS else esc(shop_link(brand=its[0]["brand"]))}"><b>{esc(n)}</b><span>{len(its)} in stock</span></a>'
    house = sum(i["brand"] == CFG["houseLabel"] for i in live)
    if house: rows += f'<a href="{esc(shop_link(brand=CFG["houseLabel"]))}"><b>{esc(CFG["houseLabel"])}</b><span>{house} unbranded picks</span></a>'
    names = list(groups)
    body = f'<section class="infop"><nav class="crumbs"><a href="index.html">Home</a> / <span>Brands</span></nav><h1>Shop by brand</h1><p class="lead">Pre-loved clothes from {len(names)} international brands, hand-picked in Sahiwal. Cash on delivery all over Pakistan.</p><div class="brandlist">{rows}</div></section>'
    base = CFG["siteUrl"].rstrip("/")
    return page(f"Brands | Pre-loved Branded Clothes Pakistan | {CFG['storeName']}", f"Shop pre-loved clothes by brand: {top_brands(live, 8)} and more. Cash on delivery all over Pakistan.", body, 0, None, "brands.html",
                ld=[breadcrumb_ld([("Home", base + "/"), ("Brands", base + "/brands.html")])])


def feed_xml(items, counts):
    """Product feed (RSS 2.0, Google namespace) for Google Merchant Center free listings and the Facebook / Instagram shop catalog."""
    base = CFG["siteUrl"].rstrip("/"); x = lambda s: html.escape(str(s or ""), quote=False)
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>',
           f"<title>{x(CFG['storeName'])}</title><link>{base}/</link><description>{x(CFG['tagline'])}</description>"]
    for i in items:
        n = counts.get(i["sku"], 0)
        if not n: continue
        g = {"Men": "male", "Women": "female"}.get(i["gender"], "unisex")
        imgs = [f"{base}/img/{i['sku']}-{k}.jpg" for k in range(1, n + 1)]
        f = [("g:id", i["sku"]), ("g:title", clip(f"{full_name(i)}{' Size ' + i['size'] if i['size'] else ''}", 150)), ("g:description", clip(" ".join(x for x in (i["desc"], seo_blurb(i)) if x), 4900)),
             ("g:link", f"{base}/p/{i['sku']}.html"), ("g:image_link", imgs[0])] + [("g:additional_image_link", u) for u in imgs[1:10]] + [
             ("g:availability", "out_of_stock" if i["status"] == "Sold" else "in_stock"), ("g:price", f"{i['price']:.2f} PKR"), ("g:condition", "used"),
             ("g:brand", i["brand"]), ("g:identifier_exists", "no"), ("g:google_product_category", "1604"), ("g:product_type", f"{i['gender'] or 'Unisex'} > {kind(i)}"),
             ("g:gender", g), ("g:age_group", "kids" if i["gender"] == "Kids" else "adult"), ("g:color", i["color"]), ("g:size", i["size"]),
             ("g:shipping", None)]
        fee = 0 if (CFG.get("delivery") or {}).get("freeOver") and i["price"] >= CFG["delivery"]["freeOver"] else (CFG.get("delivery") or {}).get("fee", 0)
        row = "".join(f"<{k}>{x(v)}</{k}>" for k, v in f if v not in (None, ""))
        out.append(f"<item>{row}<g:shipping><g:country>PK</g:country><g:price>{fee:.2f} PKR</g:price></g:shipping></item>")
    return "\n".join(out + ["</channel></rss>"]) + "\n"


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
        ("Are the brands original?", "Branded items carry their own brand labels, and we photograph the label of every piece. Ask on WhatsApp and we will send you the label photo before you order. Pieces without a known brand are listed as " + esc(CFG["houseLabel"]) + "."),
        ("Where are you based and where do you deliver?", "We are an online thrift store in " + esc(CFG.get("city", "Pakistan")) + ". We deliver all over Pakistan, including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and Multan, with cash on delivery."),
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
<h2>Delivery charges</h2><p>{'Delivery ' + fee + ' per order. ' if d.get('fee') else ''}{('Orders of ' + free + ' or more get free delivery.') if d.get('freeOver') else ''}</p>
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
<h2>How we measure</h2><p>Every piece is laid flat and measured by hand in inches. Lay a top that fits you well flat on the floor and measure it the same way, then compare with the numbers on the item page.</p>
<figure class="mfig">""" + measure_svg() + """</figure>
<ul><li><b>Chest</b>: straight across, armpit to armpit. Double it for the full round.</li><li><b>Length</b>: from the highest point of the shoulder, next to the collar, down to the bottom hem.</li><li><b>Shoulder</b>: from one shoulder seam to the other, across the back.</li><li><b>Sleeve</b>: from the shoulder seam to the end of the cuff.</li></ul>
<h2>Which size fits me? (adults, approx.)</h2><p>Use the garment's chest (armpit to armpit). Tag sizes differ between American, European and Asian brands, so the measured chest is the safest guide. On each item page we show the tag size and the size it fits like.</p>
<table><thead><tr><th>Fits like</th><th>Garment chest (armpit to armpit)</th><th>Your body chest</th></tr></thead><tbody>
<tr><td>XS</td><td>under 20"</td><td>under 36"</td></tr><tr><td>S</td><td>20-21"</td><td>36-38"</td></tr><tr><td>M</td><td>21.5-22.5"</td><td>39-40"</td></tr><tr><td>L</td><td>22.5-24"</td><td>41-43"</td></tr><tr><td>XL</td><td>24-25.5"</td><td>44-46"</td></tr><tr><td>XXL</td><td>25.5-27"</td><td>47-49"</td></tr><tr><td>3XL</td><td>27"+</td><td>50"+</td></tr></tbody></table>
<p class="muted">Asian tags often use numbers: 90 = S, 95 = M, 100 = L, 105 = XL, 110 = XXL. European women's 36 = S, 38 = M, 40 = L, 42 = XL.</p>
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


NOINDEX = {"track"}  # utility pages kept out of Google (wishlist and 404 are noindex too)


def sitemap(base, rows):
    """rows: (path, lastmod YYYY-MM-DD or '', [image urls])"""
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for path, mod, imgs in rows:
        out.append(f"<url><loc>{esc(base)}/{esc(path)}</loc>" + (f"<lastmod>{mod}</lastmod>" if re.fullmatch(r"\d{4}-\d{2}-\d{2}", mod or "") else "")
                   + "".join(f"<image:image><image:loc>{esc(u)}</image:loc></image:image>" for u in imgs) + "</url>")
    return "\n".join(out + ["</urlset>"]) + "\n"


def main(items_dir, assets_dir):
    items = load_items(items_dir)
    tmp = ROOT / "public.new"; shutil.rmtree(tmp, ignore_errors=True); (tmp / "img").mkdir(parents=True); (tmp / "p").mkdir()
    counts, report = {}, {}
    try: OLD_REPORT = json.loads((OUT / "photo-report.json").read_text())
    except (OSError, ValueError): OLD_REPORT = {}
    for it in items:
        n = 0; issues = []; it["ai_idx"] = set()
        have = [a for a in it["images"] if (Path(assets_dir) / f"{a}.jpg").exists()]
        live_imgs = sorted(OUT.glob(f"img/{it['sku']}-*.jpg"), key=lambda p: int(p.stem.rsplit("-", 1)[1]))
        if not have and live_imgs:
            # No new photos for this item in assets_dir: keep the photos already on the site, so a text/SEO rebuild never drops them.
            for p in live_imgs:
                n += 1; shutil.copy(p, tmp / "img" / f"{it['sku']}-{n}.jpg")
            counts[it["sku"]] = n; it["n_imgs"] = n
            if it["status"] != "Sold" and it["sku"] in OLD_REPORT: report[it["sku"]] = OLD_REPORT[it["sku"]]
            continue
        for aid in it["images"]:
            src = Path(assets_dir) / f"{aid}.jpg"
            if not src.exists() and not (CACHE / f"{aid}.png").exists(): continue
            try: cut = original(src)
            except Exception as e: print("photo failed", aid, e); continue
            n += 1
            if it["kinds"].get(aid) == "street": it["ai_idx"].add(n)  # street-style should never reach the site; label it if it does. Studio photos carry no label (WAQAR, 9 Nov)
            cut.save(tmp / "img" / f"{it['sku']}-{n}.jpg", quality=86, optimize=True, progressive=True)
            issues += photo_issues(src, cut, n)
        if n < 3: issues.append(f"Sirf {n} photo. Kam az kam 4 lein: front, back, brand/size tag, aur close-up (fabric ya logo)")
        counts[it["sku"]] = n; it["n_imgs"] = n
        if issues and it["status"] != "Sold": report[it["sku"]] = issues
        if not n: it["images"] = []
    (tmp / "img" / "t" / "sz").mkdir(parents=True); (tmp / "img" / "sz").mkdir()
    for it in items:
        size_image(it, tmp / "img" / "sz" / f"{it['sku']}.jpg", tmp / "img" / f"{it['sku']}-1.jpg")
        sm = Image.open(tmp / "img" / "sz" / f"{it['sku']}.jpg"); sm.thumbnail((480, 600), Image.LANCZOS); sm.save(tmp / "img" / "t" / "sz" / f"{it['sku']}.jpg", quality=80)
    for f in (tmp / "img").glob("*.jpg"):  # 600px copies for cards, thumbnails and the home page (much lighter on mobile data)
        im = Image.open(f); im.thumbnail((600, 600), Image.LANCZOS); im.save(tmp / "img" / "t" / f.name, quality=80, optimize=True, progressive=True)
    day = datetime.now(timezone.utc) + timedelta(hours=5)
    for it in items:
        try: it["fresh"] = (day - datetime.fromisoformat(str(it["created"]).replace("Z", "+00:00"))).days < 7
        except ValueError: it["fresh"] = False
    live = [i for i in items if i["status"] != "Sold"]
    NAV.clear(); NAV.update({g: sorted({i["category"] for i in live if in_gender(i, g)}) for g in GENDERS})
    FAQ[:] = _faq()
    COLL.clear(); BRANDS.clear()
    for c in COLLECTIONS:
        n = sum(1 for i in live if c[5](i))
        if n: COLL.append((c[0], c[1], n))
    for b in {i["brand"] for i in items if i["brand"] != CFG["houseLabel"]}:
        if sum(slugify(i["brand"]) == slugify(b) for i in items) >= 2 and any(slugify(i["brand"]) == slugify(b) for i in live):
            names = [i["brand"] for i in items if slugify(i["brand"]) == slugify(b)]
            BRANDS[slugify(b)] = next((n for n in names if not n.isupper()), names[0])  # "Bershka" over "BERSHKA"
    pick = sorted((i for i in items if i["status"] == "Listed" and counts[i["sku"]]), key=lambda i: i["sku"])
    DEAL.clear()
    if pick and CFG.get("deal"):
        d = pick[day.toordinal() % len(pick)]; DEAL.update(sku=d["sku"], price=deal_price(d), day=day.strftime("%Y-%m-%d"))
    for it in items: (tmp / "p" / f"{it['sku']}.html").write_text(product_page(it, items, counts[it["sku"]]))
    (tmp / "index.html").write_text(index_page(items)); (tmp / "deals.html").write_text(deals_page(items))
    built = [c for c in COLLECTIONS if any(x[0] == c[0] for x in COLL)]
    for slug, h1, title, desc, intro, fn in built:
        its = [i for i in items if fn(i)]
        g = next((g for g in GENDERS if slug == gender_page(g)), None)
        fq = {"g": g} if g else ({"max": 999} if slug == "under-1000" else None)
        (tmp / f"{slug}.html").write_text(list_page(f"{slug}.html", h1, title, desc, intro, its, 0, filter_q=fq, skip=slug))
    if BRANDS:
        (tmp / "brands").mkdir()
        for b, html_ in brand_pages(items).items(): (tmp / "brands" / f"{b}.html").write_text(html_)
        (tmp / "brands.html").write_text(brands_index(items))
    (tmp / "feed.xml").write_text(feed_xml(items, counts))
    for slug, (title, lead, html_) in info_pages().items():
        extra = TRACK_JS if slug == "track" else ""
        faq_ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in FAQ]}] if slug == "faq" else None
        (tmp / f"{slug}.html").write_text(page(f"{title} | {CFG['storeName']}", f"{lead} {CFG['storeName']}: pre-loved branded clothes with cash on delivery all over Pakistan.", f'<section class="infop"><nav class="crumbs"><a href="index.html">Home</a> / <span>{esc(title)}</span></nav><h1>{esc(title)}</h1><p class="lead">{esc(lead)}</p>{html_}</section>', 0, None, f"{slug}.html", None, extra, faq_ld, noindex=slug in NOINDEX))
    (tmp / "wishlist.html").write_text(page(f"Wishlist | {CFG['storeName']}", "Your saved items.", WISH_BODY, 0, None, "wishlist.html", None,
        WISH_JS + SVG["heart"].replace("'", "\\'") + """</button></article>'}).join('')})()</script>""", noindex=True))
    (tmp / "photo-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    (tmp / "items.json").write_text(json.dumps([{"sku": i["sku"], "title": i["title"], "price": i["price"], "status": i["status"]} for i in items]))
    shutil.copy(Path(__file__).parent / "favicon.svg", tmp / "favicon.svg")
    (tmp / "assets").mkdir(exist_ok=True); (tmp / "assets" / CSS_FILE).write_text(CSS); (tmp / "assets" / JS_FILE).write_text(JS)
    promo = Path(__file__).parent.parent / "promo"  # social media campaign images, served at /promo/ so Metricool can fetch them
    if promo.is_dir(): shutil.copytree(promo, tmp / "promo")
    (tmp / "404.html").write_text(page(f"Not found | {CFG['storeName']}", CFG["tagline"], '<section class="nf"><h1>This page or item is no longer available</h1><p>Take a look at our other items.</p><a class="btn" href="/">Visit the store</a></section>', noindex=True, root="/"))
    base = CFG["siteUrl"].rstrip("/")
    newest = lambda its: max((str(i["updated"])[:10] for i in its), default="")
    coll_rows = [(f"{slug}.html", newest([i for i in items if fn(i)]), []) for slug, _, _, _, _, fn in built]
    brand_rows = [(f"brands/{b}.html", newest([i for i in items if slugify(i["brand"]) == b]), []) for b in BRANDS] + ([("brands.html", newest(items), [])] if BRANDS else [])
    (tmp / "sitemap.xml").write_text(sitemap(base, [("", day.strftime("%Y-%m-%d"), []), ("deals.html", day.strftime("%Y-%m-%d"), [])] + coll_rows + brand_rows + [(f"{s}.html", "", []) for s, _ in INFO if s not in NOINDEX] +
        [(f"p/{i['sku']}.html", str(i["updated"])[:10], [f"{base}/img/{i['sku']}-{n}.jpg" for n in range(1, counts[i["sku"]] + 1)]) for i in items]))
    for f in ("logo.png", "og-image.png"):
        if (Path(__file__).parent / f).exists(): shutil.copy(Path(__file__).parent / f, tmp / f)
    (tmp / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    if CFG.get("domain"): (tmp / "CNAME").write_text(CFG["domain"] + "\n")
    (tmp / ".nojekyll").write_text("")
    shutil.rmtree(OUT, ignore_errors=True); tmp.rename(OUT)
    print(f"{len(items)} items, {sum(counts.values())} photos -> {OUT}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
