"""Build the Sahiwal Thrift Co. store into public/.

Usage: python3 scripts/build.py <items_dir> <assets_dir>
  items_dir   inventory JSON exported from the Landa Lister (one file per SKU)
  assets_dir  original photos named <asset id>.jpg

Photos get their background removed (rembg) and are placed on a soft solid
colour picked from the garment. Cut-outs are cached in cache/ by asset id, so
only new photos are processed on later runs.
"""
import colorsys, html, json, os, re, shutil, sys, urllib.parse
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

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


def wa_digits():
    d = re.sub(r"\D", "", CFG["whatsapp"])
    return "92" + d[1:] if d.startswith("0") else d


def order_link(it=None):
    msg = (f"Assalam o alaikum! Mujhe ye item chahiye: {it['title']} ({it['sku']}), {rs(it['price'])}. Kya available hai?"
           if it else "Assalam o alaikum! Mujhe aap ke store ke baare mein maloomat chahiye.")
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
        brand = d.get("brand") or CFG["houseLabel"]
        specs = [s for s in (c.get("specs") or []) if s.get("value") and not re.match(r"(?i)^(sku|condition|grade|delivery|price)$", s.get("label", "")) and not NEG.search(str(s["value"]))]
        meas = {k: v for k, v in (d.get("meas") or {}).items() if v}
        retail = d.get("retailPkr") or 0
        items.append({
            "sku": d["sku"], "status": d["status"], "price": d.get("price") or 0, "retailPkr": retail if retail > (d.get("price") or 0) else 0,
            "retailUsd": d.get("retailUsd") or (round(retail / 280) if retail else 0), "title": c.get("title") or f"{brand} {d.get('category', '')}",
            "brand": brand, "category": d.get("category") or "Clothing", "gender": d.get("gender") or "", "size": d.get("size") or "",
            "color": d.get("color") or "", "cond": cond_label(d), "fix": fix_note(d), "desc": positive(c.get("description_en")),
            "specs": specs, "meas": meas, "images": d.get("images") or [], "created": d.get("createdAt") or "",
        })
    return sorted(items, key=lambda i: i["created"], reverse=True)


# ---------- pages ----------
CSS = (Path(__file__).parent / "store.css").read_text()
ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.9-2.8-1.2-4.5-4.1-4.7-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'


def off(it): return round((1 - it["price"] / it["retailPkr"]) * 100) if it["retailPkr"] else 0


def page(title, desc, body, depth=0, image=None, canonical="", wa=None, extra=""):
    up = "../" * depth; base = CFG["siteUrl"].rstrip("/")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(desc[:160])}"><link rel="canonical" href="{esc(base + '/' + canonical)}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc[:200])}">
{f'<meta property="og:image" content="{esc(base + "/" + image)}">' if image else ''}<meta name="theme-color" content="#15201d">
<link rel="icon" href="{up}favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>
<div class="topbar">Cash on delivery all over Pakistan · Order on WhatsApp {esc(CFG['whatsapp'])}</div>
<header class="hd"><a class="logo" href="{up}index.html"><span class="mark">ST</span><span>{esc(CFG['storeName'])}</span></a>
<nav><a href="{up}index.html#shop">Shop</a><a href="{up}index.html#how">How to order</a><a class="hd-wa" href="{esc(order_link())}" target="_blank" rel="noopener">{ICON}<span>WhatsApp</span></a></nav></header>
<main>{body}</main>
<footer class="ft"><div class="ft-in"><div><strong>{esc(CFG['storeName'])}</strong><p>{esc(CFG['tagline'])}</p></div>
<div><strong>Order</strong><p>WhatsApp / Call <a href="tel:{esc(CFG['whatsapp'].replace(' ', ''))}">{esc(CFG['whatsapp'])}</a><br>Cash on delivery all over Pakistan</p></div>
<div><strong>Follow</strong><p>Instagram {esc(CFG['handle'])}</p></div></div><p class="copy">© {datetime.now().year} {esc(CFG['storeName'])}</p></footer>
<a class="fab" href="{esc(wa or order_link())}" target="_blank" rel="noopener" aria-label="Buy or ask on WhatsApp">{ICON}<span>{'Buy / Info' if wa else 'Chat'}</span></a>
{extra}</body></html>"""


def card(it, up=""):
    img = f'{up}img/{it["sku"]}-1.jpg' if it["images"] else ""
    sold = it["status"] == "Sold"
    return f"""<a class="card{' is-sold' if sold else ''}" href="{up}p/{esc(it['sku'])}.html" data-cat="{esc(it['category'])}" data-g="{esc(it['gender'])}" data-size="{esc(it['size'])}" data-price="{it['price']}" data-off="{off(it)}" data-new="{esc(it['created'])}" data-q="{esc((it['title'] + ' ' + it['brand'] + ' ' + it['category'] + ' ' + it['color']).lower())}">
