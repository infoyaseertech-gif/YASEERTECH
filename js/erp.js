// ============================================
//   YASEERTECH ERP - SUPABASE CLOUD VERSION
//   js/erp.js — DELETE everything, paste this
// ============================================

// ========================
// SUPABASE CONFIG
// ========================
const SUPABASE_URL  = "https://winlgtflhwiaraniwpts.supabase.co";
const SUPABASE_KEY  = "sb_publishable_YFngUdJcVv7uXby3US4Nbg_7OQCs3ok";
const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;

// ========================
// SUPABASE API HELPER
// ========================
async function sbFetch(endpoint, options = {}) {
    const url = `${SUPABASE_REST}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type":  "application/json",
            "apikey":        SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Prefer":        "return=representation",
            ...(options.headers || {})
        }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

// ========================
// USER FUNCTIONS (Cloud)
// ========================
async function getUsers() {
    return await sbFetch("/users?order=id");
}

async function getUserByEmail(email) {
    const users = await sbFetch(`/users?email=eq.${encodeURIComponent(email)}&limit=1`);
    return users[0] || null;
}

async function createUser(name, email, password, role, status) {
    return await sbFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role, status })
    });
}

async function updateUser(id, data) {
    return await sbFetch(`/users?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    });
}

async function deleteUserById(id) {
    return await sbFetch(`/users?id=eq.${id}`, {
        method: "DELETE"
    });
}

// ========================
// DEFAULT SERVICES
// ========================
const DEFAULT_SERVICES = [
    { id:1, icon:"🎓", title:"ICT Training",            desc:"Hands-on digital skills — social media marketing, web design, graphic design, and freelancing.", badge:"" },
    { id:2, icon:"📣", title:"Social Media & Meta Ads",  desc:"Facebook and Instagram ads that attract real customers, generate leads, and boost sales.", badge:"Most Popular" },
    { id:3, icon:"🌐", title:"Website Design",           desc:"Professional, responsive websites for businesses, e-commerce, and landing pages.", badge:"" },
    { id:4, icon:"🎨", title:"Graphic Design & Branding",desc:"Logos, business kits, flyers, and full brand identity that makes you stand out.", badge:"" },
    { id:5, icon:"📊", title:"Digital Marketing",        desc:"Data-driven campaigns that increase visibility, drive traffic, and convert leads into customers.", badge:"" },
    { id:6, icon:"🖨️", title:"Business Centre",         desc:"Printing, scanning, typing, documentation, and online registrations in Wuse 2, Abuja.", badge:"" }
];

// ========================
// LOCAL DATA (Sales, Expenses, Staff)
// ========================
function getServices()   { return JSON.parse(localStorage.getItem("yt_services")) || DEFAULT_SERVICES; }
function saveServices(s) { localStorage.setItem("yt_services", JSON.stringify(s)); }

let staffList    = JSON.parse(localStorage.getItem("yt_staff"))    || [];
let salesList    = JSON.parse(localStorage.getItem("yt_sales"))    || [];
let expensesList = JSON.parse(localStorage.getItem("yt_expenses")) || [];

function saveData() {
    localStorage.setItem("yt_staff",    JSON.stringify(staffList));
    localStorage.setItem("yt_sales",    JSON.stringify(salesList));
    localStorage.setItem("yt_expenses", JSON.stringify(expensesList));
}

// ========================
// SESSION
// ========================
function getCurrentUser() {
    const s = localStorage.getItem("yt_current_user");
    return s ? JSON.parse(s) : null;
}
function setCurrentUser(user) {
    localStorage.setItem("yt_current_user", JSON.stringify({
        id: user.id, name: user.name, email: user.email, role: user.role
    }));
    localStorage.setItem("yt_logged_in", "true");
}
function erpLogout() {
    localStorage.removeItem("yt_logged_in");
    localStorage.removeItem("yt_current_user");
    window.location.href = "login.html";
}

// ========================
// RESET CODE STORE
// ========================
const resetStore = {};

