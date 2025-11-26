import { useState } from "react";

function StockReject({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Reject Stock Entry</h2>

        <p className="text-gray-500 mb-3">
          Provide a reason for rejecting this stock-in record. This will be saved for audit.
        </p>

        <textarea
          className="w-full p-3 min-h-[120px] rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason..."
        />

        <div className="flex gap-3 mt-4">
          <button className="flex-1 py-2 rounded-lg bg-gray-300 dark:bg-gray-600" onClick={onClose}>
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-red-600 text-white"
            onClick={() => reason.trim() && onSubmit(reason)}
          >
            Submit & Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockReject;