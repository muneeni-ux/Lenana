import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";
const PAGE_SIZE = 10; // per your choice

function RejectModal({ open, onClose, onSubmit, record }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            Reject Stock — {record?.recordId}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <XCircle size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Explain why this stock record is rejected. This is recorded for audit.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full min-h-[120px] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none"
        />

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-300 dark:bg-gray-600">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Please enter a reason.");
                return;
              }
              onSubmit(reason.trim());
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white"
          >
            Submit & Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckerStockApproval() {
  const token = localStorage.getItem("token");

  // local UI state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const categories = ["ALL", "Crates", "Bottles", "Stickers", "Packaging", "Other"];
  const statuses = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING_REVIEW", label: "Pending Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  // Fetch paginated data from backend
  const fetchRecords = async (opts = {}) => {
    const qPage = opts.page ?? page;
    setLoading(true);
    try {
      // Build query params for server-side filtering/pagination
      const qp = new URLSearchParams();
      qp.set("page", qPage);
      qp.set("limit", PAGE_SIZE);
      if (statusFilter && statusFilter !== "ALL") qp.set("status", statusFilter);
      if (categoryFilter && categoryFilter !== "ALL") qp.set("category", categoryFilter);
      if (search && search.trim()) qp.set("search", search.trim());

      const res = await fetch(`${SERVER_URL}/api/stock-in?${qp.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        // fallback: try to parse body for error message
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch stock records");
      }

      const data = await res.json();

      // Expecting { records: [...], total: 123 } from backend
      if (Array.isArray(data.records)) {
        setRecords(data.records);
        setTotalRecords(Number(data.total || data.count || data.records.length));
        setPage(Number(qPage));
      } else if (Array.isArray(data)) {
        // older backend may return array only
        setRecords(data);
        setTotalRecords(data.length);
        setPage(Number(qPage));
      } else {
        // unexpected shape
        setRecords([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // refetch when filters or page change
    fetchRecords({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, categoryFilter]);

  // also refetch when search changes with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchRecords({ page: 1 });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Approve action
  const approve = async (id) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/stock-in/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approve failed");
      toast.success("Record approved");
      // optimistic update / refetch
      fetchRecords({ page });
      setDrawerRecord(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Approve error");
    }
  };

  // Reject action (reason required)
  const reject = async (id, reason) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/stock-in/reject/${id}`, {
        method: "PUT",
        headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reject failed");
      toast.success("Record rejected");
      fetchRecords({ page });
      setDrawerRecord(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Reject error");
    }
  };

  // Derived: filtered client-side label if backend didn't map category->itemName
  const displayLabelFor = (r) => (r.category === "Other" ? r.itemName || r.category : r.category);

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil((totalRecords || records.length) / PAGE_SIZE));
  const pages = useMemo(() => {
    // simple numeric list — if many pages show truncated view (first...last)
    const arr = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  }, [totalPages]);

  return (
    <div className="pt-16 px-6 pb-10 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Approval</h1>
          <p className="text-gray-500">Review material stocks submitted by makers.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex-1 min-w-[240px]">
          <Search size={16} />
          <input
            className="bg-transparent outline-none w-full"
            placeholder="Search record ID or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-500">
          Showing page {page} of {totalPages} ({totalRecords} records)
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Item</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Maker</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && records.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}

            {!loading &&
              records.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-semibold">{rec.recordId}</td>
                  <td className="p-3">{displayLabelFor(rec)}</td>
                  <td className="p-3">{rec.quantity}</td>
                  <td className="p-3">Ksh {Number(rec.unitCost || 0).toLocaleString()}</td>
                  <td className="p-3 font-semibold">Ksh {Number(rec.totalCost || 0).toLocaleString()}</td>
                  <td className="p-3">
                    {rec.status === "PENDING_REVIEW" && (
                      <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-semibold">
                        Pending
                      </span>
                    )}
                    {rec.status === "APPROVED" && (
                      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-semibold">
                        Approved
                      </span>
                    )}
                    {rec.status === "REJECTED" && (
                      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 text-sm font-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-3">{rec.makerName || rec.createdByName || rec.createdBy || "---"}</td>

                  <td className="p-3">
                    <button
                      onClick={() => setDrawerRecord(rec)}
                      className="px-3 py-1 rounded-lg border flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Info size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (numeric) */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded-lg border ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => {
          // show nearby pages and first/last with truncation if many pages
          const shouldShow = (() => {
            if (totalPages <= 9) return true;
            if (p === 1 || p === totalPages) return true;
            if (Math.abs(p - page) <= 2) return true;
            if (p <= 3 && page <= 4) return true;
            if (p >= totalPages - 2 && page >= totalPages - 3) return true;
            return false;
          })();
          if (!shouldShow) {
            // render ellipsis placeholder only once for left/right
            return (p === 2 || p === totalPages - 1) ? <span key={`dots-${p}`} className="px-2">…</span> : null;
          }
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-lg border ${p === page ? "bg-amber-600 text-white" : "hover:bg-gray-100"}`}
            >
              {p}
            </button>
          );
        })}

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={`px-3 py-1 rounded-lg border ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Drawer */}
      {drawerRecord && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end py-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full p-6 shadow-xl overflow-y-auto">
            <h2 className="text-2xl font-bold mb-3">Stock Details</h2>
            <p className="text-sm text-gray-500 mb-3">Review the material information before approving or rejecting.</p>

            <div className="space-y-3">
              <div>
                <div className="text-gray-500 text-sm">Record ID</div>
                <div className="font-semibold">{drawerRecord.recordId}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Category / Item</div>
                <div className="font-semibold">{displayLabelFor(drawerRecord)}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Quantity</div>
                <div>{drawerRecord.quantity}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Unit Cost</div>
                <div>Ksh {Number(drawerRecord.unitCost || 0).toLocaleString()}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Total Cost</div>
                <div className="font-semibold text-green-600">Ksh {Number(drawerRecord.totalCost || 0).toLocaleString()}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Added By</div>
                <div>{drawerRecord.makerName || drawerRecord.createdByName || drawerRecord.createdBy || "—"}</div>
              </div>

              {drawerRecord.status === "REJECTED" && drawerRecord.rejectionReason && (
                <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-700 dark:text-red-300">
                  <strong>Rejection Reason:</strong>
                  <div>{drawerRecord.rejectionReason}</div>
                </div>
              )}
            </div>

            {drawerRecord.status === "PENDING_REVIEW" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => approve(drawerRecord.id)}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="inline mr-2" size={16} /> Approve
                </button>

                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="inline mr-2" size={16} /> Reject
                </button>
              </div>
            )}

            <button className="mt-4 w-full py-2 rounded-lg border" onClick={() => setDrawerRecord(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject modal */}
      <RejectModal
        open={rejectModalOpen}
        record={drawerRecord}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={(reason) => {
          if (!drawerRecord) return;
          reject(drawerRecord.id, reason);
          setRejectModalOpen(false);
        }}
      />
    </div>
  );
}
