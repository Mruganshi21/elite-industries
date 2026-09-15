# -*- coding: utf-8 -*-
"""Fit the client's product photos into the site's 4:3 product image slot.

Run from the repository root:

    python tools/make_product_photos.py

Reads ./product_images/*.jpeg (as the client supplied them, at mixed sizes and
ratios) and writes wwwroot/img/products/{slug}.jpg at 800x600. Every card,
hero card and detail page reserves a 400x300 box, and the card thumb uses
object-fit: cover — so a photo at any other ratio would be cropped. Instead
each photo is contained on a canvas filled with its own background colour,
so nothing is cut off and the padding is invisible.

Photos that bleed to the edge (no studio ground) are centre-cropped to 4:3
instead, since padding them would draw a visible box.

A product only shows its photo once Product.HasPhoto is set in
Services/ProductCatalog.cs; the rest keep their SVG illustration.
"""
from statistics import median

from PIL import Image

SRC_DIR = 'product_images'
OUT_DIR = 'wwwroot/img/products'
W, H = 800, 600
MARGIN = 0.06                  # breathing room each side, as a share of the canvas

# source file -> (product slug, mode). 'contain:R' first centre-trims a very
# wide photo to ratio R, so the product is not shrunk to a strip.
PHOTOS = {
    'dunnage_airbag.jpeg':        ('dunnage-air-bags', 'contain'),
    'composite_cord_strap.jpeg':  ('polyester-composite-strap', 'contain'),
    'PP_corrugated_sheet.jpeg':   ('pp-corrugated-sheet', 'contain'),
    'petstrap.jpeg':              ('pet-strap', 'contain'),
    'stretch_wrap_film.jpeg':     ('stretch-wrapping-film', 'contain'),
    'paper_angle_board.jpeg':     ('paper-edge-boards', 'cover'),
    'PP_box_strapping.jpeg':      ('pp-box-strapping', 'contain'),
    'self_adhesive_tapes.jpeg':   ('self-adhesive-tapes', 'contain:2.0'),
}
# Supplied but with no matching product on the site yet:
# FIBC_jumbo_bag, flexi_board, refer_container_bolt, woven_lashing_strap.


def ground(im):
    """Median colour of the outermost pixel ring — the studio background."""
    w, h = im.size
    px = im.load()
    ring = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)]
    ring += [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    return tuple(int(median(c[i] for c in ring)) for i in range(3))


def contain(im, max_ratio=None):
    bg = ground(im)                # sampled before trimming, off the true edge
    if max_ratio and im.width / im.height > max_ratio:
        keep = round(im.height * max_ratio)
        left = (im.width - keep) // 2
        im = im.crop((left, 0, left + keep, im.height))
    box_w, box_h = W * (1 - 2 * MARGIN), H * (1 - 2 * MARGIN)
    scale = min(box_w / im.width, box_h / im.height)
    fitted = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), bg)
    canvas.paste(fitted, ((W - fitted.width) // 2, (H - fitted.height) // 2))
    return canvas


def cover(im):
    scale = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left, top = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((left, top, left + W, top + H))


for name, (slug, mode) in PHOTOS.items():
    im = Image.open(f'{SRC_DIR}/{name}').convert('RGB')
    if mode.startswith('contain'):
        _, _, ratio = mode.partition(':')
        out = contain(im, float(ratio) if ratio else None)
    else:
        out = cover(im)
    path = f'{OUT_DIR}/{slug}.jpg'
    out.save(path, 'JPEG', quality=86, optimize=True, progressive=True)
    print(f'{name} -> {path}')
