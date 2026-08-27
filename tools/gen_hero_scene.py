# -*- coding: utf-8 -*-
"""Generates the isometric hero scene for the Elite Industries homepage.

World -> screen is a true isometric projection:
    screen_x = (x - y) * cos30 * S
    screen_y = (x + y) * 0.5  * S - z * S
+x runs down-right (the direction cargo travels), +y down-left, +z up.
The visible faces of any box are therefore: top, the x-max face, the y-max face.
"""
import io
import math
import os

S = 9.0
K = math.cos(math.radians(30)) * S
H = 0.5 * S

NAVY_D, NAVY, NAVY_2, NAVY_3 = '#0f1722', '#16202e', '#1e2b3c', '#2b3648'
ST_L, ST, ST_M, ST_D = '#e8edf1', '#cfd8e0', '#aab6c2', '#8894a2'
ORA, ORA_D, ORA_L = '#ee6a1e', '#cc5412', '#fde4d2'
KR_L, KR, KR_D = '#d8a866', '#bd8b4c', '#a2743c'

out = []
pts_all = []


def P(x, y, z):
    p = ((x - y) * K, (x + y) * H - z * S)
    pts_all.append(p)
    return p


def poly(pts, fill, extra=''):
    d = ' '.join('%.1f,%.1f' % p for p in pts)
    out.append('<polygon points="%s" fill="%s"%s/>' % (d, fill, extra))


def box(x0, y0, z0, x1, y1, z1, top, left, right, extra=''):
    """left = the y-max face (faces down-left); right = the x-max face."""
    poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], top, extra)
    poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], left, extra)
    poly([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], right, extra)


def line(a, b, stroke, w=1):
    out.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%s"/>'
               % (a[0], a[1], b[0], b[1], stroke, w))


def ellipse(cx, cy, cz, r, fill='none', stroke='none', w=1, extra=''):
    c = P(cx, cy, cz)
    rx, ry = math.sqrt(2) * K * r, math.sqrt(2) * H * r
    pts_all.append((c[0] - rx, c[1] - ry))
    pts_all.append((c[0] + rx, c[1] + ry))
    return ('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" stroke="%s" stroke-width="%s"%s/>'
            % (c[0], c[1], rx, ry, fill, stroke, w, extra))


# ---------------------------------------------------------------- floor grid
out.append('<g class="hs-grid" opacity=".5">')
for gx in range(-6, 79, 6):
    line(P(gx, -10, 0), P(gx, 26, 0), NAVY_3)
for gy in range(-10, 27, 6):
    line(P(-6, gy, 0), P(78, gy, 0), NAVY_3)
out.append('</g>')
GRID_END = len(pts_all)   # the floor plane bleeds; it must not set the framing

# soft contact shadow beneath the line
out.append('<g opacity=".45">')
poly([P(-2, -2, 0), P(72, -2, 0), P(72, 10, 0), P(-2, 10, 0)], NAVY_D)
out.append('</g>')

# ------------------------------------------------------------- conveyor line
CX0, CX1, CY0, CY1 = 0.0, 50.0, 0.0, 7.0
out.append('<g class="hs-conveyor">')
for lx in (3, 13, 23, 33, 43):
    box(lx, 0.3, 0, lx + 1.0, 1.3, 2.6, ST_M, NAVY_2, NAVY_3)
    box(lx, 5.7, 0, lx + 1.0, 6.7, 2.6, ST_M, NAVY_2, NAVY_3)
box(CX0, CY0, 2.6, CX1, CY1, 3.0, ST_M, NAVY_2, NAVY_3)
for i in range(0, 23):
    rx = 1.0 + i * 2.2
    box(rx, 0.35, 3.0, rx + 0.9, 6.65, 3.3, ST_L, ST_D, ST_D)
box(CX0, -0.35, 3.0, CX1, 0.2, 3.9, ST, NAVY_2, NAVY_3)
box(CX0, 6.8, 3.0, CX1, 7.35, 3.9, ST, ST_D, NAVY_3)
out.append('</g>')

# ---------------------------------------------------------- strapping gantry
out.append('<g class="hs-gantry">')
box(21.0, -2.6, 0, 22.6, -1.2, 12.0, ST, NAVY_2, NAVY_3)
box(21.0, 8.2, 0, 22.6, 9.6, 12.0, ST, NAVY_2, NAVY_3)
box(21.0, -2.6, 12.0, 22.6, 9.6, 13.4, ORA, ORA_D, ORA_D)
box(20.6, 2.4, 9.6, 23.0, 5.0, 12.0, ST_L, ST_D, ST_M)
out.append('</g>')

# the strap chute hanging below the head, plus the band it lays across the belt
out.append('<g class="hs-strap">')
box(21.4, 2.8, 3.4, 22.2, 4.6, 9.6, ORA_L, ORA_D, ORA)
out.append('</g>')
out.append('<g class="hs-band">')
box(21.3, -0.1, 3.25, 22.3, 7.1, 3.45, ORA, ORA_D, ORA_D)
out.append('</g>')

