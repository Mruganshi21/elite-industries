namespace EliteIndustries.Models;

/// <summary>
/// Single source of truth for company identity. Every view, SEO title and the
/// schema.org markup reads from here — change the values once and the whole
/// site follows.
/// </summary>
public static class CompanyProfile
{
    public const string Name = "Elite Industries";

    /// <summary>
    /// eliteind.in trades as "Elite Industries" throughout and never states a
    /// company form, so neither does this. It was "Elite Industries Pvt. Ltd."
    /// as a placeholder, which asserted an incorporation nothing verifies —
    /// and it goes into schema.org legalName. Restore the suffix only against
    /// the certificate of incorporation.
    /// </summary>
    public const string LegalName = "Elite Industries";
    public const string Tagline = "Export Packaging & Material Handling";

    /// <summary>Used in SEO titles: "Leading Provider of {ProductCategory} for {UseCase} | {Name}".</summary>
    public const string ProductCategory = "Export Packaging Materials";

    /// <summary>
    /// Client-supplied: "Established in the year 2010 at Bharuch, Gujarat".
    /// Was 1998 as a placeholder. Everything that states the age of the company
    /// — the About page, the works plate on the homepage, the SEO descriptions,
    /// YearsOfExperience — derives from this one number, so it is the only edit.
    /// </summary>
    public const int FoundedYear = 2010;

    // ---- Address -----------------------------------------------------------
    //
    // From eliteind.in, which prints it in both the masthead and the footer of
    // every page. Title case rather than the all-caps the live site uses: the
    // caps there are a styling choice, and baking them into the data would put
    // shouting into the schema.org payload and the <title> as well.
    public const string StreetAddress = "Plot No. 157/4, Phase II, Bharuch GIDC Estate, Bholav";
    public const string City = "Bharuch";
    public const string Region = "Gujarat";
    public const string PostalCode = "392001";
    public const string Country = "India";
    public const string CountryCode = "IN";

    public static string ShortAddress => $"{City}, {Region}";
    public static string FullAddress =>
        $"{StreetAddress}, {City}, {Region} {PostalCode}, {Country}";

    // ---- Second address ----------------------------------------------------
    //
    // eliteind.in prints this in the footer alongside the works, with no label
    // saying what it is. It is a Bharuch address on the Dahej bypass and reads
    // like an office rather than a plant, so it is shown as one — but that is
    // an inference from the form of the address, and it is the one thing on
    // this page worth confirming with the client before launch.
    //
    // The works address above stays the primary: it is the one in the
    // schema.org LocalBusiness payload, and a second postal address there would
    // make the markup ambiguous about where the business actually is.
    public const string OfficeStreetAddress = "305, Shilpi Square, Dahej Bypass Road";
    public const string OfficeCity = "Bharuch";
    public const string OfficeRegion = "Gujarat";

    /// <summary>Label for the second address. See the note above it.</summary>
    public const string OfficeLabel = "Office";

    public static string OfficeFullAddress =>
        $"{OfficeStreetAddress}, {OfficeCity}, {OfficeRegion}";

    // ---- Contact -----------------------------------------------------------
    //
    // From eliteind.in. The live site prints the numbers without a country
    // code; +91 is added here because a tel: link on a phone in another country
    // will not connect without it, and the two forms below have to agree.
    public const string PhonePrimary = "+91 98980 14279";
    public const string PhoneSecondary = "+91 93280 14279";
    public const string Email = "sales@eliteind.in";

    /// <summary>E.164 form for tel: links — no spaces, no punctuation.</summary>
    public static string PhonePrimaryHref => "+919898014279";
    public static string PhoneSecondaryHref => "+919328014279";

    // ---- Geo (for schema.org + map embed) ----------------------------------
    //
    // The town centroid of Bharuch, NOT the works. eliteind.in publishes the
    // street address but no coordinates and no map embed, so there was nothing
    // to take. Right town, wrong building: a pin dropped on Plot 157/4, Phase
    // II, Bholav GIDC will beat this, and it is the one address figure on the
    // site still worth correcting by hand.
    public const string Latitude = "21.7051";
    public const string Longitude = "72.9959";

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

    // ---- Trust figures -----------------------------------------------------
    //
    // The client's own, from the counters on the eliteind.in homepage: "340+
    // Complete Projects", "45+ Works Employed", "112+ Happy Clients". They
    // replace invented stand-ins that were roughly seven times too large.
    //
    // The fourth counter on that page, "14 years Experience", is deliberately
    // NOT copied: it was true when the page was written and is not now.
    // YearsOfExperience derives it from FoundedYear instead, so this site
    // cannot go stale the same way.
    //
    // This is the only place they are declared. Views/Home/_Stats.cshtml and
    // the About page read them from here, so changing a number here is the
    // whole job.
    public const int ProjectsCompleted = 340;
    public const int Employees = 45;
    public const int HappyClients = 112;

    // ---- Assets ------------------------------------------------------------
    public const string BrochurePath = "/downloads/elite-industries-brochure.pdf";
    /// <summary>
    /// The looping background of the homepage hero. This is the clip that used
    /// to run as the full-screen intro title card; the card was removed and the
    /// homepage now opens straight on the hero, so the same 482 KB file does the
    /// background instead. The old 20.5 MB hero.mp4 is still in wwwroot/video/
    /// but nothing references it.
    /// </summary>
    public const string HeroVideoPath = "/video/elite-industries-intro.mp4";

    public const string BusinessHours = "Mon–Sat, 09:00–18:00 IST";
    public const string PhoneLabel = "24/7 Phone Services";
}
