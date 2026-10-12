import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Trash2, MapPin, Users, Calendar, Clock, Package, CheckCircle } from "lucide-react";
import { useBookingStore } from "../store/useBookingStore";
import { axiosInstance } from "../lib/axios";
import { getImageUrl, getEquipmentFallbackSvg } from "../lib/config.js";
import AmbientBackground from "./AmbientBackground";
import { useAuthStore } from "../store/useAuthStore";

const Cart = ({ cart = [], setCart = () => {} }) => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const userEmail = String(authUser?.email || "").trim().toLowerCase();
  const isKct = userEmail.endsWith("@kct.ac.in") || userEmail.endsWith(".kct.ac.in");

  const { bookings, fetchMyBookings, isFetchingBookings, submitCart, isSubmittingCart } = useBookingStore();

  const [cancellingId, setCancellingId] = useState(null);

  // Fetch user's bookings from backend when Cart mounts
  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const str = String(time);
    if (str.length >= 5) return str.slice(0, 5);
    return str;
  };

  const canCancel = (status) => {
    return status === "draft" || status === "pending" || status === "approved";
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Remove this scheduled equipment from your cart?")) return;
    try {
      setCancellingId(bookingId);
      await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      await fetchMyBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(err.response?.data?.message || "Failed to remove from cart");
    } finally {
      setCancellingId(null);
    }
  };

  const displayBookings = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === "draft");
  const draftCount = displayBookings.length;
  const cartCount = draftCount;

  const handleBookNow = async () => {
    if (draftCount === 0) {
      alert("No items in cart to book. Add equipment from the catalog first.");
      return;
    }
    const res = await submitCart();
    if (res && res.success) {
      navigate("/reserved");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0809] text-stone-100 font-sans selection:bg-amber-400 selection:text-stone-950 relative overflow-x-hidden">
      <AmbientBackground height="h-[500px]" />
      <Navbar cartCount={cartCount} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif uppercase tracking-widest text-stone-100 mb-1 font-normal">
            Your Equipment Cart
          </h1>
          <p className="text-xs font-dancing text-amber-200/90">
            Selected Prototyping Hardware Ready For Reservation Request
          </p>
        </div>

        {isFetchingBookings ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-20 serene-glass-card rounded-3xl border border-amber-500/20 shadow-2xl max-w-xl mx-auto">
            <div className="text-5xl mb-4 opacity-70">🛒</div>
            <h2 className="font-serif text-3xl text-stone-100 uppercase tracking-wide font-normal mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-stone-400 font-sans text-xs font-light leading-relaxed">
              Schedule equipment from the catalog page to see your booked items here.
            </p>
          </div>
        ) : (
          <>
            <div className="serene-glass-card rounded-3xl border border-amber-500/20 shadow-2xl overflow-hidden">
              {displayBookings.map((booking) => {
                const eq = booking.equipment || {};
                const imageUrl = getImageUrl(eq.image);

                return (
                  <div
                    key={booking.id}
                    className="flex items-start gap-5 p-6 border-b border-amber-500/15 last:border-none"
                  >
                    <img
                      src={imageUrl || getEquipmentFallbackSvg(eq.equipmentName)}
                      alt={eq.equipmentName}
                      className="w-24 h-24 object-cover rounded-2xl border border-amber-500/30 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getEquipmentFallbackSvg(eq.equipmentName);
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-2xl text-stone-100 uppercase tracking-wide">
                        {eq.equipmentName}
                      </h3>
                      {eq.brandName && (
                        <p className="text-xs font-dancing text-amber-200/90 mt-0.5">{eq.brandName}</p>
                      )}
                      {eq.equipmentDetails && (
                        <p className="text-xs font-sans text-stone-400 font-light mt-1.5 line-clamp-2">
                          {eq.equipmentDetails}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-xs font-sans text-stone-300">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>IDEA LAB</span>
                        </div>
                        {eq.quantity != null && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Total Units: {eq.quantity}</span>
                          </div>
                        )}
                        <span className="font-sans text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded text-xs font-medium">
                          Scheduled for Reservation
                        </span>
                      </div>

                      {/* Scheduled slot */}
                      <div className="mt-4 p-4 bg-stone-900/80 rounded-2xl border border-amber-500/15">
                        <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300 mb-1.5">
                          Scheduled Time Slot
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-stone-200">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            {formatDate(booking.bookingDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {formatTime(booking.bookingTime)} • {booking.duration}h
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-xs text-stone-400 mt-2 italic font-light">
                            Note: {booking.notes}
                          </p>
                        )}
                      </div>

                      {/* Consumables Requisition Summary */}
                      {(() => {
                        let consumablesList = [];
                        if (Array.isArray(booking.consumablesRequested)) {
                          consumablesList = booking.consumablesRequested;
                        } else if (typeof booking.consumablesRequested === "string") {
                          try {
                            consumablesList = JSON.parse(booking.consumablesRequested);
                          } catch (e) {
                            consumablesList = [];
                          }
                        }
                        if (!consumablesList || consumablesList.length === 0) return null;

                        return (
                          <div className="mt-3 p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/25">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                                <Package className="w-3 h-3 text-amber-400" />
                                Requisitioned Consumables ({consumablesList.length})
                              </p>
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                                Lab Materials
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {consumablesList.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] bg-stone-900/90 border border-amber-500/30 text-stone-200 px-2 py-0.5 rounded-lg"
                                >
                                  <span className="text-stone-300">{c.name}:</span>
                                  <span className="font-mono text-amber-300 font-bold">
                                    {c.quantity} {c.unit}
                                  </span>
                                </span>
                              ))}
                            </div>
                            {booking.consumablesPurpose && (
                              <div className="text-[11px] text-stone-300 border-t border-amber-500/20 pt-1.5">
                                <span className="font-bold text-amber-300 text-[10px] uppercase tracking-wider block mb-0.5">
                                  Accountability Purpose:
                                </span>
                                <p className="italic text-stone-300 font-light">
                                  "{booking.consumablesPurpose}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {canCancel(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-rose-400 hover:text-rose-300 disabled:opacity-50 p-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                        title="Remove from cart"
                      >
                        {cancellingId === booking.id ? (
                          <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between items-center p-6 bg-stone-900/90 border-t border-amber-500/20">
                <span className="font-sans text-xs uppercase tracking-widest text-stone-400 font-semibold">
                  Total items: <span className="text-stone-100 font-mono">{displayBookings.length}</span>
                </span>

                <button
                  onClick={handleBookNow}
                  disabled={draftCount === 0 || isSubmittingCart}
                  className={`px-8 py-3 rounded-full font-sans text-xs uppercase font-bold tracking-[0.2em] transition-all shadow-lg ${
                    draftCount > 0 && !isSubmittingCart
                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 hover:brightness-110 hover:shadow-amber-500/20 cursor-pointer"
                      : "bg-stone-800 text-stone-600 border border-stone-700 cursor-not-allowed"
                  }`}
                >
                  {isSubmittingCart ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin align-middle mr-2" />
                      Booking Now...
                    </>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
