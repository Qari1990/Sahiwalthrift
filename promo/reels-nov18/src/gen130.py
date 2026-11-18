# ABCThrift reels 130-133: "rack flip" category reels from real photos + real tag photos
import sys, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = sys.argv[1]; OUT = sys.argv[2]; ONLY = sys.argv[3] if len(sys.argv) > 3 else None
W, H, FPS = 1080, 1920, 30
BS = '/mnt/skills/examples/canvas-design/canvas-fonts/BigShoulders-Bold.ttf'
IB = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
IK = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
IS = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
ACC = (47, 91, 255); NUM = '0322 4631990'
F = lambda p, s: ImageFont.truetype(p, s)
# sku, brand, size, price, tag focus (x,y), tag zoom
CATS = {
 '130-jackets': ('WINTER\nJACKETS', '& COATS · MEN + WOMEN', [
  ('PUF-0047','PARAGONA','L',1999,(.48,.47),1.15), ('PUF-0044','H&M','L',1999,(.46,.40),1.15),
  ('PUF-0045','CARS JEANS','L',1999,(.42,.48),1.12), ('COA-0038','RECEL','L',1599,(.47,.42),1.15),
  ('HOO-0033','SIGGI','3XL',1199,(.47,.50),1.25), ('COA-0046','MIPHA','XL',1199,(.48,.45),1.12),
  ('COA-0043','JODI','L',1199,(.42,.38),1.12)]),
 '131-hoodies': ('HOODIES\n& SWEATS', 'MEN · WINTER', [
  ('SWE-0050','BERSHKA','M',1599,(.48,.52),1.15), ('HOO-0052','BLUE GEAR','L',999,(.34,.32),1.15),
  ('PUF-0049','QUECHUA','L',599,(.45,.56),1.12), ('SWE-0048','MARINER','XL',599,(.42,.50),1.15),
  ('SWE-0051','DASSY','M',599,(.48,.50),1.15)]),
 '132-kids': ('KIDS\nWINTER', 'AGES 4-12 · BOYS + GIRLS', [
  ('SWE-0057','NARUTO','9-10Y',1499,(.48,.47),1.12), ('KID-0056','NORTHVILLE','110 CM',699,(.45,.50),1.12),
  ('SWE-0058','C&A','10Y',499,(.46,.46),1.25), ('SWE-0027','OKAÏDI','12Y',499,(.45,.44),1.2),
  ('SWE-0054','INEXTENSO','10Y',399,(.48,.56),1.6), ('SWE-0036','ORCHESTRA','10Y',399,(.47,.30),1.35)]),
 '133-vests': ('PUFFER\nVESTS', 'MEN · SLEEVELESS WARMTH', [
  ('PUF-0041','GIORDANO','L',999,(.49,.60),1.5), ('PUF-0018','KLAUS FEUNER','95',999,(.48,.42),1.3),
  ('PUF-0019','RIVERS','M',999,(.47,.63),1.6)]),
}
def ease(x): return 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, x)))
def rs(n): return f'Rs {n:,}'

def prep_front(p):
    im = Image.open(p).convert('RGB'); w, h = im.size; r = h / w
    s0 = W / w; k = 1.0 if r >= 1.7 else (1.12 if r >= 1.2 else 1.32)
    bg = im.resize((W, H)).filter(ImageFilter.GaussianBlur(40))
    bg = Image.blend(bg, Image.new('RGB', (W, H), (0, 0, 0)), 0.45)
    if r >= 1.7: k = max(1.0, H / (h * s0))
    return dict(im=im, s=s0 * k, bg=bg, c=(w / 2, h / 2 + (0 if r >= 1.7 else -h * 0.02)))
def prep_tag(p, foc, z):
    im = Image.open(p).convert('RGB'); w, h = im.size
    s = max(W / w, H / h) * z
    return dict(im=im, s=s, bg=None, c=(foc[0] * w, foc[1] * h))

