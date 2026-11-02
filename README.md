# Thrifty.pk store

Live: https://abcthrift.store (GitHub Pages custom domain; `public/CNAME` is written by the build from `domain` in site.json)

`public/` is the website. It is rebuilt from the Landa Lister inventory with:

    pip install "rembg[cpu]" scipy pillow numpy
    python3 scripts/build.py <items_dir> <assets_dir>

`items_dir` holds one JSON file per SKU, `assets_dir` the original photos as `<asset id>.jpg`.
Photos get an AI background cut-out on a soft solid colour; close-ups and photos where the cut-out fails keep the real photo. Cut-outs are cached in `cache/`.
Store name, WhatsApp number and site address live in `site.json`.

Site features: rotating announcement bar, Men/Women/Kids menu with category dropdowns, shop-by-condition, filters (gender, category, size, condition, price, brand, search) that also work from the URL (`index.html?g=Kids&cat=Hoodie#shop`), wishlist, bag with bundle discount, voucher and delivery fee, checkout form (name, phone, city, address) that sends a numbered order to WhatsApp, order tracking, Deal of the Day, make an offer, and info pages (delivery & COD, returns, condition guide, size guide, FAQs, about, contact, privacy).
Delivery fee, free-delivery limit, return days, announcements and social links are in `site.json`.
