// src/pages/inventory/InventoryAudit.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

export default function InventoryAudit({ onClose, inventory = [], products = [], onRun = () => {} }) {
  const [selected, setSelected] = useState(inventory[0]?.id || "");
  const [counted, setCounted] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-bold">Inventory Audit</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X/></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm">Select Inventory</label>
            <select className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800" value={selected} onChange={e => setSelected(e.target.value)}>
              {inventory.map(i => {
                const prod = products.find(p => p.id === i.productId);
                return <option key={i.id} value={i.id}>{prod?.name || i.productId} — {i.id}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="text-sm">Counted Quantity (total on hand)</label>
            <input type="number" className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800" value={counted} onChange={e => setCounted(Number(e.target.value))} />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={() => { if (!selected) return alert("Select inventory"); onRun(selected, counted); onClose(); }} className="px-4 py-2 rounded bg-green-600 text-white">Save Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
