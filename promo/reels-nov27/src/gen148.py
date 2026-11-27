# Reels 148-152: WAQAR's own rope-rack spin videos (27 Nov) -> branded 9:16 ads.
# Theme "retail price label": white label card + mono type + Gloock brand, forest green stamp.
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
UP = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT + '/tmp', exist_ok=True)
F = '/mnt/skills/examples/canvas-design/canvas-fonts/'
def f(n, s): return ImageFont.truetype(F + n, s)
GL, MONO, MONOB = 'Gloock-Regular.ttf', 'JetBrainsMono-Regular.ttf', 'JetBrainsMono-Bold.ttf'
INK, PAPER, GREEN = (18, 18, 18), (247, 245, 239), (29, 77, 58)
W, H = 1080, 1920
ITEMS = [  # file, brand, desc, size, price, original?, seg for combined, seg for single
 ('91a86779', 'SIGGI', 'Softshell hooded zip jacket', '3XL', '1,199', True, (4.5, 8.6), (4.4, 10.4), 'HOO-0033'),
 ('fc4c1dbb', 'OBEY', 'Half-zip sweatshirt', 'S', '699', True, (4.0, 8.2), (3.9, 10.7), 'SWE-0039'),
 ('ae19bd95', 'RECEL', 'Crown check hooded jacket', 'XL', '1,599', True, (4.0, 7.6), (3.9, 11.8), 'COA-0038'),
 ('bf2e4705', 'Handpicked', 'Reversible fleece-lined vest', 'L', '999', False, (2.0, 5.6), (1.9, 8.9), 'COA-0020'),
]
def rr(d, box, r, fill, outline=None, width=0): d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)
def ctext(d, xy, t, font, fill, anchor='la'): d.text(xy, t, font=font, fill=fill, anchor=anchor)

def chrome(im, d):
    # top gradient + pills
    g = Image.new('L', (1, 360)); [g.putpixel((0, y), int(150 * (1 - y / 360) ** 1.6)) for y in range(360)]
    im.paste(Image.new('RGBA', (W, 360), (0, 0, 0, 255)), (0, 0), g.resize((W, 360)))
    rr(d, (56, 70, 420, 134), 32, PAPER); ctext(d, (238, 102), 'NEW IN · 27 NOV', f(MONOB, 30), INK, 'mm')
    ctext(d, (W - 60, 102), 'abcthrift.store', f(MONOB, 32), PAPER, 'rm')

def label(it, idx=None, n=None):
    _, brand, desc, size, price, orig, *_ = it
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    chrome(im, d)
    # bottom shade
    g = Image.new('L', (1, 700)); [g.putpixel((0, y), int(170 * (y / 700) ** 1.5)) for y in range(700)]
    im.paste(Image.new('RGBA', (W, 700), (0, 0, 0, 255)), (0, H - 700), g.resize((W, 700)))
    x0, y0, x1, y1 = 56, 1515, W - 56, 1860
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((x0+8, y0+14, x1+8, y1+14), 28, fill=(0, 0, 0, 120))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18))); d = ImageDraw.Draw(im)
    rr(d, (x0, y0, x1, y1), 28, PAPER)
    d.ellipse((x1 - 66, y0 + 30, x1 - 40, y0 + 56), fill=(200, 196, 186), outline=INK, width=3)  # tag hole
    # brand
    bf = f(GL, 104 if len(brand) < 8 else 88)
    ctext(d, (x0 + 44, y0 + 30), brand.upper() if orig else brand, bf, INK)
    ctext(d, (x0 + 48, y0 + 150), desc, f(MONO, 32), (70, 70, 70))
    d.line((x0 + 44, y0 + 205, x1 - 44, y0 + 205), fill=INK, width=3)
    ctext(d, (x0 + 48, y0 + 222), 'SIZE', f(MONO, 24), (90, 90, 90)); ctext(d, (x0 + 48, y0 + 250), size, f(MONOB, 64), INK)
    ctext(d, (x1 - 44, y0 + 222), 'PRICE', f(MONO, 24), (90, 90, 90), 'ra'); ctext(d, (x1 - 44, y0 + 244), 'Rs ' + price, f(MONOB, 76), INK, 'ra')
    # stamp
    st = 'ORIGINAL BRAND' if orig else '1 OF 1 PIECE'
    sw = d.textlength(st, f(MONOB, 28)) + 44
    rr(d, (x0 + 40, y0 - 30, x0 + 40 + sw, y0 + 26), 12, GREEN); ctext(d, (x0 + 40 + sw / 2, y0 - 2), st, f(MONOB, 28), PAPER, 'mm')
    if idx: ctext(d, (x1 - 10, y0 - 30), f'{idx}/{n}', f(MONOB, 34), PAPER, 'rm')
    # barcode strip
    import random; random.seed(brand)
    bx = x0 + 190
    while bx < x1 - 470:
        w = random.choice([3, 3, 5, 8]); d.rectangle((bx, y0 + 250, bx + w, y0 + 300), fill=INK); bx += w + random.choice([4, 6, 9])
    ctext(d, (x0 + 190, y0 + 322), 'COD · 7-DAY RETURNS', f(MONO, 20), INK, 'lm')
    return im