<div class="ci">{f'<img src="{img}" alt="{esc(it["title"])}" loading="lazy" width="600" height="600">' if img else ''}{'<span class="b-sold">Sold</span>' if sold else (f'<span class="b-off">-{off(it)}%</span>' if off(it) else '')}{f'<span class="b-size">{esc(it["size"])}</span>' if it['size'] else ''}</div>
<div class="cb"><span class="cbrand">{esc(it['brand'])}</span><span class="ct">{esc(it['title'])}</span><span class="cp"><b>{rs(it['price'])}</b>{f'<s>{rs(it["retailPkr"])}</s>' if it['retailPkr'] else ''}</span></div></a>"""


def offer_box(it):
    mn = -(-int(it["price"] * .6) // 50) * 50
    if not CFG.get("offersUrl"):
        msg = urllib.parse.quote(f"Assalam o alaikum! {it['title']} ({it['sku']}) ke liye meri offer: Rs ")
        return f'<a class="offer-btn" href="https://wa.me/{wa_digits()}?text={msg}" target="_blank" rel="noopener">Make an offer</a>'
    return f"""<section class="offer" id="offer" data-sku="{esc(it['sku'])}" data-price="{it['price']}" data-min="{mn}">
<div class="o-hd"><div><b>Make an offer</b><span class="o-sub" id="o-sub">Apni price batayein. {"Pehli offer ke 48 ghante baad sab se oonchi offer ko item milta hai, agar koi poori price par na le le."}</span></div><span class="o-timer" id="o-timer" hidden></span></div>
<div class="o-stats"><div><span>Highest offer</span><b id="o-top">-</b></div><div><span>Offers</span><b id="o-count">0</b></div><div><span>Min offer</span><b id="o-min">{rs(mn)}</b></div></div>
<form id="o-form" class="o-form"><label>Aap ki offer (Rs)<input name="amount" type="number" inputmode="numeric" min="{mn}" max="{it['price'] - 1}" required placeholder="{mn}"></label>
<label>Naam<input name="name" required maxlength="40" autocomplete="name"></label>
<label>WhatsApp number<input name="phone" type="tel" inputmode="tel" required placeholder="03xx xxxxxxx" autocomplete="tel"></label>
<button type="submit">Send offer</button></form>
<p class="o-msg" id="o-msg" role="status"></p>
<div class="o-mine" id="o-mine" hidden></div>
<button type="button" class="o-link" id="o-check">Meri offer ka status dekhein</button></section>"""


def product_page(it, all_items, n_imgs):
    sku = it["sku"]; sold = it["status"] == "Sold"
    imgs = [f"../img/{sku}-{i}.jpg" for i in range(1, n_imgs + 1)]
    meas = " · ".join(f"{k.title()} {v}\"" for k, v in it["meas"].items())
    related = [o for o in all_items if o["sku"] != sku and o["status"] != "Sold" and (o["category"] == it["category"] or o["gender"] == it["gender"])][:4]
    gallery = "".join(f'<img src="{s}" alt="{esc(it["title"])} photo {i + 1}" width="1200" height="1200"{" loading=lazy" if i else ""}>' for i, s in enumerate(imgs))
    thumbs = "".join(f'<button type="button" data-i="{i}" aria-label="Photo {i + 1}"{" aria-current=true" if not i else ""}><img src="{s}" alt=""></button>' for i, s in enumerate(imgs)) if len(imgs) > 1 else ""
    details = [("Brand", it["brand"]), ("Category", it["category"]), ("For", it["gender"]), ("Size", it["size"]), ("Colour", it["color"])] + [(s["label"], s["value"]) for s in it["specs"] if s["label"].lower() not in ("brand", "size", "color", "colour", "gender", "category")]
    seen = set(); details = [(k, v) for k, v in details if v and not (k.lower() in seen or seen.add(k.lower()))]
    save = it["retailPkr"] - it["price"] if it["retailPkr"] else 0
    wa = order_link(it)
    body = f"""<nav class="crumbs"><a href="../index.html">Home</a> / <a href="../index.html#shop">{esc(it['category'])}</a> / <span>{esc(sku)}</span></nav>
