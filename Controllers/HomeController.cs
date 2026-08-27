using System.Diagnostics;
using EliteIndustries.Models;
using EliteIndustries.Services;
using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    // Six, not eight: the homepage grid is three across, so six fills two
    // clean rows. Seven products carry IsFeatured and the seventh would sit
    // alone on a third row. The count is decided here and _Products renders
    // exactly what it is handed — see the note at the top of that partial.
    public IActionResult Index() => View(ProductCatalog.Featured(6).ToList());

    public IActionResult Privacy() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
    }
}
