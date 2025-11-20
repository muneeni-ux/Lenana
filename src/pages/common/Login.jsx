import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Droplet } from "lucide-react";
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

    // 🔐 For now simulate Checker login
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem(
      "user",
      JSON.stringify({ username: "Checker", role: "checker" })
    );

    toast.success("Logged in successfully");

    navigate("/checker/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative bg-gray-100 dark:bg-gray-900">
      {/* Background Image */}
      <img
        src="https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-20"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"></div>

      {/* GLASS LOGIN CARD */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40 dark:border-gray-700">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 dark:bg-green-500 p-3 rounded-full shadow-lg">
            <Droplet className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 mt-3">
            Lenana Drops Portal
          </h1>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Login to continue to your dashboard
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500 dark:text-gray-300" />

            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-white backdrop-blur focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500 dark:text-gray-300" />

            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-white backdrop-blur focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition"
            >
              {showPass ? <EyeOff /> : <Eye />}
            </div>
          </div>

          {/* Login Button */}
          <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg">
            <LogIn size={18} />
            Login
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-gray-300 mt-6">
          Need help? Contact the administrator.
        </p>
        <center>
          <button
            onClick={() => navigate("/")}
            className="text-sm mt-4 flex items-center justify-center text-blue-200 hover:underline"
          >
            Back to Home
          </button>
        </center>
      </div>
    </div>
  );
}

export default Login;
