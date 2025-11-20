import React, { useState } from "react";
import { X } from "lucide-react";

function RejectReasonModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-xl p-6 space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Reject Order
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Textarea */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Reason for Rejection
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full h-32 mt-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!reason.trim()) return;
              onSubmit(reason);
              setReason("");
            }}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            Submit Reason
          </button>
        </div>

      </div>
    </div>
  );
}

export default RejectReasonModal;
