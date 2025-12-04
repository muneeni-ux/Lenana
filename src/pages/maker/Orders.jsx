// import React, { useState } from "react";
// import { CheckCircle, PlusCircle, Send } from "lucide-react";
// import OrderForm from "../../components/forms/OrderForm";
// {
//   /* Stock to reduce in the system after delivery is made. When order is marked as delivered, the stock levels should be updated automatically.
//       Status: pending, delivered
//       */
// }
// function Orders() {
//   const [statusFilter, setStatusFilter] = useState("DRAFT");
//   const [formOpen, setFormOpen] = useState(false);

//   const [orders, setOrders] = useState([
//     {
//       id: "1",
//       orderId: "ORD-001",
//       client: "Mount Kenya Spa",
//       deliveryAddress: "Nanyuki CBD",
//       items: 12,
//       status: "DRAFT",
//       orderDate: "2025-02-12",
//       deliveryDate: "",
//       placementType: "MANUAL_ENTRY",
//     },
//     {
//       id: "2",
//       orderId: "ORD-002",
//       client: "Nanyuki Mart",
//       deliveryAddress: "Nanyuki View Estate",
//       items: 6,
//       status: "APPROVED",
//       orderDate: "2025-02-11",
//       deliveryDate: "2025-02-13",
//       placementType: "ONLINE",
//     },
//     {
//       id: "3",
//       orderId: "ORD-003",
//       client: "Laikipia Hotel",
//       deliveryAddress: "Laikipia",
//       items: 20,
//       status: "DELIVERED",
//       orderDate: "2025-02-10",
//       deliveryDate: "2025-02-12",
//       placementType: "PHONE",
//     },
//   ]);

//   const addOrder = (newOrder) => {
//     setOrders([newOrder, ...orders]);
//   };

//   const submitDraft = (id) => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === id ? { ...order, status: "SUBMITTED" } : order
//       )
//     );
//   };

//   const getStatusBadge = (status) => {
//     const colors = {
//       DRAFT: "bg-gray-200 text-gray-800",
//       SUBMITTED: "bg-yellow-200 text-yellow-800",
//       APPROVED: "bg-blue-200 text-blue-800",
//       DELIVERED: "bg-green-200 text-green-800",
//     };
//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status]}`}
//       >
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div className="pt-24 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Your Orders</h1>

//         <button
//           onClick={() => setFormOpen(true)}
//           className="flex items-center gap-2 bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition shadow"
//         >
//           <PlusCircle size={20} />
//           Create Order
//         </button>
//       </div>

//       {/* Filter */}
//       <div className="mb-6 flex items-center gap-4">
//         <label className="font-semibold">Filter by Status:</label>
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
//         >
//           <option>DRAFT</option>
//           <option>SUBMITTED</option>
//           <option>APPROVED</option>
//           <option>DELIVERED</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 dark:bg-gray-800">
//             <tr>
//               <th className="p-3">Order ID</th>
//               <th className="p-3">Client</th>
//               <th className="p-3">Items</th>
//               <th className="p-3">Address</th>
//               <th className="p-3">Placement</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Delivery</th>
//               <th className="p-3">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders
//               .filter((o) => o.status === statusFilter)
//               .map((order) => (
//                 <tr
//                   key={order.id}
//                   className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
//                 >
//                   <td className="p-3 font-semibold">{order.orderId}</td>
//                   <td className="p-3">{order.client}</td>
//                   <td className="p-3">{order.items}</td>
//                   <td className="p-3">{order.deliveryAddress}</td>
//                   <td className="p-3">{order.placementType}</td>
//                   <td className="p-3">{getStatusBadge(order.status)}</td>
//                   <td className="p-3">{order.deliveryDate || "---"}</td>

//                   <td className="p-3">
//                     {/* DRAFT → SUBMIT */}
//                     {order.status === "DRAFT" && (
//                       <button
//                         onClick={() => submitDraft(order.id)}
//                         className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
//                       >
//                         <Send size={16} />
//                         Submit
//                       </button>
//                     )}

//                     {/* SUBMITTED */}
//                     {order.status === "SUBMITTED" && (
//                       <span className="text-yellow-700 dark:text-yellow-300">
//                         Awaiting Checker
//                       </span>
//                     )}

//                     {/* APPROVED → deliver */}
//                     {order.status === "APPROVED" && (
//                       <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
//                         Mark Delivered
//                       </button>
//                     )}

//                     {/* Delivered */}
//                     {order.status === "DELIVERED" && (
//                       <span className="text-green-700 font-semibold flex items-center gap-2">
//                         <CheckCircle size={18} /> Completed
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       <OrderForm
//         open={formOpen}
//         onClose={() => setFormOpen(false)}
//         onSubmit={addOrder}
//       />
//     </div>
//   );
// }

// export default Orders;

