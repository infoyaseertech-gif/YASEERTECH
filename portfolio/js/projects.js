/* ==========================================================================
   YASEERTECH PORTFOLIO — PROJECT DATA
   --------------------------------------------------------------------------
   This is the ONLY file you edit to add, change or remove portfolio projects.
   No HTML changes are needed.

   HOW TO ADD A PROJECT
   1. Copy any object below (or the TEMPLATE at the bottom of this file).
   2. Give it a unique `id` and `slug` (lowercase-with-dashes).
   3. Fill in only what is TRUE. Any field left empty / omitted is simply not
      shown on the site (no placeholders, no fake data).
   4. Set  visibility: "public"  to show it, or "hidden" to keep it as a draft.

   FIELD GUIDE
   category          One of: "Websites", "Web Applications", "Business Systems",
                     "E-commerce", "UI/UX & Prototypes", "Other Digital Solutions"
   status            "Live" | "Source available" | "In development" | "Prototype"
                     | "Concept"
   coverImage        Path to a REAL screenshot, e.g. "images/projects/ajigs-cover.webp"
                     (put the file in portfolio/images/projects/). If omitted, a
                     clearly-labelled "Preview coming soon" tile is shown instead.
   galleryImages     [{ src: "images/projects/x-1.webp", alt: "Dashboard showing ..." }]
   videoUrl          YouTube link (watch / youtu.be / embed) or a short .mp4 path.
                     Loads only when the visitor clicks play.
   liveUrl           Working website address (https://...)
   githubUrl         PUBLIC repository address only.
   results           ONLY verified outcomes. Leave out if you are not certain.
   ========================================================================== */