def render(src, t, push):
    """affine render of src with handheld drift; t seconds, push 0..1"""
    im = src['im']; w, h = im.size
    s = src['s'] * (1.0 + 0.05 * push)
    dx = 9 * math.sin(t * 1.9) + 5 * math.sin(t * 3.7); dy = 7 * math.sin(t * 1.4 + 1)
    a = math.radians(0.45 * math.sin(t * 1.1))
    cx, cy = src['c']
    # clamp centre so image covers frame where possible
    hw, hh = W / 2 / s, H / 2 / s
    if w / 2 > hw: cx = min(max(cx, hw), w - hw)
    else: cx = w / 2
    if h / 2 > hh: cy = min(max(cy, hh), h - hh)
    else: cy = h / 2
    ca, sa = math.cos(a) / s, math.sin(a) / s
    # output (x,y) -> input
    ox, oy = W / 2 + dx, H / 2 + dy
    A = (ca, sa, cx - ca * ox - sa * oy, -sa, ca, cy + sa * ox - ca * oy)
    if src['bg'] is not None:
        base = src['bg'].copy()
        fg = im.transform((W, H), Image.AFFINE, A, resample=Image.BILINEAR, fillcolor=(0, 0, 0))
        mask = Image.new('L', (w, h), 255).transform((W, H), Image.AFFINE, A, resample=Image.BILINEAR, fillcolor=0)
        base.paste(fg, (0, 0), mask); return base
    return im.transform((W, H), Image.AFFINE, A, resample=Image.BILINEAR, fillcolor=(0, 0, 0))

GRAD = None
def grad():
    global GRAD
    if GRAD is None:
        g = np.zeros((H, W), np.uint8)
        for y in range(H):
            v = 0
            if y > H - 640: v = int(200 * ((y - (H - 640)) / 640) ** 1.4)
            if y < 260: v = max(v, int(120 * (1 - y / 260) ** 1.5))
            g[y, :] = v
        GRAD = Image.fromarray(g)
    return GRAD

def pill(d, x, y, txt, font, fill, col, padx=22, pady=12, r=14):
    b = d.textbbox((0, 0), txt, font=font); tw, th = b[2] - b[0], b[3] - b[1]
    d.rounded_rectangle((x, y, x + tw + 2 * padx, y + th + 2 * pady), r, fill=fill)
    d.text((x + padx - b[0], y + pady - b[1]), txt, font=font, fill=col)
    return x + tw + 2 * padx

def overlay_item(fr, it, i, n, a, cat, tagshot):
    sku, brand, size, price = it[:4]
    dark = Image.new('RGB', (W, H), (0, 0, 0)); fr.paste(dark, (0, 0), grad())
    d = ImageDraw.Draw(fr, 'RGBA')
    # top: counter + store
    d.text((48, 54), f'{i+1:02d}/{n:02d}', font=F(IB, 34), fill=(255, 255, 255))
    d.text((W - 48, 54), 'ABCTHRIFT', font=F(IK, 30), fill=(255, 255, 255), anchor='ra')
    if tagshot:
        pill(d, 48, 120, '✓ REAL BRAND TAG', F(IK, 38), ACC + (255,), (255, 255, 255))
    else:
        pill(d, 48, 120, 'REAL PHOTO · 1 OF 1', F(IB, 30), (255, 255, 255, 235), (10, 10, 10))
    # bottom lower third (slides up with a)
    off = int((1 - a) * 60); al = int(255 * a)
    fs = 150 if len(brand) <= 9 else 118
    d.text((48, H - 330 + off), brand, font=F(BS, fs), fill=(255, 255, 255, al), anchor='ls')
    y = H - 290 + off
    x = pill(d, 48, y, f'SIZE {size}', F(IB, 44), (255, 255, 255, int(40 * a)), (255, 255, 255, al), r=12)
    pill(d, x + 16, y, rs(price), F(IK, 44), (255, 255, 255, al), (10, 10, 10, al), r=12)
    d.text((48, H - 150 + off), f'COD all Pakistan · WhatsApp {NUM}', font=F(IS, 32), fill=(235, 235, 235, al))

def intro_overlay(fr, title, sub, a):
    fr = Image.blend(fr, Image.new('RGB', (W, H), (0, 0, 0)), 0.42)
    d = ImageDraw.Draw(fr, 'RGBA'); off = int((1 - a) * 80)
    pill(d, 60, 560 + off, 'NEW STOCK · SAHIWAL', F(IK, 34), ACC + (255,), (255, 255, 255))
    d.multiline_text((56, 650 + off), title, font=F(BS, 250), fill=(255, 255, 255), spacing=-10)
    d.text((62, 1215 + off), sub, font=F(IB, 40), fill=(255, 255, 255))
    d.text((62, 1290 + off), 'Real photos. Real brand tags.', font=F(IK, 52), fill=(255, 255, 255))
    d.text((62, 1365 + off), 'Every piece 1 of 1 ↓', font=F(IB, 40), fill=(210, 210, 210))
    return fr

