import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

export default function InventoryEditModal({ item, onClose, onUpdated }) {
  const [warehouse, setWarehouse] = useState("");
  const [available, setAvailable] = useState(0);
  const [reserved, setReserved] = useState(0);
  const [damaged, setDamaged] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setWarehouse(item.warehouseLocation || "");
      setAvailable(item.quantityAvailable || 0);
      setReserved(item.quantityReserved || 0);
      setDamaged(item.quantityDamaged || 0);
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        warehouseLocation: warehouse,
        quantityAvailable: available,
        quantityReserved: reserved,
        quantityDamaged: damaged,
      };
      await axios.put(`${SERVER_URL}/api/inventory/${item.id}`, payload);
      toast.success("Inventory updated successfully");
      onUpdated(); // refresh inventory list in parent
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Inventory</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Warehouse</label>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Quantity Available</label>
            <input
              type="number"
              value={available}
              onChange={(e) => setAvailable(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Quantity Reserved</label>
            <input
              type="number"
              value={reserved}
              onChange={(e) => setReserved(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Quantity Damaged</label>
            <input
              type="number"
              value={damaged}
              onChange={(e) => setDamaged(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
              required
              min={0}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}
