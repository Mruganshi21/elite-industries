#!/usr/bin/env python3
"""
Generate the product illustrations for wwwroot/img/products/.

    python tools/make_product_art.py

WHY A GENERATOR RATHER THAN TEN HAND-DRAWN FILES
------------------------------------------------
Ten separately authored SVGs drift. The stroke weight creeps, the ground line
lands at a different height, one drawing ends up optically twice the weight of
its neighbour, and the product grid stops reading as one set. Here every file
gets the same canvas, the same ground, the same stroke weights and the same
palette from SHARED CHROME below; a product only supplies the artwork that
makes it that product.

WHAT THESE ARE
--------------
Placeholder illustrations, not photography. They are deliberately schematic —
line art of the product doing its job — so they read at card size and do not
pretend to be product shots the client has not supplied yet.

REPLACING ONE WITH A REAL PHOTO
-------------------------------
`Product.ImagePath` resolves to `/img/products/{slug}.svg`. To swap in a photo,
either drop `{slug}.svg` in as an SVG-wrapped image, or change ImagePath in
Models/Product.cs to a different extension and put `{slug}.jpg` alongside.
Delete the entry from ART below so a rerun of this script does not overwrite it.

The palette must stay in step with wwwroot/css/theme.css. These are the same
values, not new ones.
"""

import os

# ---- palette (mirrors theme.css) -----------------------------------------
ORANGE = "#F26A1B"
BURNT = "#B8400E"
EMBER = "#FFF1E6"
GRAPHITE = "#22262B"
STEEL = "#5C646E"
LINE = "#E4E1DC"
WHITE = "#FFFFFF"

W, H = 400, 300
GROUND = 232          # every product stands on the same line
OUT = os.path.join("wwwroot", "img", "products")


def chrome(title):
    """The frame every drawing shares: ground, corner ticks, accessible title."""
    return f'''<title>{title}</title>
  <rect width="{W}" height="{H}" fill="{EMBER}"/>
  <g stroke="{LINE}" stroke-width="1">
    <path d="M0 {GROUND}h{W}"/>
  </g>
  <g stroke="{ORANGE}" stroke-width="2" stroke-linecap="round" opacity=".55">
    <path d="M18 18h20M18 18v20"/>
    <path d="M{W-18} 18h-20M{W-18} 18v20"/>
    <path d="M18 {H-18}h20M18 {H-18}v-20"/>
    <path d="M{W-18} {H-18}h-20M{W-18} {H-18}v-20"/>
  </g>'''


def pallet(x, y, w=None):
    """A slatted pallet, drawn from its top-left corner."""
    w = w or 96
    return f'''<g stroke="{GRAPHITE}" stroke-width="2.4" fill="none" stroke-linejoin="round">
    <path d="M{x} {y}h{w}v14h-{w}z"/>
    <path d="M{x+6} {y+14}v10M{x+w/2:.0f} {y+14}v10M{x+w-6} {y+14}v10"/>
    <path d="M{x} {y+24}h{w}"/>
  </g>'''


# ---------------------------------------------------------------------------
# ART — one entry per product slug. Coordinates assume the 400x300 canvas and
# a ground line at y=232.
# ---------------------------------------------------------------------------

ART = {}

# 1 -- Dunnage air bags: an inflated bag wedged between two stacks -----------
ART["dunnage-air-bags"] = f'''
  {pallet(46, 208)}
  {pallet(258, 208)}
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M46 128h96v80H46zM46 96h96v32H46z"/>
    <path d="M258 128h96v80h-96zM258 96h96v32h-96z"/>
  </g>
  <!-- the bag: bulged sides show it is under pressure -->
  <path d="M150 104h100c8 0 14 26 14 52s-6 52-14 52H150c-8 0-14-26-14-52s6-52 14-52z"
        fill="{ORANGE}" stroke="{BURNT}" stroke-width="2.4" stroke-linejoin="round"/>
  <g stroke="{BURNT}" stroke-width="1.8" opacity=".5">
    <path d="M168 116v128M200 112v134M232 116v128"/>
  </g>
  <!-- inflation valve -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4">
    <circle cx="200" cy="98" r="11"/>
    <path d="M200 87V74" stroke-linecap="round"/>
  </g>
  <path d="M186 66h28" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linecap="round"/>
'''

