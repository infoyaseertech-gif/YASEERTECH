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

  {
    id: 5,
    slug: "xo-fashion",
    title: "X and O (XNO Fashion)",
    category: "E-commerce",
    status: "Live",
    featured: true,
    visibility: "public",
    shortDescription:
      "Online shop for a Kaduna modest-wear brand: jilbabs and hijabs with live stock by colour and size, ordering by bank transfer or WhatsApp, customer reviews and an owner dashboard.",
    fullDescription:
      "A branded storefront for X and O, a Kaduna-based modest-wear brand that delivers across Nigeria. Customers browse jilbabs, hijabs and prayer hijabs, pick a colour and size, and order. Behind the shop sits a private dashboard where the owner manages products, stock, orders, customers, reviews and profit.",
    client: "X and O (XNO Fashion), Kaduna, Nigeria",
    altText: "X and O modest-wear online shop",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "https://xo-fashion.vercel.app",
    githubUrl: "https://github.com/infoyaseertech-gif/xo-fashion",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "Paystack", "Vercel"],
    role: "Design and development",
    objectives: [
      "Let a modest-wear brand sell nationwide from one simple website",
      "Give the owner control of products, stock and orders without a developer"
    ],
    challenges: [
      "Two customers should not be able to buy the last piece of the same colour and size",
      "Prices and orders must be trustworthy even though the site is public"
    ],
    solutions: [
      "Stock is held when an order is placed and returned automatically if it is not paid in time",
      "Prices are calculated in the database, and customers cannot read other people\u2019s orders"
    ],
    keyFeatures: [
      "Shop for jilbabs, hijabs and prayer hijabs, with a photo and video gallery for each colour",
      "Live stock by colour and size",
      "Delivery fee shown by state, with clear return terms",
      "Order by bank transfer or WhatsApp; Paystack card payment is built in",
      "Cart that stays on the customer\u2019s own device",
      "Reviews from buyers who have received their order",
      "Owner dashboard: overview, products with photo and video upload, orders, customers, stock, reviews, profit and expenses, and CSV reports",
      "Privacy and terms pages written for Nigerian customers",
      "Automated tests covering stock, order holds, permissions and reviews"
    ],
    futureImprovements: [
      "Switch on card payments after a full Paystack test",
      "Custom domain for the shop"
    ]
  },

  {
    id: 6,
    slug: "bluejay-structures",
    title: "Bluejay Structures Ltd",
    category: "Websites",
    status: "Live",
    featured: true,
    visibility: "public",
    shortDescription:
      "Corporate website for a Nigerian building, vehicle supply and procurement company: services, credentials, team and a proposal request form.",
    fullDescription:
      "A professional multi-page website for Bluejay Structures Ltd that explains five service lines in one place, shows the company\u2019s registrations and certifications for procurement officers, introduces its professionals and makes it easy to request a proposal. It also links to a client and staff login.",
    client: "Bluejay Structures Ltd, Nigeria",
    altText: "Bluejay Structures Ltd company website",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "https://bluejaystructuresltd.com",
    githubUrl: "",
    technologies: ["HTML", "CSS", "JavaScript", "Vercel"],
    role: "Design and development",
    objectives: [
      "Present a multi-sector company clearly to corporate and government buyers",
      "Turn visitors into proposal requests"
    ],
    solutions: [
      "One page per topic: About, Services, Vehicles, Certifications, Team and Contact",
      "Credentials and registrations placed up front so buyers can check them quickly",
      "Prominent \u201CRequest a proposal\u201D and contact calls to action, plus WhatsApp"
    ],
    keyFeatures: [
      "Five service lines: building and construction, real estate and property management, automobile sales and hiring, food and beverages, and general contracts",
      "Vehicle categories page covering pick-ups, SUVs, buses, trucks, saloon and specialised vehicles",
      "Certifications and key-professionals pages",
      "Enquiry and proposal request form and WhatsApp contact",
      "Client / ERP login link",
      "Fast, mobile-friendly pages with search-friendly titles and descriptions",
      "Runs on the company\u2019s own domain"
    ]
  },

  {
    id: 7,
    slug: "maleektech-gadgets",
    title: "Maleektech Gadgets Business System",
    category: "Business Systems",
    status: "Live",
    featured: false,
    visibility: "public",
    shortDescription:
      "Stock, sales and profit system for a mobile gadgets and accessories business: inventory, point of sale, expenses, reports and staff accounts.",
    fullDescription:
      "A private web app that lets a gadgets retailer run the whole shop from one screen. Staff record sales at the counter, the owner watches stock and expenses, and printable invoices and profit-and-loss reports replace notebooks. Accounts are created by the owner only, and each staff member sees only what they have been given access to.",
    client: "Maleektech, Nigeria",
    altText: "Maleektech Gadgets business system",
    galleryImages: [],
    videoUrl: "",
    liveUrl: "https://maleektech-gadgets-store.vercel.app",
    githubUrl: "",
    technologies: ["HTML", "CSS", "JavaScript", "Supabase", "Chart.js", "Vercel"],
    role: "Design and development",
    objectives: [
      "Replace paper records with one reliable view of stock, sales and expenses",
      "Let the owner see profit and low stock without calculating by hand"
    ],
    keyFeatures: [
      "Dashboard comparing sales and expenses by day, week, month or year",
      "Inventory with product IDs, categories, search and low-stock alerts",
      "Point of sale: cash, transfer or POS card, customer details and unpaid invoices for pay-before-delivery",
      "Printable invoices and receipts with the business\u2019s own details",
      "Expense tracking with categories you can add to",
      "Reports: profit and loss, best and slowest sellers, expense breakdown and stock value, exported as CSV or PDF",
      "Notifications for new products, low or out-of-stock items, sales and payments",
      "Owner-created staff accounts with per-person access",
      "Amounts in naira"
    ]
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
