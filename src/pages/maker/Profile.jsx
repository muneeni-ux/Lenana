import React, { useState } from "react";
import { User, Lock, Camera, Phone } from "lucide-react";
import toast from "react-hot-toast";

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    username: "User",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  };

  const [userData, setUserData] = useState({
    username: storedUser.username,
    firstName: storedUser.firstName,
    lastName: storedUser.lastName,
    email: storedUser.email,
    phone: storedUser.phone,
    role: storedUser.role?.toUpperCase(),
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(userData));
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    toast.success("Password updated!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="pt-24 px-6 pb-24 text-gray-800 dark:text-gray-100 transition-all">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT PROFILE CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="relative">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5987/5987420.png"
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow"
            />

            {/* Upload Button */}
            <button className="absolute bottom-2 right-2 bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition">
              <Camera size={16} />
            </button>
          </div>

          <h2 className="text-xl font-bold mt-4">{userData.username}</h2>
          <p className="text-gray-600 dark:text-gray-300">{userData.email}</p>

          <div className="mt-6 bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100 px-6 py-2 rounded-lg font-semibold">
            {userData.role} Role
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-10">

          {/* PROFILE FORM */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User size={20} /> Personal Information
            </h2>

            <form onSubmit={handleProfileSave} className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-sm font-semibold">Username</label>
                <input
                  type="text"
                  required
                  value={userData.username}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  required
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Phone</label>
                <input
                  type="text"
                  required
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>

          {/* PASSWORD FORM */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock size={20} /> Change Password
            </h2>

            <form onSubmit={handlePasswordChange} className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-sm font-semibold">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
                >
                  Update Password
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>

      {/* 📞 SUPPORT CALL BUTTON */}
      <a
        href="tel:+254700000000"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg vibrate"
      >
        <Phone size={30} />
      </a>
    </div>
  );
}

export default Profile;
