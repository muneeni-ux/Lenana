import React, { useState, useMemo } from "react";
import { X, Plus, Minus } from "lucide-react";

export default function SalesForm({
  open,
  onClose,
  products,
  onSubmit,
}) {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([
    { id: crypto.randomUUID(), productId: "", quantity: 1 }
  ]);

  const reset = () => {
    setCustomerName("");
    setItems([{ id: crypto.randomUUID(), productId: "", quantity: 1 }]);
  };

  const addItem = () => {
    setItems((s) => [
      ...s,
      { id: crypto.randomUUID(), productId: "", quantity: 1 },
    ]);
  };

  const removeItem = (id) => {
    setItems((s) => s.length > 1 ? s.filter((i) => i.id !== id) : s);
  };

  const updateItem = (id, field, value) => {
    setItems((s) =>
      s.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // calculate totals
  const saleTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const prod = products.find((p) => p.id === it.productId);
      if (!prod) return sum;
      return sum + prod.unitPriceKsh * (Number(it.quantity) || 0);
    }, 0);
  }, [items, products]);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }
    if (items.some((it) => !it.productId)) {
      alert("Please select all product fields.");
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      saleId: "SALE-" + Math.floor(Math.random() * 900 + 100),
      customerName,
      date: new Date().toISOString().split("T")[0],
      items: items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
      })),
      totalAmountKsh: saleTotal,
    });

    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-scaleIn max-h-[90vh] overflow-hidden">

        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Record Walk-In Sale</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <X size={22} />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-5">

            {/* customer */}
            <div>
              <label className="text-sm font-semibold">Customer Name *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* items */}
            <div className="space-y-4">
              <label className="text-sm font-semibold">Sale Items</label>

              {items.map((it) => (
                <div
                  key={it.id}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700 space-y-3"
                >
                  <select
                    value={it.productId}
                    onChange={(e) =>
                      updateItem(it.id, "productId", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Ksh {p.unitPriceKsh}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateItem(it.id, "quantity", Math.max(1, it.quantity - 1))
                      }
                      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>

                    <input
                      type="number"
                      min={1}
                      className="w-20 text-center px-2 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                      value={it.quantity}
                      onChange={(e) => updateItem(it.id, "quantity", Number(e.target.value))}
                    />

                    <button
                      onClick={() =>
                        updateItem(it.id, "quantity", Number(it.quantity) + 1)
                      }
                      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>

                    {/* delete item */}
                    <button
                      onClick={() => removeItem(it.id)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* add item */}
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 mt-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            {/* totals */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-gray-700 text-right">
              <p className="font-semibold text-lg">
                Total: <span className="text-green-600 dark:text-green-400">Ksh {saleTotal.toLocaleString()}</span>
              </p>
            </div>

            {/* buttons */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow"
            >
              Save Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
