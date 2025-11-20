import React, { useState } from "react";
import { CheckCircle, PlusCircle, Send } from "lucide-react";
import OrderForm from "../../components/forms/OrderForm";

function Orders() {
  const [statusFilter, setStatusFilter] = useState("DRAFT");
  const [formOpen, setFormOpen] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: "1",
      orderId: "ORD-001",
      client: "Mount Kenya Spa",
      deliveryAddress: "Nanyuki CBD",
      items: 12,
      status: "DRAFT",
      orderDate: "2025-02-12",
      deliveryDate: "",
      placementType: "MANUAL_ENTRY",
    },
    {
      id: "2",
      orderId: "ORD-002",
      client: "Nanyuki Mart",
      deliveryAddress: "Nanyuki View Estate",
      items: 6,
      status: "APPROVED",
      orderDate: "2025-02-11",
      deliveryDate: "2025-02-13",
      placementType: "ONLINE",
    },
    {
      id: "3",
      orderId: "ORD-003",
      client: "Laikipia Hotel",
      deliveryAddress: "Laikipia",
      items: 20,
      status: "DELIVERED",
      orderDate: "2025-02-10",
      deliveryDate: "2025-02-12",
      placementType: "PHONE",
    },
  ]);

  const addOrder = (newOrder) => {
    setOrders([newOrder, ...orders]);
  };

  const submitDraft = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: "SUBMITTED" } : order
      )
    );
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
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="pt-24 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Orders</h1>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition shadow"
        >
          <PlusCircle size={20} />
          Create Order
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
        >
          <option>DRAFT</option>
          <option>SUBMITTED</option>
          <option>APPROVED</option>
          <option>DELIVERED</option>
        </select>
      </div>

      {/* Table */}
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
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter((o) => o.status === statusFilter)
              .map((order) => (
                <tr
                  key={order.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3 font-semibold">{order.orderId}</td>
                  <td className="p-3">{order.client}</td>
                  <td className="p-3">{order.items}</td>
                  <td className="p-3">{order.deliveryAddress}</td>
                  <td className="p-3">{order.placementType}</td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3">{order.deliveryDate || "---"}</td>

                  <td className="p-3">
                    {/* DRAFT → SUBMIT */}
                    {order.status === "DRAFT" && (
                      <button
                        onClick={() => submitDraft(order.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Send size={16} />
                        Submit
                      </button>
                    )}

                    {/* SUBMITTED */}
                    {order.status === "SUBMITTED" && (
                      <span className="text-yellow-700 dark:text-yellow-300">
                        Awaiting Checker
                      </span>
                    )}

                    {/* APPROVED → deliver */}
                    {order.status === "APPROVED" && (
                      <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
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

      {/* Modal */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addOrder}
      />
    </div>
  );
}

export default Orders;
