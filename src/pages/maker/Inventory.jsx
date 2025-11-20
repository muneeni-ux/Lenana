// import React, { useState } from "react";
// import { Search, Package, Filter, AlertTriangle } from "lucide-react";

// function Inventory() {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [productFilter, setProductFilter] = useState("All");

//   const products = [
//     { id: "P1", name: "20L Bottle" },
//     { id: "P2", name: "10L Bottle" },
//     { id: "P3", name: "Small Bottles Pack" },
//   ];

//   const [inventory, setInventory] = useState([
//     {
//       id: "INV-001",
//       productId: "P1",
//       warehouseLocation: "Factory",
//       quantityAvailable: 120,
//       quantityReserved: 20,
//       quantityDamaged: 5,
//       lastStockCountDate: "2025-02-10",
//       lastReorderDate: "2025-01-20",
//       daysSupplyOnHand: 14,
//     },
//     {
//       id: "INV-002",
//       productId: "P2",
//       warehouseLocation: "Factory",
//       quantityAvailable: 60,
//       quantityReserved: 15,
//       quantityDamaged: 2,
//       lastStockCountDate: "2025-02-09",
//       lastReorderDate: "2025-01-28",
//       daysSupplyOnHand: 7,
//     },
//     {
//       id: "INV-003",
//       productId: "P3",
//       warehouseLocation: "Factory",
//       quantityAvailable: 15,
//       quantityReserved: 10,
//       quantityDamaged: 3,
//       lastStockCountDate: "2025-02-10",
//       lastReorderDate: "2025-02-01",
//       daysSupplyOnHand: 2,
//     },
//   ]);

//   const getProductName = (id) => {
//     return products.find((p) => p.id === id)?.name || "Unknown";
//   };

//   const filteredInventory = inventory.filter((item) => {
//     const matchesSearch =
//       getProductName(item.productId)
//         .toLowerCase()
//         .includes(search.toLowerCase());

//     const matchesProduct =
//       productFilter === "All" || item.productId === productFilter;

//     const total = item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

//     let matchesStatus = true;
//     if (statusFilter === "Low Stock") matchesStatus = total < 50;
//     if (statusFilter === "Healthy") matchesStatus = total >= 50 && total <= 200;
//     if (statusFilter === "Overstock") matchesStatus = total > 200;

//     return matchesSearch && matchesProduct && matchesStatus;
//   });

//   return (
//     <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

//       <h1 className="text-3xl font-bold mb-6">Inventory</h1>

//       {/* --- SUMMARY CARDS --- */}
//       <div className="grid md:grid-cols-3 gap-6 mb-10">
//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
//           <h3 className="text-sm uppercase text-gray-500 mb-2">Total SKUs</h3>
//           <p className="text-3xl font-bold">{inventory.length}</p>
//         </div>

//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
//           <h3 className="text-sm uppercase text-gray-500 mb-2">Items In Stock</h3>
//           <p className="text-3xl font-bold">
//             {inventory.reduce((sum, i) => sum + i.quantityAvailable, 0)}
//           </p>
//         </div>

//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
//           <h3 className="text-sm uppercase text-gray-500 mb-2">Low Stock Alerts</h3>
//           <p className="text-3xl font-bold text-red-500">
//             {inventory.filter(
//               (i) =>
//                 i.quantityAvailable + i.quantityReserved + i.quantityDamaged < 50
//             ).length}
//           </p>
//         </div>
//       </div>

//       {/* --- FILTERS + SEARCH BAR --- */}
//       <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
//         <div className="flex flex-col md:flex-row md:items-center gap-4">

//           {/* Search */}
//           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
//             <Search className="text-gray-500" size={18} />
//             <input
//               type="text"
//               className="bg-transparent outline-none w-full"
//               placeholder="Search product..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           {/* Product Filter */}
//           <select
//             className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 w-full md:w-1/4"
//             value={productFilter}
//             onChange={(e) => setProductFilter(e.target.value)}
//           >
//             <option value="All">All Products</option>
//             {products.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           {/* Stock Status Filter */}
//           <select
//             className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 w-full md:w-1/4"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option>All</option>
//             <option>Low Stock</option>
//             <option>Healthy</option>
//             <option>Overstock</option>
//           </select>
//         </div>
//       </div>

