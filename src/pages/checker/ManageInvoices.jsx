import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  FileText,
  Calendar,
  X,
  Trash2,
  CheckCircle,
  Loader2,
  Eye,
  Send,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";

function ManageInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tab, setTab] = useState("CURRENT");
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 6; // You can adjust this

  
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/invoices`, {
        withCredentials: true,
        headers: authHeaders(),
      });
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    setActionLoading((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      const { data } = await axios.get(
        `${SERVER_URL}/api/invoices/${invoiceId}`,
        { withCredentials: true, headers: authHeaders() }
      );
      setSelectedInvoice(data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const markAsSent = async (invoiceId) => {
    setActionLoading((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      await axios.post(
        `${SERVER_URL}/api/invoices/${invoiceId}/send`,
        {},
        { withCredentials: true, headers: authHeaders() }
      );
      fetchInvoices();
    } catch (error) {
      console.error("Error sending invoice:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const markAsPaid = async (invoiceId) => {
    setActionLoading((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      await axios.post(
        `${SERVER_URL}/api/invoices/${invoiceId}/pay`,
        {},
        { withCredentials: true, headers: authHeaders() }
      );
      fetchInvoices();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    setActionLoading((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      await axios.delete(`${SERVER_URL}/api/invoices/${invoiceId}`, {
        withCredentials: true,
        headers: authHeaders(),
      });
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  // ---------------- PDF for single invoice ----------------
  const downloadInvoicePDF = (invoice) => {
    if (!invoice) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Lenana Drops", 14, 20);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(
      `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
      14,
      36
    );
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      14,
      42
    );
    doc.text(`Client: ${invoice.clientName}`, 14, 48);
    doc.text(`Status: ${invoice.status}`, 14, 54);

    const tableColumn = [
      "#",
      "Product",
      "Qty",
      "Unit Price (KSh)",
      "Line Total (KSh)",
    ];
    const tableRows = invoice.items.map((item, idx) => [
      idx + 1,
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
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(14);
    doc.text(
      `Total: KSh ${invoice.invoiceTotalKsh.toLocaleString()}`,
      14,
      finalY + 10
    );
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  // ---------------- PDF for all invoices (each on separate page) ----------------
  const downloadAllInvoicesPDF = () => {
    if (!invoices.length) return;
    const doc = new jsPDF();

    invoices.forEach((invoice, index) => {
      if (index !== 0) doc.addPage();
      doc.setFontSize(20);
      doc.text("Lenana Drops", 14, 20);
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
      doc.text(
        `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
        14,
        36
      );
      doc.text(
        `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
        14,
        42
      );
      doc.text(`Client: ${invoice.clientName}`, 14, 48);
      doc.text(`Status: ${invoice.status}`, 14, 54);

      const tableColumn = [
        "#",
        "Product",
        "Qty",
        "Unit Price (KSh)",
        "Line Total (KSh)",
      ];
      const tableRows = invoice.items.map((item, idx) => [
        idx + 1,
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
      const finalY = doc.lastAutoTable.finalY || 60;
      doc.setFontSize(14);
      doc.text(
        `Total: KSh ${invoice.invoiceTotalKsh.toLocaleString()}`,
        14,
        finalY + 10
      );
    });

    doc.save("All_Invoices.pdf");
  };

  const statusBadge = (status) => {
    const map = {
      PAID: "bg-green-200 text-green-700",
      DRAFT: "bg-yellow-200 text-yellow-700",
      SENT: "bg-blue-200 text-blue-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  // Filters and tabs
  // Filters and tabs
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" ? true : inv.status === statusFilter;

    const invoiceDateObj = new Date(inv.invoiceDate);
    const now = new Date();
    const diff = (now - invoiceDateObj) / (1000 * 60 * 60 * 24);

    // CURRENT tab: invoices from last 30 days and not paid
    // PAST tab: invoices older than 30 days OR marked as PAID
    const matchTab =
      tab === "CURRENT"
        ? diff <= 30 && inv.status !== "PAID"
        : diff > 30 || inv.status === "PAID";

    return matchSearch && matchStatus && matchTab;
  });
// Calculate paginated invoices
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  // Total pages
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  // Pagination handlers
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <div className="pt-16 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {["CURRENT", "PAST"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              tab === t
                ? "bg-amber-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            }`}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          Download All Invoices
        </button>
      </div>

      {/* Invoice Cards */}
      {loading ? (
        <div>Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
          No invoices found matching your filters.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 rounded-xl shadow bg-white dark:bg-gray-800 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold">{inv.invoiceNumber}</h2>
                {statusBadge(inv.status)}
              </div>
              <p className="flex items-center gap-2 text-sm mb-1">
                <FileText size={16} className="text-green-600" />
                Client: <span className="font-semibold">{inv.clientName}</span>
              </p>
              <p className="text-sm mb-1">
                Total:{" "}
                <span className="font-bold">
                  KSh {inv.invoiceTotalKsh?.toLocaleString() || 0}
                </span>
              </p>
              <p className="flex items-center gap-2 text-sm mb-3">
                <Calendar size={16} className="text-gray-500" />
                {new Date(inv.invoiceDate).toLocaleDateString()}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fetchInvoiceDetails(inv.id)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex justify-center items-center"
                >
                  {actionLoading[inv.id] ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "View Invoice"
                  )}
                </button>
                {inv.status === "DRAFT" && (
                  <button
                    onClick={() => markAsSent(inv.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                  >
                    {actionLoading[inv.id] ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Mark as Sent"
                    )}
                  </button>
                )}
                {inv.status !== "PAID" && (
                  <button
                    onClick={() => markAsPaid(inv.id)}
                    className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex justify-center items-center"
                  >
                    {actionLoading[inv.id] ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Mark as Paid"
                    )}
                  </button>
                )}
                <button
                  onClick={() => deleteInvoice(inv.id)}
                  className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex justify-center items-center"
                >
                  {actionLoading[inv.id] ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-amber-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full relative shadow-lg max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {selectedInvoice.invoiceNumber}
            </h2>
            <p>
              <strong>Client:</strong> {selectedInvoice.clientName}
            </p>
            <p>
              <strong>Invoice Date:</strong>{" "}
              {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedInvoice.dueDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {selectedInvoice.status}
            </p>
            <p>
              <strong>Total:</strong> KSh{" "}
              {selectedInvoice.invoiceTotalKsh?.toLocaleString() || 0}
            </p>

            <h3 className="mt-4 font-semibold text-lg">Items</h3>
            <ul className="list-disc pl-5">
              {selectedInvoice.items?.map((item, idx) => (
                <li key={idx}>
                  {item.productName} - Qty: {item.quantity}, Unit: KSh{" "}
                  {item.unitPriceKsh}, Total: KSh {item.lineTotalKsh}
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
