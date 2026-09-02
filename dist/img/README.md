# Images

Most of this directory is drawn SVG — product illustrations, the facility
cutaway, the process strip, the dot map. Those are source artwork and are edited
directly. The two logo files are not: they are derived, and this note says what
from and how to redo them.

## `logo.png` and `logo-light.png`

| File | Where it is used | Ground |
| --- | --- | --- |
| `logo.png` | masthead (`Views/Shared/_Header.cshtml`) | white |
| `logo-light.png` | footer (`Views/Shared/_Footer.cshtml`) | `--ei-ink` |

Both are derived from `elite-logo.jpeg` in the repository root, which is the
logo as the client supplied it: 308×139, RGB, on a flat `#F7F7F7` ground.

### What was done to it

1. **Trimmed** to the content bounding box, plus 2px.
2. **Un-matted** off the flat ground. A pixel's alpha comes from how far it has
   travelled from `#F7F7F7`, and its colour is then recovered by dividing the
   blend back out — `Fg = (Observed − (1−a)·Bg) / a`. Skipping that second step
   leaves every antialiased edge carrying the white it was blended with, which
   is invisible on the masthead and shows up as a pale halo the moment the logo
   sits on the footer.
3. **Floored the alpha ramp.** JPEG ringing puts faint neutral noise all around
   the shapes. Anything within 13 of the ground is treated as noise and goes
   fully transparent; opacity climbs to solid by 44. Without the floor the
   reversed variant lifts that noise to white and the logo sits in a grey box.
4. **`logo-light.png` only:** neutral ink — pixels whose max and min channels
   are within 42 of each other — is replaced with white. Anything carrying real
   hue is left exactly as delivered, so the diamond keeps the brand red and only
   the "elite" wordmark is knocked out.

### Two things worth knowing

**The reversed variant is ours, not the client's.** Knocking the type out to
white is the ordinary treatment for a dark ground, but it is still a decision
taken here rather than a file the client supplied. If they have an official
reversed or mono lockup, use it and delete `logo-light.png`.

**The source is small.** 308px wide, displayed at 40px tall in the masthead
(≈91px wide) and 52px in the footer (≈119px wide). That is comfortably past 2x
at both sizes, so it is sharp on a retina screen today — but there is no headroom
above that, and no way to add any: resampling up does not add detail. If the logo
ever needs to run larger — a print piece, a hero lockup, an OG image — ask the
client for the vector original (`.ai`, `.eps` or `.svg`). That would also let the
logo be recoloured in CSS rather than shipped twice.

The logo red is `#E31E25`. The site's `--ei-red` is `#E4181F`, taken from
eliteind.in's own `--theme-color`. They are close but not identical, and the
difference is partly JPEG. Not worth chasing without the vector original.

### Redoing them

The script is `tools/make_logo.py`. Drop a new source in as `elite-logo.jpeg`
and run:

```
python tools/make_logo.py
```

Both PNGs are rewritten. If the new source has a different background colour,
change `BG` at the top of that file.
