import React, { useState } from "react";
import { X } from "lucide-react";

function BatchForm({ closeModal, addBatch, productOptions }) {
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");

  const submit = (e) => {
    e.preventDefault();
    addBatch({ productId, qty });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Production Batch</h2>
          <button onClick={closeModal}>
            <X size={22} />
          </button>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="font-medium">Product</label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 mt-1"
            >
              <option value="">Select product</option>
              {productOptions.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} — KES {p.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Planned Quantity</label>
            <input
              type="number"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 mt-1"
            />
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Save Batch
          </button>
        </form>
      </div>
    </div>
  );
}

export default BatchForm;
