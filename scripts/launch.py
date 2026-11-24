"""Website Grand Launch gift offer (site.json "launch").

Gents (men / unisex) jacket of Rs 1,999+: a gents sweatshirt (Rs 599 piece) FREE, plus free delivery.
Ladies jacket (Rs 1,199+): a kids sweatshirt (Rs 399 piece) FREE, plus free delivery. One free gift per order (WAQAR 24 Nov).
Gifts are real one-off pieces from the live stock; site.js shows the eligible gifts in the bag and the customer taps "Add free" (never auto-added, WAQAR 23 Nov);
sold or reserved pieces are skipped. The offer switches itself on at "start" and off at "end" (Pakistan time) in the browser.

- cfg(items)       the gift pools, embedded at the top of the site.js asset as window.TPL
- items_from(html) the same item fields read back from a built index.html (refresh_head.py, no Landa Lister needed)
- build_page(out)  writes grand-launch.html from the built deals.html shell and the cards on index.html

build.py and refresh_head.py both call these, so a full rebuild and a quick refresh give the same result.
"""
import html, json, re, urllib.parse
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "site.json").read_text())
L = CFG.get("launch") or {}
JACKET = re.compile(r"(?i)jacket|puffer|coat|parka|bomber|leather|denim")
NOT_JACKET = re.compile(r"(?i)vest|gilet|sleeveless")
KID_SIZE = re.compile(r"(?i)\d\s*-?\s*\d*\s*y\b|year|month|\bkids?\b")


def _ms(iso): return int(datetime.fromisoformat(iso).timestamp() * 1000)
def rs(n): return f"Rs {int(n):,}"
def esc(s): return html.escape(str(s), quote=True)


def active():
    return bool(L.get("start") and L.get("end"))


def adult(it): return not KID_SIZE.search(it.get("size") or "")


def is_jacket(it):
    return (JACKET.search(it["category"]) and not NOT_JACKET.search(f"{it['category']} {it.get('name', '')}")
            and it["gender"] in ("Men", "Unisex") and adult(it) and it["price"] >= L.get("min", 1999))


def is_ladies_jacket(it):
    return (JACKET.search(it["category"]) and not NOT_JACKET.search(f"{it['category']} {it.get('name', '')}")
            and it["gender"] == "Women" and adult(it) and it["price"] >= L.get("womenMin", 1199))


def is_kids_gift(it):
    return ("sweat" in it["category"].lower() and (it["gender"] == "Kids" or (it["gender"] == "Unisex" and not adult(it)))
            and 0 < it["price"] <= L.get("kidsMax", 399))


def is_men_gift(it):
    lo, hi = L.get("menPrice", [599, 599])
    return "sweat" in it["category"].lower() and it["gender"] in ("Men", "Unisex") and adult(it) and lo <= it["price"] <= hi


def _bag(it): return {"sku": it["sku"], "b": it["brand"], "n": it["name"], "p": it["price"], "s": it["size"], "i": it.get("img", "")}


def pools(items):
    live = [i for i in items if not i.get("sold")]
    return ([i for i in live if is_jacket(i)] + [i for i in live if is_ladies_jacket(i)], sorted((i for i in live if is_kids_gift(i)), key=lambda i: (i["brand"] == CFG.get("houseLabel"), -i["price"], i["sku"])),
            sorted((i for i in live if is_men_gift(i)), key=lambda i: (i["brand"] == CFG.get("houseLabel"), -i["price"], i["sku"])))


def cfg(items):
    """items: dicts with sku, brand, name, price, size, category, gender, img, sold."""
    if not active(): return None
    q, kids, men = pools(items)
    return {"name": L.get("name", "Grand Launch"), "start": _ms(L["start"]), "end": _ms(L["end"]), "min": L.get("min", 1999),
            "endTxt": datetime.fromisoformat(L["end"]).strftime("%-d %b, %-I:%M %p"),
            "q": [i["sku"] for i in q], "qw": [i["sku"] for i in q if i["gender"] == "Women"], "wmin": L.get("womenMin", 1199), "kids": [_bag(i) for i in kids], "men": [_bag(i) for i in men]}


