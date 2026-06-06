// ============================================================
//   YASEERTECH ERP — SUPABASE CLOUD VERSION (COMPLETE)
//   All data: Supabase. No localStorage. No Firebase.
// ============================================================

const SUPABASE_URL = "https://winlgtflhwiaraniwpts.supabase.co";
const SUPABASE_KEY = "sb_publishable_YFngUdJcVv7uXby3US4Nbg_7OQCs3ok";
const API = `${SUPABASE_URL}/rest/v1`;

// ── Supabase fetch helper ──────────────────────────────────
async function sb(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
      ...(opts.headers || {})
    }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : [];
}

// ── Session (sessionStorage only — cleared when browser closes) ──
function getSession() {
  const s = sessionStorage.getItem("yt_session");
  return s ? JSON.parse(s) : null;
}
function setSession(user) {
  sessionStorage.setItem("yt_session", JSON.stringify(user));
}
function clearSession() {
  sessionStorage.removeItem("yt_session");
}

// ── Current invoice being edited ──
let editingInvoiceId = null;
let editingStaffId = null;
let invoiceItems = [];
let allInvoices = [];
let allExpenses = [];
let allStaff = [];
let allUsers = [];
let allNotifications = [];

// ============================================================
//   INIT
// ============================================================
window.addEventListener("DOMContentLoaded", async () => {
  const user = getSession();
  if (!user) { window.location.href = "login.html"; return; }
  renderSidebar(user);
  renderTopBar(user);
  await loadOverview(user);
  showSection("overview");
});

// ============================================================
//   SIDEBAR
// ============================================================
function renderSidebar(user) {
  const perms = user.role === "admin"
    ? ["overview","invoices","expenses","staff","reports","users","profile"]
    : ["overview", ...(user.permissions || []), "profile"];

  const icons = {
    overview: "fas fa-tachometer-alt", invoices: "fas fa-file-invoice",
    expenses: "fas fa-receipt", staff: "fas fa-users",
    reports: "fas fa-chart-bar", users: "fas fa-user-cog", profile: "fas fa-user-circle"
  };
  const labels = {
    overview: "Overview", invoices: "Invoices & Sales", expenses: "Expenses",
    staff: "Staff", reports: "Reports", users: "Users", profile: "My Profile"
  };

  document.getElementById("sidebarNav").innerHTML = perms.map(p => `
    <a class="nav-link" id="nav-${p}" onclick="showSection('${p}')">
      <i class="${icons[p]}"></i> ${labels[p]}
    </a>`).join("");

  document.getElementById("sidebarUser").innerHTML = `
    <i class="fas fa-user-circle"></i>
    <div><strong>${user.name}</strong><small>${user.role}</small></div>`;
}

function renderTopBar(user) {
  document.getElementById("topUser").textContent = user.name;
}

