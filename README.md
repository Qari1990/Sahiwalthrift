# Sahiwal Thrift Co. store

Live: https://qari1990.github.io/Sahiwalthrift/

`public/` is the website. It is rebuilt from the Landa Lister inventory with:

    pip install "rembg[cpu]" scipy pillow numpy
    python3 scripts/build.py <items_dir> <assets_dir>

`items_dir` holds one JSON file per SKU, `assets_dir` the original photos as `<asset id>.jpg`.
Photos get an AI background cut-out on a soft solid colour; close-ups and photos where the cut-out fails keep the real photo. Cut-outs are cached in `cache/`.
Store name, WhatsApp number and site address live in `site.json`.
