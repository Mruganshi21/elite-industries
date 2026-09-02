# Elite Industries

A B2B website for a manufacturer and wholesaler of **export packaging and
material handling products** for container and cargo shipping.

ASP.NET Core 8 MVC. Red-and-white corporate industrial theme. No database and
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

### There is no intro title card

The homepage used to open with a full-screen title card playing
`elite-industries-intro.mp4` over the whole page, once per session. It is gone:
`Views/Home/Index.cshtml` renders `_Hero` first and the page opens straight on
the hero. `Views/Home/_Intro.cshtml`, `wwwroot/css/intro.css` and
`wwwroot/js/intro.js` were deleted with it, and nothing writes the
`ei.intro.seen` session key any more.

That clip is now the hero background — `CompanyProfile.HeroVideoPath` points at
it. It replaced `wwwroot/video/hero.mp4`, a 20.5 MB screen recording of
**signode.com** that the brief supplied as an animation-style reference, browser
toolbar and bookmarks bar included. It was reference material, not footage. The
file is still on disk and nothing renders it — see `wwwroot/video/README.md`.

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
wwwroot/video/elite-industries-intro.mp4   hero background loop, 482 KB
wwwroot/video/hero.mp4          UNUSED — see wwwroot/video/README.md
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

## Deploying

Two routes are set up, because the site can be served two different ways.

### Static, on Cloudflare Pages — free, and what is live

Nothing here varies per visitor. Every page is rendered from `ProductCatalog`
and `CompanyProfile`, both hardcoded, so the server does the same work on every
request. `tools/export_static.py` does that work once and writes flat HTML to
`dist/`, which any static host serves for nothing, with no cold start and no
process to fall over.

```
python tools/export_static.py --form-endpoint https://formspree.io/f/XXXXXXXX
```

It builds the app, starts it on port 5199, crawls every reachable page, copies
`wwwroot` in at the root, writes `404.html` from the error view, and stops the
app. `dist/` is committed, so Cloudflare Pages needs no build step:

| Cloudflare Pages setting | Value |
| --- | --- |
| Build command | *(leave empty)* |
| Build output directory | `dist` |
| Framework preset | None |

Routes are written as `About/index.html`, not `About.html`, so every link the
app generated keeps working unchanged — a static host resolves `/About` to
`/About/index.html` on its own. Nothing is rewritten.

**Re-run the export after any content change**, then commit `dist/` — otherwise
the deployed site still shows the old copy.

#### The contact form

A static host cannot accept a POST, so `--form-endpoint` repoints the form at a
form service and strips the antiforgery field, which would otherwise arrive as a
junk entry on every enquiry. Sign up at [formspree.io](https://formspree.io),
create a form, and pass the endpoint it gives you.

This is the one place where the static build is *better* than the running app:
`ContactController` never sent email in the first place — see Known gaps.

### As a running .NET app, on Render

Kept for when the site needs a real server again — a live catalogue, a login, a
contact form handled in-process. Render has no native .NET runtime, so the
service builds from the root `Dockerfile`: SDK image to compile, ASP.NET runtime
image to ship. Render reads `render.yaml` and needs nothing filled in.

Two things about the container the app cannot see from inside:

- **The port is not fixed.** Render injects `$PORT` at start-up, so the
  `ENTRYPOINT` expands it into `ASPNETCORE_URLS` in a shell rather than baking a
  port into an `ENV`.
- **TLS terminates at Render's proxy**, so requests reach Kestrel over plain
  HTTP. `app.UseHttpsRedirection()` finds no HTTPS port, logs
  `Failed to determine the https port for redirect` once, and does nothing —
  which is correct here, as Render already redirects HTTP to HTTPS at the edge.
  Do **not** set `ASPNETCORE_HTTPS_PORTS` to silence that warning; it produces a
  redirect loop.

Render's free instance sleeps after 15 minutes of no traffic and takes about a
minute to wake, and now wants a card on file. That is why the static route above
is the one in use.

## Adding a page

Read `docs/build-contract.md`. It documents the CSS class contract, the ViewData
keys `_Layout` reads, the icon sprite ids, and the house tone — so a new page
comes out looking like the rest of the site.