function showSection(name) {
  document.querySelectorAll(".erp-section").forEach(s => s.style.display = "none");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const sec = document.getElementById(`sec-${name}`);
  const nav = document.getElementById(`nav-${name}`);
  if (sec) sec.style.display = "block";
  if (nav) nav.classList.add("active");

  const user = getSession();
  if (name === "overview") loadOverview(user);
  if (name === "invoices") loadInvoices();
  if (name === "expenses") loadExpenses();
  if (name === "staff") loadStaff();
  if (name === "reports") loadReports();
  if (name === "users") loadUsers();
  if (name === "profile") loadProfile(user);

  // Close sidebar on mobile
  if (window.innerWidth < 768) document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// ============================================================
//   OVERVIEW
// ============================================================
async function loadOverview(user) {
  try {
    const [invoices, expenses] = await Promise.all([
      sb("/invoices?order=created_at.desc"),
      sb("/expenses?order=created_at.desc")
    ]);
    allInvoices = invoices;
    allExpenses = expenses;

    const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + (i.total || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    document.getElementById("overviewStats").innerHTML = `
      ${statCard("Total Revenue", "₦" + fmt(totalRevenue), "fas fa-naira-sign", "green")}
      ${statCard("Pending", "₦" + fmt(pendingRevenue), "fas fa-clock", "orange")}
      ${statCard("Total Expenses", "₦" + fmt(totalExpenses), "fas fa-receipt", "red")}
      ${statCard("Net Profit", "₦" + fmt(netProfit), "fas fa-chart-line", netProfit >= 0 ? "blue" : "red")}`;

    renderRevenueChart(invoices, expenses);

    const recentHtml = invoices.slice(0, 5).map(inv => `
      <div class="recent-row">
        <span>${inv.number || "—"}</span>
        <span>${inv.client_name || "—"}</span>
        <span>₦${fmt(inv.total)}</span>
        <span class="badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-orange'}">${inv.status}</span>
      </div>`).join("") || "<p class='empty-msg'>No invoices yet</p>";
    document.getElementById("recentInvoices").innerHTML = recentHtml;

    await loadNotifications();
  } catch (e) { showToast("Error loading overview: " + e.message, "error"); }
}

function statCard(label, value, icon, color) {
  return `<div class="stat-card stat-${color}">
    <div class="stat-icon"><i class="${icon}"></i></div>
    <div class="stat-info"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
  </div>`;
}

// ============================================================
//   CHARTS
// ============================================================
let chartInstances = {};
function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function renderRevenueChart(invoices, expenses) {
  const months = getLast6Months();
  const revenueData = months.map(m => invoices.filter(i => i.status === "Paid" && monthOf(i.date) === m).reduce((s, i) => s + (i.total || 0), 0));
  const expenseData = months.map(m => expenses.filter(e => monthOf(e.date) === m).reduce((s, e) => s + (e.amount || 0), 0));

  destroyChart("revenueChart");
  const ctx1 = document.getElementById("revenueChart");
  if (ctx1) {
    chartInstances["revenueChart"] = new Chart(ctx1, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          { label: "Revenue (₦)", data: revenueData, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.1)", tension: 0.4, fill: true },
          { label: "Expenses (₦)", data: expenseData, borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", tension: 0.4, fill: true }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: "Revenue vs Expenses (6 months)" } } }
    });
  }
}

function loadReports() {
  const invoices = allInvoices;
  const expenses = allExpenses;

  const totalRev = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalPending = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + (i.total || 0), 0);
  const totalInv = invoices.length;

  document.getElementById("reportStats").innerHTML = `
    ${statCard("Total Invoices", totalInv, "fas fa-file-invoice", "blue")}
    ${statCard("Revenue Collected", "₦" + fmt(totalRev), "fas fa-check-circle", "green")}
    ${statCard("Total Expenses", "₦" + fmt(totalExp), "fas fa-receipt", "red")}
    ${statCard("Net Profit", "₦" + fmt(totalRev - totalExp), "fas fa-chart-line", totalRev - totalExp >= 0 ? "blue" : "red")}`;

  // Sales by service
  const serviceMap = {};
  invoices.forEach(i => { if (i.service) serviceMap[i.service] = (serviceMap[i.service] || 0) + (i.total || 0); });
  destroyChart("salesByServiceChart");
  const ctx2 = document.getElementById("salesByServiceChart");
  if (ctx2 && Object.keys(serviceMap).length) {
    chartInstances["salesByServiceChart"] = new Chart(ctx2, {
      type: "bar",
      data: { labels: Object.keys(serviceMap), datasets: [{ label: "Revenue (₦)", data: Object.values(serviceMap), backgroundColor: ["#2563eb","#f97316","#10b981","#8b5cf6","#ef4444","#06b6d4"] }] },
      options: { responsive: true, plugins: { title: { display: true, text: "Revenue by Service" } } }
    });
  }

  // Expenses by category
  const catMap = {};
  expenses.forEach(e => { if (e.category) catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0); });
  destroyChart("expByCatChart");
  const ctx3 = document.getElementById("expByCatChart");
  if (ctx3 && Object.keys(catMap).length) {
    chartInstances["expByCatChart"] = new Chart(ctx3, {
      type: "doughnut",
      data: { labels: Object.keys(catMap), datasets: [{ data: Object.values(catMap), backgroundColor: ["#2563eb","#f97316","#10b981","#8b5cf6","#ef4444","#06b6d4","#fbbf24"] }] },
      options: { responsive: true, plugins: { title: { display: true, text: "Expenses by Category" } } }
    });
  }

  // Monthly trend
  const months = getLast6Months();
  const mRev = months.map(m => invoices.filter(i => i.status === "Paid" && monthOf(i.date) === m).reduce((s, i) => s + (i.total || 0), 0));
  const mExp = months.map(m => expenses.filter(e => monthOf(e.date) === m).reduce((s, e) => s + (e.amount || 0), 0));
  destroyChart("monthlyTrendChart");
  const ctx4 = document.getElementById("monthlyTrendChart");
  if (ctx4) {
    chartInstances["monthlyTrendChart"] = new Chart(ctx4, {
      type: "line",
      data: { labels: months, datasets: [
        { label: "Revenue", data: mRev, borderColor: "#10b981", tension: 0.4 },
        { label: "Expenses", data: mExp, borderColor: "#ef4444", tension: 0.4 }
      ]},
      options: { responsive: true, plugins: { title: { display: true, text: "Monthly Trend" } } }
    });
  }

  // Revenue vs Expenses bar
  destroyChart("revenueVsExpChart");
  const ctx5 = document.getElementById("revenueVsExpChart");
  if (ctx5) {
    chartInstances["revenueVsExpChart"] = new Chart(ctx5, {
      type: "bar",
      data: { labels: months, datasets: [
        { label: "Revenue", data: mRev, backgroundColor: "rgba(37,99,235,0.7)" },
        { label: "Expenses", data: mExp, backgroundColor: "rgba(239,68,68,0.7)" }
      ]},
      options: { responsive: true, plugins: { title: { display: true, text: "Revenue vs Expenses" } } }
    });
  }
}

