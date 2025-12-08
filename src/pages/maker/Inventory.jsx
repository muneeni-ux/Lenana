// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Search,
//   Package,
//   AlertTriangle,
//   Download,
//   RefreshCw,
//   FileText,
// } from "lucide-react";
// import axios from "axios";
// import InventoryAudit from "../inventory/InventoryAudit";
// import StockMovementLog from "../inventory/StockMovementLog";
// import { toast } from "react-hot-toast";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";
// const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

// export default function Inventory({ user }) {
//   const role = user?.role || "MAKER"; // from auth context
//   const [products, setProducts] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [stockMovements, setStockMovements] = useState([]);
//   const [audits, setAudits] = useState([]);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [productFilter, setProductFilter] = useState("All");
//   const [pageSize, setPageSize] = useState(10);
//   const [page, setPage] = useState(1);
//   const [useInfinite, setUseInfinite] = useState(false);
//   const loadMoreRef = useRef(null);
//   const [lowStockAlerts, setLowStockAlerts] = useState([]);
//   const [showStockMovement, setShowStockMovement] = useState(false);
//   const [showAudit, setShowAudit] = useState(false);

//   // Fetch products and inventory
//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get(`${SERVER_URL}/api/products`,);
//       setProducts(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch products");
//     }
//   };

//   const fetchInventory = async () => {
//     try {
//       const res = await axios.get(`${SERVER_URL}/api/inventory`,);
//       setInventory(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch inventory");
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     fetchInventory();
//   }, []);

//   // Compute low-stock alerts
//   useEffect(() => {
//     const alerts = inventory.filter((i) => {
//       const prod = products.find((p) => p.id === i.productId);
//       const total =
//         i.quantityAvailable + i.quantityReserved + i.quantityDamaged;
//       return prod && total < (prod.reorderLevel ?? 50);
//     });
//     setLowStockAlerts(alerts);
//   }, [inventory, products]);

//   // Infinite scroll
//   useEffect(() => {
//     if (!useInfinite) return;
//     const el = loadMoreRef.current;
//     if (!el) return;
//     const obs = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           setPage((p) => p + 1);
//         }
//       },
//       { rootMargin: "200px" }
//     );
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, [useInfinite]);

//   // Edit inventory modal (you can reuse InventoryAudit for counting or create a new modal)
//   const handleEditInventory = (item) => {
//     // open a modal with editable fields for warehouse, quantities, etc.
//     // populate modal with `item` values
//     toast("Edit modal opened (implement modal with form)");
//   };

//   // Delete inventory
//   const handleDeleteInventory = async (inventoryId) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this inventory item? This cannot be undone."
//       )
//     )
//       return;
//     try {
//       await axios.delete(`${SERVER_URL}/api/inventory/${inventoryId}`,);
//       toast.success("Inventory deleted");
//       fetchInventory(); // refresh list
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete inventory");
//     }
//   };

//   // Pagination & filtering
//   const filtered = useMemo(() => {
//     return inventory.filter((item) => {
//       const prodName =
//         products.find((p) => p.id === item.productId)?.productName || "";
//       const matchesSearch = prodName
//         .toLowerCase()
//         .includes(search.toLowerCase());
//       const matchesProduct =
//         productFilter === "All" || item.productId === productFilter;
//       const total =
//         item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

//       let matchesStatus = true;
//       if (statusFilter === "Low Stock") matchesStatus = total < 50;
//       if (statusFilter === "Healthy")
//         matchesStatus = total >= 50 && total <= 200;
//       if (statusFilter === "Overstock") matchesStatus = total > 200;

//       return matchesSearch && matchesProduct && matchesStatus;
//     });
//   }, [inventory, products, search, productFilter, statusFilter]);

//   const paged = useMemo(() => {
//     if (useInfinite) return filtered.slice(0, page * pageSize);
//     const start = (page - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, page, pageSize, useInfinite]);

