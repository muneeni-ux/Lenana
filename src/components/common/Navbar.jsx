import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  ShoppingBag,
  Package,
  BarChart,
  ClipboardList,
  Users,
  Truck,
  FileText,
  Layers,
} from "lucide-react";

const Navbar = ({ role, loggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };

  const logo =
    "https://greenworld.co.za/home/wp-content/uploads/2017/11/green_world_logo.png";

  /* ------------------------- LIGHT / DARK MODE ------------------------- */
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", nextTheme);
  };

  // useEffect(() => {
  //   if (theme === "dark") document.documentElement.classList.add("dark");
  // }, []);
  useEffect(() => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [theme]);


  /* -------------------------- NAV ITEMS LOGIC --------------------------- */

  // Default (guest)
  const guestNavItems = [
    { path: "/", label: "Home" },
    { path: "/", label: "Products" },
    { path: "/", label: "About" },
    { path: "/", label: "Contact" },
  ];

  // Maker items
  const makerNav = [
    { path: "/dashboard", label: "Dashboard", icon: <BarChart size={16} /> },
    { path: "/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { path: "/production", label: "Production", icon: <Package size={16} /> },
    { path: "/clients", label: "Clients", icon: <Users size={16} /> },
  ];

  // Checker items
  const checkerNav = [
    { path: "/checker/dashboard", label: "Dashboard", icon: <BarChart size={16} /> },
    { path: "/checker/clients", label: "Clients", icon: <Users size={16} /> },
    { path: "/checker/orders", label: "Orders", icon: <ClipboardList size={16} /> },
    { path: "/checker/production", label: "Production", icon: <Package size={16} /> },
    { path: "/checker/invoices", label: "Invoices", icon: <FileText size={16} /> },
    { path: "/checker/delivery", label: "Delivery", icon: <Truck size={16} /> },
    { path: "/checker/stock", label: "Stock Movement", icon: <Layers size={16} /> },
  ];

  // Admin items
  const adminNav = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <BarChart size={16} /> },
    { path: "/admin/users", label: "Users", icon: <Users size={16} /> },
    { path: "/admin/sales", label: "Sales", icon: <ShoppingBag size={16} /> },
  ];

  // Determine what to display
  let navItems = guestNavItems;
  if (loggedIn && role === "maker") navItems = makerNav;
  if (loggedIn && role === "checker") navItems = checkerNav;
  if (loggedIn && role === "admin") navItems = adminNav;

  /* -------------------------- LOGOUT --------------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ----------------------- CLOSE DROPDOWN ON CLICK AWAY ----------------------- */
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 shadow bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} className="w-10 h-10 rounded-full border border-green-600" alt="logo" />
          <h1 className="text-lg font-semibold text-green-700 dark:text-green-300">
            Lenana Drops
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-700"
                }`
              }
            >
              {item.icon && item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Theme toggle + User */}
        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* If guest → Login button */}
          {!loggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Login
            </button>
          )}

          {/* User Dropdown */}
          {loggedIn && (
            <div className="relative" ref={dropdownRef}>
              <div
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-gray-700 rounded-lg cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="text-green-700 dark:text-green-300" />
                <span className="text-gray-800 dark:text-gray-200 text-sm">{user.username}</span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 w-48 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-3 text-sm w-full text-left hover:bg-green-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings size={16} /> Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm w-full text-left hover:bg-red-100 dark:hover:bg-red-700/30 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">
            Lenana Drops
          </h2>
          <button onClick={() => setMenuOpen(false)}>
            <X size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Sidebar items */}
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {!loggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Login
            </button>
          )}

          {loggedIn && (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings size={18} className="inline-block mr-2" />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full p-3 text-left bg-red-500 text-white rounded-lg mt-2 hover:bg-red-600"
              >
                <LogOut size={18} className="inline-block mr-2" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
