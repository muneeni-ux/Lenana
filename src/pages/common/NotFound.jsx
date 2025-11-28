import React from "react";
import { ArrowLeftCircle, Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">

      {/* Ghost Icon */}
      <div className="flex flex-col items-center animate-fadeIn">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
          <Ghost size={70} className="text-amber-600 dark:text-amber-400 animate-wiggle" />
        </div>

        <h1 className="text-5xl font-bold text-center mb-3">404</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-md">
          Oops! The page you’re looking for has vanished like a drop of water in the desert.
        </p>
      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-10 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all"
      >
        <ArrowLeftCircle size={20} />
        Back to Home
      </button>

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }

          .animate-wiggle {
            animation: wiggle 1.2s infinite ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(6deg); }
          }
        `}
      </style>
    </div>
  );
}

export default NotFound;
