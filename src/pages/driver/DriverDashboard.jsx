import React, { useState } from "react";
import {
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Calendar,
} from "lucide-react";

function DriverDashboard() {
  // Temporary dummy driver assignments (will connect to real DB later)
  const assignedDeliveries = [
    {
      id: "ORD-002",
      client: "Nanyuki Mart",
      address: "Nanyuki CBD",
      items: 30,
      date: "2025-02-12",
      status: "ASSIGNED",
    },
    {
      id: "ORD-005",
      client: "Laikipia Hotel",
      address: "Laikipia Highway",
      items: 25,
      date: "2025-02-12",
      status: "ASSIGNED",
    },
  ];

  const completedDeliveries = 42;

  return (
    <div className="pt-24 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor your assigned deliveries and track your performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {/* Assigned Deliveries */}
        <div className="p-6 bg-white dark:bg-gray-900 shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
            <Truck size={28} className="text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Assigned Deliveries</p>
            <h2 className="text-2xl font-bold">{assignedDeliveries.length}</h2>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="p-6 bg-white dark:bg-gray-900 shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
            <CheckCircle
              size={28}
              className="text-green-700 dark:text-green-300"
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Completed Deliveries</p>
            <h2 className="text-2xl font-bold">{completedDeliveries}</h2>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="p-6 bg-white dark:bg-gray-900 shadow rounded-xl flex items-center gap-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-full">
            <Clock size={28} className="text-yellow-700 dark:text-yellow-300" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Deliveries</p>
            <h2 className="text-2xl font-bold">{assignedDeliveries.length}</h2>
          </div>
        </div>
      </div>

      {/* Workload Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Weekly Workload</h2>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
          <div className="flex items-end justify-between h-48 sm:h-56 md:h-64 lg:h-72">
            {/** Data placeholder – can be dynamic later */}
            {[6, 4, 8, 3, 5, 7, 2].map((val, i) => (
              <div key={i} className="flex flex-col items-center w-full">
                {/* Bar */}
                <div
                  className="w-full max-w-[28px] md:max-w-[32px] lg:max-w-[64px] 
                       bg-gradient-to-t from-green-600 to-green-400 
                       dark:from-green-500 dark:to-green-300 
                       rounded-lg transition-all duration-300"
                  style={{
                    height: `calc(${val} * 10%)`,
                    minHeight: `${val * 10}px`,
                  }}
                />

                {/* Day Label */}
                <span className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deliveries */}
      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Deliveries</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {assignedDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">{delivery.id}</h3>
                <span className="px-3 py-1 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                  Assigned
                </span>
              </div>

              <p className="text-sm flex items-center gap-2 mb-1">
                <Package size={16} /> {delivery.items} items
              </p>

              <p className="text-sm flex items-center gap-2 mb-1">
                <MapPin size={16} /> {delivery.address}
              </p>

              <p className="text-sm flex items-center gap-2">
                <Calendar size={16} /> {delivery.date}
              </p>

              {/* Deliver Button */}
              <button className="w-full mt-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Mark as Delivered
              </button>
            </div>
          ))}

          {assignedDeliveries.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-2">
              No upcoming deliveries assigned.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
