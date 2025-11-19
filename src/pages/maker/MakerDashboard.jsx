import React from "react";
import {
  ShoppingBag,
  Users,
  FileText,
  Package,
  ArrowRight,
  Droplet,
  Clock,
  CheckCircle,
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
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Maker" };

  /* -------------------------------- Maker Data ------------------------------ */
  const makerStats = [
    {
      title: "Your Pending Orders",
      value: 12,
      icon: <ShoppingBag size={28} />,
      color: "from-green-100 to-green-200 dark:from-green-700 dark:to-green-800",
      text: "text-green-700 dark:text-green-200",
    },
    {
      title: "Your Invoices",
      value: 6,
      icon: <FileText size={28} />,
      color: "from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-800",
      text: "text-blue-700 dark:text-blue-200",
    },
    {
      title: "Active Clients",
      value: 18,
      icon: <Users size={28} />,
      color:
        "from-yellow-100 to-yellow-200 dark:from-yellow-700 dark:to-yellow-800",
      text: "text-yellow-700 dark:text-yellow-200",
    },
    {
      title: "Production Tasks",
      value: 3,
      icon: <Package size={28} />,
      color:
        "from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-800",
      text: "text-purple-700 dark:text-purple-200",
    },
  ];

  /* --------------------------------- Chart ---------------------------------- */
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Orders This Week",
        data: [4, 8, 6, 12, 10],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.25)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#4442" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="pt-24 px-6 pb-20 text-gray-800 dark:text-gray-200 transition-all">

      {/* ------------------------------ Header ------------------------------ */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold">
          Welcome back,{" "}
          <span className="text-green-600 dark:text-green-400">
            {user.username}
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's your activity summary and tasks at a glance.
        </p>
      </div>

      {/* ------------------------------ Top Summary ------------------------------ */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-xl shadow flex items-center gap-4">
          <Clock size={40} className="text-green-600" />
          <div>
            <h3 className="text-lg font-bold">Today’s Tasks</h3>
            <p className="text-2xl font-extrabold">4</p>
          </div>
        </div>

        <div className="p-6 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-xl shadow flex items-center gap-4">
          <CheckCircle size={40} className="text-blue-600" />
          <div>
            <h3 className="text-lg font-bold">Completed Today</h3>
            <p className="text-2xl font-extrabold">2</p>
          </div>
        </div>

        <div className="p-6 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-xl shadow flex items-center gap-4">
          <Droplet size={40} className="text-green-500" />
          <div>
            <h3 className="text-lg font-bold">Production Rating</h3>
            <p className="text-2xl font-extrabold">92%</p>
          </div>
        </div>
      </div>

      {/* ------------------------------ Stats Cards ------------------------------ */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {makerStats.map((box, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 shadow bg-gradient-to-br ${box.color} ${box.text} transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">{box.title}</h2>
              {box.icon}
            </div>
            <p className="text-4xl font-extrabold">{box.value}</p>
          </div>
        ))}
      </div>

      {/* ------------------------------ Line Chart ------------------------------ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">Orders Overview (Weekly)</h2>
        <Line data={chartData} options={chartOptions} height={120} />
      </div>

      {/* ------------------------------ Quick Links ------------------------------ */}
      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <button
          onClick={() => navigate("/orders")}
          className="p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Manage Your Orders</h3>
            <p className="text-sm opacity-90">Track and update orders</p>
          </div>
          <ArrowRight size={28} className="group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => navigate("/production")}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Production Tasks</h3>
            <p className="text-sm opacity-90">Track batches & progress</p>
          </div>
          <ArrowRight size={28} className="group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => navigate("/clients")}
          className="p-6 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 text-white shadow hover:shadow-lg hover:opacity-90 flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold">Client Management</h3>
            <p className="text-sm opacity-90">View or update clients</p>
          </div>
          <ArrowRight size={28} className="group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
}

export default MakerDashboard;