<section class="pd"><div class="gal"><div class="gal-main" id="gal">{gallery}</div>{f'<div class="gal-th">{thumbs}</div>' if thumbs else ''}</div>
<div class="info"><span class="pbrand">{esc(it['brand'])}</span><h1>{esc(it['title'])}</h1>
<div class="pp"><b>{rs(it['price'])}</b>{f'<s>{rs(it["retailPkr"])}</s><span class="b-off">-{off(it)}%</span>' if it['retailPkr'] else ''}</div>
{f'<p class="save">Retail abroad ~${it["retailUsd"]}. You save {rs(save)}.</p>' if save > 0 else ''}
<div class="tags"><span class="tag ok">{esc(it['cond'])}</span>{f'<span class="tag">Size {esc(it["size"])}</span>' if it['size'] else ''}{f'<span class="tag">{esc(it["gender"])}</span>' if it['gender'] else ''}<span class="tag">{'Sold' if sold else 'Only 1 piece'}</span></div>
{'<p class="soldmsg">Ye item bik chuka hai. Neeche milte julte items dekhein ya WhatsApp par poochein.</p>' if sold else f'<a class="buy" href="{esc(wa)}" target="_blank" rel="noopener">{ICON}Buy now on WhatsApp</a>' + offer_box(it)}
<div class="perks"><div><b>COD</b><span>Cash on delivery all over Pakistan</span></div><div><b>Checked</b><span>Washed, pressed and hand-checked</span></div><div><b>1 piece</b><span>Every item is one of a kind</span></div></div>
<details open><summary>Description</summary><p>{esc(it['desc'])}</p>{f'<p class="muted">{esc(it["fix"])}</p>' if it['fix'] else ''}</details>
{f'<details open><summary>Size &amp; fit</summary><p>Size {esc(it["size"])}{". Measurements: " + esc(meas) if meas else ""}. Size ka sawal ho to WhatsApp par poochein, hum naap kar bata denge.</p></details>' if it['size'] else ''}
<details><summary>Details</summary><dl>{''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k, v in details)}<dt>Item code</dt><dd>{esc(sku)}</dd></dl></details>
<details><summary>How to order</summary><p>1. "Buy on WhatsApp" dabayein, item ka naam khud likha aa jayega.<br>2. Apna naam, address aur phone number bhejein.<br>3. Parcel ghar aane par payment karein (COD).</p></details>
<button class="share" type="button" data-share>Share this item</button></div></section>
{f'<section class="rel"><h2>You may also like</h2><div class="grid">{"".join(card(o, "../") for o in related)}</div></section>' if related else ''}
{'' if sold else f'<div class="sticky"><div><b>{rs(it["price"])}</b><span>{esc(it["size"] and "Size " + it["size"])}</span></div><a href="{esc(wa)}" target="_blank" rel="noopener">{ICON}Buy on WhatsApp</a></div>'}"""
    js = offer_js() + """<script>(function(){var g=document.getElementById('gal'),t=document.querySelectorAll('.gal-th button');t.forEach(function(b){b.onclick=function(){g.scrollTo({left:g.clientWidth*+b.dataset.i,behavior:'smooth'})}});
g&&g.addEventListener('scroll',function(){var i=Math.round(g.scrollLeft/g.clientWidth);t.forEach(function(b){b.setAttribute('aria-current',+b.dataset.i===i)})},{passive:true});
var s=document.querySelector('[data-share]');s&&(s.onclick=function(){var d={title:document.title,url:location.href};if(navigator.share)navigator.share(d).catch(function(){});else navigator.clipboard.writeText(location.href).then(function(){s.textContent='Link copied'})})})()</script>"""
    return page(f"{it['title']} | {CFG['storeName']}", it["desc"] or it["title"], body, 1, f"img/{sku}-1.jpg" if n_imgs else None, f"p/{sku}.html", None if sold else wa, js)


def offer_js():
    url = CFG.get("offersUrl")
    if not url: return ""
    return """<script>(function(){var U=%s,box=document.getElementById('offer');if(!box)return;var sku=box.dataset.sku,$=function(i){return document.getElementById(i)},st=null,tick=null;
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function get(q){return fetch(U+'?'+new URLSearchParams(q)).then(function(r){return r.json()})}
function post(b){return fetch(U,{method:'POST',body:JSON.stringify(b)}).then(function(r){return r.json()})}
function show(s){if(!s||s.error)return;st=s;$('o-top').textContent=s.highest?rs(s.highest):'Abhi koi nahi';$('o-count').textContent=s.count;var mn=s.highest?Math.max(s.minOffer,s.highest+s.step):s.minOffer;$('o-min').textContent=rs(mn);box.querySelector('[name=amount]').min=mn;box.querySelector('[name=amount]').placeholder=mn;
 if(s.state!=='open'){$('o-form').hidden=true;$('o-sub').textContent=s.state==='won'?'Is item par deal final ho chuki hai.':s.state==='sold'?'Ye item bik chuka hai.':'Is item par offers band hain.'}
 clearInterval(tick);if(s.endsAt&&s.state==='open'){var t=$('o-timer');t.hidden=false;var f=function(){var d=s.endsAt-Date.now();if(d<=0){t.textContent='Closing...';return}var h=Math.floor(d/36e5),m=Math.floor(d%%36e5/6e4);t.textContent=h+'h '+m+'m left'};f();tick=setInterval(f,3e4)}}
function msg(t,ok){var m=$('o-msg');m.textContent=t;m.className='o-msg '+(ok?'ok':'err')}
function wa(t){return 'https://wa.me/%s?text='+encodeURIComponent(t)}
function mine(phone){get({a:'mine',sku:sku,phone:phone}).then(function(r){var el=$('o-mine');el.hidden=false;if(r.error){el.textContent=r.error;return}if(r.none){el.textContent='Is number se koi offer nahi mili.';return}
 var h='<p>Aap ki offer: <b>'+rs(r.amount)+'</b> · '+({'new':'Pending','countered':'Counter offer aayi hai','won':'Deal final!','lost':'Ye offer nahi jeeti'}[r.status]||r.status)+'</p>';
 if(r.status==='countered')h+='<p>Hamari counter offer: <b>'+rs(r.counter)+'</b></p><button type="button" id="o-acc">Accept '+rs(r.counter)+'</button>';
 if(r.status==='won')h+='<a class="buy" target="_blank" rel="noopener" href="'+wa('Assalam o alaikum! '+sku+' par meri deal '+rs(r.amount)+' final hui hai. Mera address ye hai: ')+'">Address bhejein (WhatsApp)</a>';
 el.innerHTML=h;var a=$('o-acc');a&&(a.onclick=function(){a.disabled=true;post({a:'accept',sku:sku,phone:phone}).then(function(x){if(x.error){msg(x.error)}else{msg('Deal final! WhatsApp par address bhejein.',1)}mine(phone);refresh()})})})}
function refresh(){get({a:'state',sku:sku}).then(show).catch(function(){})}
var saved='';try{saved=localStorage.getItem('st-phone')||'';var nm=localStorage.getItem('st-name')||'';box.querySelector('[name=phone]').value=saved;box.querySelector('[name=name]').value=nm}catch(e){}
$('o-form').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),b={a:'offer',sku:sku,name:f.get('name'),phone:f.get('phone'),amount:f.get('amount')},btn=e.target.querySelector('button');btn.disabled=true;msg('Bhej raha hoon...',1);
 try{localStorage.setItem('st-phone',b.phone);localStorage.setItem('st-name',b.name)}catch(x){}
 post(b).then(function(r){btn.disabled=false;if(r.error){msg(r.error);return}msg(r.message,1);show(r);mine(b.phone)}).catch(function(){btn.disabled=false;msg('Network masla, dobara try karein')})};
