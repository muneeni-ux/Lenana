import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import StockInForm from "../../components/forms/StockInForm";

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

export default function StockIn() {
  const [stockRecords, setStockRecords] = useLocalStorage("stockIn", []);

  const [formOpen, setFormOpen] = useState(false);

  const addStockRecord = (record) => {
    setStockRecords((prev) => [record, ...prev]);
  };

  const categories = ["Crates", "Bottles", "Stickers", "Packaging", "Other"];

  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Record Stock In</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add raw materials received for production.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white py-2 px-5 rounded-lg shadow hover:bg-green-700 transition"
        >
          <Plus size={20} /> Add Stock
        </button>
      </div>

      {/* Stock Records Table */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Total Cost</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {stockRecords.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="8">
                  No stock records yet.
                </td>
              </tr>
            )}

            {stockRecords.map((rec) => (
              <tr
                key={rec.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="p-3 font-semibold">{rec.recordId}</td>
                <td className="p-3">
                  {rec.category === "Other" ? rec.itemName : rec.category}
                </td>
                <td className="p-3">{rec.quantity}</td>
                <td className="p-3">Ksh {rec.unitCost.toLocaleString()}</td>
                <td className="p-3 font-bold">
                  Ksh {rec.totalCost.toLocaleString()}
                </td>
                <td className="p-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800">
                    {rec.status}
                  </span>
                </td>
                <td className="p-3">{rec.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {formOpen && (
        <StockInForm
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSubmit={addStockRecord}
        />
      )}
    </div>
  );
}
