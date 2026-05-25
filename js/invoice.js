// ============================================
//   YASEERTECH - INVOICE GENERATOR
//   js/invoice.js
// ============================================

// ========================
// DATA
// ========================
function getInvoices()    { return JSON.parse(localStorage.getItem("yt_invoices")) || []; }
function saveInvoices(inv){ localStorage.setItem("yt_invoices", JSON.stringify(inv)); }

function getNextInvoiceNumber() {
    const invoices = getInvoices();
    if (invoices.length === 0) return "INV-001";
    const last = invoices[invoices.length - 1];
    const num  = parseInt(last.number.replace("INV-", "")) + 1;
    return "INV-" + String(num).padStart(3, "0");
}

// ========================
// RENDER INVOICE LIST
// ========================
function renderInvoices() {
    const tbody = document.getElementById("invoicesTableBody");
    if (!tbody) return;

    const invoices = getInvoices().reverse();

    if (invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No invoices yet. Click "New Invoice" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = invoices.map((inv, i) => `
        <tr>
            <td><strong>${inv.number}</strong></td>
            <td>${inv.clientName}</td>
            <td>${formatDate(inv.date)}</td>
            <td><strong style="color:var(--green)">₦${Number(inv.total).toLocaleString("en-NG")}</strong></td>
            <td><span class="badge ${inv.status === "Paid" ? "badge-active" : inv.status === "Pending" ? "badge-pending" : "badge-inactive"}">${inv.status}</span></td>
            <td class="action-btns">
                <button class="erp-edit-btn"   onclick="viewInvoice(${inv.id})">View</button>
                <button class="erp-edit-btn"   onclick="printInvoice(${inv.id})" style="background:#d1fae5;color:#065f46;">Print</button>
                <button class="erp-pw-btn"     onclick="toggleInvoiceStatus(${inv.id})">${inv.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}</button>
                <button class="erp-delete-btn" onclick="deleteInvoice(${inv.id})">Delete</button>
            </td>
        </tr>`).join("");
}

// ========================
// ADD INVOICE ITEM ROW
// ========================
let itemCount = 1;

function addInvoiceItem() {
    itemCount++;
    const container = document.getElementById("invoiceItems");
    const row = document.createElement("div");
    row.className = "invoice-item-row";
    row.id = "item-row-" + itemCount;
    row.innerHTML = `
        <div class="inv-item-fields">
            <input type="text"   class="inv-desc"  placeholder="Description of service" style="flex:2;">
            <input type="number" class="inv-qty"   placeholder="Qty" value="1" min="1" style="flex:0.5;" oninput="calcItemTotal(this)">
            <input type="number" class="inv-price" placeholder="Unit Price (₦)" min="0" style="flex:1;" oninput="calcItemTotal(this)">
            <input type="number" class="inv-total" placeholder="Total" readonly style="flex:1;background:#f5f7fa;">
            <button onclick="removeItem('item-row-${itemCount}')" class="inv-remove-btn">✕</button>
        </div>
    `;
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
    document.querySelectorAll(".inv-total").forEach(el => {
        total += parseFloat(el.value) || 0;
    });
    const taxRate = parseFloat(document.getElementById("invTax").value) || 0;
    const tax     = total * (taxRate / 100);
    const grand   = total + tax;

    const subtotalEl = document.getElementById("invSubtotal");
    const taxAmtEl   = document.getElementById("invTaxAmt");
    const grandEl    = document.getElementById("invGrandTotal");

    if (subtotalEl) subtotalEl.textContent = "₦" + total.toLocaleString("en-NG", {minimumFractionDigits:2});
    if (taxAmtEl)   taxAmtEl.textContent   = "₦" + tax.toLocaleString("en-NG",   {minimumFractionDigits:2});
    if (grandEl)    grandEl.textContent    = "₦" + grand.toLocaleString("en-NG", {minimumFractionDigits:2});
}

// ========================
// SAVE INVOICE
// ========================
function saveInvoice() {
    const clientName = document.getElementById("invClientName").value.trim();
    const clientEmail= document.getElementById("invClientEmail").value.trim();
    const clientPhone= document.getElementById("invClientPhone").value.trim();
    const date       = document.getElementById("invDate").value;
    const dueDate    = document.getElementById("invDueDate").value;
    const notes      = document.getElementById("invNotes").value.trim();
    const taxRate    = parseFloat(document.getElementById("invTax").value) || 0;

    if (!clientName || !date) {
        alert("Client name and date are required.");
        return;
    }

    // Collect items
    const items = [];
    document.querySelectorAll(".invoice-item-row, #item-row-1").forEach(row => {
        const fields = row.querySelector(".inv-item-fields");
        if (!fields) return;
        const desc  = fields.querySelector(".inv-desc").value.trim();
        const qty   = parseFloat(fields.querySelector(".inv-qty").value)   || 0;
        const price = parseFloat(fields.querySelector(".inv-price").value) || 0;
        const total = qty * price;
        if (desc && price > 0) items.push({ desc, qty, price, total });
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax      = subtotal * (taxRate / 100);
    const total    = subtotal + tax;

    const invoice = {
        id:          Date.now(),
        number:      getNextInvoiceNumber(),
        clientName,
        clientEmail,
        clientPhone,
        date,
        dueDate,
        notes,
        taxRate,
        subtotal,
        tax,
        total,
        items,
        status:      "Pending",
        createdAt:   new Date().toISOString()
    };

    const invoices = getInvoices();
    invoices.push(invoice);
    saveInvoices(invoices);

    closeModal("invoiceCreateModal");
    resetInvoiceForm();
    renderInvoices();
    showToast("✅ Invoice " + invoice.number + " created successfully!");
}

function resetInvoiceForm() {
    document.getElementById("invClientName").value  = "";
    document.getElementById("invClientEmail").value = "";
    document.getElementById("invClientPhone").value = "";
    document.getElementById("invNotes").value       = "";
    document.getElementById("invTax").value         = "0";

    const today   = new Date().toISOString().split("T")[0];
    const due     = new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0];
    document.getElementById("invDate").value    = today;
    document.getElementById("invDueDate").value = due;

    // Reset items to just one row
    const container = document.getElementById("invoiceItems");
    container.innerHTML = `
        <div class="invoice-item-row" id="item-row-1">
            <div class="inv-item-fields">
                <input type="text"   class="inv-desc"  placeholder="Description of service" style="flex:2;">
                <input type="number" class="inv-qty"   placeholder="Qty" value="1" min="1" style="flex:0.5;" oninput="calcItemTotal(this)">
                <input type="number" class="inv-price" placeholder="Unit Price (₦)" min="0" style="flex:1;" oninput="calcItemTotal(this)">
                <input type="number" class="inv-total" placeholder="Total" readonly style="flex:1;background:#f5f7fa;">
            </div>
        </div>
    `;
    itemCount = 1;
    calcGrandTotal();
}

// ========================
// VIEW INVOICE
// ========================
function viewInvoice(id) {
    const inv = getInvoices().find(i => i.id === id);
    if (!inv) return;

    const preview = document.getElementById("invoicePreview");
    if (!preview) return;

    preview.innerHTML = buildInvoiceHTML(inv);
    openModal("invoiceViewModal");
}

// ========================
// PRINT INVOICE
// ========================
function printInvoice(id) {
    const inv = getInvoices().find(i => i.id === id);
    if (!inv) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${inv.number} - YaseerTech</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family: Arial, sans-serif; color: #111; padding: 40px; }
                .inv-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
                .inv-logo-text { font-size:28px; font-weight:800; }
                .inv-logo-text span { color:#FF6B00; }
                .inv-company { font-size:12px; color:#666; margin-top:6px; line-height:1.6; }
                .inv-title { text-align:right; }
                .inv-title h1 { font-size:36px; font-weight:800; color:#0A2540; }
                .inv-title p { font-size:13px; color:#666; margin-top:4px; }
                .inv-badge { display:inline-block; background:${inv.status==="Paid"?"#d1fae5":"#fef3c7"}; color:${inv.status==="Paid"?"#065f46":"#92400e"}; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; margin-top:8px; }
                .inv-details { display:flex; justify-content:space-between; margin-bottom:32px; }
                .inv-to h4 { font-size:11px; text-transform:uppercase; color:#999; letter-spacing:1px; margin-bottom:8px; }
                .inv-to p { font-size:14px; color:#111; line-height:1.7; }
                .inv-to strong { font-size:16px; font-weight:700; }
                .inv-meta p { font-size:13px; color:#666; margin-bottom:4px; text-align:right; }
                .inv-meta strong { color:#111; }
                table { width:100%; border-collapse:collapse; margin-bottom:24px; }
                thead tr { background:#0A2540; color:white; }
                th { padding:12px 16px; text-align:left; font-size:13px; }
                td { padding:12px 16px; font-size:13px; border-bottom:1px solid #eee; }
                tr:nth-child(even) td { background:#f9f9f9; }
                .inv-totals { text-align:right; }
                .inv-totals table { width:280px; margin-left:auto; }
                .inv-totals td { border:none; padding:6px 12px; }
                .inv-totals .grand td { font-size:16px; font-weight:800; background:#0A2540; color:white; border-radius:6px; }
                .inv-notes { margin-top:32px; padding:16px; background:#f5f7fa; border-radius:8px; font-size:13px; color:#666; }
                .inv-footer { margin-top:40px; text-align:center; font-size:12px; color:#999; border-top:1px solid #eee; padding-top:16px; }
                @media print { body { padding:20px; } }
            </style>
        </head>
        <body>
            ${buildInvoiceHTML(inv, true)}
            <script>window.onload = function(){ window.print(); }<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ========================
// BUILD INVOICE HTML
// ========================
function buildInvoiceHTML(inv, forPrint = false) {
    const itemRows = inv.items.map(item => `
        <tr>
            <td>${item.desc}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">₦${Number(item.price).toLocaleString("en-NG", {minimumFractionDigits:2})}</td>
            <td style="text-align:right"><strong>₦${Number(item.total).toLocaleString("en-NG", {minimumFractionDigits:2})}</strong></td>
        </tr>
    `).join("");

    return `
        <div class="inv-header">
            <div>
                <div class="inv-logo-text">Yaseer<span>Tech</span></div>
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
                <p><strong>${inv.clientName}</strong></p>
                ${inv.clientEmail ? `<p>${inv.clientEmail}</p>` : ""}
                ${inv.clientPhone ? `<p>${inv.clientPhone}</p>` : ""}
            </div>
            <div class="inv-meta">
                <p>Invoice Date: <strong>${formatDate(inv.date)}</strong></p>
                ${inv.dueDate ? `<p>Due Date: <strong>${formatDate(inv.dueDate)}</strong></p>` : ""}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:50%">Description</th>
                    <th style="text-align:center;width:10%">Qty</th>
                    <th style="text-align:right;width:20%">Unit Price</th>
                    <th style="text-align:right;width:20%">Total</th>
                </tr>
            </thead>
            <tbody>${itemRows}</tbody>
        </table>

        <div class="inv-totals">
            <table>
                <tr><td>Subtotal</td><td style="text-align:right">₦${Number(inv.subtotal).toLocaleString("en-NG", {minimumFractionDigits:2})}</td></tr>
                ${inv.taxRate > 0 ? `<tr><td>Tax (${inv.taxRate}%)</td><td style="text-align:right">₦${Number(inv.tax).toLocaleString("en-NG", {minimumFractionDigits:2})}</td></tr>` : ""}
                <tr class="grand"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong>₦${Number(inv.total).toLocaleString("en-NG", {minimumFractionDigits:2})}</strong></td></tr>
            </table>
        </div>

        ${inv.notes ? `<div class="inv-notes"><strong>Notes:</strong> ${inv.notes}</div>` : ""}

        <div class="inv-footer">
            Thank you for your business! — YaseerTech | Driving Business Growth Through Digital Excellence
        </div>
    `;
}

// ========================
// TOGGLE STATUS
// ========================
function toggleInvoiceStatus(id) {
    const invoices = getInvoices();
    const idx      = invoices.findIndex(i => i.id === id);
    if (idx > -1) {
        invoices[idx].status = invoices[idx].status === "Paid" ? "Pending" : "Paid";
        saveInvoices(invoices);
        renderInvoices();
        showToast("✅ Invoice status updated!");
    }
}

// ========================
// DELETE INVOICE
// ========================
function deleteInvoice(id) {
    if (!confirm("Delete this invoice permanently?")) return;
    saveInvoices(getInvoices().filter(i => i.id !== id));
    renderInvoices();
    showToast("Invoice deleted.");
}

// ========================
// HELPER
// ========================
function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

// ========================
// INIT INVOICE SECTION
// ========================
function initInvoiceSection() {
    const today = new Date().toISOString().split("T")[0];
    const due   = new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0];
    const dateEl    = document.getElementById("invDate");
    const dueDateEl = document.getElementById("invDueDate");
    if (dateEl)    dateEl.value    = today;
    if (dueDateEl) dueDateEl.value = due;
    renderInvoices();
}
