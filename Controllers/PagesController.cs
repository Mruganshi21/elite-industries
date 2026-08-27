using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// Placeholder pages for the navigation sections that have not been written yet.
///
/// The header and footer were rebuilt to the full section structure the client
/// signed off on, but the copy for most of those sections does not exist. Rather
/// than let the nav point at 404s — or invent product claims we cannot stand
/// behind — every one of those links resolves here and gets an honest holding
/// page. As each section is written, delete its row from <see cref="Pages"/> and
/// give it a real controller and view; the nav tag helper is then the only thing
/// that needs repointing.
/// </summary>
public class PagesController : Controller
{
    /// <summary>
    /// One holding page. <c>Section</c> drives both the breadcrumb and the
    /// header highlight, so it must match a nav tab name where one applies
    /// ("Products", "Industries", "Services", "Sustainability", "Competences").
    /// Footer-only sections use their own label and highlight no tab.
    /// </summary>
    public sealed record StubPage(string Title, string Section, string Blurb);

    /// <summary>
    /// slug to page. Every slug here is reachable from <c>_Layout</c>, and
    /// nothing in the nav points at a slug that is missing from this map.
    /// </summary>
    private static readonly IReadOnlyDictionary<string, StubPage> Pages =
        new Dictionary<string, StubPage>(StringComparer.OrdinalIgnoreCase)
        {
            // ---- Products -------------------------------------------------
            ["strapping-systems"] = new(
                "Strapping Systems", "Products",
                "Steel and polyester strapping, seals, and the manual, pneumatic and battery tools that apply them — for bundling, palletising and unitising loads that have to survive multimodal handling."),
            ["stretch-hooding-systems"] = new(
                "Stretch & Hooding Systems", "Products",
                "Stretch film, stretch wrapping and hooding for pallet stabilisation, covering hand-applied film through to semi-automatic and automatic wrapping lines."),
            ["case-packaging"] = new(
                "Case Packaging", "Products",
                "Cartons, case erecting, sealing and taping for secondary packaging — the stage between the product leaving the line and the pallet being built."),
            ["protective"] = new(
                "Protective", "Products",
                "Edge protectors, corner boards, VCI films and papers, desiccants and void fill: the consumables that keep a load square, dry and free of corrosion in transit."),
            ["container-liners"] = new(
                "Container Liners", "Products",
                "Dry bulk and general-purpose liners for shipping containers, with the fitting and discharge arrangements suited to the cargo being loaded."),
            ["stapling-systems"] = new(
                "Stapling Systems", "Products",
                "Carton and case staplers, pallet nailing, and the fastening consumables that go with them, for timber packaging and heavy-duty corrugated."),
            ["custom-automation-solutions"] = new(
                "Custom Automation Solutions", "Products",
                "End-of-line automation built around an existing plant layout — conveying, strapping gantries, wrapping turntables, and the integration work that joins them."),
            ["labels"] = new(
                "Labels", "Products",
                "Shipping, identification and compliance labels, plus the printers and applicators that put them on cartons and pallets at line speed."),

            // ---- Industries -----------------------------------------------
            ["industries"] = new(
                "Industries", "Industries",
                "The sectors we supply, and how the packaging specification changes between them. Each industry page will set out the loads, the handling they meet, and the products that suit."),
            ["metals"] = new(
                "Metals", "Industries",
                "Coil, sheet, ingot, billet and wire — heavy, dense, corrosion-prone loads where strapping tension and moisture control decide whether the consignment arrives saleable."),
            ["chemicals-and-paints"] = new(
                "Chemicals and Paints", "Industries",
                "Drums, IBCs, pails and bagged product, where load stability and compliant labelling carry as much weight as the packaging itself."),
            ["corrugated-paper"] = new(
                "Corrugated / Paper", "Industries",
                "Reels, bales and stacked board — light-crush loads that need clamp-truck-friendly unitising and edge protection."),
            ["empty-container"] = new(
                "Empty Container", "Industries",
                "Packaging for empty cans, bottles, preforms and closures moved in bulk, where the cost per unit shipped is set almost entirely by how tightly the load is built."),
            ["pharma"] = new(
                "Pharma", "Industries",
                "Temperature-sensitive and tamper-evident consignments, where traceability and documented packaging specifications are part of the product."),
            ["food"] = new(
                "Food", "Industries",
                "Food-contact-safe materials, hygienic handling, and load formats that survive cold chain and long export legs."),
            ["beverage"] = new(
                "Beverage", "Industries",
                "High-volume canned, bottled and kegged product, where line speed and pallet stability set the packaging specification."),
            ["cotton-fiber-textile"] = new(
                "Cotton, Fiber & Textile", "Industries",
                "Baled fibre and rolled goods — compressible loads that need strapping able to hold tension as the bale relaxes."),
            ["construction"] = new(
                "Construction", "Industries",
                "Bagged cement, tiles, pipe, rebar and sheet materials: awkward, abrasive loads handled outdoors and stored in the open."),
            ["timber-products"] = new(
                "Timber Products", "Industries",
                "Sawn timber, panels and ISPM-15 treated packaging, including the fastening and strapping used to build export crates and pallets."),
            ["printing-mail"] = new(
                "Printing / Mail", "Industries",
                "Bundled print, mail and periodicals, where fast bundling and clean presentation matter more than raw strap strength."),
            ["logistics-ecommerce"] = new(
                "Logistics & Ecommerce", "Industries",
                "Mixed-SKU pallets, high pick rates and third-party handling — loads that get touched more often, so they have to be built to take it."),
            ["general-manufacturing-engineering"] = new(
                "General Manufacturing & Engineering", "Industries",
                "Machined parts, assemblies and capital equipment, packed to order in timber, steel-strapped and rust-protected for sea freight."),

            // ---- Services -------------------------------------------------
            ["services"] = new(
                "Services", "Services",
                "What we do beyond supplying material: keeping installed equipment running, and packing on your behalf."),
            ["reliability-services"] = new(
                "Reliability Services", "Services",
                "Preventive maintenance, spares provisioning, operator training and breakdown attendance for strapping and wrapping equipment on your line."),
            ["contract-packaging"] = new(
                "Contract Packaging", "Services",
                "Export packing carried out by us — case design, ISPM-15 crating, VCI wrapping, lashing, and the documentation that travels with the consignment."),

            // ---- Sustainability -------------------------------------------
            ["sustainability"] = new(
                "Sustainability", "Sustainability",
                "Our environmental, social and governance commitments, and the reporting behind them."),
            ["csr"] = new(
                "CSR", "Sustainability",
                "Corporate social responsibility: the community, education and safety programmes we fund, and what they have delivered."),
            ["extended-producer-responsibility"] = new(
                "Extended Producer Responsibility", "Sustainability",
                "How we meet EPR obligations for the plastic packaging we place on the market, including registration, collection targets and recycler partners."),
            ["twentyby30"] = new(
                "Twentyby30™", "Sustainability",
                "The twenty-target, 2030 sustainability programme — the goals, the baseline year, and progress against each target."),
            ["environment"] = new(
                "Environment", "Sustainability",
                "Energy, emissions, water and waste at our own sites, and the recycled content in the materials we supply."),
            ["social"] = new(
                "Social", "Sustainability",
                "Health and safety performance, workforce development, and the standards we hold suppliers to."),
            ["governance"] = new(
                "Governance", "Sustainability",
                "Board oversight, business ethics, anti-bribery policy, and how concerns can be raised."),

            // ---- Competences ----------------------------------------------
            ["competences"] = new(
                "Competences", "Competences",
                "What the business is built on: the plant, the engineering capability, and the brands we manufacture under."),
            ["automation-integration"] = new(
                "Automation & Integration", "Competences",
                "Line surveys, layout design, controls and commissioning — joining new packaging equipment to plant that is already running."),
            ["our-brands"] = new(
                "Our Brands", "Competences",
                "The product brands we manufacture and distribute, and which part of the packing line each one covers."),

            // ---- Company (footer only) ------------------------------------
            ["careers"] = new(
                "Careers", "Company",
                "Open roles in manufacturing, engineering, quality and sales, and how to apply."),
            ["locations"] = new(
                "Locations", "Company",
                "Our plant, warehouse and sales offices, with the areas each one serves."),

            // ---- Media (footer only) --------------------------------------
            ["events"] = new(
                "Events", "Media",
                "Trade fairs and industry exhibitions where our team will be, with stand numbers and dates."),
            ["news"] = new(
                "News", "Media",
                "Company announcements — new equipment, certifications, capacity and appointments."),

            // ---- Legal and privacy (footer only) --------------------------
            ["accessibility"] = new(
                "Accessibility", "Legal & Privacy",
                "How this site is built to be usable with a keyboard and a screen reader, the standard we hold it to, and how to report a barrier."),
            ["cookies-policy"] = new(
                "Cookies Policy", "Legal & Privacy",
                "What this site stores in your browser, why it is stored, and how to clear it."),
            ["terms-of-website-use"] = new(
                "Terms of Website Use", "Legal & Privacy",
                "The terms on which this site is made available, including acceptable use and limits of liability."),

            // ---- Utility ---------------------------------------------------
            ["language-and-region"] = new(
                "Language & Region", "Company",
                "We currently publish in English for India. Additional languages and regional catalogues will be listed here as they go live."),
        };

    /// <summary>
    /// Catch-all for every not-yet-written nav destination. An unknown slug is a
    /// 404 rather than a generic page, so a mistyped link in a view shows up in
    /// testing instead of silently rendering something plausible.
    /// </summary>
    [HttpGet]
    [Route("page/{slug}")]
    public IActionResult Stub(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug) || !Pages.TryGetValue(slug, out var page))
        {
            return NotFound();
        }

        ViewData["Title"] = page.Title;
        ViewData["Description"] = page.Blurb;

        // Only the five header tabs are highlightable; footer-only sections
        // (Company, Media, Legal & Privacy) deliberately highlight nothing.
        ViewData["ActiveNav"] = page.Section switch
        {
            "Products" => "products",
            "Industries" => "industries",
            "Services" => "services",
            "Sustainability" => "sustainability",
            "Competences" => "competences",
            _ => ""
        };

        return View("Stub", page);
    }
}
