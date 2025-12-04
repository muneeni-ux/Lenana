
// import React from 'react';
// import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import NotFound from './pages/common/NotFound';
// import Navbar from './components/common/Navbar';
// import Footer from './components/common/Footer';
// // Admin components
// import UsersDetails from "./Admin/UserDetails";
// import AdminDashboard from "./Admin/AdminDashboard";
// import ProtectedRoute from "./Admin/ProtectedRoute";
// import ManageSales from './Admin/ManageSales';
// // User components
// import ScrollToTop from './components/common/scrollTop';
// import Login from './pages/common/Login';
// import Home from './pages/common/Home';
// // Maker components
// import Clients from './pages/maker/Clients';
// import MakerDashboard from './pages/maker/MakerDashboard';
// import Profile from './pages/maker/Profile';
// import Orders from './pages/maker/Orders';
// import Production from './pages/maker/Production';
// // Checker components
// import CheckerDashboard from './pages/checker/CheckerDashboard';
// import ManageClients from './pages/checker/ManageClients';
// import ManageProduction from './pages/checker/ManageProduction';
// import ManageOrders from './pages/checker/ManageOrders';
// import CheckerProfile from './pages/checker/CheckerProfile';
// import ManageDelivery from './pages/checker/ManageDelivery';
// import ManageInvoices from './pages/checker/ManageInvoices';
// import StockMovement from './pages/checker/StockMovement';

// const App = () => {
//   const location = useLocation();
//   const token = localStorage.getItem('token');
//   const user = JSON.parse(localStorage.getItem('user'));
//   const isLoggedIn = !!token;
//   const isMaker = user?.isMaker;
//   const isChecker = user?.isChecker
//   const isAdmin = user?.isAdmin;

//   // Paths where Navbar/Footer should be hidden
//   const hideNavPaths = ['/', '/admin'];

//   const shouldHideNav = hideNavPaths.includes(location.pathname);

//   return (
//     <div>
//       <ScrollToTop />
//       <Toaster
//         position="top-right"
//         reverseOrder={false}
//         toastOptions={{
//           success: {
//             style: {
//               background: '#D1FAE5',
//               color: '#065F46',
//             },
//           },
//           error: {
//             style: {
//               background: '#FEE2E2',
//               color: '#991B1B',
//             },
//           },
//         }}
//       />

//       {/* Conditionally show Navbar */}
//       {!shouldHideNav && isLoggedIn && !isAdmin && <Navbar setIsLoggedIn={() => {}} />}

//       <Routes>
//         <Route path="/home" element={<Home />} />
//         <Route path="/" element={<Login onLogin={() => {}} />} />
            
//         {isLoggedIn && isMaker && !isAdmin && !isChecker && (
//           <>
//             <Route path="/dashboard" element={<MakerDashboard />} />
//             <Route path="/clients" element={<Clients />} />
//             <Route path="/production" element={<Production />} />
//             <Route path="/orders" element={<Orders />} />
//             <Route path="/profile" element={<Profile />} />
//           </>
//         )}

//          {isLoggedIn && !isMaker && !isAdmin && isChecker && (
//           <>
//             <Route path="/checkerdashboard" element={<CheckerDashboard />} />
//             <Route path="/checkerclients" element={<ManageClients />} />
//             <Route path="/checkerproduction" element={<ManageProduction />} />
//             <Route path="/checkerorders" element={<ManageOrders />} />
//             <Route path="/checkerdelivery" element={<ManageDelivery />} />
//             <Route path="/checkerinvoice" element={<ManageInvoices />} />
//             <Route path="/stockmovement" element={<StockMovement />} />
//             <Route path="/checkerprofile" element={<CheckerProfile />} />
//           </>
//         )}

//         {/* Owner Routes */}
//         <Route path="/admin" element={<Login />} />
//         <Route
//           path="/admin/dashboard/*"
//           element={
//             <ProtectedRoute>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Navigate to="users" replace />} />
//           <Route path="users" element={<UsersDetails />} />
//           <Route path="sales" element={<ManageSales />} />
//           <Route path="/stockmovement" element={<StockMovement />} />
//         </Route>