// ============================================================
//   INVOICES / SALES
// ============================================================
async function loadInvoices() {
  try {
    allInvoices = await sb("/invoices?order=created_at.desc");
    renderInvoiceTable(allInvoices);
    const paid = allInvoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);
    const pending = allInvoices.filter(i => i.status === "Pending").reduce((s, i) => s + (i.total || 0), 0);
    document.getElementById("invoiceStats").innerHTML = `
      ${statCard("Total Invoices", allInvoices.length, "fas fa-file-invoice", "blue")}
      ${statCard("Paid", "₦" + fmt(paid), "fas fa-check-circle", "green")}
      ${statCard("Pending", "₦" + fmt(pending), "fas fa-clock", "orange")}
      ${statCard("Total Billed", "₦" + fmt(paid + pending), "fas fa-naira-sign", "blue")}`;
  } catch (e) { showToast("Error loading invoices: " + e.message, "error"); }
}

function renderInvoiceTable(data) {
  document.getElementById("invoiceBody").innerHTML = data.length
    ? data.map(inv => `
      <tr>
        <td>${inv.number || "—"}</td>
        <td>${inv.client_name || "—"}</td>
        <td>${inv.service || "—"}</td>
        <td>₦${fmt(inv.total)}</td>
        <td>${inv.date || "—"}</td>
        <td><span class="badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-orange'}">${inv.status}</span></td>
        <td>${inv.added_by || "—"}</td>
        <td class="actions">
          <button class="btn-icon btn-view" onclick='viewInvoice(${JSON.stringify(inv)})'><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" onclick="editInvoice(${inv.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon ${inv.status === 'Paid' ? 'btn-orange' : 'btn-green'}" onclick="toggleInvoiceStatus(${inv.id},'${inv.status}')">
            <i class="fas fa-${inv.status === 'Paid' ? 'undo' : 'check'}"></i>
          </button>
          ${getSession().role === 'admin' ? `<button class="btn-icon btn-delete" onclick="deleteInvoice(${inv.id})"><i class="fas fa-trash"></i></button>` : ''}
        </td>
      </tr>`).join("")
    : `<tr><td colspan="8" class="empty-msg">No invoices yet. Create your first invoice!</td></tr>`;
}

function filterInvoices() {
  const q = document.getElementById("invoiceSearch").value.toLowerCase();
  const st = document.getElementById("invoiceStatusFilter").value;
  const filtered = allInvoices.filter(i =>
    (!q || (i.client_name||"").toLowerCase().includes(q) || (i.number||"").toLowerCase().includes(q) || (i.service||"").toLowerCase().includes(q)) &&
    (!st || i.status === st)
  );
  renderInvoiceTable(filtered);
}

function openInvoiceModal(id = null) {
  editingInvoiceId = id;
  invoiceItems = [];
  document.getElementById("inv_client").value = "";
  document.getElementById("inv_email").value = "";
  document.getElementById("inv_phone").value = "";
  document.getElementById("inv_service").value = "";
  document.getElementById("inv_tax").value = "0";
  document.getElementById("inv_notes").value = "";
  document.getElementById("inv_date").value = today();
  document.getElementById("inv_due").value = "";
  document.getElementById("invoiceModalTitle").textContent = id ? "Edit Invoice" : "New Invoice";
  addInvoiceItem();
  calcInvoiceTotals();
  openModal("invoiceModal");
}

async function editInvoice(id) {
  const inv = allInvoices.find(i => i.id === id);
  if (!inv) return;
  editingInvoiceId = id;
  document.getElementById("inv_client").value = inv.client_name || "";
  document.getElementById("inv_email").value = inv.client_email || "";
  document.getElementById("inv_phone").value = inv.client_phone || "";
  document.getElementById("inv_service").value = inv.service || "";
  document.getElementById("inv_date").value = inv.date || today();
  document.getElementById("inv_due").value = inv.due_date || "";
  document.getElementById("inv_tax").value = inv.tax_rate || 0;
  document.getElementById("inv_notes").value = inv.notes || "";
  document.getElementById("invoiceModalTitle").textContent = "Edit Invoice";
  invoiceItems = inv.items ? (typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items) : [];
  renderInvoiceItems();
  calcInvoiceTotals();
  openModal("invoiceModal");
}

function addInvoiceItem() {
  invoiceItems.push({ desc: "", qty: 1, price: 0 });
  renderInvoiceItems();
}

