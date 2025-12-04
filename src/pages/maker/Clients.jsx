// import React, { useState } from "react";
// import { UserPlus, Search, Phone, MapPin } from "lucide-react";
// import ClientForm from "../../components/forms/ClientForm";

// function Clients() {
//   const [search, setSearch] = useState("");
//   const [formOpen, setFormOpen] = useState(false);

//   const [clients, setClients] = useState([
//     { name: "Mount Kenya Spa", phone: "+254 712 345 678", location: "Nanyuki", orders: 12 },
//     { name: "Laikipia Hotel", phone: "+254 710 000 001", location: "Laikipia", orders: 8 },
//     { name: "Nanyuki Mart", phone: "+254 723 888 444", location: "Nanyuki CBD", orders: 20 },
//   ]);

//   const handleAddClient = (client) => {
//     setClients([{ ...client, orders: 0, name: client.businessName }, ...clients]);
//     setFormOpen(false);
//   };

//   return (
//     <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Clients</h1>
//         <button
//           onClick={() => setFormOpen(true)}
//           className="flex items-center gap-2 bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 transition"
//         >
//           <UserPlus size={20} />
//           Add Client
//         </button>
//       </div>

//       {/* Search */}
//       <div className="relative mb-8 max-w-md">
//         <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//         <input
//           type="text"
//           placeholder="Search clients..."
//           className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Clients Grid */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {clients
//           .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
//           .map((client, i) => (
//             <div
//               key={i}
//               className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1"
//             >
//               <h2 className="text-xl font-bold mb-2">{client.name}</h2>
//               <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
//                 <Phone size={16} /> {client.phone}
//               </p>
//               <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
//                 <MapPin size={16} /> {client.location}
//               </p>
//               <div className="mt-3 font-semibold text-sm text-green-700 dark:text-green-300">
//                 Total Orders: {client.orders}
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Modal Form */}
//       {formOpen && (
//         <ClientForm
//           onClose={() => setFormOpen(false)}
//           onSave={handleAddClient}
//         />
//       )}
//     </div>
//   );
// }

// export default Clients;

import React, { useEffect, useState } from "react";
import { UserPlus, Search, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import ClientForm from "../../components/forms/ClientForm";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

function Clients() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6; // number of clients per page

  const totalPages = Math.ceil(
    clients.filter((c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase())
    ).length / pageSize
  );

  // ───────────────────────────────────────────
  // Fetch Clients from Backend
  // ───────────────────────────────────────────
  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${SERVER_URL}/api/clients`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setClients(data);
    } catch (err) {
      toast.error("Failed to load clients");
      console.error("❌ Fetch Clients Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ───────────────────────────────────────────
  // Add New Client (Backend)
  // ───────────────────────────────────────────
  const handleAddClient = async (clientData) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(clientData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Client Added");
      setFormOpen(false);

      fetchClients(); // refresh list
    } catch (err) {
      toast.error("Failed to add client");
      console.error("❌ Create Client Error:", err);
    }
  };

  // ───────────────────────────────────────────
  // Filter + Pagination Logic
  // ───────────────────────────────────────────
  const filteredClients = clients.filter((c) =>
    c.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedClients = filteredClients.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 transition"
        >
          <UserPlus size={20} />
          Add Client
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 
            dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 
            focus:ring-green-500 outline-none transition"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* LOADING STATE */}
      {loading && <p className="text-center text-gray-500">Loading clients...</p>}

      {/* CLIENT CARDS */}
      {!loading && paginatedClients.length === 0 && (
        <p className="text-center text-gray-500">No clients found.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedClients.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl 
            transition transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold mb-2">{client.businessName}</h2>

            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
              <Phone size={16} /> {client.phone}
            </p>

            <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
              <MapPin size={16} /> {client.deliveryAddress}
            </p>

            <div className="mt-3 font-semibold text-sm text-green-700 dark:text-green-300">
              Status: {client.status}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-4 py-2 font-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* FORM MODAL */}
      {formOpen && (
        <ClientForm
          onClose={() => setFormOpen(false)}
          onSave={handleAddClient}
        />
      )}
    </div>
  );
}

export default Clients;
