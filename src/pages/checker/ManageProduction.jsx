import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

function useLocalStorage(key, fallback) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

/* Rejection modal (unchanged from your version) */
function RejectionModal({ open, onClose, onSubmit, batch }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            Reject Batch — {batch?.batchId}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XCircle size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Please explain why this production batch is being rejected/marked
          defective. This reason will be saved with the batch for audit.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full min-h-[140px] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-400 outline-none"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-gray-300 dark:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) return;
              onSubmit(reason.trim());
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white"
          >
            Submit Reason & Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* QC Modal: centered, auto-calculates passedQty */
function QCModal({ open, onClose, batch, onSubmitQC, currentUser }) {
  const [defective, setDefective] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setDefective("");
      setNotes("");
    } else {
      setDefective("");
      setNotes("");
    }
  }, [open, batch]);

  if (!open || !batch) return null;

  const qtyCompleted = Number(batch.quantityCompleted ?? 0);
  const defectiveNum = Number(defective || 0);
  const passed = Math.max(0, qtyCompleted - (isNaN(defectiveNum) ? 0 : defectiveNum));

  const invalid =
    isNaN(defectiveNum) ||
    defectiveNum < 0 ||
    defectiveNum > qtyCompleted ||
    qtyCompleted <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">QC — {batch.batchId}</h3>
            <div className="text-sm text-gray-500">
              Product: {batch.product} • Produced: {qtyCompleted}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <XCircle size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Quantity Produced</label>
            <div className="mt-1 text-lg font-semibold">{qtyCompleted}</div>
          </div>

          <div>
            <label className="text-sm font-medium">Defective / Damaged Qty</label>
            <input
              type="number"
              min={0}
              max={qtyCompleted}
              value={defective}
              onChange={(e) => setDefective(e.target.value)}
              placeholder="0"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              Must be between 0 and {qtyCompleted}.
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Passed Quantity (auto)</label>
            <div className="mt-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900">
              <span className="text-lg font-semibold">{passed}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">QC Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about quality, defects, observations..."
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border">
              Cancel
            </button>

            <button
              onClick={() => {
                if (invalid) return;
                onSubmitQC({
                  defectiveQty: defectiveNum,
                  passedQty: passed,
                  qcNotes: notes.trim(),
                  qcBy: currentUser || "checker",
                  qcDate: new Date().toISOString(),
                });
              }}
              disabled={invalid}
              className={`flex-1 py-2 rounded-lg text-white ${invalid ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            >
              {invalid ? "Invalid values" : "Submit QC & Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageProduction() {
  const navigate = useNavigate();

  // Batches (read/write)
  const [batches, setBatches] = useLocalStorage("productionBatches", [
    {
      id: "BATCH-001",
      batchId: "BATCH-001",
      productId: "P1",
      product: "20L Bottle",
      quantityPlanned: 120,
      quantityCompleted: 120,
      productionDate: "2025-11-01",
      productionStartTime: "2025-11-01T07:00:00Z",
      productionEndTime: "2025-11-01T12:00:00Z",
      status: "COMPLETED", // PENDING | COMPLETED | APPROVED | REJECTED
      qualityCheckPassed: false,
      rejectionReason: "",
      createdBy: "maker.jane",
    },
    {
      id: "BATCH-002",
      batchId: "BATCH-002",
      productId: "P3",
      product: "Small Bottles Pack",
      quantityPlanned: 200,
      quantityCompleted: 200,
      productionDate: "2025-10-25",
      productionStartTime: "2025-10-25T08:00:00Z",
      productionEndTime: "2025-10-25T15:00:00Z",
      status: "APPROVED",
      qualityCheckPassed: true,
      defectiveQty: 5,
      passedQty: 195,
      qcNotes: "All good",
      qcBy: "checker.anne",
      qcDate: "2025-10-25T16:00:00Z",
      rejectionReason: "",
      createdBy: "maker.peter",
    },
  ]);

  // Inventory (we will update it when QC approves)
  const [inventory, setInventory] = useLocalStorage("inventory", [
    // seed could be empty; kept for demo
    {
      id: "INV-001",
      productId: "P1",
      warehouseLocation: "Factory",
      quantityAvailable: 120,
      quantityReserved: 20,
      quantityDamaged: 5,
      lastStockCountDate: "2025-02-10",
      lastReorderDate: "2025-01-20",
      daysSupplyOnHand: 14,
    },
  ]);

  // stock movement logs
  const [stockMovements, setStockMovements] = useLocalStorage("stockMovements", []);

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBatch, setSelectedBatch] = useState(null);

  // modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [qcTargetBatch, setQcTargetBatch] = useState(null);

  // product options derived from batches & inventory
  const productOptions = useMemo(() => {
    const map = new Map();
    batches.forEach((b) => {
      if (b.productId) map.set(b.productId, b.product);
    });
    inventory.forEach((i) => {
      if (!map.has(i.productId)) map.set(i.productId, `SKU ${i.productId}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [batches, inventory]);

  // filtered + sorted
  const filtered = useMemo(() => {
    return batches
      .filter((b) => {
        if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
        if (productFilter !== "All" && b.productId !== productFilter) return false;

        const s = search.trim().toLowerCase();
        if (s) {
          const hay = `${b.batchId} ${b.product} ${b.createdBy}`.toLowerCase();
          if (!hay.includes(s)) return false;
        }

        if (dateFrom && new Date(b.productionDate) < new Date(dateFrom)) return false;
        if (dateTo && new Date(b.productionDate) > new Date(dateTo)) return false;

        return true;
      })
      .sort((a, z) => {
        if (sortBy === "newest") return new Date(z.productionDate) - new Date(a.productionDate);
        if (sortBy === "oldest") return new Date(a.productionDate) - new Date(z.productionDate);
        if (sortBy === "product") return a.product.localeCompare(z.product);
        return 0;
      });
  }, [batches, statusFilter, productFilter, search, dateFrom, dateTo, sortBy]);

  // helper: open QC modal only when eligible
  const openQcIfEligible = (batch) => {
    // eligible when production is completed and there is produced quantity
    const completed = batch.status === "COMPLETED";
    const qtyMatch = Number(batch.quantityCompleted ?? 0) > 0; // requirement: quantityCompleted exists
    // optional stricter: require quantityCompleted === quantityPlanned
    const exactMatch = Number(batch.quantityCompleted ?? 0) === Number(batch.quantityPlanned ?? 0);

    if (!completed) {
      // show a small in-place notice (you can improve with toast)
      alert("Batch must be in COMPLETED state before QC.");
      return;
    }
    if (!qtyMatch) {
      alert("Produced quantity not recorded — can't QC.");
      return;
    }
    // If you want to require equality you can uncomment the following:
    if (!exactMatch) {
      // If you don't want to require exact equality, remove this block
      if (!window.confirm("Produced quantity does not match planned quantity. Proceed to QC anyway?")) return;
    }

    setQcTargetBatch(batch);
    setQcModalOpen(true);
  };

  // finalize QC: update batch, inventory and stock movements
  const handleSubmitQC = ({ defectiveQty, passedQty, qcNotes, qcBy, qcDate }) => {
    if (!qcTargetBatch) return;

    // update batch with qc results and set status APPROVED
    setBatches((prev) =>
      prev.map((b) =>
        b.id === qcTargetBatch.id
          ? {
              ...b,
              status: "APPROVED",
              qualityCheckPassed: true,
              defectiveQty,
              passedQty,
              qcNotes,
              qcBy,
              qcDate,
            }
          : b
      )
    );

    // update inventory: add passedQty to available, add defectiveQty to damaged
    setInventory((prevInv) => {
      const found = prevInv.find((it) => it.productId === qcTargetBatch.productId);
      const today = new Date().toISOString().split("T")[0];
      if (found) {
        return prevInv.map((it) =>
          it.productId === qcTargetBatch.productId
            ? {
                ...it,
                quantityAvailable: (Number(it.quantityAvailable || 0) + Number(passedQty)),
                quantityDamaged: (Number(it.quantityDamaged || 0) + Number(defectiveQty)),
                lastStockCountDate: today,
              }
            : it
        );
      } else {
        // create new inventory record if none exists
        const newInv = {
          id: "INV-" + Math.floor(Math.random() * 900000 + 100000),
          productId: qcTargetBatch.productId,
          warehouseLocation: "Factory",
          quantityAvailable: Number(passedQty),
          quantityReserved: 0,
          quantityDamaged: Number(defectiveQty),
          lastStockCountDate: today,
          lastReorderDate: null,
          daysSupplyOnHand: null,
        };
        return [newInv, ...prevInv];
      }
    });

    // add stock movement logs for passed and defective
    setStockMovements((prev) => {
      const base = [
        {
          id: crypto?.randomUUID ? crypto.randomUUID() : `sm-${Date.now()}-p`,
          inventoryId: qcTargetBatch.productId,
          delta: Number(passedQty),
          reason: `QC passed for ${qcTargetBatch.batchId}`,
          by: qcBy,
          date: qcDate,
        },
      ];
      if (Number(defectiveQty) > 0) {
        base.push({
          id: crypto?.randomUUID ? crypto.randomUUID() : `sm-${Date.now()}-d`,
          inventoryId: qcTargetBatch.productId,
          delta: -Number(defectiveQty), // records as negative to indicate damaged removal from available
          reason: `QC defective for ${qcTargetBatch.batchId}`,
          by: qcBy,
          date: qcDate,
        });
      }
      return [...base, ...prev];
    });

    // close modal
    setQcModalOpen(false);
    setQcTargetBatch(null);
  };

  // Approve button: instead of immediate approve we open QC modal if completed
  const onApproveClick = (batch) => {
    // If batch already approved, do nothing
    if (batch.status === "APPROVED") return;

    // If not completed, disallow approve
    if (batch.status !== "COMPLETED") {
      alert("Only COMPLETED batches can be QC-approved.");
      return;
    }

    // Open QC modal where checker records defective etc
    openQcIfEligible(batch);
  };

  // begin rejection flow
  const beginReject = (batch) => {
    setSelectedBatch(batch);
    setRejectModalOpen(true);
  };

  // final rejection
  const finalizeReject = (reason) => {
    if (!selectedBatch) return;
    setBatches((prev) =>
      prev.map((b) =>
        b.id === selectedBatch.id
          ? {
              ...b,
              status: "REJECTED",
              qualityCheckPassed: false,
              rejectionReason: reason,
            }
          : b
      )
    );
    setRejectModalOpen(false);
    setSelectedBatch(null);
  };

  // open details (right side)
  const openDetails = (batch) => {
    setSelectedBatch(batch);
  };

  return (
    <div className="pt-16 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Production</h1>
          <p className="text-gray-500 mt-1">
            Approve QC for completed batches, or mark batches as rejected. QC approval will record defects and update inventory automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={SPEC_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <FileText size={16} /> Spec
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by batch id, product or creator..."
              className="bg-transparent outline-none w-full"
            />
          </div>

          <select
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 w-full md:w-1/6"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 w-full md:w-1/6"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="All">All Products</option>
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm text-gray-500">F</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <label className="text-sm text-gray-500">T</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <select
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 w-full md:w-40 ml-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="product">Product</option>
          </select>
        </div>
      </div>

      {/* grid list + details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* left list */}
        <div className="md:col-span-2 space-y-4">
          {filtered.length === 0 && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow text-center text-gray-500">
              No production batches found for your filters.
            </div>
          )}

          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Package size={18} />
                    <h3 className="text-lg font-semibold">{b.product}</h3>
                    <span className="ml-2 text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600">
                      {b.batchId}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mt-2">
                    Planned: <strong>{b.quantityPlanned}</strong> · Produced:{" "}
                    <strong>{b.quantityCompleted ?? 0}</strong> · Date: {b.productionDate}
                  </div>

                  {b.rejectionReason && b.status === "REJECTED" && (
                    <div className="mt-2 rounded p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 text-sm">
                      <strong>Rejection:</strong> {b.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="mb-2">
                    {b.status === "PENDING" && (
                      <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-semibold">
                        PENDING
                      </span>
                    )}
                    {b.status === "COMPLETED" && (
                      <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-sm font-semibold">
                        COMPLETED
                      </span>
                    )}
                    {b.status === "APPROVED" && (
                      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-semibold">
                        APPROVED
                      </span>
                    )}
                    {b.status === "REJECTED" && (
                      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 text-sm font-semibold">
                        REJECTED
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => openDetails(b)}
                      className="w-full px-3 py-1 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                    >
                      <Info size={14} /> Details
                    </button>

                    <div className="mt-2 flex flex-col gap-2">
                      {/* Approve -> opens QC modal when eligible */}
                      <button
                        onClick={() => onApproveClick(b)}
                        disabled={b.status !== "COMPLETED"}
                        title={b.status !== "COMPLETED" ? "Only COMPLETED batches can be QC-approved" : "Open QC modal to approve"}
                        className={`px-3 py-1 rounded-lg text-white text-sm ${
                          b.status !== "COMPLETED"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <CheckCircle size={14} className="inline mr-2" /> Approve (QC)
                      </button>

                      <button
                        onClick={() => beginReject(b)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <XCircle size={14} className="inline mr-2" /> Mark Rejected
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* right details */}
        <aside className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Batch Details</h3>
            <span className="text-sm text-gray-500">Reference</span>
          </div>

          {!selectedBatch && (
            <div className="text-gray-500">Select a batch to see details, QC notes and inventory snapshot.</div>
          )}

          {selectedBatch && (
            <>
              <div>
                <div className="text-sm text-gray-500">Batch</div>
                <div className="font-bold text-lg">{selectedBatch.batchId}</div>
                <div className="text-sm text-gray-500">{selectedBatch.product}</div>
                <div className="mt-2 text-sm">Planned: {selectedBatch.quantityPlanned}</div>
                <div className="text-sm">Produced: {selectedBatch.quantityCompleted ?? 0}</div>
                <div className="text-sm">Date: {selectedBatch.productionDate}</div>

                <div className="mt-3">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-semibold">{selectedBatch.status}</div>
                </div>

                {selectedBatch.rejectionReason && (
                  <div className="mt-3 p-3 rounded bg-red-50 dark:bg-red-900/20 text-red-700">
                    <strong>Rejection Reason:</strong>
                    <div className="text-sm mt-1">{selectedBatch.rejectionReason}</div>
                  </div>
                )}

                {selectedBatch.qualityCheckPassed && (
                  <div className="mt-3 p-3 rounded bg-green-50 dark:bg-green-900/20 text-green-700">
                    <strong>QC Passed</strong>
                    <div className="text-sm mt-1">
                      Passed: {selectedBatch.passedQty ?? 0} • Defective: {selectedBatch.defectiveQty ?? 0}
                      <div className="text-xs text-gray-500">Checked by: {selectedBatch.qcBy} on {selectedBatch.qcDate}</div>
                      {selectedBatch.qcNotes && <div className="mt-1 text-sm">Notes: {selectedBatch.qcNotes}</div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t dark:border-gray-700">
                <h4 className="font-semibold mb-2">Inventory Snapshot (read-only)</h4>
                {(() => {
                  const inv = inventory.find((i) => i.productId === selectedBatch.productId);
                  if (!inv)
                    return <div className="text-sm text-gray-500">No inventory record</div>;
                  const total = inv.quantityAvailable + inv.quantityReserved + inv.quantityDamaged;
                  return (
                    <div className="text-sm">
                      <div>Available: <strong>{inv.quantityAvailable}</strong></div>
                      <div>Reserved: <strong>{inv.quantityReserved}</strong></div>
                      <div>Damaged: <strong className="text-red-600">{inv.quantityDamaged}</strong></div>
                      <div className="mt-2">Total On Hand: <strong>{total}</strong></div>
                      <div className="text-xs text-gray-500 mt-1">Last count: {inv.lastStockCountDate}</div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-3 border-t dark:border-gray-700 flex gap-2">
                <button onClick={() => setSelectedBatch(null)} className="flex-1 py-2 rounded-lg border">Close</button>
                <button onClick={() => navigate("/checker/production")} className="flex-1 py-2 rounded-lg bg-blue-600 text-white">Open Full View</button>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Modals */}
      <RejectionModal
        open={rejectModalOpen}
        batch={selectedBatch}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedBatch(null);
        }}
        onSubmit={(reason) => finalizeReject(reason)}
      />

      <QCModal
        open={qcModalOpen}
        batch={qcTargetBatch}
        onClose={() => {
          setQcModalOpen(false);
          setQcTargetBatch(null);
        }}
        currentUser={JSON.parse(localStorage.getItem("user"))?.username || "checker"}
        onSubmitQC={(qc) => handleSubmitQC(qc)}
      />
    </div>
  );
}