//       {/* --- INVENTORY TABLE --- */}
//       <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-xl">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 dark:bg-gray-700">
//             <tr>
//               <th className="p-3">Product</th>
//               <th className="p-3">Available</th>
//               <th className="p-3">Reserved</th>
//               <th className="p-3">Damaged</th>
//               <th className="p-3">Total On Hand</th>
//               <th className="p-3">Days Supply</th>
//               <th className="p-3">Last Count</th>
//               <th className="p-3">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredInventory.map((item, i) => {
//               const total =
//                 item.quantityAvailable +
//                 item.quantityReserved +
//                 item.quantityDamaged;

//               const lowStock = total < 50;

//               return (
//                 <tr
//                   key={i}
//                   className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//                 >
//                   <td className="p-3 font-semibold flex items-center gap-2">
//                     <Package size={18} /> {getProductName(item.productId)}
//                   </td>
//                   <td className="p-3">{item.quantityAvailable}</td>
//                   <td className="p-3">{item.quantityReserved}</td>
//                   <td className="p-3 text-red-500">{item.quantityDamaged}</td>
//                   <td className="p-3 font-bold">{total}</td>
//                   <td className="p-3">{item.daysSupplyOnHand} days</td>
//                   <td className="p-3">{item.lastStockCountDate}</td>

//                   {/* Status */}
//                   <td className="p-3">
//                     {lowStock ? (
//                       <span className="px-3 py-1 rounded-full bg-red-200 text-red-700 flex items-center gap-1 w-fit">
//                         <AlertTriangle size={14} /> Low
//                       </span>
//                     ) : (
//                       <span className="px-3 py-1 rounded-full bg-green-200 text-green-700 w-fit">
//                         Healthy
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}

//             {filteredInventory.length === 0 && (
//               <tr>
//                 <td
//                   className="p-5 text-center text-gray-500 dark:text-gray-400"
//                   colSpan="8"
//                 >
//                   No inventory records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default Inventory;

// Actions zitakua za admin so tutatoa hapa later

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  Download,
  RefreshCw,
  List,
  FileText,
} from "lucide-react";
import { exportInventoryCsv, createProductionBatchIfNeeded } from "../inventory/InventoryUtils";
import InventoryAudit from "../inventory/InventoryAudit";
import StockMovementLog from "../inventory/StockMovementLog";

const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf"; // <-- your uploaded file path

const defaultProducts = [
  { id: "P1", name: "20L Bottle", reorderThreshold: 50 },
  { id: "P2", name: "10L Bottle", reorderThreshold: 40 },
  { id: "P3", name: "Small Bottles Pack", reorderThreshold: 30 },
];

