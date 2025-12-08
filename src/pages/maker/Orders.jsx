import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  PlusCircle,
  Send,
  Search as SearchIcon,
} from "lucide-react";
import OrderForm from "../../components/forms/OrderForm";
import SalesForm from "../../components/forms/SalesForm";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";

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

export default function Orders() {
  const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

  // local fallback seeds (offline/demo)
  const [clients, setClients] = useLocalStorage("clients", [
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
  ]);

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useLocalStorage("sales", []);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [saleFormOpen, setSaleFormOpen] = useState(false);

  const [loading, setLoading] = useState({
    products: false,
    orders: false,
    inventory: false,
    clients: false,
  });

  // pagination & search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch initial data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading({
          products: true,
          orders: true,
          inventory: true,
          clients: true,
        });

        const [prodRes, ordersRes, invRes, clientsRes] =
          await Promise.allSettled([
            axios.get(`${SERVER_URL}/api/products`, { headers: authHeaders() }),
            axios.get(`${SERVER_URL}/api/orders`, { headers: authHeaders() }),
            axios.get(`${SERVER_URL}/api/inventory`, {
              headers: authHeaders(),
            }),
            axios.get(`${SERVER_URL}/api/clients`, { headers: authHeaders() }), // <-- assuming backend exposes /clients
          ]);

        if (prodRes.status === "fulfilled")
          setProducts(prodRes.value.data || []);
        if (ordersRes.status === "fulfilled")
          setOrders(ordersRes.value.data || []);
        if (invRes.status === "fulfilled")
          setInventory(invRes.value.data || []);
        if (clientsRes.status === "fulfilled")
          setClients(clientsRes.value.data || clients); // fallback to local
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading({
          products: false,
          orders: false,
          inventory: false,
          clients: false,
        });
      }
    };
    loadData();
  }, []);

  // Counts by status
  const counts = useMemo(() => {
    const c = { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, DELIVERED: 0 };
    orders.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, [orders]);

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

  // --- API handlers ---
  const createOrderApi = async (orderPayload) => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/orders`, orderPayload, {
        headers: authHeaders(),
      });
      const all = await axios.get(`${SERVER_URL}/api/orders`, {
        headers: authHeaders(),
      });
      setOrders(all.data || []);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  };

  const createWalkInSaleApi = async (salePayload) => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/orders/walk-in`,
        salePayload,
        { headers: authHeaders() }
      );
      const [ordersRes, invRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/orders`, { headers: authHeaders() }),
        axios.get(`${SERVER_URL}/api/inventory`, { headers: authHeaders() }),
      ]);
      setOrders(ordersRes.data || []);
      setInventory(invRes.data || []);
      setSales((prev) => [
        {
          ...salePayload,
          createdAt: new Date().toISOString(),
          backendResult: res.data,
        },
        ...prev,
      ]);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message,
      };
    }
  };

  const submitDraft = async (orderId) => {
    try {
      // 1. Define the body containing the status change
      const updateBody = {
        status: "SUBMITTED",
      };

      // 2. PATCH request to update order status, sending the updateBody
      const res = await axios.patch(
        `${SERVER_URL}/api/orders/${orderId}`,
        updateBody, // <-- This is the key change!
        { headers: authHeaders() }
      );

      // update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "SUBMITTED" } : o))
      );

      alert(`Order ${orderId} successfully submitted!`); // Add success confirmation
    } catch (err) {
      console.error("Failed to submit draft:", err);
      alert(
        "Failed to submit draft: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleOrderSubmit = async (order) => {
    const result = await createOrderApi(order);
    if (!result.success) alert("Failed to create order: " + result.error);
    else setFormOpen(false);
  };

  const handleSaleSubmit = async (sale) => {
    const result = await createWalkInSaleApi(sale);
    if (!result.success)
      alert("Failed to record walk-in sale: " + result.error);
    else setSaleFormOpen(false);
  };

  // --- Filtering, search, pagination ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) =>
      statusFilter === "ALL" ? true : o.status === statusFilter
    );
    if (!q) return list;
    return list.filter((o) => {
      const fields = [
        o.orderCode,
        o.orderId,
        o.id,
        o.clientName,
        o.client,
        o.deliveryAddress,
        o.placementType,
        o.status,
        o.orderTotalKsh && String(o.orderTotalKsh),
        o.deliveryDate && formatDate(o.deliveryDate),
        o.orderDate && formatDate(o.orderDate),
      ].filter(Boolean);
      return fields.some((f) => String(f).toLowerCase().includes(q));
    });
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

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
      {/* Header */}
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
              <PlusCircle size={20} /> Make Sale
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
          >
            <option value="ALL">ALL</option>
            <option value="DRAFT">DRAFT ({counts.DRAFT})</option>
            <option value="SUBMITTED">SUBMITTED ({counts.SUBMITTED})</option>
            <option value="APPROVED">APPROVED ({counts.APPROVED})</option>
            <option value="DELIVERED">DELIVERED ({counts.DELIVERED})</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-full sm:w-80">
            <SearchIcon size={16} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders (id, client, date, total...)"
              className="bg-transparent outline-none ml-2 w-full"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Client</th>
              <th className="p-3">Items</th>
              <th className="p-3">Address</th>
              <th className="p-3">Placement</th>
              <th className="p-3">Status</th>
              <th className="p-3">Delivery Date</th>
              <th className="p-3">Order Total (Ksh)</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((order) => (
              <tr
                key={order.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-3 font-semibold">
                  {order.orderCode || order.orderId || order.id}
                </td>
                <td className="p-3">{order.clientName || order.client}</td>
                <td className="p-3">{order.items?.length || "---"}</td>
                <td className="p-3">{order.deliveryAddress || "---"}</td>
                <td className="p-3">{order.placementType || "---"}</td>
                <td className="p-3">{getStatusBadge(order.status)}</td>
                <td className="p-3">{formatDate(order.deliveryDate)}</td>
                <td className="p-3 font-bold">
                  {Number(order.orderTotalKsh || 0).toLocaleString()}
                </td>
                <td className="p-3">
                  {order.status === "DRAFT" && (
                    <button
                      onClick={() => submitDraft(order.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Send size={16} /> Submit
                    </button>
                  )}

                  {order.status === "SUBMITTED" && (
                    <span className="text-yellow-700 dark:text-yellow-300">
                      Awaiting Checker
                    </span>
                  )}
                  {order.status === "APPROVED" && (
                    <span className="text-blue-700">Awaiting Driver</span>
                  )}
                  {order.status === "DELIVERED" && (
                    <span className="text-green-700 font-semibold flex items-center gap-2">
                      <CheckCircle size={18} /> Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500">
                  No orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border mr-2"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded border mr-1 dark:text-gray-700 ${
                page === i + 1 ? "bg-gray-200" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded border ml-2"
          >
            Next
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
          results
        </div>
      </div>

      {/* Walk-in Sales */}
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
              {sales.map((s, idx) => (
                <tr
                  key={s.saleId || idx}
                  className="border-b dark:border-gray-700"
                >
                  <td className="p-3 font-semibold">
                    {s.saleId || `S-${idx + 1}`}
                  </td>
                  <td className="p-3">{s.customerName}</td>
                  <td className="p-3">{s.items?.length || 0}</td>
                  <td className="p-3 font-bold">
                    {Number(s.totalAmountKsh || 0).toLocaleString()}
                  </td>
                  <td className="p-3">{formatDate(s.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleOrderSubmit}
        clients={clients}
        products={products}
      />
      <SalesForm
        open={saleFormOpen}
        onClose={() => setSaleFormOpen(false)}
        onSubmit={handleSaleSubmit}
        products={products}
      />
    </div>
  );
}