def js_prefix(items):
    c = cfg(items)
    return f"window.TPL={json.dumps(c, ensure_ascii=False)};\n" if c else ""


CARD_RX = re.compile(r'<article class="card([^"]*)" data-sku="([^"]+)" data-cat="([^"]*)" data-g="([^"]*)" data-size="([^"]*)".*?</article>', re.S)


def items_from(index_html):
    out = []
    for m in CARD_RX.finditer(index_html):
        a = re.search(r'data-add="([^"]+)"', m.group(0)) or re.search(r'data-wish="([^"]+)"', m.group(0))
        if not a: continue
        d = json.loads(html.unescape(a.group(1)))
        out.append({"sku": d["sku"], "brand": d["b"], "name": d["n"], "price": d["p"], "size": d.get("s") or "", "img": d.get("i") or "",
                    "category": html.unescape(m.group(3)), "gender": m.group(4), "sold": "is-sold" in m.group(1), "card": m.group(0)})
    return out


def _cards(items, gift=False):
    out = []
    for i in items:
        c = i["card"]
        if gift:  # a gift is never bought on this page: no + button, a FREE badge instead of the price row
            c = re.sub(r'<button type="button" class="cadd".*?</button>', "", c, flags=re.S)
            c = c.replace('<div class="ci">', '<div class="ci"><span class="b-glfree">FREE with a jacket</span>', 1)
            # original price struck through, FREE under it (WAQAR 23 Nov)
            c = re.sub(r'<span class="cp[^"]*">(?:<(?!/?span)[^>]*>|[^<])*</span>', "", c)
            c = c.replace("</div></a>", f'<span class="gl-cp"><s>{rs(i["price"])}</s><b>FREE</b></span></div></a>', 1)
        else:
            c = c.replace('<div class="ci">', '<div class="ci"><span class="b-gl">🎁 Free gift inside</span>', 1)
        out.append(c)
    return "".join(out)


