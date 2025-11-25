import React, { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../components/common/ThemeContext";
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
  Droplet,
  Info,
  Phone,
  ShoppingCart,
} from "lucide-react";

const Navbar = ({ role, loggedIn }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* --------------------------- THEME ---------------------------- */
  const { theme, toggleTheme } = useContext(ThemeContext);

  /* --------------------------- SIDEBAR & DROPDOWN ---------------------------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
  };

  /* --------------------------- NAV ITEMS ---------------------------- */
  const guestNav = [
    { path: "/", label: "Home", icon: <BarChart size={16} /> },
    { path: "/#products", label: "Products", icon: <ShoppingCart size={16} /> },
    { path: "/#about", label: "About", icon: <Info size={16} /> },
    { path: "/#contact", label: "Contact", icon: <Phone size={16} /> },
  ];

  const makerNav = [
    { path: "/dashboard", label: "Dashboard", icon: <BarChart size={16} /> },
    { path: "/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { path: "/production", label: "Production", icon: <Package size={16} /> },
    { path: "/clients", label: "Clients", icon: <Users size={16} /> },
    { path: "/inventory", label: "Inventory", icon: <FileText size={16} /> },
  ];

  const checkerNav = [
    {
      path: "/checker/dashboard",
      label: "Dashboard",
      icon: <BarChart size={16} />,
    },
    { path: "/checker/clients", label: "Clients", icon: <Users size={16} /> },
    {
      path: "/checker/orders",
      label: "Orders",
      icon: <ClipboardList size={16} />,
    },
    {
      path: "/checker/production",
      label: "Production",
      icon: <Package size={16} />,
    },
    {
      path: "/checker/invoices",
      label: "Invoices",
      icon: <FileText size={16} />,
    },
    { path: "/checker/delivery", label: "Delivery", icon: <Truck size={16} /> },
    { path: "/inventory", label: "Inventory", icon: <Layers size={16} /> },
  ];

  const adminNav = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <BarChart size={16} />,
    },
    { path: "/admin/users", label: "Users", icon: <Users size={16} /> },
    { path: "/admin/sales", label: "Sales", icon: <ShoppingBag size={16} /> },
  ];

  let navItems = guestNav;
  if (loggedIn && role === "maker") navItems = makerNav;
  if (loggedIn && role === "checker") navItems = checkerNav;
  if (loggedIn && role === "admin") navItems = adminNav;

  /* --------------------------- LOGOUT ---------------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ======================================================================= */
  /*                             NAVBAR UI CODE                               */
  /* ======================================================================= */
  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-300 dark:border-gray-700 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 md:px-0 py-3">
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          {/* <Droplet size={22} className="text-white" /> */}
          <img
            src="./LenanaLogo3.jpg"
            alt=""
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold text-amber-700 dark:text-amber-300">
              Lenana Drops
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nanyuki</p>
          </div>
        </div>

        {/* NAV LINKS (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-4">
          {/* THEME BUTTON */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Login Button for Guests */}
          {!loggedIn && (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block px-5 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            >
              Login
            </button>
          )}

          {/* Logged In User Dropdown */}
          {loggedIn && (
            <div ref={dropdownRef} className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-gray-700 rounded-lg"
              >
                <User className="text-amber-600 dark:text-amber-300" />
                <span className="text-sm">{user.username}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border dark:border-gray-700">
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-4 py-3 text-sm flex gap-2 hover:bg-amber-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Settings size={16} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-sm flex gap-2 hover:bg-red-100 dark:hover:bg-red-700/30 text-red-600 dark:text-red-400 w-full text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ========================= MOBILE SIDEBAR ========================= */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-white/20 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Droplet size={24} className="text-white" />
            <h2 className="text-xl font-semibold">Menu</h2>
          </div>
          <button onClick={() => setMenuOpen(false)}>
            <X size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-grow space-y-1 p-4 bg-white dark:bg-gray-900 rounded-b-3xl">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-amber-100 text-amber-800 border-l-4 border-amber-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-700"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {!loggedIn ? (
            <button
              onClick={() => navigate("/login")}
              className="w-full p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="w-full p-3 rounded-lg text-left hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Settings className="inline-block mr-2" size={16} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <LogOut className="inline-block mr-2" size={16} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}
    </header>
  );
};

export default Navbar;
