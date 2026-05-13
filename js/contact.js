// ============================================
//   YASEERTECH - CONTACT PAGE JS (contact.js)
//   Save this as: js/contact.js
// ============================================


// ========================
// CONTACT FORM VALIDATION
// ========================
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName  = document.getElementById("lastName").value.trim();
        const email     = document.getElementById("email").value.trim();
        const phone     = document.getElementById("phone").value.trim();
        const service   = document.getElementById("service").value;
        const message   = document.getElementById("message").value.trim();

        const successBox = document.getElementById("formSuccess");
        const errorBox   = document.getElementById("formError");

        // Hide both first
        successBox.style.display = "none";
        errorBox.style.display   = "none";

        // Validate
        if (!firstName || !lastName || !email || !phone || !service || !message) {
            errorBox.style.display = "block";
            errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            errorBox.textContent = "⚠️ Please enter a valid email address.";
            errorBox.style.display = "block";
            return;
        }

        // Success — show message and reset
        successBox.style.display = "block";
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        contactForm.reset();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            successBox.style.display = "none";
        }, 5000);
    });
}


// ========================
// FAQ ACCORDION
// ========================
function toggleFaq(questionEl) {
    const faqItem = questionEl.parentElement;
    const isOpen  = faqItem.classList.contains("open");

    // Close all open FAQs first
    document.querySelectorAll(".faq-item.open").forEach(item => {
        item.classList.remove("open");
    });

    // Open clicked one if it was closed
    if (!isOpen) {
        faqItem.classList.add("open");
    }
}
