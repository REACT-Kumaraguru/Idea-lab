import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  FileCheck,
  PackageSearch,
  FileText,
  QrCode,
  ClipboardClock,
  PlusCircle,
  UserPlus,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import AmbientBackground from "../AmbientBackground";

const RECENT_PENDING_LIMIT = 8;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [problemStatementsCount, setProblemStatementsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [bookingsRes, equipmentRes, problemsRes] = await Promise.allSettled([
          axiosInstance.get("/bookings"),
          axiosInstance.get("/equipment"),
          axiosInstance.get("/problems/admin/all"),
        ]);

        if (bookingsRes.status === "fulfilled" && bookingsRes.value?.data?.success) {
          const data = bookingsRes.value.data.data;
          setBookings(Array.isArray(data) ? data : []);
        } else if (bookingsRes.status === "rejected") {
          console.warn("Bookings fetch failed:", bookingsRes.reason);
          setBookings([]);
        }

        if (equipmentRes.status === "fulfilled") {
          const data = equipmentRes.value?.data;
          setEquipmentCount(Array.isArray(data) ? data.length : 0);
        }

        if (problemsRes.status === "fulfilled" && problemsRes.value?.data?.success) {
          const data = problemsRes.value.data.data;
          setProblemStatementsCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const verifiedCount = bookings.filter((b) => b.verifiedAt).length;

  const statsCards = [
    {
      label: "PENDING REQUESTS",
      count: pendingCount,
      icon: <Clock size={20} />,
      borderColor: "border-yellow-500",
      textColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      href: "/admin/approval",
    },
    {
      label: "APPROVED",
      count: approvedCount,
      icon: <FileCheck size={20} />,
      borderColor: "border-green-500",
      textColor: "text-green-600",
      iconBg: "bg-green-50",
      href: "/admin/approval",
    },
    {
      label: "TOTAL EQUIPMENT",
      count: equipmentCount,
      icon: <PackageSearch size={20} />,
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      iconBg: "bg-blue-50",
      href: "/admin/equipment",
    },
    {
      label: "PROBLEM STATEMENTS",
      count: problemStatementsCount,
      icon: <FileText size={20} />,
      borderColor: "border-teal-500",
      textColor: "text-teal-600",
      iconBg: "bg-teal-50",
      href: "/admin/problem-statements",
    },
    {
      label: "VERIFIED (QR)",
      count: verifiedCount,
      icon: <FileCheck size={20} />,
      borderColor: "border-emerald-500",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      href: "/admin/qr-scanner",
    },
  ];

  const pendingBookings = bookings
    .filter((b) => b.status === "pending")
    .slice(0, RECENT_PENDING_LIMIT);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/\//g, "-");
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const str = String(time);
    return str.length >= 5 ? str.slice(0, 5) : str;
  };

  const quickActions = [
    { label: "Open QR Scanner", path: "/admin/qr-scanner", icon: QrCode },
    { label: "Review approvals", path: "/admin/approval", icon: ClipboardClock },
    { label: "Add equipment", path: "/admin/new-equipment", icon: PlusCircle },
    { label: "Problem statements", path: "/admin/problem-statements", icon: FileText },
    { label: "Admin access", path: "/admin/users", icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
        <p className="text-stone-400 font-sans text-xs uppercase tracking-widest font-bold">Loading Administration Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans relative">
      <AmbientBackground height="fixed inset-0" />
      <div className="relative z-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 uppercase tracking-widest font-normal">
          Admin Operations Dashboard
        </h1>
        <p className="text-xs font-dancing text-amber-200/90 mt-1">
          Sanctuary Prototyping Facilities & Approval Management
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <button
            key={index}
            type="button"
            onClick={() => stat.href && navigate(stat.href)}
            className={`serene-glass-card p-6 rounded-3xl border border-amber-500/20 flex justify-between items-center text-left hover:border-amber-500/40 hover:shadow-xl transition-all w-full ${stat.href ? "cursor-pointer" : "cursor-default"}`}
          >
            <div>
              <p className="text-amber-400/80 text-[10px] font-sans font-bold tracking-widest uppercase mb-2">{stat.label}</p>
              <p className="text-3xl font-mono font-bold text-stone-100">{stat.count}</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300">{stat.icon}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending approval */}
        <div className="lg:col-span-2 serene-glass-card rounded-3xl border border-amber-500/20 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-amber-500/20">
            <div>
              <h2 className="font-serif text-xl text-stone-100 uppercase tracking-wide">Pending Reservation Approvals</h2>
              <p className="text-[11px] font-sans text-stone-400 font-light">Hardware usage requests awaiting admin review</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/approval")}
              className="inline-flex items-center gap-1 text-xs font-sans uppercase font-bold tracking-wider text-amber-300 hover:text-amber-200 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-amber-500/15">
            {pendingBookings.length === 0 ? (
              <div className="px-6 py-10 text-center text-stone-500 text-xs font-sans">
                No pending equipment bookings require approval at this time.
              </div>
            ) : (
              pendingBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate("/admin/approval")}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-amber-400/5 transition-colors"
                >
                  <div>
                    <p className="font-serif text-base text-stone-100 uppercase tracking-wide">{b.user?.fullName || "N/A"}</p>
                    <p className="text-xs font-dancing text-amber-200/90">{b.equipment?.equipmentName || "N/A"}</p>
                  </div>
                  <div className="text-right text-xs font-sans text-stone-400">
                    <p className="font-mono text-stone-200">{formatDate(b.bookingDate)}</p>
                    <p className="text-[11px]">{formatTime(b.bookingTime)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="serene-glass-card rounded-3xl border border-amber-500/20 shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-amber-500/20">
            <h2 className="font-serif text-xl text-stone-100 uppercase tracking-wide">Quick Operations</h2>
            <p className="text-[11px] font-sans text-stone-400 font-light">Shortcuts for administrative actions</p>
          </div>
          <div className="p-5 space-y-3 font-sans text-xs">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-stone-900/80 border border-amber-500/20 text-stone-200 hover:text-amber-300 hover:border-amber-400/50 hover:bg-stone-900 transition-all font-semibold uppercase tracking-wider cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{action.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto shrink-0 text-stone-500" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
