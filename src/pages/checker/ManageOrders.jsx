import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  MapPin,
  Package,
  Calendar,
  UserCheck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import RejectReasonModal from "../../components/cards/RejectReasonModal";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [expanded, setExpanded] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [selectedDriver, setSelectedDriver] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // how many orders per page

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  /* ------------------ FETCH DATA ------------------ */

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/api/orders`, {
        headers: authHeaders(),
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/auth/users/drivers`, {
        headers: authHeaders(),
      });
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch drivers");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  /* ------------------ ACTIONS ------------------ */
  // --- APPROVE ORDER ---
  const approveOrder = async (id) => {
    try {
      // Structure: URL, DATA (empty), CONFIG (headers)
      await axios.patch(
        `${SERVER_URL}/api/orders/${id}/approve`,
        {}, // The request body is empty (must be explicitly provided)
        { headers: authHeaders() } // The configuration object containing headers
      );

      // Update local state upon successful approval
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "APPROVED" } : o))
      );
    } catch (err) {
      console.error("Failed to approve order:", err.response?.data || err);
      alert(
        "Failed to approve order: " +
          (err.response?.data?.error || "Check console for details.")
      );
    }
  };

  // --- REJECT ORDER ---

  // Helper to open the modal (no change needed here)
  const triggerReject = (id) => {
    setSelectedOrderId(id);
    setRejectModalOpen(true);
  };

  const submitRejection = async (reason) => {
    try {
      // Structure: URL, DATA ({rejectionReason}), CONFIG ({headers})
      await axios.patch(
        `${SERVER_URL}/api/orders/${selectedOrderId}/reject`,
        { rejectionReason: reason }, // The request body must contain the reason field
        { headers: authHeaders() } // The configuration object containing headers
      );

      // Update local state upon successful rejection
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderId
            ? { ...o, status: "REJECTED", rejectionReason: reason }
            : o
        )
      );
      setRejectModalOpen(false);
    } catch (err) {
      console.error("Failed to reject order:", err.response?.data || err);
      alert(
        "Failed to reject order: " +
          (err.response?.data?.error || "Check console for details.")
      );
    }
  };

  const assignDriver = async (orderId) => {
    const driverId = selectedDriver[orderId];
    if (!driverId) {
      alert("Please select a driver");
      return;
    }

    try {
      await axios.patch(
        `${SERVER_URL}/api/orders/${orderId}/assign`,
        {
          driverId,
        },
        { headers: authHeaders() }
      );

      const driver = drivers.find((d) => d.id === driverId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, assignedDriver: driver, status: "ASSIGNED" }
            : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to assign driver");
    }
  };

  /* ------------------ UI HELPERS ------------------ */

  const statusBadge = (status) => {
    const map = {
      SUBMITTED: "bg-yellow-200 text-yellow-700",
      APPROVED: "bg-green-200 text-green-700",
      REJECTED: "bg-red-200 text-red-700",
      ASSIGNED: "bg-blue-200 text-blue-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}
      >
        {status}
      </span>
    );
  };
  const formatDate = (d) => {
    if (!d) return "---";
    try {
      if (typeof d === "string" && d.includes("T")) return d.split("T")[0];
      const dt = new Date(d);
      if (!isNaN(dt)) return dt.toISOString().split("T")[0];
      return String(d);
    } catch {
      return String(d);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const client = order?.client || "";
    const id = order?.id || "";

    const matchesStatus =
      statusFilter === "ALL" ? true : order.status === statusFilter;

    const matchesSearch =
      client.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  // PAGINATION
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ------------------ RENDER ------------------ */

  if (loading) return <div className="p-6 text-center">Loading orders...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pt-16 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
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
          <option value="SUBMITTED">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="ASSIGNED">Driver Assigned</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All Orders</option>
        </select>
      </div>

      {/* Orders */}
      <div className="grid md:grid-cols-2 gap-6">
        {paginatedOrders.map((order) => (
          <div
            key={order.id}
            className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold">{order.id}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Client:{" "}
                  <span className="font-semibold">{order.clientName}</span>
                </p>
              </div>
              {statusBadge(order.status)}
            </div>

            <p className="text-sm flex items-center gap-2 mb-1">
              <MapPin size={16} /> {order.deliveryAddress}
            </p>

            <p className="text-sm flex items-center gap-2 mb-1">
              <Calendar size={16} /> {formatDate(order.deliveryDate)}
            </p>

            {/* Expand Details */}
            <button
              onClick={() =>
                setExpanded(expanded === order.id ? null : order.id)
              }
              className="flex items-center gap-2 text-green-600 hover:underline text-sm mt-3"
            >
              {expanded === order.id ? "Hide Details" : "View Details"}
              {expanded === order.id ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

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
                      <span>
                        {item.productName} × {item.qty}
                      </span>
                      <span className="font-semibold">
                        KSh {Number(item.lineTotalKsh).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-bold text-green-700 dark:text-green-300">
                  Total: KSh{" "}
                  {Number(order?.orderTotalKsh ?? 0).toLocaleString()}
                </p>
                {order.status === "REJECTED" && order.rejectionReason && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-sm">
                    <strong>Rejection Reason:</strong> {order.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3">
              {order.status === "SUBMITTED" && (
                <div className="flex gap-3">
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
                </div>
              )}

              {order.status === "APPROVED" && (
                <div className="space-y-3">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Assign Driver:
                  </p>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                    value={selectedDriver[order.id] || ""}
                    onChange={(e) =>
                      setSelectedDriver((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select a driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignDriver(order.id)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} /> Assign Driver
                  </button>
                </div>
              )}

              {order.status === "ASSIGNED" && (
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-800 dark:text-blue-300">
                  Assigned to: <strong>{order.assignedDriver?.name}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className={`px-4 py-2 rounded-lg border ${
            currentPage === 1
              ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Previous
        </button>

        <span className="font-semibold">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className={`px-4 py-2 rounded-lg border ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Next
        </button>
      </div>

      <RejectReasonModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejection}
      />
    </div>
  );
}

export default ManageOrders;
