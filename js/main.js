// ============================================
//   YASEERTECH - MAIN JS v3 (js/main.js)
// ============================================

// Default services (used if none saved in ERP)
const DEFAULT_SERVICES = [
    { id:1, icon:"🎓", title:"ICT Training", desc:"Hands-on digital skills — social media marketing, web design, graphic design, and freelancing.", badge:"" },
    { id:2, icon:"📣", title:"Social Media & Meta Ads", desc:"Facebook and Instagram ads that attract real customers, generate leads, and boost sales.", badge:"Most Popular" },
    { id:3, icon:"🌐", title:"Website Design", desc:"Professional, responsive websites for businesses, e-commerce, and landing pages.", badge:"" },
    { id:4, icon:"🎨", title:"Graphic Design & Branding", desc:"Logos, business kits, flyers, and full brand identity that makes you stand out.", badge:"" },
    { id:5, icon:"📊", title:"Digital Marketing", desc:"Data-driven campaigns that increase visibility, drive traffic, and convert leads into customers.", badge:"" },
    { id:6, icon:"🖨️", title:"Business Centre", desc:"Printing, scanning, typing, documentation, and online registrations in Wuse 2, Abuja.", badge:"" }
];

// ========================
// NAVBAR SCROLL
// ========================
const navbar = document.getElementById("navbar");
if (navbar) {
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
}

// ========================
// MOBILE MENU
// ========================
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("open");
    document.getElementById("hamburger").classList.toggle("active");
}
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("navLinks").classList.remove("open");
        document.getElementById("hamburger").classList.remove("active");
    });
});
document.addEventListener("click", (e) => {
    const nl = document.getElementById("navLinks");
    const hb = document.getElementById("hamburger");
    if (nl && hb && !nl.contains(e.target) && !hb.contains(e.target)) {
        nl.classList.remove("open");
        hb.classList.remove("active");
    }
});

// ========================
// LOAD SERVICES ON HOMEPAGE
// ========================
function loadHomepageServices() {
    const container = document.getElementById("homepageServices");
    if (!container) return;

    const saved = localStorage.getItem("yt_services");
    const services = saved ? JSON.parse(saved) : DEFAULT_SERVICES;

    container.innerHTML = services.map(s => `
        <div class="svc-card reveal">
            ${s.badge ? `<div class="svc-badge">${s.badge}</div>` : ""}
            <div class="svc-card-icon">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <a href="services.html" class="svc-card-link">Learn More →</a>
        </div>
    `).join("");

    // Re-run reveal on new elements
    setTimeout(initReveal, 100);
}

// ========================
// COUNTER ANIMATION
// ========================
function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"));
    if (!target) return;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const update = () => {
        current += step;
        if (current < target) {
            el.textContent = Math.ceil(current) + (el.dataset.suffix || "");
            requestAnimationFrame(update);
        } else {
            el.textContent = target + (el.dataset.suffix || "");
        }
    };
    update();
}

let countersStarted = false;
const counters = document.querySelectorAll(".stat-number[data-target]");
if (counters.length > 0) {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(c => animateCounter(c));
            }
        });
    }, { threshold: 0.3 });
    obs.observe(counters[0]);
}

// ========================
// SCROLL REVEAL
// ========================
function initReveal() {
    const els = document.querySelectorAll(".svc-card, .tcard, .val-card, .mv-card, .client-card, .why-item, .section-header, .ci-card, .faq-item, .sd-content, .sd-visual");
    els.forEach(el => {
        if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });
    const revObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("visible"), i * 70);
                revObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => revObs.observe(el));
}

// ========================
// FAQ ACCORDION
// ========================
function toggleFaq(el) {
    const item = el.parentElement;
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
}

// ========================
// ACTIVE NAV
// ========================
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
        link.classList.add("active");
    } else {
        link.classList.remove("active");
    }
});

// ========================
// INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
    loadHomepageServices();
    initReveal();
});