function renderInvoiceItems() {
  document.getElementById("invoiceItems").innerHTML = invoiceItems.map((item, i) => `
    <div class="item-row">
      <input type="text" placeholder="Description" value="${item.desc}" oninput="updateItem(${i},'desc',this.value)"/>
      <input type="number" placeholder="Qty" value="${item.qty}" min="1" oninput="updateItem(${i},'qty',this.value)" style="width:80px"/>
      <input type="number" placeholder="Price" value="${item.price}" min="0" oninput="updateItem(${i},'price',this.value)" style="width:130px"/>
      <span class="item-total">₦${fmt(item.qty * item.price)}</span>
      <button class="btn-remove-item" onclick="removeItem(${i})"><i class="fas fa-times"></i></button>
    </div>`).join("");
}

function updateItem(i, field, val) {
  invoiceItems[i][field] = field === "desc" ? val : parseFloat(val) || 0;
  calcInvoiceTotals();
  // update total display inline
  document.querySelectorAll(".item-total")[i].textContent = "₦" + fmt(invoiceItems[i].qty * invoiceItems[i].price);
}

function removeItem(i) {
  invoiceItems.splice(i, 1);
  renderInvoiceItems();
  calcInvoiceTotals();
}

function calcInvoiceTotals() {
  const subtotal = invoiceItems.reduce((s, it) => s + (it.qty * it.price), 0);
  const taxRate = parseFloat(document.getElementById("inv_tax")?.value) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  if (document.getElementById("inv_subtotal")) document.getElementById("inv_subtotal").textContent = "₦" + fmt(subtotal);
  if (document.getElementById("inv_taxamt")) document.getElementById("inv_taxamt").textContent = "₦" + fmt(tax);
  if (document.getElementById("inv_total")) document.getElementById("inv_total").textContent = "₦" + fmt(total);
}

async function saveInvoice() {
  const client = document.getElementById("inv_client").value.trim();
  if (!client) { showToast("Client name is required", "error"); return; }
  if (invoiceItems.length === 0) { showToast("Add at least one item", "error"); return; }

  const user = getSession();
  const subtotal = invoiceItems.reduce((s, it) => s + (it.qty * it.price), 0);
  const taxRate = parseFloat(document.getElementById("inv_tax").value) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const data = {
    client_name: client,
    client_email: document.getElementById("inv_email").value.trim(),
    client_phone: document.getElementById("inv_phone").value.trim(),
    service: document.getElementById("inv_service").value.trim(),
    date: document.getElementById("inv_date").value || today(),
    due_date: document.getElementById("inv_due").value || null,
    tax_rate: taxRate, tax, subtotal, total,
    items: JSON.stringify(invoiceItems),
    notes: document.getElementById("inv_notes").value.trim(),
    added_by: user.name,
    added_role: user.role
  };

  try {
    if (editingInvoiceId) {
      await sb(`/invoices?id=eq.${editingInvoiceId}`, { method: "PATCH", body: JSON.stringify(data) });
      showToast("Invoice updated successfully");
    } else {
      // Generate invoice number
      const existing = await sb("/invoices?select=number&order=id.desc&limit=1");
      let nextNum = 1;
      if (existing.length && existing[0].number) {
        const parts = existing[0].number.split("-");
        nextNum = (parseInt(parts[1]) || 0) + 1;
      }
      data.number = "INV-" + String(nextNum).padStart(3, "0");
      data.status = "Pending";
      await sb("/invoices", { method: "POST", body: JSON.stringify(data) });
      showToast("Invoice created successfully");
      await addNotification("invoice", "New Invoice Created", `${user.name} created invoice for ${client}`, "fas fa-file-invoice", user.name);
    }
    closeModal("invoiceModal");
    await loadInvoices();
  } catch (e) { showToast("Error saving invoice: " + e.message, "error"); }
}

