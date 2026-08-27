# Elite Industries

A B2B website for a manufacturer and wholesaler of **export packaging and
material handling products** for container and cargo shipping.

ASP.NET Core 8 MVC. Orange-and-white corporate industrial theme. No database and
no external runtime dependencies — the catalogue lives in code, so the site
deploys as a single artefact.

## Run it

```
cd D:\elite-industries
dotnet run
```

Or on a fixed HTTP port:

```
dotnet run --no-launch-profile --urls http://localhost:5199
```

## ⚠ Replace the company details first

Company name, address, phone numbers, email, founding year, social links and the
trust statistics are **placeholders**. They all live in one file:

```
Models/CompanyProfile.cs
```

Change them there and every page, SEO title, `tel:` link, footer and the
schema.org markup follows. Nothing is hard-coded in a view.

The four values the brief asked for map to:

| Brief placeholder | Field |
| --- | --- |
| `[YOUR COMPANY NAME]` | `Name` / `LegalName` |
| `[YOUR PRODUCT CATEGORY]` | `ProductCategory` |
| `[YOUR LOCATION]` | `StreetAddress` / `City` / `Region` / `PostalCode` |
| `[YEAR]` | `FoundedYear` |

Product copy in `Services/ProductCatalog.cs` is written to be realistic and can
stay as-is.

## Sitemap

| Route | Page |
| --- | --- |
| `/` | Home — animated isometric hero, about, stats, product grid, capabilities, why-us, industries + reach, case studies, CTA |
| `/About` | About Us — Overview / Ideology / Achievements as tabs |
| `/Products` | Catalogue listing, 8 products |
| `/Products/Detail/{slug}` | Product detail — image, description, specs, applications, related |
| `/UsedCases` | Six case studies with an aggregate stats band |
| `/Contact` | Contact details, enquiry form, embedded map |
| `/Home/Privacy` | Privacy policy |

The About page's sub-sections are deep-linkable: `/About#overview`,
`/About#ideology`, `/About#achievements` — which is what the header dropdown
points at.

## The homepage hero

The hero is a **generated isometric packing line** — a roller conveyor carrying
cartons through a strapping gantry to a stretch-wrap turntable, with strapped
pallets staged alongside. It animates continuously and responds to scroll and
pointer position.

It is not hand-drawn. `tools/gen_hero_scene.py` projects world coordinates
through a single 30° isometric transform and writes
`Views/Home/_HeroScene.cshtml`. Change the generator and re-run it:

```
python tools/gen_hero_scene.py
```

`docs/homepage.md` covers the projection, the animation policy, and the rest of
the page section by section. **Read it before editing the homepage.**

### The old video hero is gone

`wwwroot/video/hero.mp4` was a screen recording of **signode.com** — the
reference the brief supplied for the animation style, browser toolbar and
bookmarks bar included. It was reference material, not footage, so it is no
longer rendered anywhere. The file is still on disk and
`CompanyProfile.HeroVideoPath` still points at it; delete both, or repoint the
constant at real facility footage and reinstate a video layer behind
`.hero-bg` in `home.css`.

`wwwroot/css/hero.css` and `wwwroot/js/hero.js` were removed with it.

## Layout of the source