def endcard(a, brands):
    fr = Image.new('RGB', (W, H), (246, 245, 241)); d = ImageDraw.Draw(fr); off = int((1 - a) * 60)
    d.text((70, 300 + off), 'ABCTHRIFT · ORIGINAL BRANDS', font=F(IK, 34), fill=ACC)
    d.multiline_text((64, 370 + off), 'LIKED\nONE?', font=F(BS, 300), fill=(12, 12, 12), spacing=-20)
    d.text((70, 1010 + off), 'Send a screenshot on WhatsApp.', font=F(IB, 46), fill=(12, 12, 12))
    d.text((70, 1072 + off), 'We confirm size + send more photos.', font=F(IS, 40), fill=(80, 80, 80))
    pill(d, 70, 1170 + off, NUM, F(IK, 96), (12, 12, 12), (255, 255, 255), padx=36, pady=26, r=24)
    pill(d, 70, 1370 + off, 'Cash on Delivery · all Pakistan', F(IB, 38), ACC, (255, 255, 255))
    d.text((70, 1480 + off), '7-day returns · FREE delivery on Rs 1,999+', font=F(IS, 38), fill=(40, 40, 40))
    d.text((70, 1545 + off), 'abcthrift.store', font=F(IK, 44), fill=(12, 12, 12))
    d.text((70, 1700 + off), ' · '.join(brands), font=F(IS, 28), fill=(120, 120, 120))
    return fr

def whip(a_img, b_img, k):
    """k 0..1 : a slides left, b comes from right, with motion blur"""
    e = ease(k); A = np.asarray(a_img, np.float32); B = np.asarray(b_img, np.float32)
    off = int(e * W); comp = np.empty_like(A)
    comp[:, :W - off] = A[:, off:]; comp[:, W - off:] = B[:, :off]
    blur = int(70 * math.sin(math.pi * k))
    if blur > 2:
        acc = np.zeros_like(comp); taps = 7
        for j in range(taps):
            sh = int((j - taps // 2) * blur / taps); acc += np.roll(comp, sh, axis=1)
        comp = acc / taps
    return Image.fromarray(comp.clip(0, 255).astype(np.uint8))

def build(key):
    title, sub, items = CATS[key]; n = len(items)
    segs = []  # (src, overlay-fn, dur)
    fronts = [prep_front(f'{D}/front/{it[0]}.jpg') for it in items]
    tags = [prep_tag(f'{D}/tag/{it[0]}.jpg', it[4], it[5]) for it in items]
    T_INTRO, T_F, T_T, T_W, T_END = 1.4, 1.65, 1.05, 0.2, 2.6
    plan = [('intro', fronts[0], None, T_INTRO)]
    for i, it in enumerate(items):
        plan.append(('front', fronts[i], (it, i), T_F)); plan.append(('tag', tags[i], (it, i), T_T))
    plan.append(('end', None, None, T_END))
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{OUT}/{key}.mp4'], stdin=subprocess.PIPE)
    gt = 0.0; prev_last = None; thumbs = []
    brands = [it[1] for it in items]
    for si, (kind, src, meta, dur) in enumerate(plan):
        nf = int(round(dur * FPS)); nw = int(T_W * FPS) if si > 0 else 0
        for f in range(nf):
            t = f / FPS; push = t / dur; gt += 1 / FPS
            if kind == 'end': fr = endcard(ease(t / 0.45), brands)
            else:
                fr = render(src, gt, push)
                if kind == 'intro': fr = intro_overlay(fr, title, sub, ease(t / 0.35))
                else:
                    it, i = meta; a = ease((t - 0.08) / 0.3) if kind == 'front' else 1.0
                    overlay_item(fr, it, i, n, a, key, kind == 'tag')
            if f < nw and prev_last is not None: fr_out = whip(prev_last, fr, (f + 1) / (nw + 1))
            else: fr_out = fr
            ff.stdin.write(fr_out.tobytes())
            if f == nf // 2: thumbs.append(fr)
        prev_last = fr
    ff.stdin.close(); ff.wait()
    # cover jpg + contact sheet
    thumbs[1].save(f'{OUT}/{key}-cover.jpg', quality=90)
    cs = Image.new('RGB', (len(thumbs) * 216, 384))
    for j, th in enumerate(thumbs): cs.paste(th.resize((216, 384)), (j * 216, 0))
    cs.save(f'{OUT}/_{key}-sheet.jpg', quality=80)

for k in CATS:
    if ONLY and ONLY not in k: continue
    build(k); print('done', k)