const seedInventory = [
  {
    id: "INV-001",
    productId: "P1",
    warehouseLocation: "Factory",
    quantityAvailable: 120,
    quantityReserved: 20,
    quantityDamaged: 5,
    lastStockCountDate: "2025-02-10",
    lastReorderDate: "2025-01-20",
    daysSupplyOnHand: 14,
  },
  {
    id: "INV-002",
    productId: "P2",
    warehouseLocation: "Factory",
    quantityAvailable: 60,
    quantityReserved: 15,
    quantityDamaged: 2,
    lastStockCountDate: "2025-02-09",
    lastReorderDate: "2025-01-28",
    daysSupplyOnHand: 7,
  },
  {
    id: "INV-003",
    productId: "P3",
    warehouseLocation: "Factory",
    quantityAvailable: 15,
    quantityReserved: 10,
    quantityDamaged: 3,
    lastStockCountDate: "2025-02-10",
    lastReorderDate: "2025-02-01",
    daysSupplyOnHand: 2,
  },
];

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export default function Inventory() {
  const [products] = useLocalStorage("products", defaultProducts);
  const [inventory, setInventory] = useLocalStorage("inventory", seedInventory);
  const [stockMovements, setStockMovements] = useLocalStorage("stockMovements", []);
  const [audits, setAudits] = useLocalStorage("inventoryAudits", []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [useInfinite, setUseInfinite] = useState(false);
  const loadMoreRef = useRef(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    // compute low-stock items
    const alerts = inventory.filter((i) => {
      const prod = products.find((p) => p.id === i.productId);
      const total = i.quantityAvailable + i.quantityReserved + i.quantityDamaged;
      return prod && total < (prod.reorderThreshold ?? 50);
    });
    setLowStockAlerts(alerts);

    // optionally fire browser notifications
    if (alerts.length > 0 && Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
    if (alerts.length > 0 && Notification && Notification.permission === "granted") {
      Notification.requestPermission().then(() => {
        new Notification("Low stock alert", {
          body: `${alerts.length} product(s) low on stock`,
        });
      });
    }
  }, [inventory, products]);

  // pagination & infinite scroll
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const prodName = products.find((p) => p.id === item.productId)?.name || "";
      const matchesSearch = prodName.toLowerCase().includes(search.toLowerCase());
      const matchesProduct = productFilter === "All" || item.productId === productFilter;

      const total = item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

      let matchesStatus = true;
      if (statusFilter === "Low Stock") matchesStatus = total < 50;
      if (statusFilter === "Healthy") matchesStatus = total >= 50 && total <= 200;
      if (statusFilter === "Overstock") matchesStatus = total > 200;

      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [inventory, products, search, productFilter, statusFilter]);

  // auto-create production batches for any item below reorderThreshold
  useEffect(() => {
    inventory.forEach((item) => {
      createProductionBatchIfNeeded(item, products, setStockMovements);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount to simulate auto-create

  // infinite scroll observer
  useEffect(() => {
    if (!useInfinite) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [useInfinite]);

  // derived pagination
  const paged = useMemo(() => {
    if (useInfinite) {
      return filtered.slice(0, page * pageSize);
    }
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, useInfinite]);

  const totalOnHand = (item) =>
    item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

  // move stock (example of stock movement that logs and updates inventory)
  const moveStock = ({ inventoryId, delta, reason = "Adjustment", by = "system" }) => {
    setInventory((prev) =>
      prev.map((it) => {
        if (it.id !== inventoryId) return it;
        const available = Math.max(0, it.quantityAvailable + delta);
        const updated = { ...it, quantityAvailable: available, lastStockCountDate: new Date().toISOString().split("T")[0] };
        // add movement log
        setStockMovements((logs) => [
          { id: crypto.randomUUID(), inventoryId: it.id, delta, reason, by, date: new Date().toISOString() },
          ...logs,
        ]);
        return updated;
      })
    );
  };

  const handleExport = () => {
    exportInventoryCsv(filtered, products);
  };

  const handleRunAudit = (inventoryId, counted) => {
    const before = inventory.find((i) => i.id === inventoryId);
    if (!before) return;
    const totalBefore = totalOnHand(before);
    const totalAfter = counted;
    // update inventory available to counted - reserved - damaged (simple)
    setInventory((prev) =>
      prev.map((it) =>
        it.id === inventoryId
          ? {
              ...it,
              quantityAvailable: Math.max(0, counted - it.quantityReserved - it.quantityDamaged),
              lastStockCountDate: new Date().toISOString().split("T")[0],
            }
          : it
      )
    );
    // save audit
    setAudits((a) => [
      {
        id: crypto.randomUUID(),
        inventoryId,
        counted,
        totalBefore,
        totalAfter,
        date: new Date().toISOString(),
        by: "maker",
      },
      ...a,
    ]);
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-gray-500 mt-1">Real-time stock tracking & actions</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={SPEC_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            title="Open specification PDF"
          >
            <FileText size={16} /> Spec
          </a>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            title="Download inventory CSV"
          >
            <Download size={16} /> Export
          </button>

          <button
            onClick={() => {
              // quick refresh demo
              setInventory((s) => [...s]);
            }}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* summary + low-stock banner */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h4 className="text-sm text-gray-500">Total SKUs</h4>
          <div className="text-2xl font-bold mt-2">{inventory.length}</div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h4 className="text-sm text-gray-500">Items In Stock</h4>
          <div className="text-2xl font-bold mt-2">
            {inventory.reduce((sum, i) => sum + i.quantityAvailable, 0)}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h4 className="text-sm text-gray-500">Low Stock Alerts</h4>
          <div className="text-2xl font-bold mt-2 text-red-500">
            {lowStockAlerts.length}
          </div>
        </div>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 text-red-700 dark:text-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} />
              <div>
                <div className="font-semibold">{lowStockAlerts.length} Low stock item(s)</div>
                <div className="text-sm">Consider creating production batches or reorder.</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStockMovement(true)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
              >
                View Movements
              </button>
              <button
                onClick={() => {
                  // quick auto-create batches (demo)
                  lowStockAlerts.forEach((it) => createProductionBatchIfNeeded(it, products, setStockMovements));
                }}
                className="px-3 py-1 rounded-lg bg-green-600 text-white"
              >
                Auto-create Batches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* filters */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
            <Search size={16} />
            <input className="bg-transparent outline-none w-full" placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4" value={productFilter} onChange={e => setProductFilter(e.target.value)}>
            <option value="All">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Low Stock</option>
            <option>Healthy</option>
            <option>Overstock</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-500 mr-2">Page size</label>
            <select value={pageSize} onChange={e=> { setPageSize(Number(e.target.value)); setPage(1);}} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <label className="ml-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useInfinite} onChange={e => { setUseInfinite(e.target.checked); setPage(1); }} />
              Infinite scroll
            </label>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Available</th>
              <th className="p-3">Reserved</th>
              <th className="p-3">Damaged</th>
              <th className="p-3">Total On Hand</th>
              <th className="p-3">Days Supply</th>
              <th className="p-3">Last Count</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => {
              const prod = products.find((p) => p.id === item.productId);
              const total = totalOnHand(item);
              const low = prod ? total < (prod.reorderThreshold ?? 50) : total < 50;
              return (
                <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="p-3 font-semibold flex items-center gap-2"><Package size={18}/> {prod?.name || item.productId}</td>
                  <td className="p-3">{item.quantityAvailable}</td>
                  <td className="p-3">{item.quantityReserved}</td>
                  <td className="p-3 text-red-500">{item.quantityDamaged}</td>
                  <td className="p-3 font-bold">{total}</td>
                  <td className="p-3">{item.daysSupplyOnHand}</td>
                  <td className="p-3">{item.lastStockCountDate}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => moveStock({ inventoryId: item.id, delta: -1, reason: "Manual dispatch", by: "maker" })} className="px-3 py-1 rounded bg-green-600 text-white">-1</button>
                    <button onClick={() => moveStock({ inventoryId: item.id, delta: 1, reason: "Manual add", by: "maker" })} className="px-3 py-1 rounded bg-blue-600 text-white">+1</button>
                    <button onClick={() => { setShowAudit(true); }} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Audit</button>
                    {low && <span className="px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle size={14}/> Low</span>}
                  </td>
                </tr>
              );
            })}

            {paged.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">No records</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      {!useInfinite && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border mr-2">Prev</button>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
          </div>
          <div className="text-sm text-gray-500">Showing {paged.length} of {filtered.length} results</div>
        </div>
      )}

      {/* infinite sentinel */}
      {useInfinite && <div ref={loadMoreRef} className="h-6" />}

      {/* overlays: stock movement log and audit */}
      {showStockMovement && <StockMovementLog onClose={() => setShowStockMovement(false)} logs={stockMovements} />}
      {showAudit && <InventoryAudit onClose={() => setShowAudit(false)} onRun={handleRunAudit} inventory={inventory} products={products} />}
    </div>
  );
}
