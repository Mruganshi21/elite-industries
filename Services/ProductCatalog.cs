using EliteIndustries.Models;

namespace EliteIndustries.Services;

/// <summary>
/// The product catalogue. Held in code rather than a database — the range
/// changes rarely, and this keeps the site deployable as a single artefact.
/// Swap this class for a repository if the catalogue ever moves to a CMS.
/// </summary>
/// <remarks>
/// Every <see cref="Product.Slug"/> also names the illustration that represents
/// it: <c>wwwroot/img/products/{slug}.svg</c>. Rename a slug and the artwork has
/// to be renamed with it, or the card renders a broken image.
/// </remarks>
public static class ProductCatalog
{
    /// <summary>
    /// Free-text lookup over the fields a buyer actually types: name, category,
    /// use case, summary and applications. Deliberately a substring match rather
    /// than an index — ten products do not warrant one, and every term must
    /// match so that narrowing a search narrows the result.
    /// An empty query returns the whole catalogue, which is what the listing
    /// page shows when nobody has searched.
    /// </summary>
    public static IReadOnlyList<Product> Search(string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return All;
        }

        var terms = query.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return All
            .Where(p => terms.All(t =>
                p.Name.Contains(t, StringComparison.OrdinalIgnoreCase)
                || p.Category.Contains(t, StringComparison.OrdinalIgnoreCase)
                || p.UseCase.Contains(t, StringComparison.OrdinalIgnoreCase)
                || p.Summary.Contains(t, StringComparison.OrdinalIgnoreCase)
                || p.Applications.Any(a => a.Contains(t, StringComparison.OrdinalIgnoreCase))))
            .ToList();
    }

    public static IReadOnlyList<Product> All { get; } = new List<Product>
    {
        new Product
        {
            Slug = "dunnage-air-bags",
            Name = "Dunnage Air Bags",
            Category = "Void Fill & Bracing",
            UseCase = "Container Void Filling",
            Summary = "Inflatable kraft and woven-PP bags that fill the voids between palletised cargo and lock it in place for the whole journey.",
            WhereUsed = "Fills the gap between pallets in sea containers and railcars",
            IsFeatured = true,
            Description = new[]
            {
                "A dunnage air bag is placed empty into the void between two loads and inflated in seconds with a compressed-air gun. As it expands it takes up the slack the packer could not design out, turning a loose stow into a single braced block.",
                "Two constructions are stocked. Multi-ply kraft paper bags are the economical choice for a one-way sea or rail leg. Woven polypropylene bags carry a higher burst pressure and shrug off damp, so they suit humid lanes and reusable domestic runs.",
                "Every bag ships with a one-piece valve that inflates and deflates through the same port, so a bag can be recovered rather than cut open at destination."
            },
            Specifications = new[]
            {
                ("Levels", "1 to 4, matched to load weight"),
                ("Sizes", "600 x 1200 mm to 1200 x 2400 mm"),
                ("Material", "Multi-ply kraft or woven PP outer, PE bladder"),
                ("Burst pressure", "Up to 2.4 bar, level dependent"),
                ("Valve", "One-piece inflate / deflate"),
                ("Standard", "AAR Certified constructions available")
            },
            Applications = new[]
            {
                "Sea container stuffing",
                "Rail and road trailer bracing",
                "Drum and barrel separation",
                "Mixed-pallet consignment bracing"
            }
        },

        new Product
        {
            Slug = "polyester-composite-strap",
            Name = "Polyester Composite Strap",
            Category = "Strapping Systems",
            UseCase = "Heavy Load Securing",
            Summary = "Bonded polyester filament strap with the break strength of steel, no sharp edges and no rust — the standard replacement for steel on heavy export loads.",
            WhereUsed = "Secures heavy timber, steel coil and machinery for export",
            IsFeatured = true,
            Description = new[]
            {
                "Composite strap is built from thousands of high-tensile polyester filaments bonded in a polymer coating. It reaches the break strengths that once demanded steel while staying soft enough to handle without gloves and light enough to cut hand fatigue on a long stuffing shift.",
                "Because it is polyester it will not rust, will not stain a light-coloured load and will not score the edges of finished goods. It also retains tension elastically, recovering as the load settles instead of going slack the way steel does.",
                "Joined with a phosphated buckle rather than a seal and tensioner, so a crew can secure a load with a single tool and no crimping."
            },
            Specifications = new[]
            {
                ("Widths", "13, 16, 19, 25, 32 mm"),
                ("Break strength", "375 kgf to 2000 kgf"),
                ("Elongation", "Approx. 4% at break"),
                ("Joint", "Phosphated wire buckle"),
                ("Coil length", "150 m to 850 m, width dependent"),
                ("Resistance", "UV stabilised, non-corrosive")
            },
            Applications = new[]
            {
                "Timber and sawn-wood bundles",
                "Steel coil and pipe securing",
                "Machinery on flat racks",
                "Container lashing to D-rings"
            }
        },

        new Product
        {
            Slug = "pp-corrugated-sheet",
            Name = "P.P. Corrugated Sheet",
            Category = "Protective Packaging",
            UseCase = "Reusable Layer Protection",
            Summary = "Twin-wall polypropylene sheet — waterproof, washable and reusable — cut to layer pads, partitions, box blanks and returnable totes.",
            WhereUsed = "Layer pads, partitions and returnable bins on the line",
            IsFeatured = true,
            Description = new[]
            {
                "Twin-wall PP sheet does the job corrugated fibreboard does, except it does not soften when it gets wet and does not fail after one trip. A layer pad cut from it survives hundreds of cycles through a wash bay, which is why it has largely replaced board in closed-loop automotive and pharma supply chains.",
                "The sheet is extruded, so it can be cut, creased, welded and riveted into partitions, sleeve packs and collapsible totes without tooling. Anti-static and flame-retardant grades are available where electronics or plant safety rules demand them.",
                "Supplied in plain sheet or converted to your drawing — send a DXF and it comes back as a finished blank."
            },
            Specifications = new[]
            {
                ("Thickness", "2 mm to 6 mm"),
                ("Grammage", "350 to 2000 gsm"),
                ("Sheet size", "Up to 1200 x 2400 mm"),
                ("Grades", "Standard, anti-static, flame retardant"),
                ("Colours", "Natural, black, blue, custom"),
                ("Conversion", "Die-cut, creased, welded to drawing")
            },
            Applications = new[]
            {
                "Returnable tote and bin walls",
                "Pallet layer pads and top caps",
                "Component partitions and dividers",
                "Floor and surface protection"
            }
        },

        new Product
        {
            Slug = "pet-strap",
            Name = "PET Strap",
            Category = "Strapping Systems",
            UseCase = "Pallet & Bundle Strapping",
            Summary = "Extruded polyester strap that holds tension as a load settles, runs on manual and automatic tools alike, and ships from recycled flake.",
            WhereUsed = "Palletised bricks, tiles, paper reels and drums",
            IsFeatured = true,
            Description = new[]
            {
                "PET strap is the everyday workhorse where steel is more strength than the load needs. It takes high initial tension and — unlike steel — gives it back, so a load of bricks or paper reels that compresses in transit stays tight rather than turning into a loose stack.",
                "It runs on the full range of tooling: manual tensioner and sealer, battery combination tools, and semi- or fully automatic strapping heads. Embossed grades give friction-weld tools a consistent bite.",
                "Produced from recycled PET flake, so it carries recycled content into the pack rather than out of it."
            },
            Specifications = new[]
            {
                ("Widths", "9, 12, 15, 16, 19, 25, 32 mm"),
                ("Thickness", "0.5 mm to 1.27 mm"),
                ("Break strength", "200 kgf to 900 kgf"),
                ("Finish", "Smooth or embossed"),
                ("Core", "406 mm / 200 mm"),
                ("Content", "Up to 98% recycled PET")
            },
            Applications = new[]
            {
                "Brick, block and tile palletising",
                "Paper reel and board bundling",
                "Drum and can palletising",
                "Baled goods and compressed bales"
            }
        },

        new Product
        {
            Slug = "stretch-wrapping-film",
            Name = "Stretch Wrapping Film",
            Category = "Protective Packaging",
            UseCase = "Pallet Unitising",
            Summary = "Cast LLDPE film in hand and machine grades, pre-stretched to put more load on the pallet and less film in the waste stream.",
            WhereUsed = "Unitises and weatherproofs finished pallets before dispatch",
            IsFeatured = true,
            Description = new[]
            {
                "Stretch film is what turns a stack of cartons into one unit a forklift can move. Cast on a multi-layer line, it clings on the inner face only, so adjacent pallets in a container do not weld themselves together.",
                "Machine grades are engineered for a specific pre-stretch ratio — run at the rated ratio and the same containment comes from noticeably less film, which is where the cost sits on a high-volume line. Hand grades are wound light on a bearing core so an operator can walk a pallet without fighting the roll.",
                "Available clear for barcode scanning through the wrap, black where the load should not be identifiable, and in colours for line or destination coding."
            },
            Specifications = new[]
            {
                ("Thickness", "12 to 35 micron"),
                ("Widths", "250 mm (hand), 500 mm (machine)"),
                ("Pre-stretch", "150% to 300%"),
                ("Type", "Cast LLDPE, multi-layer"),
                ("Cling", "Single-sided inner cling"),
                ("Options", "Clear, black, opaque, colour-tinted, UVI")
            },
            Applications = new[]
            {
                "Finished-pallet unitising",
                "Weather protection in open yards",
                "Bundling of long or irregular goods",
                "Load identification by colour code"
            }
        },

        new Product
        {
            Slug = "paper-edge-boards",
            Name = "Paper Edge Boards",
            Category = "Protective Packaging",
            UseCase = "Edge & Corner Protection",
            Summary = "Laminated kraft angle boards that spread strap tension along the whole edge instead of letting it cut into the corner of the load.",
            WhereUsed = "Under strapping on pallet corners and carton edges",
            IsFeatured = true,
            Description = new[]
            {
                "A tensioned strap concentrates its entire load on four corners. An angle board redistributes that force down the full edge, so the strap can be pulled to a genuinely useful tension without crushing the carton beneath it.",
                "They do a second job at the same time: stacked pallets gain vertical compression strength through the boards, which is what lets a warehouse block-stack two or three high without the bottom pallet deforming.",
                "Made from recycled kraft laminate and fully repulpable, so the whole pack stays in the paper stream at destination."
            },
            Specifications = new[]
            {
                ("Leg width", "35 x 35 mm to 100 x 100 mm"),
                ("Thickness", "2 mm to 7 mm"),
                ("Length", "Cut to order, up to 2400 mm"),
                ("Material", "Recycled kraft laminate"),
                ("Finish", "Natural, white-top, printed"),
                ("Options", "Water-resistant coating")
            },
            Applications = new[]
            {
                "Pallet corner protection under strapping",
                "Vertical support for block stacking",
                "Furniture and appliance edge protection",
                "Coil and reel edge protection"
            }
        },

        new Product
        {
            Slug = "security-seal",
            Name = "Security Seal",
            Category = "Security & Identification",
            UseCase = "Tamper-Evident Container Sealing",
            Summary = "Sequentially numbered bolt, cable and plastic seals — including ISO 17712 high-security bolts for customs-compliant container doors.",
            WhereUsed = "Container doors, tankers, cash bags and meter cabinets",
            IsFeatured = true,
            Description = new[]
            {
                "A seal does not stop a determined thief; it proves the load was opened. That evidence is what customs, insurers and a receiving warehouse actually rely on, so the number and the record behind it matter as much as the hardware.",
                "Bolt seals to ISO 17712 High Security are the class accepted for international container movements and required under most customs security programmes. Cable seals suit tankers, rail wagons and irregular hasps; plastic pull-tight and fixed-length seals cover cash bags, totes, meters and utility cabinets.",
                "Every seal is laser-marked with a unique sequential number and your company mark. Numbering ranges are recorded against your account, so a queried number can be traced back to the consignment it was issued for."
            },
            Specifications = new[]
            {
                ("Types", "Bolt, cable, pull-tight, fixed-length"),
                ("Standard", "ISO 17712:2013 High Security (bolt)"),
                ("Marking", "Laser, sequential number + logo"),
                ("Bolt", "Zinc-plated steel, ABS shroud"),
                ("Cable", "1.5 mm to 5 mm galvanised"),
                ("Colours", "Red, blue, yellow, green, white")
            },
            Applications = new[]
            {
                "Sea container door sealing",
                "Road tanker and bulk hatch sealing",
                "Cash-in-transit and courier bags",
                "Utility meter and cabinet sealing"
            }
        },

        new Product
        {
            Slug = "cable-ties",
            Name = "Cable Ties",
            Category = "Security & Identification",
            UseCase = "Bundling & Fastening",
            Summary = "Nylon 6.6 ties in standard, UV-black, releasable and stainless grades, with a one-piece pawl that holds its rated loop strength.",
            WhereUsed = "Bundling harnesses, fixings and light load restraint",
            IsFeatured = false,
            Description = new[]
            {
                "The loop strength on a cable tie is set by the pawl, not the strap, which is why a cheap tie fails at half its printed rating. These are moulded in virgin nylon 6.6 with a one-piece pawl and tested to their stated loop tensile strength.",
                "Natural nylon is for indoor use. Black ties are carbon-black UV stabilised for outdoor and yard work, where an untreated tie goes brittle within a season. Releasable ties suit anything that will be opened again, and stainless steel ties handle heat, chemicals and marine exposure.",
                "Identification ties carry a flag panel that takes a thermal-transfer print, so a bundle can be labelled and fastened in one action."
            },
            Specifications = new[]
            {
                ("Lengths", "100 mm to 1200 mm"),
                ("Widths", "2.5 mm to 12 mm"),
                ("Loop strength", "8 kg to 110 kg"),
                ("Material", "Nylon 6.6, UV black, SS 304/316"),
                ("Temperature", "-40 to +85 degrees C (nylon)"),
                ("Types", "Standard, releasable, marker, mount")
            },
            Applications = new[]
            {
                "Cable and harness bundling",
                "Sheet and tarpaulin fixing",
                "Light load restraint",
                "Labelled bundle identification"
            }
        },

        new Product
        {
            Slug = "pp-box-strapping",
            Name = "PP Box Strapping",
            Category = "Strapping Systems",
            UseCase = "Carton & Light Bundling",
            Summary = "Economical polypropylene strap for closing cartons and bundling light goods, in hand grades and fully automatic machine coils.",
            WhereUsed = "Closing cartons and bundling light goods on the line",
            IsFeatured = false,
            Description = new[]
            {
                "PP strap is the right answer for the large volume of loads that only need to be held together, not restrained: a carton that must stay shut, a bundle of printed matter, a stack of light board.",
                "Machine coils are wound on a 200 mm core to a consistent tension and camber, which is what keeps an automatic head from mis-feeding — the usual cause of a strapper jamming mid-shift is coil quality, not the machine.",
                "Embossing gives friction-weld heads a reliable bite. Available in a range of colours for department, shift or destination coding."
            },
            Specifications = new[]
            {
                ("Widths", "6, 9, 12, 15, 19 mm"),
                ("Thickness", "0.4 mm to 1.0 mm"),
                ("Break strength", "50 kgf to 260 kgf"),
                ("Core", "200 mm (machine), 406 mm (hand)"),
                ("Finish", "Embossed"),
                ("Colours", "White, black, and to order")
            },
            Applications = new[]
            {
                "Carton closing and reinforcement",
                "Newspaper and print bundling",
                "Light board and sheet bundling",
                "Automatic strapping lines"
            }
        },

        new Product
        {
            Slug = "self-adhesive-tapes",
            Name = "Self Adhesive Tapes",
            Category = "Security & Identification",
            UseCase = "Carton Sealing & Marking",
            Summary = "BOPP, masking and specialist tapes — including printed and tamper-evident grades that show when a carton has been opened.",
            WhereUsed = "Sealing, branding and tamper-proofing outer cartons",
            IsFeatured = false,
            Description = new[]
            {
                "BOPP carton sealing tape covers most of the volume: hot-melt adhesive for general warehouse use, acrylic where the carton will sit in heat or sunlight for months, and solvent adhesive for recycled board and cold stores, where hot-melt lets go.",
                "Custom printed tape puts your mark down the length of every carton, which does two jobs at once — it brands the outer and it makes an opened-and-resealed carton obvious at a glance.",
                "Tamper-evident tape goes further: lift it and it delaminates, leaving a VOID message on both the carton and the tape. Masking, filament and double-sided grades round out the range."
            },
            Specifications = new[]
            {
                ("Widths", "12 mm to 96 mm"),
                ("Thickness", "40 to 65 micron"),
                ("Length", "50 m to 990 m"),
                ("Adhesive", "Hot-melt, acrylic, solvent"),
                ("Printing", "Up to 3 colours, custom"),
                ("Types", "BOPP, tamper-evident, masking, filament")
            },
            Applications = new[]
            {
                "Outer carton sealing",
                "Branded and printed carton marking",
                "Tamper-evident e-commerce despatch",
                "Bundling and surface masking"
            }
        }
    };

    public static Product? BySlug(string? slug) =>
        All.FirstOrDefault(p => string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// The curated set for the homepage grid — the products flagged
    /// <see cref="Product.IsFeatured"/>, not simply the first few in the list.
    /// The grid is a 3-column layout, so keep this a multiple of three.
    /// </summary>
    public static IEnumerable<Product> Featured(int count = 6) =>
        All.Where(p => p.IsFeatured).Take(count);

    /// <summary>Every product, in catalogue order, for the header dropdown.</summary>
    public static IReadOnlyList<Product> ForNav => All;
}
