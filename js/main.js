// ============================================
//   YASEERTECH - MAIN JAVASCRIPT (main.js)
// ============================================


// ========================
// NAVBAR SCROLL EFFECT
// ========================
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});


// ========================
// MOBILE MENU TOGGLE
// ========================
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const hamburger = document.getElementById("hamburger");

    navLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
}

// Close menu when a link is clicked
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("navLinks").classList.remove("open");
        document.getElementById("hamburger").classList.remove("active");
    });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
    const navLinks = document.getElementById("navLinks");
    const hamburger = document.getElementById("hamburger");

    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove("open");
        hamburger.classList.remove("active");
    }
});


// ========================
// COUNTER ANIMATION
// ========================
function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
        current += step;
        if (current < target) {
            el.textContent = Math.ceil(current);
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    };

    update();
}

// Run counters when they come into view
const counters = document.querySelectorAll(".stat-number");
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            counters.forEach(counter => animateCounter(counter));
        }
    });
}, { threshold: 0.3 });

if (counters.length > 0) {
    counterObserver.observe(counters[0]);
}


// ========================
// SCROLL REVEAL ANIMATION
// ========================
const revealElements = document.querySelectorAll(
    ".service-card, .testimonial-card, .stat-card, .why-item, .section-header"
);

revealElements.forEach(el => {
    el.classList.add("reveal");
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger the animation delay
            setTimeout(() => {
                entry.target.classList.add("visible");
            }, index * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));


// ========================
// ACTIVE NAV LINK
// ========================
// Highlights correct nav link based on current page
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
        link.classList.add("active");
    } else {
        link.classList.remove("active");
    }
});


// ========================
// SMOOTH ANCHOR SCROLLING
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});


// ========================
// CONSOLE WELCOME MESSAGE
// ========================
console.log("%cYaseerTech 🚀", "color: #FF6B00; font-size: 24px; font-weight: bold;");
console.log("%cDriving Business Growth Through Digital Excellence", "color: #0A2540; font-size: 14px;");
