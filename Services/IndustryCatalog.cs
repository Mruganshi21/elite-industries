using EliteIndustries.Models;

namespace EliteIndustries.Services;

/// <summary>
/// The seventeen sectors the company supplies, and the products each is served
/// by. Held in code for the same reason <see cref="ProductCatalog"/> is: it
/// changes rarely, and it keeps the site deployable as a single artefact.
/// </summary>
/// <remarks>
/// <para>
/// Transcribed from the client's own Used Cases pages. Every pairing below
/// appears on eliteind.in — none of it is inferred from what a sector "probably"
/// needs, which is the whole point: the page this feeds used to carry three
/// invented case studies with invented tonnages.
/// </para>
/// <para>
/// The client's product entries are finer-grained than this catalogue in two
/// places, and both collapse onto one slug here:
/// </para>
/// <list type="bullet">
///   <item>3 Ply Sheet and 5 Ply Sheet → <c>pp-corrugated-sheet</c></item>
///   <item>Masking Tapes, Kraft Paper Tapes and Duct &amp; Book-binding Tapes →
///         <c>self-adhesive-tapes</c></item>
/// </list>
/// <para>
/// Releasible and non-releasible cable ties likewise collapse onto
/// <c>cable-ties</c>. Duplicates are removed at render time, so a sector listing
/// both ply sheets shows the corrugated sheet once.
/// </para>
/// <para>
/// Two catalogue products — <c>paper-edge-boards</c> and <c>security-seal</c> —
/// are not named on any sector page, so they appear against no sector here.
/// That is a gap in the client's own Used Cases pages, not an omission to be
/// patched: assigning them somewhere plausible would be exactly the guesswork
/// this class exists to avoid. Ask the client which sectors buy them.
/// </para>
/// </remarks>
public static class IndustryCatalog
{
    public static IReadOnlyList<Industry> All { get; } = new List<Industry>
    {
        new Industry
        {
            Slug = "agriculture-and-gardening",
            Name = "Agriculture and Gardening",
            ProductSlugs = new[]
            {
                "pet-strap", "pp-corrugated-sheet", "self-adhesive-tapes",
                "polyester-composite-strap", "stretch-wrapping-film", "cable-ties"
            }
        },
        new Industry
        {
            Slug = "education-and-stationery",
            Name = "Education and Stationery",
            ProductSlugs = new[] { "pp-box-strapping" }
        },
        new Industry
        {
            Slug = "ports",
            Name = "Ports",
            ProductSlugs = new[] { "polyester-composite-strap", "dunnage-air-bags" }
        },
        new Industry
        {
            Slug = "textile-industries",
            Name = "Textile Industries",
            ProductSlugs = new[] { "self-adhesive-tapes", "stretch-wrapping-film" }
        },
        new Industry
        {
            Slug = "chemical",
            Name = "Chemical",
            ProductSlugs = new[]
            {
                "pet-strap", "pp-box-strapping",
                "polyester-composite-strap", "stretch-wrapping-film"
            }
        },
        new Industry
        {
            Slug = "rubber-and-miscellaneous-plastic",
            Name = "Rubber and Miscellaneous Plastic",
            ProductSlugs = new[] { "pet-strap" }
        },
        new Industry
        {
            Slug = "automobiles",
            Name = "Automobiles",
            ProductSlugs = new[] { "pp-corrugated-sheet" }
        },
        new Industry
        {
            Slug = "printing-and-advertising",
            Name = "Printing and Advertising",
            ProductSlugs = new[] { "pp-corrugated-sheet" }
        },
        new Industry
        {
            Slug = "building-and-construction",
            Name = "Building and Construction",
            ProductSlugs = new[] { "pp-corrugated-sheet" }
        },
        new Industry
        {
            Slug = "machinery-and-equipment",
            Name = "Machinery and Equipment",
            ProductSlugs = new[] { "pp-corrugated-sheet", "polyester-composite-strap" }
        },
        new Industry
        {
            Slug = "solar-industries",
            Name = "Solar Industries",
            ProductSlugs = new[]
            {
                "pet-strap", "pp-corrugated-sheet", "stretch-wrapping-film"
            }
        },
        new Industry
        {
            Slug = "transport-and-logistics",
            Name = "Transport and Logistics",
            ProductSlugs = new[] { "polyester-composite-strap" }
        },
        new Industry
        {
            Slug = "glass-industries",
            Name = "Glass Industries",
            ProductSlugs = new[]
            {
                "pet-strap", "pp-box-strapping", "polyester-composite-strap"
            }
        },
        new Industry
        {
            Slug = "ceramic-and-marble",
            Name = "Ceramic and Marble",
            ProductSlugs = new[] { "pp-box-strapping" }
        },
        new Industry
        {
            Slug = "food-and-beverage",
            Name = "Food and Beverage",
            ProductSlugs = new[] { "stretch-wrapping-film" }
        },
        new Industry
        {
            Slug = "healthcare-and-pharmaceuticals",
            Name = "Healthcare and Pharmaceuticals",
            ProductSlugs = new[]
            {
                "pp-box-strapping", "pet-strap", "stretch-wrapping-film"
            }
        },
        new Industry
        {
            Slug = "hvac",
            Name = "HVAC",
            Expansion = "Heating, Ventilation and Air Conditioning",
            ProductSlugs = new[] { "self-adhesive-tapes" }
        }
    };

    /// <summary>
    /// The products a sector is served by, resolved against
    /// <see cref="ProductCatalog"/> and de-duplicated. A slug with no matching
    /// product is dropped rather than throwing: a broken link on a listing is
    /// worse than a short list.
    /// </summary>
    public static IReadOnlyList<Product> ProductsFor(Industry industry) =>
        industry.ProductSlugs
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(slug => ProductCatalog.All.FirstOrDefault(p =>
                string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase)))
            .Where(p => p is not null)
            .Select(p => p!)
            .ToList();
}