// ========================
// SHOW / HIDE VIEWS
// ========================
function showView(id) {
    ["loginView","forgotView"].forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = "none";
    });
    const t = document.getElementById(id);
    if (t) t.style.display = "block";
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
            const user = await getUserByEmail(email);

            if (user && user.password === pw && user.status === "active") {
                // Remember me
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

    // Pre-fill remembered email
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
function sendResetCode() {
    const email  = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const msgBox = document.getElementById("forgotMsg");
    showResetMsg(msgBox, "", "");

    if (!email) { showResetMsg(msgBox, "⚠️ Please enter your email address.", "error"); return; }

    // Check user exists
    getUserByEmail(email).then(user => {
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
    if (!stored)                    { showResetMsg(msgBox, "⚠️ Session expired. Start again.", "error"); return; }
    if (Date.now() > stored.expires){ showResetMsg(msgBox, "⚠️ Code expired. Request a new one.", "error"); delete resetStore[email]; return; }
    if (entered !== stored.code)    { showResetMsg(msgBox, "⚠️ Incorrect code. Try again.", "error"); return; }
    if (!newPw || newPw.length < 6) { showResetMsg(msgBox, "⚠️ Password must be at least 6 characters.", "error"); return; }
    if (newPw !== confPw)           { showResetMsg(msgBox, "⚠️ Passwords do not match.", "error"); return; }

    getUserByEmail(email).then(user => {
        if (user) {
            return updateUser(user.id, { password: newPw });
        }
    }).then(() => {
        delete resetStore[email];
        showResetMsg(msgBox, "✅ Password updated! Taking you to login...", "success");
        setTimeout(() => {
            document.getElementById("forgotStep1").style.display = "block";
            document.getElementById("forgotStep2").style.display = "none";
            document.getElementById("forgotEmail").value  = "";
            document.getElementById("resetCode").value    = "";
            document.getElementById("resetNewPw").value   = "";
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
    el.innerHTML      = html;
    el.style.display  = "block";
    el.style.background   = type === "success" ? "#d1fae5" : "#fee2e2";
    el.style.border       = `1px solid ${type === "success" ? "#6ee7b7" : "#fca5a5"}`;
    el.style.color        = type === "success" ? "#065f46" : "#991b1b";
    el.style.borderRadius = "8px";
    el.style.padding      = "12px 16px";
    el.style.fontSize     = "14px";
    el.style.lineHeight   = "1.6";
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
    const nameEl   = document.getElementById("erpUserName");
    const roleEl   = document.getElementById("erpUserRole");
    const avatarEl = document.getElementById("erpAvatar");
    if (nameEl)   nameEl.textContent   = user.name;
    if (roleEl)   roleEl.textContent   = user.role === "admin" ? "Administrator" : "Staff";
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
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
// SECTION NAV
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
        overview: renderOverview, staff: renderStaff,
        sales: renderSales, expenses: renderExpenses,
        reports: renderReports, users: renderUsers,
        services: renderServicesManager, myprofile: renderMyProfile, invoices: renderInvoiceSection
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
    t.style.cssText = `
        position:fixed;top:90px;right:20px;z-index:99999;
        background:${type==="success"?"#10b981":"#ef4444"};
        color:white;padding:12px 20px;border-radius:10px;
        font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;
        box-shadow:0 4px 20px rgba(0,0,0,0.2);
        animation:fadeInRight 0.3s ease;
    `;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ========================
// OVERVIEW
// ========================
function renderOverview() {
    const tS = salesList.reduce((s,i) => s+Number(i.amount), 0);
    const tE = expensesList.reduce((s,i) => s+Number(i.amount), 0);
    const g  = id => document.getElementById(id);
    if (g("totalStaff"))    g("totalStaff").textContent    = staffList.length;
    if (g("totalSales"))    g("totalSales").textContent    = fmtN(tS);
    if (g("totalExpenses")) g("totalExpenses").textContent = fmtN(tE);
    if (g("netProfit"))     g("netProfit").textContent     = fmtN(tS - tE);

    const rST = g("recentSalesTable");
    const rs  = [...salesList].reverse().slice(0,5);
    if (rST) rST.innerHTML = rs.length===0
        ? `<tr><td colspan="4" class="empty-row">No sales yet</td></tr>`
        : rs.map(s=>`<tr><td>${s.customer}</td><td>${s.service}</td><td><strong>${fmtN(s.amount)}</strong></td><td>${s.addedBy||"—"}</td></tr>`).join("");

    const rET = g("recentExpensesTable");
    const re  = [...expensesList].reverse().slice(0,5);
    if (rET) rET.innerHTML = re.length===0
        ? `<tr><td colspan="4" class="empty-row">No expenses yet</td></tr>`
        : re.map(e=>`<tr><td>${e.desc}</td><td>${e.category}</td><td><strong>${fmtN(e.amount)}</strong></td><td>${e.addedBy||"—"}</td></tr>`).join("");
}

// ========================
// STAFF
// ========================
function addStaff() {
    const name=document.getElementById("staffName").value.trim();
    const pos=document.getElementById("staffPosition").value.trim();
    const phone=document.getElementById("staffPhone").value.trim();
    const status=document.getElementById("staffStatus").value;
    if (!name||!pos||!phone){alert("Please fill all fields.");return;}
    staffList.push({id:Date.now(),name,position:pos,phone,status,date:new Date().toISOString().split("T")[0]});
    saveData(); closeModal("staffModal");
    document.getElementById("staffName").value="";
    document.getElementById("staffPosition").value="";
    document.getElementById("staffPhone").value="";
    renderStaff(); renderOverview();
}
function deleteStaff(id) {
    if (!confirm("Remove this staff member?"))return;
    staffList=staffList.filter(s=>s.id!==id);
    saveData(); renderStaff(); renderOverview();
}
function renderStaff() {
    const tbody=document.getElementById("staffTableBody");
    if (!tbody)return;
    if (staffList.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No staff added yet.</td></tr>`;return;}
    tbody.innerHTML=staffList.map((s,i)=>`
        <tr>
            <td>${i+1}</td><td><strong>${s.name}</strong></td><td>${s.position}</td>
            <td>${s.phone}</td><td>${fmtD(s.date)}</td>
            <td><span class="badge ${s.status==="Active"?"badge-active":"badge-inactive"}">${s.status}</span></td>
            <td><button class="erp-delete-btn" onclick="deleteStaff(${s.id})">Remove</button></td>
        </tr>`).join("");
}

// ========================
// SALES
// ========================
function addSale() {
    const user=getCurrentUser();
    const customer=document.getElementById("saleCustomer").value.trim();
    const service=document.getElementById("saleService").value;
    const amount=document.getElementById("saleAmount").value.trim();
    const date=document.getElementById("saleDate").value;
    if (!customer||!service||!amount||!date){alert("Please fill all fields.");return;}
    salesList.push({id:Date.now(),customer,service,amount:Number(amount),date,addedBy:user?user.name:"Unknown",addedByRole:user?user.role:"unknown"});
    saveData(); closeModal("salesModal");
    document.getElementById("saleCustomer").value="";
    document.getElementById("saleService").value="";
    document.getElementById("saleAmount").value="";
    renderSales(); renderOverview();
    showToast("✅ Sale recorded successfully!");
}
function deleteSale(id) {
    const user=getCurrentUser();
    if (user.role!=="admin"){alert("Only Admin can delete.");return;}
    if (!confirm("Delete this sale?"))return;
    salesList=salesList.filter(s=>s.id!==id);
    saveData(); renderSales(); renderOverview();
}
function renderSales() {
    const tbody=document.getElementById("salesTableBody");
    const user=getCurrentUser();
    if (!tbody)return;
    const total=salesList.reduce((s,i)=>s+Number(i.amount),0);
    const now=new Date();
    const month=salesList.filter(s=>{const d=new Date(s.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,i)=>s+Number(i.amount),0);
    const g=id=>document.getElementById(id);
    if(g("salesTotal"))g("salesTotal").textContent=fmtN(total);
    if(g("salesMonth"))g("salesMonth").textContent=fmtN(month);
    if(g("salesCount"))g("salesCount").textContent=salesList.length;
    if(salesList.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No sales yet.</td></tr>`;return;}
    tbody.innerHTML=[...salesList].reverse().map((s,i)=>`
        <tr>
            <td>${salesList.length-i}</td><td>${fmtD(s.date)}</td>
            <td><strong>${s.customer}</strong></td><td>${s.service}</td>
            <td><strong style="color:var(--green)">${fmtN(s.amount)}</strong></td>
            <td><span class="added-by-tag ${s.addedByRole==="admin"?"by-admin":"by-staff"}">${s.addedBy||"Unknown"}</span></td>
            <td>${user&&user.role==="admin"?`<button class="erp-delete-btn" onclick="deleteSale(${s.id})">Delete</button>`:`—`}</td>
        </tr>`).join("");
}

// ========================
// EXPENSES
// ========================
function addExpense() {
    const user=getCurrentUser();
    const desc=document.getElementById("expenseDesc").value.trim();
    const category=document.getElementById("expenseCategory").value;
    const amount=document.getElementById("expenseAmount").value.trim();
    const date=document.getElementById("expenseDate").value;
    if (!desc||!category||!amount||!date){alert("Please fill all fields.");return;}
    expensesList.push({id:Date.now(),desc,category,amount:Number(amount),date,addedBy:user?user.name:"Unknown",addedByRole:user?user.role:"unknown"});
    saveData(); closeModal("expensesModal");
    document.getElementById("expenseDesc").value="";
    document.getElementById("expenseCategory").value="";
    document.getElementById("expenseAmount").value="";
    renderExpenses(); renderOverview();
    showToast("✅ Expense recorded successfully!");
}
function deleteExpense(id) {
    const user=getCurrentUser();
    if (user.role!=="admin"){alert("Only Admin can delete.");return;}
    if (!confirm("Delete this expense?"))return;
    expensesList=expensesList.filter(e=>e.id!==id);
    saveData(); renderExpenses(); renderOverview();
}
function renderExpenses() {
    const tbody=document.getElementById("expensesTableBody");
    const user=getCurrentUser();
    if (!tbody)return;
    const total=expensesList.reduce((s,i)=>s+Number(i.amount),0);
    const now=new Date();
    const month=expensesList.filter(e=>{const d=new Date(e.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,i)=>s+Number(i.amount),0);
    const g=id=>document.getElementById(id);
    if(g("expensesTotal"))g("expensesTotal").textContent=fmtN(total);
    if(g("expensesMonth"))g("expensesMonth").textContent=fmtN(month);
    if(g("expensesCount"))g("expensesCount").textContent=expensesList.length;
    if(expensesList.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No expenses yet.</td></tr>`;return;}
    tbody.innerHTML=[...expensesList].reverse().map((e,i)=>`
        <tr>
            <td>${expensesList.length-i}</td><td>${fmtD(e.date)}</td>
            <td><strong>${e.desc}</strong></td><td>${e.category}</td>
            <td><strong style="color:var(--orange)">${fmtN(e.amount)}</strong></td>
            <td><span class="added-by-tag ${e.addedByRole==="admin"?"by-admin":"by-staff"}">${e.addedBy||"Unknown"}</span></td>
            <td>${user&&user.role==="admin"?`<button class="erp-delete-btn" onclick="deleteExpense(${e.id})">Delete</button>`:`—`}</td>
        </tr>`).join("");
}

// ========================
// REPORTS
// ========================
function renderReports() {
    const tS=salesList.reduce((s,i)=>s+Number(i.amount),0);
    const tE=expensesList.reduce((s,i)=>s+Number(i.amount),0);
    const g=id=>document.getElementById(id);
    if(g("reportStaff"))g("reportStaff").textContent=staffList.length;
    if(g("reportSales"))g("reportSales").textContent=fmtN(tS);
    if(g("reportExpenses"))g("reportExpenses").textContent=fmtN(tE);
    if(g("reportProfit"))g("reportProfit").textContent=fmtN(tS-tE);
    function buildReport(elId,list,key){
        const el=document.getElementById(elId);if(!el)return;
        const map={};
        list.forEach(i=>{const k=i[key]||"Unknown";map[k]=(map[k]||0)+Number(i.amount);});
        const entries=Object.entries(map);
        el.innerHTML=entries.length===0?`<p class="empty-row">No data yet</p>`:entries.sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="report-item"><strong>${k}</strong><span>${fmtN(v)}</span></div>`).join("");
    }
    buildReport("salesByService",salesList,"service");
    buildReport("salesByStaff",salesList,"addedBy");
    buildReport("expensesByCategory",expensesList,"category");
}

// ========================
// USER MANAGEMENT (Cloud)
// ========================
async function renderUsers() {
    const tbody=document.getElementById("usersTableBody");
    if (!tbody)return;
    tbody.innerHTML=`<tr><td colspan="6" class="empty-row">Loading users...</td></tr>`;
    try {
        const users=await getUsers();
        const current=getCurrentUser();
        if(users.length===0){tbody.innerHTML=`<tr><td colspan="6" class="empty-row">No users found.</td></tr>`;return;}
        tbody.innerHTML=users.map((u,i)=>`
            <tr>
                <td>${i+1}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role==="admin"?"badge-active":"badge-staff"}">${u.role==="admin"?"Admin":"Staff"}</span></td>
                <td><span class="badge ${u.status==="active"?"badge-active":"badge-inactive"}">${u.status==="active"?"Active":"Inactive"}</span></td>
                <td class="action-btns">
                    <button class="erp-edit-btn" onclick="openEditUser(${u.id})">Edit</button>
                    <button class="erp-pw-btn" onclick="openChangePw(${u.id})">Change PW</button>
                    ${u.id===current.id?`<span style="font-size:11px;color:var(--gray-text)">You</span>`:`<button class="erp-delete-btn" onclick="deleteUser(${u.id})">Delete</button>`}
                </td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML=`<tr><td colspan="6" class="empty-row">Error loading users. Check connection.</td></tr>`;
    }
}

async function saveUser() {
    const id    =document.getElementById("editUserId").value;
    const name  =document.getElementById("userName").value.trim();
    const email =document.getElementById("userEmail").value.trim().toLowerCase();
    const pw    =document.getElementById("userPassword").value.trim();
    const pwC   =document.getElementById("userPasswordConfirm").value.trim();
    const role  =document.getElementById("userRole").value;
    const status=document.getElementById("userStatus").value;
    if (!name||!email){alert("Name and email are required.");return;}
    try {
        if (id) {
            const data={name,email,role,status};
            if (pw){
                if (pw!==pwC){alert("Passwords do not match.");return;}
                if (pw.length<6){alert("Password must be at least 6 characters.");return;}
                data.password=pw;
            }
            await updateUser(Number(id),data);
            showToast("✅ User updated successfully!");
        } else {
            if (!pw){alert("Password is required for new users.");return;}
            if (pw!==pwC){alert("Passwords do not match.");return;}
            if (pw.length<6){alert("Password must be at least 6 characters.");return;}
            const existing=await getUserByEmail(email);
            if (existing){alert("This email is already registered.");return;}
            await createUser(name,email,pw,role,status);
            showToast("✅ User created! They can now login from any device.");
        }
        closeModal("userModal");
        clearUserForm();
        renderUsers();
    } catch(err) {
        alert("Error saving user. Please try again.");
    }
}

async function openEditUser(id) {
    try {
        const users=await getUsers();
        const u=users.find(x=>x.id===id);
        if (!u)return;
        document.getElementById("userModalTitle").textContent="Edit User";
        document.getElementById("editUserId").value=u.id;
        document.getElementById("userName").value=u.name;
        document.getElementById("userEmail").value=u.email;
        document.getElementById("userPassword").value="";
        document.getElementById("userPasswordConfirm").value="";
        document.getElementById("userRole").value=u.role;
        document.getElementById("userStatus").value=u.status;
        openModal("userModal");
    } catch(err){alert("Error loading user.");}
}

async function deleteUser(id) {
    const current=getCurrentUser();
    if (id===current.id){alert("You cannot delete your own account.");return;}
    if (!confirm("Delete this user? They will no longer be able to login."))return;
    try {
        await deleteUserById(id);
        showToast("✅ User deleted.");
        renderUsers();
    } catch(err){alert("Error deleting user.");}
}

async function openChangePw(id) {
    try {
        const users=await getUsers();
        const u=users.find(x=>x.id===id);
        if (!u)return;
        document.getElementById("pwUserId").value=id;
        document.getElementById("pwUserLabel").textContent=`Changing password for: ${u.name} (${u.email})`;
        document.getElementById("newPassword").value="";
        document.getElementById("newPasswordConfirm").value="";
        openModal("pwModal");
    } catch(err){alert("Error loading user.");}
}

async function changePassword() {
    const id =Number(document.getElementById("pwUserId").value);
    const pw =document.getElementById("newPassword").value.trim();
    const pwC=document.getElementById("newPasswordConfirm").value.trim();
    if (!pw){alert("Enter a new password.");return;}
    if (pw.length<6){alert("Password must be at least 6 characters.");return;}
    if (pw!==pwC){alert("Passwords do not match.");return;}
    try {
        await updateUser(id,{password:pw});
        closeModal("pwModal");
        showToast("✅ Password updated successfully!");
    } catch(err){alert("Error updating password.");}
}

function clearUserForm() {
    document.getElementById("userModalTitle").textContent="Add New User";
    ["editUserId","userName","userEmail","userPassword","userPasswordConfirm"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
    const r=document.getElementById("userRole");if(r)r.value="staff";
    const s=document.getElementById("userStatus");if(s)s.value="active";
}

// ========================
// MY PROFILE
// ========================
function renderMyProfile() {
    const user=getCurrentUser();
    if (!user)return;
    const el=document.getElementById("profileInfo");
    if (el) el.innerHTML=`
        <div class="profile-row"><span>Name</span><strong>${user.name}</strong></div>
        <div class="profile-row"><span>Email</span><strong>${user.email}</strong></div>
        <div class="profile-row"><span>Role</span><strong>${user.role==="admin"?"Administrator":"Staff"}</strong></div>`;
}

async function changeMyPassword() {
    const current=getCurrentUser();
    const oldPw=document.getElementById("myOldPw").value.trim();
    const newPw=document.getElementById("myNewPw").value.trim();
    const confPw=document.getElementById("myConfirmPw").value.trim();
    const msgBox=document.getElementById("myPwMsg");
    showResetMsg(msgBox,"","");
    try {
        const user=await getUserByEmail(current.email);
        if (!user||user.password!==oldPw){showResetMsg(msgBox,"⚠️ Current password is incorrect.","error");return;}
        if (!newPw||newPw.length<6){showResetMsg(msgBox,"⚠️ New password must be at least 6 characters.","error");return;}
        if (newPw!==confPw){showResetMsg(msgBox,"⚠️ New passwords do not match.","error");return;}
        await updateUser(user.id,{password:newPw});
        showResetMsg(msgBox,"✅ Password changed successfully!","success");
        document.getElementById("myOldPw").value="";
        document.getElementById("myNewPw").value="";
        document.getElementById("myConfirmPw").value="";
    } catch(err){showResetMsg(msgBox,"⚠️ Error updating password. Try again.","error");}
}

// ========================
// SERVICES MANAGER
// ========================
function renderServicesManager() {
    const tbody=document.getElementById("servicesTableBody");
    if (!tbody)return;
    const services=getServices();
    tbody.innerHTML=services.map((s,i)=>`
        <tr>
            <td>${i+1}</td><td style="font-size:24px">${s.icon}</td>
            <td><strong>${s.title}</strong></td>
            <td style="font-size:13px;color:var(--gray-text);max-width:260px">${s.desc}</td>
            <td>${s.badge?`<span class="badge badge-active">${s.badge}</span>`:"—"}</td>
            <td class="action-btns">
                <button class="erp-edit-btn" onclick="openEditService(${s.id})">Edit</button>
                <button class="erp-delete-btn" onclick="deleteService(${s.id})">Remove</button>
            </td>
        </tr>`).join("");
}

function saveService() {
    const id=document.getElementById("editServiceId").value;
    const icon=document.getElementById("serviceIcon").value.trim();
    const title=document.getElementById("serviceTitle").value.trim();
    const desc=document.getElementById("serviceDesc").value.trim();
    const badge=document.getElementById("serviceBadge").value.trim();
    if (!icon||!title||!desc){alert("Icon, name and description are required.");return;}
    let services=getServices();
    if (id){
        const idx=services.findIndex(s=>s.id===Number(id));
        if (idx>-1)services[idx]={...services[idx],icon,title,desc,badge};
    } else {
        services.push({id:Date.now(),icon,title,desc,badge});
    }
    saveServices(services);
    closeModal("serviceModal");
    clearServiceForm();
    renderServicesManager();
    showToast("✅ Service saved! Now showing on your website.");
}

function openEditService(id) {
    const s=getServices().find(x=>x.id===id);
    if (!s)return;
    document.getElementById("serviceModalTitle").textContent="Edit Service";
    document.getElementById("editServiceId").value=s.id;
    document.getElementById("serviceIcon").value=s.icon;
    document.getElementById("serviceTitle").value=s.title;
    document.getElementById("serviceDesc").value=s.desc;
    document.getElementById("serviceBadge").value=s.badge||"";
    openModal("serviceModal");
}

function deleteService(id) {
    if (!confirm("Remove this service?"))return;
    saveServices(getServices().filter(s=>s.id!==id));
    renderServicesManager();
}

function clearServiceForm() {
    document.getElementById("serviceModalTitle").textContent="Add New Service";
    ["editServiceId","serviceIcon","serviceTitle","serviceDesc","serviceBadge"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
}

// ========================
// DATE
// ========================
function setDate() {
    const el=document.getElementById("erpDate");
    if (el) el.textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
}

// ========================
// INIT DASHBOARD
// ========================
if (document.getElementById("section-overview")) {
    setDate();
    applyRoleUI();
    renderOverview();
    const today=new Date().toISOString().split("T")[0];
    const sd=document.getElementById("saleDate");
    const ed=document.getElementById("expenseDate");
    if (sd)sd.value=today;
    if (ed)ed.value=today;
}

// ========================
// INVOICE SECTION INIT (called from showSection)
// ========================
function renderInvoiceSection() {
    if (typeof initInvoiceSection === "function") {
        initInvoiceSection();
    }
    // Update invoice stats
    const invoices = JSON.parse(localStorage.getItem("yt_invoices") || "[]");
    const totalBilled  = invoices.reduce((s,i) => s + Number(i.total), 0);
    const totalPaid    = invoices.filter(i => i.status === "Paid").reduce((s,i) => s + Number(i.total), 0);
    const totalPending = invoices.filter(i => i.status !== "Paid").reduce((s,i) => s + Number(i.total), 0);

    const g = id => document.getElementById(id);
    if (g("invStatTotal"))   g("invStatTotal").textContent   = invoices.length;
    if (g("invStatBilled"))  g("invStatBilled").textContent  = "₦" + totalBilled.toLocaleString("en-NG");
    if (g("invStatPaid"))    g("invStatPaid").textContent    = "₦" + totalPaid.toLocaleString("en-NG");
    if (g("invStatPending")) g("invStatPending").textContent = "₦" + totalPending.toLocaleString("en-NG");
}
