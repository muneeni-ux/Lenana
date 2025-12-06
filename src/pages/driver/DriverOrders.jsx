import React, { useState } from "react";
import {
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";

export default function DriverOrders() {
  const [tab, setTab] = useState("PENDING");
  const [expanded, setExpanded] = useState(null);

  const [orders, setOrders] = useState([
    {
      id: "ORD-101",
      client: "Mount Kenya Spa",
      address: "Nanyuki, Mt. Kenya Road",
      items: [
        { product: "20L Bottle", qty: 12 },
        { product: "1L Bottles Pack", qty: 30 },
      ],
      assignedDriver: "Driver David",
      status: "PENDING",
      deliveryDate: "2025-02-15",
      note: "Handle with care. Priority delivery.",
    },
    {
      id: "ORD-102",
      client: "Laikipia Hotel",
      address: "Laikipia Highway",
      items: [{ product: "10L Bottle", qty: 15 }],
      assignedDriver: "Driver David",
      status: "PENDING",
      deliveryDate: "2025-02-16",
      note: "",
    },
    {
      id: "ORD-099",
      client: "Nanyuki Mart",
      address: "View Estate",
      items: [{ product: "20L Bottle", qty: 20 }],
      assignedDriver: "Driver David",
      status: "DELIVERED",
      deliveryDate: "2025-02-12",
      note: "",
    },
  ]);

  const markDelivered = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "DELIVERED",
              deliveredOn: new Date().toISOString().split("T")[0],
            }
          : o
      )
    );

    // 🚀 READY for WebSocket emission
    // socket.emit("driver:delivered", { orderId: id });
  };

  const filtered = orders.filter((o) =>
    tab === "PENDING" ? o.status === "PENDING" : o.status === "DELIVERED"
  );

  const statusBadge = (status) => {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-800",
      DELIVERED: "bg-green-100 text-green-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="pt-16 px-6 pb-12 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Truck size={26} className="text-green-600" />
        Deliveries
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {["PENDING", "DELIVERED"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-semibold shadow transition ${
              tab === t
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            {t === "PENDING" ? "Pending Deliveries" : "Completed Deliveries"}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <p className="text-gray-500">No {tab.toLowerCase()} deliveries.</p>
        )}

        {filtered.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-xl transition"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold">{order.id}</h2>
                <p className="text-sm text-gray-500">
                  For <span className="font-semibold">{order.client}</span>
                </p>
              </div>

              {statusBadge(order.status)}
            </div>

            {/* Address */}
            <p className="flex items-center gap-2 mt-2 text-sm mb-1">
              <MapPin size={16} /> {order.address}
            </p>

            {/* Date */}
            <p className="flex items-center gap-2 text-sm mb-3">
              <Clock size={16} /> Delivery:{" "}
              <span className="font-semibold">{order.deliveryDate}</span>
            </p>

            {/* Expand section */}
            <button
              onClick={() =>
                setExpanded(expanded === order.id ? null : order.id)
              }
              className="flex items-center gap-2 text-green-600 hover:underline text-sm mt-2"
            >
              {expanded === order.id ? (
                <>
                  Hide Details <ChevronUp size={18} />
                </>
              ) : (
                <>
                  View Details <ChevronDown size={18} />
                </>
              )}
            </button>

            {/* Expanded Items */}
            {expanded === order.id && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package size={18} /> Items
                </h3>

                <div className="space-y-2 text-sm">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between pb-2 border-b dark:border-gray-600"
                    >
                      <span>
                        {item.product} × {item.qty}
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div className="mt-3 text-sm bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                    <strong>Note:</strong> {order.note}
                  </div>
                )}
              </div>
            )}

            {/* Action */}
            <div className="mt-5">
              {order.status === "PENDING" ? (
                <button
                  onClick={() => markDelivered(order.id)}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Mark as Delivered
                </button>
              ) : (
                <p className="text-green-600 font-semibold flex items-center gap-2 justify-center">
                  <CheckCircle size={18} /> Delivered on{" "}
                  {order.deliveredOn || order.deliveryDate}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