$('o-check').onclick=function(){var p=box.querySelector('[name=phone]').value||prompt('Apna WhatsApp number');if(p)mine(p)};
refresh();if(saved)mine(saved)})()</script>""" % (json.dumps(url), wa_digits())


def index_badges_js():
    url = CFG.get("offersUrl")
    if not url: return ""
    return """<script>fetch(%s+'?a=all').then(function(r){return r.json()}).then(function(m){document.querySelectorAll('.card').forEach(function(c){var s=m[c.getAttribute('href').replace(/^.*[/]|[.]html$/g,'')];if(!s||!s.highest||c.classList.contains('is-sold'))return;var b=document.createElement('span');b.className='b-offer';b.textContent=s.state==='won'?'Deal done':'Offer Rs '+Math.round(s.highest).toLocaleString('en-PK')+' · '+s.count;c.querySelector('.ci').appendChild(b)})}).catch(function(){})</script>""" % json.dumps(url)


def index_page(items):
    live = [i for i in items if i["status"] != "Sold"]
    cats = sorted({i["category"] for i in items}); sizes = [s for s in dict.fromkeys(i["size"] for i in live) if s]
    body = f"""<section class="hero"><div><p class="eyebrow">Hand-picked pre-loved fashion</p><h1>International brands.<br>Affordable prices.</h1>