//   const totalOnHand = (item) =>
//     item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

//   // Move stock
//   const moveStock = async ({
//     inventoryId,
//     delta,
//     reason = "Manual adjustment",
//   }) => {
//     try {
//       const res = await axios.post(
//         `${SERVER_URL}/api/inventory/move/${inventoryId}`,
//         { delta, reason }
//       );
//       setInventory((prev) =>
//         prev.map((it) =>
//           it.id === inventoryId
//             ? { ...it, quantityAvailable: res.data.newAvailable }
//             : it
//         )
//       );
//       // Refresh stock movements
//       const movements = await axios.get(
//         `${SERVER_URL}/api/stock-movements?inventoryId=${inventoryId}`
//       );
//       setStockMovements(movements.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to move stock");
//     }
//   };

//   // Run audit
//   const handleRunAudit = async (inventoryId, counted) => {
//     try {
//       const res = await axios.post(`${SERVER_URL}/api/inventory/audit`, {
//         inventoryId,
//         counted,
//       });
//       toast.success("Audit completed");
//       fetchInventory();
//     } catch (err) {
//       console.error(err);
//       toast.error("Audit failed");
//     }
//   };

//   // Export CSV
//   const handleExport = () => {
//     const csvData = filtered.map((i) => {
//       const prod = products.find((p) => p.id === i.productId);
//       return {
//         Product: prod?.productName || i.productId,
//         Available: i.quantityAvailable,
//         Reserved: i.quantityReserved,
//         Damaged: i.quantityDamaged,
//         Total: totalOnHand(i),
//         Warehouse: i.warehouseLocation,
//         LastCount: i.lastStockCountDate,
//       };
//     });
//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [
//         Object.keys(csvData[0]).join(","),
//         ...csvData.map((r) => Object.values(r).join(",")),
//       ].join("\n");
//     const link = document.createElement("a");
//     link.href = encodeURI(csvContent);
//     link.download = "inventory.csv";
//     link.click();
//   };

//   return (
//     <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-6 mb-8">
//         <div>
//           <h1 className="text-3xl font-bold">Inventory</h1>
//           <p className="text-gray-500 mt-1">
//             Real-time stock tracking & actions
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <a
//             href={SPEC_PDF_URL}
//             target="_blank"
//             rel="noreferrer"
//             className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
//             title="Open specification PDF"
//           >
//             <FileText size={16} /> Spec
//           </a>
//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
//           >
//             <Download size={16} /> Export
//           </button>
//           <button
//             onClick={fetchInventory}
//             className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
//           >
//             <RefreshCw size={16} />
//           </button>
//         </div>
//       </div>

//       {/* Low-stock summary */}
//       <div className="grid md:grid-cols-3 gap-6 mb-6">
//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Total SKUs</h4>
//           <div className="text-2xl font-bold mt-2">{inventory.length}</div>
//         </div>
//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Items In Stock</h4>
//           <div className="text-2xl font-bold mt-2">
//             {inventory.reduce((sum, i) => sum + i.quantityAvailable, 0)}
//           </div>
//         </div>
//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Low Stock Alerts</h4>
//           <div className="text-2xl font-bold mt-2 text-red-500">
//             {lowStockAlerts.length}
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
//         <div className="flex flex-col md:flex-row gap-3 md:items-center">
//           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
//             <Search size={16} />
//             <input
//               className="bg-transparent outline-none w-full"
//               placeholder="Search product..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <select
//             className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4"
//             value={productFilter}
//             onChange={(e) => setProductFilter(e.target.value)}
//           >
//             <option value="All">All Products</option>
//             {products.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.productName}
//               </option>
//             ))}
//           </select>
//           <select
//             className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4"
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

