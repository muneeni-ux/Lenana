import React, { useState } from "react";

export default function StockDetailsModal({ stock, onClose, onReject, loading }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-96 p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Reject {stock.recordId}</h2>
        <p className="mb-2">Item: {stock.itemName}</p>
        <p className="mb-4">Qty: {stock.quantity}</p>

        <textarea
          className="w-full border rounded p-2 mb-4 dark:bg-gray-800"
          rows={4}
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button 
            onClick={() => onReject(reason)} 
            className="px-4 py-2 rounded bg-red-600 text-white"
            disabled={loading || reason.trim() === ""}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