# ------------------------------------------------------- travelling cartons
def carton(idx, sz=5.0, hgt=4.2):
    saved = out[:]
    del out[:]
    box(0, 0, 0, sz, sz, hgt, KR_L, KR_D, KR)
    poly([P(sz * .5 - 0.35, 0, hgt), P(sz * .5 + 0.35, 0, hgt),
          P(sz * .5 + 0.35, sz, hgt), P(sz * .5 - 0.35, sz, hgt)], KR, ' opacity=".85"')
    inner = out[:]
    del out[:]
    out.extend(saved)
    return '<g class="hs-carton" style="--i:%d">%s</g>' % (idx, ''.join(inner))


ride = P(-6.0, 1.0, 3.3)
out.append('<g class="hs-cartons" transform="translate(%.1f,%.1f)">' % ride)
for i in range(4):
    out.append(carton(i))
out.append('</g>')
TRAVEL = (58 * K, 58 * H)

# ---------------------------------------------------- stretch-wrap turntable
TC_X, TC_Y = 60.0, 3.5
out.append('<g class="hs-wrapper">')
out.append(ellipse(TC_X, TC_Y, 0.0, 7.4, fill=NAVY_D, extra=' opacity=".45"'))
out.append(ellipse(TC_X, TC_Y, 0.9, 7.0, fill=ST_D))
out.append(ellipse(TC_X, TC_Y, 1.3, 7.0, fill=ST_M))
out.append(ellipse(TC_X, TC_Y, 1.3, 4.6, fill=ST, stroke=ST_D, w=1.2))
box(TC_X - 4.4, TC_Y - 4.4, 1.3, TC_X + 4.4, TC_Y + 4.4, 2.5, KR_L, KR_D, KR)
box(TC_X - 4.0, TC_Y - 4.0, 2.5, TC_X + 4.0, TC_Y + 4.0, 10.5, ST_L, ST_M, ST)
box(TC_X - 4.05, TC_Y - 4.05, 2.5, TC_X + 4.05, TC_Y + 4.05, 10.5,
    '#ffffff', '#ffffff', '#ffffff', ' opacity=".16"')
out.append('</g>')

out.append('<g class="hs-film" fill="none" stroke-linecap="round">')
for j, zz in enumerate((3.6, 5.6, 7.6, 9.4)):
    out.append(ellipse(TC_X, TC_Y, zz, 4.9, stroke=ORA, w=2.2,
                       extra=' class="hs-ring" style="--i:%d" stroke-dasharray="26 14" opacity=".9"' % j))
out.append('</g>')

out.append('<g class="hs-mast">')
box(TC_X + 7.6, TC_Y - 1.2, 0, TC_X + 9.2, TC_Y + 1.2, 14.0, ST, NAVY_2, NAVY_3)
box(TC_X + 6.2, TC_Y - 1.0, 5.0, TC_X + 7.8, TC_Y + 1.0, 7.2, ORA, ORA_D, ORA_D)
out.append('</g>')


# ------------------------------------------------ finished, strapped pallets
def stack(bx, by, tiers):
    out.append('<g class="hs-stack">')
    z = 0.0
    for _ in range(tiers):
        box(bx, by, z, bx + 8.4, by + 8.4, z + 1.1, KR_L, KR_D, KR)
        box(bx + 0.3, by + 0.3, z + 1.1, bx + 8.1, by + 8.1, z + 6.4, ST_L, ST_M, ST)
        for a in (2.4, 5.2):
            poly([P(bx + a, by + 0.28, z + 1.1), P(bx + a + 0.8, by + 0.28, z + 1.1),
                  P(bx + a + 0.8, by + 0.28, z + 6.4), P(bx + a, by + 0.28, z + 6.4)], ORA)
            poly([P(bx + 8.12, by + a, z + 1.1), P(bx + 8.12, by + a + 0.8, z + 1.1),
                  P(bx + 8.12, by + a + 0.8, z + 6.4), P(bx + 8.12, by + a, z + 6.4)], ORA_D)
        z += 7.5
    out.append('</g>')


stack(44.0, 14.0, 2)
stack(57.5, 17.5, 1)

# ------------------------------------------------------------------- output
framed = pts_all[GRID_END:]
xs = [p[0] for p in framed]
ys = [p[1] for p in framed]
pad = 26
minx, maxx = min(xs) - pad, max(xs) + pad
miny, maxy = min(ys) - pad, max(ys) + pad
w, h = maxx - minx, maxy - miny

svg = [
    '@* Generated isometric hero scene. Regenerate rather than hand-editing — see docs/homepage.md. *@',
    '<svg class="hero-scene" viewBox="%.0f %.0f %.0f %.0f" width="%.0f" height="%.0f"' % (minx, miny, w, h, w, h),
    '     style="--travel-x:%.1fpx; --travel-y:%.1fpx"' % TRAVEL,
    '     xmlns="http://www.w3.org/2000/svg" role="img"',
    '     aria-label="Isometric illustration of an export packing line: cartons riding a roller conveyor through a strapping gantry to a stretch-wrap turntable, with strapped pallets staged for container loading.">',
    '\n'.join(out),
    '</svg>',
]

TARGET = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      os.pardir, 'Views', 'Home', '_HeroScene.cshtml')
with io.open(TARGET, 'w', encoding='utf-8') as fh:
    fh.write(u'\n'.join(svg))
print('wrote ' + os.path.normpath(TARGET))
print('viewBox %.0f %.0f %.0f %.0f' % (minx, miny, w, h))
print('travel %.1f %.1f' % TRAVEL)
print('nodes %d' % len(out))
