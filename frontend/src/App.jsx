import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import ProblemStatements from "./components/AdminCom/ProblemStatements";
import AdminAccess from "./components/AdminCom/AdminAccess";
import QRScanner from "./components/AdminCom/QRScanner";
import ProblemSubmissionInfo from "./components/ProblemCom/ProblemSubmissionInfo";
import ProjectForm from "./components/ProblemCom/ProjectForm";
import MySubmissions from "./components/ProblemCom/MySubmissions";

function Home() {
  return (
    <>
      <Header />
      <Hero />
    </>
  );
}

function LoginOrRedirect({ authUser }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  if (!authUser) return <Login />;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Already logged in</h1>
        <p className="text-gray-600 mb-6">
          You are signed in as <span className="font-medium">{authUser.email}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(authUser.role === "admin" ? "/admin/equipment" : "/products")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue to {authUser.role === "admin" ? "Admin" : "Equipment"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            Logout and sign in with another account
          </button>
        </div>
      </div>
    </div>
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
          element={<LoginOrRedirect authUser={authUser} />}
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
          element={
            authUser ? (
              <Cart cart={cart} setCart={setCart} />
            ) : (
              <Navigate to="/login" />
            )
          }
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

        <Route
          path="/upload-problem"
          element={
            authUser ? (
              <ProblemSubmissionInfo />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/upload-problem/form"
          element={
            authUser ? (
              <ProjectForm />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/my-submissions"
          element={
            authUser ? (
              <MySubmissions />
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
      <Route path="problem-statements" element={<ProblemStatements />} />
      <Route path="qr-scanner" element={<QRScanner />} />
      <Route path="users" element={<AdminAccess />} />
    </Route>

      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}

export default App;
