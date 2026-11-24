# cut-outs for Grand Launch v2 creatives (rembg u2net, drop site watermark corner, crop to garment)
import sys
from rembg import remove, new_session
from PIL import Image
import numpy as np
s = new_session("u2net")
for sku in sys.argv[1:]:
    im = Image.open(f"public/img/{sku}-1.jpg").convert("RGB")
    w, h = im.size
    o = remove(im, session=s)
    a = np.array(o)
    a[int(h * .92):, int(w * .62):, 3] = 0  # abcthrift.store watermark corner
    al = a[:, :, 3]
    al[al < 40] = 0
    ys, xs = np.where(al > 0)
    o = Image.fromarray(a).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    o.save(f"promo/gl2/cut/{sku}.png")
    print(sku, o.size)
