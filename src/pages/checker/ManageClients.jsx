import React, { useState } from "react";
import { Search, Phone, MapPin, UserPlus, Edit3 } from "lucide-react";
import ClientForm from "../../components/forms/ClientForm";
import CheckerEditClientForm from "../../components/forms/CheckerEditClientForm";

function ManageClients() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const [clients, setClients] = useState([
    {
      id: "CL-001",
      clientType: "BUSINESS",
      businessName: "Mount Kenya Spa",
      phone: "+254 712 345 678",
      deliveryAddress: "Nanyuki",
      orders: 12,
      status: "ACTIVE",
    },
    {
      id: "CL-002",
      clientType: "BUSINESS",
      businessName: "Laikipia Hotel",
      phone: "+254 710 000 001",
      deliveryAddress: "Laikipia",
      orders: 8,
      status: "ACTIVE",
    },
    {
      id: "CL-003",
      clientType: "RETAIL",
      businessName: "Nanyuki Mart",
      phone: "+254 723 888 444",
      deliveryAddress: "Nanyuki CBD",
      orders: 20,
      status: "ACTIVE",
    },
  ]);

  const handleAddClient = (client) => {
    const newClient = {
      id: "CL-" + Math.floor(Math.random() * 900 + 100),
      orders: 0,
      status: "ACTIVE",
      ...client,
      businessName: client.businessName,
    };
    setClients([newClient, ...clients]);
    setAddOpen(false);
  };

  const handleSaveEdit = (updated) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setEditClient(null);
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Clients</h1>
        <button
          onClick={() => setAddOpen(true)}
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
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 
            dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 
            focus:ring-green-500 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients
          .filter((c) =>
            c.businessName.toLowerCase().includes(search.toLowerCase())
          )
          .map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow 
                hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{client.businessName}</h2>
                <span
                  className="px-3 py-1 rounded-full text-xs 
                bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
                >
                  {client.clientType}
                </span>
              </div>

              <p className="flex items-center gap-2 text-gray-700 
                dark:text-gray-300 mt-3">
                <Phone size={16} /> {client.phone}
              </p>

              <p className="flex items-center gap-2 text-gray-700 
                dark:text-gray-300">
                <MapPin size={16} /> {client.deliveryAddress}
              </p>

              <div className="mt-2 font-semibold text-sm text-green-700 
                dark:text-green-300">
                Total Orders: {client.orders}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditClient(client)}
                className="mt-4 w-full flex items-center justify-center gap-2 
                bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit3 size={18} /> Edit Client
              </button>
            </div>
          ))}
      </div>

      {/* Add Client Modal */}
      {addOpen && (
        <ClientForm
          onClose={() => setAddOpen(false)}
          onSave={handleAddClient}
        />
      )}

      {/* Edit Modal */}
      {editClient && (
        <CheckerEditClientForm
          client={editClient}
          onClose={() => setEditClient(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default ManageClients;
