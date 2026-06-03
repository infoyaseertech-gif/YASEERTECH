// ============================================
//   YASEERTECH ERP - COMPLETE FINAL VERSION
//   - Permission-based access per user
//   - Invoices = Sales (merged)
//   - Charts, Export PDF/Excel
//   - Real-time sync + Notifications
// ============================================

const SB_URL  = "https://winlgtflhwiaraniwpts.supabase.co";
const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmxndGZsaHdpYXJhbml3cHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODUzMjUsImV4cCI6MjA5NDc2MTMyNX0.Co0PPWjMtNeIIa8GSqkulgytzhwbm33p718HsPMECKU";
const SB_REST = SB_URL + "/rest/v1";
const SB_WS   = "wss://winlgtflhwiaraniwpts.supabase.co/realtime/v1/websocket?apikey=" + SB_KEY + "&vsn=1.0.0";

// ========================
// SUPABASE HELPERS
// ========================
async function sbGet(ep) {
    const r = await fetch(SB_REST + ep, { headers:{ "apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json" }});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function sbPost(ep, data) {
    const r = await fetch(SB_REST + ep, { method:"POST", headers:{ "apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=representation" }, body:JSON.stringify(data)});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function sbPatch(ep, data) {
    const r = await fetch(SB_REST + ep, { method:"PATCH", headers:{ "apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=representation" }, body:JSON.stringify(data)});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function sbDelete(ep) {
    await fetch(SB_REST + ep, { method:"DELETE", headers:{ "apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY }});
}

// ========================
// PERMISSIONS
// ========================
const ALL_SECTIONS = [
    { key:"invoices",       label:"Invoices / Sales", icon:"🧾" },
    { key:"expenses",       label:"Expenses",          icon:"📋" },
    { key:"staff",          label:"Staff Management",  icon:"👥" },
    { key:"reports",        label:"Reports",           icon:"📈" },
    { key:"charts",         label:"Charts",            icon:"📉" },
    { key:"myprofile",      label:"My Profile",        icon:"👤" }
];
const ADMIN_SECTIONS = ["overview","invoices","expenses","staff","reports","charts","users","services","myprofile","notifications"];

function getUserPermissions(user) {
    if (!user) return ["myprofile"];
    if (user.role === "admin") return ADMIN_SECTIONS;
    try {
        const p = user.permissions ? JSON.parse(user.permissions) : [];
        return ["myprofile", ...p.filter(x => x !== "myprofile")];
    } catch(e) { return ["myprofile"]; }
}

function canAccess(section) {
    return getUserPermissions(getCurrentUser()).includes(section);
}

// ========================
// SERVICES (localStorage)
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
    localStorage.setItem("yt_current_user", JSON.stringify({
        id:user.id, name:user.name, email:user.email,
        role:user.role, permissions:user.permissions||"[]"
    }));
    localStorage.setItem("yt_logged_in","true");
}
function erpLogout() {
    localStorage.removeItem("yt_logged_in");
    localStorage.removeItem("yt_current_user");
    window.location.href = "login.html";
}
function saveData() {}

// ========================
// AUTH GUARD
// ========================
if (window.location.pathname.includes("dashboard.html")) {
    if (localStorage.getItem("yt_logged_in") !== "true") {
        window.location.href = "login.html";
    }
}

// ========================
// BUILD SIDEBAR FROM PERMISSIONS
// ========================
function buildSidebar() {
    const user  = getCurrentUser();
    const perms = getUserPermissions(user);
    const nav   = document.getElementById("erpSidebar");
    if (!nav) return;

    const allItems = [
        { key:"overview",       icon:"📊", label:"Overview" },
        { key:"invoices",       icon:"🧾", label:"Invoices / Sales" },
        { key:"expenses",       icon:"📋", label:"Expenses" },
        { key:"staff",          icon:"👥", label:"Staff" },
        { key:"reports",        icon:"📈", label:"Reports" },
        { key:"charts",         icon:"📉", label:"Charts" },
        { key:"users",          icon:"🔐", label:"Users" },
        { key:"services",       icon:"⚙️", label:"Services" },
        { key:"myprofile",      icon:"👤", label:"My Profile" },
        { key:"notifications",  icon:"🔔", label:'Notifications <span id="notifBadge" style="display:none;background:#ef4444;color:white;border-radius:50%;padding:2px 7px;font-size:11px;font-weight:700;margin-left:4px;"></span>' }
    ];

    let html = '<nav class="erp-nav">';
    allItems.forEach(item => {
        if (perms.includes(item.key)) {
            html += `<a href="#" class="erp-nav-item" onclick="showSection('${item.key}',this)">
                <span class="nav-icon">${item.icon}</span> ${item.label}
            </a>`;
        }
    });
    html += `<a href="index.html" class="erp-nav-item"><span class="nav-icon">🌐</span> Website</a></nav>`;
    nav.innerHTML = html;

    // Highlight first item
    const firstNav = nav.querySelector(".erp-nav-item");
    if (firstNav) firstNav.classList.add("active");
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
    buildSidebar();
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
        if (main) main.classList.toggle("full-width");
    }
}

// ========================
// SECTION NAVIGATION
// ========================
function showSection(name, link) {
    if (!canAccess(name)) {
        alert("You do not have permission to access this section."); return;
    }
    document.querySelectorAll(".erp-section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("section-" + name);
    if (target) target.classList.add("active");
    document.querySelectorAll(".erp-nav-item").forEach(i => i.classList.remove("active"));
    if (link) link.classList.add("active");
    const renderers = {
        overview: renderOverview, invoices: renderInvoiceSection,
        expenses: renderExpenses, staff: renderStaff,
        reports: renderReports, charts: renderCharts,
        users: renderUsers, services: renderServicesManager,
        myprofile: renderMyProfile, notifications: renderNotifications
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
function showLoading(id, cols) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<tr><td colspan="${cols}" class="empty-row">Loading...</td></tr>`;
}
function showToast(msg, type="success") {
    const t = document.createElement("div");
    t.innerHTML = msg;
    t.style.cssText = `position:fixed;top:90px;right:20px;z-index:99999;background:${type==="success"?"#10b981":type==="info"?"#3b82f6":"#ef4444"};color:white;padding:12px 20px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:320px;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ========================
// ADMIN POPUP
// ========================
function showAdminPopup(title, message, icon) {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") return;
    const ex = document.getElementById("adminPopup");
    if (ex) ex.remove();
    const popup = document.createElement("div");
    popup.id = "adminPopup";
    popup.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:18px 22px;min-width:300px;max-width:360px;border-left:5px solid #10b981;font-family:'Poppins',sans-serif;animation:slideInRight 0.4s ease;`;
    popup.innerHTML = `<style>@keyframes slideInRight{from{transform:translateX(120%);opacity:0;}to{transform:translateX(0);opacity:1;}}</style>
        <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="font-size:28px;line-height:1;">${icon}</span>
            <div style="flex:1;">
                <div style="font-weight:700;font-size:14px;color:#0A2540;margin-bottom:4px;">${title}</div>
                <div style="font-size:13px;color:#6B7280;line-height:1.5;">${message}</div>
                <div style="font-size:11px;color:#9CA3AF;margin-top:6px;">${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:18px;padding:0;">✕</button>
        </div>`;
    document.body.appendChild(popup);
    setTimeout(() => { if (popup.parentElement) popup.remove(); }, 6000);
}

// ========================
// NOTIFICATIONS
// ========================
async function saveNotification(type, title, message, icon, actorName) {
    try { await sbPost("/notifications", { type, title, message, icon, actor_name:actorName, is_read:false }); } catch(e) {}
}
async function renderNotifications() {
    const sec = document.getElementById("section-notifications");
    if (!sec) return;
    try {
        const notes  = await sbGet("/notifications?order=id.desc&limit=50");
        const unread = notes.filter(n => !n.is_read).length;
        updateNotifBadge(unread);
        sec.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="font-size:20px;font-weight:700;color:#0A2540;">🔔 Notifications</h2>
                ${unread>0?`<button onclick="markAllRead()" style="background:#0A2540;color:white;border:none;padding:8px 16px;border-radius:8px;font-family:'Poppins',sans-serif;font-size:13px;cursor:pointer;">Mark All Read</button>`:""}
            </div>
            <div>${notes.length===0?`<div style="text-align:center;padding:40px;color:#9CA3AF;">No notifications yet</div>`:notes.map(n=>`
                <div style="display:flex;align-items:flex-start;gap:14px;padding:16px;background:${n.is_read?"white":"#f0fdf4"};border-radius:12px;margin-bottom:10px;border:1px solid ${n.is_read?"#f3f4f6":"#bbf7d0"};">
                    <span style="font-size:26px;">${n.icon||"🔔"}</span>
                    <div style="flex:1;">
                        <div style="font-weight:700;font-size:14px;color:#0A2540;">${n.title}</div>
                        <div style="font-size:13px;color:#6B7280;margin-top:3px;">${n.message}</div>
                        <div style="font-size:11px;color:#9CA3AF;margin-top:5px;">${new Date(n.created_at).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    ${!n.is_read?`<span style="width:10px;height:10px;background:#10b981;border-radius:50%;display:inline-block;margin-top:4px;flex-shrink:0;"></span>`:""}
                </div>`).join("")}</div>`;
        if (unread > 0) { await sbPatch("/notifications?is_read=eq.false",{is_read:true}); updateNotifBadge(0); }
    } catch(err) { if(sec) sec.innerHTML=`<p style="color:#ef4444;padding:20px;">Error loading notifications.</p>`; }
}
async function markAllRead() {
    try { await sbPatch("/notifications?is_read=eq.false",{is_read:true}); updateNotifBadge(0); renderNotifications(); } catch(e) {}
}
function updateNotifBadge(count) {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
}
async function loadUnreadCount() {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") return;
    try { const n = await sbGet("/notifications?is_read=eq.false"); updateNotifBadge(n.length); } catch(e) {}
}

// ========================
// REAL-TIME
// ========================
let realtimeSocket = null, realtimeRef = 1;
function startRealtime() {
    if (realtimeSocket) return;
    try {
        realtimeSocket = new WebSocket(SB_WS);
        realtimeSocket.onopen = () => {
            ["invoices","expenses","staff"].forEach(table => {
                realtimeSocket.send(JSON.stringify({ topic:"realtime:public:"+table, event:"phx_join", payload:{ config:{ broadcast:{self:false}, presence:{}, postgres_changes:[{event:"*",schema:"public",table}] }}, ref:String(realtimeRef++) }));
            });
        };
        realtimeSocket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                const payload = msg.payload;
                if (!payload || !payload.data) return;
                const { table, eventType, new:newRow } = payload.data;
                const cu = getCurrentUser();
                const actorName = newRow ? (newRow.added_by || "Someone") : "Someone";
                const isSelf = cu && actorName === cu.name;
                // Refresh active section
                const active = document.querySelector(".erp-section.active");
                if (active) {
                    const id = active.id;
                    if (id==="section-invoices") renderInvoiceSection();
                    if (id==="section-expenses") renderExpenses();
                    if (id==="section-staff")    renderStaff();
                    if (id==="section-overview") renderOverview();
                    if (id==="section-reports")  renderReports();
                }
                renderOverview();
                if (cu && cu.role==="admin" && !isSelf) {
                    let icon, title, message;
                    if (table==="invoices"&&eventType==="INSERT")  { icon="🧾"; title="New Invoice Created!";  message=`${actorName} created invoice for ${newRow.client_name||"a client"}${newRow.total?" — "+fmtN(newRow.total):""}`; }
                    if (table==="expenses"&&eventType==="INSERT")  { icon="💸"; title="New Expense Added!";    message=`${actorName} recorded: ${newRow.description||"an expense"}${newRow.amount?" — "+fmtN(newRow.amount):""}`; }
                    if (table==="staff"&&eventType==="INSERT")     { icon="👤"; title="New Staff Added!";      message=`${newRow.name||"A new staff member"} was added${newRow.position?" as "+newRow.position:""}`; }
                    if (icon) { showAdminPopup(title, message, icon); loadUnreadCount(); }
                }
                if (cu && cu.role!=="admin" && !isSelf) showToast("🔄 Data updated","info");
            } catch(e) {}
        };
        realtimeSocket.onclose = () => { realtimeSocket=null; setTimeout(startRealtime,5000); };
        realtimeSocket.onerror = () => { realtimeSocket=null; };
    } catch(e) {}
}

// ========================
// FORGOT PASSWORD (login page)
// ========================
const resetStore = {};
function showView(id) {
    ["loginView","forgotView"].forEach(v=>{ const el=document.getElementById(v); if(el)el.style.display="none"; });
    const t=document.getElementById(id); if(t)t.style.display="block";
}
function sendResetCode() {
    const email=document.getElementById("forgotEmail").value.trim().toLowerCase();
    const msgBox=document.getElementById("forgotMsg");
    showResetMsg(msgBox,"","");
    if(!email){showResetMsg(msgBox,"⚠️ Please enter your email.","error");return;}
    sbGet("/users?email=eq."+encodeURIComponent(email)+"&limit=1").then(users=>{
        if(!users[0]){showResetMsg(msgBox,"⚠️ No account found with that email.","error");return;}
        const code=Math.floor(100000+Math.random()*900000).toString();
        resetStore[email]={code,expires:Date.now()+15*60*1000};
        showResetMsg(msgBox,`✅ Your reset code is:<br><div style="margin:12px 0;text-align:center;"><span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0A2540;">${code}</span></div><small style="color:#6B7280;">Valid for 15 minutes.</small>`,"success");
        document.getElementById("forgotStep2").setAttribute("data-email",email);
        setTimeout(()=>{document.getElementById("forgotStep1").style.display="none";document.getElementById("forgotStep2").style.display="block";},1500);
    }).catch(()=>showResetMsg(msgBox,"⚠️ Connection error. Try again.","error"));
}
function confirmReset() {
    const step2=document.getElementById("forgotStep2");
    const email=step2.getAttribute("data-email");
    const entered=document.getElementById("resetCode").value.trim();
    const newPw=document.getElementById("resetNewPw").value.trim();
    const confPw=document.getElementById("resetConfirmPw").value.trim();
    const msgBox=document.getElementById("resetMsg");
    showResetMsg(msgBox,"","");
    const stored=resetStore[email];
    if(!stored){showResetMsg(msgBox,"⚠️ Session expired.","error");return;}
    if(Date.now()>stored.expires){showResetMsg(msgBox,"⚠️ Code expired.","error");delete resetStore[email];return;}
    if(entered!==stored.code){showResetMsg(msgBox,"⚠️ Incorrect code.","error");return;}
    if(!newPw||newPw.length<6){showResetMsg(msgBox,"⚠️ Password must be at least 6 characters.","error");return;}
    if(newPw!==confPw){showResetMsg(msgBox,"⚠️ Passwords do not match.","error");return;}
    sbGet("/users?email=eq."+encodeURIComponent(email)+"&limit=1")
        .then(users=>{if(users[0])return sbPatch("/users?id=eq."+users[0].id,{password:newPw});})
        .then(()=>{
            delete resetStore[email];
            showResetMsg(msgBox,"✅ Password updated! Taking you to login...","success");
            setTimeout(()=>{
                [document.getElementById("forgotStep1"),document.getElementById("forgotStep2")].forEach((el,i)=>{if(el)el.style.display=i===0?"block":"none";});
                ["forgotEmail","resetCode","resetNewPw","resetConfirmPw"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
                showView("loginView");
            },2000);
        }).catch(()=>showResetMsg(msgBox,"⚠️ Connection error.","error"));
}
function showResetMsg(el,html,type){
    if(!el)return;
    if(!html){el.style.display="none";return;}
    el.innerHTML=html;el.style.display="block";
    el.style.background=type==="success"?"#d1fae5":"#fee2e2";
    el.style.border="1px solid "+(type==="success"?"#6ee7b7":"#fca5a5");
    el.style.color=type==="success"?"#065f46":"#991b1b";
    el.style.borderRadius="8px";el.style.padding="12px 16px";el.style.fontSize="14px";el.style.lineHeight="1.6";
}
function togglePw(id){const el=document.getElementById(id);if(el)el.type=el.type==="password"?"text":"password";}

// ========================
// OVERVIEW
// ========================
async function renderOverview() {
    try {
        const [staff, invoices, expenses] = await Promise.all([
            sbGet("/staff?order=id"),
            sbGet("/invoices?order=id"),
            sbGet("/expenses?order=id")
        ]);
        const tS = invoices.reduce((s,i)=>s+Number(i.total||0),0);
        const tE = expenses.reduce((s,i)=>s+Number(i.amount||0),0);
        const g  = id=>document.getElementById(id);
        if(g("totalStaff"))    g("totalStaff").textContent    = staff.length;
        if(g("totalSales"))    g("totalSales").textContent    = fmtN(tS);
        if(g("totalExpenses")) g("totalExpenses").textContent = fmtN(tE);
        if(g("netProfit"))     g("netProfit").textContent     = fmtN(tS-tE);
        const rST = g("recentSalesTable");
        const rs  = [...invoices].reverse().slice(0,5);
        if(rST) rST.innerHTML = rs.length===0 ? `<tr><td colspan="4" class="empty-row">No invoices yet</td></tr>`
            : rs.map(s=>`<tr><td>${s.client_name}</td><td>${s.number||"—"}</td><td><strong>${fmtN(s.total||0)}</strong></td><td><span class="badge ${s.status==="Paid"?"badge-active":"badge-pending"}">${s.status}</span></td></tr>`).join("");
        const rET = g("recentExpensesTable");
        const re  = [...expenses].reverse().slice(0,5);
        if(rET) rET.innerHTML = re.length===0 ? `<tr><td colspan="4" class="empty-row">No expenses yet</td></tr>`
            : re.map(e=>`<tr><td>${e.description}</td><td>${e.category}</td><td><strong>${fmtN(e.amount||0)}</strong></td><td>${e.added_by||"—"}</td></tr>`).join("");
    } catch(err) { console.error("Overview:",err); }
}

// ========================
// STAFF
// ========================
async function addStaff() {
    const user=getCurrentUser();
    const name=document.getElementById("staffName").value.trim();
    const pos=document.getElementById("staffPosition").value.trim();
    const phone=document.getElementById("staffPhone").value.trim();
    const status=document.getElementById("staffStatus").value;
    if(!name||!pos||!phone){alert("Please fill all fields.");return;}
    try {
        await sbPost("/staff",{name,position:pos,phone,status,date_added:new Date().toISOString().split("T")[0]});
        await saveNotification("staff","New Staff Added",name+" was added as "+pos,"👤",user?user.name:"Admin");
        closeModal("staffModal");
        ["staffName","staffPosition","staffPhone"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
        renderStaff(); renderOverview();
        showToast("✅ Staff added!");
    } catch(err){alert("Error adding staff.");}
}
async function deleteStaff(id) {
    if(!confirm("Remove this staff member?"))return;
    try{await sbDelete("/staff?id=eq."+id);renderStaff();renderOverview();showToast("Staff removed.");}catch(err){alert("Error.");}
}
async function renderStaff() {
    const tbody=document.getElementById("staffTableBody");
    if(!tbody)return;
    showLoading("staffTableBody",7);
    try {
        const staff=await sbGet("/staff?order=id");
        if(staff.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No staff added yet.</td></tr>`;return;}
        tbody.innerHTML=staff.map((s,i)=>`
            <tr>
                <td>${i+1}</td><td><strong>${s.name}</strong></td><td>${s.position}</td>
                <td>${s.phone}</td><td>${fmtD(s.date_added)}</td>
                <td><span class="badge ${s.status==="Active"?"badge-active":"badge-inactive"}">${s.status}</span></td>
                <td><button class="erp-delete-btn" onclick="deleteStaff(${s.id})">Remove</button></td>
            </tr>`).join("");
    } catch(err){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">Error loading staff.</td></tr>`;}
}

// ========================
// EXPENSES
// ========================
async function addExpense() {
    const user=getCurrentUser();
    const desc=document.getElementById("expenseDesc").value.trim();
    const category=document.getElementById("expenseCategory").value;
    const amount=document.getElementById("expenseAmount").value.trim();
    const date=document.getElementById("expenseDate").value;
    if(!desc||!category||!amount||!date){alert("Please fill all fields.");return;}
    try {
        await sbPost("/expenses",{description:desc,category,amount:Number(amount),date,added_by:user?user.name:"Unknown",added_role:user?user.role:"unknown"});
        await saveNotification("expense","New Expense Recorded",(user?user.name:"Staff")+" added: "+desc+" — "+fmtN(amount),"💸",user?user.name:"Staff");
        closeModal("expensesModal");
        ["expenseDesc","expenseAmount"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
        renderExpenses();renderOverview();
        showToast("✅ Expense recorded!");
    } catch(err){alert("Error saving expense.");}
}
async function deleteExpense(id) {
    const user=getCurrentUser();
    if(user.role!=="admin"){alert("Only Admin can delete.");return;}
    if(!confirm("Delete this expense?"))return;
    try{await sbDelete("/expenses?id=eq."+id);renderExpenses();renderOverview();}catch(err){alert("Error.");}
}
async function renderExpenses() {
    const tbody=document.getElementById("expensesTableBody");
    const user=getCurrentUser();
    if(!tbody)return;
    showLoading("expensesTableBody",7);
    try {
        const expenses=await sbGet("/expenses?order=id.desc");
        const total=expenses.reduce((s,i)=>s+Number(i.amount||0),0);
        const now=new Date();
        const month=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).reduce((s,i)=>s+Number(i.amount||0),0);
        const g=id=>document.getElementById(id);
        if(g("expensesTotal"))g("expensesTotal").textContent=fmtN(total);
        if(g("expensesMonth"))g("expensesMonth").textContent=fmtN(month);
        if(g("expensesCount"))g("expensesCount").textContent=expenses.length;
        if(expenses.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No expenses yet.</td></tr>`;return;}
        tbody.innerHTML=expenses.map((e,i)=>`
            <tr>
                <td>${i+1}</td><td>${fmtD(e.date)}</td><td><strong>${e.description}</strong></td><td>${e.category}</td>
                <td><strong style="color:var(--orange)">${fmtN(e.amount||0)}</strong></td>
                <td><span class="added-by-tag ${e.added_role==="admin"?"by-admin":"by-staff"}">${e.added_by||"Unknown"}</span></td>
                <td>${user&&user.role==="admin"?`<button class="erp-delete-btn" onclick="deleteExpense(${e.id})">Delete</button>`:`—`}</td>
            </tr>`).join("");
    } catch(err){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">Error loading expenses.</td></tr>`;}
}

// ========================
// REPORTS
// ========================
async function renderReports() {
    try {
        const [staff,invoices,expenses]=await Promise.all([sbGet("/staff?order=id"),sbGet("/invoices?order=id"),sbGet("/expenses?order=id")]);
        const tS=invoices.reduce((s,i)=>s+Number(i.total||0),0);
        const tE=expenses.reduce((s,i)=>s+Number(i.amount||0),0);
        const g=id=>document.getElementById(id);
        if(g("reportStaff"))    g("reportStaff").textContent    =staff.length;
        if(g("reportSales"))    g("reportSales").textContent    =fmtN(tS);
        if(g("reportExpenses")) g("reportExpenses").textContent =fmtN(tE);
        if(g("reportProfit"))   g("reportProfit").textContent   =fmtN(tS-tE);
        function buildReport(elId,list,key,amtKey){
            const el=document.getElementById(elId);if(!el)return;
            const map={};
            list.forEach(i=>{const k=i[key]||"Unknown";map[k]=(map[k]||0)+Number(i[amtKey]||0);});
            const entries=Object.entries(map);
            el.innerHTML=entries.length===0?`<p class="empty-row">No data yet</p>`:entries.sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="report-item"><strong>${k}</strong><span>${fmtN(v)}</span></div>`).join("");
        }
        buildReport("salesByService",invoices,"service","total");
        buildReport("salesByStaff",invoices,"added_by","total");
        buildReport("expensesByCategory",expenses,"category","amount");
    } catch(err){console.error("Reports:",err);}
}

// ========================
// USER MANAGEMENT
// ========================
function buildPermissionCheckboxes(selected=[]) {
    return ALL_SECTIONS.map(s=>`
        <label class="perm-checkbox">
            <input type="checkbox" name="perm" value="${s.key}" ${selected.includes(s.key)?"checked":""}>
            <span>${s.icon} ${s.label}</span>
        </label>`).join("");
}
function onRoleChange() {
    const role=document.getElementById("userRole").value;
    const box=document.getElementById("permissionsBox");
    if(box) box.style.display=role==="admin"?"none":"block";
}
async function renderUsers() {
    const tbody=document.getElementById("usersTableBody");
    if(!tbody)return;
    showLoading("usersTableBody",7);
    try {
        const users=await sbGet("/users?order=id");
        const current=getCurrentUser();
        if(users.length===0){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">No users found.</td></tr>`;return;}
        tbody.innerHTML=users.map((u,i)=>{
            const permsLabel=u.role==="admin"?"All Access":(() => {
                try{const p=JSON.parse(u.permissions||"[]");return p.length===0?"No permissions":p.map(k=>{const s=ALL_SECTIONS.find(x=>x.key===k);return s?s.icon+" "+s.label:k;}).join(", ");}catch(e){return"—";}
            })();
            return `<tr>
                <td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.email}</td>
                <td><span class="badge ${u.role==="admin"?"badge-active":"badge-staff"}">${u.role==="admin"?"Admin":"Staff"}</span></td>
                <td style="font-size:12px;color:var(--gray-text);max-width:180px">${permsLabel}</td>
                <td><span class="badge ${u.status==="active"?"badge-active":"badge-inactive"}">${u.status==="active"?"Active":"Inactive"}</span></td>
                <td class="action-btns">
                    <button class="erp-edit-btn" onclick="openEditUser(${u.id})">Edit</button>
                    <button class="erp-pw-btn"   onclick="openChangePw(${u.id})">Change PW</button>
                    ${u.id===current.id?`<span style="font-size:11px;color:var(--gray-text)">You</span>`:`<button class="erp-delete-btn" onclick="deleteUser(${u.id})">Delete</button>`}
                </td>
            </tr>`;
        }).join("");
    } catch(err){tbody.innerHTML=`<tr><td colspan="7" class="empty-row">Error loading users.</td></tr>`;}
}
async function saveUser() {
    const id=document.getElementById("editUserId").value;
    const name=document.getElementById("userName").value.trim();
    const email=document.getElementById("userEmail").value.trim().toLowerCase();
    const pw=document.getElementById("userPassword").value.trim();
    const pwC=document.getElementById("userPasswordConfirm").value.trim();
    const role=document.getElementById("userRole").value;
    const status=document.getElementById("userStatus").value;
    const perms=[];
    document.querySelectorAll('input[name="perm"]:checked').forEach(cb=>perms.push(cb.value));
    const permissions=JSON.stringify(perms);
    if(!name||!email){alert("Name and email are required.");return;}
    try {
        if(id){
            const data={name,email,role,status,permissions};
            if(pw){if(pw!==pwC){alert("Passwords do not match.");return;}if(pw.length<6){alert("Min 6 characters.");return;}data.password=pw;}
            await sbPatch("/users?id=eq."+Number(id),data);showToast("✅ User updated!");
        } else {
            if(!pw){alert("Password is required.");return;}
            if(pw!==pwC){alert("Passwords do not match.");return;}
            if(pw.length<6){alert("Min 6 characters.");return;}
            const ex=await sbGet("/users?email=eq."+encodeURIComponent(email)+"&limit=1");
            if(ex.length>0){alert("Email already registered.");return;}
            await sbPost("/users",{name,email,password:pw,role,status,permissions});
            showToast("✅ User created! They can login from any device.");
        }
        closeModal("userModal");clearUserForm();renderUsers();
    } catch(err){alert("Error saving user.");}
}
async function openEditUser(id) {
    try {
        const users=await sbGet("/users?id=eq."+id+"&limit=1");
        const u=users[0];if(!u)return;
        document.getElementById("userModalTitle").textContent="Edit User";
        document.getElementById("editUserId").value=u.id;
        document.getElementById("userName").value=u.name;
        document.getElementById("userEmail").value=u.email;
        document.getElementById("userPassword").value="";
        document.getElementById("userPasswordConfirm").value="";
        document.getElementById("userRole").value=u.role;
        document.getElementById("userStatus").value=u.status;
        let sel=[];try{sel=JSON.parse(u.permissions||"[]");}catch(e){}
        const pc=document.getElementById("permissionsCheckboxes");
        if(pc)pc.innerHTML=buildPermissionCheckboxes(sel);
        onRoleChange();
        openModal("userModal");
    } catch(err){alert("Error loading user.");}
}
async function deleteUser(id) {
    const current=getCurrentUser();
    if(id===current.id){alert("You cannot delete your own account.");return;}
    if(!confirm("Delete this user?"))return;
    try{await sbDelete("/users?id=eq."+id);showToast("✅ User deleted.");renderUsers();}catch(err){alert("Error.");}
}
async function openChangePw(id) {
    try {
        const users=await sbGet("/users?id=eq."+id+"&limit=1");
        const u=users[0];if(!u)return;
        document.getElementById("pwUserId").value=id;
        document.getElementById("pwUserLabel").textContent="Changing password for: "+u.name+" ("+u.email+")";
        document.getElementById("newPassword").value="";
        document.getElementById("newPasswordConfirm").value="";
        openModal("pwModal");
    } catch(err){alert("Error.");}
}
async function changePassword() {
    const id=document.getElementById("pwUserId").value;
    const pw=document.getElementById("newPassword").value.trim();
    const pwC=document.getElementById("newPasswordConfirm").value.trim();
    if(!pw||pw.length<6){alert("Min 6 characters.");return;}
    if(pw!==pwC){alert("Passwords do not match.");return;}
    try{await sbPatch("/users?id=eq."+id,{password:pw});closeModal("pwModal");showToast("✅ Password updated!");}catch(err){alert("Error.");}
}
function clearUserForm() {
    document.getElementById("userModalTitle").textContent="Add New User";
    ["editUserId","userName","userEmail","userPassword","userPasswordConfirm"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
    const r=document.getElementById("userRole");if(r){r.value="staff";}
    const s=document.getElementById("userStatus");if(s)s.value="active";
    const pc=document.getElementById("permissionsCheckboxes");
    if(pc)pc.innerHTML=buildPermissionCheckboxes([]);
    onRoleChange();
}

// ========================
// MY PROFILE
// ========================
function renderMyProfile() {
    const user=getCurrentUser();if(!user)return;
    const el=document.getElementById("profileInfo");
    if(el)el.innerHTML=`
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
    function showMsg(html,type){msgBox.innerHTML=html;msgBox.style.display="block";msgBox.style.background=type==="success"?"#d1fae5":"#fee2e2";msgBox.style.border="1px solid "+(type==="success"?"#6ee7b7":"#fca5a5");msgBox.style.color=type==="success"?"#065f46":"#991b1b";msgBox.style.borderRadius="8px";msgBox.style.padding="12px 16px";msgBox.style.fontSize="14px";}
    msgBox.style.display="none";
    try {
        const users=await sbGet("/users?id=eq."+current.id+"&limit=1");
        const user=users[0];
        if(!user||user.password!==oldPw){showMsg("⚠️ Current password is incorrect.","error");return;}
        if(!newPw||newPw.length<6){showMsg("⚠️ Min 6 characters.","error");return;}
        if(newPw!==confPw){showMsg("⚠️ Passwords do not match.","error");return;}
        await sbPatch("/users?id=eq."+current.id,{password:newPw});
        showMsg("✅ Password changed!","success");
        ["myOldPw","myNewPw","myConfirmPw"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
    } catch(err){showMsg("⚠️ Error. Try again.","error");}
}

// ========================
// SERVICES MANAGER
// ========================
function renderServicesManager() {
    const tbody=document.getElementById("servicesTableBody");if(!tbody)return;
    const services=getServices();
    tbody.innerHTML=services.map((s,i)=>`
        <tr>
            <td>${i+1}</td><td style="font-size:24px">${s.icon}</td>
            <td><strong>${s.title}</strong></td>
            <td style="font-size:13px;color:var(--gray-text);max-width:260px">${s.desc}</td>
            <td>${s.badge?`<span class="badge badge-active">${s.badge}</span>`:"—"}</td>
            <td class="action-btns">
                <button class="erp-edit-btn"   onclick="openEditService(${s.id})">Edit</button>
                <button class="erp-delete-btn" onclick="deleteService(${s.id})">Remove</button>
            </td>
        </tr>`).join("");
}
function saveService(){const id=document.getElementById("editServiceId").value;const icon=document.getElementById("serviceIcon").value.trim();const title=document.getElementById("serviceTitle").value.trim();const desc=document.getElementById("serviceDesc").value.trim();const badge=document.getElementById("serviceBadge").value.trim();if(!icon||!title||!desc){alert("Icon, name and description required.");return;}let services=getServices();if(id){const idx=services.findIndex(s=>s.id===Number(id));if(idx>-1)services[idx]={...services[idx],icon,title,desc,badge};}else{services.push({id:Date.now(),icon,title,desc,badge});}saveServices(services);closeModal("serviceModal");clearServiceForm();renderServicesManager();showToast("✅ Service saved!");}
function openEditService(id){const s=getServices().find(x=>x.id===id);if(!s)return;document.getElementById("serviceModalTitle").textContent="Edit Service";document.getElementById("editServiceId").value=s.id;document.getElementById("serviceIcon").value=s.icon;document.getElementById("serviceTitle").value=s.title;document.getElementById("serviceDesc").value=s.desc;document.getElementById("serviceBadge").value=s.badge||"";openModal("serviceModal");}
function deleteService(id){if(!confirm("Remove?"))return;saveServices(getServices().filter(s=>s.id!==id));renderServicesManager();}
function clearServiceForm(){document.getElementById("serviceModalTitle").textContent="Add New Service";["editServiceId","serviceIcon","serviceTitle","serviceDesc","serviceBadge"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});}

// ========================
// INVOICE SECTION WRAPPER
// ========================
async function renderInvoiceSection() {
    if(typeof initInvoiceSection==="function") initInvoiceSection();
    try {
        const invoices=await sbGet("/invoices?order=id.desc");
        const total  =invoices.reduce((s,i)=>s+Number(i.total||0),0);
        const paid   =invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+Number(i.total||0),0);
        const pending=invoices.filter(i=>i.status!=="Paid").reduce((s,i)=>s+Number(i.total||0),0);
        const g=id=>document.getElementById(id);
        if(g("invStatTotal"))  g("invStatTotal").textContent  =invoices.length;
        if(g("invStatBilled")) g("invStatBilled").textContent =fmtN(total);
        if(g("invStatPaid"))   g("invStatPaid").textContent   =fmtN(paid);
        if(g("invStatPending"))g("invStatPending").textContent=fmtN(pending);
    } catch(err){console.error(err);}
}

// ========================
// CHARTS
// ========================
let chartInstances={};
function destroyChart(id){if(chartInstances[id]){chartInstances[id].destroy();delete chartInstances[id];}}
function getLast6Months(){const months=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({label:d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),month:d.getMonth(),year:d.getFullYear()});}return months;}

async function renderCharts() {
    try {
        const [invoices,expenses]=await Promise.all([sbGet("/invoices?order=id"),sbGet("/expenses?order=id")]);
        renderSalesTrendChart(invoices);
        renderRevenueExpensesChart(invoices,expenses);
        renderExpensesPieChart(expenses);
        renderSalesByServiceChart(invoices);
    } catch(err){console.error("Charts:",err);}
}
function renderSalesTrendChart(invoices){
    destroyChart("salesTrendChart");
    const months=getLast6Months();
    const data=months.map(m=>invoices.filter(s=>{const d=new Date(s.date);return d.getMonth()===m.month&&d.getFullYear()===m.year;}).reduce((sum,s)=>sum+Number(s.total||0),0));
    const ctx=document.getElementById("salesTrendChart");if(!ctx)return;
    chartInstances["salesTrendChart"]=new Chart(ctx,{type:"line",data:{labels:months.map(m=>m.label),datasets:[{label:"Revenue (₦)",data,borderColor:"#10b981",backgroundColor:"rgba(16,185,129,0.1)",borderWidth:3,pointBackgroundColor:"#10b981",pointRadius:5,tension:0.4,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>"₦"+v.toLocaleString("en-NG")}}}}});
}
function renderRevenueExpensesChart(invoices,expenses){
    destroyChart("revenueExpensesChart");
    const months=getLast6Months();
    const salesData=months.map(m=>invoices.filter(s=>{const d=new Date(s.date);return d.getMonth()===m.month&&d.getFullYear()===m.year;}).reduce((sum,s)=>sum+Number(s.total||0),0));
    const expData=months.map(m=>expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===m.month&&d.getFullYear()===m.year;}).reduce((sum,e)=>sum+Number(e.amount||0),0));
    const ctx=document.getElementById("revenueExpensesChart");if(!ctx)return;
    chartInstances["revenueExpensesChart"]=new Chart(ctx,{type:"bar",data:{labels:months.map(m=>m.label),datasets:[{label:"Revenue",data:salesData,backgroundColor:"rgba(16,185,129,0.8)",borderRadius:6},{label:"Expenses",data:expData,backgroundColor:"rgba(249,115,22,0.8)",borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,ticks:{callback:v=>"₦"+v.toLocaleString("en-NG")}}}}});
}
function renderExpensesPieChart(expenses){
    destroyChart("expensesPieChart");
    const map={};expenses.forEach(e=>{const k=e.category||"Other";map[k]=(map[k]||0)+Number(e.amount||0);});
    const labels=Object.keys(map);const data=Object.values(map);
    const colors=["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316","#84cc16"];
    const ctx=document.getElementById("expensesPieChart");if(!ctx)return;
    if(labels.length===0){ctx.parentElement.innerHTML=`<div style="text-align:center;padding:60px;color:#9CA3AF;font-family:Poppins,sans-serif;">No expense data yet</div>`;return;}
    chartInstances["expensesPieChart"]=new Chart(ctx,{type:"doughnut",data:{labels,datasets:[{data,backgroundColor:colors.slice(0,labels.length),borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{family:"Poppins",size:11}}}}}});
}
function renderSalesByServiceChart(invoices){
    destroyChart("salesByServiceChart");
    const map={};invoices.forEach(s=>{const k=s.service||"Other";map[k]=(map[k]||0)+Number(s.total||0);});
    const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]);
    const labels=sorted.map(x=>x[0]);const data=sorted.map(x=>x[1]);
    const colors=["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#ec4899","#8b5cf6"];
    const ctx=document.getElementById("salesByServiceChart");if(!ctx)return;
    if(labels.length===0){ctx.parentElement.innerHTML=`<div style="text-align:center;padding:60px;color:#9CA3AF;font-family:Poppins,sans-serif;">No revenue data yet</div>`;return;}
    chartInstances["salesByServiceChart"]=new Chart(ctx,{type:"bar",data:{labels,datasets:[{label:"Revenue by Service (₦)",data,backgroundColor:colors.slice(0,labels.length),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>"₦"+v.toLocaleString("en-NG")}}}}});
}

// ========================
// EXPORT PDF / EXCEL
// ========================
async function exportSalesPDF(){
    try{
        const invoices=await sbGet("/invoices?order=id.desc");
        if(invoices.length===0){showToast("No data to export.","error");return;}
        const{jsPDF}=window.jspdf;const doc=new jsPDF();
        doc.setFillColor(10,37,64);doc.rect(0,0,220,30,"F");
        doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(18);doc.text("YaseerTech ERP",14,13);
        doc.setFontSize(11);doc.setFont("helvetica","normal");doc.text("Revenue / Invoices Report",14,22);doc.text("Generated: "+new Date().toLocaleDateString("en-GB"),130,22);
        const total=invoices.reduce((s,i)=>s+Number(i.total||0),0);
        doc.setTextColor(0,0,0);doc.setFontSize(11);doc.setFont("helvetica","bold");
        doc.text("Total Revenue: \u20a6"+total.toLocaleString("en-NG"),14,42);doc.text("Total Records: "+invoices.length,14,50);
        doc.autoTable({startY:58,head:[["#","Invoice#","Client","Service","Amount (₦)","Status","By"]],body:invoices.map((s,i)=>[i+1,s.number||"—",s.client_name,s.service||"—",Number(s.total||0).toLocaleString("en-NG"),s.status,s.added_by||"—"]),headStyles:{fillColor:[10,37,64],textColor:255,fontStyle:"bold"},alternateRowStyles:{fillColor:[245,247,250]},styles:{fontSize:10}});
        doc.save("YaseerTech_Revenue_"+new Date().toISOString().split("T")[0]+".pdf");
        showToast("✅ PDF downloaded!");
    }catch(err){showToast("Error generating PDF.","error");}
}
async function exportSalesExcel(){
    try{
        const invoices=await sbGet("/invoices?order=id.desc");
        if(invoices.length===0){showToast("No data to export.","error");return;}
        const rows=invoices.map((s,i)=({"#":i+1,"Invoice#":s.number||"—","Client":s.client_name,"Service":s.service||"—","Amount (₦)":Number(s.total||0),"Status":s.status,"Added By":s.added_by||"—"}));
        rows.push({});rows.push({"Client":"TOTAL","Amount (₦)":invoices.reduce((s,i)=>s+Number(i.total||0),0)});
        const ws=XLSX.utils.json_to_sheet(rows);ws["!cols"]=[{wch:4},{wch:10},{wch:22},{wch:20},{wch:14},{wch:10},{wch:16}];
        const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Revenue");
        XLSX.writeFile(wb,"YaseerTech_Revenue_"+new Date().toISOString().split("T")[0]+".xlsx");
        showToast("✅ Excel downloaded!");
    }catch(err){showToast("Error generating Excel.","error");}
}
async function exportExpensesPDF(){
    try{
        const expenses=await sbGet("/expenses?order=id.desc");
        if(expenses.length===0){showToast("No data to export.","error");return;}
        const{jsPDF}=window.jspdf;const doc=new jsPDF();
        doc.setFillColor(10,37,64);doc.rect(0,0,220,30,"F");
        doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(18);doc.text("YaseerTech ERP",14,13);
        doc.setFontSize(11);doc.setFont("helvetica","normal");doc.text("Expenses Report",14,22);doc.text("Generated: "+new Date().toLocaleDateString("en-GB"),150,22);
        const total=expenses.reduce((s,i)=>s+Number(i.amount||0),0);
        doc.setTextColor(0,0,0);doc.setFontSize(11);doc.setFont("helvetica","bold");
        doc.text("Total Expenses: \u20a6"+total.toLocaleString("en-NG"),14,42);doc.text("Total Records: "+expenses.length,14,50);
        doc.autoTable({startY:58,head:[["#","Date","Description","Category","Amount (₦)","Added By"]],body:expenses.map((e,i)=>[i+1,e.date?new Date(e.date).toLocaleDateString("en-GB"):"—",e.description,e.category,Number(e.amount||0).toLocaleString("en-NG"),e.added_by||"—"]),headStyles:{fillColor:[10,37,64],textColor:255,fontStyle:"bold"},alternateRowStyles:{fillColor:[245,247,250]},styles:{fontSize:10}});
        doc.save("YaseerTech_Expenses_"+new Date().toISOString().split("T")[0]+".pdf");
        showToast("✅ PDF downloaded!");
    }catch(err){showToast("Error generating PDF.","error");}
}
async function exportExpensesExcel(){
    try{
        const expenses=await sbGet("/expenses?order=id.desc");
        if(expenses.length===0){showToast("No data to export.","error");return;}
        const rows=expenses.map((e,i)=({"#":i+1,"Date":e.date?new Date(e.date).toLocaleDateString("en-GB"):"—","Description":e.description,"Category":e.category,"Amount (₦)":Number(e.amount||0),"Added By":e.added_by||"—"}));
        rows.push({});rows.push({"Description":"TOTAL","Amount (₦)":expenses.reduce((s,i)=>s+Number(i.amount||0),0)});
        const ws=XLSX.utils.json_to_sheet(rows);ws["!cols"]=[{wch:4},{wch:12},{wch:26},{wch:18},{wch:14},{wch:16}];
        const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Expenses");
        XLSX.writeFile(wb,"YaseerTech_Expenses_"+new Date().toISOString().split("T")[0]+".xlsx");
        showToast("✅ Excel downloaded!");
    }catch(err){showToast("Error generating Excel.","error");}
}

// ========================
// DATE + INIT
// ========================
function setDate(){const el=document.getElementById("erpDate");if(el)el.textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});}

if (document.getElementById("section-overview")) {
    setDate();
    applyRoleUI();
    // Show first permitted section
    const user=getCurrentUser();
    const perms=getUserPermissions(user);
    const first=perms[0]||"myprofile";
    document.querySelectorAll(".erp-section").forEach(s=>s.classList.remove("active"));
    const firstSec=document.getElementById("section-"+first);
    if(firstSec) firstSec.classList.add("active");
    // Render first section
    const initRender={overview:renderOverview,invoices:renderInvoiceSection,expenses:renderExpenses,staff:renderStaff,reports:renderReports,charts:renderCharts,myprofile:renderMyProfile};
    if(initRender[first]) initRender[first]();
    // Set dates
    const ed=document.getElementById("expenseDate");
    if(ed) ed.value=new Date().toISOString().split("T")[0];
    // Load notifications badge + start realtime
    loadUnreadCount();
    startRealtime();
    // Refresh every 30s
    setInterval(()=>{
        const active=document.querySelector(".erp-section.active");
        if(active){
            const id=active.id;
            if(id==="section-invoices") renderInvoiceSection();
            if(id==="section-expenses") renderExpenses();
            if(id==="section-staff")    renderStaff();
            if(id==="section-overview") renderOverview();
            if(id==="section-reports")  renderReports();
        }
        loadUnreadCount();
    },30000);
}
