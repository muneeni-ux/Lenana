import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

function OrderForm({ open, onClose, onSubmit }) {
  const [client, setClient] = useState("");
  const [items, setItems] = useState(1);
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      id: "ORD-" + Math.floor(Math.random() * 900 + 100),
      client,
      items,
      status: "Pending",
      date,
    });

    setClient("");
    setItems(1);
    setDate("");

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 shadow-xl h-full p-6 animate-slide-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Create New Order
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client */}
          <div>
            <label className="text-sm font-semibold">Client Name</label>
            <input
              type="text"
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              placeholder="Enter client name"
            />
          </div>

          {/* Items */}
          <div>
            <label className="text-sm font-semibold">Number of Items</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => items > 1 && setItems(items - 1)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <Minus size={18} />
              </button>

              <input
                type="number"
                value={items}
                min={1}
                onChange={(e) => setItems(Number(e.target.value))}
                className="w-20 text-center py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />

              <button
                type="button"
                onClick={() => setItems(items + 1)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold">Order Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Create Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
