import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function OrderForm({ open, onClose, onSubmit, clients = [], products = [] }) {
  const [clientId, setClientId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [placementType, setPlacementType] = useState("MANUAL_ENTRY");
  const [instructions, setInstructions] = useState("");
  const [branding, setBranding] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) {
      // reset form when closing
      setClientId("");
      setDeliveryAddress("");
      setDeliveryDate("");
      setPlacementType("MANUAL_ENTRY");
      setInstructions("");
      setBranding("");
      setItems([]);
    }
  }, [open]);

  const addEmptyItem = () => {
    setItems((s) => [
      ...s,
      {
        id: `oi-${uuidv4()}`,
        productId: products[0]?.id || "",
        productName: products[0]?.name || "",
        quantity: 1,
        unitPriceKsh: products[0]?.unitPriceKsh || 0,
        productionCostPerUnitKsh: products[0]?.productionCostPerUnitKsh || 0,
      },
    ]);
  };

  // ensure at least one item exists
  useEffect(() => {
    if (open && items.length === 0) addEmptyItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  // when product changes, update unit price and production cost
  const onProductChange = (id, productId) => {
    const p = products.find((x) => x.id === productId);
    updateItem(id, {
      productId,
      productName: p?.name || "",
      unitPriceKsh: p?.unitPriceKsh ?? 0,
      productionCostPerUnitKsh: p?.productionCostPerUnitKsh ?? 0,
    });
  };

  // Calculations
  const lineTotals = useMemo(
    () =>
      items.map((it) => {
        const qty = Number(it.quantity || 0);
        const unit = Number(it.unitPriceKsh || 0);
        const prodCost = Number(it.productionCostPerUnitKsh || 0);
        const lineTotalKsh = qty * unit;
        const lineProductionCostKsh = qty * prodCost;
        const lineGrossProfitKsh = lineTotalKsh - lineProductionCostKsh;
        const lineMarginPercent = lineTotalKsh ? (lineGrossProfitKsh / lineTotalKsh) * 100 : 0;
        return { ...it, lineTotalKsh, lineProductionCostKsh, lineGrossProfitKsh, lineMarginPercent };
      }),
    [items]
  );

  const orderTotals = useMemo(() => {
    const orderTotalKsh = lineTotals.reduce((s, it) => s + (it.lineTotalKsh || 0), 0);
    const totalProductionCostKsh = lineTotals.reduce((s, it) => s + (it.lineProductionCostKsh || 0), 0);
    const grossProfitKsh = orderTotalKsh - totalProductionCostKsh;
    const grossMarginPercent = orderTotalKsh ? (grossProfitKsh / orderTotalKsh) * 100 : 0;
    return { orderTotalKsh, totalProductionCostKsh, grossProfitKsh, grossMarginPercent };
  }, [lineTotals]);

  const saveDraft = () => {
    const order = buildOrder("DRAFT");
    onSubmit(order);
    onClose();
  };

  const submitOrder = (e) => {
    e.preventDefault();
    // validation
    if (!clientId) {
      alert("Select client");
      return;
    }
    if (!deliveryAddress) {
      alert("Enter delivery address");
      return;
    }
    if (!deliveryDate) {
      alert("Choose delivery date");
      return;
    }
    // ensure items valid
    if (!items.length || items.some((it) => !it.productId || !it.quantity || it.quantity <= 0)) {
      alert("Please add at least one valid item");
      return;
    }

    const order = buildOrder("SUBMITTED");
    onSubmit(order);
    onClose();
  };

  const buildOrder = (status) => {
    const mappedItems = lineTotals.map((it) => ({
      id: it.id,
      orderId: null, // will be set by backend / list if needed
      productId: it.productId,
      productName: it.productName,
      quantity: Number(it.quantity || 0),
      unitPriceKsh: Number(it.unitPriceKsh || 0),
      lineTotalKsh: Number(it.lineTotalKsh || 0),
      productionCostPerUnitKsh: Number(it.productionCostPerUnitKsh || 0),
      lineProductionCostKsh: Number(it.lineProductionCostKsh || 0),
      lineGrossProfitKsh: Number(it.lineGrossProfitKsh || 0),
      lineMarginPercent: Number(it.lineMarginPercent || 0),
    }));

    const order = {
      id: crypto.randomUUID(),
      orderId: "ORD-" + Math.floor(Math.random() * 900 + 100),
      clientId,
      clientName: (clientsMap()[clientId] || {}).businessName || "",
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate,
      deliveryAddress,
      placementType,
      status,
      items: mappedItems,
      specialInstructions: instructions,
      customBrandingRequirements: branding,
      createdBy: "maker",
      orderTotalKsh: orderTotals.orderTotalKsh,
      totalProductionCostKsh: orderTotals.totalProductionCostKsh,
      grossProfitKsh: orderTotals.grossProfitKsh,
      grossMarginPercent: orderTotals.grossMarginPercent,
    };

    return order;
  };

  // helper to map clients quickly — pulled from localStorage for performance
  const clientsMap = () => {
    try {
      const raw = localStorage.getItem("clients");
      const list = raw ? JSON.parse(raw) : [];
      return list.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {});
    } catch {
      return {};
    }
  };

  // read products from localStorage to always use current values (product list passed as prop for initial)
  const productOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem("products");
      return raw ? JSON.parse(raw) : products;
    } catch {
      return products;
    }
  }, [products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden max-h-[92vh]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Create New Order</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>

        {/* content - scrollable */}
        <form onSubmit={submitOrder} className="overflow-y-auto max-h-[78vh] p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Client *</label>
              <select value={clientId} onChange={(e) => {
                setClientId(e.target.value);
                // auto-fill delivery address from client if exists
                const m = clientsMap();
                if (m[e.target.value]?.deliveryAddress) setDeliveryAddress(m[e.target.value].deliveryAddress);
              }} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <option value="">Select client</option>
                {Object.values(clientsMap()).map((c) => (
                  <option key={c.id} value={c.id}>{c.businessName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Placement Type</label>
              <select value={placementType} onChange={(e) => setPlacementType(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <option value="ONLINE">Online</option>
                <option value="MANUAL_ENTRY">Manual Entry</option>
                <option value="PHONE">Phone</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Delivery Address *</label>
              <input required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>

            <div>
              <label className="text-sm font-semibold">Delivery Date *</label>
              <input required type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>

          {/* items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Order Items</h3>
              <button type="button" onClick={addEmptyItem} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-600 text-white">
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {lineTotals.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 md:col-span-5">
                    <label className="text-xs text-gray-500">Product</label>
                    <select value={it.productId} onChange={(e) => onProductChange(it.id, e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700">
                      <option value="">Select product</option>
                      {productOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-2">
                    <label className="text-xs text-gray-500">Qty</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button type="button" onClick={() => updateItem(it.id, { quantity: Math.max(1, Number(it.quantity) - 1) })} className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                        <Minus size={14} />
                      </button>
                      <input type="number" value={it.quantity} min={1} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })} className="w-full text-center px-2 py-2 rounded-lg bg-white dark:bg-gray-700" />
                      <button type="button" onClick={() => updateItem(it.id, { quantity: Number(it.quantity) + 1 })} className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-2">
                    <label className="text-xs text-gray-500">Unit Price</label>
                    <input type="number" value={it.unitPriceKsh} onChange={(e) => updateItem(it.id, { unitPriceKsh: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700" />
                  </div>

                  <div className="col-span-2 md:col-span-2">
                    <label className="text-xs text-gray-500">Prod Cost</label>
                    <input type="number" value={it.productionCostPerUnitKsh} onChange={(e) => updateItem(it.id, { productionCostPerUnitKsh: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700" />
                  </div>

                  <div className="col-span-1 md:col-span-1 text-right">
                    <label className="text-xs text-gray-500">Total</label>
                    <div className="mt-1 font-semibold">{Number(it.lineTotalKsh || 0).toLocaleString()}</div>
                    <button type="button" onClick={() => removeItem(it.id)} className="mt-2 text-red-600 hover:text-red-800">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* instructions & branding */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Special Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
            <div>
              <label className="text-sm font-semibold">Branding Requirements</label>
              <textarea value={branding} onChange={(e) => setBranding(e.target.value)} rows={3} className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>

          {/* totals summary */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-sm">
              <div>Items: <strong>{lineTotals.length}</strong></div>
              <div>Production Cost: <strong>{orderTotals.totalProductionCostKsh?.toLocaleString()}</strong></div>
            </div>
            <div className="text-right">
              <div className="text-sm">Order Total</div>
              <div className="text-2xl font-bold">{orderTotals.orderTotalKsh?.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Gross profit {orderTotals.grossProfitKsh?.toLocaleString()} — {orderTotals.grossMarginPercent?.toFixed(1)}%</div>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-3">
            <button type="button" onClick={saveDraft} className="flex-1 bg-gray-300 dark:bg-gray-700 py-3 rounded-lg">Save Draft</button>
            <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg">Submit Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}