def hook():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle((0, 560, W, 1010), fill=(18, 18, 18, 215))
    ctext(d, (W / 2, 660), 'JUST UNPACKED', f(MONOB, 46), PAPER, 'mm')
    ctext(d, (W / 2, 800), 'Original brands', f(GL, 124), PAPER, 'mm')
    ctext(d, (W / 2, 935), 'from Rs 699', f(GL, 96), (198, 230, 205), 'mm')
    return im

def endcard():
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    logo = Image.open('/mnt/project-files/brand/abcthrift/abcthrift-logo.png').convert('RGBA'); logo = logo.resize((860, int(860 * logo.height / logo.width)))
    im.paste(logo, ((W - 860) // 2, 330), logo)
    ctext(d, (W / 2, 720), 'Liked one? Send a screenshot', f(GL, 64), INK, 'mm')
    rr(d, (90, 820, W - 90, 1010), 40, GREEN)
    ctext(d, (W / 2, 870), 'WHATSAPP', f(MONOB, 34), PAPER, 'mm'); ctext(d, (W / 2, 950), '0322 4631990', f(MONOB, 84), PAPER, 'mm')
    for i, t in enumerate(['Cash on Delivery · all Pakistan', 'Free delivery on Rs 1,999+', '7-day returns', 'Every piece is 1 of 1']):
        ctext(d, (W / 2, 1120 + i * 72), t, f(MONO, 40), INK, 'mm')
    ctext(d, (W / 2, 1520), 'abcthrift.store', f(GL, 96), INK, 'mm')
    return im

def run(cmd): subprocess.run(cmd, check=True)
SPEED = 1.15
VF = (f"setpts=PTS/{SPEED},scale=1134:2016,crop=1080:1920:27:30,"
      "eq=contrast=1.10:saturation=1.18:brightness=0.015:gamma=0.97,unsharp=5:5:0.6,vignette=PI/5,fps=30,format=yuv420p")

def clip(src, ss, to, ov, out, hookpng=None):
    inp = ['-ss', str(ss), '-to', str(to), '-i', src, '-loop', '1', '-i', ov]
    fc = f"[0:v]{VF}[v];[1:v]format=rgba,fade=in:st=0.15:d=0.35:alpha=1[o];[v][o]overlay=0:0:shortest=1"
    if hookpng:
        inp += ['-loop', '1', '-i', hookpng]; fc += "[a];[2:v]format=rgba,fade=out:st=1.5:d=0.25:alpha=1[h];[a][h]overlay=0:0:shortest=1:enable='lt(t,1.8)'"
    fc += ',format=yuv420p[out]'
    run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', fc, '-map', '[out]', '-an', '-r', '30', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', out])

def endclip(out, dur=2.8):
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', OUT + '/tmp/end.png', '-vf',
         f"scale=1188:2112,zoompan=z='1+0.04*on/{int(dur*30)}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d={int(dur*30)}:s=1080x1920:fps=30,format=yuv420p",
         '-t', str(dur), '-c:v', 'libx264', '-crf', '19', out])

def concat(parts, out):
    n = len(parts); ins = sum([['-i', p] for p in parts], [])
    fc = ''.join(f'[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[v{i}];' for i in range(n))
    # quick crossfades
    last, off = 'v0', 0.0
    durs = [float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p])) for p in parts]
    off = durs[0]
    for i in range(1, n):
        off -= 0.25; nm = f'x{i}'
        fc += f'[{last}][v{i}]xfade=transition=slideleft:duration=0.25:offset={off:.3f}[{nm}];'; last = nm; off += durs[i] - 0.0
    fc += f'[{last}]format=yuv420p[out]'
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-filter_complex', fc, '-map', '[out]', '-map', f'{n}:a',
         '-shortest', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out])

hook().save(OUT + '/tmp/hook.png'); endcard().save(OUT + '/tmp/end.png'); endclip(OUT + '/tmp/end.mp4')
src = {it[0]: [os.path.join(UP, x) for x in os.listdir(UP) if x.startswith(it[0])][0] for it in ITEMS}
parts = []
for i, it in enumerate(ITEMS, 1):
    p = OUT + f'/tmp/lab{i}.png'; label(it, i, len(ITEMS)).save(p)
    c = OUT + f'/tmp/c{i}.mp4'; clip(src[it[0]], *it[6], p, c, OUT + '/tmp/hook.png' if i == 1 else None); parts.append(c)
concat(parts + [OUT + '/tmp/end.mp4'], OUT + '/148-reel-new-in-4-pieces.mp4')
names = {1: '149-reel-siggi-softshell', 2: '150-reel-obey-halfzip', 3: '151-reel-recel-jacket', 4: '152-reel-reversible-vest'}
for i, it in enumerate(ITEMS, 1):
    p = OUT + f'/tmp/sl{i}.png'; label(it).save(p)
    c = OUT + f'/tmp/s{i}.mp4'; clip(src[it[0]], *it[7], p, c)
    concat([c, OUT + '/tmp/end.mp4'], OUT + f'/{names[i]}.mp4')
# cover/thumbnail stills for review
