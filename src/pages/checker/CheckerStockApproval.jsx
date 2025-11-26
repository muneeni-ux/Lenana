import React, { useMemo, useState } from "react";
import { Search, CheckCircle, XCircle, Info, Filter } from "lucide-react";
import StockReject from "../../components/cards/StockReject";

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}


/* ---------------------- MAIN COMPONENT ------------------------ */

export default function CheckerStockApproval() {
  const [records, setRecords] = useLocalStorage("stockIn", []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");

  const [drawerRecord, setDrawerRecord] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const categories = ["ALL", "Crates", "Bottles", "Stickers", "Packaging", "Other"];

  /* ---------------------- FILTERING ------------------------ */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

      const cat = r.category === "Other" ? r.itemName : r.category;
      if (categoryFilter !== "ALL" && cat !== categoryFilter) return false;

      if (search.trim()) {
        const hay = `${r.recordId} ${cat} ${r.itemName}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }

      return true;
    });
  }, [records, search, categoryFilter, statusFilter]);

  /* ---------------------- ACTIONS ------------------------ */
  const approve = (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    setDrawerRecord(null);
  };

  const reject = (id, reason) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "REJECTED", rejectionReason: reason }
          : r
      )
    );
    setDrawerRecord(null);
  };

  /* ---------------------- UI ------------------------ */
  return (
    <div className="pt-24 px-6 pb-10 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Approval</h1>
          <p className="text-gray-500">Review material stocks submitted by makers.</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex-1 min-w-[260px]">
          <Search size={16} />
          <input
            className="bg-transparent outline-none w-full"
            placeholder="Search record ID or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* TABLE */}
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
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}

            {filtered.map((rec) => {
              const itemLabel = rec.category === "Other" ? rec.itemName : rec.category;

              return (
                <tr
                  key={rec.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-semibold">{rec.recordId}</td>
                  <td className="p-3">{itemLabel}</td>
                  <td className="p-3">{rec.quantity}</td>
                  <td className="p-3">Ksh {rec.unitCost.toLocaleString()}</td>
                  <td className="p-3 font-semibold">
                    Ksh {rec.totalCost.toLocaleString()}
                  </td>

                  <td className="p-3">
                    {rec.status === "PENDING_REVIEW" && (
                      <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-semibold">
                        Pending Review
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

                  <td className="p-3">
                    <button
                      onClick={() => setDrawerRecord(rec)}
                      className="px-3 py-1 rounded-lg border flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Info size={14} /> Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DRAWER (DETAILS PANEL) */}
      {drawerRecord && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full p-6 shadow-xl overflow-y-auto">

            <h2 className="text-2xl font-bold mb-3">Stock Details</h2>

            <p className="text-sm text-gray-500 mb-3">
              Review the material information before approving or rejecting.
            </p>

            <div className="space-y-3">
              <div>
                <div className="text-gray-500 text-sm">Record ID</div>
                <div className="font-semibold">{drawerRecord.recordId}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Category / Item</div>
                <div className="font-semibold">
                  {drawerRecord.category === "Other"
                    ? drawerRecord.itemName
                    : drawerRecord.category}
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Quantity</div>
                <div>{drawerRecord.quantity}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Unit Cost</div>
                <div>Ksh {drawerRecord.unitCost.toLocaleString()}</div>
              </div>

              <div>
                <div className="text-gray-500 text-sm">Total Cost</div>
                <div className="font-semibold text-green-600">
                  Ksh {drawerRecord.totalCost.toLocaleString()}
                </div>
              </div>

              {/* Rejection Reason */}
              {drawerRecord.status === "REJECTED" && (
                <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-700 dark:text-red-300">
                  <strong>Rejection Reason:</strong>
                  <div>{drawerRecord.rejectionReason}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            {drawerRecord.status === "PENDING_REVIEW" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => approve(drawerRecord.id)}
                  className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="inline mr-2" size={16} />
                  Approve
                </button>

                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="inline mr-2" size={16} />
                  Reject
                </button>
              </div>
            )}

            <button
              className="mt-4 w-full py-2 rounded-lg border"
              onClick={() => setDrawerRecord(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      <StockReject
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={(reason) => {
          reject(drawerRecord.id, reason);
          setRejectModalOpen(false);
        }}
      />
    </div>
  );
}
