// ============================================
//   YASEERTECH - INVOICE GENERATOR (SUPABASE)
//   js/invoice.js
// ============================================

const SB_URL2  = "https://winlgtflhwiaraniwpts.supabase.co";
const SB_KEY2  = "sb_publishable_YFngUdJcVv7uXby3US4Nbg_7OQCs3ok";
const SB_REST2 = SB_URL2 + "/rest/v1";

async function invGet(ep) {
    const r = await fetch(SB_REST2 + ep, { headers:{ "apikey":SB_KEY2,"Authorization":"Bearer "+SB_KEY2,"Content-Type":"application/json" }});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function invPost(ep, data) {
    const r = await fetch(SB_REST2 + ep, { method:"POST", headers:{ "apikey":SB_KEY2,"Authorization":"Bearer "+SB_KEY2,"Content-Type":"application/json","Prefer":"return=representation" }, body:JSON.stringify(data)});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function invPatch(ep, data) {
    const r = await fetch(SB_REST2 + ep, { method:"PATCH", headers:{ "apikey":SB_KEY2,"Authorization":"Bearer "+SB_KEY2,"Content-Type":"application/json","Prefer":"return=representation" }, body:JSON.stringify(data)});
    const t = await r.text(); return t ? JSON.parse(t) : [];
}
async function invDelete(ep) {
    await fetch(SB_REST2 + ep, { method:"DELETE", headers:{ "apikey":SB_KEY2,"Authorization":"Bearer "+SB_KEY2 }});
}

async function getNextInvoiceNumber() {
    const invoices = await invGet("/invoices?order=id.asc");
    if (invoices.length === 0) return "INV-001";
    const last = invoices[invoices.length - 1];
    const num  = parseInt(last.number.replace("INV-","")) + 1;
    return "INV-" + String(num).padStart(3,"0");
}

let itemCount = 1;

function addInvoiceItem() {
    itemCount++;
    const container = document.getElementById("invoiceItems");
    const row = document.createElement("div");
    row.className = "invoice-item-row";
    row.id = "item-row-" + itemCount;
    row.innerHTML = `
        <div class="inv-item-fields">
            <input type="text"   class="inv-desc"  placeholder="Description" style="flex:2;">
            <input type="number" class="inv-qty"   placeholder="Qty" value="1" min="1" style="flex:0.5;" oninput="calcItemTotal(this)">
            <input type="number" class="inv-price" placeholder="Unit Price" min="0" style="flex:1;" oninput="calcItemTotal(this)">
            <input type="number" class="inv-total" placeholder="Total" readonly style="flex:1;background:#f5f7fa;">
            <button onclick="removeItem('item-row-${itemCount}')" class="inv-remove-btn">✕</button>
        </div>`;
    container.appendChild(row);
}

function removeItem(id) {
    const row = document.getElementById(id);
    if (row) row.remove();
    calcGrandTotal();
}

function calcItemTotal(input) {
    const row   = input.closest(".inv-item-fields");
    const qty   = parseFloat(row.querySelector(".inv-qty").value)   || 0;
    const price = parseFloat(row.querySelector(".inv-price").value) || 0;
    row.querySelector(".inv-total").value = (qty * price).toFixed(2);
    calcGrandTotal();
}

function calcGrandTotal() {
    let total = 0;
    document.querySelectorAll(".inv-total").forEach(el => { total += parseFloat(el.value) || 0; });
    const taxRate = parseFloat(document.getElementById("invTax").value) || 0;
    const tax     = total * (taxRate / 100);
    const grand   = total + tax;
    const g = id => document.getElementById(id);
    if (g("invSubtotal"))  g("invSubtotal").textContent  = "₦" + total.toLocaleString("en-NG",{minimumFractionDigits:2});
    if (g("invTaxAmt"))    g("invTaxAmt").textContent    = "₦" + tax.toLocaleString("en-NG",{minimumFractionDigits:2});
    if (g("invGrandTotal"))g("invGrandTotal").textContent = "₦" + grand.toLocaleString("en-NG",{minimumFractionDigits:2});
}

async function saveInvoice() {
    const clientName  = document.getElementById("invClientName").value.trim();
    const clientEmail = document.getElementById("invClientEmail").value.trim();
    const clientPhone = document.getElementById("invClientPhone").value.trim();
    const date        = document.getElementById("invDate").value;
    const dueDate     = document.getElementById("invDueDate").value;
    const notes       = document.getElementById("invNotes").value.trim();
    const taxRate     = parseFloat(document.getElementById("invTax").value) || 0;
    if (!clientName || !date) { alert("Client name and date are required."); return; }

    const items = [];
    document.querySelectorAll(".inv-item-fields").forEach(fields => {
        const desc  = fields.querySelector(".inv-desc").value.trim();
        const qty   = parseFloat(fields.querySelector(".inv-qty").value)   || 0;
        const price = parseFloat(fields.querySelector(".inv-price").value) || 0;
        if (desc && price > 0) items.push({ desc, qty, price, total: qty * price });
    });
    if (items.length === 0) { alert("Please add at least one item."); return; }

    const subtotal = items.reduce((s,i) => s + i.total, 0);
    const tax      = subtotal * (taxRate / 100);
    const total    = subtotal + tax;
    const number   = await getNextInvoiceNumber();

    try {
        await invPost("/invoices", {
            number, client_name:clientName, client_email:clientEmail,
            client_phone:clientPhone, date, due_date:dueDate || null,
            subtotal, tax_rate:taxRate, tax, total,
            items: JSON.stringify(items), notes, status:"Pending"
        });
        closeModal("invoiceCreateModal");
        resetInvoiceForm();
        renderInvoices();
        renderInvoiceSection();
        showToast("✅ Invoice " + number + " created!");
    } catch(err) { alert("Error creating invoice. Try again."); }
}

function resetInvoiceForm() {
    document.getElementById("invClientName").value  = "";
    document.getElementById("invClientEmail").value = "";
    document.getElementById("invClientPhone").value = "";
    document.getElementById("invNotes").value       = "";
    document.getElementById("invTax").value         = "0";
    const today = new Date().toISOString().split("T")[0];
    const due   = new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0];
    document.getElementById("invDate").value    = today;
    document.getElementById("invDueDate").value = due;
    document.getElementById("invoiceItems").innerHTML = `
        <div class="invoice-item-row" id="item-row-1">
            <div class="inv-item-fields">
                <input type="text"   class="inv-desc"  placeholder="Description" style="flex:2;">
                <input type="number" class="inv-qty"   placeholder="Qty" value="1" min="1" style="flex:0.5;" oninput="calcItemTotal(this)">
                <input type="number" class="inv-price" placeholder="Unit Price" min="0" style="flex:1;" oninput="calcItemTotal(this)">
                <input type="number" class="inv-total" placeholder="Total" readonly style="flex:1;background:#f5f7fa;">
            </div>
        </div>`;
    itemCount = 1;
    calcGrandTotal();
}

async function renderInvoices() {
    const tbody = document.getElementById("invoicesTableBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Loading...</td></tr>`;
    try {
        const invoices = await invGet("/invoices?order=id.desc");
        if (invoices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No invoices yet. Click "New Invoice" to create one.</td></tr>`; return;
        }
        tbody.innerHTML = invoices.map(inv => `
            <tr>
                <td><strong>${inv.number}</strong></td>
                <td>${inv.client_name}</td>
                <td>${fmtDate(inv.date)}</td>
                <td><strong style="color:var(--green)">₦${Number(inv.total).toLocaleString("en-NG")}</strong></td>
                <td><span class="badge ${inv.status==="Paid"?"badge-active":"badge-pending"}">${inv.status}</span></td>
                <td class="action-btns">
                    <button class="erp-edit-btn" onclick="viewInvoice(${inv.id})">View</button>
                    <button class="erp-edit-btn" onclick="printInvoice(${inv.id})" style="background:#d1fae5;color:#065f46;">Print</button>
                    <button class="erp-pw-btn"   onclick="toggleInvoiceStatus(${inv.id},'${inv.status}')">${inv.status==="Paid"?"Mark Unpaid":"Mark Paid"}</button>
                    <button class="erp-delete-btn" onclick="deleteInvoice(${inv.id})">Delete</button>
                </td>
            </tr>`).join("");
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Error loading invoices.</td></tr>`;
    }
}

async function viewInvoice(id) {
    try {
        const invs = await invGet("/invoices?id=eq." + id + "&limit=1");
        const inv  = invs[0]; if (!inv) return;
        document.getElementById("invoicePreview").innerHTML = buildInvoiceHTML(inv);
        openModal("invoiceViewModal");
    } catch(err) { alert("Error loading invoice."); }
}

async function printInvoice(id) {
    try {
        const invs = await invGet("/invoices?id=eq." + id + "&limit=1");
        const inv  = invs[0]; if (!inv) return;
        const pw   = window.open("","_blank");
        pw.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.number}</title>
        <style>
            *{margin:0;padding:0;box-sizing:border-box;}
            body{font-family:Arial,sans-serif;color:#111;padding:40px;}
            .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;}
            .inv-company{font-size:12px;color:#666;margin-top:8px;line-height:1.7;}
            .inv-title{text-align:right;}
            .inv-title h1{font-size:32px;font-weight:800;color:#0A2540;}
            .inv-badge{display:inline-block;background:${inv.status==="Paid"?"#d1fae5":"#fef3c7"};color:${inv.status==="Paid"?"#065f46":"#92400e"};padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px;}
            .inv-details{display:flex;justify-content:space-between;margin-bottom:28px;}
            .inv-to h4{font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px;margin-bottom:8px;}
            .inv-to p{font-size:14px;line-height:1.7;}
            .inv-to strong{font-size:16px;font-weight:700;color:#0A2540;}
            .inv-meta p{font-size:13px;color:#666;margin-bottom:4px;text-align:right;}
            table{width:100%;border-collapse:collapse;margin-bottom:24px;}
            thead tr{background:#0A2540;color:white;}
            th{padding:12px 16px;text-align:left;font-size:13px;}
            td{padding:12px 16px;font-size:13px;border-bottom:1px solid #eee;}
            tr:nth-child(even) td{background:#f9f9f9;}
            .totals-wrap{text-align:right;}
            .totals-wrap table{width:280px;margin-left:auto;border-collapse:collapse;}
            .totals-wrap td{padding:7px 12px;font-size:14px;border:none;}
            .grand-row td{font-size:16px;font-weight:800;background:#0A2540;color:white;border-radius:6px;padding:10px 12px;}
            .inv-notes{margin-top:28px;padding:14px;background:#f5f7fa;border-radius:8px;font-size:13px;color:#666;}
            .inv-footer{margin-top:36px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px;}
            @media print{body{padding:20px;}}
        </style></head><body>${buildInvoiceHTML(inv, true)}
        <script>window.onload=function(){window.print();}<\/script></body></html>`);
        pw.document.close();
    } catch(err) { alert("Error printing invoice."); }
}

function buildInvoiceHTML(inv, forPrint=false) {
    const items = typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items;
    const rows  = (items||[]).map(item => `
        <tr>
            <td>${item.desc}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">₦${Number(item.price).toLocaleString("en-NG",{minimumFractionDigits:2})}</td>
            <td style="text-align:right"><strong>₦${Number(item.total).toLocaleString("en-NG",{minimumFractionDigits:2})}</strong></td>
        </tr>`).join("");

    return `
        <div class="inv-header">
            <div>
                <img src="https://yaseertech.vercel.app/images/logo.png" alt="YaseerTech" style="height:60px;width:auto;object-fit:contain;display:block;margin-bottom:8px;">
                <div class="inv-company">
                    Suite TF05, Aminasia Trade Centre<br>
                    Aminu Kano Crescent, Wuse 2, Abuja<br>
                    📞 +234 703 105 2232<br>
                    ✉️ infoyaseertech@gmail.com
                </div>
            </div>
            <div class="inv-title">
                <h1>INVOICE</h1>
                <p><strong>${inv.number}</strong></p>
                <div class="inv-badge">${inv.status}</div>
            </div>
        </div>
        <div class="inv-details">
            <div class="inv-to">
                <h4>Bill To</h4>
                <p><strong>${inv.client_name}</strong></p>
                ${inv.client_email ? `<p>${inv.client_email}</p>` : ""}
                ${inv.client_phone ? `<p>${inv.client_phone}</p>` : ""}
            </div>
            <div class="inv-meta">
                <p>Invoice Date: <strong>${fmtDate(inv.date)}</strong></p>
                ${inv.due_date ? `<p>Due Date: <strong>${fmtDate(inv.due_date)}</strong></p>` : ""}
            </div>
        </div>
        <table>
            <thead><tr><th style="width:50%">Description</th><th style="text-align:center;width:10%">Qty</th><th style="text-align:right;width:20%">Unit Price</th><th style="text-align:right;width:20%">Total</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="totals-wrap${forPrint?" totals-wrap":""}">
            <table>
                <tr><td>Subtotal</td><td style="text-align:right">₦${Number(inv.subtotal).toLocaleString("en-NG",{minimumFractionDigits:2})}</td></tr>
                ${inv.tax_rate > 0 ? `<tr><td>Tax (${inv.tax_rate}%)</td><td style="text-align:right">₦${Number(inv.tax).toLocaleString("en-NG",{minimumFractionDigits:2})}</td></tr>` : ""}
                <tr class="grand-row"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong>₦${Number(inv.total).toLocaleString("en-NG",{minimumFractionDigits:2})}</strong></td></tr>
            </table>
        </div>
        ${inv.notes ? `<div class="inv-notes"><strong>Notes:</strong> ${inv.notes}</div>` : ""}
        <div class="inv-footer">Thank you for your business! — YaseerTech | Driving Business Growth Through Digital Excellence</div>`;
}

async function toggleInvoiceStatus(id, currentStatus) {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
        await invPatch("/invoices?id=eq." + id, { status: newStatus });
        renderInvoices();
        renderInvoiceSection();
        showToast("✅ Invoice marked as " + newStatus);
    } catch(err) { alert("Error updating status."); }
}

async function deleteInvoice(id) {
    if (!confirm("Delete this invoice permanently?")) return;
    try {
        await invDelete("/invoices?id=eq." + id);
        renderInvoices();
        renderInvoiceSection();
        showToast("Invoice deleted.");
    } catch(err) { alert("Error deleting invoice."); }
}

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function initInvoiceSection() {
    const today = new Date().toISOString().split("T")[0];
    const due   = new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0];
    const di = document.getElementById("invDate");
    const dd = document.getElementById("invDueDate");
    if (di && !di.value) di.value = today;
    if (dd && !dd.value) dd.value = due;
    renderInvoices();
}