window.YT_PROJECTS = [
  {
    id: 1,
    slug: "yaseertech-website-erp",
    title: "YaseerTech Website & ERP",
    category: "Business Systems",
    status: "Live",
    featured: true,
    visibility: "public",
    shortDescription:
      "The YaseerTech company website together with a cloud-backed ERP dashboard for managing invoices, services and users.",
    fullDescription:
      "The public face of YaseerTech — a fast, responsive, installable website for a digital solutions company in Abuja — plus a private ERP area where the team signs in to manage day-to-day business records.",
    coverImage: "",
    altText: "YaseerTech website and ERP dashboard",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "https://yaseertech.vercel.app/",
    githubUrl: "https://github.com/infoyaseertech-gif/YASEERTECH",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "Chart.js", "PWA", "Vercel"],
    role: "Design and development",
    keyFeatures: [
      "Responsive marketing site: Home, About, Services and Contact",
      "Contact form delivered by email (EmailJS) and one-tap WhatsApp chat",
      "Installable web app (PWA) with offline fallback",
      "Staff login and ERP dashboard backed by Supabase",
      "Invoices and service revenue breakdown with charts",
      "PDF and Excel export from the dashboard"
    ],
    futureImprovements: [
      "Per-service project case studies (this portfolio)",
      "Wider reporting inside the ERP dashboard"
    ]
  },

  {
    id: 2,
    slug: "ajigs-connect",
    title: "AJIGS CONNECT",
    category: "Business Systems",
    status: "Live", // address taken from the project's own files - confirm it loads
    featured: true,
    visibility: "public",
    shortDescription:
      "Company website and staff management system for a Nigerian business offering construction, building materials, automobiles, engineering and cleaning.",
    fullDescription:
      "A public website that presents five service lines, shows completed work in a photo gallery and takes quote requests, paired with a private staff portal for running jobs, clients, invoices and expenses.",
    client: "AJIGS CONNECT, Nigeria",
    coverImage: "",
    altText: "AJIGS CONNECT website and management system",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "https://ajigs-connect.vercel.app",
    githubUrl: "https://github.com/infoyaseertech-gif/ajigs-connect",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "PWA", "Vercel"],
    role: "Design and development",
    keyFeatures: [
      "Service pages for construction, building materials, automobiles, engineering and cleaning",
      "Project gallery, with photos added by staff from the dashboard",
      "Quote and contact page with a one-tap WhatsApp enquiry for each service",
      "Staff login with permissions, so each person only sees what they should",
      "Dashboard for clients, jobs and job status, invoices with print preview, expenses and staff",
      "Reports such as revenue by service and expenses by category",
      "Installable on a phone like an app"
    ]
  },

  {
    id: 3,
    slug: "ihsan-footwears-app",
    title: "IHSAN Footwears & Poultry App",
    category: "Business Systems",
    status: "Source available",
    featured: false,
    visibility: "public",
    shortDescription:
      "A phone app that runs a footwear business and a poultry farm: stock, sales, expenses, flocks, eggs, feed and health records.",
    fullDescription:
      "One PIN-protected, installable app with two modes, one for IHSAN Footwears & General Enterprises and one for its poultry operation, so the owner can keep every record in one place instead of notebooks.",
    client: "IHSAN Footwears & General Enterprises",
    coverImage: "",
    altText: "IHSAN Footwears and Poultry management app",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "",
    githubUrl: "https://github.com/infoyaseertech-gif/ihsan-footwears-app",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "PWA"],
    role: "Design and development",
    keyFeatures: [
      "Footwear mode: stock, sales with printable receipts, expenses and reports",
      "Poultry mode: flock records, daily egg collection, feed and health records",
      "Health log covering the number of birds affected and vet details",
      "PIN sign-in to keep business records private",
      "Records saved to the cloud so they are not tied to one phone",
      "Installable on a phone like an app"
    ]
  },

  {
    id: 4,
    slug: "kabomo-collections",
    title: "Kabomo Collections POS",
    category: "Business Systems",
    status: "Source available",
    featured: false,
    visibility: "public",
    shortDescription:
      "Point-of-sale and stock app for a fashion retail brand: catalogue, sales, receipts, expenses, customer debts and profit reports.",
    fullDescription:
      "An installable app that lets a fashion retailer manage its whole shop from a phone. It tracks stock and margins, records sales and purchases, shares receipts and shows how the business is performing. Brand tagline: \u201CWear Love, Wear Luxury\u201D.",
    client: "Kabomo Collections",
    coverImage: "",
    altText: "Kabomo Collections point-of-sale and stock app",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "",
    githubUrl: "https://github.com/infoyaseertech-gif/kabomocollections",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "PWA", "Vercel"],
    role: "Design and development",
    keyFeatures: [
      "Item catalogue with photos, cost price, selling price and profit margin",
      "Low-stock alerts",
      "Record sales and purchases, with receipts that can be sent on WhatsApp",
      "Expense tracking and customer debt records",
      "Business report with a 7-day sales chart, top-selling items and net profit",
      "Account sign-in with an optional fingerprint login",
      "Installable on a phone like an app"
    ]
  },

  /* ------------------------------------------------------------------------
     DRAFTS — kept hidden until you confirm each one is real and ready.
     Change  visibility: "hidden"  to  "public"  once the details are true.
     ------------------------------------------------------------------------ */
  {
    id: 101,
    slug: "maleektech-gadgets",
    title: "Maleektech Gadgets",
    category: "E-commerce",
    status: "Live",
    visibility: "hidden",
    shortDescription: "Gadgets business website.",
    liveUrl: "", // add the real address
    githubUrl: "", // add only if the repository is public
    technologies: []
  },
  {
    id: 102,
    slug: "bluejay-structures",
    title: "Bluejay Structures",
    category: "Websites",
    status: "Live",
    visibility: "hidden",
    shortDescription: "Construction business website.",
    liveUrl: "",
    githubUrl: "",
    technologies: []
  },
  {
    id: 103,
    slug: "yaseertech-business-cloud",
    title: "YaseerTech Business Cloud",
    category: "Business Systems",
    status: "Concept",
    visibility: "hidden",
    shortDescription: "Business management platform concept.",
    liveUrl: "",
    githubUrl: "",
    technologies: []
  }

  /* TEMPLATE — copy, paste above this comment, then fill in.
  ,{
    id: 200,
    slug: "my-new-project",
    title: "My New Project",
    category: "Websites",
    status: "Live",
    featured: false,
    visibility: "public",
    shortDescription: "One or two sentences for the card.",
    fullDescription: "A fuller paragraph for the detail view.",
    coverImage: "images/projects/my-new-project-cover.webp",
    altText: "Describe the screenshot for screen-reader users",
    galleryImages: [
      { src: "images/projects/my-new-project-1.webp", alt: "Home page on desktop" }
    ],
    videoUrl: "https://youtu.be/XXXXXXXXXXX",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/infoyaseertech-gif/my-new-project",
    technologies: ["HTML", "CSS", "JavaScript"],
    role: "Design and development",
    completionDate: "2026-03",
    objectives: ["What the project set out to do"],
    challenges: ["A real problem the client had"],
    solutions: ["How you solved it"],
    keyFeatures: ["Feature one", "Feature two"],
    results: ["Only verified outcomes"],
    futureImprovements: ["What comes next"]
  }
  */
];