//         <Route path="*" element={<NotFound />} />
//       </Routes>

//       <Footer />
//     </div>
//   );
// };

// export default App;

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// Added .jsx extension to imports to help resolver find modules
import ScrollToTop from "./components/common/scrollTop.jsx"; 
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";

// Public pages
import Home from "./pages/common/Home.jsx";
import Login from "./pages/common/Login.jsx";
import NotFound from "./pages/common/NotFound.jsx";

// Maker pages
import MakerDashboard from "./pages/maker/MakerDashboard.jsx";
import Clients from "./pages/maker/Clients.jsx";
import Orders from "./pages/maker/Orders.jsx";
import Production from "./pages/maker/Production.jsx";
import Profile from "./pages/maker/Profile.jsx";
import Inventory from "./pages/maker/Inventory.jsx";
import StockIn from "./pages/maker/StockIn.jsx";

// Checker pages
import CheckerDashboard from "./pages/checker/CheckerDashboard.jsx";
import ManageClients from "./pages/checker/ManageClients.jsx";
import ManageOrders from "./pages/checker/ManageOrders.jsx";
import ManageProduction from "./pages/checker/ManageProduction.jsx";
import ManageInvoices from "./pages/checker/ManageInvoices.jsx";
import ManageDelivery from "./pages/checker/ManageDelivery.jsx";
import CheckerStockApproval from "./pages/checker/CheckerStockApproval.jsx";

// Admin pages
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import UsersDetails from "./Admin/UserDetails.jsx";
import ManageSales from "./Admin/ManageSales.jsx";
import DriverDashboard from "./pages/driver/DriverDashboard.jsx";
import DriverOrders from "./pages/driver/DriverOrders.jsx";

const App = () => {
  const location = useLocation();

  // --- AUTHENTICATION FIX: Derive loggedIn status from the token ---
  const token = localStorage.getItem("token");
  // loggedIn is true if the token exists, otherwise false
  const loggedIn = !!token; 
  
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const role = user?.role ? user.role.toUpperCase() : null;

  // Hide navbar only for login
  const hideNavPaths = ["/login"];
  const shouldHideNav = hideNavPaths.includes(location.pathname);
// Hide footer only for login
const hideFooterPaths = ["/login"];
const shouldHideFooter = hideFooterPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all">
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { background: "#D1FAE5", color: "#065F46" } },
          error: { style: { background: "#FEE2E2", color: "#991B1B" } },
        }}
      />

      {/* Navbar visible for public + logged pages */}
      {!shouldHideNav && <Navbar role={role} loggedIn={loggedIn} />}
     <main>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* 🚀 Maker Routes */}
        {role === "MAKER" && loggedIn && (
          <>
            <Route path="/dashboard" element={<MakerDashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/production" element={<Production />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/stock" element={<StockIn />} />
          </>
        )}

        {/* Driver routes */}
        {role === "DRIVER" && loggedIn && (
          <>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/orders" element={<DriverOrders />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/driver/profile" element={<DriverProfile />} /> */}
          </>
        )}

        {/* 🚀 Checker Routes */}
        {role === "CHECKER" && loggedIn && (
          <>
            <Route path="/checker/dashboard" element={<CheckerDashboard />} />
            <Route path="/checker/clients" element={<ManageClients />} />
            <Route path="/checker/orders" element={<ManageOrders />} />
            <Route path="/checker/production" element={<ManageProduction />} />
            <Route path="/checker/invoices" element={<ManageInvoices />} />
            <Route path="/checker/delivery" element={<ManageDelivery />} />
            <Route path="/checker/stock" element={<CheckerStockApproval />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/checker/profile" element={<CheckerProfile />} /> */}
            {/* <Route path="/checker/stock" element={<StockMovement />} /> */}
            <Route path="/inventory" element={<Inventory />} />
          </>
        )}

        {/* 🚀 Admin Routes */}
        {role === "OWNER" && loggedIn && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersDetails />} />
            <Route path="/admin/sales" element={<ManageSales />} />
          </>
        )}

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
     </main>
      {!shouldHideFooter && <Footer />}

    </div>
  );
};

export default App;