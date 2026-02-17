import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertCircle, Search, Filter } from "lucide-react";
import Navbar from "../Navbar";
import { useBookingStore } from "../../store/useBookingStore";
import { axiosInstance } from "../../lib/axios";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const MyBookings = () => {
  const { bookings, fetchMyBookings, isFetchingBookings } = useBookingStore();
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const reservedBookings = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status !== "draft");
  const cartCount = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === "draft").length;

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const filteredBookings = useMemo(() => {
    let result = reservedBookings;

    if (filterStatus !== "all") {
      result = result.filter((b) => b.status === filterStatus);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (b) =>
          (b.equipment?.equipmentName || "").toLowerCase().includes(q) ||
          (b.equipment?.brandName || "").toLowerCase().includes(q)
      );
    }

    if (dateFilter === "upcoming") {
      result = result.filter((b) => (b.bookingDate || "") >= today);
    } else if (dateFilter === "past") {
      result = result.filter((b) => (b.bookingDate || "") < today);
    }

    return result;
  }, [reservedBookings, filterStatus, searchQuery, dateFilter, today]);

  const hasActiveFilters = filterStatus !== "all" || searchQuery.trim() !== "" || dateFilter !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setSearchQuery("");
    setDateFilter("all");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      await fetchMyBookings();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
      console.error("Error cancelling booking:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isFetchingBookings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={cartCount} />
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Reserve</h1>
          <p className="text-gray-600 mt-2">
            View your submitted bookings and their approval status
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {reservedBookings.length > 0 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-stretch sm:items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by equipment name"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DATE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <p className="mt-3 text-sm text-gray-600">
                Showing {filteredBookings.length} of {reservedBookings.length} reservations
              </p>
            )}
          </div>
        )}

        {reservedBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No reservations yet
            </h3>
            <p className="text-gray-600">
              After you proceed to request from the cart, your bookings will appear here with their approval status.
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No reservations match your filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or clear them to see all reservations.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <img
                        src={getImageUrl(booking.equipment?.image) || "https://via.placeholder.com/150"}
                        alt={booking.equipment?.equipmentName}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {booking.equipment?.equipmentName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.equipment?.brandName}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(booking.status === "pending" ||
                      booking.status === "approved") && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === booking.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            Cancelling...
                          </div>
                        ) : (
                          "Cancel Booking"
                        )}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {booking.bookingTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {booking.duration} hour(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-semibold text-gray-800">
                          ₹{parseFloat(booking.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Booked on: {formatDate(booking.created_at || booking.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;