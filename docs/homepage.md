# The homepage

`Views/Home/Index.cshtml` is the only page that uses any of this. Interior
pages are untouched and still follow `docs/build-contract.md`.

## Where the design came from

The brief supplied a screen recording as a reference for the hero animation:
`Screen Recording 2026-08-24 111906.mp4`, a capture of **signode.com/en-in**.
What was taken from it:

- a **scroll-responsive isometric packing line** as the hero subject, instead of
  a static banner or a stock video;
- **quick-jump product chips** under the hero copy, the same idea as Signode's
  search chips;
- generous whitespace and a calm, low-saturation canvas with a single accent.

What was **not** taken: Signode's cream-and-brick palette and serif display
face. The homepage keeps Elite's existing orange `#ee6a1e` / navy `#16202e`
and Barlow Condensed + Inter, so it reads as the same company as the rest of
the site.

> The recording is a capture of another company's website, browser chrome and
> all. It is reference material, not footage. It is no longer used as the hero
> background — see "Removed" below.

## Sections, in order

| # | Section | Notes |
| --- | --- | --- |
| 1 | Hero | Animated isometric scene, headline, two CTAs, product chips, trust strip |
| 2 | About | Split copy + facility illustration, two pillars, check list, CTA |
| — | Stats bar | The four `CompanyProfile` counters, shared `.stats-bar` component |
| 3 | What we offer | All 8 catalogue products, filterable by three groups |
| 4 | Capabilities | Process line illustration + four numbered stages |
| 5 | Why choose us | Six cards + a five-mark certification strip |
| 6 | Industries + reach | Eight sectors, animated dot-map, three reach figures |
| 7 | Used cases | Three teasers drawn from `Views/UsedCases/Index.cshtml` |
| 8 | Closing CTA | Quote panel with brochure, phone, email |

Every figure on the page comes from `Models/CompanyProfile.cs`,
`Services/ProductCatalog.cs`, or the existing case-study copy. Nothing new was
invented, and no certification beyond ISO 9001:2015, ISPM-15, NACE TM0208,
EN 12195-2 and AAR (all already claimed in the product catalogue) is stated.

## Files

```
Views/Home/Index.cshtml        the page
Views/Home/_HeroScene.cshtml   GENERATED — the isometric hero scene
Views/Home/_WorldReach.cshtml  the dot-map, inlined so CSS can animate it
Views/Shared/_IconsHome.cshtml extra icon symbols, rendered by Index only
wwwroot/css/home.css           everything homepage-only
wwwroot/js/home.js             hero entrance, parallax, filters, map trigger
wwwroot/img/about-facility.svg
wwwroot/img/process-line.svg
wwwroot/img/products/*.svg     the 8 catalogue illustrations
```

`site.css` and `site.js` were left alone apart from the footer, which was
lifted site-wide (accent rule, mesh, hover states, back-to-top link).

## The hero scene is generated, not hand-drawn

`Views/Home/_HeroScene.cshtml` is machine-generated so the isometric projection
is exact. The generator is `tools/gen_hero_scene.py`:

```
python tools/gen_hero_scene.py
```

It projects world coordinates as

```
screen_x = (x - y) * cos30 * S
screen_y = (x + y) * 0.5   * S - z * S
```

so `+x` runs down-right (the direction cargo travels), `+y` down-left, `+z` up.
The visible faces of any box are therefore its top, its `x`-max face and its
`y`-max face — which is what `box()` draws, in that order, shading top lightest.
The viewBox is fitted to the machinery; the floor grid is deliberately excluded
from that fit so it can bleed off the edges.

The generator also writes `--travel-x` / `--travel-y` onto the root `<svg>`:
the screen-space delta of 58 world units along the conveyor. `home.css` uses
those two values to run the cartons down the belt, so the animation stays
correct if the layout is regenerated at a different scale.

**Do not hand-edit the partial.** Change the generator and re-run it.

## Animation

| What | Driven by | Off under reduced motion |
| --- | --- | --- |
| Headline lines, copy, callouts | `.is-ready` added by `home.js` on first frame | yes — shown in place |
| Cartons, film rings, strap head | CSS keyframes in `home.css` | yes — cartons spaced statically along the belt |
| Hero scene parallax + pointer tilt | `home.js`, rAF-throttled, ≥1181 px only | yes |
| Section entrances (`.reveal`) | `site.js` IntersectionObserver | yes |
| Counters (`[data-count-to]`) | `site.js` | yes — final value written directly |
| Process rule, map arcs and nodes | `.is-visible` class + CSS | yes — drawn complete |

The `prefers-reduced-motion` block at the end of `home.css` is the single place
that switches all of it off. If you add motion, add it there too.

## Removed

- `wwwroot/css/hero.css` and `wwwroot/js/hero.js` — the old video-background
  hero. Superseded; nothing else referenced them.
- The `<video>` element and its loading policy. `wwwroot/video/hero.mp4`
  (20.5 MB) is still on disk and `CompanyProfile.HeroVideoPath` still points at
  it, but nothing renders it. Delete both once you are happy with the new hero,
  or repoint `HeroVideoPath` at real facility footage and reinstate a video
  layer behind `.hero-bg`.

## If you change the catalogue

The offer grid renders whatever `ProductCatalog.Featured()` returns, but the
filter chips map slugs to three groups in `GroupOf()` at the top of
`Index.cshtml`. A new product falls into `secure` by default — add it to the
right arm of that switch. Each product also needs
`wwwroot/img/products/{slug}.svg`.
