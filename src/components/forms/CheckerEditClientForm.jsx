import React, { useState } from "react";
import { X } from "lucide-react";

function CheckerEditClientForm({ client, onClose, onSave }) {
  const [form, setForm] = useState({ ...client });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-lg p-6 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Edit Client
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Type */}
          <div>
            <label className="block text-sm font-semibold">Client Type</label>
            <select
              value={form.clientType}
              onChange={(e) => update("clientType", e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <option value="BUSINESS">Business</option>
              <option value="RETAIL">Retail</option>
            </select>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-semibold">
              Delivery Address
            </label>
            <input
              type="text"
              value={form.deliveryAddress}
              onChange={(e) => update("deliveryAddress", e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Optional Additional Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Contact Person"
              value={form.contactPerson || ""}
              onChange={(e) => update("contactPerson", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />

            <input
              type="text"
              placeholder="Billing Address"
              value={form.billingAddress || ""}
              onChange={(e) => update("billingAddress", e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />

            <input
              type="number"
              placeholder="Credit Limit (Ksh)"
              value={form.creditLimitKsh || ""}
              onChange={(e) =>
                update("creditLimitKsh", Number(e.target.value))
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Status (visible to Checker, but no delete rights) */}
          <div>
            <label className="block text-sm font-semibold">
              Client Status
            </label>
            <select
              value={form.status || "ACTIVE"}
              onChange={(e) => update("status", e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckerEditClientForm;
