import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PageSkeleton from "./components/PageSkeleton";

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
import AdminSystemHealth from "./components/AdminCom/AdminSystemHealth";
import ProblemSubmissionInfo from "./components/ProblemCom/ProblemSubmissionInfo";
import ProjectForm from "./components/ProblemCom/ProjectForm";
import MySubmissions from "./components/ProblemCom/MySubmissions";
import AmbientBackground from "./components/AmbientBackground";
import ErrorBoundary from "./components/ErrorBoundary";
import { axiosInstance } from "./lib/axios.js";

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

const HackathonAdminSystemHealth = React.lazy(() => import("./pages/hackathon/HackathonAdminSystemHealth.jsx"));
const HackathonSelect = React.lazy(() => import("./pages/hackathon/HackathonSelect"));
const HackathonLanding = React.lazy(() => import("./pages/hackathon/HackathonLanding"));
const HackathonRegister = React.lazy(() => import("./pages/hackathon/HackathonRegister"));
const HackathonLogin = React.lazy(() => import("./pages/hackathon/HackathonLogin"));
const HackathonDashboard = React.lazy(() => import("./pages/hackathon/HackathonDashboard"));
const HackathonCreateTeam = React.lazy(() => import("./pages/hackathon/HackathonCreateTeam"));
const HackathonJoinTeam = React.lazy(() => import("./pages/hackathon/HackathonJoinTeam"));
const HackathonSubmit = React.lazy(() => import("./pages/hackathon/HackathonSubmit"));
const HackathonProblems = React.lazy(() => import("./pages/hackathon/HackathonProblems"));
const HackathonStatus = React.lazy(() => import("./pages/hackathon/HackathonStatus"));
const HackathonPaymentDetails = React.lazy(() => import("./pages/hackathon/HackathonPaymentDetails"));
const HackathonForgotPassword = React.lazy(() => import("./pages/hackathon/HackathonForgotPassword"));
const HackathonAdminHome = React.lazy(() => import("./pages/hackathon/HackathonAdminHome"));
const HackathonAdminProblems = React.lazy(() => import("./pages/hackathon/HackathonAdminProblems"));
const HackathonAdminSubmissions = React.lazy(() => import("./pages/hackathon/HackathonAdminSubmissions"));
const HackathonAdminTeams = React.lazy(() => import("./pages/hackathon/HackathonAdminTeams"));
const HackathonAdminUsers = React.lazy(() => import("./pages/hackathon/HackathonAdminUsers"));
const HackathonAdminMentors = React.lazy(() => import("./pages/hackathon/HackathonAdminMentors"));
const HackathonAdminSendMail = React.lazy(() => import("./pages/hackathon/HackathonAdminSendMail"));
const HackathonAdminWinners = React.lazy(() => import("./pages/hackathon/HackathonAdminWinners"));
const HackathonAdminPaymentDetails = React.lazy(() => import("./pages/hackathon/HackathonAdminPaymentDetails"));
const HackathonAdminThemes = React.lazy(() => import("./pages/hackathon/HackathonAdminThemes"));
const HackathonAdminClusterApprovals = React.lazy(() => import("./pages/hackathon/HackathonAdminClusterApprovals"));
const ClusterDashboard = React.lazy(() => import("./pages/hackathon/ClusterDashboard"));
const HackathonTeam = React.lazy(() => import("./pages/hackathon/HackathonTeam"));
const VolunteerDashboard = React.lazy(() => import("./pages/hackathon/VolunteerDashboard"));
const HackathonAdminVolunteers = React.lazy(() => import("./pages/hackathon/HackathonAdminVolunteers.jsx"));
const HackathonAdminAttendance = React.lazy(() => import("./pages/hackathon/HackathonAdminAttendance.jsx"));
const HackathonShowcase = React.lazy(() => import("./pages/hackathon/HackathonShowcase.jsx"));
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
    axiosInstance.get("/csrf-token").catch(() => {});
  }, [checkAuth]);

  useEffect(() => {
    if (authUser && authUser.role !== "admin") {
      fetchMyBookings();
    }
  }, [authUser, fetchMyBookings]);



  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
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
        <Route path="/Hackathon/admin/themes" element={<HackathonLayout><HackathonAdminThemes /></HackathonLayout>} />
        <Route path="/hackathon/admin/themes" element={<HackathonLayout><HackathonAdminThemes /></HackathonLayout>} />
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
        <Route path="/Hackathon/admin/volunteers" element={<HackathonLayout><HackathonAdminVolunteers /></HackathonLayout>} />
        <Route path="/hackathon/admin/volunteers" element={<HackathonLayout><HackathonAdminVolunteers /></HackathonLayout>} />
        <Route path="/Hackathon/admin/attendance" element={<HackathonLayout><HackathonAdminAttendance /></HackathonLayout>} />
        <Route path="/hackathon/admin/attendance" element={<HackathonLayout><HackathonAdminAttendance /></HackathonLayout>} />
        <Route path="/Hackathon/admin/system-health" element={<HackathonLayout><HackathonAdminSystemHealth /></HackathonLayout>} />
        <Route path="/hackathon/admin/system-health" element={<HackathonLayout><HackathonAdminSystemHealth /></HackathonLayout>} />
        <Route path="/Hackathon/admin/cluster-approvals" element={<HackathonLayout><HackathonAdminClusterApprovals /></HackathonLayout>} />
        <Route path="/hackathon/admin/cluster-approvals" element={<HackathonLayout><HackathonAdminClusterApprovals /></HackathonLayout>} />
        <Route path="/Hackathon/cluster/dashboard" element={<ErrorBoundary><HackathonLayout><ClusterDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/cluster/dashboard" element={<ErrorBoundary><HackathonLayout><ClusterDashboard /></HackathonLayout></ErrorBoundary>} />

        {/* Standalone Hackathon Dashboard Routes */}
        <Route path="/Hackathon/dashboard" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/dashboard" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/dashboard/:tab" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/dashboard/:tab" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/dashboard/:tab/:hackathonSlug" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/dashboard/:tab/:hackathonSlug" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/create-team" element={<ErrorBoundary><HackathonLayout><HackathonCreateTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/create-team" element={<ErrorBoundary><HackathonLayout><HackathonCreateTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/join-team" element={<ErrorBoundary><HackathonLayout><HackathonJoinTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/join-team" element={<ErrorBoundary><HackathonLayout><HackathonJoinTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/submit" element={<ErrorBoundary><HackathonLayout><HackathonSubmit /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/submit" element={<ErrorBoundary><HackathonLayout><HackathonSubmit /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/problems" element={<ErrorBoundary><HackathonLayout><HackathonProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/problems" element={<ErrorBoundary><HackathonLayout><HackathonProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/status" element={<ErrorBoundary><HackathonLayout><HackathonStatus /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/status" element={<ErrorBoundary><HackathonLayout><HackathonStatus /></HackathonLayout></ErrorBoundary>} />

        {/* Event Slug Specific Admin & Dashboard Routes */}
        <Route path="/Hackathon/:hackathonSlug/admin" element={<ErrorBoundary><HackathonLayout><HackathonAdminHome /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin" element={<ErrorBoundary><HackathonLayout><HackathonAdminHome /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/problems" element={<ErrorBoundary><HackathonLayout><HackathonAdminProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/problems" element={<ErrorBoundary><HackathonLayout><HackathonAdminProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/themes" element={<ErrorBoundary><HackathonLayout><HackathonAdminThemes /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/themes" element={<ErrorBoundary><HackathonLayout><HackathonAdminThemes /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/submissions" element={<ErrorBoundary><HackathonLayout><HackathonAdminSubmissions /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/submissions" element={<ErrorBoundary><HackathonLayout><HackathonAdminSubmissions /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/teams" element={<ErrorBoundary><HackathonLayout><HackathonAdminTeams /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/teams" element={<ErrorBoundary><HackathonLayout><HackathonAdminTeams /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/users" element={<ErrorBoundary><HackathonLayout><HackathonAdminUsers /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/users" element={<ErrorBoundary><HackathonLayout><HackathonAdminUsers /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/mentors" element={<ErrorBoundary><HackathonLayout><HackathonAdminMentors /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/mentors" element={<ErrorBoundary><HackathonLayout><HackathonAdminMentors /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/send-mail" element={<ErrorBoundary><HackathonLayout><HackathonAdminSendMail /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/send-mail" element={<ErrorBoundary><HackathonLayout><HackathonAdminSendMail /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonAdminPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/winners" element={<ErrorBoundary><HackathonLayout><HackathonAdminWinners /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/winners" element={<ErrorBoundary><HackathonLayout><HackathonAdminWinners /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/cluster-approvals" element={<ErrorBoundary><HackathonLayout><HackathonAdminClusterApprovals /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/cluster-approvals" element={<ErrorBoundary><HackathonLayout><HackathonAdminClusterApprovals /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/volunteers" element={<ErrorBoundary><HackathonLayout><HackathonAdminVolunteers /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/volunteers" element={<ErrorBoundary><HackathonLayout><HackathonAdminVolunteers /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/attendance" element={<ErrorBoundary><HackathonLayout><HackathonAdminAttendance /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/attendance" element={<ErrorBoundary><HackathonLayout><HackathonAdminAttendance /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/admin/system-health" element={<ErrorBoundary><HackathonLayout><HackathonAdminSystemHealth /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/admin/system-health" element={<ErrorBoundary><HackathonLayout><HackathonAdminSystemHealth /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/cluster/dashboard" element={<ErrorBoundary><HackathonLayout><ClusterDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/cluster/dashboard" element={<ErrorBoundary><HackathonLayout><ClusterDashboard /></HackathonLayout></ErrorBoundary>} />

        <Route path="/Hackathon/:hackathonSlug/dashboard" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/dashboard" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/dashboard/:tab" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/dashboard/:tab" element={<ErrorBoundary><HackathonLayout><HackathonDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/create-team" element={<ErrorBoundary><HackathonLayout><HackathonCreateTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/create-team" element={<ErrorBoundary><HackathonLayout><HackathonCreateTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/join-team" element={<ErrorBoundary><HackathonLayout><HackathonJoinTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/join-team" element={<ErrorBoundary><HackathonLayout><HackathonJoinTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/submit" element={<ErrorBoundary><HackathonLayout><HackathonSubmit /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/submit" element={<ErrorBoundary><HackathonLayout><HackathonSubmit /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/problems" element={<ErrorBoundary><HackathonLayout><HackathonProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/problems" element={<ErrorBoundary><HackathonLayout><HackathonProblems /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/status" element={<ErrorBoundary><HackathonLayout><HackathonStatus /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/status" element={<ErrorBoundary><HackathonLayout><HackathonStatus /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/payment-details" element={<ErrorBoundary><HackathonLayout><HackathonPaymentDetails /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/register" element={<HackathonRegister />} />
        <Route path="/hackathon/:hackathonSlug/register" element={<HackathonRegister />} />
        <Route path="/Hackathon/:hackathonSlug/login" element={<HackathonLogin />} />
        <Route path="/hackathon/:hackathonSlug/login" element={<HackathonLogin />} />
        <Route path="/Hackathon/:hackathonSlug/forgot-password" element={<HackathonForgotPassword />} />
        <Route path="/hackathon/:hackathonSlug/forgot-password" element={<HackathonForgotPassword />} />

        {/* Dedicated Team Pass & QR Route */}
        <Route path="/Hackathon/team" element={<ErrorBoundary><HackathonLayout><HackathonTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/team" element={<ErrorBoundary><HackathonLayout><HackathonTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/team" element={<ErrorBoundary><HackathonLayout><HackathonTeam /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/team" element={<ErrorBoundary><HackathonLayout><HackathonTeam /></HackathonLayout></ErrorBoundary>} />

        {/* Dedicated Volunteer On-Campus Check-In Portal */}
        <Route path="/Hackathon/volunteer" element={<ErrorBoundary><HackathonLayout><VolunteerDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/volunteer" element={<ErrorBoundary><HackathonLayout><VolunteerDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/volunteer" element={<ErrorBoundary><HackathonLayout><VolunteerDashboard /></HackathonLayout></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/volunteer" element={<ErrorBoundary><HackathonLayout><VolunteerDashboard /></HackathonLayout></ErrorBoundary>} />

        {/* Public Project Showcase / Hall of Fame (Phase 14.29) */}
        <Route path="/hackathons/:hackathonSlug/showcase" element={<ErrorBoundary><HackathonShowcase /></ErrorBoundary>} />
        <Route path="/Hackathon/:hackathonSlug/showcase" element={<ErrorBoundary><HackathonShowcase /></ErrorBoundary>} />
        <Route path="/hackathon/:hackathonSlug/showcase" element={<ErrorBoundary><HackathonShowcase /></ErrorBoundary>} />
        <Route path="/Hackathon/showcase" element={<ErrorBoundary><HackathonShowcase /></ErrorBoundary>} />
        <Route path="/hackathon/showcase" element={<ErrorBoundary><HackathonShowcase /></ErrorBoundary>} />

        {/* Dynamic Event Catch-all Route: /Hackathon/:hackathonSlug MUST come after static /Hackathon/admin */}
        <Route path="/Hackathon/:hackathonSlug" element={<HackathonLanding />} />
        <Route path="/hackathon/:hackathonSlug" element={<HackathonLanding />} />

        {/* Named Route Aliases (Phase 14.27) */}
        <Route path="/admin-dashboard" element={<Navigate to="/Hackathon/admin" replace />} />
        <Route path="/student-dashboard" element={<Navigate to="/Hackathon/dashboard" replace />} />
        <Route path="/reviewer-dashboard" element={<Navigate to="/Hackathon/dashboard" replace />} />
        <Route path="/volunteer-dashboard" element={<Navigate to="/Hackathon/volunteer" replace />} />

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
          path="/mybookings"
          element={
            authUser ? (
              <MyBookings />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-bookings"
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
          <Route path="system-health" element={<AdminSystemHealth />} />
        </Route>

      </Routes>
      </Suspense>

      <Toaster />
    </BrowserRouter>
  );
}

export default App;

