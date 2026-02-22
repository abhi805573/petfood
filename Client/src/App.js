import React, { useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { PetProvider, PetContext } from "./Context/Context";
import { Toaster } from "react-hot-toast";

import Home from "./Pages/Home";
import Registration from "./Pages/Registration";
import AllProducts from "./Pages/AllProducts";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Login";
import Cart from "./Pages/Cart";
import Orders from "./Pages/Orders";
import DogFood from "./Pages/DogFood";
import CatFood from "./Pages/CatFood";
import Details from "./Pages/Details";
import Wishlist from "./Pages/Wishlist";
import Footer from "./Components/Footer";
import FixedAdmin from "./Admin/FixedAdmin";
import SuccessPayment from "./Pages/SuccessPayment";

function AppRoutes() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  const { loginStatus } = useContext(PetContext);

  // ✅ FIXED HERE
  const role = localStorage.getItem("role");

  const isLoggedIn = loginStatus;

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <Toaster />

      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? role === "admin"
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/" replace />
              : <Login />
          }
        />

        {/* REGISTER */}
        <Route
          path="/registration"
          element={
            isLoggedIn
              ? <Navigate to="/" replace />
              : <Registration />
          }
        />

        {/* USER ROUTES */}
        <Route
          path="/cart"
          element={
            isLoggedIn && role === "user"
              ? <Cart />
              : <Navigate to="/login" replace />
          }
        />

        <Route path="/dog-food" element={<DogFood />} />
        <Route path="/cat-food" element={<CatFood />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/products/:id" element={<Details />} />
        <Route path="/dog-food/:id" element={<Details />} />
        <Route path="/cat-food/:id" element={<Details />} />

        {/* PAYMENT SUCCESS */}
        <Route path="/payment-success" element={<SuccessPayment />} />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            isLoggedIn && role === "user"
              ? <Orders />
              : <Navigate to="/login" replace />
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/dashboard/*"
          element={
            isLoggedIn && role === "admin"
              ? <FixedAdmin />
              : <Navigate to="/" replace />
          }
        />

      </Routes>

      {!isDashboardRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <PetProvider>
      <AppRoutes />
    </PetProvider>
  );
}

export default App;