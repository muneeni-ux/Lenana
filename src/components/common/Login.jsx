import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    // For now, simulate Maker login
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", JSON.stringify({ username: "Maker", role: "maker" }));

    toast.success("Logged in successfully");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900 transition-all">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        
        <h1 className="text-3xl font-bold text-center text-green-600 dark:text-green-400 mb-6">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" />

            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" />

            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPass ? <EyeOff /> : <Eye />}
            </div>
          </div>

          <button
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-300 mt-6">
          Having trouble logging in? Contact the administrator.
        </p>
      </div>
    </div>
  );
}

export default Login;