<p>{esc(CFG['tagline'])}</p><a class="btn" href="#shop">Shop now</a></div></section>
<section class="trust"><div><b>COD</b><span>All over Pakistan</span></div><div><b>Checked</b><span>Washed and pressed</span></div><div><b>Originals</b><span>International brands</span></div><div><b>WhatsApp</b><span>Order in 1 message</span></div></section>
<section id="shop" class="shop"><div class="shop-hd"><h2>Shop all <span class="muted" id="count">{len(live)} items</span></h2>
<input id="q" type="search" placeholder="Search brand, item, colour" aria-label="Search"></div>
<div class="filters"><div class="chips" id="g">{''.join(f'<button type="button" data-v="{g}">{g}</button>' for g in ['All', 'Men', 'Women', 'Kids'])}</div>
<select id="cat" aria-label="Category"><option value="">All categories</option>{''.join(f'<option>{esc(c)}</option>' for c in cats)}</select>
<select id="size" aria-label="Size"><option value="">All sizes</option>{''.join(f'<option>{esc(s)}</option>' for s in sizes)}</select>
<select id="sort" aria-label="Sort"><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="off">Biggest saving</option></select>
<label class="chk"><input type="checkbox" id="sold"> Show sold</label></div>
<div class="grid" id="grid">{''.join(card(i) for i in items)}</div><p class="empty" id="empty" hidden>Is filter mein abhi kuch nahi. Filter badlein ya WhatsApp par poochein, hum dhoond denge.</p></section>
<section id="how" class="how"><h2>How to order</h2><ol><li><b>Item chunein</b><span>Photos aur size dekh kar pasand karein.</span></li><li><b>WhatsApp par bhejein</b><span>"Buy on WhatsApp" dabayein, item code khud chala jayega.</span></li><li><b>Ghar par payment</b><span>Parcel milne par cash on delivery.</span></li></ol></section>"""
    js = """<script>(function(){var g='All',q=document.getElementById('q'),cat=document.getElementById('cat'),size=document.getElementById('size'),sort=document.getElementById('sort'),sold=document.getElementById('sold'),grid=document.getElementById('grid'),cards=[].slice.call(grid.children);
function run(){var v=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var ok=(g==='All'||c.dataset.g===g||(g!=='Kids'&&c.dataset.g==='Unisex'))&&(!cat.value||c.dataset.cat===cat.value)&&(!size.value||c.dataset.size===size.value)&&(!v||c.dataset.q.indexOf(v)>-1)&&(sold.checked||!c.classList.contains('is-sold'));c.hidden=!ok;if(ok)n++});
var s=sort.value;cards.slice().sort(function(a,b){return s==='low'?a.dataset.price-b.dataset.price:s==='high'?b.dataset.price-a.dataset.price:s==='off'?b.dataset.off-a.dataset.off:(a.dataset['new']<b.dataset['new']?1:-1)}).forEach(function(c){grid.appendChild(c)});
document.getElementById('count').textContent=n+' items';document.getElementById('empty').hidden=n>0}
document.querySelectorAll('#g button').forEach(function(b){b.onclick=function(){g=b.dataset.v;document.querySelectorAll('#g button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});run()}});
document.querySelector('#g button').setAttribute('aria-pressed','true');[q,cat,size,sort,sold].forEach(function(e){e.addEventListener('input',run)});run()})()</script>"""
    return page(f"{CFG['storeName']} | International brands at affordable prices", CFG["tagline"], body, 0, f"img/{live[0]['sku']}-1.jpg" if live and live[0]["images"] else None, "index.html", None, js + index_badges_js())


def main(items_dir, assets_dir):
    items = load_items(items_dir)
    tmp = ROOT / "public.new"; shutil.rmtree(tmp, ignore_errors=True); (tmp / "img").mkdir(parents=True); (tmp / "p").mkdir()
    counts, report = {}, {}
    for it in items:
        n = 0; issues = []
        for aid in it["images"]:
            src = Path(assets_dir) / f"{aid}.jpg"
            if not src.exists() and not (CACHE / f"{aid}.png").exists(): continue
            try: cut = cutout(src)
            except Exception as e: print("cutout failed", aid, e); continue
            n += 1; studio(cut, backdrop(cut)).save(tmp / "img" / f"{it['sku']}-{n}.jpg", quality=86, optimize=True, progressive=True)
            issues += photo_issues(src, cut, n)
        if n < 3: issues.append(f"Sirf {n} photo. Kam az kam 4 lein: front, back, brand/size tag, aur close-up (fabric ya logo)")
        counts[it["sku"]] = n
        if issues and it["status"] != "Sold": report[it["sku"]] = issues
        if not n: it["images"] = []
    for it in items: (tmp / "p" / f"{it['sku']}.html").write_text(product_page(it, items, counts[it["sku"]]))
    (tmp / "index.html").write_text(index_page(items))
    (tmp / "photo-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1))
    (tmp / "items.json").write_text(json.dumps([{"sku": i["sku"], "title": i["title"], "price": i["price"], "status": i["status"]} for i in items]))
    shutil.copy(Path(__file__).parent / "favicon.svg", tmp / "favicon.svg")
    (tmp / "404.html").write_text(page(f"Not found | {CFG['storeName']}", CFG["tagline"], '<section class="nf"><h1>Ye item ab available nahi</h1><p>Hamare baqi items dekhein.</p><a class="btn" href="' + esc(CFG['siteUrl']) + '/">Store dekhein</a></section>'))
    base = CFG["siteUrl"].rstrip("/")
    (tmp / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + f"<url><loc>{base}/</loc></url>" + "".join(f"<url><loc>{base}/p/{i['sku']}.html</loc></url>" for i in items) + "</urlset>")
    (tmp / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}/sitemap.xml\n")
    (tmp / ".nojekyll").write_text("")
    shutil.rmtree(OUT, ignore_errors=True); tmp.rename(OUT)
    print(f"{len(items)} items, {sum(counts.values())} photos -> {OUT}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
