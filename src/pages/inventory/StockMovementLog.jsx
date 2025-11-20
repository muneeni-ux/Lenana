// src/pages/inventory/StockMovementLog.jsx
import React from "react";
import { X, List, Download } from "lucide-react";

export default function StockMovementLog({ onClose, logs = [] }) {
  const exportCsv = () => {
    const rows = [["ID","InventoryId","Delta","Reason","By","Date"]];
    logs.forEach(l => rows.push([l.id,l.inventoryId,l.delta,l.reason,l.by,l.date]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `stock-movements-${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3"><List/> <h3 className="font-bold">Stock Movement Log</h3></div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} className="px-3 py-1 rounded bg-green-600 text-white flex items-center gap-2"><Download size={14}/> Export</button>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X/></button>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No movements yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500">
                <tr><th className="p-2">Date</th><th>Inventory</th><th>Delta</th><th>Reason</th><th>By</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="border-b dark:border-gray-800">
                    <td className="p-2 text-sm">{new Date(l.date).toLocaleString()}</td>
                    <td className="p-2 text-sm">{l.inventoryId}</td>
                    <td className="p-2 text-sm">{l.delta}</td>
                    <td className="p-2 text-sm">{l.reason}</td>
                    <td className="p-2 text-sm">{l.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
