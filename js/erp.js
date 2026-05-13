// ============================================
//   YASEERTECH ERP - MULTI-USER SYSTEM
//   js/erp.js — DELETE everything, paste this
// ============================================

// ========================
// USER ACCOUNTS
// Admin = full access
// Staff = add sales/expenses only, see own records
// ========================
const USERS = [
    {
        id:       1,
        name:     "Admin",
        email:    "admin@yaseertech.com",
        password: "yaseer2026",
        role:     "admin"
    },
    {
        id:       2,
        name:     "Staff One",
        email:    "staff1@yaseertech.com",
        password: "staff1pass",
        role:     "staff"
    },
    {
        id:       3,
        name:     "Staff Two",
        email:    "staff2@yaseertech.com",
        password: "staff2pass",
        role:     "staff"
    },
    {
        id:       4,
        name:     "Staff Three",
        email:    "staff3@yaseertech.com",
        password: "staff3pass",
        role:     "staff"
    }
];

// ========================
// SESSION HELPERS
// ========================
function getCurrentUser() {
    const stored = localStorage.getItem("yt_current_user");
    return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user) {
    // Never store password in session
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem("yt_current_user", JSON.stringify(safe));
    localStorage.setItem("yt_logged_in", "true");
}

function erpLogout() {
    localStorage.removeItem("yt_logged_in");
    localStorage.removeItem("yt_current_user");
    window.location.href = "login.html";
}

// ========================
// DATA STORE
// ========================
let staffList    = JSON.parse(localStorage.getItem("yt_staff"))    || [];
let salesList    = JSON.parse(localStorage.getItem("yt_sales"))    || [];
let expensesList = JSON.parse(localStorage.getItem("yt_expenses")) || [];

function saveData() {
    localStorage.setItem("yt_staff",    JSON.stringify(staffList));
    localStorage.setItem("yt_sales",    JSON.stringify(salesList));
    localStorage.setItem("yt_expenses", JSON.stringify(expensesList));
}

// ========================
// LOGIN PAGE
// ========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value.trim();
        const errorBox = document.getElementById("loginError");

        errorBox.style.display = "none";

        const user = USERS.find(u => u.email === email && u.password === password);

        if (user) {
            setCurrentUser(user);
            window.location.href = "dashboard.html";
        } else {
            errorBox.style.display = "block";
        }
    });
}

function togglePassword() {
    const pw = document.getElementById("loginPassword");
    pw.type = pw.type === "password" ? "text" : "password";
}

// ========================
// AUTH GUARD (dashboard)
// ========================
const onDashboard = window.location.pathname.includes("dashboard.html");

if (onDashboard) {
    if (localStorage.getItem("yt_logged_in") !== "true") {
        window.location.href = "login.html";
    }
}

// ========================
// APPLY ROLE-BASED UI
// ========================
function applyRoleUI() {
    const user = getCurrentUser();
    if (!user) return;

    // Update header user info
    const nameEl   = document.querySelector(".erp-user-info strong");
    const roleEl   = document.querySelector(".erp-user-info span");
    const avatarEl = document.querySelector(".erp-user-avatar");

    if (nameEl)   nameEl.textContent   = user.name;
    if (roleEl)   roleEl.textContent   = user.role === "admin" ? "Administrator" : "Staff";
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

    // Hide staff management nav + section for non-admins
    if (user.role !== "admin") {
        const staffNavItem = document.querySelector('[onclick*="staff"]');
        if (staffNavItem) staffNavItem.style.display = "none";
    }
}

// ========================
// SIDEBAR TOGGLE
// ========================
function toggleSidebar() {
    const sidebar = document.getElementById("erpSidebar");
    const main    = document.getElementById("erpMain");
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
    } else {
        sidebar.classList.toggle("collapsed");
        main.classList.toggle("full-width");
    }
}

