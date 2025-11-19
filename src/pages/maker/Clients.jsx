import React, { useState } from "react";
import { UserPlus, Search, Phone, MapPin } from "lucide-react";

function Clients() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const [clients, setClients] = useState([
    {
      name: "Mount Kenya Spa",
      phone: "+254 712 345 678",
      location: "Nanyuki",
      orders: 12,
    },
    {
      name: "Laikipia Hotel",
      phone: "+254 710 000 001",
      location: "Laikipia",
      orders: 8,
    },
    {
      name: "Nanyuki Mart",
      phone: "+254 723 888 444",
      location: "Nanyuki CBD",
      orders: 20,
    },
  ]);

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    location: "",
  });

  const handleAddClient = (e) => {
    e.preventDefault();
    setClients([{ ...newClient, orders: 0 }, ...clients]);
    setNewClient({ name: "", phone: "", location: "" });
    setFormOpen(false);
  };

  return (
    <div className="pt-24 px-6 pb-10 text-gray-800 dark:text-gray-100 transition-all">

      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <UserPlus size={20} />
          Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients
          .filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((client, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
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

      {/* Add Client Form (Slide-In) */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 h-full p-6 animate-slide-left shadow-xl">
            <h2 className="text-2xl font-bold mb-5">Add Client</h2>

            <form onSubmit={handleAddClient} className="space-y-5">

              <div>
                <label className="text-sm font-semibold">Client Name</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Phone</label>
                <input
                  type="text"
                  required
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Location</label>
                <input
                  type="text"
                  required
                  value={newClient.location}
                  onChange={(e) =>
                    setNewClient({ ...newClient, location: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
              >
                Save Client
              </button>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-full bg-gray-300 dark:bg-gray-600 py-3 rounded-lg mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Clients;
