import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Listing from "./components/ComponentCom/Listing";
import Cart from "./components/Cart";
import MyBookings from "./components/bookingCom/Mybookings";
import Hero from "./pages/Hero";
import NewEquipment from "./components/AdminCom/Equipment/NewEquipment";
import Equipment from "./components/AdminCom/Equipment/Equipment";
import Approval from "./components/AdminCom/ApprovalCom/Approval";
import { Login } from "./components/AuthCom/Login";
import { Signup } from "./components/AuthCom/SignUp";
import { useAuthStore } from "./store/useAuthStore";
import { useBookingStore } from "./store/useBookingStore";
import { Loader } from "lucide-react";

import AdminPage from "./pages/AdminPage";
import AdminLayout from "./components/AdminCom/AdminLayout";

function Home() {
  return (
    <>
      <Header />
      <Hero />
    </>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const fetchMyBookings = useBookingStore((state) => state.fetchMyBookings);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser && authUser.role !== "admin") {
      fetchMyBookings();
    }
  }, [authUser, fetchMyBookings]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route
          path="/signup"
          element={!authUser ? <Signup /> : <Navigate to="/products" />}
        />

        <Route
          path="/login"
          element={
            !authUser ? (
              <Login />
            ) : authUser.role === "admin" ? (
              <Navigate to="/admin/equipment" />
            ) : (
              <Navigate to="/products" />
            )
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/products"
          element={
            authUser ? (
              <Listing cart={cart} setCart={setCart} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/cart"
          element={<Cart cart={cart} setCart={setCart} />}
        />

        <Route
          path="/reserved"
          element={
            authUser ? (
              <MyBookings />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Protected Routes with Layout */}
        {/* Admin Protected Routes with Layout */}
    <Route
      path="/admin"
      element={
        authUser && authUser.role === "admin" ? (
          <AdminLayout />
        ) : (
          <Navigate to="/login" />
        )
      }
    >
      {/* Default admin page */}
      <Route index element={<AdminPage />} />

      {/* Equipment list page */}
      <Route path="equipment" element={<Equipment />} />

      {/* New equipment page */}
      <Route path="new-equipment" element={<NewEquipment />} />
      <Route path="approval" element={<Approval />} />
    </Route>

      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}

export default App;
