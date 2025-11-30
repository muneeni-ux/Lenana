import React, { useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import StockInForm from "../../components/forms/StockInForm";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

export default function StockIn() {
  const [stockRecords, setStockRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5; // Change this number to show more/less per page

  const categories = ["Crates", "Bottles", "Stickers", "Packaging", "Other"];
  const token = localStorage.getItem("token");

  // Fetch stock records from backend
const fetchStock = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${SERVER_URL}/api/stock-in/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch stock");

    const data = await res.json();
    setStockRecords(data || []);
  } catch (err) {
    toast.error("Failed to load stock records.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchStock();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(stockRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = stockRecords.slice(startIndex, endIndex);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="pt-16 px-6 pb-12 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Record Stock In</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add raw materials received for production.
          </p>
        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white py-2 px-5 rounded-lg shadow hover:bg-green-700 transition"
        >
          <Plus size={20} /> Add Stock
        </button>
      </div>

      {/* Stock Records Table */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Total Cost</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              {/* <th className="p-3">Added By</th> */}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && stockRecords.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No stock records yet.
                </td>
              </tr>
            )}

            {!loading &&
              currentRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-semibold">{rec.recordId}</td>
                  <td className="p-3">{rec.category}</td>
                  <td className="p-3">{rec.quantity}</td>
                  <td className="p-3">Ksh {rec.unitCost.toLocaleString()}</td>
                  <td className="p-3 font-bold">
                    Ksh {rec.totalCost.toLocaleString()}
                  </td>
                  <td className="p-3">{rec.status}</td>
                  <td className="p-3">
                    {new Date(rec.createdAt).toLocaleString()}
                  </td>
                  {/* <td className="p-3">{rec.makerName || rec.makerId}</td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {stockRecords.length > recordsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal */}
      {formOpen && (
        <StockInForm
          onClose={() => setFormOpen(false)}
          categories={categories}
          onSuccess={() => {
            fetchStock();
            setCurrentPage(1); // reset to first page after adding new stock
          }}
        />
      )}
    </div>
  );
}
