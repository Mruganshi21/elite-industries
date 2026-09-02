using EliteIndustries.Services;
using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// Serves /UsedCases — the sectors the company supplies and the products each
/// is served by, taken from the client's own Used Cases pages.
/// </summary>
/// <remarks>
/// This used to render three written-up case studies with named transit lanes,
/// container counts and cost-per-container figures. None of it came from the
/// client and none of it was verifiable, so it was replaced with the sector
/// list the client actually publishes. See <see cref="IndustryCatalog"/>.
/// </remarks>
public class UsedCasesController : Controller
{
    public IActionResult Index() => View(IndustryCatalog.All);
}
