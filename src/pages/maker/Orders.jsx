import React, { useState } from "react";
import { CheckCircle, PlusCircle } from "lucide-react";
import OrderForm from "../../components/forms/OrderForm";

function Orders() {
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [formOpen, setFormOpen] = useState(false);

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      client: "Mount Kenya Spa",
      items: 12,
      status: "Pending",
      date: "2025-02-12",
    },
    {
      id: "ORD-002",
      client: "Nanyuki Mart",
      items: 6,
      status: "Approved",
      date: "2025-02-11",
    },
    {
      id: "ORD-003",
      client: "Laikipia Hotel",
      items: 20,
      status: "Delivered",
      date: "2025-02-10",
    },
  ]);

  const addOrder = (newOrder) => {
    setOrders([newOrder, ...orders]);
  };

  const getStatusBadge = (status) => {
    const classes = {
      Pending: "bg-yellow-200 text-yellow-800",
      Approved: "bg-blue-200 text-blue-800",
      Delivered: "bg-green-200 text-green-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${classes[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={20} />
          Create Order
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Client</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .filter((o) => o.status === statusFilter)
              .map((order, i) => (
                <tr
                  key={i}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 font-semibold">{order.id}</td>
                  <td className="p-3">{order.client}</td>
                  <td className="p-3">{order.items}</td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3">{order.date}</td>
                  <td className="p-3">
                    {order.status === "Approved" && (
                      <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Mark Delivered
                      </button>
                    )}

                    {order.status === "Pending" && (
                      <span className="text-gray-500">Awaiting Checker</span>
                    )}

                    {order.status === "Delivered" && (
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

      {/* ORDER FORM MODAL */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={addOrder}
      />
    </div>
  );
}

export default Orders;
