using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// Serves /UsedCases — representative applications showing how the catalogue is
/// specified on real export lanes: the problem, the packing solution and the
/// measured result.
/// </summary>
public class UsedCasesController : Controller
{
    public IActionResult Index() => View();
}