# 2 -- Polyester composite strap: a coil, with a buckle in front -------------
ART["polyester-composite-strap"] = f'''
  <g fill="none" stroke="{GRAPHITE}" stroke-width="2.4">
    <ellipse cx="168" cy="150" rx="86" ry="86"/>
    <ellipse cx="168" cy="150" rx="34" ry="34"/>
  </g>
  <path d="M168 64a86 86 0 0 1 0 172 86 86 0 0 1 0-172z" fill="{ORANGE}" opacity=".18"/>
  <g fill="none" stroke="{ORANGE}" stroke-width="3" opacity=".9">
    <ellipse cx="168" cy="150" rx="74" ry="74"/>
    <ellipse cx="168" cy="150" rx="62" ry="62"/>
    <ellipse cx="168" cy="150" rx="50" ry="50"/>
    <ellipse cx="168" cy="150" rx="42" ry="42"/>
  </g>
  <!-- the tail running off the coil, through a buckle -->
  <path d="M240 122c40 6 64 20 96 20" fill="none" stroke="{ORANGE}" stroke-width="12" stroke-linecap="round"/>
  <path d="M240 122c40 6 64 20 96 20" fill="none" stroke="{BURNT}" stroke-width="1.6" opacity=".6"/>
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M306 124h34v36h-34z"/>
    <path d="M314 132h18v20h-18z"/>
  </g>
  <!-- filament texture, the thing that makes it composite -->
  <g stroke="{BURNT}" stroke-width="1.2" opacity=".55" stroke-linecap="round">
    <path d="M246 126c34 6 56 18 86 18M246 132c34 6 56 18 86 18M246 138c34 6 56 18 86 18"/>
  </g>
'''

# 3 -- PP corrugated sheet: a sheet with the corner lifted, flutes showing ---
ART["pp-corrugated-sheet"] = f'''
  <g stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M60 176 200 96l140 80-140 80z" fill="{WHITE}"/>
    <path d="M60 176v22l140 80v-22M340 176v22l-140 80" fill="{ORANGE}" opacity=".9"/>
  </g>
  <!-- twin-wall flutes, read on the cut edge -->
  <g stroke="{BURNT}" stroke-width="1.6" opacity=".7">
    <path d="M78 186v22M96 197v22M114 207v22M132 218v22M150 228v22M168 239v22M186 249v22"/>
  </g>
  <g stroke="{BURNT}" stroke-width="1.6" opacity=".7">
    <path d="M322 186v22M304 197v22M286 207v22M268 218v22M250 228v22M232 239v22M214 249v22"/>
  </g>
  <!-- the lifted corner -->
  <path d="M200 96 130 136l-24-14L176 82z" fill="{EMBER}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round"/>
  <g stroke="{ORANGE}" stroke-width="1.8" opacity=".8">
    <path d="M140 118l-22-13M152 111l-22-13M164 104l-22-13"/>
  </g>
'''

# 4 -- PET strap: a strapped pallet load, straps pulled tight ----------------
ART["pet-strap"] = f'''
  {pallet(118, 208, 164)}
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M118 108h164v100H118z"/>
    <path d="M118 158h164"/>
  </g>
  <!-- two straps round the load, each with a weld joint -->
  <g fill="{ORANGE}" stroke="{BURNT}" stroke-width="1.6">
    <path d="M152 100h14v116h-14zM234 100h14v116h-14z"/>
  </g>
  <g fill="{GRAPHITE}">
    <path d="M150 128h18v12h-18zM232 128h18v12h-18z"/>
  </g>
  <!-- embossing, which is what a friction-weld head bites on -->
  <g stroke="{BURNT}" stroke-width="1" opacity=".6">
    <path d="M154 108h10M154 116h10M154 150h10M154 158h10M154 166h10M154 174h10M154 182h10M154 190h10M154 198h10M154 206h10"/>
    <path d="M236 108h10M236 116h10M236 150h10M236 158h10M236 166h10M236 174h10M236 182h10M236 190h10M236 198h10M236 206h10"/>
  </g>
  <!-- tension arrows -->
  <g stroke="{BURNT}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M96 82h30m-8-7 8 7-8 7"/>
    <path d="M304 82h-30m8-7-8 7 8 7"/>
  </g>
'''

