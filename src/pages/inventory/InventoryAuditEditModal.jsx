// src/pages/inventory/InventoryEditAuditModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

export default function InventoryEditAuditModal({ item, onClose, onUpdated }) {
  const [warehouse, setWarehouse] = useState("");
  const [available, setAvailable] = useState(0);
  const [reserved, setReserved] = useState(0);
  const [damaged, setDamaged] = useState(0);
  const [counted, setCounted] = useState(0); // for audit
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setWarehouse(item.warehouseLocation || "");
      setAvailable(item.quantityAvailable || 0);
      setReserved(item.quantityReserved || 0);
      setDamaged(item.quantityDamaged || 0);
      setCounted(
        (item.quantityAvailable || 0) +
          (item.quantityReserved || 0) +
          (item.quantityDamaged || 0)
      );
    }
  }, [item]);

  const totalOnHand = available + reserved + damaged;

  const handleSave = async () => {
    if (counted < 0) return toast.error("Counted quantity cannot be negative");
    setLoading(true);
    try {
      // Adjust quantities if audit counted total differs
      let adjustedAvailable = available;
      let adjustedReserved = reserved;
      let adjustedDamaged = damaged;

      if (counted !== totalOnHand) {
        // Simple strategy: adjust Available to match counted total
        adjustedAvailable = Math.max(0, counted - reserved - damaged);
      }

      const payload = {
        warehouseLocation: warehouse,
        quantityAvailable: adjustedAvailable,
        quantityReserved: adjustedReserved,
        quantityDamaged: adjustedDamaged,
      };

      await axios.put(`${SERVER_URL}/api/inventory/${item.id}`, payload);
      toast.success("Inventory updated successfully");
      onUpdated(); // refresh parent inventory list
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit & Audit Inventory</h2>

        <div className="flex flex-col gap-4">
          {/* Warehouse */}
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

          {/* Quantities */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Quantity Available</label>
            <input
              type="number"
              value={available}
              onChange={(e) => setAvailable(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
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
              min={0}
            />
          </div>

          {/* Audit counted total */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Counted Total (Audit)</label>
            <input
              type="number"
              value={counted}
              onChange={(e) => setCounted(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-200"
              min={0}
            />
            <p className="text-sm text-gray-500 mt-1">
              Current total: {totalOnHand} (Available + Reserved + Damaged)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              {loading ? "Saving..." : "Save & Audit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