import React, { useMemo, useState } from "react";
import { CheckCircle, PlusCircle, Send } from "lucide-react";
import OrderForm from "../../components/forms/OrderForm";
import SalesForm from "../../components/forms/SalesForm";

const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

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

export default function Orders() {
  // Seed clients, products, inventory if not present
  const defaultClients = [
    {
      id: "C1",
      businessName: "Mount Kenya Spa",
      phone: "+254712345678",
      deliveryAddress: "Nanyuki CBD",
    },
    {
      id: "C2",
      businessName: "Nanyuki Mart",
      phone: "+254723888444",
      deliveryAddress: "View Estate",
    },
    {
      id: "C3",
      businessName: "Laikipia Hotel",
      phone: "+254710000001",
      deliveryAddress: "Laikipia",
    },
  ];

  const defaultProducts = [
    {
      id: "P1",
      name: "20L Bottle",
      unitPriceKsh: 250,
      productionCostPerUnitKsh: 150,
    },
    {
      id: "P2",
      name: "10L Bottle",
      unitPriceKsh: 160,
      productionCostPerUnitKsh: 100,
    },
    {
      id: "P3",
      name: "Small Bottles Pack",
      unitPriceKsh: 120,
      productionCostPerUnitKsh: 70,
    },
  ];

  const seedOrders = [
    {
      id: "1",
      orderId: "ORD-001",
      clientId: "C1",
      clientName: "Mount Kenya Spa",
      orderDate: "2025-02-12",
      deliveryDate: "",
      deliveryAddress: "Nanyuki CBD",
      placementType: "MANUAL_ENTRY",
      status: "DRAFT",
      items: [
        {
          id: "oi-1",
          productId: "P1",
          productName: "20L Bottle",
          quantity: 12,
          unitPriceKsh: 250,
          productionCostPerUnitKsh: 150,
        },
      ],
      specialInstructions: "",
      customBrandingRequirements: "",
      createdBy: "maker",
      orderTotalKsh: 12 * 250,
      totalProductionCostKsh: 12 * 150,
      grossProfitKsh: 12 * (250 - 150),
      grossMarginPercent: ((12 * (250 - 150)) / (12 * 250)) * 100,
    },
  ];

  const [clients] = useLocalStorage("clients", defaultClients);
  const [products] = useLocalStorage("products", defaultProducts);
  const [inventory, setInventory] = useLocalStorage("inventory", [
    // optional seed - if you already have inventory, localStorage will keep it
    {
      id: "INV-001",
      productId: "P1",
      quantityAvailable: 120,
      quantityReserved: 20,
      quantityDamaged: 5,
    },
    {
      id: "INV-002",
      productId: "P2",
      quantityAvailable: 60,
      quantityReserved: 15,
      quantityDamaged: 2,
    },
    {
      id: "INV-003",
      productId: "P3",
      quantityAvailable: 15,
      quantityReserved: 10,
      quantityDamaged: 3,
    },
  ]);
  const [orders, setOrders] = useLocalStorage("orders", seedOrders);

  const [statusFilter, setStatusFilter] = useState("DRAFT");
  const [formOpen, setFormOpen] = useState(false);
  const [sales, setSales] = useLocalStorage("sales", []);
  const [saleFormOpen, setSaleFormOpen] = useState(false);

  // derived counts
  const counts = useMemo(() => {
    const c = { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, DELIVERED: 0 };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, [orders]);

  const addOrder = (newOrder) => {
    // ensure calculated fields exist (OrderForm should provide these, but guard)
    const enriched = {
      ...newOrder,
      orderTotalKsh:
        newOrder.orderTotalKsh ??
        (newOrder.items || []).reduce(
          (s, it) => s + it.quantity * it.unitPriceKsh,
          0
        ),
      totalProductionCostKsh:
        newOrder.totalProductionCostKsh ??
        (newOrder.items || []).reduce(
          (s, it) => s + it.quantity * it.productionCostPerUnitKsh,
          0
        ),
      grossProfitKsh: newOrder.grossProfitKsh ?? 0,
      grossMarginPercent: newOrder.grossMarginPercent ?? 0,
    };
    setOrders((prev) => [enriched, ...prev]);
  };

  const submitDraft = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "SUBMITTED" } : o))
    );
  };

  // Mark delivered: only allowed when APPROVED (the checker should set APPROVED in their UI)
  // When marking delivered, reduce inventory.quantityAvailable by items' quantities (simple behavior).
  const markDelivered = (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    if (order.status !== "APPROVED") {
      alert("Order must be APPROVED before marking as delivered.");
      return;
    }

    // reduce inventory
    const newInventory = [...inventory];
    order.items.forEach((it) => {
      const inv = newInventory.find((v) => v.productId === it.productId);
      if (inv) {
        inv.quantityAvailable = Math.max(
          0,
          (inv.quantityAvailable || 0) - Number(it.quantity || 0)
        );
      } else {
        // if no record, create one (optional)
        newInventory.push({
          id: "INV-" + Math.floor(Math.random() * 900000),
          productId: it.productId,
          quantityAvailable: Math.max(0, -Number(it.quantity || 0)),
          quantityReserved: 0,
          quantityDamaged: 0,
        });
      }
    });
    setInventory(newInventory);

    // set order to DELIVERED and set delivery date if missing
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "DELIVERED",
              deliveryDate:
                o.deliveryDate || new Date().toISOString().split("T")[0],
            }
          : o
      )
    );
  };
  const submitSale = (sale) => {
    // reduce inventory
    const newInventory = [...inventory];

    sale.items.forEach((it) => {
      const inv = newInventory.find((x) => x.productId === it.productId);
      if (inv) {
        inv.quantityAvailable = Math.max(
          0,
          inv.quantityAvailable - it.quantity
        );
      }
    });

    setInventory(newInventory);
    setSales((prev) => [sale, ...prev]);
  };

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: "bg-gray-200 text-gray-800",
      SUBMITTED: "bg-yellow-200 text-yellow-800",
      APPROVED: "bg-blue-200 text-blue-800",
      DELIVERED: "bg-green-200 text-green-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          colors[status] || "bg-gray-200 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-gray-500">
            Create, manage and submit orders. (Checkers handle approvals.)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={SPEC_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Spec
          </a>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-yellow-600 text-white py-2 px-5 rounded-lg hover:bg-yellow-700 transition shadow"
            >
              <PlusCircle size={20} /> Create Order
            </button>
            <button
              onClick={() => setSaleFormOpen(true)}
              className="flex items-center gap-2 bg-green-700 text-white py-2 px-5 rounded-lg hover:bg-green-800 transition shadow"
            >
              <PlusCircle size={20} />
              Make Sale
            </button>
          </div>
        </div>
      </div>

      {/* filters & counts */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <option value="ALL">ALL</option>
          <option value="DRAFT">DRAFT ({counts.DRAFT})</option>
          <option value="SUBMITTED">SUBMITTED ({counts.SUBMITTED})</option>
          <option value="APPROVED">APPROVED ({counts.APPROVED})</option>
          <option value="DELIVERED">DELIVERED ({counts.DELIVERED})</option>
        </select>
      </div>

      {/* table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Client</th>
              <th className="p-3">Items</th>
              <th className="p-3">Address</th>
              <th className="p-3">Placement</th>
              <th className="p-3">Status</th>
              <th className="p-3">Delivery</th>
              <th className="p-3">Order Total (Ksh)</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter((o) =>
                statusFilter === "ALL" ? true : o.status === statusFilter
              )
              .map((order) => (
                <tr
                  key={order.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3 font-semibold">{order.orderId}</td>
                  <td className="p-3">{order.clientName || order.client}</td>
                  <td className="p-3">{order.items?.length ?? order.items}</td>
                  <td className="p-3">{order.deliveryAddress}</td>
                  <td className="p-3">{order.placementType}</td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3">{order.deliveryDate || "---"}</td>
                  <td className="p-3 font-bold">
                    {Number(order.orderTotalKsh || 0).toLocaleString()}
                  </td>

                  <td className="p-3">
                    {/* DRAFT → Save as DRAFT (handled by modal) or Submit */}
                    {order.status === "DRAFT" && (
                      <button
                        onClick={() => submitDraft(order.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Send size={16} /> Submit
                      </button>
                    )}

                    {/* SUBMITTED */}
                    {order.status === "SUBMITTED" && (
                      <span className="text-yellow-700 dark:text-yellow-300">
                        Awaiting Checker
                      </span>
                    )}

                    {/* APPROVED → deliver (maker can mark delivered here if desired) */}
                    {order.status === "APPROVED" && (
                      <button
                        onClick={() => markDelivered(order.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                    )}

                    {/* Delivered */}
                    {order.status === "DELIVERED" && (
                      <span className="text-green-700 font-semibold flex items-center gap-2">
                        <CheckCircle size={18} /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* SALES TABLE */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-3">Walk-In Sales</h2>

        <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3">Sale ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total (Ksh)</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b dark:border-gray-700">
                  <td className="p-3 font-semibold">{s.saleId}</td>
                  <td className="p-3">{s.customerName}</td>
                  <td className="p-3">{s.items.length}</td>
                  <td className="p-3 font-bold">
                    {s.totalAmountKsh.toLocaleString()}
                  </td>
                  <td className="p-3">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* order form modal */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addOrder}
        clients={clients}
        products={products}
      />
      {/* sales form modal */}
      <SalesForm
        open={saleFormOpen}
        onClose={() => setSaleFormOpen(false)}
        onSubmit={submitSale}
        products={products}
      />
    </div>
  );
}