# 5 -- Stretch wrapping film: film spiralling round a pallet -----------------
ART["stretch-wrapping-film"] = f'''
  {pallet(126, 208, 148)}
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M132 106h136v102H132z"/>
    <path d="M132 140h136M132 174h136M200 106v102"/>
  </g>
  <!-- the wrap: translucent bands climbing the load -->
  <g fill="{ORANGE}" opacity=".26">
    <path d="M126 118h148v22H126zM126 152h148v22H126zM126 186h148v22H126z"/>
  </g>
  <g fill="none" stroke="{ORANGE}" stroke-width="2.6" opacity=".95">
    <path d="M126 118h148M126 140h148M126 152h148M126 174h148M126 186h148M126 208h148"/>
  </g>
  <!-- the roll feeding it, on its bearing core -->
  <g stroke="{GRAPHITE}" stroke-width="2.4" fill="{WHITE}" stroke-linejoin="round">
    <path d="M300 128h34v88h-34z"/>
    <ellipse cx="317" cy="128" rx="17" ry="7" fill="{ORANGE}"/>
  </g>
  <path d="M300 160c-10 4-18 6-26 6" fill="none" stroke="{ORANGE}" stroke-width="6" stroke-linecap="round" opacity=".7"/>
'''

# 6 -- Paper edge boards: an L-board taking the strap on a carton corner -----
ART["paper-edge-boards"] = f'''
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M96 104h208v128H96z"/>
    <path d="M96 150h208"/>
  </g>
  <!-- the angle boards, one on each top corner -->
  <g fill="{ORANGE}" stroke="{BURNT}" stroke-width="2.2" stroke-linejoin="round">
    <path d="M86 94h68v16H102v52H86z"/>
    <path d="M314 94h-68v16h52v52h16z"/>
  </g>
  <!-- laminate plies, the reason it spreads the load -->
  <g stroke="{BURNT}" stroke-width="1" opacity=".55">
    <path d="M86 99h68M86 104h68M91 110v52M96 110v52"/>
    <path d="M314 99h-68M314 104h-68M309 110v52M304 110v52"/>
  </g>
  <!-- the strap that would otherwise cut the corner -->
  <path d="M60 126h280" fill="none" stroke="{GRAPHITE}" stroke-width="7" stroke-linecap="round"/>
  <path d="M60 126h280" fill="none" stroke="{ORANGE}" stroke-width="3" stroke-linecap="round"/>
  <!-- load spreading down the edge -->
  <g stroke="{BURNT}" stroke-width="2" stroke-linecap="round" opacity=".8">
    <path d="M94 140v14M94 160v14M306 140v14M306 160v14"/>
  </g>
'''

# 7 -- Security seal: a bolt seal through a container hasp -------------------
ART["security-seal"] = f'''
  <!-- container door edge -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M52 60h96v212H52z"/>
    <path d="M252 60h96v212h-96z"/>
  </g>
  <g stroke="{GRAPHITE}" stroke-width="1.6" opacity=".45">
    <path d="M70 60v212M88 60v212M106 60v212M124 60v212"/>
    <path d="M270 60v212M288 60v212M306 60v212M324 60v212"/>
  </g>
  <!-- hasp plates -->
  <g fill="{EMBER}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M148 138h32v36h-32zM220 138h32v36h-32z"/>
  </g>
  <!-- the bolt: pin through both plates, barrel locking it -->
  <path d="M162 156h76" stroke="{GRAPHITE}" stroke-width="9" stroke-linecap="round"/>
  <g fill="{ORANGE}" stroke="{BURNT}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M150 138h24v36h-24z"/>
    <path d="M226 136h30v40h-30z"/>
  </g>
  <!-- the number, which is what the seal actually is -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.2" stroke-linejoin="round">
    <path d="M170 196h64v30h-64z"/>
  </g>
  <text x="202" y="216" text-anchor="middle" font-family="'IBM Plex Mono',monospace"
        font-size="15" font-weight="500" fill="{GRAPHITE}">EI 0472</text>
  <path d="M202 176v20" stroke="{GRAPHITE}" stroke-width="2.2"/>
'''

