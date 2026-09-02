# -*- coding: utf-8 -*-
"""Derive the two site logo PNGs from the JPEG the client supplied.

Run from the repository root:

    python tools/make_logo.py

Reads ./elite-logo.jpeg and writes wwwroot/img/logo.png (masthead, white
ground) and wwwroot/img/logo-light.png (footer, --ei-ink ground, neutral ink
knocked out to white). wwwroot/img/README.md explains every step and the two
things to know about the source.
"""
from PIL import Image

SRC = 'elite-logo.jpeg'
BG = (247, 247, 247)          # the flat JPEG ground
# JPEG ringing puts faint neutral noise all around the shapes. A single
# threshold either keeps that noise (and the reversed variant lifts it to
# white, giving the logo a grey box) or eats the real antialiasing. So it is a
# ramp with a floor: anything within FLOOR of the ground is noise and goes fully
# transparent, and opacity climbs to solid by FULL.
FLOOR = 13.0
FULL = 44.0

im = Image.open(SRC).convert('RGB')
w, h = im.size
px = im.load()

# ---- trim to content, with a hair of breathing room ----------------------
minx, miny, maxx, maxy = w, h, 0, 0
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        if abs(r - BG[0]) + abs(g - BG[1]) + abs(b - BG[2]) > 24:
            minx = min(minx, x); maxx = max(maxx, x)
            miny = min(miny, y); maxy = max(maxy, y)
pad = 2
minx = max(0, minx - pad); miny = max(0, miny - pad)
maxx = min(w - 1, maxx + pad); maxy = min(h - 1, maxy + pad)
im = im.crop((minx, miny, maxx + 1, maxy + 1))
w, h = im.size
px = im.load()
print('trimmed to', im.size)

# ---- un-matte off the flat ground ---------------------------------------
# Observed = a*Fg + (1-a)*Bg. Alpha comes from how far the pixel has travelled
# from the ground; the foreground colour is then recovered by dividing the
# blend back out. Without that second step every antialiased edge keeps the
# white it was blended with, which shows up as a pale halo the moment the logo
# sits on anything dark.
out = Image.new('RGBA', (w, h))
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b = px[x, y]
        d = max(abs(r - BG[0]), abs(g - BG[1]), abs(b - BG[2]))
        a = min(1.0, max(0.0, (d - FLOOR) / (FULL - FLOOR)))
        if a <= 0.004:
            op[x, y] = (0, 0, 0, 0)
            continue
        fr = (r - (1 - a) * BG[0]) / a
        fg = (g - (1 - a) * BG[1]) / a
        fb = (b - (1 - a) * BG[2]) / a
        clamp = lambda v: max(0, min(255, int(round(v))))
        op[x, y] = (clamp(fr), clamp(fg), clamp(fb), int(round(a * 255)))
out.save('wwwroot/img/logo.png')
print('wrote wwwroot/img/logo.png')

# ---- reversed variant for the dark footer -------------------------------
# Only the neutral (grey/black) ink is lifted to white; anything with real red
# in it is left exactly as delivered, so the mark keeps the brand colour and
# only the type is knocked out. That is the ordinary reversed treatment, but it
# is still us making it rather than the client supplying it.
rev = Image.new('RGBA', (w, h))
rp = rev.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = op[x, y]
        if a == 0:
            rp[x, y] = (0, 0, 0, 0)
            continue
        mx, mn = max(r, g, b), min(r, g, b)
        neutral = (mx - mn) <= 42          # grey-ish: no meaningful hue
        if neutral:
            rp[x, y] = (255, 255, 255, a)
        else:
            rp[x, y] = (r, g, b, a)
rev.save('wwwroot/img/logo-light.png')
print('wrote wwwroot/img/logo-light.png')