// ========================
// SECTION NAVIGATION
// ========================
function showSection(name, clickedLink) {
    const user = getCurrentUser();

    // Block staff from accessing staff management
    if (name === "staff" && user && user.role !== "admin") {
        alert("Access denied. Only Admin can manage staff.");
        return;
    }

    document.querySelectorAll(".erp-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("section-" + name);
    if (target) target.classList.add("active");

    document.querySelectorAll(".erp-nav-item").forEach(i => i.classList.remove("active"));
    if (clickedLink) clickedLink.classList.add("active");

    if (name === "overview")  renderOverview();
    if (name === "staff")     renderStaff();
    if (name === "sales")     renderSales();
    if (name === "expenses")  renderExpenses();
    if (name === "reports")   renderReports();

    if (window.innerWidth <= 768) {
        document.getElementById("erpSidebar").classList.remove("open");
    }
}

// ========================
// MODAL CONTROLS
// ========================
function openModal(id) {
    document.getElementById(id).classList.add("open");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}

document.addEventListener("click", function (e) {
    document.querySelectorAll(".erp-modal.open").forEach(modal => {
        if (e.target === modal) closeModal(modal.id);
    });
});

// ========================
// HELPERS
// ========================
function formatNaira(amount) {
    return "₦" + Number(amount).toLocaleString("en-NG");
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function getRoleBadge(role) {
    return role === "admin"
        ? `<span class="badge badge-active">Admin</span>`
        : `<span class="badge" style="background:#e0e7ff;color:#3730a3">Staff</span>`;
}

// ========================
// OVERVIEW
// ========================
function renderOverview() {
    const totalSales    = salesList.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expensesList.reduce((s, i) => s + Number(i.amount), 0);
    const netProfit     = totalSales - totalExpenses;

    document.getElementById("totalStaff").textContent    = staffList.length;
    document.getElementById("totalSales").textContent    = formatNaira(totalSales);
    document.getElementById("totalExpenses").textContent = formatNaira(totalExpenses);
    document.getElementById("netProfit").textContent     = formatNaira(netProfit);

    // Recent sales
    const recentSalesTable = document.getElementById("recentSalesTable");
    const recent = [...salesList].reverse().slice(0, 5);
    recentSalesTable.innerHTML = recent.length === 0
        ? `<tr><td colspan="3" class="empty-row">No sales recorded yet</td></tr>`
        : recent.map(s => `
            <tr>
                <td>${s.customer}</td>
                <td>${s.service}</td>
                <td><strong>${formatNaira(s.amount)}</strong></td>
            </tr>`).join("");

    // Recent expenses
    const recentExpTable = document.getElementById("recentExpensesTable");
    const recentExp = [...expensesList].reverse().slice(0, 5);
    recentExpTable.innerHTML = recentExp.length === 0
        ? `<tr><td colspan="3" class="empty-row">No expenses recorded yet</td></tr>`
        : recentExp.map(e => `
            <tr>
                <td>${e.desc}</td>
                <td>${e.category}</td>
                <td><strong>${formatNaira(e.amount)}</strong></td>
            </tr>`).join("");
}

// ========================
// STAFF (Admin only)
// ========================
function addStaff() {
    const name     = document.getElementById("staffName").value.trim();
    const position = document.getElementById("staffPosition").value.trim();
    const phone    = document.getElementById("staffPhone").value.trim();
    const status   = document.getElementById("staffStatus").value;

    if (!name || !position || !phone) { alert("Please fill in all fields."); return; }

    staffList.push({
        id: Date.now(), name, position, phone, status,
        date: new Date().toISOString().split("T")[0]
    });

    saveData();
    closeModal("staffModal");
    document.getElementById("staffName").value     = "";
    document.getElementById("staffPosition").value = "";
    document.getElementById("staffPhone").value    = "";
    renderStaff();
    renderOverview();
}

function deleteStaff(id) {
    if (!confirm("Remove this staff member?")) return;
    staffList = staffList.filter(s => s.id !== id);
    saveData();
    renderStaff();
    renderOverview();
}

function renderStaff() {
    const tbody = document.getElementById("staffTableBody");
    if (!tbody) return;

    if (staffList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No staff added yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = staffList.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.position}</td>
            <td>${s.phone}</td>
            <td>${formatDate(s.date)}</td>
            <td><span class="badge ${s.status === "Active" ? "badge-active" : "badge-inactive"}">${s.status}</span></td>
            <td><button class="erp-delete-btn" onclick="deleteStaff(${s.id})">Remove</button></td>
        </tr>`).join("");
}

// ========================
// SALES
// ========================
function addSale() {
    const user     = getCurrentUser();
    const customer = document.getElementById("saleCustomer").value.trim();
    const service  = document.getElementById("saleService").value;
    const amount   = document.getElementById("saleAmount").value.trim();
    const date     = document.getElementById("saleDate").value;

    if (!customer || !service || !amount || !date) { alert("Please fill in all fields."); return; }

    salesList.push({
        id: Date.now(), customer, service,
        amount: Number(amount), date,
        addedBy:     user ? user.name : "Unknown",
        addedByRole: user ? user.role : "unknown"
    });

    saveData();
    closeModal("salesModal");
    document.getElementById("saleCustomer").value = "";
    document.getElementById("saleService").value  = "";
    document.getElementById("saleAmount").value   = "";
    renderSales();
    renderOverview();
}

function deleteSale(id) {
    const user = getCurrentUser();
    if (user.role !== "admin") { alert("Only Admin can delete records."); return; }
    if (!confirm("Delete this sale?")) return;
    salesList = salesList.filter(s => s.id !== id);
    saveData();
    renderSales();
    renderOverview();
}

function renderSales() {
    const tbody  = document.getElementById("salesTableBody");
    const user   = getCurrentUser();
    if (!tbody) return;

    const total = salesList.reduce((s, i) => s + Number(i.amount), 0);
    const thisMonth = salesList.filter(s => {
        const d = new Date(s.date), now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, i) => s + Number(i.amount), 0);

    const el1 = document.getElementById("salesTotal");
    const el2 = document.getElementById("salesMonth");
    const el3 = document.getElementById("salesCount");
    if (el1) el1.textContent = formatNaira(total);
    if (el2) el2.textContent = formatNaira(thisMonth);
    if (el3) el3.textContent = salesList.length;

    if (salesList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No sales recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = [...salesList].reverse().map((s, i) => `
        <tr>
            <td>${salesList.length - i}</td>
            <td>${formatDate(s.date)}</td>
            <td><strong>${s.customer}</strong></td>
            <td>${s.service}</td>
            <td><strong style="color:var(--green)">${formatNaira(s.amount)}</strong></td>
            <td>
                <span class="added-by-tag ${s.addedByRole === 'admin' ? 'by-admin' : 'by-staff'}">
                    ${s.addedBy || "Unknown"}
                </span>
            </td>
            <td>${user && user.role === "admin"
                ? `<button class="erp-delete-btn" onclick="deleteSale(${s.id})">Delete</button>`
                : `<span style="color:var(--gray-text);font-size:12px">—</span>`
            }</td>
        </tr>`).join("");
}

// ========================
// EXPENSES
// ========================
function addExpense() {
    const user     = getCurrentUser();
    const desc     = document.getElementById("expenseDesc").value.trim();
    const category = document.getElementById("expenseCategory").value;
    const amount   = document.getElementById("expenseAmount").value.trim();
    const date     = document.getElementById("expenseDate").value;

    if (!desc || !category || !amount || !date) { alert("Please fill in all fields."); return; }

    expensesList.push({
        id: Date.now(), desc, category,
        amount: Number(amount), date,
        addedBy:     user ? user.name : "Unknown",
        addedByRole: user ? user.role : "unknown"
    });

    saveData();
    closeModal("expensesModal");
    document.getElementById("expenseDesc").value     = "";
    document.getElementById("expenseCategory").value = "";
    document.getElementById("expenseAmount").value   = "";
    renderExpenses();
    renderOverview();
}

function deleteExpense(id) {
    const user = getCurrentUser();
    if (user.role !== "admin") { alert("Only Admin can delete records."); return; }
    if (!confirm("Delete this expense?")) return;
    expensesList = expensesList.filter(e => e.id !== id);
    saveData();
    renderExpenses();
    renderOverview();
}

function renderExpenses() {
    const tbody = document.getElementById("expensesTableBody");
    const user  = getCurrentUser();
    if (!tbody) return;

    const total = expensesList.reduce((s, i) => s + Number(i.amount), 0);
    const thisMonth = expensesList.filter(e => {
        const d = new Date(e.date), now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, i) => s + Number(i.amount), 0);

    const el1 = document.getElementById("expensesTotal");
    const el2 = document.getElementById("expensesMonth");
    const el3 = document.getElementById("expensesCount");
    if (el1) el1.textContent = formatNaira(total);
    if (el2) el2.textContent = formatNaira(thisMonth);
    if (el3) el3.textContent = expensesList.length;

    if (expensesList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No expenses recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = [...expensesList].reverse().map((e, i) => `
        <tr>
            <td>${expensesList.length - i}</td>
            <td>${formatDate(e.date)}</td>
            <td><strong>${e.desc}</strong></td>
            <td>${e.category}</td>
            <td><strong style="color:var(--orange)">${formatNaira(e.amount)}</strong></td>
            <td>
                <span class="added-by-tag ${e.addedByRole === 'admin' ? 'by-admin' : 'by-staff'}">
                    ${e.addedBy || "Unknown"}
                </span>
            </td>
            <td>${user && user.role === "admin"
                ? `<button class="erp-delete-btn" onclick="deleteExpense(${e.id})">Delete</button>`
                : `<span style="color:var(--gray-text);font-size:12px">—</span>`
            }</td>
        </tr>`).join("");
}

// ========================
// REPORTS
// ========================
function renderReports() {
    const totalSales    = salesList.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expensesList.reduce((s, i) => s + Number(i.amount), 0);
    const netProfit     = totalSales - totalExpenses;

    const el1 = document.getElementById("reportStaff");
    const el2 = document.getElementById("reportSales");
    const el3 = document.getElementById("reportExpenses");
    const el4 = document.getElementById("reportProfit");
    if (el1) el1.textContent = staffList.length;
    if (el2) el2.textContent = formatNaira(totalSales);
    if (el3) el3.textContent = formatNaira(totalExpenses);
    if (el4) el4.textContent = formatNaira(netProfit);

    // Sales by service
    const sbsEl = document.getElementById("salesByService");
    if (sbsEl) {
        const map = {};
        salesList.forEach(s => { map[s.service] = (map[s.service] || 0) + Number(s.amount); });
        const entries = Object.entries(map);
        sbsEl.innerHTML = entries.length === 0
            ? `<p class="empty-row">No sales data yet</p>`
            : entries.sort((a,b) => b[1]-a[1]).map(([k,v]) =>
                `<div class="report-item"><strong>${k}</strong><span>${formatNaira(v)}</span></div>`
              ).join("");
    }

    // Expenses by category
    const ebcEl = document.getElementById("expensesByCategory");
    if (ebcEl) {
        const map = {};
        expensesList.forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
        const entries = Object.entries(map);
        ebcEl.innerHTML = entries.length === 0
            ? `<p class="empty-row">No expenses data yet</p>`
            : entries.sort((a,b) => b[1]-a[1]).map(([k,v]) =>
                `<div class="report-item"><strong>${k}</strong><span>${formatNaira(v)}</span></div>`
              ).join("");
    }

    // Sales by staff member (admin only)
    const sbStaffEl = document.getElementById("salesByStaff");
    if (sbStaffEl) {
        const map = {};
        salesList.forEach(s => {
            const key = s.addedBy || "Unknown";
            map[key] = (map[key] || 0) + Number(s.amount);
        });
        const entries = Object.entries(map);
        sbStaffEl.innerHTML = entries.length === 0
            ? `<p class="empty-row">No data yet</p>`
            : entries.sort((a,b) => b[1]-a[1]).map(([k,v]) =>
                `<div class="report-item"><strong>${k}</strong><span>${formatNaira(v)}</span></div>`
              ).join("");
    }
}

// ========================
// DATE IN HEADER
// ========================
function setDate() {
    const el = document.getElementById("erpDate");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("en-GB", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
}

// ========================
// INIT DASHBOARD
// ========================
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