# 8 -- Cable ties: a tie drawn through its own head round a bundle -----------
ART["cable-ties"] = f'''
  <!-- the bundle -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4">
    <circle cx="176" cy="142" r="22"/>
    <circle cx="212" cy="130" r="18"/>
    <circle cx="210" cy="168" r="20"/>
    <circle cx="172" cy="180" r="16"/>
  </g>
  <!-- the tie: loop, then the tail hanging out of the head -->
  <path d="M150 118h84c14 0 22 10 22 24v20c0 16-10 26-24 26h-82c-14 0-22-10-22-24v-22c0-14 8-24 22-24z"
        fill="none" stroke="{ORANGE}" stroke-width="9" stroke-linejoin="round"/>
  <g fill="{ORANGE}" stroke="{BURNT}" stroke-width="2.2" stroke-linejoin="round">
    <path d="M136 106h34v26h-34z"/>
  </g>
  <path d="M153 132c0 34-14 56-40 74" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>
  <!-- the ladder teeth the pawl bites -->
  <g stroke="{BURNT}" stroke-width="1.4" opacity=".75">
    <path d="M148 142h12M147 152h12M145 162h12M142 172h12M137 182h12M130 191h12"/>
  </g>
  <g stroke="{GRAPHITE}" stroke-width="2" fill="none">
    <path d="M144 112h18v14h-18z"/>
  </g>
'''

# 9 -- PP box strapping: a carton closed with a strap, coil behind -----------
ART["pp-box-strapping"] = f'''
  <!-- the coil, on its 200mm machine core -->
  <g fill="none" stroke="{GRAPHITE}" stroke-width="2.4">
    <circle cx="308" cy="150" r="54"/>
    <circle cx="308" cy="150" r="20"/>
  </g>
  <g fill="none" stroke="{ORANGE}" stroke-width="2.6" opacity=".9">
    <circle cx="308" cy="150" r="46"/><circle cx="308" cy="150" r="38"/><circle cx="308" cy="150" r="30"/>
  </g>
  <!-- the carton -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M62 132h164v100H62z"/>
    <path d="M62 132 108 98h164l-46 34z"/>
    <path d="M226 132l46-34v100l-46 34z"/>
  </g>
  <path d="M144 98v134" stroke="{GRAPHITE}" stroke-width="2" opacity=".5"/>
  <!-- the strap round it, weld joint on the face -->
  <g fill="{ORANGE}" stroke="{BURNT}" stroke-width="1.6">
    <path d="M126 132h12v100h-12z"/>
    <path d="M126 132 172 98h12l-46 34z"/>
  </g>
  <path d="M124 168h16v14h-16z" fill="{GRAPHITE}"/>
  <g stroke="{BURNT}" stroke-width="1" opacity=".6">
    <path d="M129 140h6M129 148h6M129 156h6M129 192h6M129 200h6M129 208h6M129 216h6M129 224h6"/>
  </g>
'''

# 10 -- Self adhesive tapes: a roll with a strip peeled off ------------------
ART["self-adhesive-tapes"] = f'''
  <!-- the roll, seen at a slight angle -->
  <g stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M92 112h54v92H92z" fill="{ORANGE}"/>
    <ellipse cx="92" cy="158" rx="24" ry="46" fill="{ORANGE}"/>
    <ellipse cx="146" cy="158" rx="24" ry="46" fill="{BURNT}"/>
    <ellipse cx="146" cy="158" rx="10" ry="19" fill="{EMBER}"/>
  </g>
  <g stroke="{EMBER}" stroke-width="1.6" opacity=".55">
    <path d="M104 112h54M104 204h54M98 128h54M98 188h54"/>
  </g>
  <!-- the strip running off and lifting at the end -->
  <path d="M146 194h108c22 0 38-8 52-26" fill="none" stroke="{ORANGE}" stroke-width="20" stroke-linecap="round" opacity=".92"/>
  <path d="M146 194h108c22 0 38-8 52-26" fill="none" stroke="{BURNT}" stroke-width="1.6" opacity=".5"/>
  <!-- printed carton mark down the tape, which is half the point of it -->
  <g fill="{EMBER}" opacity=".9">
    <path d="M170 190h16v8h-16zM196 190h16v8h-16zM222 190h16v8h-16zM248 189h14v8h-14z"/>
  </g>
  <!-- the carton it is sealing -->
  <g fill="{WHITE}" stroke="{GRAPHITE}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M158 204h150v52H158z"/>
    <path d="M233 204v52"/>
  </g>
'''


def build():
    os.makedirs(OUT, exist_ok=True)
    for slug, art in ART.items():
        title = slug.replace("-", " ").title()
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" role="img">\n'
            f"  {chrome(title)}\n"
            f"{art}"
            f"</svg>\n"
        )
        path = os.path.join(OUT, f"{slug}.svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print(f"wrote {path}")
    print(f"\n{len(ART)} illustrations written to {OUT}")


if __name__ == "__main__":
    build()
