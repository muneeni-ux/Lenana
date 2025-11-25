import React, { useState } from "react";
import { Search, FileText, Calendar, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* 
  Show orders with delivery status: pending here (Current orders)
  Before delivery then after delivery move to past invoices
  Later: Connect invoices → orders → deliveries
*/

// Sample invoice data
const sampleInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    orderId: "ORD-001",
    clientId: "C001",
    clientName: "Mount Kenya Spa",
    invoiceDate: "2025-02-12",
    dueDate: "2025-02-22",
    invoiceTotalKsh: 5800,
    status: "DRAFT",
    items: [
      { id: "i1", productName: "Premium Bottled Water 500ml", quantity: 10, unitPriceKsh: 200, lineTotalKsh: 2000 },
      { id: "i2", productName: "Premium Bottled Water 1L", quantity: 19, unitPriceKsh: 200, lineTotalKsh: 3800 },
    ],
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    orderId: "ORD-002",
    clientId: "C002",
    clientName: "Laikipia Hotel",
    invoiceDate: "2025-02-08",
    dueDate: "2025-02-18",
    invoiceTotalKsh: 12400,
    status: "PAID",
    items: [
      { id: "i3", productName: "Premium Bottled Water 20L Refill", quantity: 20, unitPriceKsh: 620, lineTotalKsh: 12400 },
    ],
  },
];

function ManageInvoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tab, setTab] = useState("CURRENT");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const statusBadge = (status) => {
    const map = { PAID: "bg-green-200 text-green-700", DRAFT: "bg-yellow-200 text-yellow-700", SENT: "bg-blue-200 text-blue-700" };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}>{status}</span>;
  };

  const filteredInvoices = sampleInvoices.filter((inv) => {
    const matchSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" ? true : inv.status === statusFilter;
    const invoiceDateObj = new Date(inv.invoiceDate);
    const now = new Date();
    const diff = (now - invoiceDateObj) / (1000 * 60 * 60 * 24);
    const matchTab = tab === "CURRENT" ? diff <= 30 : diff > 30;
    return matchSearch && matchStatus && matchTab;
  });

  // ------------------- PDF Download for single invoice -------------------
  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Lenana Drops", 14, 20);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${invoice.invoiceDate}`, 14, 36);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 42);
    doc.text(`Client: ${invoice.clientName}`, 14, 48);
    doc.text(`Status: ${invoice.status}`, 14, 54);

    // Table for items
    const tableColumn = ["#", "Product", "Quantity", "Unit Price (KSh)", "Line Total (KSh)"];
    const tableRows = invoice.items.map((item, index) => [
      index + 1,
      item.productName,
      item.quantity,
      item.unitPriceKsh.toLocaleString(),
      item.lineTotalKsh.toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(14);
    doc.text(`Total: KSh ${invoice.invoiceTotalKsh.toLocaleString()}`, 14, finalY + 10);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  // ------------------- PDF Download for all filtered invoices -------------------
  const downloadAllInvoicesPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    filteredInvoices.forEach((invoice, index) => {
      doc.setFontSize(20);
      doc.text("Lenana Drops", 14, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, y); y += 6;
      doc.text(`Date: ${invoice.invoiceDate}`, 14, y); y += 6;
      doc.text(`Due Date: ${invoice.dueDate}`, 14, y); y += 6;
      doc.text(`Client: ${invoice.clientName}`, 14, y); y += 6;
      doc.text(`Status: ${invoice.status}`, 14, y); y += 8;

      const tableColumn = ["#", "Product", "Qty", "Unit Price (KSh)", "Line Total (KSh)"];
      const tableRows = invoice.items.map((item, idx) => [
        idx + 1,
        item.productName,
        item.quantity,
        item.unitPriceKsh.toLocaleString(),
        item.lineTotalKsh.toLocaleString(),
      ]);

      autoTable(doc, {
        startY: y,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
      });

      y = (doc.lastAutoTable.finalY || y) + 10;
      doc.setFontSize(14);
      doc.text(`Total: KSh ${invoice.invoiceTotalKsh.toLocaleString()}`, 14, y);
      y += 10;

      if (y > 250 && index !== filteredInvoices.length - 1) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("All_Invoices.pdf");
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {["CURRENT", "PAST"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${tab === t ? "bg-amber-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}`}
          >
            {t === "CURRENT" ? "Current Invoices" : "Past Invoices"}
          </button>
        ))}
      </div>

      {/* Filters + Download All */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
        </select>

        <button
          onClick={downloadAllInvoicesPDF}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Download All Filtered Invoices
        </button>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-10">No invoices found matching your filters.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="p-6 rounded-xl shadow bg-white dark:bg-gray-800 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold">{inv.invoiceNumber}</h2>
                {statusBadge(inv.status)}
              </div>
              <p className="flex items-center gap-2 text-sm mb-1">
                <FileText size={16} className="text-green-600" />
                Client: <span className="font-semibold">{inv.clientName}</span>
              </p>
              <p className="text-sm mb-1">
                Total: <span className="font-bold">KSh {inv.invoiceTotalKsh.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2 text-sm mb-3">
                <Calendar size={16} className="text-gray-500" />
                {inv.invoiceDate}
              </p>
              <button
                onClick={() => setSelectedInvoice(inv)}
                className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                View Invoice
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for invoice details */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full relative shadow-lg">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedInvoice.invoiceNumber}</h2>
            <p><strong>Client:</strong> {selectedInvoice.clientName}</p>
            <p><strong>Invoice Date:</strong> {selectedInvoice.invoiceDate}</p>
            <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
            <p><strong>Status:</strong> {selectedInvoice.status}</p>
            <p><strong>Total:</strong> KSh {selectedInvoice.invoiceTotalKsh.toLocaleString()}</p>

            <h3 className="mt-4 font-semibold text-lg">Items</h3>
            <ul className="list-disc pl-5">
              {selectedInvoice.items.map((item) => (
                <li key={item.id}>
                  {item.productName} - Qty: {item.quantity}, Unit: KSh {item.unitPriceKsh}, Total: KSh {item.lineTotalKsh}
                </li>
              ))}
            </ul>

            <button
              onClick={() => downloadInvoicePDF(selectedInvoice)}
              className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageInvoices;
