// import React, { useState } from "react";

// export default function BatchForm({ closeModal, addBatch, productOptions }) {
//   const [newBatch, setNewBatch] = useState({ product: "", qty: "" });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     addBatch(newBatch);
//     closeModal();
//     setNewBatch({ product: "", qty: "" });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-auto p-4">
//       <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-xl animate-slide-up">
//         <h2 className="text-2xl font-bold mb-5">Add Production Batch</h2>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="text-sm font-semibold">Product</label>
//             <select
//               required
//               value={newBatch.product}
//               onChange={(e) =>
//                 setNewBatch({ ...newBatch, product: e.target.value })
//               }
//               className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
//             >
//               <option value="">Select product</option>
//               {productOptions.map((p, idx) => (
//                 <option key={idx} value={p.name}>
//                   {p.name} — KES {p.price}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-sm font-semibold">Quantity</label>
//             <input
//               type="number"
//               required
//               value={newBatch.qty}
//               onChange={(e) =>
//                 setNewBatch({ ...newBatch, qty: e.target.value })
//               }
//               className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
//           >
//             Save Batch
//           </button>
//           <button
//             type="button"
//             onClick={closeModal}
//             className="w-full bg-gray-300 dark:bg-gray-600 py-3 rounded-lg mt-2"
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { X } from "lucide-react";

function BatchForm({ closeModal, addBatch, productOptions }) {
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");

  const submit = (e) => {
    e.preventDefault();
    addBatch({ productId, qty });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Production Batch</h2>
          <button onClick={closeModal}>
            <X size={22} />
          </button>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div>
            <label className="font-medium">Product</label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 mt-1"
            >
              <option value="">Select product</option>
              {productOptions.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} — KES {p.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Planned Quantity</label>
            <input
              type="number"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 mt-1"
            />
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Save Batch
          </button>
        </form>
      </div>
    </div>
  );
}

export default BatchForm;
