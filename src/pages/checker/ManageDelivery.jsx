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
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

/**
 * ManageDelivery with drawer + websocket auto-notify
 *
 * - Drop-in component for the "checker" interface.
 * - Keeps orders in localStorage (seeded if empty).
 * - Opens a right-side Drawer that shows items, timeline & notes.
 * - Connects to a WebSocket for real-time updates (see WS_URL).
 * - If WS not configured, a local simulator will emit updates for dev.
 *
 * NOTES:
 * - Your infra should map SPEC_PDF_URL to a served URL (we use the same /mnt/data path).
 * - WebSocket message format expected (example):
 *   { type: "ORDER_UPDATED", payload: { id: "ORD-003", status: "DELIVERED", deliveryDate: "2025-02-12" } }
 */

const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf";

// Replace with your real WS endpoint (wss://...) in production
const WS_URL = process.env.REACT_APP_DELIVERY_WS || null;

function useLocalStorage(key, fallback) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export default function ManageDelivery() {
  // seed orders if none exist
  const [orders, setOrders] = useLocalStorage("orders", [
    {
      id: "ORD-003",
      client: "Laikipia Hotel",
      items: 20,
      address: "Laikipia",
      driver: "Driver David",
      placement: "PHONE",
      deliveryDate: "2025-02-12",
      status: "DELIVERED",
      notes: "Left at reception",
      lineItems: [
        { sku: "P3", name: "Small Bottles Pack", qty: 10 },
        { sku: "P1", name: "20L Bottle", qty: 10 },
      ],
    },
    {
      id: "ORD-004",
      client: "Nanyuki Mart",
      items: 12,
      address: "Nanyuki CBD",
      driver: "Driver John",
      placement: "WEB",
      deliveryDate: null,
      status: "PENDING",
      notes: "",
      lineItems: [{ sku: "P2", name: "10L Bottle", qty: 12 }],
    },
    {
      id: "ORD-005",
      client: "Mount Kenya Spa",
      items: 30,
      address: "Nanyuki",
      driver: "Driver James",
      placement: "APP",
      deliveryDate: null,
      status: "PENDING",
      notes: "",
      lineItems: [
        { sku: "P1", name: "20L Bottle", qty: 10 },
        { sku: "P3", name: "Small Bottles Pack", qty: 20 },
      ],
    },
  ]);

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | DELIVERED
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // websocket ref and simulator ref
  const wsRef = useRef(null);
  const simulatorRef = useRef(null);

  // filtered list
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const hay = `${o.id} ${o.client} ${o.address} ${o.placement} ${o.driver}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  // open drawer for order details
  const openDrawer = (order) => {
    setSelected(order);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
  };

  // apply an incoming order update to state (from WS)
  const handleIncomingUpdate = (update) => {
    // Expected update shape: { id, status?, deliveryDate?, notes?, lineItems? ... }
    if (!update || !update.id) return;
    setOrders((prev) => {
      const found = prev.find((p) => p.id === update.id);
      // if not found, push new
      if (!found) {
        const newOrder = {
          id: update.id,
          client: update.client || "Unknown",
          items: update.items || 0,
          address: update.address || "",
          driver: update.driver || "Unassigned",
          placement: update.placement || "WEB",
          deliveryDate: update.deliveryDate || null,
          status: update.status || "PENDING",
          notes: update.notes || "",
          lineItems: update.lineItems || [],
        };
        toast.success(`New order received: ${newOrder.id}`);
        return [newOrder, ...prev];
      }
      // update existing
      const updated = prev.map((p) =>
        p.id === update.id
          ? { ...p, ...update }
          : p
      );
      // show notification if status changed
      if (found.status !== update.status) {
        toast.success(`Order ${update.id} status: ${update.status}`);
      }
      return updated;
    });
  };

  // Setup WebSocket (or simulated fallback)
  useEffect(() => {
    let ws;
    if (WS_URL) {
      try {
        ws = new WebSocket(WS_URL);
        wsRef.current = ws;
        ws.addEventListener("open", () => {
          toast.success("Connected to delivery events");
        });
        ws.addEventListener("message", (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            // Accept messages like { type: "ORDER_UPDATED", payload: { ... } }
            if (msg?.type === "ORDER_UPDATED" && msg.payload) {
              handleIncomingUpdate(msg.payload);
            } else if (msg?.type === "NEW_ORDER" && msg.payload) {
              handleIncomingUpdate(msg.payload);
            }
          } catch (err) {
            // ignore bad JSON
          }
        });
        ws.addEventListener("close", () => {
          toast("Delivery websocket disconnected", { icon: "⚠️" });
        });
        ws.addEventListener("error", () => {
          toast.error("Delivery websocket error");
        });
      } catch (err) {
        console.warn("WS connection failed", err);
      }
    } else {
      // No WS provided — start a small simulator that emits an order update occasionally
      simulatorRef.current = window.setInterval(() => {
        // pick a random pending order and mark delivered — DEV SIMULATOR ONLY
        const pending = orders.filter((o) => o.status === "PENDING");
        if (pending.length === 0) return;
        const pick = pending[Math.floor(Math.random() * pending.length)];
        const payload = {
          id: pick.id,
          status: "DELIVERED",
          deliveryDate: dayjs().format("YYYY-MM-DD"),
          notes: "Auto-simulated delivered",
        };
        handleIncomingUpdate(payload);
      }, 18000); // every 18s
      toast("Delivery websocket not configured — dev simulator active", { icon: "🔔", duration: 4000 });
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (simulatorRef.current) {
        clearInterval(simulatorRef.current);
        simulatorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // helper: pretty badge
  const StatusBadge = ({ status }) => {
    if (status === "DELIVERED")
      return <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-semibold flex items-center gap-1 w-fit"><CheckCircle size={14} /> Delivered</span>;
    return <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 text-sm font-semibold flex items-center gap-1 w-fit"><Clock size={14} /> Pending</span>;
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">

      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Delivery</h1>
          <p className="text-gray-500 mt-1">Track delivery progress and receive live notifications when orders update.</p>
        </div>

        <div className="flex items-center gap-3">
          <a href={SPEC_PDF_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <FileText size={16} /> Spec
          </a>
        </div>
      </div>

      {/* filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-full md:w-1/2">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, order ID or address..."
            className="bg-transparent outline-none px-2 w-full"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => toast("Listening for live delivery updates...", { icon: <Bell size={16} /> })}
            title="Test notification"
          >
            <Bell size={16} /> Live
          </button>
        </div>
      </div>

      {/* table */}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">No deliveries match your filters.</td>
              </tr>
            )}

            {filtered.map((o) => (
              <tr key={o.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-3 px-4 font-semibold">{o.id}</td>
                <td className="py-3 px-4">{o.client}</td>
                <td className="py-3 px-4">{o.items}</td>
                <td className="py-3 px-4 flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {o.address}</td>
                <td className="py-3 px-4">{o.placement}</td>
                <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                <td className="py-3 px-4">{o.deliveryDate || "-"}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openDrawer(o)}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <ArrowRightCircle size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer (right side) */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed top-0 right-0 h-full w-full md:w-[520px] transform transition-transform z-50 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ pointerEvents: drawerOpen ? "auto" : "none" }}
      >
        {/* backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeDrawer}
        />

        <aside className="relative ml-auto h-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold">{selected?.id || "Order details"}</h2>
              <p className="text-sm text-gray-500">{selected?.client}</p>
            </div>

            <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>

          {!selected ? (
            <div className="text-gray-500">No order selected.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="mt-1"><StatusBadge status={selected.status} /></div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Delivery date</div>
                  <div className="mt-1 font-semibold">{selected.deliveryDate || "-"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="mt-1">{selected.address}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Driver</div>
                  <div className="mt-1 font-semibold">{selected.driver || "-"}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500">Placement</div>
                <div className="mt-1">{selected.placement}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500">Notes</div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{selected.notes || "—"}</div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Items ({selected.items})</h4>
                </div>

                <ul className="space-y-2">
                  {(selected.lineItems || []).map((li, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{li.name}</div>
                        <div className="text-xs text-gray-500">SKU: {li.sku}</div>
                      </div>
                      <div className="font-semibold">{li.qty}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* timeline / events */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Timeline</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <div className="mt-1"><Clock size={16} /></div>
                    <div>
                      <div className="font-medium">{selected.status === "PENDING" ? "Order placed" : "Delivery completed"}</div>
                      <div className="text-xs">{selected.deliveryDate ? `Delivered on ${selected.deliveryDate}` : "Awaiting dispatch"}</div>
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

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg border" onClick={() => {
                  // simple copy to clipboard
                  const text = JSON.stringify(selected, null, 2);
                  navigator.clipboard?.writeText(text);
                  toast.success("Order JSON copied");
                }}>
                  Export JSON
                </button>

                <a
                  href={SPEC_PDF_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-4 rounded-lg bg-green-600 text-white"
                >
                  Open Spec
                </a>
              </div>
            </>
          )}
        </aside>
      </div>

    </div>
  );
}
