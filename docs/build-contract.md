# Build contract

Conventions every page in this site follows. Read this before adding a view.

## Project

ASP.NET Core 8 MVC, `EliteIndustries` namespace, at `D:\elite-industries`.
Build with `dotnet build`. Views use tag helpers (`asp-controller`, `asp-action`,
`asp-route-*`, `asp-fragment`) — never hard-code a URL.

## Data sources

- `EliteIndustries.Models.CompanyProfile` — static class, the single source of
  truth for name, tagline, address, phones, email, founding year, social links,
  trust statistics, brochure path. **Never hard-code company details in a view.**
  Key members: `Name`, `LegalName`, `Tagline`, `ProductCategory`, `FoundedYear`,
  `StreetAddress`, `City`, `Region`, `PostalCode`, `FullAddress`, `ShortAddress`,
  `PhonePrimary`, `PhoneSecondary`, `PhonePrimaryHref`, `PhoneSecondaryHref`,
  `Email`, `Latitude`, `Longitude`, `YearsOfExperience`, `ProjectsCompleted`,
  `Employees`, `HappyClients`, `BrochurePath`, `BusinessHours`, `PhoneLabel`.
- `EliteIndustries.Services.ProductCatalog` — `All` (8 products), `BySlug(slug)`,
  `Featured(count)`. Product members: `Slug`, `Name`, `Category`, `Summary`,
  `UseCase`, `Description[]`, `Specifications[]` (tuples of `Label`/`Value`),
  `Applications[]`, `ImagePath`, `SeoTitle`.

## ViewData keys read by `_Layout`

| Key | Purpose |
| --- | --- |
| `Title` | Page name; becomes `"{Title} \| Elite Industries"` |
| `SeoTitle` | Overrides the whole `<title>`. Use the brief's pattern: `Leading Provider of {Category} for {UseCase} \| {Company}` |
| `Description` | Meta description |
| `ActiveNav` | One of `home`, `about`, `products`, `usedcases`, `contact` — highlights the nav item |

## Icon sprite

`_Icons.cshtml` is rendered once in `_Layout`. Use icons by reference:

```html
<svg aria-hidden="true"><use href="#i-phone" /></svg>
```

Available ids: `i-pin`, `i-mail`, `i-phone`, `i-clock`, `i-arrow-right`,
`i-chevron-down`, `i-download`, `i-shield`, `i-container`, `i-globe`,
`i-factory`, `i-truck`, `i-award`, `i-users`, `i-linkedin`, `i-facebook`,
`i-twitter`, `i-youtube`.

## CSS contract — use these classes, do not invent new ones

Everything below already exists in `wwwroot/css/site.css`. If you genuinely need
a new style, add it in a `@section Head` block scoped to your page, and say so.

**Layout**
- `.shell` — centred container. Every section needs one inside it.
- `.section` / `.section-sm` — vertical padding. `.section-alt` adds the grey
  band, `.section-navy` the dark band.
- `.section-head` — wraps eyebrow + `<h2>` + lede. Add `.center` to centre it.
- `.eyebrow` — small orange uppercase label with a leading rule.
- `.split` — two columns; `.wide-left` / `.wide-right` shift the ratio. Collapses
  to one column under 1024px.
- `.grid` plus `.cols-2` / `.cols-3` / `.cols-4` — responsive card grids.

**Interior page banner** (every page except Home starts with this)

```html
<section class="page-header">
    <div class="shell">
        <ol class="breadcrumb">
            <li><a asp-controller="Home" asp-action="Index">Home</a></li>
            <li aria-current="page">Products</li>
        </ol>
        <h1>Products</h1>
        <p>One-line description of the page.</p>
    </div>
</section>
```

**Components**
- `.info-card` — generic card. Optional `.card-icon` (holds an `<svg>`) or
  `.card-num` (a big muted number) as the first child.
- `.product-card` > `.product-thumb` (square, holds the image) + `.product-body`
  (h3, p, `.product-link`). Optional `.product-tag` inside the thumb.
- `.stats-bar` > `.stats-grid` > four `.stat` blocks, each `<b>` + `<span>`.
- `.spec-table` — `<table>` with `<th>` label / `<td>` value rows.
- `.check-list` — `<ul>` with orange diamond bullets.
- `.timeline` — `<ul>`; each `<li>` starts with `<span class="year">`.
- `.tabs` / `.tab` / `.tab-panel` — see the tabs section below.
- `.cta-band` > `.shell` > `.cta-inner` (text block + `.cta-actions`).
- `.form-card`, `.form-grid`, `.field` (+ `.full` to span both columns).
- `.contact-list` — `<ul>`; each `<li>` is `.ci` icon box + text block.
- `.map-frame` — wraps a responsive `<iframe>`.
- `.media-frame` — rounded, shadowed image container.

**Buttons** — `.btn` plus one of `.btn-primary` (orange fill, main CTA),
`.btn-outline`, `.btn-light` (on dark), `.btn-ghost-light` (on dark).
Sizes: `.btn-sm`, `.btn-lg`.

**Animation** — add `.reveal` to any block that should fade up on scroll;
`site.js` handles it. Add `data-count-to="2400"` (optional
`data-count-suffix="+"`) to a `<b>` to make it count up.

## Tabs (About page)

`site.js` drives any element with `role="tablist"`. Markup it expects:

```html
<div class="tabs" role="tablist">
    <button class="tab" role="tab" id="tab-overview"
            aria-controls="overview" aria-selected="true">Overview</button>
    ...
</div>
<div class="tab-panel" id="overview" role="tabpanel" aria-labelledby="tab-overview">...</div>
<div class="tab-panel" id="ideology" role="tabpanel" aria-labelledby="tab-ideology" hidden>...</div>
```

Exactly one tab starts `aria-selected="true"`; every other panel gets `hidden`.
Deep links (`/About#achievements`) and arrow-key navigation already work.

## Tone

B2B industrial. Straightforward and credibility-first — specific numbers,
standards and materials, not marketing adjectives. Write like someone who has
actually packed a container. British/Indian English spelling. Never claim a
certification beyond ISO 9001:2015 and ISPM-15, which the footer already states.

## Content status

Company name, address, phone numbers and founding year are **placeholders** the
client will replace. They live in `CompanyProfile` only. Product copy is written
to be realistic and is fine to keep.
