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
import AmbientBackground from "./components/AmbientBackground";

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

  const userEmail = authUser?.email || authUser?.user?.email || authUser?.fullName || "Authenticated User";
  const isAdmin = authUser?.role === "admin" || authUser?.user?.role === "admin";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans relative flex items-center justify-center p-6 selection:bg-amber-400 selection:text-stone-950 overflow-hidden">
      <AmbientBackground height="h-full inset-0" />
      <div className="relative z-10 serene-glass-card rounded-3xl border border-amber-500/30 p-8 md:p-10 shadow-2xl max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-100 uppercase tracking-widest font-normal mb-1">Already Signed In</h1>
          <p className="text-xs font-dancing text-amber-200/90 mt-1">
            You are authenticated as <span className="font-bold text-amber-300 font-sans">{userEmail}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3.5">
          <button
            onClick={() => navigate(isAdmin ? "/admin/equipment" : "/products")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-sans text-xs uppercase font-bold tracking-widest hover:brightness-110 transition shadow-lg cursor-pointer"
          >
            Continue to {isAdmin ? "Admin Console" : "Equipment Sanctuary"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-stone-900/80 border border-amber-500/30 text-stone-300 font-sans text-xs uppercase font-bold tracking-widest hover:bg-stone-800 hover:text-rose-300 transition cursor-pointer"
          >
            Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}

import HackathonSelect from "./pages/hackathon/HackathonSelect";
import HackathonLanding from "./pages/hackathon/HackathonLanding";
import HackathonRegister from "./pages/hackathon/HackathonRegister";
import HackathonLogin from "./pages/hackathon/HackathonLogin";
import HackathonDashboard from "./pages/hackathon/HackathonDashboard";
import HackathonCreateTeam from "./pages/hackathon/HackathonCreateTeam";
import HackathonJoinTeam from "./pages/hackathon/HackathonJoinTeam";
import HackathonSubmit from "./pages/hackathon/HackathonSubmit";
import HackathonProblems from "./pages/hackathon/HackathonProblems";
import HackathonStatus from "./pages/hackathon/HackathonStatus";
import HackathonPaymentDetails from "./pages/hackathon/HackathonPaymentDetails";
import HackathonForgotPassword from "./pages/hackathon/HackathonForgotPassword";
import HackathonAdminHome from "./pages/hackathon/HackathonAdminHome";
import HackathonAdminProblems from "./pages/hackathon/HackathonAdminProblems";
import HackathonAdminSubmissions from "./pages/hackathon/HackathonAdminSubmissions";
import HackathonAdminTeams from "./pages/hackathon/HackathonAdminTeams";
import HackathonAdminUsers from "./pages/hackathon/HackathonAdminUsers";
import HackathonAdminMentors from "./pages/hackathon/HackathonAdminMentors";
import HackathonAdminSendMail from "./pages/hackathon/HackathonAdminSendMail";
import HackathonAdminWinners from "./pages/hackathon/HackathonAdminWinners";
import HackathonAdminPaymentDetails from "./pages/hackathon/HackathonAdminPaymentDetails";
import HackathonLayout from "./components/hackathon/HackathonLayout";

import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
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



  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Hackathon Choice Page (hub between / and /ich2026) */}
        <Route path="/hackathon" element={<HackathonSelect />} />
        <Route path="/Hackathon" element={<HackathonSelect />} />
        <Route path="/Hackaton" element={<HackathonSelect />} />

        {/* Standalone Clean Hackathon Auth Routes */}
        <Route path="/Hackathon/login" element={<HackathonLogin />} />
        <Route path="/hackathon/login" element={<HackathonLogin />} />
        <Route path="/Hackathon/register" element={<HackathonRegister />} />
        <Route path="/hackathon/register" element={<HackathonRegister />} />
        <Route path="/Hackathon/forgot-password" element={<HackathonForgotPassword />} />
        <Route path="/hackathon/forgot-password" element={<HackathonForgotPassword />} />

        {/* Standalone Hackathon Admin Routes */}
        <Route path="/Hackathon/admin" element={<HackathonLayout><HackathonAdminHome /></HackathonLayout>} />
        <Route path="/hackathon/admin" element={<HackathonLayout><HackathonAdminHome /></HackathonLayout>} />
        <Route path="/Hackathon/admin/problems" element={<HackathonLayout><HackathonAdminProblems /></HackathonLayout>} />
        <Route path="/hackathon/admin/problems" element={<HackathonLayout><HackathonAdminProblems /></HackathonLayout>} />
        <Route path="/Hackathon/admin/submissions" element={<HackathonLayout><HackathonAdminSubmissions /></HackathonLayout>} />
        <Route path="/hackathon/admin/submissions" element={<HackathonLayout><HackathonAdminSubmissions /></HackathonLayout>} />
        <Route path="/Hackathon/admin/teams" element={<HackathonLayout><HackathonAdminTeams /></HackathonLayout>} />
        <Route path="/hackathon/admin/teams" element={<HackathonLayout><HackathonAdminTeams /></HackathonLayout>} />
        <Route path="/Hackathon/admin/users" element={<HackathonLayout><HackathonAdminUsers /></HackathonLayout>} />
        <Route path="/hackathon/admin/users" element={<HackathonLayout><HackathonAdminUsers /></HackathonLayout>} />
        <Route path="/Hackathon/admin/mentors" element={<HackathonLayout><HackathonAdminMentors /></HackathonLayout>} />
        <Route path="/hackathon/admin/mentors" element={<HackathonLayout><HackathonAdminMentors /></HackathonLayout>} />
        <Route path="/Hackathon/admin/send-mail" element={<HackathonLayout><HackathonAdminSendMail /></HackathonLayout>} />
        <Route path="/hackathon/admin/send-mail" element={<HackathonLayout><HackathonAdminSendMail /></HackathonLayout>} />
        <Route path="/Hackathon/admin/payment-details" element={<HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout>} />
        <Route path="/hackathon/admin/payment-details" element={<HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout>} />
        <Route path="/Hackathon/admin/winners" element={<HackathonLayout><HackathonAdminWinners /></HackathonLayout>} />
        <Route path="/hackathon/admin/winners" element={<HackathonLayout><HackathonAdminWinners /></HackathonLayout>} />

        {/* Standalone Hackathon Dashboard Routes */}
        <Route path="/Hackathon/dashboard" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/hackathon/dashboard" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/Hackathon/dashboard/:tab" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/hackathon/dashboard/:tab" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/Hackathon/dashboard/:tab/:hackathonSlug" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/hackathon/dashboard/:tab/:hackathonSlug" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/Hackathon/create-team" element={<HackathonLayout><HackathonCreateTeam /></HackathonLayout>} />
        <Route path="/hackathon/create-team" element={<HackathonLayout><HackathonCreateTeam /></HackathonLayout>} />
        <Route path="/Hackathon/join-team" element={<HackathonLayout><HackathonJoinTeam /></HackathonLayout>} />
        <Route path="/hackathon/join-team" element={<HackathonLayout><HackathonJoinTeam /></HackathonLayout>} />
        <Route path="/Hackathon/payment-details" element={<HackathonLayout><HackathonPaymentDetails /></HackathonLayout>} />
        <Route path="/hackathon/payment-details" element={<HackathonLayout><HackathonPaymentDetails /></HackathonLayout>} />
        <Route path="/Hackathon/submit" element={<HackathonLayout><HackathonSubmit /></HackathonLayout>} />
        <Route path="/hackathon/submit" element={<HackathonLayout><HackathonSubmit /></HackathonLayout>} />
        <Route path="/Hackathon/problems" element={<HackathonLayout><HackathonProblems /></HackathonLayout>} />
        <Route path="/hackathon/problems" element={<HackathonLayout><HackathonProblems /></HackathonLayout>} />
        <Route path="/Hackathon/status" element={<HackathonLayout><HackathonStatus /></HackathonLayout>} />
        <Route path="/hackathon/status" element={<HackathonLayout><HackathonStatus /></HackathonLayout>} />

        {/* Event Slug Specific Admin & Dashboard Routes */}
        <Route path="/Hackathon/:hackathonSlug/admin" element={<HackathonLayout><HackathonAdminHome /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin" element={<HackathonLayout><HackathonAdminHome /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/problems" element={<HackathonLayout><HackathonAdminProblems /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/problems" element={<HackathonLayout><HackathonAdminProblems /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/submissions" element={<HackathonLayout><HackathonAdminSubmissions /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/submissions" element={<HackathonLayout><HackathonAdminSubmissions /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/teams" element={<HackathonLayout><HackathonAdminTeams /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/teams" element={<HackathonLayout><HackathonAdminTeams /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/users" element={<HackathonLayout><HackathonAdminUsers /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/users" element={<HackathonLayout><HackathonAdminUsers /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/mentors" element={<HackathonLayout><HackathonAdminMentors /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/mentors" element={<HackathonLayout><HackathonAdminMentors /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/send-mail" element={<HackathonLayout><HackathonAdminSendMail /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/send-mail" element={<HackathonLayout><HackathonAdminSendMail /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/payment-details" element={<HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/payment-details" element={<HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/admin/winners" element={<HackathonLayout><HackathonAdminWinners /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/admin/winners" element={<HackathonLayout><HackathonAdminWinners /></HackathonLayout>} />

        <Route path="/Hackathon/:hackathonSlug/dashboard" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/dashboard" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/dashboard/:tab" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/dashboard/:tab" element={<HackathonLayout><HackathonDashboard /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/create-team" element={<HackathonLayout><HackathonCreateTeam /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/create-team" element={<HackathonLayout><HackathonCreateTeam /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/join-team" element={<HackathonLayout><HackathonJoinTeam /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/join-team" element={<HackathonLayout><HackathonJoinTeam /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/submit" element={<HackathonLayout><HackathonSubmit /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/submit" element={<HackathonLayout><HackathonSubmit /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/problems" element={<HackathonLayout><HackathonProblems /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/problems" element={<HackathonLayout><HackathonProblems /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/status" element={<HackathonLayout><HackathonStatus /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/status" element={<HackathonLayout><HackathonStatus /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/payment-details" element={<HackathonLayout><HackathonPaymentDetails /></HackathonLayout>} />
        <Route path="/hackathon/:hackathonSlug/payment-details" element={<HackathonLayout><HackathonPaymentDetails /></HackathonLayout>} />
        <Route path="/Hackathon/:hackathonSlug/register" element={<HackathonRegister />} />
        <Route path="/hackathon/:hackathonSlug/register" element={<HackathonRegister />} />
        <Route path="/Hackathon/:hackathonSlug/login" element={<HackathonLogin />} />
        <Route path="/hackathon/:hackathonSlug/login" element={<HackathonLogin />} />
        <Route path="/Hackathon/:hackathonSlug/forgot-password" element={<HackathonForgotPassword />} />
        <Route path="/hackathon/:hackathonSlug/forgot-password" element={<HackathonForgotPassword />} />

        {/* Dynamic Event Catch-all Route: /Hackathon/:hackathonSlug MUST come after static /Hackathon/admin */}
        <Route path="/Hackathon/:hackathonSlug" element={<HackathonLanding />} />
        <Route path="/hackathon/:hackathonSlug" element={<HackathonLanding />} />

        {/* Legacy Hackathon 2026 Redirects (guarantees URL stays clean) */}
        <Route path="/ich2026" element={<Navigate to="/Hackathon" replace />} />
        <Route path="/ich2026/register" element={<Navigate to="/Hackathon/register" replace />} />
        <Route path="/ich2026/login" element={<Navigate to="/Hackathon/login" replace />} />
        <Route path="/ich2026/forgot-password" element={<Navigate to="/Hackathon/forgot-password" replace />} />

        <Route path="/ich2026/dashboard" element={<Navigate to="/Hackathon/dashboard" replace />} />
        <Route path="/ich2026/create-team" element={<Navigate to="/Hackathon/create-team" replace />} />
        <Route path="/ich2026/join-team" element={<Navigate to="/Hackathon/join-team" replace />} />
        <Route path="/ich2026/submit" element={<Navigate to="/Hackathon/dashboard/submit" replace />} />
        <Route path="/ich2026/problems" element={<Navigate to="/Hackathon/dashboard/problems" replace />} />
        <Route path="/ich2026/status" element={<Navigate to="/Hackathon/dashboard/status" replace />} />
        <Route path="/ich2026/payment-details" element={<Navigate to="/Hackathon/payment-details" replace />} />

        <Route path="/ich2526/admin" element={<Navigate to="/Hackathon/admin" replace />} />
        <Route path="/ich2026/admin" element={<Navigate to="/Hackathon/admin" replace />} />
        <Route path="/ich2026/admin/problems" element={<Navigate to="/Hackathon/admin/problems" replace />} />
        <Route path="/ich2026/admin/submissions" element={<Navigate to="/Hackathon/admin/submissions" replace />} />
        <Route path="/ich2026/admin/teams" element={<Navigate to="/Hackathon/admin/teams" replace />} />
        <Route path="/ich2026/admin/users" element={<Navigate to="/Hackathon/admin/users" replace />} />
        <Route path="/ich2026/admin/mentors" element={<Navigate to="/Hackathon/admin/mentors" replace />} />
        <Route path="/ich2026/admin/send-mail" element={<Navigate to="/Hackathon/admin/send-mail" replace />} />
        <Route path="/ich2026/admin/payment-details" element={<Navigate to="/Hackathon/admin/payment-details" replace />} />
        <Route path="/ich2026/admin/winners" element={<Navigate to="/Hackathon/admin/winners" replace />} />

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
          element={<Listing cart={cart} setCart={setCart} />}
        />
        <Route
          path="/equipment"
          element={<Listing cart={cart} setCart={setCart} />}
        />

        <Route
          path="/cart"
          element={
            authUser ? (
              <Cart cart={cart} setCart={setCart} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/reserved"
          element={
            authUser ? (
              <MyBookings />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/bookings"
          element={
            authUser ? (
              <MyBookings />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/upload-problem"
          element={
            authUser ? (
              <ProblemSubmissionInfo />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/submit-problem"
          element={
            authUser ? (
              <ProblemSubmissionInfo />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/upload-problem/form"
          element={
            authUser ? (
              <ProjectForm />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/my-submissions"
          element={
            authUser ? (
              <MySubmissions />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/submissions"
          element={
            authUser ? (
              <MySubmissions />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Protected Routes with Layout */}
        <Route
          path="/admin"
          element={
            authUser && authUser.role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="equipment" element={<Equipment />} />
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

