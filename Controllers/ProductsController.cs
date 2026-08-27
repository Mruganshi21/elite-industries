using EliteIndustries.Services;
using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// The product catalogue listing and the per-product detail pages.
/// Routes: /Products and /Products/Detail/{slug} - the slug parameter name is
/// fixed, the layout footer links to it with asp-route-slug.
/// </summary>
public class ProductsController : Controller
{
    // ?q= is what the header search box submits. It is optional: /Products with
    // no query is still the full catalogue listing, so the route did not change.
    public IActionResult Index(string? q)
    {
        ViewData["Query"] = q;
        return View(ProductCatalog.Search(q));
    }

    // Attribute-routed so the URL is a clean /Products/Detail/{slug}; the
    // default conventional route names its third segment "id".
    [Route("Products/Detail/{slug}")]
    public IActionResult Detail(string slug)
    {
        var product = ProductCatalog.BySlug(slug);

        if (product is null)
        {
            return NotFound();
        }

        return View(product);
    }
}