```
Models/CompanyProfile.cs        ← identity, contact, stats. EDIT THIS FIRST
Models/Product.cs               product shape + SeoTitle pattern
Models/ContactMessage.cs        enquiry form model + validation
Services/ProductCatalog.cs      the 8 products, in code

Controllers/                    Home, About, Products, UsedCases, Contact

Views/Shared/_Layout.cshtml     top bar, sticky header w/ dropdown, footer
Views/Shared/_Icons.cshtml      inline SVG sprite (use via <use href="#i-...">)
Views/Shared/_IconsHome.cshtml  extra symbols, rendered by the homepage only
Views/Home/_HeroScene.cshtml    GENERATED — do not hand-edit
Views/Home/_WorldReach.cshtml   dot-map, inlined so CSS can animate the arcs
Views/Shared/_LocalBusinessSchema.cshtml   schema.org JSON-LD

wwwroot/css/site.css            theme + every shared component
wwwroot/css/home.css            homepage only
wwwroot/js/site.js              nav, dropdown, tabs, reveals, stat counters
wwwroot/js/home.js              hero entrance, parallax, product filters
wwwroot/img/products/*.svg      8 square product illustrations
wwwroot/img/about-facility.svg  isometric plant cutaway (About block)
wwwroot/img/process-line.svg    the four-stage capability strip
wwwroot/img/world-reach.svg     dot-map, inlined as Views/Home/_WorldReach.cshtml
wwwroot/img/hero/slide-*.svg    3 scenes; now only the schema.org image
wwwroot/video/hero.mp4          UNUSED — see "The old video hero is gone"
wwwroot/downloads/*.pdf         brochure

tools/gen_hero_scene.py         regenerates Views/Home/_HeroScene.cshtml

docs/build-contract.md          CSS class contract + conventions for new pages
docs/homepage.md                the homepage: sections, generator, motion policy
```

## SEO

- Titles follow `Leading Provider of {Category} for {UseCase} | {Company}`, set
  per page via `ViewData["SeoTitle"]`.
- `schema.org` `LocalBusiness` JSON-LD on every page: address, geo, both phone
  numbers, opening hours, social profiles and the full product catalogue. It is
  serialised from an object graph rather than written as literal JSON, because
  several product names contain `&` and would otherwise produce invalid JSON.
- Product detail pages carry their own `Product` JSON-LD.
- Every image has dimensions and `loading="lazy"` below the fold.

## Known gaps

1. **The contact form does not send email.** It validates, logs the enquiry and
   shows a success message via post-redirect-get. Wire up SMTP or a mail API at
   the marked spot in `Controllers/ContactController.cs`.
2. **The brochure PDF is a generated placeholder** — two pages, correct company
   details and product list, but not designed artwork. Replace
   `wwwroot/downloads/elite-industries-brochure.pdf`.
3. **All imagery is SVG illustration, not photography.** There were no photos
   available. The homepage is built around that constraint rather than fighting
   it — the illustrations are a deliberate isometric system, not placeholders.
   Real product shots would still lift the catalogue pages: drop them in at the
   same paths (or change `Product.ImagePath`).
4. **Case study figures are representative**, not audited. Same for the trust
   statistics in `CompanyProfile`.
5. `wwwroot/lib/bootstrap` ships with the MVC template and is unused — the theme
   is hand-written CSS. jQuery is still used, but only by the contact form's
   client-side validation.

## Deploying to Render

Render has no native .NET runtime, so the service is built from the `Dockerfile`
in the repo root — SDK image to compile, ASP.NET runtime image to ship.

1. Push to GitHub (already done — `Mruganshi21/elite-industries`).
2. On [render.com](https://render.com): **New → Web Service**, connect the repo.
3. Render reads `render.yaml` and picks Docker automatically. Nothing to fill in.
4. Deploy. First build takes a few minutes; after that the URL is
   `https://elite-industries.onrender.com` and is public.

Two things about the container the app cannot see from inside:

- **The port is not fixed.** Render injects `$PORT` at start-up, so the
  `ENTRYPOINT` expands it into `ASPNETCORE_URLS` in a shell rather than baking a
  port into an `ENV`.
- **TLS terminates at Render's proxy**, so requests reach Kestrel over plain
  HTTP. `app.UseHttpsRedirection()` finds no HTTPS port, logs
  `Failed to determine the https port for redirect` once, and does nothing —
  which is correct here. Render already redirects HTTP to HTTPS at the edge.
  Do **not** set `ASPNETCORE_HTTPS_PORTS` to silence that warning; it produces a
  redirect loop.

On the free plan the service sleeps after 15 minutes of no traffic and the next
visitor waits roughly a minute for it to wake. Fine for sharing a link, not for
a launch — the paid instance stays warm.

## Adding a page

Read `docs/build-contract.md`. It documents the CSS class contract, the ViewData
keys `_Layout` reads, the icon sprite ids, and the house tone — so a new page
comes out looking like the rest of the site.
