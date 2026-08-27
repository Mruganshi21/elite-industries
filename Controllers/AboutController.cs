using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// Serves /About — company overview, ideology and achievements, rendered as
/// three accessible tab panels the header dropdown deep-links into.
/// </summary>
public class AboutController : Controller
{
    public IActionResult Index() => View();
}