//       {/* Inventory table */}
//       <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 dark:bg-gray-800">
//             <tr>
//               <th className="p-3">Product</th>
//               <th className="p-3">Available</th>
//               <th className="p-3">Reserved</th>
//               <th className="p-3">Damaged</th>
//               <th className="p-3">Total On Hand</th>
//               <th className="p-3">Warehouse</th>
//               <th className="p-3">Last Count</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paged.map((item) => {
//               const prod = products.find((p) => p.id === item.productId);
//               const total = totalOnHand(item);
//               const low = prod ? total < (prod.reorderLevel ?? 50) : total < 50;

//               return (
//                 <tr
//                   key={item.id}
//                   className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
//                 >
//                   <td className="p-3 font-semibold flex items-center gap-2">
//                     <Package size={18} /> {prod?.productName || item.productId}
//                   </td>
//                   <td className="p-3">{item.quantityAvailable}</td>
//                   <td className="p-3">{item.quantityReserved}</td>
//                   <td className="p-3 text-red-500">{item.quantityDamaged}</td>
//                   <td className="p-3 font-bold">{total}</td>
//                   <td className="p-3">{item.warehouseLocation}</td>
//                   <td className="p-3">{item.lastStockCountDate}</td>
//                   <td className="p-3 flex gap-2">
//                     {/* Move stock: OWNER & CHECKER */}
//                     {(role === "OWNER" || role === "CHECKER") && (
//                       <>
//                         <button
//                           onClick={() =>
//                             moveStock({
//                               inventoryId: item.id,
//                               delta: -1,
//                               reason: "Manual dispatch",
//                             })
//                           }
//                           className="px-3 py-1 rounded bg-green-600 text-white"
//                         >
//                           -1
//                         </button>
//                         <button
//                           onClick={() =>
//                             moveStock({
//                               inventoryId: item.id,
//                               delta: 1,
//                               reason: "Manual add",
//                             })
//                           }
//                           className="px-3 py-1 rounded bg-blue-600 text-white"
//                         >
//                           +1
//                         </button>
//                         <button
//                           onClick={() => setShowAudit(true)}
//                           className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
//                         >
//                           Audit
//                         </button>
//                       </>
//                     )}

//                     {/* Edit: OWNER & CHECKER */}
//                     {(role === "OWNER" || role === "CHECKER") && (
//                       <button
//                         onClick={() => handleEditInventory(item)}
//                         className="px-3 py-1 rounded bg-yellow-500 text-white"
//                       >
//                         Edit
//                       </button>
//                     )}

//                     {/* Delete: ONLY OWNER */}
//                     {role === "OWNER" && (
//                       <button
//                         onClick={() => handleDeleteInventory(item.id)}
//                         className="px-3 py-1 rounded bg-red-600 text-white"
//                       >
//                         Delete
//                       </button>
//                     )}

