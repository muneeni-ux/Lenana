import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  MapPin,
  CheckCircle,
  Clock,
  FileText,
  Bell,
  X,
  ArrowRightCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
const WS_URL = process.env.REACT_APP_DELIVERY_WS || null;

function StatusBadge({ status }) {
  if (status === "DELIVERED")
    return (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-semibold flex items-center gap-1 w-fit">
        <CheckCircle size={14} /> Delivered
      </span>
    );
  if (status === "APPROVED")
    return (
      <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-sm font-semibold flex items-center gap-1 w-fit">
        <CheckCircle size={14} /> Approved
      </span>
    );
  return null;
}

export default function ManageDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // items per page
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${SERVER_URL}/api/orders?status=APPROVED,DELIVERED`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data =
          (await res.json())?.filter(
            (o) => o.status === "APPROVED" || o.status === "DELIVERED"
          ) || [];
        setOrders(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch delivery orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // WebSocket updates
  useEffect(() => {
    if (!WS_URL) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.type === "order:delivered" && msg.orderId) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === msg.orderId
                ? { ...o, status: "DELIVERED", deliveryDate: msg.deliveredOn }
                : o
            )
          );
          toast.success(msg.message || `Order ${msg.orderId} delivered`);
        }
      } catch {}
    });

    ws.addEventListener("error", () => toast.error("Delivery WebSocket error"));
    ws.addEventListener("close", () =>
      toast("Delivery WebSocket disconnected", { icon: "⚠️" })
    );

    return () => ws.close();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const hay = `${o.id} ${o.clientName} ${o.deliveryAddress}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openDrawer = (order) => {
    setSelected(order);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setSelected(null);
    setDrawerOpen(false);
  };

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="pt-16 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Delivery</h1>
          <p className="text-gray-500 mt-1">Track approved and delivered orders.</p>
        </div>
        <a
          href={SPEC_PDF_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <FileText size={16} /> Spec
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-full md:w-1/2">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client, order ID or address..."
            className="bg-transparent outline-none px-2 w-full"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() =>
              toast("Listening for live delivery updates...", { icon: <Bell size={16} /> })
            }
          >
            <Bell size={16} /> Live
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Address</th>
              <th className="py-3 px-4">Placement</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Delivery Date</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6">Loading...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No deliveries match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr
                  key={o.id}
                  className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4 font-semibold">{o.id}</td>
                  <td className="py-3 px-4">{o.clientName}</td>
                  <td className="py-3 px-4">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.productName}</span>
                        <span className="ml-2 text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> {o.deliveryAddress}
                  </td>
                  <td className="py-3 px-4">{o.placementType}</td>
                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-4">{o.deliveryDate ? dayjs(o.deliveryDate).format("YYYY-MM-DD") : "-"}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openDrawer(o)}
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <ArrowRightCircle size={16} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={closeDrawer}></div>
          <aside className="ml-auto w-full md:w-[520px] h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto p-6 relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selected.id}</h2>
                <p className="text-sm text-gray-500">{selected.clientName}</p>
              </div>
              <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} />
              </button>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Delivery date</div>
                <div className="mt-1 font-semibold">
                  {selected.deliveryDate ? dayjs(selected.deliveryDate).format("YYYY-MM-DD") : "-"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="mt-1">{selected.deliveryAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Driver</div>
                <div className="mt-1 font-semibold">{selected.driver || "-"}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Placement</div>
              <div className="mt-1">{selected.placementType}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{selected.notes || "—"}</div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="space-y-2">
                {selected.items.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-500">SKU: {item.productId}</div>
                    </div>
                    <div className="font-semibold">{item.quantity}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Timeline</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="mt-1"><Clock size={16} /></div>
                  <div>
                    <div className="font-medium">{selected.status === "APPROVED" ? "Order approved" : "Delivery completed"}</div>
                    <div className="text-xs">{selected.deliveryDate ? `Delivered on ${selected.deliveryDate ? dayjs(selected.deliveryDate).format("YYYY-MM-DD") : "-"}` : "Awaiting delivery"}</div>
                  </div>
                </li>
                {selected.notes && (
                  <li className="flex items-start gap-3">
                    <div className="mt-1"><FileText size={16} /></div>
                    <div>
                      <div className="font-medium">Notes</div>
                      <div className="text-xs">{selected.notes}</div>
                    </div>
                  </li>
                )}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg border"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(selected, null, 2));
                  toast.success("Order JSON copied");
                }}
              >
                Export JSON
              </button>
              <a href={SPEC_PDF_URL} target="_blank" rel="noreferrer" className="py-2 px-4 rounded-lg bg-green-600 text-white">
                Open Spec
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

