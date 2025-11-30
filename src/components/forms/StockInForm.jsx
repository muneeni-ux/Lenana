import React, { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

function StockInForm({ onClose, categories }) {
  const [category, setCategory] = useState("Crates");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const total = quantity * unitCost;

  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (category === "Other" && !itemName.trim()) {
      toast.error("Please enter item name for category 'Other'");
      return;
    }

    const payload = {
      category,
      itemName: category === "Other" ? itemName : category,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      totalCost: total,
    };

    try {
      const res = await fetch(`${SERVER_URL}/api/stock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit stock record");
      }

      toast.success("Stock submitted for review!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred");
    }
  };

  const handleCategoryChange = (value) => {
    setCategory(value);

    if (value !== "Other") {
      setItemName(value);
    } else {
      setItemName("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          
          {/* HEADER */}
          <div className="flex justify-between mb-5">
            <h2 className="text-2xl font-bold">Add Stock</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <X />
            </button>
          </div>

          {/* CATEGORY */}
          <div className="mb-4">
            <label className="text-sm font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* ITEM NAME FIELD (ONLY WHEN OTHER) */}
          {category === "Other" && (
            <div className="mb-4">
              <label className="text-sm font-semibold">Item Name *</label>
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
            </div>
          )}

          {/* QUANTITY */}
          <div className="mb-4">
            <label className="text-sm font-semibold">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* UNIT COST */}
          <div className="mb-4">
            <label className="text-sm font-semibold">Unit Cost (Ksh)</label>
            <input
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* TOTAL COST */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-right font-semibold text-lg">
            Total Cost:{" "}
            <span className="text-green-600 dark:text-green-400">
              Ksh {total.toLocaleString()}
            </span>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockInForm;