//                     {/* Low stock indicator */}
//                     {low && (
//                       <span className="px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
//                         <AlertTriangle size={14} /> Low
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//             {paged.length === 0 && (
//               <tr>
//                 <td colSpan="8" className="p-6 text-center text-gray-500">
//                   No records
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {!useInfinite && (
//         <div className="flex items-center justify-between mt-4">
//           <div>
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               className="px-3 py-1 rounded border mr-2"
//             >
//               Prev
//             </button>
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               className="px-3 py-1 rounded border"
//             >
//               Next
//             </button>
//           </div>
//           <div className="text-sm text-gray-500">
//             Showing {paged.length} of {filtered.length} results
//           </div>
//         </div>
//       )}

//       {useInfinite && <div ref={loadMoreRef} className="h-6" />}

//       {/* Modals */}
//       {showStockMovement && (
//         <StockMovementLog
//           onClose={() => setShowStockMovement(false)}
//           logs={stockMovements}
//         />
//       )}
//       {showAudit && (
//         <InventoryAudit
//           onClose={() => setShowAudit(false)}
//           onRun={handleRunAudit}
//           inventory={inventory}
//           products={products}
//         />
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  Download,
  RefreshCw,
  FileText,
} from "lucide-react";
import axios from "axios";
import StockMovementLog from "../inventory/StockMovementLog";
import { toast } from "react-hot-toast";
import InventoryEditAuditModal from "../inventory/InventoryAuditEditModal";
import { createProductionBatchIfNeeded } from "../inventory/InventoryUtils";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";
const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

export default function Inventory({ user }) {
  const role = user?.role || "MAKER";
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [useInfinite, setUseInfinite] = useState(false);
  const loadMoreRef = useRef(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showStockMovement, setShowStockMovement] = useState(false);

  const [editItem, setEditItem] = useState(null); // <-- merged modal state

  // Fetch products & inventory
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/products`,{
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/inventory`,{
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setInventory(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, []);

  const fetchStockMovements = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/inventory/movements`,{
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setStockMovements(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stock movements");
    }
  };

  useEffect(() => {
    const alerts = inventory.filter((i) => {
      const prod = products.find((p) => p.id === i.productId);
      const total =
        i.quantityAvailable + i.quantityReserved + i.quantityDamaged;
      return prod && total < (prod.reorderLevel ?? 50);
    });
    setLowStockAlerts(alerts);
  }, [inventory, products]);

  // Pagination & filtering
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const prodName =
        products.find((p) => p.id === item.productId)?.productName || "";
      const matchesSearch = prodName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesProduct =
        productFilter === "All" || item.productId === productFilter;
      const total =
        item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

      let matchesStatus = true;
      if (statusFilter === "Low Stock") matchesStatus = total < 50;
      if (statusFilter === "Healthy")
        matchesStatus = total >= 50 && total <= 200;
      if (statusFilter === "Overstock") matchesStatus = total > 200;

      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [inventory, products, search, productFilter, statusFilter]);

  const paged = useMemo(() => {
    if (useInfinite) return filtered.slice(0, page * pageSize);
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, useInfinite]);

  const totalOnHand = (item) =>
    item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

  const handleEditInventory = (item) => setEditItem(item);

  const handleDeleteInventory = async (inventoryId) => {
    // if (
    //   !confirm(
    //     "Are you sure you want to delete this inventory item? This cannot be undone."
    //   )
    // )
    //   return;
    try {
      await axios.delete(`${SERVER_URL}/api/inventory/${inventoryId}`,{
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      toast.success("Inventory deleted");
      fetchInventory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete inventory");
    }
  };

  const formatDateTime = (d) => {
  if (!d) return "---";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleString(); // Shows both date and time
};

  const handleExport = () => {
    const csvData = filtered.map((i) => {
      const prod = products.find((p) => p.id === i.productId);
      return {
        Product: prod?.productName || i.productId,
        Available: i.quantityAvailable,
        Reserved: i.quantityReserved,
        Damaged: i.quantityDamaged,
        Total: totalOnHand(i),
        Warehouse: i.warehouseLocation,
        LastCount: i.lastStockCountDate,
      };
    });
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(csvData[0]).join(","),
        ...csvData.map((r) => Object.values(r).join(",")),
      ].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "inventory.csv";
    link.click();
  };

  return (
    <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Real-time stock tracking & actions
          </p>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={fetchInventory}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Low-stock summary */}
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
                <div className="font-semibold">
                  {lowStockAlerts.length} Low stock item(s)
                </div>
                <div className="text-sm">
                  Consider creating production batches or reorder.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await fetchStockMovements();
                  setShowStockMovement(true);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
              >
                View Movements
              </button>
              <button
                onClick={() => {
                  // quick auto-create batches (demo)
                  lowStockAlerts.forEach((it) =>
                    createProductionBatchIfNeeded(
                      it,
                      products,
                      setStockMovements
                    )
                  );
                }}
                className="px-3 py-1 rounded-lg bg-green-600 text-white"
              >
                Auto-create Batches
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
            <Search size={16} />
            <input
              className="bg-transparent outline-none w-full"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Low Stock</option>
            <option>Healthy</option>
            <option>Overstock</option>
          </select>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-500 mr-2">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <label className="ml-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useInfinite}
                onChange={(e) => {
                  setUseInfinite(e.target.checked);
                  setPage(1);
                }}
              />
              Infinite scroll
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Available</th>
              <th className="p-3">Reserved</th>
              <th className="p-3">Damaged</th>
              <th className="p-3">Total On Hand</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Last Count</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => {
              const prod = products.find((p) => p.id === item.productId);
              const total = totalOnHand(item);
              const low = prod ? total < (prod.reorderLevel ?? 50) : total < 50;

              return (
                <tr
                  key={item.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3 font-semibold flex items-center gap-2">
                    <Package size={18} /> {prod?.productName || item.productId}
                  </td>
                  <td className="p-3">{item.quantityAvailable}</td>
                  <td className="p-3">{item.quantityReserved}</td>
                  <td className="p-3 text-red-500">{item.quantityDamaged}</td>
                  <td className="p-3 font-bold">{total}</td>
                  <td className="p-3">{item.warehouseLocation}</td>
                  <td className="p-3">{formatDateTime(item.lastStockCountDate)}</td>
                  <td className="p-3 flex gap-2">
                    {(role === "OWNER" || role === "CHECKER") && (
                      <button
                        onClick={() => handleEditInventory(item)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white"
                      >
                        Edit / Audit
                      </button>
                    )}

                    {role === "OWNER" && (
                      <button
                        onClick={() => handleDeleteInventory(item.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    )}

                    {low && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle size={14} /> Low
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!useInfinite && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border mr-2"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Showing {paged.length} of {filtered.length} results
          </div>
        </div>
      )}

      {useInfinite && <div ref={loadMoreRef} className="h-6" />}

      {/* Modals */}
      {showStockMovement && (
        <StockMovementLog
          onClose={() => setShowStockMovement(false)}
          logs={stockMovements}
          products={products}
          inventory={inventory}
        />
      )}

      {editItem && (
        <InventoryEditAuditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={fetchInventory}
        />
      )}
    </div>
  );
}

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Search,
//   Package,
//   AlertTriangle,
//   Download,
//   RefreshCw,
//   List,
//   FileText,
// } from "lucide-react";
// import { exportInventoryCsv, createProductionBatchIfNeeded } from "../inventory/InventoryUtils";
// import InventoryAudit from "../inventory/InventoryAudit";
// import StockMovementLog from "../inventory/StockMovementLog";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

// const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf"; // <-- your uploaded file path

// const defaultProducts = [
//   { id: "P1", name: "20L Bottle", reorderThreshold: 50 },
//   { id: "P2", name: "10L Bottle", reorderThreshold: 40 },
//   { id: "P3", name: "Small Bottles Pack", reorderThreshold: 30 },
// ];

// const seedInventory = [
//   {
//     id: "INV-001",
//     productId: "P1",
//     warehouseLocation: "Factory",
//     quantityAvailable: 120,
//     quantityReserved: 20,
//     quantityDamaged: 5,
//     lastStockCountDate: "2025-02-10",
//     lastReorderDate: "2025-01-20",
//     daysSupplyOnHand: 14,
//   },
//   {
//     id: "INV-002",
//     productId: "P2",
//     warehouseLocation: "Factory",
//     quantityAvailable: 60,
//     quantityReserved: 15,
//     quantityDamaged: 2,
//     lastStockCountDate: "2025-02-09",
//     lastReorderDate: "2025-01-28",
//     daysSupplyOnHand: 7,
//   },
//   {
//     id: "INV-003",
//     productId: "P3",
//     warehouseLocation: "Factory",
//     quantityAvailable: 15,
//     quantityReserved: 10,
//     quantityDamaged: 3,
//     lastStockCountDate: "2025-02-10",
//     lastReorderDate: "2025-02-01",
//     daysSupplyOnHand: 2,
//   },
// ];

// function useLocalStorage(key, initial) {
//   const [state, setState] = useState(() => {
//     try {
//       const raw = localStorage.getItem(key);
//       return raw ? JSON.parse(raw) : initial;
//     } catch {
//       return initial;
//     }
//   });
//   useEffect(() => {
//     localStorage.setItem(key, JSON.stringify(state));
//   }, [key, state]);
//   return [state, setState];
// }

// export default function Inventory() {
//   const [products] = useLocalStorage("products", defaultProducts);
//   const [inventory, setInventory] = useLocalStorage("inventory", seedInventory);
//   const [stockMovements, setStockMovements] = useLocalStorage("stockMovements", []);
//   const [audits, setAudits] = useLocalStorage("inventoryAudits", []);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [productFilter, setProductFilter] = useState("All");
//   const [pageSize, setPageSize] = useState(10);
//   const [page, setPage] = useState(1);
//   const [useInfinite, setUseInfinite] = useState(false);
//   const loadMoreRef = useRef(null);
//   const [lowStockAlerts, setLowStockAlerts] = useState([]);
//   const [showStockMovement, setShowStockMovement] = useState(false);
//   const [showAudit, setShowAudit] = useState(false);

//   useEffect(() => {
//     // compute low-stock items
//     const alerts = inventory.filter((i) => {
//       const prod = products.find((p) => p.id === i.productId);
//       const total = i.quantityAvailable + i.quantityReserved + i.quantityDamaged;
//       return prod && total < (prod.reorderThreshold ?? 50);
//     });
//     setLowStockAlerts(alerts);

//     // optionally fire browser notifications
//     if (alerts.length > 0 && Notification && Notification.permission === "default") {
//       Notification.requestPermission();
//     }
//     if (alerts.length > 0 && Notification && Notification.permission === "granted") {
//       Notification.requestPermission().then(() => {
//         new Notification("Low stock alert", {
//           body: `${alerts.length} product(s) low on stock`,
//         });
//       });
//     }
//   }, [inventory, products]);

//   // pagination & infinite scroll
//   const filtered = useMemo(() => {
//     return inventory.filter((item) => {
//       const prodName = products.find((p) => p.id === item.productId)?.name || "";
//       const matchesSearch = prodName.toLowerCase().includes(search.toLowerCase());
//       const matchesProduct = productFilter === "All" || item.productId === productFilter;

//       const total = item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

//       let matchesStatus = true;
//       if (statusFilter === "Low Stock") matchesStatus = total < 50;
//       if (statusFilter === "Healthy") matchesStatus = total >= 50 && total <= 200;
//       if (statusFilter === "Overstock") matchesStatus = total > 200;

//       return matchesSearch && matchesProduct && matchesStatus;
//     });
//   }, [inventory, products, search, productFilter, statusFilter]);

//   // auto-create production batches for any item below reorderThreshold
//   useEffect(() => {
//     inventory.forEach((item) => {
//       createProductionBatchIfNeeded(item, products, setStockMovements);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on mount to simulate auto-create

//   // infinite scroll observer
//   useEffect(() => {
//     if (!useInfinite) return;
//     const el = loadMoreRef.current;
//     if (!el) return;
//     const obs = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           setPage((p) => p + 1);
//         }
//       },
//       { rootMargin: "200px" }
//     );
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, [useInfinite]);

//   // derived pagination
//   const paged = useMemo(() => {
//     if (useInfinite) {
//       return filtered.slice(0, page * pageSize);
//     }
//     const start = (page - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, page, pageSize, useInfinite]);

//   const totalOnHand = (item) =>
//     item.quantityAvailable + item.quantityReserved + item.quantityDamaged;

//   // move stock (example of stock movement that logs and updates inventory)
//   const moveStock = ({ inventoryId, delta, reason = "Adjustment", by = "system" }) => {
//     setInventory((prev) =>
//       prev.map((it) => {
//         if (it.id !== inventoryId) return it;
//         const available = Math.max(0, it.quantityAvailable + delta);
//         const updated = { ...it, quantityAvailable: available, lastStockCountDate: new Date().toISOString().split("T")[0] };
//         // add movement log
//         setStockMovements((logs) => [
//           { id: crypto.randomUUID(), inventoryId: it.id, delta, reason, by, date: new Date().toISOString() },
//           ...logs,
//         ]);
//         return updated;
//       })
//     );
//   };

//   const handleExport = () => {
//     exportInventoryCsv(filtered, products);
//   };

//   const handleRunAudit = (inventoryId, counted) => {
//     const before = inventory.find((i) => i.id === inventoryId);
//     if (!before) return;
//     const totalBefore = totalOnHand(before);
//     const totalAfter = counted;
//     // update inventory available to counted - reserved - damaged (simple)
//     setInventory((prev) =>
//       prev.map((it) =>
//         it.id === inventoryId
//           ? {
//               ...it,
//               quantityAvailable: Math.max(0, counted - it.quantityReserved - it.quantityDamaged),
//               lastStockCountDate: new Date().toISOString().split("T")[0],
//             }
//           : it
//       )
//     );
//     // save audit
//     setAudits((a) => [
//       {
//         id: crypto.randomUUID(),
//         inventoryId,
//         counted,
//         totalBefore,
//         totalAfter,
//         date: new Date().toISOString(),
//         by: "maker",
//       },
//       ...a,
//     ]);
//   };

//   return (
//     <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">

//       <div className="flex items-start justify-between gap-6 mb-8">
//         <div>
//           <h1 className="text-3xl font-bold">Inventory</h1>
//           <p className="text-gray-500 mt-1">Real-time stock tracking & actions</p>
//         </div>

//         <div className="flex items-center gap-3">
//           <a
//             href={SPEC_PDF_URL}
//             target="_blank"
//             rel="noreferrer"
//             className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
//             title="Open specification PDF"
//           >
//             <FileText size={16} /> Spec
//           </a>

//           <button
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
//             title="Download inventory CSV"
//           >
//             <Download size={16} /> Export
//           </button>

//           <button
//             onClick={() => {
//               // quick refresh demo
//               setInventory((s) => [...s]);
//             }}
//             className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
//             title="Refresh"
//           >
//             <RefreshCw size={16} />
//           </button>
//         </div>
//       </div>

//       {/* summary + low-stock banner */}
//       <div className="grid md:grid-cols-3 gap-6 mb-6">
//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Total SKUs</h4>
//           <div className="text-2xl font-bold mt-2">{inventory.length}</div>
//         </div>

//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Items In Stock</h4>
//           <div className="text-2xl font-bold mt-2">
//             {inventory.reduce((sum, i) => sum + i.quantityAvailable, 0)}
//           </div>
//         </div>

//         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
//           <h4 className="text-sm text-gray-500">Low Stock Alerts</h4>
//           <div className="text-2xl font-bold mt-2 text-red-500">
//             {lowStockAlerts.length}
//           </div>
//         </div>
//       </div>

//       {lowStockAlerts.length > 0 && (
//         <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-700 text-red-700 dark:text-red-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <AlertTriangle size={18} />
//               <div>
//                 <div className="font-semibold">{lowStockAlerts.length} Low stock item(s)</div>
//                 <div className="text-sm">Consider creating production batches or reorder.</div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setShowStockMovement(true)}
//                 className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
//               >
//                 View Movements
//               </button>
//               <button
//                 onClick={() => {
//                   // quick auto-create batches (demo)
//                   lowStockAlerts.forEach((it) => createProductionBatchIfNeeded(it, products, setStockMovements));
//                 }}
//                 className="px-3 py-1 rounded-lg bg-green-600 text-white"
//               >
//                 Auto-create Batches
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* filters */}
//       <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
//         <div className="flex flex-col md:flex-row gap-3 md:items-center">
//           <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-full md:w-1/3">
//             <Search size={16} />
//             <input className="bg-transparent outline-none w-full" placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} />
//           </div>

//           <select className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4" value={productFilter} onChange={e => setProductFilter(e.target.value)}>
//             <option value="All">All Products</option>
//             {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//           </select>

//           <select className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border w-full md:w-1/4" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
//             <option>All</option>
//             <option>Low Stock</option>
//             <option>Healthy</option>
//             <option>Overstock</option>
//           </select>

//           <div className="flex items-center gap-2 ml-auto">
//             <label className="text-sm text-gray-500 mr-2">Page size</label>
//             <select value={pageSize} onChange={e=> { setPageSize(Number(e.target.value)); setPage(1);}} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border">
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//             </select>

//             <label className="ml-4 flex items-center gap-2 text-sm">
//               <input type="checkbox" checked={useInfinite} onChange={e => { setUseInfinite(e.target.checked); setPage(1); }} />
//               Infinite scroll
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* table */}
//       <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 dark:bg-gray-800">
//             <tr>
//               <th className="p-3">Product</th>
//               <th className="p-3">Available</th>
//               <th className="p-3">Reserved</th>
//               <th className="p-3">Damaged</th>
//               <th className="p-3">Total On Hand</th>
//               <th className="p-3">Days Supply</th>
//               <th className="p-3">Warehouse</th>
//               <th className="p-3">Last Count</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paged.map((item) => {
//               const prod = products.find((p) => p.id === item.productId);
//               const total = totalOnHand(item);
//               const low = prod ? total < (prod.reorderThreshold ?? 50) : total < 50;
//               return (
//                 <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
//                   <td className="p-3 font-semibold flex items-center gap-2"><Package size={18}/> {prod?.name || item.productId}</td>
//                   <td className="p-3">{item.quantityAvailable}</td>
//                   <td className="p-3">{item.quantityReserved}</td>
//                   <td className="p-3 text-red-500">{item.quantityDamaged}</td>
//                   <td className="p-3 font-bold">{total}</td>
//                   <td className="p-3">{item.daysSupplyOnHand}</td>
//                   <td className="p-3">{item.warehouseLocation}</td>
//                   <td className="p-3">{item.lastStockCountDate}</td>
//                   <td className="p-3 flex gap-2">
//                     <button onClick={() => moveStock({ inventoryId: item.id, delta: -1, reason: "Manual dispatch", by: "maker" })} className="px-3 py-1 rounded bg-green-600 text-white">-1</button>
//                     <button onClick={() => moveStock({ inventoryId: item.id, delta: 1, reason: "Manual add", by: "maker" })} className="px-3 py-1 rounded bg-blue-600 text-white">+1</button>
//                     <button onClick={() => { setShowAudit(true); }} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">Audit</button>
//                     {low && <span className="px-2 py-1 rounded bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle size={14}/> Low</span>}
//                   </td>
//                 </tr>
//               );
//             })}

//             {paged.length === 0 && (
//               <tr>
//                 <td colSpan="8" className="p-6 text-center text-gray-500">No records</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* pagination controls */}
//       {!useInfinite && (
//         <div className="flex items-center justify-between mt-4">
//           <div>
//             <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border mr-2">Prev</button>
//             <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border">Next</button>
//           </div>
//           <div className="text-sm text-gray-500">Showing {paged.length} of {filtered.length} results</div>
//         </div>
//       )}

//       {/* infinite sentinel */}
//       {useInfinite && <div ref={loadMoreRef} className="h-6" />}

//       {/* overlays: stock movement log and audit */}
//       {showStockMovement && <StockMovementLog onClose={() => setShowStockMovement(false)} logs={stockMovements} />}
//       {showAudit && <InventoryAudit onClose={() => setShowAudit(false)} onRun={handleRunAudit} inventory={inventory} products={products} />}
//     </div>
//   );
// }
