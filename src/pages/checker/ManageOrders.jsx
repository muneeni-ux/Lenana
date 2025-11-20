import React, { useState } from "react";
import {
  Search,
  ClipboardList,
  CheckCircle,
  XCircle,
  ArrowRightCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Package,
  Calendar,
} from "lucide-react";
import RejectReasonModal from "../../components/cards/RejectReasonModal";

function ManageOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expanded, setExpanded] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      client: "Mount Kenya Spa",
      items: [
        { product: "20L Bottle", qty: 10, price: 250 },
        { product: "1L Bottle", qty: 20, price: 40 },
      ],
      total: 10 * 250 + 20 * 40,
      address: "Nanyuki, Mount Kenya Road",
      date: "2025-02-12",
      status: "PENDING",
      createdBy: "Maker John",
      rejectionReason: "",
    },
    {
      id: "ORD-002",
      client: "Nanyuki Mart",
      items: [{ product: "20L Bottle", qty: 30, price: 250 }],
      total: 30 * 250,
      address: "Nanyuki CBD",
      date: "2025-02-10",
      status: "APPROVED",
      createdBy: "Maker Sarah",
      rejectionReason: "",
    },
    {
      id: "ORD-003",
      client: "Laikipia Hotel",
      items: [
        { product: "10L Bottle", qty: 15, price: 160 },
        { product: "Small Pack", qty: 50, price: 120 },
      ],
      total: 15 * 160 + 50 * 120,
      address: "Laikipia Highway",
      date: "2025-02-05",
      status: "REJECTED",
      createdBy: "Maker Peter",
      rejectionReason: "Insufficient credit limit",
    },
  ]);

  const statusBadge = (status) => {
    const map = {
      PENDING: "bg-yellow-200 text-yellow-700",
      APPROVED: "bg-green-200 text-green-700",
      REJECTED: "bg-red-200 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : order.status === statusFilter;
    const matchesSearch =
      order.client.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const approveOrder = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "APPROVED" } : o
      )
    );
  };

  const triggerReject = (id) => {
    setSelectedOrderId(id);
    setRejectModalOpen(true);
  };

  const submitRejection = (reason) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderId
          ? { ...o, status: "REJECTED", rejectionReason: reason }
          : o
      )
    );
    setRejectModalOpen(false);
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All Orders</option>
        </select>
      </div>

      {/* Order List */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold">{order.id}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Client: <span className="font-semibold">{order.client}</span>
                </p>
              </div>
              {statusBadge(order.status)}
            </div>

            <p className="text-sm flex items-center gap-2 mb-1">
              <MapPin size={16} /> {order.address}
            </p>

            <p className="text-sm flex items-center gap-2 mb-1">
              <Calendar size={16} /> {order.date}
            </p>

            <p className="text-sm mb-2">
              Created By: <span className="font-semibold">{order.createdBy}</span>
            </p>

            {/* Expand */}
            <button
              onClick={() =>
                setExpanded(expanded === order.id ? null : order.id)
              }
              className="flex items-center gap-2 text-green-600 hover:underline text-sm mt-3"
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

            {/* Items */}
            {expanded === order.id && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package size={18} /> Items
                </h3>

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm border-b border-gray-300 dark:border-gray-600 pb-2"
                    >
                      <span>{item.product} × {item.qty}</span>
                      <span className="font-semibold">
                        KSh {item.qty * item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 font-bold text-green-700 dark:text-green-300">
                  Total: KSh {order.total.toLocaleString()}
                </p>

                {/* Show rejection reason */}
                {order.status === "REJECTED" && order.rejectionReason && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-sm text-red-700 dark:text-red-300">
                    <strong>Rejection Reason:</strong> {order.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-5 flex gap-3">
              {order.status === "PENDING" && (
                <>
                  <button
                    onClick={() => approveOrder(order.id)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>

                  <button
                    onClick={() => triggerReject(order.id)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </>
              )}

              {order.status === "APPROVED" && (
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <ArrowRightCircle size={18} />
                  Generate Invoice
                </button>
              )}

              {order.status === "REJECTED" && (
                <p className="w-full text-center text-red-600 font-semibold">
                  Order Rejected
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      <RejectReasonModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejection}
      />

    </div>
  );
}

export default ManageOrders;
