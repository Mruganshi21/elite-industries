namespace EliteIndustries.Models;

public class Product
{
    /// <summary>URL segment, e.g. /Products/vci-film — also names the SVG thumbnail.</summary>
    public string Slug { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    /// <summary>Short category label shown on the card.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>One line for the card and the meta description.</summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>Primary use case, used to build the SEO title.</summary>
    public string UseCase { get; set; } = string.Empty;

    /// <summary>Full description paragraphs for the detail page.</summary>
    public string[] Description { get; set; } = Array.Empty<string>();

    /// <summary>Specification rows: label → value.</summary>
    public (string Label, string Value)[] Specifications { get; set; }
        = Array.Empty<(string, string)>();

    public string[] Applications { get; set; } = Array.Empty<string>();


    /// <summary>Where and how the product is typically used — the one line the
    /// homepage card carries under the name.</summary>
    public string WhereUsed { get; set; } = string.Empty;

    /// <summary>Picked for the curated homepage grid. Not every product is.</summary>
    public bool IsFeatured { get; set; }

    public string ImagePath => $"/img/products/{Slug}.svg";

    /// <summary>"Leading Provider of X for Y | Company" — the pattern the brief asked for.</summary>
    public string SeoTitle => $"Leading Provider of {Name} for {UseCase} | {CompanyProfile.Name}";
}
