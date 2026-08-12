import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertCircle, Search, Filter, FileText, QrCode, X, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../Navbar";
import { useBookingStore } from "../../store/useBookingStore";
import { axiosInstance } from "../../lib/axios";
import { getImageUrl } from "../../lib/config.js";
import InvoiceModal from "../AdminCom/ApprovalCom/PDFformat";
import AmbientBackground from "../AmbientBackground";

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
  const [cancellingBatchKey, setCancellingBatchKey] = useState(null);
  const [selectedGroupForInvoice, setSelectedGroupForInvoice] = useState(null);
  const [selectedGroupForQR, setSelectedGroupForQR] = useState(null);
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

  // Group by cart submission: one card per reservation (same as admin "one request")
  const groupedReservations = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach((b) => {
      const key = b.submissionBatchId || `single-${b.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    });
    return Array.from(map.entries()).map(([key, bookings]) => ({
      batchKey: key,
      batchId: key.startsWith("single-") ? null : key,
      bookings,
    }));
  }, [filteredBookings]);

  const totalReservationCount = useMemo(() => {
    const map = new Map();
    reservedBookings.forEach((b) => {
      const key = b.submissionBatchId || `single-${b.id}`;
      map.set(key, true);
    });
    return map.size;
  }, [reservedBookings]);

  const hasActiveFilters = filterStatus !== "all" || searchQuery.trim() !== "" || dateFilter !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setSearchQuery("");
    setDateFilter("all");
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

  // Cancel whole reservation (all bookings in the group)
  const handleCancelReservation = async (group) => {
    const count = group.bookings.length;
    if (!window.confirm(`Cancel this entire reservation (${count} item${count > 1 ? "s" : ""})?`)) {
      return;
    }

    const key = group.batchKey;
    try {
      setCancellingBatchKey(key);
      setError("");
      for (const b of group.bookings) {
        await axiosInstance.put(`/bookings/${b.id}/cancel`);
      }
      await fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel reservation");
      console.error("Error cancelling reservation:", err);
    } finally {
      setCancellingBatchKey(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-stone-800 text-stone-300 border border-stone-700";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "rejected":
        return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "cancelled":
        return "bg-stone-800 text-stone-400 border border-stone-700";
      default:
        return "bg-stone-800 text-stone-300 border border-stone-700";
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
      <div className="min-h-screen bg-[#0a0809] flex items-center justify-center font-sans text-stone-100">
        <Navbar cartCount={cartCount} />
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Loading Your Reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="fixed inset-0" />
      <Navbar cartCount={cartCount} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif uppercase tracking-widest text-stone-100 mb-1 font-normal">
            My Reservations & Bookings
          </h1>
          <p className="text-xs font-dancing text-amber-200/90">
            Sanctuary Prototyping Hardware Status & History
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-200 font-sans text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {reservedBookings.length > 0 && (
          <div className="mb-8 serene-glass-card border border-amber-500/20 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-stretch sm:items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reservation by equipment name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900/80 border border-amber-500/30 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 font-sans text-xs">
                <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3.5 py-2.5 bg-stone-900 border border-amber-500/30 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-stone-900 text-stone-100">
                      {opt.label} Status
                    </option>
                  ))}
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-stone-900 border border-amber-500/30 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {DATE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-stone-900 text-stone-100">
                      {opt.label} Dates
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-3 py-2 text-xs font-sans uppercase font-bold tracking-widest text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <p className="mt-3 text-xs font-sans text-stone-400">
                Showing {groupedReservations.length} of {totalReservationCount} reservations
              </p>
            )}
          </div>
        )}

        {reservedBookings.length === 0 ? (
          <div className="text-center py-16 serene-glass-card rounded-3xl border border-amber-500/25 p-8 shadow-2xl">
            <Calendar className="w-16 h-16 text-amber-400/80 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-widest font-normal mb-2">
              No Reservations Yet
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto font-sans leading-relaxed">
              After you proceed to request equipment from your cart, your bookings will appear here with real-time approval status.
            </p>
          </div>
        ) : groupedReservations.length === 0 ? (
          <div className="text-center py-16 serene-glass-card rounded-3xl border border-amber-500/25 p-8 shadow-2xl">
            <Filter className="w-16 h-16 text-amber-400/80 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-widest font-normal mb-2">
              No Matching Reservations
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto mb-6 font-sans">
              Try adjusting your filter options or clear filters to view all reservations.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedReservations.map((group) => {
              const first = group.bookings[0];
              const status = first.status;
              const isBatch = group.bookings.length > 1;
              const totalAmount = group.bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
              const isCancelling = cancellingBatchKey === group.batchKey;

              return (
                <div
                  key={group.batchKey}
                  className="serene-glass-card rounded-3xl border border-amber-500/25 overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all p-6 md:p-8 space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                      <div className="flex gap-4 flex-wrap">
                        {group.bookings.map((b) => (
                          <div key={b.id} className="flex gap-3 items-start">
                            <img
                              src={getImageUrl(b.equipment?.image) || "https://via.placeholder.com/150"}
                              alt={b.equipment?.equipmentName}
                              className="w-20 h-20 object-cover rounded-xl border border-amber-500/30 bg-stone-900 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/150";
                              }}
                            />
                            <div>
                              <h3 className="font-serif text-base text-stone-100 uppercase tracking-wide">
                                {b.equipment?.equipmentName}
                              </h3>
                              <p className="text-xs text-amber-300/80 font-mono">
                                {b.equipment?.brandName || "Standard"}
                              </p>
                              <p className="text-xs text-stone-400 mt-1 font-mono">
                                {formatDate(b.bookingDate)} · {String(b.bookingTime).slice(0, 5)} · {b.duration} hr(s)
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 flex-wrap font-sans">
                          <span
                            className={`inline-block text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${getStatusColor(
                              status
                            )}`}
                          >
                            {status.toUpperCase()}
                          </span>
                          {group.bookings.some((b) => b.verifiedAt) && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Verified
                            </span>
                          )}
                          {isBatch && (
                            <span className="text-xs text-stone-400 font-mono">
                              {group.bookings.length} items
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 font-sans text-xs">
                        {status === "approved" && (
                          <>
                            <button
                              onClick={() => setSelectedGroupForInvoice(group.bookings)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 rounded-xl font-bold uppercase tracking-wider text-[11px] transition cursor-pointer"
                            >
                              <FileText size={15} />
                              View Invoice
                            </button>
                            <button
                              onClick={() => setSelectedGroupForQR(group)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 rounded-xl font-bold uppercase tracking-wider text-[11px] transition cursor-pointer"
                            >
                              <QrCode size={15} />
                              QR Code
                            </button>
                          </>
                        )}
                        {(status === "pending" || status === "approved") && (
                          <button
                            onClick={() => handleCancelReservation(group)}
                            disabled={isCancelling}
                            className="px-4 py-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isCancelling ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                Cancelling...
                              </div>
                            ) : (
                              "Cancel Reservation"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-amber-500/20 font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400/70 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Date(s)</p>
                          <p className="font-semibold text-stone-200 font-mono">
                            {isBatch
                              ? group.bookings.map((b) => formatDate(b.bookingDate)).join(", ")
                              : formatDate(first.bookingDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400/70 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Time</p>
                          <p className="font-semibold text-stone-200 font-mono">
                            {isBatch
                              ? group.bookings.map((b) => String(b.bookingTime).slice(0, 5)).join(", ")
                              : String(first.bookingTime).slice(0, 5)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400/70 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Duration</p>
                          <p className="font-semibold text-stone-200 font-mono">
                            {isBatch
                              ? group.bookings.map((b) => `${b.duration} hr`).join(", ")
                              : `${first.duration} hour(s)`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total</p>
                          <p className="font-semibold text-amber-300 font-mono">
                            ₹{totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {group.bookings.some((b) => b.notes) && (
                      <div className="mt-4 p-3.5 bg-stone-900/80 border border-amber-500/20 rounded-xl font-sans">
                        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Notes:</p>
                        {group.bookings.filter((b) => b.notes).map((b) => (
                          <p key={b.id} className="text-xs text-stone-200">{b.notes}</p>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 text-[10px] uppercase font-mono tracking-wider text-stone-500">
                      Booked on: {formatDate(first.created_at || first.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedGroupForInvoice && selectedGroupForInvoice.length > 0 && (
          <InvoiceModal
            bookings={selectedGroupForInvoice}
            onClose={() => setSelectedGroupForInvoice(null)}
          />
        )}

        {/* QR Code Modal */}
        {selectedGroupForQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="serene-glass-card rounded-3xl border border-amber-500/30 max-w-md w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-stone-100 uppercase tracking-widest font-normal">Booking QR Code</h3>
                  <p className="text-xs font-dancing text-amber-200/90">Sanctuary Hardware Check-in</p>
                </div>
                <button
                  onClick={() => setSelectedGroupForQR(null)}
                  className="w-8 h-8 rounded-full border border-amber-500/30 bg-stone-900 text-stone-400 hover:text-amber-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                {selectedGroupForQR.bookings.map((booking) => {
                  const qrData = JSON.stringify({
                    bookingId: booking.id,
                    equipmentName: booking.equipment?.equipmentName,
                    bookingDate: booking.bookingDate,
                    bookingTime: booking.bookingTime,
                    userId: booking.userId,
                  });
                  return (
                    <div key={booking.id} className="flex flex-col items-center gap-3 p-4 bg-stone-900/90 border border-amber-500/30 rounded-2xl w-full text-center">
                      <div className="p-3 bg-white rounded-xl shadow-lg border border-amber-400/40">
                        <QRCodeSVG value={qrData} size={180} level="H" />
                      </div>
                      <p className="font-serif text-sm text-stone-100 uppercase tracking-wide mt-1">
                        {booking.equipment?.equipmentName}
                      </p>
                      <p className="text-xs font-mono text-amber-300/80">
                        {formatDate(booking.bookingDate)} · {String(booking.bookingTime).slice(0, 5)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedGroupForQR(null)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition shadow-lg border border-amber-300 cursor-pointer"
              >
                Close QR View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;