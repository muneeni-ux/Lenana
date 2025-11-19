import React, { useState } from "react";

export default function BatchForm({ closeModal, addBatch, productOptions }) {
  const [newBatch, setNewBatch] = useState({ product: "", qty: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    addBatch(newBatch);
    closeModal();
    setNewBatch({ product: "", qty: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-xl animate-slide-up">
        <h2 className="text-2xl font-bold mb-5">Add Production Batch</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold">Product</label>
            <select
              required
              value={newBatch.product}
              onChange={(e) =>
                setNewBatch({ ...newBatch, product: e.target.value })
              }
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <option value="">Select product</option>
              {productOptions.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name} — KES {p.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Quantity</label>
            <input
              type="number"
              required
              value={newBatch.qty}
              onChange={(e) =>
                setNewBatch({ ...newBatch, qty: e.target.value })
              }
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            Save Batch
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="w-full bg-gray-300 dark:bg-gray-600 py-3 rounded-lg mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
