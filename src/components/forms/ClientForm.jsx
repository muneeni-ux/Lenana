import React, { useState } from "react";

function ClientForm({ onClose, onSave }) {
  const [client, setClient] = useState({
    clientType: "BUSINESS",
    businessName: "",
    businessRegistration: "",
    contactPerson: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    gpsLatitude: "",
    gpsLongitude: "",
    billingAddress: "",
    creditLimitKsh: "",
    paymentTerms: "",
    status: "",
    preferredDeliveryDay: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(client);
    setClient({
      clientType: "BUSINESS",
      businessName: "",
      businessRegistration: "",
      contactPerson: "",
      phone: "",
      email: "",
      deliveryAddress: "",
      gpsLatitude: "",
      gpsLongitude: "",
      billingAddress: "",
      creditLimitKsh: "",
      paymentTerms: "",
      status: "",
      preferredDeliveryDay: "",
      notes: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-lg p-6 space-y-5">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Add Client
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Client Type */}
          <div>
            <label className="block text-sm font-semibold">Client Type</label>
            <select
              value={client.clientType}
              onChange={(e) => setClient({ ...client, clientType: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              required
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
              value={client.businessName}
              onChange={(e) => setClient({ ...client, businessName: e.target.value })}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold">Phone</label>
            <input
              type="tel"
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-semibold">Delivery Address</label>
            <input
              type="text"
              value={client.deliveryAddress}
              onChange={(e) => setClient({ ...client, deliveryAddress: e.target.value })}
              required
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Contact Person"
              value={client.contactPerson}
              onChange={(e) => setClient({ ...client, contactPerson: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <input
              type="email"
              placeholder="Email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <input
              type="text"
              placeholder="Billing Address"
              value={client.billingAddress}
              onChange={(e) => setClient({ ...client, billingAddress: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <input
              type="number"
              placeholder="Credit Limit (Ksh)"
              value={client.creditLimitKsh}
              onChange={(e) => setClient({ ...client, creditLimitKsh: e.target.value })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              Save Client
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

export default ClientForm;
