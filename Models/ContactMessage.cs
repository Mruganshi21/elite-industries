using System.ComponentModel.DataAnnotations;

namespace EliteIndustries.Models;

/// <summary>
/// A single enquiry submitted from /Contact. Bound straight from the form —
/// there is no persistence layer; the controller logs it and hands the visitor
/// a confirmation. Wire SMTP into <c>ContactController</c> when the client's
/// mailbox details are available.
/// </summary>
public class ContactMessage
{
    [Required(ErrorMessage = "Please tell us your name.")]
    [StringLength(80, ErrorMessage = "Please keep your name to 80 characters or fewer.")]
    [Display(Name = "Full name")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "We need an email address to reply to.")]
    [EmailAddress(ErrorMessage = "That does not look like a valid email address.")]
    [StringLength(120, ErrorMessage = "Please keep the email address to 120 characters or fewer.")]
    [Display(Name = "Email")]
    public string Email { get; set; } = string.Empty;

    [StringLength(80, ErrorMessage = "Please keep the company name to 80 characters or fewer.")]
    [Display(Name = "Company")]
    public string? Company { get; set; }

    [Phone(ErrorMessage = "Please enter a phone number we can dial, including the country code.")]
    [StringLength(30, ErrorMessage = "Please keep the phone number to 30 characters or fewer.")]
    [Display(Name = "Phone")]
    public string? Phone { get; set; }

    [StringLength(100, ErrorMessage = "Please keep the product name to 100 characters or fewer.")]
    [Display(Name = "Product of interest")]
    public string? ProductInterest { get; set; }

    [Required(ErrorMessage = "Please tell us what you need.")]
    [StringLength(2000, MinimumLength = 10,
        ErrorMessage = "Please give us between 10 and 2,000 characters — grades, sizes and quantities help most.")]
    [Display(Name = "Your requirement")]
    public string Body { get; set; } = string.Empty;
}
