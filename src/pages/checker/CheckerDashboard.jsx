import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Package,
  Settings,
  Moon,
  Sun,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

{
  /* Show checker specific stats and info here(overview)
      use websockets to show real-time updates on orders and inventory */
}
const SPEC_PDF_URL = "/mnt/data/Lenana Drops System.pdf"; // dev-provided path

export default function CheckerDashboard() {
  const navigate = useNavigate();

  // small local theme toggle to keep parity with Navbar
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // demo data (in real app, fetch from API / websockets)
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: "ORD-101",
      client: "Mount Kenya Spa",
      items: 8,
      createdBy: "Maker1",
      date: "2025-11-10",
      notes: "Urgent for event",
      status: "SUBMITTED",
    },
    {
      id: "ORD-102",
      client: "Nanyuki Mart",
      items: 12,
      createdBy: "Maker2",
      date: "2025-11-09",
      notes: "Check branding",
      status: "SUBMITTED",
    },
    {
      id: "ORD-103",
      client: "Laikipia Hotel",
      items: 4,
      createdBy: "Maker1",
      date: "2025-11-08",
      notes: "",
      status: "SUBMITTED",
    },
  ]);

  const [recentProduction, setRecentProduction] = useState([
    {
      id: "BATCH-230",
      product: "20L Bottle",
      qty: 120,
      status: "IN_PROGRESS",
    },
    {
      id: "BATCH-229",
      product: "10L Bottle",
      qty: 80,
      status: "COMPLETED",
    },
  ]);

  const [inventoryAlerts, setInventoryAlerts] = useState([
    {
      id: "INV-003",
      product: "Small Bottles Pack",
      totalOnHand: 18,
      threshold: 30,
    },
  ]);

  // Approve Order (moves status to APPROVED)
  const approveOrder = (orderId) => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "APPROVED" } : o))
    );
  };

  // Request changes (set status back to DRAFT with a note)
  const requestChanges = (orderId) => {
    setPendingOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "REVISION_REQUESTED" } : o
      )
    );
  };

  // quick navigation helpers
  const goToOrders = () => navigate("/checker/orders");
  const goToProduction = () => navigate("/checker/production");
  const goToInventory = () => navigate("/inventory");

  return (
    <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Checker Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Review submitted orders, approve production QC and monitor inventory
            alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={SPEC_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            title="Open system specification"
          >
            <FileText size={16} /> Spec
          </a>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goToOrders}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Go to Orders
            </button>
            <button
              onClick={goToProduction}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Production
            </button>
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-500">Pending Approvals</h3>
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold mt-4">{pendingOrders.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            Orders awaiting your review
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-500">Batches In Progress</h3>
            <Package size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold mt-4">
            {recentProduction.filter((b) => b.status === "IN_PROGRESS").length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active production runs</p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-500">Low-stock Alerts</h3>
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <p className="text-3xl font-bold mt-4">{inventoryAlerts.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            Items below reorder threshold
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-500">Your Actions</h3>
            <Settings size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold mt-4">—</p>
          <p className="text-xs text-gray-500 mt-2">
            Quick access to checker tools
          </p>
        </div>
      </div>

      {/* Main grid: Pending approvals + Side panel */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Pending approvals table */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow p-5 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Orders</h2>
            <div className="text-sm text-gray-500">Review & approve</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {pendingOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="p-3 font-semibold">{o.id}</td>
                    <td className="p-3">{o.client}</td>
                    <td className="p-3">{o.items}</td>
                    <td className="p-3">{o.date}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {o.notes || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveOrder(o.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          title="Approve order"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>

                        <button
                          onClick={() => requestChanges(o.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                          title="Request changes"
                        >
                          <XCircle size={14} /> Request changes
                        </button>

                        <button
                          onClick={() => navigate(`/checker/orders/${o.id}`)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="View details"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pendingOrders.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No orders awaiting approval.
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <aside className="bg-white dark:bg-gray-900 rounded-xl shadow p-5 space-y-6">
          {/* Recent production */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Production</h3>
              <span className="text-sm text-gray-500">Live</span>
            </div>

            <ul className="space-y-3">
              {recentProduction.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.product}</div>
                    <div className="text-xs text-gray-500">
                      {r.id} · {r.qty} pcs
                    </div>
                  </div>
                  <div className="text-sm">
                    {r.status === "IN_PROGRESS" ? (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        In progress
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={goToProduction}
              className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Open Production
            </button>
          </div>

          {/* Inventory Alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Inventory Alerts</h3>
              <span className="text-sm text-gray-500">Critical</span>
            </div>

            <div className="space-y-3">
              {inventoryAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium">{a.product}</div>
                    <div className="text-xs text-gray-500">{a.id}</div>
                  </div>
                  <div className="text-sm text-red-600 font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} /> {a.totalOnHand}
                  </div>
                </div>
              ))}

              <button
                onClick={goToInventory}
                className="mt-3 w-full px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                View Inventory
              </button>
            </div>
          </div>

          {/* Quick reports */}
          <div>
            <h3 className="font-semibold mb-3">Quick Reports</h3>
            <div className="grid gap-2">
              <button
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate("/checker/invoices")}
              >
                <span>Pending Invoices</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate("/checker/clients")}
              >
                <span>Clients</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
