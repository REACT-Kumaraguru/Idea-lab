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
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          Overview of bookings, equipment, and quick actions.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <button
            key={index}
            type="button"
            onClick={() => stat.href && navigate(stat.href)}
            className={`bg-white p-6 rounded-xl shadow-sm border-b-[6px] ${stat.borderColor} border border-gray-100 flex justify-between items-center text-left hover:shadow-md transition-shadow w-full ${stat.href ? "cursor-pointer" : "cursor-default"}`}
          >
            <div>
              <p className="text-gray-400 text-[10px] font-bold tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.count}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.textColor}`}>{stat.icon}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending approval */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Pending approval</h2>
            <button
              type="button"
              onClick={() => navigate("/admin/approval")}
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                No pending bookings.
              </div>
            ) : (
              pendingBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate("/admin/approval")}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{b.user?.fullName || "N/A"}</p>
                    <p className="text-sm text-gray-500">{b.equipment?.equipmentName || "N/A"}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{formatDate(b.bookingDate)}</p>
                    <p>{formatTime(b.bookingTime)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium text-sm"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{action.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
