import React, { useState } from "react";
import { PlusCircle, Clock, CheckCircle, Timer, Package } from "lucide-react";
{
  /* Product batches requested seen here (Begun Production button to start and set start time and end time when done)
      Track Progress: Update start/end times on the batches,
      Products inputted here after production(automatic if possible) status: Completed, defective, wasted (frontend to include product dropdown with prices) 
      Inventory view to see added products and their details and status
      */
}
function Production() {
  const [formOpen, setFormOpen] = useState(false);

  const [batches, setBatches] = useState([
    {
      id: "BATCH-001",
      product: "20L Bottle",
      qty: 50,
      status: "Pending",
      start: null,
      end: null,
    },
    {
      id: "BATCH-002",
      product: "10L Bottle",
      qty: 120,
      status: "In Progress",
      start: "2025-02-11 10:30 AM",
      end: null,
    },
    {
      id: "BATCH-003",
      product: "Small Bottles Pack",
      qty: 200,
      status: "Completed",
      start: "2025-02-10 08:00 AM",
      end: "2025-02-10 03:10 PM",
    },
  ]);

  const [newBatch, setNewBatch] = useState({
    product: "",
    qty: "",
  });

  const productOptions = [
    { name: "20L Bottle", price: 250 },
    { name: "10L Bottle", price: 160 },
    { name: "Small Bottles Pack", price: 120 },
  ];

  const addBatch = (e) => {
    e.preventDefault();
    setBatches([
      {
        id: "BATCH-" + Math.floor(Math.random() * 900 + 100),
        product: newBatch.product,
        qty: newBatch.qty,
        status: "Pending",
        start: null,
        end: null,
      },
      ...batches,
    ]);
    setFormOpen(false);
    setNewBatch({ product: "", qty: "" });
  };

  const startBatch = (id) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "In Progress",
              start: new Date().toLocaleString(),
            }
          : b
      )
    );
  };

  const completeBatch = (id) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "Completed",
              end: new Date().toLocaleString(),
            }
          : b
      )
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: "bg-yellow-200 text-yellow-800",
      "In Progress": "bg-blue-200 text-blue-800",
      Completed: "bg-green-200 text-green-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full font-semibold ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Production</h1>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={20} />
          Add Batch
        </button>
      </div>

      {/* Batch List */}
      <div className="grid md:grid-cols-2 gap-6">
        {batches.map((batch, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package size={20} /> {batch.product}
              </h2>
              {getStatusBadge(batch.status)}
            </div>

            <p className="text-sm mb-1">Batch ID: {batch.id}</p>
            <p className="text-sm mb-1">Quantity: {batch.qty}</p>

            {batch.start && (
              <p className="text-sm mb-1 flex items-center gap-2">
                <Clock size={14} /> Started: {batch.start}
              </p>
            )}

            {batch.end && (
              <p className="text-sm mb-1 flex items-center gap-2">
                <CheckCircle size={14} /> Completed: {batch.end}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-4">
              {batch.status === "Pending" && (
                <button
                  onClick={() => startBatch(batch.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Begin Production
                </button>
              )}

              {batch.status === "In Progress" && (
                <button
                  onClick={() => completeBatch(batch.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Completed
                </button>
              )}

              {batch.status === "Completed" && (
                <p className="text-green-700 font-semibold mt-2">
                  Production Completed
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD BATCH FORM (Slide-in) */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 h-full p-6 animate-slide-left shadow-xl">
            <h2 className="text-2xl font-bold mb-5">Add Production Batch</h2>

            <form onSubmit={addBatch} className="space-y-5">
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
                onClick={() => setFormOpen(false)}
                className="w-full bg-gray-300 dark:bg-gray-600 py-3 rounded-lg mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Production;
