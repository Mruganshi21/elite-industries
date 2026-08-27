using EliteIndustries.Models;
using Microsoft.AspNetCore.Mvc;

namespace EliteIndustries.Controllers;

/// <summary>
/// Serves /Contact — company contact details, the enquiry form and the works
/// location map.
/// </summary>
/// <remarks>
/// NOTE: this form does NOT send email yet. A valid submission is written to
/// the application log and acknowledged via TempData; nothing leaves the
/// server. Wire an SMTP / transactional-mail client in at the marked spot in
/// <see cref="Index(ContactMessage)"/> before this goes live, or enquiries
/// will be silently lost.
/// </remarks>
public class ContactController : Controller
{
    private readonly ILogger<ContactController> _logger;

    public ContactController(ILogger<ContactController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Index() => View(new ContactMessage());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Index(ContactMessage message)
    {
        if (!ModelState.IsValid)
        {
            // Re-render with the visitor's input intact so nothing is retyped.
            return View(message);
        }

        _logger.LogInformation(
            "Enquiry received from {Name} <{Email}> at {Company}. Phone: {Phone}. Product: {ProductInterest}.",
            message.Name,
            message.Email,
            string.IsNullOrWhiteSpace(message.Company) ? "(no company given)" : message.Company,
            string.IsNullOrWhiteSpace(message.Phone) ? "(none given)" : message.Phone,
            string.IsNullOrWhiteSpace(message.ProductInterest) ? "General enquiry" : message.ProductInterest);

        // ---------------------------------------------------------------
        // TODO: SEND THE EMAIL HERE.
        // Inject an IEmailSender (SmtpClient / SendGrid / Amazon SES) and
        // dispatch `message` to CompanyProfile.Email. Until that is wired in,
        // the enquiry exists only in the log above.
        // ---------------------------------------------------------------

        // Post-redirect-get: a refresh after submitting must not resubmit.
        TempData["ContactSuccess"] =
            $"Thank you, {message.Name}. Your enquiry has reached our sales desk — we reply within one business day.";

        return RedirectToAction(nameof(Index));
    }
}
