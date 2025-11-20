import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

function QualityCheckModal({ batch, onClose, onSubmit }) {
  const [completed, setCompleted] = useState(batch.quantityCompleted || "");
  const [defective, setDefective] = useState(batch.quantityDefective || 0);
  const [wasted, setWasted] = useState(batch.quantityWasted || 0);
  const [passed, setPassed] = useState(true);

  const handleSave = () => {
    const payload = {
      ...batch,
      quantityCompleted: Number(completed),
      quantityDefective: Number(defective),
      quantityWasted: Number(wasted),
      qualityCheckPassed: passed,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm p-4 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Quality Check – {batch.batchId}</h2>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-sm">Quantity Completed</label>
            <input
              type="number"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-sm">Defective</label>
              <input
                type="number"
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={defective}
                onChange={(e) => setDefective(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-sm">Wasted</label>
              <input
                type="number"
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
                value={wasted}
                onChange={(e) => setWasted(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setPassed(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                passed ? "bg-green-600 text-white" : ""
              }`}
            >
              <CheckCircle size={18} /> Passed
            </button>

            <button
              onClick={() => setPassed(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                !passed ? "bg-red-600 text-white" : ""
              }`}
            >
              <XCircle size={18} /> Failed
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default QualityCheckModal;
