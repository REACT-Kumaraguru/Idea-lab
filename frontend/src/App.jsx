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
import { ForgotPassword } from "./components/AuthCom/ForgotPassword";
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

// Hackathon module (isolated)
import HackathonProtectedPage from "./components/hackathon/HackathonProtectedPage";
import HackathonLanding from "./pages/hackathon/HackathonLanding";
import HackathonLogin from "./pages/hackathon/HackathonLogin";
import HackathonForgotPassword from "./pages/hackathon/HackathonForgotPassword";
import HackathonRegister from "./pages/hackathon/HackathonRegister";
import HackathonProblems from "./pages/hackathon/HackathonProblems";
import HackathonGuidelines from "./pages/hackathon/HackathonGuidelines";
import HackathonDashboard from "./pages/hackathon/HackathonDashboard";
import HackathonTeam from "./pages/hackathon/HackathonTeam";
import HackathonCreateTeam from "./pages/hackathon/HackathonCreateTeam";
import HackathonJoinTeam from "./pages/hackathon/HackathonJoinTeam";
import HackathonSubmit from "./pages/hackathon/HackathonSubmit";
import HackathonStatus from "./pages/hackathon/HackathonStatus";
import HackathonAdminHome from "./pages/hackathon/HackathonAdminHome";
import HackathonAdminTeams from "./pages/hackathon/HackathonAdminTeams";
import HackathonAdminProblems from "./pages/hackathon/HackathonAdminProblems";
import HackathonAdminSubmissions from "./pages/hackathon/HackathonAdminSubmissions";
import HackathonAdminSendMail from "./pages/hackathon/HackathonAdminSendMail";
import HackathonAdminMentors from "./pages/hackathon/HackathonAdminMentors";
import HackathonAdminUsers from "./pages/hackathon/HackathonAdminUsers";
import HackathonPaymentDetails from "./pages/hackathon/HackathonPaymentDetails";
import HackathonAdminPaymentDetails from "./pages/hackathon/HackathonAdminPaymentDetails";

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

        <Route path="/forgot-password" element={<ForgotPassword />} />

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

        {/* Hackathon module routes (ICH 2026) */}
        <Route path="/ich2026" element={<HackathonLanding />} />
        <Route path="/ich2026/login" element={<HackathonLogin />} />
        <Route path="/ich2026/forgot-password" element={<HackathonForgotPassword />} />
        <Route path="/ich2026/register" element={<HackathonRegister />} />
        <Route path="/ich2026/problems" element={<HackathonProblems />} />
        <Route path="/ich2026/guidelines" element={<HackathonGuidelines />} />

        <Route
          path="/ich2026/dashboard"
          element={
            <HackathonProtectedPage allowedRoles={["student", "mentor"]}>
              <HackathonDashboard />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/team"
          element={
            <HackathonProtectedPage allowedRoles={["student", "mentor"]}>
              <HackathonTeam />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/create-team"
          element={
            <HackathonProtectedPage allowedRoles={["student"]}>
              <HackathonCreateTeam />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/join-team"
          element={
            <HackathonProtectedPage allowedRoles={["student"]}>
              <HackathonJoinTeam />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/submit"
          element={
            <HackathonProtectedPage allowedRoles={["student"]}>
              <HackathonSubmit />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/payment-details"
          element={
            <HackathonProtectedPage allowedRoles={["student"]}>
              <HackathonPaymentDetails />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/status"
          element={
            <HackathonProtectedPage allowedRoles={["student", "mentor"]}>
              <HackathonStatus />
            </HackathonProtectedPage>
          }
        />

        <Route
          path="/ich2026/admin"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminHome />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/teams"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminTeams />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/problems"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminProblems />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/submissions"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminSubmissions />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/mentors"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminMentors />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/payment-details"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminPaymentDetails />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/send-mail"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminSendMail />
            </HackathonProtectedPage>
          }
        />
        <Route
          path="/ich2026/admin/users"
          element={
            <HackathonProtectedPage allowedRoles={["admin"]}>
              <HackathonAdminUsers />
            </HackathonProtectedPage>
          }
        />
      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}

export default App;
