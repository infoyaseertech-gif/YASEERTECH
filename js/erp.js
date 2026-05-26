// ============================================
//   YASEERTECH ERP - FULL SUPABASE VERSION
//   All data syncs across every device
// ============================================

const SB_URL  = "https://winlgtflhwiaraniwpts.supabase.co";
const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmxndGZsaHdpYXJhbml3cHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODUzMjUsImV4cCI6MjA5NDc2MTMyNX0.Co0PPWjMtNeIIa8GSqkulgytzhwbm33p718HsPMECKU";
const SB_REST = SB_URL + "/rest/v1";

// ========================
// SUPABASE HELPERS
// ========================
async function sbGet(endpoint) {
    const res = await fetch(SB_REST + endpoint, {
        headers: {
            "apikey": SB_KEY,
            "Authorization": "Bearer " + SB_KEY,
            "Content-Type": "application/json"
        }
    });
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

async function sbPost(endpoint, data) {
    const res = await fetch(SB_REST + endpoint, {
        method: "POST",
        headers: {
            "apikey": SB_KEY,
            "Authorization": "Bearer " + SB_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        body: JSON.stringify(data)
    });
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

async function sbPatch(endpoint, data) {
    const res = await fetch(SB_REST + endpoint, {
        method: "PATCH",
        headers: {
            "apikey": SB_KEY,
            "Authorization": "Bearer " + SB_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        body: JSON.stringify(data)
    });
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

async function sbDelete(endpoint) {
    await fetch(SB_REST + endpoint, {
        method: "DELETE",
        headers: {
            "apikey": SB_KEY,
            "Authorization": "Bearer " + SB_KEY
        }
    });
}

// ========================
// SERVICES (still localStorage)
// ========================
const DEFAULT_SERVICES = [
    { id:1, icon:"🎓", title:"ICT Training",            desc:"Hands-on digital skills — social media marketing, web design, graphic design, and freelancing.", badge:"" },
    { id:2, icon:"📣", title:"Social Media & Meta Ads",  desc:"Facebook and Instagram ads that attract real customers, generate leads, and boost sales.", badge:"Most Popular" },
    { id:3, icon:"🌐", title:"Website Design",           desc:"Professional, responsive websites for businesses, e-commerce, and landing pages.", badge:"" },
    { id:4, icon:"🎨", title:"Graphic Design & Branding",desc:"Logos, business kits, flyers, and full brand identity that makes you stand out.", badge:"" },
    { id:5, icon:"📊", title:"Digital Marketing",        desc:"Data-driven campaigns that increase visibility, drive traffic, and convert leads into customers.", badge:"" },
    { id:6, icon:"🖨️", title:"Business Centre",         desc:"Printing, scanning, typing, documentation, and online registrations in Wuse 2, Abuja.", badge:"" }
];
function getServices()   { return JSON.parse(localStorage.getItem("yt_services")) || DEFAULT_SERVICES; }
function saveServices(s) { localStorage.setItem("yt_services", JSON.stringify(s)); }

// ========================
// SESSION
// ========================
function getCurrentUser() {
    const s = localStorage.getItem("yt_current_user");
    return s ? JSON.parse(s) : null;
}
function setCurrentUser(user) {
    localStorage.setItem("yt_current_user", JSON.stringify({ id:user.id, name:user.name, email:user.email, role:user.role }));
    localStorage.setItem("yt_logged_in", "true");
}
function erpLogout() {
    localStorage.removeItem("yt_logged_in");
    localStorage.removeItem("yt_current_user");
    window.location.href = "login.html";
}

// ========================
// AUTH GUARD
// ========================
if (window.location.pathname.includes("dashboard.html")) {
    if (localStorage.getItem("yt_logged_in") !== "true") {
        window.location.href = "login.html";
    }
}

// ========================
// ROLE UI
// ========================
function applyRoleUI() {
    const user = getCurrentUser();
    if (!user) return;
    const n = document.getElementById("erpUserName");
    const r = document.getElementById("erpUserRole");
    const a = document.getElementById("erpAvatar");
    if (n) n.textContent = user.name;
    if (r) r.textContent = user.role === "admin" ? "Administrator" : "Staff";
    if (a) a.textContent = user.name.charAt(0).toUpperCase();
    if (user.role !== "admin") {
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
    }
}

// ========================
// SIDEBAR
// ========================
function toggleSidebar() {
    const sidebar = document.getElementById("erpSidebar");
    const main    = document.getElementById("erpMain");
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
    } else {
        sidebar.classList.toggle("collapsed");
        if (main) main.classList.toggle("full-width");
    }
}

// ========================
// SECTION NAVIGATION
// ========================
function showSection(name, link) {
    const user = getCurrentUser();
    const adminOnly = ["users","services","staff"];
    if (adminOnly.includes(name) && user && user.role !== "admin") {
        alert("Access restricted. Admin only."); return;
    }
    document.querySelectorAll(".erp-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("section-" + name);
    if (target) target.classList.add("active");
    document.querySelectorAll(".erp-nav-item").forEach(i => i.classList.remove("active"));
    if (link) link.classList.add("active");
    const renderers = {
        overview:  renderOverview,
        staff:     renderStaff,
        sales:     renderSales,
        expenses:  renderExpenses,
        reports:   renderReports,
        users:     renderUsers,
        services:  renderServicesManager,
        myprofile: renderMyProfile,
        invoices:  renderInvoiceSection
    };
    if (renderers[name]) renderers[name]();
    if (window.innerWidth <= 768) {
        const sb = document.getElementById("erpSidebar");
        if (sb) sb.classList.remove("open");
    }
}

// ========================
// MODALS
// ========================
function openModal(id)  { const el = document.getElementById(id); if (el) el.classList.add("open"); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove("open"); }
document.addEventListener("click", e => {
    document.querySelectorAll(".erp-modal.open").forEach(m => { if (e.target === m) closeModal(m.id); });
});

// ========================
// HELPERS
// ========================
function fmtN(n) { return "₦" + Number(n).toLocaleString("en-NG"); }
function fmtD(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function showToast(msg, type="success") {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = `position:fixed;top:90px;right:20px;z-index:99999;background:${type==="success"?"#10b981":"#ef4444"};color:white;padding:12px 20px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
function showLoading(tbodyId, cols) {
    const el = document.getElementById(tbodyId);
    if (el) el.innerHTML = `<tr><td colspan="${cols}" class="empty-row">Loading...</td></tr>`;
}

// ========================
// LOGIN
// ========================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const email  = document.getElementById("loginEmail").value.trim().toLowerCase();
        const pw     = document.getElementById("loginPassword").value.trim();
        const errBox = document.getElementById("loginError");
        const btn    = loginForm.querySelector("button[type=submit]");
        errBox.style.display = "none";
        btn.textContent      = "Signing in...";
        btn.disabled         = true;
        try {
            const users = await sbGet("/users?email=eq." + encodeURIComponent(email) + "&limit=1");
            const user  = users[0] || null;
            if (user && user.password === pw && user.status === "active") {
                const rem = document.getElementById("rememberMe");
                if (rem && rem.checked) {
                    localStorage.setItem("yt_rem_email", email);
                } else {
                    localStorage.removeItem("yt_rem_email");
                }
                setCurrentUser(user);
                window.location.href = "dashboard.html";
            } else if (user && user.status !== "active") {
                errBox.textContent   = "⚠️ Your account is inactive. Contact your administrator.";
                errBox.style.display = "block";
            } else {
                errBox.textContent   = "⚠️ Incorrect email or password.";
                errBox.style.display = "block";
            }
        } catch (err) {
            errBox.textContent   = "⚠️ Connection error. Please check your internet and try again.";
            errBox.style.display = "block";
        } finally {
            btn.textContent = "Sign In to Dashboard";
            btn.disabled    = false;
        }
    });

    const remEmail = localStorage.getItem("yt_rem_email");
    const emailInput = document.getElementById("loginEmail");
    if (remEmail && emailInput) {
        emailInput.value = remEmail;
        const remBox = document.getElementById("rememberMe");
        if (remBox) remBox.checked = true;
    }
}

// ========================
// PASSWORD VISIBILITY
// ========================
function togglePw(id) {
    const el = document.getElementById(id);
    if (el) el.type = el.type === "password" ? "text" : "password";
}

// ========================
// FORGOT PASSWORD
// ========================
const resetStore = {};

function sendResetCode() {
    const email  = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const msgBox = document.getElementById("forgotMsg");
    showResetMsg(msgBox, "", "");
    if (!email) { showResetMsg(msgBox, "⚠️ Please enter your email address.", "error"); return; }
    sbGet("/users?email=eq." + encodeURIComponent(email) + "&limit=1").then(users => {
        const user = users[0] || null;
        if (!user) {
            showResetMsg(msgBox, "⚠️ No account found with that email. Contact your administrator.", "error");
            return;
        }
        const code    = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 15 * 60 * 1000;
        resetStore[email] = { code, expires };
        showResetMsg(msgBox,
            `✅ Your reset code is:<br>
             <div style="margin:12px 0;text-align:center;">
                 <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0A2540;font-family:'Poppins',sans-serif;">${code}</span>
             </div>
             <small style="color:#6B7280;">Write this down. Valid for 15 minutes.</small>`,
            "success"
        );
        document.getElementById("forgotStep2").setAttribute("data-email", email);
        setTimeout(() => {
            document.getElementById("forgotStep1").style.display = "none";
            document.getElementById("forgotStep2").style.display = "block";
        }, 1500);
    }).catch(() => {
        showResetMsg(msgBox, "⚠️ Connection error. Please try again.", "error");
    });
}

function confirmReset() {
    const step2   = document.getElementById("forgotStep2");
    const email   = step2.getAttribute("data-email");
    const entered = document.getElementById("resetCode").value.trim();
    const newPw   = document.getElementById("resetNewPw").value.trim();
    const confPw  = document.getElementById("resetConfirmPw").value.trim();
    const msgBox  = document.getElementById("resetMsg");
    showResetMsg(msgBox, "", "");
    const stored = resetStore[email];
    if (!stored)                     { showResetMsg(msgBox, "⚠️ Session expired. Start again.", "error"); return; }
    if (Date.now() > stored.expires) { showResetMsg(msgBox, "⚠️ Code expired. Request a new one.", "error"); delete resetStore[email]; return; }
    if (entered !== stored.code)     { showResetMsg(msgBox, "⚠️ Incorrect code. Try again.", "error"); return; }
    if (!newPw || newPw.length < 6)  { showResetMsg(msgBox, "⚠️ Password must be at least 6 characters.", "error"); return; }
    if (newPw !== confPw)            { showResetMsg(msgBox, "⚠️ Passwords do not match.", "error"); return; }
    sbGet("/users?email=eq." + encodeURIComponent(email) + "&limit=1").then(users => {
        const user = users[0];
        if (user) return sbPatch("/users?id=eq." + user.id, { password: newPw });
    }).then(() => {
        delete resetStore[email];
        showResetMsg(msgBox, "✅ Password updated! Taking you to login...", "success");
        setTimeout(() => {
            document.getElementById("forgotStep1").style.display = "block";
            document.getElementById("forgotStep2").style.display = "none";
            document.getElementById("forgotEmail").value   = "";
            document.getElementById("resetCode").value     = "";
            document.getElementById("resetNewPw").value    = "";
            document.getElementById("resetConfirmPw").value = "";
            showView("loginView");
        }, 2000);
    }).catch(() => {
        showResetMsg(msgBox, "⚠️ Connection error. Please try again.", "error");
    });
}

function showResetMsg(el, html, type) {
    if (!el) return;
    if (!html) { el.style.display = "none"; return; }
    el.innerHTML          = html;
    el.style.display      = "block";
    el.style.background   = type === "success" ? "#d1fae5" : "#fee2e2";
    el.style.border       = "1px solid " + (type === "success" ? "#6ee7b7" : "#fca5a5");
    el.style.color        = type === "success" ? "#065f46" : "#991b1b";
    el.style.borderRadius = "8px";
    el.style.padding      = "12px 16px";
    el.style.fontSize     = "14px";
    el.style.lineHeight   = "1.6";
}

function showView(id) {
    ["loginView","forgotView"].forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = "none";
    });
    const t = document.getElementById(id);
    if (t) t.style.display = "block";
}

// ========================
// OVERVIEW
// ========================
async function renderOverview() {
    try {
        const [staff, sales, expenses] = await Promise.all([
            sbGet("/staff?order=id"),
            sbGet("/sales?order=id"),
            sbGet("/expenses?order=id")
        ]);
        const tS = sales.reduce((s,i) => s + Number(i.amount), 0);
        const tE = expenses.reduce((s,i) => s + Number(i.amount), 0);
        const g  = id => document.getElementById(id);
        if (g("totalStaff"))    g("totalStaff").textContent    = staff.length;
        if (g("totalSales"))    g("totalSales").textContent    = fmtN(tS);
        if (g("totalExpenses")) g("totalExpenses").textContent = fmtN(tE);
        if (g("netProfit"))     g("netProfit").textContent     = fmtN(tS - tE);

        const rST = g("recentSalesTable");
        const rs  = [...sales].reverse().slice(0,5);
        if (rST) rST.innerHTML = rs.length === 0
            ? `<tr><td colspan="4" class="empty-row">No sales yet</td></tr>`
            : rs.map(s => `<tr><td>${s.customer}</td><td>${s.service}</td><td><strong>${fmtN(s.amount)}</strong></td><td>${s.added_by||"—"}</td></tr>`).join("");

        const rET = g("recentExpensesTable");
        const re  = [...expenses].reverse().slice(0,5);
        if (rET) rET.innerHTML = re.length === 0
            ? `<tr><td colspan="4" class="empty-row">No expenses yet</td></tr>`
            : re.map(e => `<tr><td>${e.description}</td><td>${e.category}</td><td><strong>${fmtN(e.amount)}</strong></td><td>${e.added_by||"—"}</td></tr>`).join("");
    } catch(err) {
        console.error("Overview error:", err);
    }
}

// ========================
// STAFF
// ========================
async function addStaff() {
    const name   = document.getElementById("staffName").value.trim();
    const pos    = document.getElementById("staffPosition").value.trim();
    const phone  = document.getElementById("staffPhone").value.trim();
    const status = document.getElementById("staffStatus").value;
    if (!name || !pos || !phone) { alert("Please fill all fields."); return; }
    try {
        await sbPost("/staff", { name, position:pos, phone, status, date_added: new Date().toISOString().split("T")[0] });
        closeModal("staffModal");
        document.getElementById("staffName").value     = "";
        document.getElementById("staffPosition").value = "";
        document.getElementById("staffPhone").value    = "";
        renderStaff(); renderOverview();
        showToast("✅ Staff added successfully!");
    } catch(err) { alert("Error adding staff. Try again."); }
}

async function deleteStaff(id) {
    if (!confirm("Remove this staff member?")) return;
    try {
        await sbDelete("/staff?id=eq." + id);
        renderStaff(); renderOverview();
        showToast("Staff removed.");
    } catch(err) { alert("Error removing staff."); }
}

async function renderStaff() {
    const tbody = document.getElementById("staffTableBody");
    if (!tbody) return;
    showLoading("staffTableBody", 7);
    try {
        const staff = await sbGet("/staff?order=id");
        if (staff.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No staff added yet.</td></tr>`; return;
        }
        tbody.innerHTML = staff.map((s,i) => `
            <tr>
                <td>${i+1}</td><td><strong>${s.name}</strong></td><td>${s.position}</td>
                <td>${s.phone}</td><td>${fmtD(s.date_added)}</td>
                <td><span class="badge ${s.status==="Active"?"badge-active":"badge-inactive"}">${s.status}</span></td>
                <td><button class="erp-delete-btn" onclick="deleteStaff(${s.id})">Remove</button></td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Error loading staff.</td></tr>`;
    }
}

// ========================
// SALES
// ========================
async function addSale() {
    const user     = getCurrentUser();
    const customer = document.getElementById("saleCustomer").value.trim();
    const service  = document.getElementById("saleService").value;
    const amount   = document.getElementById("saleAmount").value.trim();
    const date     = document.getElementById("saleDate").value;
    if (!customer || !service || !amount || !date) { alert("Please fill all fields."); return; }
    try {
        await sbPost("/sales", {
            customer, service, amount: Number(amount), date,
            added_by:   user ? user.name : "Unknown",
            added_role: user ? user.role : "unknown"
        });
        closeModal("salesModal");
        document.getElementById("saleCustomer").value = "";
        document.getElementById("saleService").value  = "";
        document.getElementById("saleAmount").value   = "";
        renderSales(); renderOverview();
        showToast("✅ Sale recorded successfully!");
    } catch(err) { alert("Error saving sale. Try again."); }
}

async function deleteSale(id) {
    const user = getCurrentUser();
    if (user.role !== "admin") { alert("Only Admin can delete."); return; }
    if (!confirm("Delete this sale?")) return;
    try {
        await sbDelete("/sales?id=eq." + id);
        renderSales(); renderOverview();
    } catch(err) { alert("Error deleting sale."); }
}

async function renderSales() {
    const tbody = document.getElementById("salesTableBody");
    const user  = getCurrentUser();
    if (!tbody) return;
    showLoading("salesTableBody", 7);
    try {
        const sales = await sbGet("/sales?order=id.desc");
        const total = sales.reduce((s,i) => s + Number(i.amount), 0);
        const now   = new Date();
        const month = sales.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((s,i) => s + Number(i.amount), 0);

        const g = id => document.getElementById(id);
        if (g("salesTotal")) g("salesTotal").textContent = fmtN(total);
        if (g("salesMonth")) g("salesMonth").textContent = fmtN(month);
        if (g("salesCount")) g("salesCount").textContent = sales.length;

        if (sales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No sales yet.</td></tr>`; return;
        }
        tbody.innerHTML = sales.map((s,i) => `
            <tr>
                <td>${i+1}</td><td>${fmtD(s.date)}</td>
                <td><strong>${s.customer}</strong></td><td>${s.service}</td>
                <td><strong style="color:var(--green)">${fmtN(s.amount)}</strong></td>
                <td><span class="added-by-tag ${s.added_role==="admin"?"by-admin":"by-staff"}">${s.added_by||"Unknown"}</span></td>
                <td>${user&&user.role==="admin"
                    ? `<button class="erp-delete-btn" onclick="deleteSale(${s.id})">Delete</button>`
                    : `—`}</td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Error loading sales.</td></tr>`;
    }
}

// ========================
// EXPENSES
// ========================
async function addExpense() {
    const user     = getCurrentUser();
    const desc     = document.getElementById("expenseDesc").value.trim();
    const category = document.getElementById("expenseCategory").value;
    const amount   = document.getElementById("expenseAmount").value.trim();
    const date     = document.getElementById("expenseDate").value;
    if (!desc || !category || !amount || !date) { alert("Please fill all fields."); return; }
    try {
        await sbPost("/expenses", {
            description: desc, category, amount: Number(amount), date,
            added_by:   user ? user.name : "Unknown",
            added_role: user ? user.role : "unknown"
        });
        closeModal("expensesModal");
        document.getElementById("expenseDesc").value     = "";
        document.getElementById("expenseCategory").value = "";
        document.getElementById("expenseAmount").value   = "";
        renderExpenses(); renderOverview();
        showToast("✅ Expense recorded successfully!");
    } catch(err) { alert("Error saving expense. Try again."); }
}

async function deleteExpense(id) {
    const user = getCurrentUser();
    if (user.role !== "admin") { alert("Only Admin can delete."); return; }
    if (!confirm("Delete this expense?")) return;
    try {
        await sbDelete("/expenses?id=eq." + id);
        renderExpenses(); renderOverview();
    } catch(err) { alert("Error deleting expense."); }
}

async function renderExpenses() {
    const tbody = document.getElementById("expensesTableBody");
    const user  = getCurrentUser();
    if (!tbody) return;
    showLoading("expensesTableBody", 7);
    try {
        const expenses = await sbGet("/expenses?order=id.desc");
        const total    = expenses.reduce((s,i) => s + Number(i.amount), 0);
        const now      = new Date();
        const month    = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((s,i) => s + Number(i.amount), 0);

        const g = id => document.getElementById(id);
        if (g("expensesTotal")) g("expensesTotal").textContent = fmtN(total);
        if (g("expensesMonth")) g("expensesMonth").textContent = fmtN(month);
        if (g("expensesCount")) g("expensesCount").textContent = expenses.length;

        if (expenses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No expenses yet.</td></tr>`; return;
        }
        tbody.innerHTML = expenses.map((e,i) => `
            <tr>
                <td>${i+1}</td><td>${fmtD(e.date)}</td>
                <td><strong>${e.description}</strong></td><td>${e.category}</td>
                <td><strong style="color:var(--orange)">${fmtN(e.amount)}</strong></td>
                <td><span class="added-by-tag ${e.added_role==="admin"?"by-admin":"by-staff"}">${e.added_by||"Unknown"}</span></td>
                <td>${user&&user.role==="admin"
                    ? `<button class="erp-delete-btn" onclick="deleteExpense(${e.id})">Delete</button>`
                    : `—`}</td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Error loading expenses.</td></tr>`;
    }
}

// ========================
// REPORTS
// ========================
async function renderReports() {
    try {
        const [staff, sales, expenses] = await Promise.all([
            sbGet("/staff?order=id"),
            sbGet("/sales?order=id"),
            sbGet("/expenses?order=id")
        ]);
        const tS = sales.reduce((s,i) => s + Number(i.amount), 0);
        const tE = expenses.reduce((s,i) => s + Number(i.amount), 0);
        const g  = id => document.getElementById(id);
        if (g("reportStaff"))    g("reportStaff").textContent    = staff.length;
        if (g("reportSales"))    g("reportSales").textContent    = fmtN(tS);
        if (g("reportExpenses")) g("reportExpenses").textContent = fmtN(tE);
        if (g("reportProfit"))   g("reportProfit").textContent   = fmtN(tS - tE);

        function buildReport(elId, list, key) {
            const el = document.getElementById(elId); if (!el) return;
            const map = {};
            list.forEach(i => { const k = i[key]||"Unknown"; map[k] = (map[k]||0) + Number(i.amount); });
            const entries = Object.entries(map);
            el.innerHTML = entries.length === 0
                ? `<p class="empty-row">No data yet</p>`
                : entries.sort((a,b) => b[1]-a[1]).map(([k,v]) =>
                    `<div class="report-item"><strong>${k}</strong><span>${fmtN(v)}</span></div>`).join("");
        }
        buildReport("salesByService",     sales,    "service");
        buildReport("salesByStaff",       sales,    "added_by");
        buildReport("expensesByCategory", expenses, "category");
    } catch(err) { console.error("Reports error:", err); }
}

// ========================
// USER MANAGEMENT
// ========================
async function renderUsers() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;
    showLoading("usersTableBody", 6);
    try {
        const users   = await sbGet("/users?order=id");
        const current = getCurrentUser();
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No users found.</td></tr>`; return;
        }
        tbody.innerHTML = users.map((u,i) => `
            <tr>
                <td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.email}</td>
                <td><span class="badge ${u.role==="admin"?"badge-active":"badge-staff"}">${u.role==="admin"?"Admin":"Staff"}</span></td>
                <td><span class="badge ${u.status==="active"?"badge-active":"badge-inactive"}">${u.status==="active"?"Active":"Inactive"}</span></td>
                <td class="action-btns">
                    <button class="erp-edit-btn" onclick="openEditUser(${u.id})">Edit</button>
                    <button class="erp-pw-btn"   onclick="openChangePw(${u.id})">Change PW</button>
                    ${u.id===current.id
                        ? `<span style="font-size:11px;color:var(--gray-text)">You</span>`
                        : `<button class="erp-delete-btn" onclick="deleteUser(${u.id})">Delete</button>`}
                </td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Error loading users.</td></tr>`;
    }
}

async function saveUser() {
    const id     = document.getElementById("editUserId").value;
    const name   = document.getElementById("userName").value.trim();
    const email  = document.getElementById("userEmail").value.trim().toLowerCase();
    const pw     = document.getElementById("userPassword").value.trim();
    const pwC    = document.getElementById("userPasswordConfirm").value.trim();
    const role   = document.getElementById("userRole").value;
    const status = document.getElementById("userStatus").value;
    if (!name || !email) { alert("Name and email are required."); return; }
    try {
        if (id) {
            const data = { name, email, role, status };
            if (pw) {
                if (pw !== pwC) { alert("Passwords do not match."); return; }
                if (pw.length < 6) { alert("Password must be at least 6 characters."); return; }
                data.password = pw;
            }
            await sbPatch("/users?id=eq." + Number(id), data);
            showToast("✅ User updated!");
        } else {
            if (!pw) { alert("Password is required."); return; }
            if (pw !== pwC) { alert("Passwords do not match."); return; }
            if (pw.length < 6) { alert("Password must be at least 6 characters."); return; }
            const existing = await sbGet("/users?email=eq." + encodeURIComponent(email) + "&limit=1");
            if (existing.length > 0) { alert("This email is already registered."); return; }
            await sbPost("/users", { name, email, password:pw, role, status });
            showToast("✅ User created! They can now login from any device.");
        }
        closeModal("userModal");
        clearUserForm();
        renderUsers();
    } catch(err) { alert("Error saving user. Try again."); }
}

async function openEditUser(id) {
    try {
        const users = await sbGet("/users?id=eq." + id + "&limit=1");
        const u = users[0]; if (!u) return;
        document.getElementById("userModalTitle").textContent = "Edit User";
        document.getElementById("editUserId").value           = u.id;
        document.getElementById("userName").value             = u.name;
        document.getElementById("userEmail").value            = u.email;
        document.getElementById("userPassword").value         = "";
        document.getElementById("userPasswordConfirm").value  = "";
        document.getElementById("userRole").value             = u.role;
        document.getElementById("userStatus").value           = u.status;
        openModal("userModal");
    } catch(err) { alert("Error loading user."); }
}

async function deleteUser(id) {
    const current = getCurrentUser();
    if (id === current.id) { alert("You cannot delete your own account."); return; }
    if (!confirm("Delete this user?")) return;
    try {
        await sbDelete("/users?id=eq." + id);
        showToast("✅ User deleted.");
        renderUsers();
    } catch(err) { alert("Error deleting user."); }
}

async function openChangePw(id) {
    try {
        const users = await sbGet("/users?id=eq." + id + "&limit=1");
        const u = users[0]; if (!u) return;
        document.getElementById("pwUserId").value           = id;
        document.getElementById("pwUserLabel").textContent  = "Changing password for: " + u.name + " (" + u.email + ")";
        document.getElementById("newPassword").value        = "";
        document.getElementById("newPasswordConfirm").value = "";
        openModal("pwModal");
    } catch(err) { alert("Error loading user."); }
}

async function changePassword() {
    const id  = document.getElementById("pwUserId").value;
    const pw  = document.getElementById("newPassword").value.trim();
    const pwC = document.getElementById("newPasswordConfirm").value.trim();
    if (!pw)           { alert("Enter a new password."); return; }
    if (pw.length < 6) { alert("Minimum 6 characters."); return; }
    if (pw !== pwC)    { alert("Passwords do not match."); return; }
    try {
        await sbPatch("/users?id=eq." + id, { password: pw });
        closeModal("pwModal");
        showToast("✅ Password updated!");
    } catch(err) { alert("Error updating password."); }
}

function clearUserForm() {
    document.getElementById("userModalTitle").textContent = "Add New User";
    ["editUserId","userName","userEmail","userPassword","userPasswordConfirm"].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    const r = document.getElementById("userRole");   if (r) r.value = "staff";
    const s = document.getElementById("userStatus"); if (s) s.value = "active";
}

// ========================
// MY PROFILE
// ========================
function renderMyProfile() {
    const user = getCurrentUser();
    if (!user) return;
    const el = document.getElementById("profileInfo");
    if (el) el.innerHTML = `
        <div class="profile-row"><span>Name</span><strong>${user.name}</strong></div>
        <div class="profile-row"><span>Email</span><strong>${user.email}</strong></div>
        <div class="profile-row"><span>Role</span><strong>${user.role === "admin" ? "Administrator" : "Staff"}</strong></div>`;
}

async function changeMyPassword() {
    const current = getCurrentUser();
    const oldPw   = document.getElementById("myOldPw").value.trim();
    const newPw   = document.getElementById("myNewPw").value.trim();
    const confPw  = document.getElementById("myConfirmPw").value.trim();
    const msgBox  = document.getElementById("myPwMsg");

    function showMsg(html, type) {
        msgBox.innerHTML      = html;
        msgBox.style.display  = "block";
        msgBox.style.background   = type === "success" ? "#d1fae5" : "#fee2e2";
        msgBox.style.border       = "1px solid " + (type === "success" ? "#6ee7b7" : "#fca5a5");
        msgBox.style.color        = type === "success" ? "#065f46" : "#991b1b";
        msgBox.style.borderRadius = "8px";
        msgBox.style.padding      = "12px 16px";
        msgBox.style.fontSize     = "14px";
    }

    msgBox.style.display = "none";
    try {
        const users = await sbGet("/users?id=eq." + current.id + "&limit=1");
        const user  = users[0];
        if (!user || user.password !== oldPw) { showMsg("⚠️ Current password is incorrect.", "error"); return; }
        if (!newPw || newPw.length < 6)       { showMsg("⚠️ New password must be at least 6 characters.", "error"); return; }
        if (newPw !== confPw)                  { showMsg("⚠️ New passwords do not match.", "error"); return; }
        await sbPatch("/users?id=eq." + current.id, { password: newPw });
        showMsg("✅ Password changed successfully!", "success");
        document.getElementById("myOldPw").value    = "";
        document.getElementById("myNewPw").value    = "";
        document.getElementById("myConfirmPw").value = "";
    } catch(err) { showMsg("⚠️ Error updating password. Try again.", "error"); }
}

// ========================
// SERVICES MANAGER
// ========================
function renderServicesManager() {
    const tbody = document.getElementById("servicesTableBody");
    if (!tbody) return;
    const services = getServices();
    tbody.innerHTML = services.map((s,i) => `
        <tr>
            <td>${i+1}</td><td style="font-size:24px">${s.icon}</td>
            <td><strong>${s.title}</strong></td>
            <td style="font-size:13px;color:var(--gray-text);max-width:260px">${s.desc}</td>
            <td>${s.badge ? `<span class="badge badge-active">${s.badge}</span>` : "—"}</td>
            <td class="action-btns">
                <button class="erp-edit-btn"   onclick="openEditService(${s.id})">Edit</button>
                <button class="erp-delete-btn" onclick="deleteService(${s.id})">Remove</button>
            </td>
        </tr>`).join("");
}

function saveService() {
    const id    = document.getElementById("editServiceId").value;
    const icon  = document.getElementById("serviceIcon").value.trim();
    const title = document.getElementById("serviceTitle").value.trim();
    const desc  = document.getElementById("serviceDesc").value.trim();
    const badge = document.getElementById("serviceBadge").value.trim();
    if (!icon || !title || !desc) { alert("Icon, name and description are required."); return; }
    let services = getServices();
    if (id) {
        const idx = services.findIndex(s => s.id === Number(id));
        if (idx > -1) services[idx] = { ...services[idx], icon, title, desc, badge };
    } else {
        services.push({ id: Date.now(), icon, title, desc, badge });
    }
    saveServices(services);
    closeModal("serviceModal");
    clearServiceForm();
    renderServicesManager();
    showToast("✅ Service saved!");
}

function openEditService(id) {
    const s = getServices().find(x => x.id === id);
    if (!s) return;
    document.getElementById("serviceModalTitle").textContent = "Edit Service";
    document.getElementById("editServiceId").value           = s.id;
    document.getElementById("serviceIcon").value             = s.icon;
    document.getElementById("serviceTitle").value            = s.title;
    document.getElementById("serviceDesc").value             = s.desc;
    document.getElementById("serviceBadge").value            = s.badge || "";
    openModal("serviceModal");
}

function deleteService(id) {
    if (!confirm("Remove this service?")) return;
    saveServices(getServices().filter(s => s.id !== id));
    renderServicesManager();
}

function clearServiceForm() {
    document.getElementById("serviceModalTitle").textContent = "Add New Service";
    ["editServiceId","serviceIcon","serviceTitle","serviceDesc","serviceBadge"].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = "";
    });
}

// ========================
// INVOICE SECTION
// ========================
async function renderInvoiceSection() {
    if (typeof initInvoiceSection === "function") {
        initInvoiceSection();
    }
    try {
        const invoices = await sbGet("/invoices?order=id.desc");
        const total    = invoices.reduce((s,i) => s + Number(i.total), 0);
        const paid     = invoices.filter(i => i.status === "Paid").reduce((s,i) => s + Number(i.total), 0);
        const pending  = invoices.filter(i => i.status !== "Paid").reduce((s,i) => s + Number(i.total), 0);
        const g = id => document.getElementById(id);
        if (g("invStatTotal"))   g("invStatTotal").textContent   = invoices.length;
        if (g("invStatBilled"))  g("invStatBilled").textContent  = fmtN(total);
        if (g("invStatPaid"))    g("invStatPaid").textContent    = fmtN(paid);
        if (g("invStatPending")) g("invStatPending").textContent = fmtN(pending);
    } catch(err) { console.error(err); }
}

// ========================
// DATE + INIT
// ========================
function setDate() {
    const el = document.getElementById("erpDate");
    if (el) el.textContent = new Date().toLocaleDateString("en-GB", {
        weekday:"short", day:"2-digit", month:"short", year:"numeric"
    });
}

function saveData() {} // kept for compatibility

if (document.getElementById("section-overview")) {
    setDate();
    applyRoleUI();
    renderOverview();
    const today = new Date().toISOString().split("T")[0];
    const sd = document.getElementById("saleDate");
    const ed = document.getElementById("expenseDate");
    if (sd) sd.value = today;
    if (ed) ed.value = today;
}