async function toggleInvoiceStatus(id, currentStatus) {
  const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
  try {
    await sb(`/invoices?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    showToast(`Invoice marked as ${newStatus}`);
    await loadInvoices();
  } catch (e) { showToast("Error updating status", "error"); }
}

async function deleteInvoice(id) {
  if (!confirm("Delete this invoice? This cannot be undone.")) return;
  try {
    await sb(`/invoices?id=eq.${id}`, { method: "DELETE" });
    showToast("Invoice deleted");
    await loadInvoices();
  } catch (e) { showToast("Error deleting invoice", "error"); }
}

function viewInvoice(inv) {
  const items = typeof inv.items === "string" ? JSON.parse(inv.items || "[]") : (inv.items || []);
  const itemsHtml = items.map(it => `
    <tr>
      <td>${it.desc}</td>
      <td style="text-align:center">${it.qty}</td>
      <td style="text-align:right">₦${fmt(it.price)}</td>
      <td style="text-align:right">₦${fmt(it.qty * it.price)}</td>
    </tr>`).join("");

  document.getElementById("printPreview").innerHTML = `
    <div id="invoicePrintContent" style="font-family:Arial,sans-serif;padding:20px;color:#111">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0A2540;padding-bottom:15px;margin-bottom:20px">
        <div>
          <img src="https://yaseertech.vercel.app/images/logo.png" style="height:60px;object-fit:contain" onerror="this.style.display='none'"/>
          <h2 style="color:#0A2540;margin:5px 0">YaseerTech</h2>
          <p style="margin:2px 0;font-size:13px">Wuse 2, Abuja, Nigeria</p>
          <p style="margin:2px 0;font-size:13px">+234 703 XXX XXXX</p>
          <p style="margin:2px 0;font-size:13px">infoyaseertech@gmail.com</p>
        </div>
        <div style="text-align:right">
          <h1 style="color:#f97316;font-size:28px;margin:0">INVOICE</h1>
          <p style="margin:4px 0"><strong>${inv.number}</strong></p>
          <p style="margin:2px 0;font-size:13px">Date: ${inv.date || "—"}</p>
          <p style="margin:2px 0;font-size:13px">Due: ${inv.due_date || "—"}</p>
          <span style="background:${inv.status === 'Paid' ? '#10b981' : '#f97316'};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px">${inv.status}</span>
        </div>
      </div>
      <div style="background:#f8fafc;padding:15px;border-radius:8px;margin-bottom:20px">
        <strong>Bill To:</strong>
        <p style="margin:5px 0">${inv.client_name || "—"}</p>
        <p style="margin:2px 0;font-size:13px">${inv.client_email || ""}</p>
        <p style="margin:2px 0;font-size:13px">${inv.client_phone || ""}</p>
        ${inv.service ? `<p style="margin:2px 0;font-size:13px">Service: <strong>${inv.service}</strong></p>` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead><tr style="background:#0A2540;color:#fff">
          <th style="padding:10px;text-align:left">Description</th>
          <th style="padding:10px;text-align:center">Qty</th>
          <th style="padding:10px;text-align:right">Unit Price</th>
          <th style="padding:10px;text-align:right">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end">
        <div style="width:250px">
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid #e2e8f0">
            <span>Subtotal</span><span>₦${fmt(inv.subtotal)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:5px 0">
            <span>Tax (${inv.tax_rate || 0}%)</span><span>₦${fmt(inv.tax)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #0A2540;font-weight:bold;font-size:16px">
            <span>Total</span><span style="color:#f97316">₦${fmt(inv.total)}</span>
          </div>
        </div>
      </div>
      ${inv.notes ? `<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px"><strong>Notes:</strong><br/>${inv.notes}</div>` : ""}
      <div style="margin-top:30px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:15px">
        Thank you for your business! | YaseerTech — Digital Solutions & Technology
      </div>
    </div>`;
  openModal("printModal");
}

function printInvoice() {
  const content = document.getElementById("invoicePrintContent");
  if (!content) return;
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Invoice</title></head><body>${content.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

// ── Export Invoices ──
function exportInvoicesPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("YaseerTech — Invoice Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
  doc.autoTable({
    startY: 28,
    head: [["Invoice #", "Client", "Service", "Amount (₦)", "Date", "Status"]],
    body: allInvoices.map(i => [i.number, i.client_name, i.service || "—", fmt(i.total), i.date, i.status])
  });
  const paid = allInvoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);
  doc.text(`Total Paid: ₦${fmt(paid)}`, 14, doc.lastAutoTable.finalY + 10);
  doc.save("YaseerTech_Invoices.pdf");
}

function exportInvoicesExcel() {
  const ws = XLSX.utils.json_to_sheet(allInvoices.map(i => ({
    "Invoice #": i.number, "Client": i.client_name, "Service": i.service || "—",
    "Amount (₦)": i.total, "Date": i.date, "Status": i.status, "Added By": i.added_by
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, "YaseerTech_Invoices.xlsx");
}

// ============================================================
//   EXPENSES
// ============================================================
async function loadExpenses() {
  try {
    allExpenses = await sb("/expenses?order=created_at.desc");
    renderExpenseTable(allExpenses);
  } catch (e) { showToast("Error loading expenses: " + e.message, "error"); }
}

function renderExpenseTable(data) {
  document.getElementById("expenseBody").innerHTML = data.length
    ? data.map(exp => `
      <tr>
        <td>${exp.description || "—"}</td>
        <td>${exp.category || "—"}</td>
        <td>₦${fmt(exp.amount)}</td>
        <td>${exp.date || "—"}</td>
        <td>${exp.added_by || "—"}</td>
        <td class="actions">
          ${getSession().role === 'admin' ? `<button class="btn-icon btn-delete" onclick="deleteExpense(${exp.id})"><i class="fas fa-trash"></i></button>` : ''}
        </td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty-msg">No expenses yet</td></tr>`;
}

function filterExpenses() {
  const q = document.getElementById("expenseSearch").value.toLowerCase();
  const cat = document.getElementById("expenseCatFilter").value;
  const filtered = allExpenses.filter(e =>
    (!q || (e.description||"").toLowerCase().includes(q)) &&
    (!cat || e.category === cat)
  );
  renderExpenseTable(filtered);
}

function openExpenseModal() {
  document.getElementById("exp_desc").value = "";
  document.getElementById("exp_cat").value = "";
  document.getElementById("exp_amount").value = "";
  document.getElementById("exp_date").value = today();
  openModal("expenseModal");
}

async function saveExpense() {
  const desc = document.getElementById("exp_desc").value.trim();
  const cat = document.getElementById("exp_cat").value;
  const amount = parseFloat(document.getElementById("exp_amount").value);
  const date = document.getElementById("exp_date").value;
  if (!desc || !cat || !amount || !date) { showToast("All fields are required", "error"); return; }

  const user = getSession();
  try {
    await sb("/expenses", { method: "POST", body: JSON.stringify({
      description: desc, category: cat, amount, date,
      added_by: user.name, added_role: user.role
    })});
    showToast("Expense saved successfully");
    await addNotification("expense", "New Expense Added", `${user.name} added expense: ${desc}`, "fas fa-receipt", user.name);
    closeModal("expenseModal");
    await loadExpenses();
  } catch (e) { showToast("Error saving expense: " + e.message, "error"); }
}

async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  try {
    await sb(`/expenses?id=eq.${id}`, { method: "DELETE" });
    showToast("Expense deleted");
    await loadExpenses();
  } catch (e) { showToast("Error deleting expense", "error"); }
}

function exportExpensesPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("YaseerTech — Expense Report", 14, 15);
  doc.autoTable({
    startY: 25,
    head: [["Description", "Category", "Amount (₦)", "Date", "Added By"]],
    body: allExpenses.map(e => [e.description, e.category, fmt(e.amount), e.date, e.added_by])
  });
  const total = allExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  doc.text(`Total: ₦${fmt(total)}`, 14, doc.lastAutoTable.finalY + 10);
  doc.save("YaseerTech_Expenses.pdf");
}

function exportExpensesExcel() {
  const ws = XLSX.utils.json_to_sheet(allExpenses.map(e => ({
    "Description": e.description, "Category": e.category,
    "Amount (₦)": e.amount, "Date": e.date, "Added By": e.added_by
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  XLSX.writeFile(wb, "YaseerTech_Expenses.xlsx");
}

// ============================================================
//   STAFF
// ============================================================
async function loadStaff() {
  try {
    allStaff = await sb("/staff?order=created_at.desc");
    renderStaffTable(allStaff);
  } catch (e) { showToast("Error loading staff: " + e.message, "error"); }
}

function renderStaffTable(data) {
  document.getElementById("staffBody").innerHTML = data.length
    ? data.map(s => `
      <tr>
        <td>${s.name || "—"}</td>
        <td>${s.position || "—"}</td>
        <td>${s.phone || "—"}</td>
        <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${s.status}</span></td>
        <td>${s.date_added || "—"}</td>
        <td class="actions">
          <button class="btn-icon btn-edit" onclick="editStaff(${s.id})"><i class="fas fa-edit"></i></button>
          ${getSession().role === 'admin' ? `<button class="btn-icon btn-delete" onclick="deleteStaff(${s.id})"><i class="fas fa-trash"></i></button>` : ''}
        </td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty-msg">No staff added yet</td></tr>`;
}

function openStaffModal(id = null) {
  editingStaffId = id;
  document.getElementById("stf_name").value = "";
  document.getElementById("stf_pos").value = "";
  document.getElementById("stf_phone").value = "";
  document.getElementById("stf_status").value = "Active";
  document.getElementById("stf_date").value = today();
  document.getElementById("staffModalTitle").textContent = id ? "Edit Staff" : "Add Staff";
  openModal("staffModal");
}

async function editStaff(id) {
  const s = allStaff.find(x => x.id === id);
  if (!s) return;
  editingStaffId = id;
  document.getElementById("stf_name").value = s.name || "";
  document.getElementById("stf_pos").value = s.position || "";
  document.getElementById("stf_phone").value = s.phone || "";
  document.getElementById("stf_status").value = s.status || "Active";
  document.getElementById("stf_date").value = s.date_added || today();
  document.getElementById("staffModalTitle").textContent = "Edit Staff";
  openModal("staffModal");
}

async function saveStaff() {
  const name = document.getElementById("stf_name").value.trim();
  const pos = document.getElementById("stf_pos").value.trim();
  if (!name || !pos) { showToast("Name and position are required", "error"); return; }
  const data = {
    name, position: pos,
    phone: document.getElementById("stf_phone").value.trim(),
    status: document.getElementById("stf_status").value,
    date_added: document.getElementById("stf_date").value || today()
  };
  try {
    if (editingStaffId) {
      await sb(`/staff?id=eq.${editingStaffId}`, { method: "PATCH", body: JSON.stringify(data) });
      showToast("Staff updated");
    } else {
      await sb("/staff", { method: "POST", body: JSON.stringify(data) });
      showToast("Staff added");
    }
    closeModal("staffModal");
    await loadStaff();
  } catch (e) { showToast("Error saving staff: " + e.message, "error"); }
}

async function deleteStaff(id) {
  if (!confirm("Delete this staff member?")) return;
  try {
    await sb(`/staff?id=eq.${id}`, { method: "DELETE" });
    showToast("Staff deleted");
    await loadStaff();
  } catch (e) { showToast("Error deleting staff", "error"); }
}

// ============================================================
//   USERS (Admin only)
// ============================================================
async function loadUsers() {
  try {
    allUsers = await sb("/users?order=id");
    renderUserTable(allUsers);
  } catch (e) { showToast("Error loading users: " + e.message, "error"); }
}

function renderUserTable(data) {
  document.getElementById("userBody").innerHTML = data.length
    ? data.map(u => {
        const perms = u.permissions ? (typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions) : [];
        return `<tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-orange'}">${u.role}</span></td>
          <td>${u.role === 'admin' ? '<em>All access</em>' : (perms.join(", ") || "<em>None</em>")}</td>
          <td><span class="badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}">${u.status}</span></td>
          <td class="actions">
            <button class="btn-icon btn-edit" onclick="openEditUser(${u.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-orange" onclick="openChangePw(${u.id},'${u.name}')"><i class="fas fa-key"></i></button>
            <button class="btn-icon btn-delete" onclick="deleteUser(${u.id},'${u.email}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="6" class="empty-msg">No users found</td></tr>`;
}

function openUserModal() {
  document.getElementById("userModalTitle").textContent = "Add User";
  document.getElementById("usr_name").value = "";
  document.getElementById("usr_email").value = "";
  document.getElementById("usr_pwd").value = "";
  document.getElementById("usr_role").value = "staff";
  document.getElementById("usr_edit_id").value = "";
  document.querySelectorAll("#permissionsGroup input[type=checkbox]").forEach(cb => cb.checked = false);
  openModal("userModal");
}

async function openEditUser(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  document.getElementById("userModalTitle").textContent = "Edit User";
  document.getElementById("usr_name").value = u.name;
  document.getElementById("usr_email").value = u.email;
  document.getElementById("usr_pwd").value = "";
  document.getElementById("usr_role").value = u.role;
  document.getElementById("usr_edit_id").value = u.id;
  const perms = u.permissions ? (typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions) : [];
  document.querySelectorAll("#permissionsGroup input[type=checkbox]").forEach(cb => {
    cb.checked = perms.includes(cb.value);
  });
  openModal("userModal");
}

async function saveUser() {
  const name = document.getElementById("usr_name").value.trim();
  const email = document.getElementById("usr_email").value.trim();
  const pwd = document.getElementById("usr_pwd").value.trim();
  const role = document.getElementById("usr_role").value;
  const editId = document.getElementById("usr_edit_id").value;
  if (!name || !email) { showToast("Name and email are required", "error"); return; }
  if (!editId && !pwd) { showToast("Password is required for new users", "error"); return; }

  const perms = Array.from(document.querySelectorAll("#permissionsGroup input[type=checkbox]:checked")).map(cb => cb.value);
  const data = { name, email, role, status: "active", permissions: JSON.stringify(perms) };
  if (pwd) data.password = pwd;

  try {
    if (editId) {
      await sb(`/users?id=eq.${editId}`, { method: "PATCH", body: JSON.stringify(data) });
      showToast("User updated");
    } else {
      // Check email not duplicate
      const exists = await sb(`/users?email=eq.${encodeURIComponent(email)}`);
      if (exists.length) { showToast("Email already exists", "error"); return; }
      await sb("/users", { method: "POST", body: JSON.stringify(data) });
      showToast("User created successfully");
    }
    closeModal("userModal");
    await loadUsers();
  } catch (e) { showToast("Error saving user: " + e.message, "error"); }
}

async function deleteUser(id, email) {
  const me = getSession();
  if (me.email === email) { showToast("You cannot delete your own account", "error"); return; }
  if (!confirm("Delete this user?")) return;
  try {
    await sb(`/users?id=eq.${id}`, { method: "DELETE" });
    showToast("User deleted");
    await loadUsers();
  } catch (e) { showToast("Error deleting user", "error"); }
}

function openChangePw(id, name) {
  document.getElementById("changePwUserId").value = id;
  document.getElementById("changePwName").textContent = `Change password for: ${name}`;
  document.getElementById("changePwNew").value = "";
  openModal("changePwModal");
}

async function adminChangePw() {
  const id = document.getElementById("changePwUserId").value;
  const pwd = document.getElementById("changePwNew").value.trim();
  if (!pwd || pwd.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
  try {
    await sb(`/users?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ password: pwd }) });
    showToast("Password updated successfully");
    closeModal("changePwModal");
  } catch (e) { showToast("Error updating password", "error"); }
}

// ============================================================
//   MY PROFILE
// ============================================================
function loadProfile(user) {
  document.getElementById("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
  document.getElementById("profileDetails").innerHTML = `
    <h3>${user.name}</h3>
    <p><i class="fas fa-envelope"></i> ${user.email}</p>
    <p><i class="fas fa-user-tag"></i> ${user.role}</p>`;
  document.getElementById("currentPwd").value = "";
  document.getElementById("newPwd").value = "";
  document.getElementById("confirmPwd").value = "";
  document.getElementById("pwdMsg").textContent = "";
}

async function changePassword() {
  const current = document.getElementById("currentPwd").value;
  const newPwd = document.getElementById("newPwd").value;
  const confirm = document.getElementById("confirmPwd").value;
  const msg = document.getElementById("pwdMsg");
  const user = getSession();

  if (!current || !newPwd || !confirm) { msg.textContent = "All fields required"; msg.style.color = "red"; return; }
  if (newPwd !== confirm) { msg.textContent = "New passwords do not match"; msg.style.color = "red"; return; }
  if (newPwd.length < 6) { msg.textContent = "Password must be at least 6 characters"; msg.style.color = "red"; return; }

  try {
    const found = await sb(`/users?email=eq.${encodeURIComponent(user.email)}&password=eq.${encodeURIComponent(current)}&limit=1`);
    if (!found.length) { msg.textContent = "Current password is incorrect"; msg.style.color = "red"; return; }
    await sb(`/users?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ password: newPwd }) });
    msg.textContent = "✅ Password updated successfully!"; msg.style.color = "green";
    document.getElementById("currentPwd").value = "";
    document.getElementById("newPwd").value = "";
    document.getElementById("confirmPwd").value = "";
  } catch (e) { msg.textContent = "Error: " + e.message; msg.style.color = "red"; }
}

// ============================================================
//   NOTIFICATIONS
// ============================================================
async function loadNotifications() {
  try {
    allNotifications = await sb("/notifications?order=created_at.desc&limit=20");
    renderNotifications();
  } catch (e) { /* silently fail */ }
}

function renderNotifications() {
  const unread = allNotifications.filter(n => !n.is_read);
  const badge = document.getElementById("notifBadge");
  if (unread.length > 0) { badge.style.display = "flex"; badge.textContent = unread.length; }
  else { badge.style.display = "none"; }

  document.getElementById("notifList").innerHTML = allNotifications.length
    ? allNotifications.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'notif-unread'}">
        <i class="${n.icon || 'fas fa-bell'}"></i>
        <div>
          <strong>${n.title}</strong>
          <p>${n.message}</p>
          <small>${timeAgo(n.created_at)}</small>
        </div>
      </div>`).join("")
    : "<p class='empty-notif'>No notifications</p>";
}

async function addNotification(type, title, message, icon, actor) {
  try {
    await sb("/notifications", { method: "POST", body: JSON.stringify({ type, title, message, icon, actor_name: actor, is_read: false }) });
  } catch (e) { /* silently fail */ }
}

async function markAllRead() {
  try {
    await sb("/notifications?is_read=eq.false", { method: "PATCH", body: JSON.stringify({ is_read: true }) });
    await loadNotifications();
  } catch (e) {}
  document.getElementById("notifDropdown").style.display = "none";
}

function toggleNotif() {
  const dd = document.getElementById("notifDropdown");
  dd.style.display = dd.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", e => {
  if (!e.target.closest(".notif-wrap")) {
    const dd = document.getElementById("notifDropdown");
    if (dd) dd.style.display = "none";
  }
});

// ============================================================
//   AUTH
// ============================================================
function logout() {
  if (!confirm("Log out?")) return;
  clearSession();
  window.location.href = "login.html";
}

// ============================================================
//   MODAL HELPERS
// ============================================================
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) closeModal(e.target.id);
});

// ============================================================
//   TOAST
// ============================================================
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast toast-" + type + " show";
  setTimeout(() => t.classList.remove("show"), 3500);
}

// ============================================================
//   UTILITY
// ============================================================
function fmt(n) {
  if (!n && n !== 0) return "0";
  return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function monthOf(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}

function getLast6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString("default", { month: "short", year: "2-digit" }));
  }
  return months;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