def build_page(out):
    out = Path(out)
    page = out / "grand-launch.html"
    if not active():
        if page.exists(): page.unlink()
        return
    items = items_from((out / "index.html").read_text())
    q, kids, men = pools(items)
    shell = (out / "deals.html").read_text()
    head, tail = shell[:shell.index("<main>") + 6], shell[shell.index("</main>"):]
    name = L.get("name", "Grand Launch")
    end = datetime.fromisoformat(L["end"]); start = datetime.fromisoformat(L["start"])
    dates = f"{start.strftime('%-d')}–{end.strftime('%-d %b')}" if start.month == end.month else f"{start.strftime('%-d %b')}–{end.strftime('%-d %b')}"
    title = f"{name}: buy a jacket, get a sweatshirt free | {CFG['storeName']}"
    mn = L.get("menPrice", [599, 599]); wmin = rs(L.get("womenMin", 1199)); kmax = rs(L.get("kidsMax", 399))
    desc = (f"{name} at {CFG['storeName']}: buy a gents jacket of {rs(L.get('min', 1999))}+ and get a gents sweatshirt free, buy a ladies jacket and get a kids sweatshirt free. "
            f"Free delivery, cash on delivery all over Pakistan. Until {end.strftime('%-d %b')}.")
    head = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", head, 1, re.S)
    head = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', lambda m: m.group(1) + esc(desc), head)
    head = re.sub(r'(<meta (?:property|name)="(?:og:title|twitter:title|og:image:alt)" content=")[^"]*', lambda m: m.group(1) + esc(title), head)
    head = head.replace("/deals.html\"", "/grand-launch.html\"")
    head = re.sub(r"<script type=\"application/ld\+json\">.*?</script>", "", head, flags=re.S)
    wa = re.sub(r"\D", "", CFG["whatsapp"]); wa = "92" + wa[1:] if wa.startswith("0") else wa
    wa_msg = f"Hi! I want to order with the {name} offer (buy a jacket, get a sweatshirt free). Which jackets are available?"
    clock = '<div class="gl-clock" data-gl-clock aria-label="Time left"><span><b data-u="d">0</b>days</span><span><b data-u="h">00</b>hrs</span><span><b data-u="m">00</b>min</span><span><b data-u="s">00</b>sec</span></div>'
    rules = [f"Valid on website orders from {start.strftime('%-d %b')} to {end.strftime('%-d %b, %-I:%M %p')} (Pakistan time). After that the gifts switch off automatically.",
             f"Gents jackets: men's or unisex jackets, puffers and coats priced {rs(L.get('min', 1999))} or more. Free gift: one gents sweatshirt ({rs(mn[0])} piece).",
             f"Ladies jackets: women's jackets, puffers and coats priced {wmin} or more. Free gift: one kids sweatshirt ({kmax} piece).",
             "Qualifying jackets are marked “Free gift inside”. One free gift per order, while stock lasts.",
             "After you add a jacket, your bag shows the free gifts you can pick. Tap “Add free” on the one you want (with a gents jacket you can also pick a kids sweatshirt).",
             "Delivery is free on every order with a qualifying jacket. Cash on delivery all over Pakistan.",
             "Gifts are real one-off pieces from our stock. If the gift you want sells out, pick another one; if none are left, you still get free delivery.",
             "The free gift replaces the bundle discount and the welcome voucher on that order (it is worth more).",
             "Returns: 7 days as usual. If you return the jacket, please return the free gift with it."]
    body = f"""<section class="glh"><div class="glh-in"><p class="glh-k"><span>{esc(CFG['storeName'])}.store</span> {esc(name)} · {esc(dates)}</p>
<h1>Buy a jacket.<br><em>Get a sweatshirt FREE.</em></h1>
<div class="glh-tiers"><div class="glt hot"><b>Gents</b><span>jacket {esc(rs(L.get('min', 1999)))}+</span><i>→</i><strong>Gents sweatshirt FREE</strong><small>({esc(rs(mn[0]))} piece) + free delivery</small></div>
<div class="glt"><b>Ladies</b><span>jacket {esc(wmin)}+</span><i>→</i><strong>Kids sweatshirt FREE</strong><small>({esc(kmax)} piece) + free delivery</small></div></div>
{clock}<div class="cta"><a class="btn hot" href="#gl-jackets">Shop the jackets</a><a class="btn ghost" href="https://wa.me/{wa}?text={esc(urllib.parse.quote(wa_msg))}" target="_blank" rel="noopener">Order on WhatsApp</a></div>
<p class="gl-ended">This offer has ended. Thank you for celebrating our launch with us! <a href="deals.html">See current offers</a></p></div></section>
<section class="glsteps"><ol><li><b>Add a jacket</b><span>Any gents or ladies jacket marked “Free gift inside”.</span></li><li><b>Pick your free gift</b><span>Your bag shows the free sweatshirts you can choose. Tap “Add free”.</span></li><li><b>Pay on delivery</b><span>Free delivery, cash on delivery, 7-day returns.</span></li></ol></section>
<section class="shop coll" id="gl-jackets"><h2>Jackets that unlock a free gift <span class="muted">{len(q)} pieces, one of each</span></h2><div class="grid">{_cards(q)}</div></section>
<section class="shop coll gl-gifts" id="gl-gifts"><h2>Free with a gents jacket: gents sweatshirts <span class="muted">{len(men)} in stock</span></h2><div class="grid">{_cards(men, True)}</div>
<h2>Free with a ladies jacket: kids sweatshirts <span class="muted">{len(kids)} in stock</span></h2><div class="grid">{_cards(kids, True)}</div></section>
<section class="dealsp"><div class="drules"><h2>How the {esc(name)} offer works</h2><ol>{''.join(f'<li>{esc(r)}</li>' for r in rules)}</ol></div></section>"""
    page.write_text(head.replace("<main>", '<main class="glp">') + body + tail)
    sm = out / "sitemap.xml"
    if sm.exists() and "grand-launch.html" not in sm.read_text():
        base = CFG["siteUrl"].rstrip("/")
        sm.write_text(sm.read_text().replace("</urlset>", f"<url><loc>{base}/grand-launch.html</loc><lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod></url>\n</urlset>"))
    print(f"grand-launch.html: {len(q)} jackets, {len(kids)} kids gifts, {len(men)} men's gifts")
