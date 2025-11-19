import React from "react";
import {
  ShoppingBag,
  Users,
  FileText,
  Package,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function MakerDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Pending Orders",
      value: 12,
      icon: <ShoppingBag size={26} />,
      color: "bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200",
    },
    {
      title: "Invoices",
      value: 6,
      icon: <FileText size={26} />,
      color: "bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-200",
    },
    {
      title: "Clients",
      value: 18,
      icon: <Users size={26} />,
      color: "bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200",
    },
    {
      title: "Production Tasks",
      value: 3,
      icon: <Package size={26} />,
      color: "bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-200",
    },
  ];

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Orders This Week",
        data: [4, 8, 6, 12, 10],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#bbb" } },
      x: { ticks: { color: "#bbb" } },
    },
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
      <h1 className="text-3xl font-bold mb-6">Maker Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        {stats.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 shadow cursor-pointer hover:shadow-lg transition-all ${item.color}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              {item.icon}
            </div>
            <p className="text-3xl font-extrabold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Orders Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Orders Overview</h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <button
          onClick={() => navigate("/orders")}
          className="p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Manage Orders</h3>
            <p className="text-sm opacity-90">Create or track orders</p>
          </div>
          <ArrowRight
            size={28}
            className="group-hover:translate-x-1 transition"
          />
        </button>

        <button
          onClick={() => navigate("/production")}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Production</h3>
            <p className="text-sm opacity-90">Track batches & progress</p>
          </div>
          <ArrowRight
            size={28}
            className="group-hover:translate-x-1 transition"
          />
        </button>

        <button
          onClick={() => navigate("/clients")}
          className="p-6 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Client Management</h3>
            <p className="text-sm opacity-90">Manage customers</p>
          </div>
          <ArrowRight
            size={28}
            className="group-hover:translate-x-1 transition"
          />
        </button>
      </div>
    </div>
  );
}

export default MakerDashboard;
