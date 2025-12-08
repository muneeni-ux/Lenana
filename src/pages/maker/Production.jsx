import React, { useState, useEffect } from "react";
import { PlusCircle, Clock, CheckCircle, Package } from "lucide-react";
import toast from "react-hot-toast";
import BatchForm from "../../components/forms/BatchForm";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
const PAGE_SIZE = 6; // adjust per page

function Production() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBatches = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${SERVER_URL}/api/production?page=${pageNum}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBatches(res.data || []);
      setTotalPages(1);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch production batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${SERVER_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const options = res.data.map((p) => ({
        productId: p.id,
        name: p.productName,
        price: p.totalCostPerUnitKsh || 0,
      }));
      setProductOptions(options);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  const startBatch = async (batchId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${SERVER_URL}/api/production/${batchId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Production started for ${batchId}`);
      fetchBatches(page);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start batch");
    }
  };

  const completeBatch = async (batchId, qtyCompleted) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${SERVER_URL}/api/production/${batchId}/complete`,
        { quantityCompleted: qtyCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Batch ${batchId} marked as completed`);
      fetchBatches(page);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to complete batch");
    }
  };

  const addBatch = async (batch) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${SERVER_URL}/api/production`,
        {
          productId: batch.productId,
          quantityPlanned: Number(batch.qty),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setModalOpen(false);
      fetchBatches(page);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create batch");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: "bg-yellow-200 text-yellow-800",
      IN_PROGRESS: "bg-blue-200 text-blue-800",
      COMPLETED: "bg-green-200 text-green-800",
      APPROVED: "bg-teal-200 text-teal-800",
      REJECTED: "bg-red-200 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full font-semibold ${map[status] || ""}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const formatDateTime = (d) => {
    if (!d) return "---";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleString(); // Shows both date and time
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchBatches(newPage);
  };

  return (
    <div className="pt-16 px-6 pb-12 text-gray-800 dark:text-gray-100 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Production</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700 transition"
        >
          <PlusCircle size={20} /> Add Batch
        </button>
      </div>

      {/* Batch List */}
      {loading ? (
        <p>Loading batches...</p>
      ) : batches.length === 0 ? (
        <p>No production batches found.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {batches.map((batch) => (
              <div
                key={batch.batchId}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package size={20} /> {batch.productName}
                  </h2>
                  {getStatusBadge(batch.status)}
                </div>

                <p className="text-sm mb-1">Batch ID: {batch.batchId}</p>
                <p className="text-sm mb-1">
                  Quantity: {batch.quantityPlanned}
                </p>

                {batch.productionStartTime && (
                  <p className="text-sm mb-1 flex items-center gap-2">
                    <Clock size={14} /> Started:{" "}
                    {formatDateTime(batch.productionStartTime)}
                  </p>
                )}
                {batch.productionEndTime && (
                  <p className="text-sm mb-1 flex items-center gap-2">
                    <CheckCircle size={14} /> Completed:{" "}
                    {formatDateTime(batch.productionEndTime)}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {batch.status === "PENDING" && (
                    <button
                      onClick={() => startBatch(batch.batchId)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Begin Production
                    </button>
                  )}
                  {batch.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => {
                        const qty = prompt(
                          "Enter completed quantity",
                          batch.quantityPlanned
                        );
                        if (!qty) return;
                        completeBatch(batch.batchId, Number(qty));
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark Completed
                    </button>
                  )}
                  {batch.status === "COMPLETED" && (
                    <p className="text-green-700 font-semibold mt-2">
                      Production Completed
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

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
