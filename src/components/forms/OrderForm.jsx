import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

function OrderForm({ open, onClose, onSubmit }) {
  const [client, setClient] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [placementType, setPlacementType] = useState("MANUAL_ENTRY");
  const [instructions, setInstructions] = useState("");
  const [branding, setBranding] = useState("");
  const [items, setItems] = useState(1);

  const reset = () => {
    setClient("");
    setDeliveryAddress("");
    setDeliveryDate("");
    setPlacementType("MANUAL_ENTRY");
    setInstructions("");
    setBranding("");
    setItems(1);
  };

  const handleDraft = () => {
    onSubmit({
      id: crypto.randomUUID(),
      orderId: "ORD-" + Math.floor(Math.random() * 900 + 100),
      client,
      deliveryAddress,
      items,
      status: "DRAFT",
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate,
      placementType,
      specialInstructions: instructions,
      customBrandingRequirements: branding,
      createdBy: "maker",
    });

    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!client || !deliveryAddress || !deliveryDate) {
      alert("Please fill required fields before submitting.");
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      orderId: "ORD-" + Math.floor(Math.random() * 900 + 100),
      client,
      deliveryAddress,
      items,
      status: "SUBMITTED",
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate,
      placementType,
      specialInstructions: instructions,
      customBrandingRequirements: branding,
      createdBy: "maker",
    });

    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-scaleIn max-h-[90vh] overflow-hidden">

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[85vh] p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Order</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Client */}
            <div>
              <label className="text-sm font-semibold">Client Name *</label>
              <input
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-semibold">Delivery Address *</label>
              <input
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Items */}
            <div>
              <label className="text-sm font-semibold">Number of Items</label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => items > 1 && setItems(items - 1)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  <Minus size={18} />
                </button>

                <input
                  type="number"
                  value={items}
                  min={1}
                  onChange={(e) => setItems(Number(e.target.value))}
                  className="w-20 text-center py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                />

                <button
                  type="button"
                  onClick={() => setItems(items + 1)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="text-sm font-semibold">Delivery Date *</label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Placement Type */}
            <div>
              <label className="text-sm font-semibold">Placement Type</label>
              <select
                value={placementType}
                onChange={(e) => setPlacementType(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              >
                <option value="ONLINE">Online</option>
                <option value="MANUAL_ENTRY">Manual Entry</option>
                <option value="PHONE">Phone</option>
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label className="text-sm font-semibold">Special Instructions</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              ></textarea>
            </div>

            {/* Branding */}
            <div>
              <label className="text-sm font-semibold">Branding Requirements</label>
              <textarea
                rows={2}
                value={branding}
                onChange={(e) => setBranding(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-4 mt-6">

              {/* Draft */}
              <button
                type="button"
                onClick={handleDraft}
                className="w-1/2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Save Draft
              </button>

              {/* Submit */}
              <button
                type="submit"
                className="w-1/2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow"
              >
                Submit Order
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
