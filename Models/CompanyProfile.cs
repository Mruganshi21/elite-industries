namespace EliteIndustries.Models;

/// <summary>
/// Single source of truth for company identity. Every view, SEO title and the
/// schema.org markup reads from here — change the values once and the whole
/// site follows.
/// </summary>
public static class CompanyProfile
{
    public const string Name = "Elite Industries";
    public const string LegalName = "Elite Industries Pvt. Ltd.";
    public const string Tagline = "Export Packaging & Material Handling";

    /// <summary>Used in SEO titles: "Leading Provider of {ProductCategory} for {UseCase} | {Name}".</summary>
    public const string ProductCategory = "Export Packaging Materials";

    public const int FoundedYear = 1998;

    // ---- Address -----------------------------------------------------------
    public const string StreetAddress = "Plot 42, Industrial Estate, Sachin GIDC";
    public const string City = "Surat";
    public const string Region = "Gujarat";
    public const string PostalCode = "394230";
    public const string Country = "India";
    public const string CountryCode = "IN";

    public static string ShortAddress => $"{City}, {Region}";
    public static string FullAddress =>
        $"{StreetAddress}, {City}, {Region} {PostalCode}, {Country}";

    // ---- Contact -----------------------------------------------------------
    public const string PhonePrimary = "+91 98250 12345";
    public const string PhoneSecondary = "+91 98250 67890";
    public const string Email = "sales@eliteindustries.example";

    /// <summary>E.164 form for tel: links — no spaces, no punctuation.</summary>
    public static string PhonePrimaryHref => "+919825012345";
    public static string PhoneSecondaryHref => "+919825067890";

    // ---- Geo (for schema.org + map embed) ----------------------------------
    public const string Latitude = "21.0891";
    public const string Longitude = "72.8811";

    // ---- Social ------------------------------------------------------------
    public const string LinkedIn = "https://www.linkedin.com/company/example";
    public const string Facebook = "https://www.facebook.com/example";
    public const string Twitter = "https://twitter.com/example";
    public const string YouTube = "https://www.youtube.com/@example";

    // ---- Trust statistics (homepage counters) ------------------------------

    /// <summary>
    /// Derived from <see cref="FoundedYear"/> rather than stored, so it can never
    /// go stale. This is the one figure in this group that is actually true.
    /// </summary>
    public static int YearsOfExperience => DateTime.Now.Year - FoundedYear;

    // ==== PLACEHOLDER FIGURES — NOT SUPPLIED BY THE CLIENT ====================
    //
    // The three constants below are invented stand-ins, put here so the homepage
    // stats band has something to count up to. They render as-is on the live
    // page and read as fact to a visitor, so they MUST be replaced with the
    // client's real numbers before launch.
    //
    // This is the only place they are declared. Views/Home/_Stats.cshtml reads
    // them from here and nothing else hard-codes them, so changing a number
    // here is the whole job.
    // =========================================================================
    public const int ProjectsCompleted = 2400;
    public const int Employees = 180;
    public const int HappyClients = 650;

    // ---- Assets ------------------------------------------------------------
    public const string BrochurePath = "/downloads/elite-industries-brochure.pdf";
    public const string HeroVideoPath = "/video/hero.mp4";

    /// <summary>Title card played over the homepage on the first visit of a session.</summary>
    public const string IntroVideoPath = "/video/elite-industries-intro.mp4";

    public const string BusinessHours = "Mon–Sat, 09:00–18:00 IST";
    public const string PhoneLabel = "24/7 Phone Services";
}
