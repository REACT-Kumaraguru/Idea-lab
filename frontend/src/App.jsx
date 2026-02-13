
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Listing from "./components/ComponentCom/Listing";
import Cart from "./components/Cart";
import Hero from "./pages/Hero";
import { Login } from "./components/AuthCom/Login";
import { Signup } from "./components/AuthCom/SignUp";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";

import AdminPage from "./pages/AdminPage";

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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
        {/* Home page with Header */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/products" />} />
        <Route
          path="/login"
          element={!authUser ? <Login /> : (authUser.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/products" />)}
        />

        {/* User Protected Routes */}
        <Route
          path="/products"
          element={authUser ? <Listing cart={cart} setCart={setCart} /> : <Navigate to="/login" />}
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={authUser && authUser.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />}
        />

        {/* Cart page */}
        <Route
          path="/cart"
          element={<Cart cart={cart} setCart={setCart} />}
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
