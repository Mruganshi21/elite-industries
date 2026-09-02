namespace EliteIndustries.Models;

/// <summary>
/// One sector the company supplies, and the catalogue slugs it is served by.
/// </summary>
/// <remarks>
/// The sector list and every sector-to-product pairing come from the "Used
/// Cases" section of the client's own site (eliteind.in/used-cases.aspx and the
/// seventeen pages under it), where each sector page is a set of product
/// entries. Nothing here is inferred: if a product is listed against a sector
/// below, that sector's page on eliteind.in listed it.
/// </remarks>
public class Industry
{
    /// <summary>URL segment, and the anchor the listing links to.</summary>
    public string Slug { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Expansion of an abbreviated name, shown after it. Only HVAC has one —
    /// the client spells it out and it is worth keeping.
    /// </summary>
    public string? Expansion { get; set; }

    /// <summary>
    /// <see cref="Product.Slug"/> values, in the order the client's own page
    /// lists them. A slug that is not in <c>ProductCatalog</c> renders nothing,
    /// so these must be kept in step with it.
    /// </summary>
    public string[] ProductSlugs { get; set; } = Array.Empty<string>();
}
