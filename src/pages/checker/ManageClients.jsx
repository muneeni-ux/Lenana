import React, { useEffect, useState } from "react";
import { Search, Phone, MapPin, UserPlus, Edit3 } from "lucide-react";
import ClientForm from "../../components/forms/ClientForm";
import CheckerEditClientForm from "../../components/forms/CheckerEditClientForm";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

function ManageClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

  // ─────────────────────────────────────────────
  // Load Clients from Backend
  // ─────────────────────────────────────────────
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/clients`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      setClients(data);
    } catch (e) {
      toast.error("Failed to load clients");
    }
  };

  // ─────────────────────────────────────────────
  // Add Client
  // ─────────────────────────────────────────────
  const handleAddClient = async (client) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(client),
      });

      const data = await res.json();

      if (!res.ok) return toast.error(data.error || "Failed to add client");

      toast.success("Client added successfully");
      loadClients();
      setAddOpen(false);
    } catch (err) {
      toast.error("Error creating client");
    }
  };

  // ─────────────────────────────────────────────
  // Edit Client
  // ─────────────────────────────────────────────
  const handleSaveEdit = async (updatedClient) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/clients/${updatedClient.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedClient),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.error);

      toast.success("Client updated");
      setEditClient(null);
      loadClients();
    } catch (err) {
      toast.error("Error updating client");
    }
  };

  return (
    <div className="pt-16 px-6 pb-10 text-gray-800 dark:text-gray-100">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients
          .filter((c) =>
            c.businessName.toLowerCase().includes(search.toLowerCase())
          )
          .map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow 
    hover:shadow-xl transition transform hover:-translate-y-1 relative"
            >
              {/* STATUS BANNER */}
              {client.status !== "ACTIVE" && (
                <div
                  className={`absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-semibold
        ${
          client.status === "INACTIVE"
            ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
            : ""
        }
        ${
          client.status === "ON_HOLD"
            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100"
            : ""
        }
      `}
                >
                  {client.status.replace("_", " ")}
                </div>
              )}

              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{client.businessName}</h2>
                <span
                  className="px-3 py-1 rounded-full text-xs 
      bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
                >
                  {client.clientType}
                </span>
              </div>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-3">
                <Phone size={16} /> {client.phone}
              </p>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin size={16} /> {client.deliveryAddress}
              </p>

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

      {addOpen && (
        <ClientForm
          onClose={() => setAddOpen(false)}
          onSave={handleAddClient}
        />
      )}

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
