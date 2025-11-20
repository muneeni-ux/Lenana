// src/components/inventory/inventoryUtils.js
export function exportInventoryCsv(inventory, products) {
  // Build CSV rows
  const rows = [
    ["Inventory ID","Product","Available","Reserved","Damaged","TotalOnHand","LastCountDate","DaysSupply"]
  ];
  inventory.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    const total = item.quantityAvailable + item.quantityReserved + item.quantityDamaged;
    rows.push([
      item.id,
      prod ? prod.name : item.productId,
      item.quantityAvailable,
      item.quantityReserved,
      item.quantityDamaged,
      total,
      item.lastStockCountDate || "",
      item.daysSupplyOnHand || ""
    ]);
  });
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// If item is below reorder threshold, create a production batch (stored to localStorage)
// This is a lightweight demo; in real app you'd call backend API.
export function createProductionBatchIfNeeded(item, products, setStockMovements) {
  try {
    const prod = products.find(p => p.id === item.productId);
    const threshold = prod?.reorderThreshold ?? 50;
    const total = item.quantityAvailable + item.quantityReserved + item.quantityDamaged;
    if (total < threshold) {
      const batchesRaw = localStorage.getItem("productionBatches");
      const batches = batchesRaw ? JSON.parse(batchesRaw) : [];
      // Avoid duplicate batches for same inventory item within short time
      const existing = batches.find(b => b.inventoryId === item.id && b.status !== "COMPLETED");
      if (existing) return null;
      const newBatch = {
        id: crypto.randomUUID(),
        batchId: "BATCH-" + Math.floor(Math.random() * 900 + 100),
        inventoryId: item.id,
        productId: item.productId,
        quantityPlanned: Math.max(threshold * 2, (threshold - total) + threshold),
        quantityCompleted: 0,
        quantityDefective: 0,
        quantityWasted: 0,
        productionDate: new Date().toISOString().split("T")[0],
        productionStartTime: null,
        productionEndTime: null,
        status: "PLANNED",
        assignedWorkerId: null,
        notes: "Auto-created by Inventory Reorder",
        qualityCheckPassed: false,
        createdBy: "system",
      };
      batches.unshift(newBatch);
      localStorage.setItem("productionBatches", JSON.stringify(batches));
      // create a stock movement log entry
      if (setStockMovements) {
        setStockMovements((logs) => [
          { id: crypto.randomUUID(), inventoryId: item.id, delta: 0, reason: "Auto-production-created", by: "system", date: new Date().toISOString() },
          ...logs,
        ]);
      }
      return newBatch;
    }
  } catch (e) {
    console.error("createProductionBatchIfNeeded error", e);
  }
  return null;
}
