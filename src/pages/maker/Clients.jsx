import React, { useState } from "react";
import { UserPlus, Search, Phone, MapPin } from "lucide-react";
import ClientForm from "../../components/forms/ClientForm";

function Clients() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [clients, setClients] = useState([
    { name: "Mount Kenya Spa", phone: "+254 712 345 678", location: "Nanyuki", orders: 12 },
    { name: "Laikipia Hotel", phone: "+254 710 000 001", location: "Laikipia", orders: 8 },
    { name: "Nanyuki Mart", phone: "+254 723 888 444", location: "Nanyuki CBD", orders: 20 },
  ]);

  const handleAddClient = (client) => {
    setClients([{ ...client, orders: 0, name: client.businessName }, ...clients]);
    setFormOpen(false);
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

      {/* Header */}
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

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients
          .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
          .map((client, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-2">{client.name}</h2>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                <Phone size={16} /> {client.phone}
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
                <MapPin size={16} /> {client.location}
              </p>
              <div className="mt-3 font-semibold text-sm text-green-700 dark:text-green-300">
                Total Orders: {client.orders}
              </div>
            </div>
          ))}
      </div>

      {/* Modal Form */}
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
