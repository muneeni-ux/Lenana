import React, { useState } from "react";
import { PlusCircle, Clock, CheckCircle, Package } from "lucide-react";
import BatchForm from "../../components/forms/BatchForm";
// {
//   /* Product batches requested seen here (Begun Production button to start and set start time and end time when done)
//       Track Progress: Update start/end times on the batches,
//       Products inputted here after production(automatic if possible) status: Completed, defective, wasted (frontend to include product dropdown with prices) 
//       Inventory view to see added products and their details and status
//       */
// }
function Production() {
  const [batches, setBatches] = useState([
    {
      id: "BATCH-001",
      product: "20L Bottle",
      qty: 50,
      status: "Planned",
      start: null,
      end: null,
    },
    {
      id: "BATCH-002",
      product: "10L Bottle",
      qty: 120,
      status: "In Progress",
      start: "2025-02-11 10:30 AM",
      end: null,
    },
    {
      id: "BATCH-003",
      product: "Small Bottles Pack",
      qty: 200,
      status: "Completed",
      start: "2025-02-10 08:00 AM",
      end: "2025-02-10 03:10 PM",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);

  const productOptions = [
    { name: "20L Bottle", price: 250 },
    { name: "10L Bottle", price: 160 },
    { name: "Small Bottles Pack", price: 120 },
  ];

  const startBatch = (id) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "In Progress", start: new Date().toLocaleString() }
          : b
      )
    );
  };

  const completeBatch = (id) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "Completed", end: new Date().toLocaleString() }
          : b
      )
    );
  };

  const addBatch = (batch) => {
    setBatches([
      {
        id: "BATCH-" + Math.floor(Math.random() * 900 + 100),
        ...batch,
        status: "Plannedy",
        start: null,
        end: null,
      },
      ...batches,
    ]);
  };

  const getStatusBadge = (status) => {
    const map = {
      Plannedy: "bg-yellow-200 text-yellow-800",
      "In Progress": "bg-blue-200 text-blue-800",
      Completed: "bg-green-200 text-green-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full font-semibold ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Production</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <PlusCircle size={20} /> Add Batch
        </button>
      </div>

      {/* Batch List */}
      <div className="grid md:grid-cols-2 gap-6">
        {batches.map((batch, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package size={20} /> {batch.product}
              </h2>
              {getStatusBadge(batch.status)}
            </div>

            <p className="text-sm mb-1">Batch ID: {batch.id}</p>
            <p className="text-sm mb-1">Quantity: {batch.qty}</p>

            {batch.start && (
              <p className="text-sm mb-1 flex items-center gap-2">
                <Clock size={14} /> Started: {batch.start}
              </p>
            )}
            {batch.end && (
              <p className="text-sm mb-1 flex items-center gap-2">
                <CheckCircle size={14} /> Completed: {batch.end}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {batch.status === "Plannedy" && (
                <button
                  onClick={() => startBatch(batch.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Begin Production
                </button>
              )}
              {batch.status === "In Progress" && (
                <button
                  onClick={() => completeBatch(batch.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Completed
                </button>
              )}
              {batch.status === "Completed" && (
                <p className="text-green-700 font-semibold mt-2">
                  Production Completed
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Batch Modal */}
      {modalOpen && (
        <BatchForm
          closeModal={() => setModalOpen(false)}
          addBatch={addBatch}
          productOptions={productOptions}
        />
      )}
    </div>
  );
}

export default Production;

// import React, { useEffect, useState } from "react";
// import { PlusCircle, Clock, CheckCircle, Package, ShieldCheck, Trash } from "lucide-react";
// import BatchForm from "../../components/forms/BatchForm";

// // Pull logged-in user role from localStorage
// const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");

// function Production() {
//   const [batches, setBatches] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);

//   const user = getUser(); // { username, role }
//   const role = user?.role || "maker";

//   const productOptions = [
//     { productId: "P1", name: "20L Bottle", price: 250 },
//     { productId: "P2", name: "10L Bottle", price: 160 },
//     { productId: "P3", name: "Small Bottles Pack", price: 120 },
//   ];

//   // 🔥 LOAD batches from localStorage (including auto-created ones)
//   useEffect(() => {
//     const raw = localStorage.getItem("productionBatches");
//     if (raw) setBatches(JSON.parse(raw));
//   }, []);

//   // 🔥 Save back to localStorage anytime batches change
//   useEffect(() => {
//     localStorage.setItem("productionBatches", JSON.stringify(batches));
//   }, [batches]);

//   // 🔥 Save inventory changes
//   const updateInventoryAfterCompletion = (productId, quantityCompleted) => {
//     const invRaw = localStorage.getItem("inventory");
//     if (!invRaw) return;

//     let inventory = JSON.parse(invRaw);

//     inventory = inventory.map((item) =>
//       item.productId === productId
//         ? {
//             ...item,
//             quantityAvailable: item.quantityAvailable + Number(quantityCompleted),
//             lastStockCountDate: new Date().toISOString().split("T")[0],
//           }
//         : item
//     );

//     localStorage.setItem("inventory", JSON.stringify(inventory));
//   };

//   const startBatch = (id) => {
//     if (role !== "maker" && role !== "admin") return;

//     setBatches((prev) =>
//       prev.map((b) =>
//         b.id === id
//           ? {
//               ...b,
//               status: "IN_PROGRESS",
//               productionStartTime: new Date().toISOString(),
//             }
//           : b
//       )
//     );
//   };

//   const completeBatch = (id) => {
//     if (role !== "maker" && role !== "admin") return;

//     setBatches((prev) =>
//       prev.map((b) => {
//         if (b.id === id) {
//           updateInventoryAfterCompletion(b.productId, b.quantityPlanned);

//           return {
//             ...b,
//             status: "COMPLETED",
//             productionEndTime: new Date().toISOString(),
//             quantityCompleted: b.quantityPlanned,
//           };
//         }
//         return b;
//       })
//     );
//   };

//   const approveQC = (id) => {
//     if (role !== "checker" && role !== "admin") return;

//     setBatches((prev) =>
//       prev.map((b) =>
//         b.id === id ? { ...b, qualityCheckPassed: true } : b
//       )
//     );
//   };

//   const deleteBatch = (id) => {
//     if (role !== "admin") return;

//     setBatches((prev) => prev.filter((b) => b.id !== id));
//   };

//   const addBatch = (batch) => {
//     if (role !== "admin") return;

//     const newBatch = {
//       id: crypto.randomUUID(),
//       batchId: "BATCH-" + Math.floor(Math.random() * 900 + 100),
//       productId: batch.productId,
//       product: productOptions.find((p) => p.productId === batch.productId)?.name,
//       quantityPlanned: Number(batch.qty),
//       quantityCompleted: 0,
//       quantityDefective: 0,
//       quantityWasted: 0,
//       productionDate: new Date().toISOString().split("T")[0],
//       productionStartTime: null,
//       productionEndTime: null,
//       qualityCheckPassed: false,
//       assignedWorkerId: user.username,
//       status: "PLANNED",
//       createdBy: user.username,
//     };

//     setBatches((prev) => [newBatch, ...prev]);
//   };

//   const getStatusBadge = (status) => {
//     const map = {
//       PLANNED: "bg-yellow-200 text-yellow-800",
//       IN_PROGRESS: "bg-blue-200 text-blue-800",
//       COMPLETED: "bg-green-200 text-green-800",
//     };
//     return (
//       <span className={`px-3 py-1 rounded-full font-semibold ${map[status]}`}>
//         {status}
//       </span>
//     );
//   };

//   return (
//     <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Production</h1>

//         {role === "admin" && (
//           <button
//             onClick={() => setModalOpen(true)}
//             className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             <PlusCircle size={20} /> Add Batch
//           </button>
//         )}
//       </div>

//       {/* Batch List */}
//       <div className="grid md:grid-cols-2 gap-6">
//         {batches.map((batch, i) => (
//           <div
//             key={i}
//             className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
//           >
//             <div className="flex justify-between items-start mb-3">
//               <h2 className="text-xl font-bold flex items-center gap-2">
//                 <Package size={20} /> {batch.product}
//               </h2>
//               {getStatusBadge(batch.status)}
//             </div>

//             <p className="text-sm mb-1">Batch ID: {batch.batchId}</p>
//             <p className="text-sm mb-1">Planned Qty: {batch.quantityPlanned}</p>

//             {batch.productionStartTime && (
//               <p className="text-sm flex items-center gap-2">
//                 <Clock size={14} /> Started:{" "}
//                 {new Date(batch.productionStartTime).toLocaleString()}
//               </p>
//             )}

//             {batch.productionEndTime && (
//               <p className="text-sm flex items-center gap-2">
//                 <CheckCircle size={14} /> Completed:{" "}
//                 {new Date(batch.productionEndTime).toLocaleString()}
//               </p>
//             )}

//             {batch.qualityCheckPassed && (
//               <p className="text-green-600 font-semibold mt-1 flex items-center gap-2">
//                 <ShieldCheck size={16} /> QC Passed
//               </p>
//             )}

//             {/* ACTION BUTTONS */}
//             <div className="mt-4 flex flex-wrap gap-2">
//               {batch.status === "PLANNED" && (role === "maker" || role === "admin") && (
//                 <button
//                   onClick={() => startBatch(batch.id)}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Begin Production
//                 </button>
//               )}

//               {batch.status === "IN_PROGRESS" && (role === "maker" || role === "admin") && (
//                 <button
//                   onClick={() => completeBatch(batch.id)}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                 >
//                   Mark Completed
//                 </button>
//               )}

//               {batch.status === "COMPLETED" &&
//                 !batch.qualityCheckPassed &&
//                 (role === "checker" || role === "admin") && (
//                   <button
//                     onClick={() => approveQC(batch.id)}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                   >
//                     Approve QC
//                   </button>
//                 )}

//               {role === "admin" && (
//                 <button
//                   onClick={() => deleteBatch(batch.id)}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
//                 >
//                   <Trash size={16} /> Delete
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Batch Modal */}
//       {modalOpen && (
//         <BatchForm
//           closeModal={() => setModalOpen(false)}
//           addBatch={addBatch}
//           productOptions={productOptions}
//         />
//       )}
//     </div>
//   );
// }

// export default Production;
